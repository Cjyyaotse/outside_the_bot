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
    """
    Returns distance in kilometers between two lat/lon points using haversine formula.
    """
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
            if line.strip():  # skip empty lines
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
# 3️⃣ Upload embeddings + metadata to Qdrant
# ------------------------------
def upload_to_qdrant(
    client: QdrantClient,
    collection_name: str,
    documents: List[str],
    embeddings: List[List[float]],
    metadata: List[Dict]
):
    # Remove & recreate if exists (optional)
    if client.collection_exists(collection_name):
        client.delete_collection(collection_name)

    client.create_collection(
        collection_name=collection_name,
        vectors_config=models.VectorParams(
            size=len(embeddings[0]),
            distance=models.Distance.COSINE
        )
    )

    # Create payload indexes for lat/lon so filters work
    try:
        client.create_payload_index(
            collection_name=collection_name,
            field_name="latitude",
            field_schema=models.FloatIndexParams()
        )
        client.create_payload_index(
            collection_name=collection_name,
            field_name="longitude",
            field_schema=models.FloatIndexParams()
        )
    except Exception:
        # Index creation may fail if already exists or server doesn't support — ignore safely
        pass

    payload_with_docs = [{"document": doc, **meta} for doc, meta in zip(documents, metadata)]

    client.upload_collection(
        collection_name=collection_name,
        vectors=embeddings,
        payload=payload_with_docs,
        ids=list(range(len(documents))),
    )


# ------------------------------
# 4️⃣ Hybrid search (location + optional text)
# ------------------------------
def hybrid_search(
    client: QdrantClient,
    collection_name: str,
    query_lat: float,
    query_lon: float,
    text_query: Optional[str] = None,
    radius_km: float = 50,
    top_k: int = 5,
    candidate_limit: int = 1000
):
    """
    If text_query provided -> embed it and perform vector search constrained by spatial filter.
    If no text_query -> find candidate points inside radius, pick nearest by haversine, compute centroid
    vector from their vectors and then run a vector search with that centroid to get textually similar results.
    Returns a list of result dicts: {document, latitude, longitude, score (if available), distance_km (if computed)}
    """
    radius_deg = radius_km / 111.0  # rough conversion for bounding box

    # Bounding box filter for latitude/longitude
    filter_condition = models.Filter(
        must=[
            models.FieldCondition(
                key="latitude",
                range=models.Range(
                    gte=query_lat - radius_deg,
                    lte=query_lat + radius_deg
                )
            ),
            models.FieldCondition(
                key="longitude",
                range=models.Range(
                    gte=query_lon - radius_deg,
                    lte=query_lon + radius_deg
                )
            )
        ]
    )

    # If user provided text -> embed and do vector search limited to the spatial filter
    if text_query and text_query.strip():
        qvec = embed_documents([text_query])[0]
        # client.search accepts query_vector and query_filter
        results = client.search(
            collection_name=collection_name,
            query_vector=qvec,
            query_filter=filter_condition,
            limit=top_k,
            with_payload=True,
            with_vector=False
        )
        out = []
        for p in results:
            lat = p.payload.get("latitude")
            lon = p.payload.get("longitude")
            distance_km = None
            if lat is not None and lon is not None:
                distance_km = haversine_distance(query_lat, query_lon, float(lat), float(lon))
            out.append({
                "document": p.payload.get("document"),
                "latitude": lat,
                "longitude": lon,
                "score": getattr(p, "score", None),
                "distance_km": distance_km
            })
        return out

    # If no text provided -> find candidate points within radius, sort by true haversine distance,
    # then compute centroid of their vectors and find similar texts (vector search)
    # Use scroll to get candidates (with vectors)
    points, _ = client.scroll(
        collection_name=collection_name,
        scroll_filter=filter_condition,
        limit=candidate_limit,
        with_payload=True,
        with_vector=True
    )

    if not points:
        return []

    # Compute haversine for each point
    points_with_distance = []
    for p in points:
        lat = p.payload.get("latitude")
        lon = p.payload.get("longitude")
        if lat is None or lon is None:
            continue
        dist_km = haversine_distance(query_lat, query_lon, float(lat), float(lon))
        points_with_distance.append((p, dist_km))

    if not points_with_distance:
        return []

    # Sort by distance ascending and pick the nearest N (we use top_k for centroid)
    points_with_distance.sort(key=lambda x: x[1])
    nearest = points_with_distance[:top_k]

    # Prepare output for nearest-by-location
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

    # If we have vectors, compute centroid and run vector search across collection to find similar texts
    similar_texts_out = []
    if vecs_for_centroid:
        centroid = np.mean(vecs_for_centroid, axis=0).tolist()
        similar = client.search(
            collection_name=collection_name,
            query_vector=centroid,
            limit=top_k,
            with_payload=True,
            with_vector=False
        )
        for p in similar:
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

    # Return a tuple: nearest-by-location and the similar-texts-by-vector
    return {
        "nearest_by_location": nearest_out,
        "similar_texts_by_vector": similar_texts_out
    }


# ------------------------------
# Example Usage (Qdrant Cloud)
# ------------------------------
if __name__ == "__main__":
    # Connect to Qdrant Cloud: set QDRANT_API_KEY in your environment (.env supported)
    QDRANT_URL = os.getenv("QDRANT_URL", "https://e05d9b10-8125-4e7e-be19-29cc4c4ca59f.us-east4-0.gcp.cloud.qdrant.io")
    API_KEY = os.getenv("QDRANT_API_KEY")

    if not API_KEY:
        raise RuntimeError("Set QDRANT_API_KEY in your environment (or .env) before running.")

    client = QdrantClient(
        url=QDRANT_URL,
        api_key=API_KEY,
        # check_compatibility=False  # enable if you get compatibility warnings during debugging
    )

    # Basic connectivity check
    print("Collections:", client.get_collections())

    # Load & upload (only if needed — comment out if collection already uploaded)
    jsonl_file_path = "datasets/dummy_tweets_data.jsonl"
    documents, metadata = load_jsonl_tweets(jsonl_file_path)
    print(f"Loaded {len(documents)} tweets.")
    if documents:
        embeddings_list = embed_documents(documents)
        upload_to_qdrant(client, "tweets_collection", documents, embeddings_list, metadata)
        print("Uploaded collection (tweets_collection).")

    # Ask user for location input and optional text
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

    # Print nicely
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
            # results is a list (when text_query path used)
            print("\nSearch results (by text + location filter):")
            for i, item in enumerate(results, start=1):
                score = item.get("score")
                score_str = f"score={score:.4f}" if score is not None else ""
                dist = item.get("distance_km")
                dist_str = f"{dist:.2f} km" if dist is not None else "N/A"
                print(f"{i}. {item['document']} — {dist_str} {score_str}")
