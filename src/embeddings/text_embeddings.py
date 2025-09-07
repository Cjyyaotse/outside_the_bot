import json
import math
import os
from typing import List, Dict, Tuple, Optional

import numpy as np
from qdrant_client import QdrantClient, models
from fastembed import TextEmbedding
from dotenv import load_dotenv

load_dotenv()

# ------------------------------
# Helpers
# ------------------------------
def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371.0  # Earth radius in km
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2.0)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2.0)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# ------------------------------
# 1️⃣ Load JSONL tweets
# ------------------------------
def load_jsonl_tweets(file_path: str) -> Tuple[List[str], List[Dict]]:
    documents = []
    metadata = []
    with open(file_path, "r", encoding="utf-8") as f:
        for line in f:
            if line.strip():
                item = json.loads(line)
                text = item.get("text")
                coords = item.get("coordinates", [None, None])
                if text and coords[0] is not None and coords[1] is not None:
                    documents.append(text)
                    metadata.append({
                        "longitude": float(coords[0]),
                        "latitude": float(coords[1])
                    })
    return documents, metadata

# ------------------------------
# 2️⃣ Embed tweets
# ------------------------------
def embed_documents(documents: List[str], model_name="BAAI/bge-small-en-v1.5") -> List[List[float]]:
    embedding_model = TextEmbedding(model_name=model_name)
    embeddings = list(embedding_model.embed(documents))
    return embeddings

# ------------------------------
# 3️⃣ Upload embeddings + metadata to Qdrant (creates indexes)
# ------------------------------
def upload_to_qdrant(
    client: QdrantClient,
    collection_name: str,
    documents: List[str],
    embeddings: List[List[float]],
    metadata: List[Dict]
):
    # If exists, delete for a clean slate (optional)
    if client.collection_exists(collection_name):
        client.delete_collection(collection_name)

    client.create_collection(
        collection_name=collection_name,
        vectors_config=models.VectorParams(
            size=len(embeddings[0]),
            distance=models.Distance.COSINE
        )
    )

    # Create payload indexes for latitude and longitude so range filters are allowed
    # (If the index already exists or server doesn't support it, ignore the error.)
    try:
        client.create_payload_index(
            collection_name=collection_name,
            field_name="latitude",
            field_schema=models.FloatIndexParams()
        )
    except Exception:
        pass

    try:
        client.create_payload_index(
            collection_name=collection_name,
            field_name="longitude",
            field_schema=models.FloatIndexParams()
        )
    except Exception:
        pass

    payload_with_docs = [{"document": doc, **meta} for doc, meta in zip(documents, metadata)]

    # Upload points (upload_collection is fine if available in your client; upsert/upload_points are alternatives)
    client.upload_collection(
        collection_name=collection_name,
        vectors=embeddings,
        payload=payload_with_docs,
        ids=list(range(len(documents))),
    )

# ------------------------------
# 4️⃣ Hybrid search (using query_points)
# ------------------------------
def hybrid_search(
    client: QdrantClient,
    collection_name: str,
    query_lat: float,
    query_lon: float,
    text_query: Optional[str] = None,
    radius_km: float = 50,
    top_k: int = 2,
    candidate_limit: int = 1000
):
    """
    Alternative hybrid search that does spatial filtering *client-side* to avoid server-side
    range filters that require payload indexes.

    - If text_query is provided: use query_points to get candidate vector hits (limit=candidate_limit),
        then keep only those within radius_km (computed with haversine) and return top_k by score.
    - If text_query is None: scroll a batch of points (limit=candidate_limit), compute haversine,
        pick nearest top_k by distance, compute centroid of their vectors (if available), and then
        run a query_points by centroid to get textually-similar results (same as before).
    """
    # PATH A: text query provided -> vector candidates then client-side spatial filter
    if text_query and text_query.strip():
        qvec = embed_documents([text_query])[0]
        # get many candidate vector hits (no server-side geo filter)
        resp = client.query_points(
            collection_name=collection_name,
            query=qvec,
            limit=candidate_limit,
            with_payload=True,
            with_vectors=False
        )
        candidates = resp.points

        # compute haversine distance and filter
        filtered = []
        for p in candidates:
            lat = p.payload.get("latitude")
            lon = p.payload.get("longitude")
            if lat is None or lon is None:
                continue
            dist_km = haversine_distance(query_lat, query_lon, float(lat), float(lon))
            if dist_km <= radius_km:
                filtered.append((p, dist_km))

        # sort by score (if present) else by distance, and return top_k
        filtered.sort(key=lambda x: (-(getattr(x[0], "score", 0) or 0), x[1]))
        out = []
        for p, dist in filtered[:top_k]:
            out.append({
                "document": p.payload.get("document"),
                "latitude": p.payload.get("latitude"),
                "longitude": p.payload.get("longitude"),
                "score": getattr(p, "score", None),
                "distance_km": dist
            })
        return out

    # PATH B: no text -> fetch candidates by scrolling (no server filter), compute distances locally
    # NOTE: scroll without server filter avoids the index error
    scroll_resp = client.scroll(
        collection_name=collection_name,
        limit=candidate_limit,
        with_payload=True,
        with_vectors=True
    )
    # handle tuple/list return variations
    points = scroll_resp[0] if isinstance(scroll_resp, tuple) else scroll_resp
    if not points:
        return []

    # compute haversine distances for all points
    points_with_distance = []
    for p in points:
        lat = p.payload.get("latitude")
        lon = p.payload.get("longitude")
        if lat is None or lon is None:
            continue
        dist_km = haversine_distance(query_lat, query_lon, float(lat), float(lon))
        if dist_km <= radius_km:
            points_with_distance.append((p, dist_km))

    if not points_with_distance:
        return []

    # sort by true distance and pick nearest top_k
    points_with_distance.sort(key=lambda x: x[1])
    nearest = points_with_distance[:top_k]

    # output nearest-by-location
    nearest_out = []
    vecs_for_centroid = []
    for p, dist_km in nearest:
        nearest_out.append({
            "document": p.payload.get("document"),
            "latitude": p.payload.get("latitude"),
            "longitude": p.payload.get("longitude"),
            "distance_km": dist_km
        })
        if getattr(p, "vector", None) is not None:
            vecs_for_centroid.append(np.array(p.vector))

    # if vectors exist, compute centroid and find similar texts via query_points (no geo filter)
    similar_texts_out = []
    if vecs_for_centroid:
        centroid = np.mean(vecs_for_centroid, axis=0).tolist()
        resp = client.query_points(
            collection_name=collection_name,
            query=centroid,
            limit=top_k,
            with_payload=True,
            with_vectors=False
        )
        for p in resp.points:
            lat = p.payload.get("latitude")
            lon = p.payload.get("longitude")
            distance_km = None
            if lat is not None and lon is not None:
                distance_km = haversine_distance(query_lat, query_lon, float(lat), float(lon))
            similar_texts_out.append({
                "document": p.payload.get("document"),
                "latitude": lat,
                "longitude": lon,
                "score": getattr(p, "score", None),
                "distance_km": distance_km
            })

    return {
        "nearest_by_location": nearest_out,
        "similar_texts_by_vector": similar_texts_out
    }

# ------------------------------
# Example Usage (Qdrant Cloud)
# ------------------------------
if __name__ == "__main__":
    QDRANT_URL = os.getenv("QDRANT_URL", "https://e05d9b10-8125-4e7e-be19-29cc4c4ca59f.us-east4-0.gcp.cloud.qdrant.io")
    API_KEY = os.getenv("QDRANT_API_KEY")
    if not API_KEY:
        raise RuntimeError("Set QDRANT_API_KEY in your environment (or .env) before running.")

    client = QdrantClient(url=QDRANT_URL, api_key=API_KEY)

    print("Collections:", client.get_collections())

    jsonl_file_path = "datasets/dummy_tweets_data.jsonl"
    documents, metadata = load_jsonl_tweets(jsonl_file_path)
    print(f"Loaded {len(documents)} tweets.")
    if documents:
        embeddings_list = embed_documents(documents)
        upload_to_qdrant(client, "tweets_collection", documents, embeddings_list, metadata)
        print("Uploaded collection (tweets_collection).")

    raw_lat = input("Enter query latitude (e.g. 43.243963): ").strip()
    raw_lon = input("Enter query longitude (e.g. -79.728099): ").strip()
    raw_text = input("Optional text query (press enter to skip): ").strip()

    try:
        qlat = float(raw_lat)
        qlon = float(raw_lon)
    except ValueError:
        raise ValueError("Latitude and longitude must be valid floats.")

    results = hybrid_search(
        client=client,
        collection_name="tweets_collection",
        query_lat=qlat,
        query_lon=qlon,
        text_query=(raw_text if raw_text else None),
        radius_km=50,
        top_k=5
    )

    if not results:
        print("No nearby points found within radius.")
    else:
        if isinstance(results, dict):
            print("\nNearest by location (top results):")
            for i, item in enumerate(results["nearest_by_location"], start=1):
                print(f"{i}. {item['document']} — {item['distance_km']:.2f} km (lat={item['latitude']}, lon={item['longitude']})")
            print("\nSimilar texts by vector (top results):")
            for i, item in enumerate(results["similar_texts_by_vector"], start=1):
                score = item.get("score")
                score_str = f"score={score:.4f}" if score is not None else ""
                dist = item.get("distance_km")
                dist_str = f"{dist:.2f} km" if dist is not None else "N/A"
                print(f"{i}. {item['document']} — {dist_str} {score_str}")
        else:
            print("\nSearch results (by text + location filter):")
            for i, item in enumerate(results, start=1):
                score = item.get("score")
                score_str = f"score={score:.4f}" if score is not None else ""
                dist = item.get("distance_km")
                dist_str = f"{dist:.2f} km" if dist is not None else "N/A"
                print(f"{i}. {item['document']} — {dist_str} {score_str}")
