const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error) {
  return (
    error?.status === 503 ||
    error?.status === 500 ||
    error?.status === 429
  );
}

async function generateWithFallback(contents) {
  const models = [
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
  ];

  let lastError;

  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,

          config: {
            systemInstruction: `
You are Solar Assistant, a friendly AI expert inside an AI Solar Survey Platform.

Your job:
- Talk naturally like a helpful human assistant.
- Understand the context of previous messages.
- Reply in simple Hinglish unless the user asks for English.
- Keep answers clear, useful and practical.
- Ask a follow-up question when necessary.
- Do not sound robotic.
- Do not behave like a keyword-based FAQ system.

Your main expertise:
- Solar installation
- Solar survey
- Electricity bill analysis
- Solar subsidy
- ROI and payback period
- Rooftop analysis
- Shadow analysis
- Panel capacity
- Installation cost
- Solar company dashboard
- Lead generation

If the user asks a general question, answer naturally when possible.
If the question is completely unrelated, politely mention that your main expertise is solar.
            `,
          },

          contents,
        });

        return {
          text: response.text,
          modelUsed: model,
        };
      } catch (error) {
        lastError = error;

        if (!isRetryableError(error)) {
          throw error;
        }

        if (attempt < 2) {
          await wait(1200);
        }
      }
    }
  }

  throw lastError;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      reply: "Method not allowed.",
    });
  }

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
        reply: "Gemini API key configure nahi hui hai.",
      });
    }

    const recentHistory = history.slice(-10);

    const contents = recentHistory
      .filter((item) => item.text && item.role)
      .map((item) => ({
        role: item.role === "bot" ? "model" : "user",
        parts: [{ text: item.text }],
      }));

    contents.push({
      role: "user",
      parts: [{ text: message.trim() }],
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
    console.error("Gemini Function Error:", error);

    if (error?.status === 503) {
      return res.status(503).json({
        success: false,
        reply:
          "Gemini server par abhi traffic zyada hai. Please 1-2 minute baad dobara try karo.",
      });
    }

    if (error?.status === 429) {
      return res.status(429).json({
        success: false,
        reply:
          "Gemini request limit temporarily exceed ho gayi hai. Please thodi der baad try karo.",
      });
    }

    return res.status(500).json({
      success: false,
      reply:
        "AI assistant abhi available nahi hai. Please thodi der baad try karo.",
    });
  }
};