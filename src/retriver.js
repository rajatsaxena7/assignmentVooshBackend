const { QdrantClient } = require("@qdrant/js-client-rest");
require("dotenv").config();

const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});
const COLLECTION_NAME = "news_articles";
const VECTOR_SIZE = 768;

let extractor = null;
async function getExtractor() {
  if (!extractor) {
    console.log("⏳ Loading Jina v2 embedding model...");
    const { pipeline } = await import("@xenova/transformers");
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.log("✅ Jina v2 model loaded");
  }
  return extractor;
}

async function getQueryEmbedding(text) {
  const model = await getExtractor();
  const output = await model(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}

async function retrieveRelevantPassages(query, k = 3) {
  console.log(`🔍 Retrieving top-${k} passages for query: "${query}"`);

  const embedding = await getQueryEmbedding(query);

  const result = await client.search(COLLECTION_NAME, {
    vector: embedding,
    limit: k,
    with_payload: true,
  });

  console.log(`📊 Qdrant returned ${result.length} results`);

  return result.map((r) => ({
    text: `${r.payload?.title || ""} ${r.payload?.content || ""}`.trim(),
    score: r.score,
    url: r.payload?.url || "",
  }));
}

module.exports = { retrieveRelevantPassages };
