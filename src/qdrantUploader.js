const { QdrantClient } = require("@qdrant/js-client-rest");
const fs = require("fs");
require("dotenv").config();

const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const client = new QdrantClient({
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY,
});

async function setupCollection() {
  await client.createCollection("news_articles", {
    vectors: {
      size: 768,
      distance: "Cosine",
    },
  });
}

async function uploadEmbeddings() {
  const data = require("../embeddings_with_metadata.json");

  await client.upsert("news_articles", {
    points: data.map((d) => ({
      id: d.id,
      vector: d.embedding,
      payload: d.metadata,
    })),
  });

  console.log("✅ Successfully uploaded to Qdrant Cloud!");
}

setupCollection().then(() => uploadEmbeddings());
