const express = require("express");
const router = express.Router();
const { retrieveRelevantPassages } = require("../retriver");
const { callGemini } = require("../gemini");
const {
  getSessionHistory,
  setSessionHistory,
  clearSession,
} = require("../redisClient");
router.post("/chat", async (req, res) => {
  const { message, sessionId } = req.body;

  if (!sessionId || !message || message.trim() === "") {
    return res
      .status(400)
      .json({ error: "sessionId and message are required" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*"); 

  res.write(`data: ${JSON.stringify({ type: "stream_start", sessionId })}\n\n`);

  try {
    const contexts = await retrieveRelevantPassages(message, 3);

    const contextText = contexts
      .map((c) => `- ${c.text} (Source: ${c.url})`)
      .join("\n");

    const prompt = `
Answer the user's question based ONLY on the following context:
${contextText}

Question: ${message}
If answer not found, say: "I don't know based on the provided news articles."
    `.trim();

    console.log("📝 Prompt sent to Gemini:\n", prompt);

    let fullResponse = "";
    for await (const chunk of callGemini(prompt)) {
      const content = chunk.choices?.[0]?.delta?.content || "";
      fullResponse += content;
      res.write(
        `data: ${JSON.stringify({ type: "stream_chunk", content })}\n\n`
      );
    }

    res.write(
      `data: ${JSON.stringify({
        type: "stream_end",
        content: fullResponse,
      })}\n\n`
    );

    const history = await getSessionHistory(sessionId);
    history.push({ role: "user", content: message });
    history.push({ role: "assistant", content: fullResponse });
    await setSessionHistory(sessionId, history);

    console.log(`✅ Session ${sessionId} updated with new message`);
  } catch (error) {
    console.error("❌ Chat error:", error.message);
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        message: "Something went wrong",
      })}\n\n`
    );
  }

  res.end();
});

router.get("/session/:sessionId/history", async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }

  try {
    const history = await getSessionHistory(sessionId);
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

router.delete("/session/:sessionId/clear", async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }

  try {
    await clearSession(sessionId);
    res.json({ success: true, message: `Session ${sessionId} cleared` });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear session" });
  }
});
router.get("/session/:sessionId/history", async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }

  try {
    const history = await getSessionHistory(sessionId);
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

router.delete("/session/:sessionId/clear", async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required" });
  }

  try {
    await clearSession(sessionId);
    res.json({ success: true, message: `Session ${sessionId} cleared` });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear session" });
  }
});
module.exports = router;
