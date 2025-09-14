// test-model.js
async function test() {
  try {
    // ✅ Use dynamic import() — works in CommonJS!
    const { pipeline } = await import("@xenova/transformers");
    const pipe = await pipeline(
      "feature-extraction",
      "jinaai/jina-embeddings-v4"
    );
    console.log("✅ Model loaded successfully!");
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

test();
