const fs = require("fs");
const { QdrantClient } = require("@qdrant/js-client-rest");
require("dotenv").config();

const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});
const COLLECTION_NAME = "news_articles";
const VECTOR_SIZE = 384;

async function main() {
  try {
    await client.deleteCollection(COLLECTION_NAME);
    console.log(`🗑️ Deleted existing collection "${COLLECTION_NAME}"`);
  } catch {
    console.log(`ℹ️ No existing collection to delete`);
  }

  await client.createCollection(COLLECTION_NAME, {
    vectors: { size: VECTOR_SIZE, distance: "Cosine" },
  });
  console.log(
    `✅ Created collection "${COLLECTION_NAME}" with size ${VECTOR_SIZE}`
  );

  const data = JSON.parse(fs.readFileSync("embeddings.json", "utf8"));

  const points = data.map((item) => ({
    id: item.id,
    vector: item.embedding,
    payload: {
      title: item.metadata.title,
      url: item.metadata.url,
      content: item.text,
    },
  }));

  await client.upsert(COLLECTION_NAME, { points });
  console.log(`✅ Inserted ${points.length} articles into Qdrant`);
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
