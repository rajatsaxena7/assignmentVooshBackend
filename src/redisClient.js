const { createClient } = require("@redis/client");
require("dotenv").config();

const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL) {
  throw new Error("❌ REDIS_URL is not defined in .env");
}

const client = createClient({
  url: REDIS_URL,
});

client.on("error", (err) => console.error("Redis error:", err));

async function connect() {
  try {
    await client.connect();
    console.log("✅ Connected to Redis Cloud");
  } catch (err) {
    console.error("❌ Failed to connect to Redis:", err.message);
    process.exit(1);
  }
}

async function setSessionHistory(sessionId, messages) {
  try {
    await client.set(`session:${sessionId}`, JSON.stringify(messages), {
      EX: 3600,
    });
    console.log(`💾 Session ${sessionId} saved to Redis`);
  } catch (err) {
    console.error("❌ Failed to save session to Redis:", err.message);
  }
}

async function getSessionHistory(sessionId) {
  try {
    const data = await client.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("❌ Failed to get session from Redis:", err.message);
    return [];
  }
}

async function clearSession(sessionId) {
  try {
    await client.del(`session:${sessionId}`);
    console.log(`🗑️ Session ${sessionId} cleared from Redis`);
  } catch (err) {
    console.error("❌ Failed to clear session from Redis:", err.message);
  }
}

module.exports = {
  connect,
  setSessionHistory,
  getSessionHistory,
  clearSession,
};
