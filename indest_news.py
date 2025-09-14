import requests
import json
import time

API_TOKEN = ""  
BASE_URL = ""
LANG = "en"
COUNTRY = "us"
ARTICLES_PER_PAGE = 10
TOTAL_ARTICLES_NEEDED = 50
PAGES = TOTAL_ARTICLES_NEEDED // ARTICLES_PER_PAGE  

print("🚀 Starting GNews ingestion...")

all_articles = []

for page in range(PAGES):
    start_index = page * ARTICLES_PER_PAGE
    url = f"{BASE_URL}?token={API_TOKEN}&lang={LANG}&country={COUNTRY}&start={start_index}&max={ARTICLES_PER_PAGE}"
    
    print(f"📡 Fetching page {page + 1}/{PAGES} (start={start_index})...")
    
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()

        articles = data.get("articles", [])
        if not articles:
            print(f"⚠️ No articles returned for page {page + 1}. Stopping early.")
            break

        for a in articles:
            all_articles.append({
                "url": a.get("url"),
                "title": a.get("title"),
                "content": (a.get("description") or "")[:2000]  
            })

        print(f"   ✅ Added {len(articles)} articles from this page")
        
      
        time.sleep(1)

    except Exception as e:
        print(f"❌ Failed to fetch page {page + 1}: {e}")
        break

print(f"\n✅ Successfully fetched {len(all_articles)} articles out of {TOTAL_ARTICLES_NEEDED} requested")

with open("news_articles.json", "w", encoding="utf-8") as f:
    json.dump(all_articles, f, indent=2, ensure_ascii=False)

print("✅ Saved news_articles.json")