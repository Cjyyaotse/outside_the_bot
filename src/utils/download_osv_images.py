import os
import zipfile
from huggingface_hub import hf_hub_download
from datasets import load_dataset


# Output dir
out_dir = "datasets/osv5m_small"
os.makedirs(out_dir, exist_ok=True)

# Pick 3 shards manually (example)
shards = ["00.zip", "01.zip", "02.zip"]
'''
for shard in shards:
    print(f"⬇️ Downloading {shard}...")
    local_zip = hf_hub_download(
        repo_id="osv5m/osv5m",
        filename=f"images/train/{shard}",
        repo_type="dataset",
        local_dir=out_dir,
    )
    with zipfile.ZipFile(local_zip, "r") as zf:
        zf.extractall(out_dir)

print("✅ Extracted shards")
'''
# Now load only extracted files
ds = load_dataset("imagefolder", data_dir=out_dir, split="train")

# Filter by lat/lon if needed
nyc = ds.filter(lambda x: 40.70 <= x["latitude"] <= 40.80 and -74.02 <= x["longitude"] <= -73.93)

print(nyc)
