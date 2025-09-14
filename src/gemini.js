const axios = require("axios");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

async function* callGemini(prompt) {
  const response = await axios.post(GEMINI_URL, {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2 },
  });

  const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  yield { choices: [{ delta: { content: text } }] };
}

module.exports = { callGemini };
