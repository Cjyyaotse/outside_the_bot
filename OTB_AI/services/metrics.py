"""
This module provides utility functions for interacting with a Qdrant vector database
containing tweet embeddings. It includes:

1. Retrieving total number of stored tweets.
2. Fetching unique geo-locations (latitude, longitude).
3. Searching for tweets similar to a given query text.

Used for analytics and similarity-based tweet retrieval.
"""

import os
from typing import List, Dict
from fastembed import TextEmbedding
import numpy as np
from dotenv import load_dotenv
from qdrant_client import QdrantClient


def get_total_tweets(client: QdrantClient) -> int:
    """
    Get the total number of tweets stored in a Qdrant collection.

    Args:
        client (QdrantClient): Initialized Qdrant client.

    Returns:
        int: Total count of tweets (points) in the collection.
    """
    collection_name = "tweets_collection"
    stats = client.get_collection(collection_name)
    return stats.points_count if stats.points_count is not None else 0


def get_unique_locations(client: QdrantClient, limit: int = 10_000) -> int:
    """
    Fetch the number of unique (latitude, longitude) pairs stored in the collection.

    Args:
        client (QdrantClient): Initialized Qdrant client.
        limit (int, optional): Maximum number of points to fetch per scroll batch. Defaults to 10,000.

    Returns:
        int: Count of unique geo-locations.
    """
    locations = set()   # Store unique (lat, lon) pairs
    offset = None
    collection_name = "tweets_collection"

    while True:
        # Fetch batch of points with payloads
        resp = client.scroll(
            collection_name=collection_name,
            limit=limit,
            with_payload=True,
            offset=offset
        )
        points, next_offset = resp[0], resp[1]

        # Extract latitude/longitude pairs
        for p in points:
            if p.payload is None:
                continue
            lat = p.payload.get("latitude")
            lon = p.payload.get("longitude")
            if lat is not None and lon is not None:
                locations.add((float(lat), float(lon)))

        # Stop when no more points
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
    Search Qdrant for tweets that are semantically similar to a given query text.

    Steps:
    1. Embed the query text.
    2. Query Qdrant for nearest vectors.
    3. Format results with tweet text, coordinates, and similarity score.

    Args:
        client (QdrantClient): Initialized Qdrant client.
        collection_name (str): Qdrant collection to search in.
        query_text (str): Input text query.
        top_k (int, optional): Number of similar tweets to return. Defaults to 5.
        model_name (str, optional): Embedding model. Defaults to "BAAI/bge-small-en-v1.5".

    Returns:
        List[Dict]: List of search results with tweet text, coordinates, and similarity score.
    """
    # 1. Create embedding for query text
    embedding_model = TextEmbedding(model_name=model_name)
    query_vec = list(embedding_model.embed([query_text]))[0]

    # 2. Search Qdrant using query vector
    resp = client.query_points(
        collection_name=collection_name,
        query=query_vec,
        limit=top_k,
        with_payload=True,
        with_vectors=False
    )

    # 3. Format results into structured list
    results = []
    for p in resp.points:
        results.append({
            "tweet": p.payload.get("document"),
            "latitude": p.payload.get("latitude"),
            "longitude": p.payload.get("longitude"),
            "score": getattr(p, "score", None)
        })

    return results


# ------------------------------
# Example Usage
# ------------------------------
if __name__ == "__main__":
    # Load environment variables
    load_dotenv()
    QDRANT_URL = os.getenv("QDRANT_URL")
    API_KEY = os.getenv("QDRANT_API_KEY")

    if not API_KEY:
        raise RuntimeError("Set QDRANT_API_KEY in your environment (or .env) before running.")

    # Initialize Qdrant client
    qdrant_client = QdrantClient(url=QDRANT_URL, api_key=API_KEY)

    # Get stats
    total_tweets = get_total_tweets(qdrant_client)
    unique_locations_count = get_unique_locations(qdrant_client)

    # Run semantic search example
    results = search_similar_tweets(
        qdrant_client,
        collection_name="tweets_collection",
        query_text="football match",
        top_k=3
    )

    # Print outputs
    print(results)
    print("Total unique locations:", unique_locations_count)
    print("Total tweets:", total_tweets)
