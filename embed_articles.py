from sentence_transformers import SentenceTransformer
import json

model = SentenceTransformer("all-MiniLM-L6-v2")

with open("news_articles.json", "r", encoding="utf-8") as f:
    articles = json.load(f)

texts = [f"{a['title']} {a['content']}" for a in articles]

print("⏳ Generating embeddings with MiniLM-L6-v2 (384d)...")
embeddings = model.encode(texts, batch_size=16, show_progress_bar=True)

data = []
for i, emb in enumerate(embeddings):
    data.append({
        "id": i,
        "text": texts[i],
        "embedding": emb.tolist(),
        "metadata": {
            "title": articles[i]["title"],
            "url": articles[i]["url"]
        }
    })

with open("embeddings_with_metadata.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("✅ Saved embeddings_with_metadata.json (384d MiniLM)")
