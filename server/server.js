const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

let surveys = [];

/* -------------------- HELPERS -------------------- */

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/*
  Retry only temporary Gemini server issues.

  IMPORTANT:
  Do not retry 429 quota errors.
  Retrying 429 creates unnecessary API requests.
*/
function isTemporaryServerError(error) {
  return error?.status === 503 || error?.status === 500;
}

/*
  First use Flash-Lite for lightweight chatbot queries.
  If Google server is temporarily overloaded,
  try Flash as fallback.
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
- Answer technical and operational questions practically.

Tone and style:
- Reply in simple Hinglish.
- Speak like an internal solar-company operations assistant.
- Be concise, practical and professional.
- Do not talk as if the user is a residential customer unless clearly asked.
- Do not behave like a keyword-based FAQ system.
- Understand previous messages and continue naturally.
- Ask follow-up questions when required.
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
        Do not try another model.
      */
      if (error?.status === 429) {
        throw error;
      }

      /*
        Temporary Google-side issue:
        wait briefly and try fallback model.
      */
      if (isTemporaryServerError(error)) {
        console.log("Temporary Gemini issue. Trying fallback model...");
        await wait(1200);
        continue;
      }

      /*
        Invalid key, permission issue or bad request:
        stop immediately.
      */
      throw error;
    }
  }

  throw lastError;
}

/* -------------------- BASIC ROUTES -------------------- */

app.get("/", (req, res) => {
  res.send("Solar Survey Backend Running 🚀");
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API Working Successfully 🚀",
  });
});

app.get("/api/debug-key", (req, res) => {
  res.json({
    success: true,
    apiKeyLoaded: Boolean(process.env.GEMINI_API_KEY),
    message: process.env.GEMINI_API_KEY
      ? "Gemini API key loaded successfully ✅"
      : "Gemini API key missing ❌",
  });
});

/* -------------------- GEMINI CHATBOT -------------------- */

app.post("/api/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        reply: "Please apna question type karo.",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        reply: "Gemini API key load nahi hui hai.",
      });
    }

    /*
      Send only recent history.
      This keeps context useful without unnecessary token usage.
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

    contents.push({
      role: "user",
      parts: [
        {
          text: message.trim().slice(0, 2000),
        },
      ],
    });

    const result = await generateWithFallback(contents);

    return res.json({
      success: true,
      reply:
        result.text ||
        "Response generate nahi ho paya. Please dobara try karo.",
      modelUsed: result.modelUsed,
    });
  } catch (error) {
    console.error("========== FINAL GEMINI ERROR ==========");
    console.error(error);
    console.error("========================================");

    if (error?.status === 429) {
      return res.status(429).json({
        success: false,
        reply:
          "Gemini free request limit temporarily exceed ho gayi hai. Please thodi der baad dobara try karo.",
      });
    }

    if (error?.status === 503) {
      return res.status(503).json({
        success: false,
        reply:
          "Gemini server par abhi traffic zyada hai. Please 1-2 minute baad dobara try karo.",
      });
    }

    if (error?.status === 403) {
      return res.status(403).json({
        success: false,
        reply:
          "Gemini API key permission issue hai. API key check karo.",
      });
    }

    if (error?.status === 400 || error?.status === 404) {
      return res.status(error.status).json({
        success: false,
        reply:
          "Gemini request configuration issue hai. Model configuration check karo.",
      });
    }

    return res.status(500).json({
      success: false,
      reply:
        "AI assistant abhi available nahi hai. Please thodi der baad try karo.",
    });
  }
});

/* -------------------- SURVEY ROUTES -------------------- */

app.get("/api/surveys", (req, res) => {
  res.json(surveys);
});

app.post("/api/surveys", (req, res) => {
  const survey = {
    id: Date.now(),
    createdAt: new Date().toLocaleString(),
    ...req.body,
  };

  surveys.unshift(survey);

  res.json({
    success: true,
    survey,
  });
});

/* -------------------- SERVER START -------------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);

  console.log(
    `Gemini API Key Loaded: ${
      process.env.GEMINI_API_KEY ? "YES ✅" : "NO ❌"
    }`
  );
});