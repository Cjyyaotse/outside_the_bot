import requests
import json
import os
import time

# Dataset info
DATASET = "yachay/text_coordinates_regions"
CONFIG = "default"
SPLIT = "train"
API_URL = "https://datasets-server.huggingface.co/rows"

# Output dir & file
out_dir = "datasets"
os.makedirs(out_dir, exist_ok=True)
out_file = os.path.join(out_dir, "text_coordinates_regions.jsonl")

# API pagination settings
BATCH_SIZE = 100
offset = 0
total_rows = None

# Custom retry schedule (seconds)
RETRY_DELAYS = [30, 60, 180]

def fetch_with_retry(params):
    for i, delay in enumerate(RETRY_DELAYS, start=1):
        resp = requests.get(API_URL, params=params)
        if resp.status_code == 200:
            return resp.json()
        elif resp.status_code == 429:
            print(f"⚠️ Rate limit hit. Retry {i}/{len(RETRY_DELAYS)} in {delay}s...")
            time.sleep(delay)
        else:
            resp.raise_for_status()
    raise RuntimeError("❌ Failed after max retries.")

with open(out_file, "a", encoding="utf-8") as f:
    while True:
        params = {
            "dataset": DATASET,
            "config": CONFIG,
            "split": SPLIT,
            "offset": offset,
            "length": BATCH_SIZE,
        }

        print(f"⬇️ Fetching rows {offset} → {offset+BATCH_SIZE}")
        data = fetch_with_retry(params)

        # Initialize total_rows
        if total_rows is None:
            total_rows = data.get("num_rows_total")
            print(f"📊 Total rows: {total_rows}")

        rows = data.get("rows", [])
        if not rows:
            break

        # Save each row
        for row in rows:
            f.write(json.dumps(row["row"], ensure_ascii=False) + "\n")

        offset += BATCH_SIZE
        if offset >= total_rows:
            break

print(f"✅ Done! Saved {total_rows} rows to {out_file}")
