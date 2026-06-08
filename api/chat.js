const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/* -------------------- HELPERS -------------------- */

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/*
  Retry only temporary server-side issues.

  IMPORTANT:
  Do not retry 429 quota errors.
  Retrying 429 increases API calls and can worsen the limit issue.
*/
function isTemporaryServerError(error) {
  return error?.status === 503 || error?.status === 500;
}

/*
  First try Flash-Lite:
  faster and more suitable for lightweight chatbot queries.

  If Gemini server is temporarily overloaded,
  wait briefly and try the fallback model once.
*/
async function generateWithFallback(contents) {
  const models = [
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
  ];

  let lastError;

  for (const model of models) {
    try {
      console.log(`Trying Gemini model: ${model}`);

      const response = await ai.models.generateContent({
        model,

        config: {
          systemInstruction: `
You are SolarOps Assistant, an AI assistant for solar companies, surveyors and internal operations teams using an AI Solar Survey Platform.

The platform is primarily designed for solar companies, not end customers.

Your role:
- Help surveyors complete solar surveys correctly.
- Help company staff understand survey reports.
- Explain subsidy, ROI, payback period and system sizing.
- Validate rooftop details, direction, roof area and panel capacity inputs.
- Help staff interpret electricity bill OCR results.
- Suggest what information should be collected from customers.
- Help qualify customer leads.
- Explain report fields and recommendations.
- Support company workflow, lead handling and survey operations.
- Answer technical and operational questions in a practical way.

Tone and style:
- Reply in simple Hinglish.
- Speak like an internal solar-company operations assistant.
- Be concise, practical and professional.
- Do not talk as if the user is a residential customer unless they clearly ask from a customer's perspective.
- Do not behave like a keyword-based FAQ system.
- Understand previous messages and continue naturally.
- Ask a follow-up question when required.
- Use short paragraphs.
- Avoid unnecessarily long replies.

Prefer phrases such as:
- "Customer ke liye"
- "Survey report ke according"
- "Company dashboard me"
- "Surveyor ko verify karna chahiye"
- "Lead qualify karne ke liye"

Main expertise:
- Solar survey workflow
- Customer lead qualification
- Electricity bill OCR verification
- Solar system recommendation
- Subsidy calculation
- ROI and payback analysis
- Rooftop suitability
- Shadow analysis
- Panel placement inputs
- Solar report generation
- Company dashboard
- CRM and lead management
- Surveyor operations

Important:
- If the user asks a customer-type question, answer from the solar-company perspective.
- If the user asks something unrelated to solar-company operations, politely redirect them.
          `,

          /*
            Keep replies compact to reduce unnecessary token usage.
          */
          maxOutputTokens: 500,
          temperature: 0.7,
        },

        contents,
      });

      return {
        text: response.text,
        modelUsed: model,
      };
    } catch (error) {
      lastError = error;

      console.error(
        `${model} failed | Status: ${error?.status || "unknown"}`
      );

      /*
        Stop immediately on quota limit.
        Do not call another model.
      */
      if (error?.status === 429) {
        throw error;
      }

      /*
        Try fallback model only for temporary server errors.
      */
      if (isTemporaryServerError(error)) {
        console.log("Temporary Gemini issue. Trying fallback model...");
        await wait(1200);
        continue;
      }

      /*
        Invalid key, permission error or other issue:
        stop immediately.
      */
      throw error;
    }
  }

  throw lastError;
}

/* -------------------- VERCEL FUNCTION -------------------- */

module.exports = async function handler(req, res) {
  /*
    Optional CORS headers.
    Useful if the endpoint is called from another frontend domain later.
  */
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  /*
    Browser preflight request support.
  */
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      reply: "Method not allowed.",
    });
  }

  try {
    const { message, history = [] } = req.body || {};

    /* VALIDATE MESSAGE */
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        reply: "Please apna question type karo.",
      });
    }

    /* CHECK GEMINI KEY */
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        reply:
          "Gemini API key configure nahi hui hai. Vercel environment variable check karo.",
      });
    }

    /*
      Send only recent conversation context.
      Large history unnecessary token usage increase karti hai.
    */
    const recentHistory = history.slice(-8);

    const contents = recentHistory
      .filter((item) => item.text && item.role)
      .map((item) => ({
        role: item.role === "bot" ? "model" : "user",
        parts: [
          {
            text: String(item.text).slice(0, 1500),
          },
        ],
      }));

    /*
      Add latest user message.
    */
    contents.push({
      role: "user",
      parts: [
        {
          text: message.trim().slice(0, 2000),
        },
      ],
    });

    const result = await generateWithFallback(contents);

    return res.status(200).json({
      success: true,
      reply:
        result.text ||
        "Response generate nahi ho paya. Please dobara try karo.",
      modelUsed: result.modelUsed,
    });
  } catch (error) {
    console.error("========== GEMINI FUNCTION ERROR ==========");
    console.error(error);
    console.error("===========================================");

    /*
      Quota or rate-limit issue.
      No automatic retry.
    */
    if (error?.status === 429) {
      return res.status(429).json({
        success: false,
        reply:
          "Gemini free request limit temporarily exceed ho gayi hai. Please thodi der baad dobara try karo.",
      });
    }

    /*
      Temporary Gemini server load issue.
    */
    if (error?.status === 503) {
      return res.status(503).json({
        success: false,
        reply:
          "Gemini server par abhi traffic zyada hai. Please 1-2 minute baad dobara try karo.",
      });
    }

    /*
      API-key permission issue.
    */
    if (error?.status === 403) {
      return res.status(403).json({
        success: false,
        reply:
          "Gemini API key permission issue hai. Vercel environment variable aur Google AI Studio key check karo.",
      });
    }

    /*
      Invalid model or request.
    */
    if (error?.status === 400 || error?.status === 404) {
      return res.status(error.status).json({
        success: false,
        reply:
          "Gemini request configuration issue hai. Please API model configuration check karo.",
      });
    }

    return res.status(500).json({
      success: false,
      reply:
        "AI assistant abhi available nahi hai. Please thodi der baad try karo.",
    });
  }
};