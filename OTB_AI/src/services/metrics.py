import os
from typing import List, Dict
from fastembed import TextEmbedding
import numpy as np
from dotenv import load_dotenv
from qdrant_client import QdrantClient

def get_total_tweets(client: QdrantClient) -> int:
    """Return the total number of stored tweets in the collection."""
    collection_name="tweets_collection"
    stats = client.get_collection(collection_name)
    return stats.points_count if stats.points_count is not None else 0

def get_unique_locations(client: QdrantClient, limit: int = 10_000):
    """
    Fetch all unique (latitude, longitude) pairs stored in the collection.
    Default limit=10k points (can be increased if needed).
    """
    locations = set()
    offset = None
    collection_name="tweets_collection"
    while True:
        resp = client.scroll(
            collection_name=collection_name,
            limit=limit,
            with_payload=True,
            offset=offset
        )
        points, next_offset = resp[0], resp[1]

        for p in points:
            if p.payload is None:
                continue
            lat = p.payload.get("latitude")
            lon = p.payload.get("longitude")
            if lat is not None and lon is not None:
                locations.add((float(lat), float(lon)))

        if next_offset is None:
            break
        offset = next_offset

    return len(locations)

def search_similar_tweets(
    client: QdrantClient,
    collection_name: str,
    query_text: str,
    top_k: int = 5,
    model_name: str = "BAAI/bge-small-en-v1.5"
) -> List[Dict]:
    """
    Embed query text, search in Qdrant for similar embeddings,
    return tweets with their lat/lon.
    """
    # 1. Create embedding for query
    embedding_model = TextEmbedding(model_name=model_name)
    query_vec = list(embedding_model.embed([query_text]))[0]

    # 2. Search in Qdrant
    resp = client.query_points(
        collection_name=collection_name,
        query=query_vec,
        limit=top_k,
        with_payload=True,
        with_vectors=False
    )

    # 3. Format results
    results = []
    for p in resp.points:
        results.append({
            "tweet": p.payload.get("document"),
            "latitude": p.payload.get("latitude"),
            "longitude": p.payload.get("longitude"),
            "score": getattr(p, "score", None)
        })

    return results

if __name__ == "__main__":
    load_dotenv()
    QDRANT_URL = os.getenv("QDRANT_URL")
    API_KEY = os.getenv("QDRANT_API_KEY")
    if not API_KEY:
        raise RuntimeError("Set QDRANT_API_KEY in your environment (or .env) before running.")

    qdrant_client = QdrantClient(url=QDRANT_URL, api_key=API_KEY)

    total_tweets = get_total_tweets(qdrant_client)
    unique_locations_set = get_unique_locations(qdrant_client)
    results = search_similar_tweets(
        qdrant_client,
        collection_name="tweets_collection",
        query_text="football match",
        top_k=3
    )

    print(results)
    print("Total unique locations:", unique_locations_set)
    print("Total tweets:", total_tweets)
