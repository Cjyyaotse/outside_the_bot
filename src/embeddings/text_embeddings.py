import json
from typing import List, Dict
from qdrant_client import QdrantClient, models
from fastembed import TextEmbedding

# ------------------------------
# 1️⃣ Load JSONL tweets
# ------------------------------
def load_jsonl_tweets(file_path: str) -> (List[str], List[Dict]):
    documents = []
    metadata = []

    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():  # skip empty lines
                item = json.loads(line)
                text = item.get("text")
                coords = item.get("coordinates", [None, None])
                if text and coords[0] is not None and coords[1] is not None:
                    documents.append(text)
                    metadata.append({"longitude": float(coords[0]), "latitude": float(coords[1])})
    return documents, metadata

jsonl_file_path = "datasets/text_coordinates_regions.jsonl"
documents, metadata = load_jsonl_tweets(jsonl_file_path)
print(f"✅ Loaded {len(documents)} tweets.")

# ------------------------------
# 2️⃣ Embed tweets
# ------------------------------
embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
print("The model is ready to use.")

if documents:
    embeddings_generator = embedding_model.embed(documents)
    embeddings_list = list(embeddings_generator)
    print(f"✅ Generated embeddings: {len(embeddings_list)} vectors, each of length {len(embeddings_list[0])}")
else:
    embeddings_list = []
    print("⚠️ No documents to embed.")

# ------------------------------
# 3️⃣ Upload to Qdrant
# ------------------------------
if embeddings_list:
    client = QdrantClient(":memory:")  # in-memory DB
    model_name = "BAAI/bge-small-en-v1.5"

    client.create_collection(
        collection_name="tweets_collection",
        vectors_config=models.VectorParams(
            size=len(embeddings_list[0]),
            distance=models.Distance.COSINE
        ),
    )

    # Prepare metadata with text
    metadata_with_docs = [
        {"document": doc, **meta} for doc, meta in zip(documents, metadata)
    ]

    # Upload embeddings to Qdrant
    client.upload_collection(
        collection_name="tweets_collection",
        vectors=[models.Document(text=doc, model=model_name) for doc in documents],
        payload=metadata_with_docs,
        ids=list(range(len(documents))),
    )

    # ------------------------------
    # 4️⃣ Example search
    # ------------------------------
    query_text = "COVID-19 vaccine location updates"
    search_result = client.query_points(
        collection_name="tweets_collection",
        query=models.Document(text=query_text, model=model_name),
        limit=5
    ).points

    for idx, point in enumerate(search_result, start=1):
        print(f"\nResult {idx}:")
        print(f"Text: {point.payload['document']}")
        print(f"Coordinates: ({point.payload['latitude']}, {point.payload['longitude']})")
