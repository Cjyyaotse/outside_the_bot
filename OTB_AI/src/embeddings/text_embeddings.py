#!/usr/bin/env python3
"""
Chunked, resumable embed + upload to Qdrant.

- Uses integer point IDs = JSONL line numbers (1-based)
- Writes progress to .upload_checkpoint.json so you can resume
- Retries uploads with exponential backoff on transient failures
"""
import json
import math
import os
import time
import random
from typing import Iterator, Tuple, List, Dict, Optional

import numpy as np
from qdrant_client import QdrantClient, models
from fastembed import TextEmbedding
from dotenv import load_dotenv

load_dotenv()

CHECKPOINT_FILE = ".upload_checkpoint.json"


# ------------------------------
# Helpers: checkpoint persistence
# ------------------------------
def read_checkpoint(collection_name: str) -> int:
    """Return last processed line number for collection (0 if none)."""
    if not os.path.exists(CHECKPOINT_FILE):
        return 0
    try:
        with open(CHECKPOINT_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        return int(data.get(collection_name, 0))
    except Exception:
        return 0


def write_checkpoint(collection_name: str, last_line: int) -> None:
    """Store last processed line number for the collection."""
    data = {}
    if os.path.exists(CHECKPOINT_FILE):
        try:
            with open(CHECKPOINT_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            data = {}
    data[collection_name] = int(last_line)
    with open(CHECKPOINT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f)


# ------------------------------
# Stream JSONL tweets lazily
# ------------------------------
def stream_jsonl(file_path: str, start_line: int = 1) -> Iterator[Tuple[int, str, float, float]]:
    """
    Yield (line_number, text, latitude, longitude).
    start_line: skip lines < start_line (1-based)
    """
    with open(file_path, "r", encoding="utf-8") as f:
        for idx, raw in enumerate(f, start=1):
            if idx < start_line:
                continue
            if not raw.strip():
                continue
            try:
                item = json.loads(raw)
            except json.JSONDecodeError:
                # skip invalid line but advance checkpoint
                continue
            text = item.get("text")
            coords = item.get("coordinates", [None, None])
            # coordinates in your sample are ["lon","lat"] strings — be robust
            if not text or not coords or len(coords) < 2:
                continue
            try:
                # try both orders: some earlier code used coords[1]=lat coords[0]=lon
                lon = float(coords[0])
                lat = float(coords[1])
            except Exception:
                # try swapped
                try:
                    lat = float(coords[0])
                    lon = float(coords[1])
                except Exception:
                    continue
            yield idx, text, lat, lon


# ------------------------------
# Create collection + indexes
# ------------------------------
def ensure_collection(client: QdrantClient, collection_name: str, vector_dim: int):
    if not client.collection_exists(collection_name):
        client.create_collection(
            collection_name=collection_name,
            vectors_config=models.VectorParams(size=vector_dim, distance=models.Distance.COSINE),
        )
        print(f"✅ Created collection '{collection_name}'")

    # create payload indexes for lat/lon (idempotent - catch exceptions)
    try:
        client.create_payload_index(collection_name=collection_name, field_name="latitude", field_schema=models.FloatIndexParams())
    except Exception:
        pass
    try:
        client.create_payload_index(collection_name=collection_name, field_name="longitude", field_schema=models.FloatIndexParams())
    except Exception:
        pass


# ------------------------------
# Reliable upload wrapper with backoff
# ------------------------------
def reliable_upload(client: QdrantClient, collection_name: str, embeddings: List[List[float]], payloads: List[Dict], ids: List[int], max_attempts: int = 5):
    """
    Upload a single chunk with retries and exponential backoff.
    Uses client.upload_collection which handles batch uploading.
    """
    attempt = 0
    while True:
        try:
            # use integer IDs (not strings). Qdrant expects unsigned int or UUID strings.
            client.upload_collection(
                collection_name=collection_name,
                vectors=embeddings,
                payload=payloads,
                ids=ids,
            )
            return  # success
        except Exception as e:
            attempt += 1
            if attempt >= max_attempts:
                raise
            backoff = (2 ** attempt) + random.random()
            print(f"⚠️ Batch upload failed (attempt {attempt}/{max_attempts}): {e!r}. Retrying in {backoff:.1f}s...")
            time.sleep(backoff)


# ------------------------------
# Chunked embedding + resumable upload
# ------------------------------
def embed_and_upload_in_chunks_resumable(
    client: QdrantClient,
    collection_name: str,
    jsonl_file_path: str,
    chunk_size: int = 500,
    model_name: str = "BAAI/bge-small-en-v1.5",
    resume: bool = True,
):
    embedding_model = TextEmbedding(model_name=model_name)

    # get last processed line
    last_processed = read_checkpoint(collection_name) if resume else 0
    start_line = last_processed + 1
    print(f"Resuming from line {start_line} (last processed {last_processed})")

    # create a dummy embedding to determine vector size (if needed)
    dummy_vec = list(embedding_model.embed(["hello"]))[0]
    ensure_collection(client, collection_name, vector_dim=len(dummy_vec))

    docs: List[str] = []
    payloads: List[Dict] = []
    ids: List[int] = []

    processed_count = last_processed
    chunk_id = 0

    for line_no, text, lat, lon in stream_jsonl(jsonl_file_path, start_line=start_line):
        docs.append(text)
        payloads.append({"document": text, "latitude": lat, "longitude": lon})
        ids.append(int(line_no))  # integer id = line number

        if len(docs) >= chunk_size:
            chunk_id += 1
            print(f"🚀 Uploading chunk {chunk_id} (lines up to {line_no}) size={len(docs)} ...")
            embeddings = list(embedding_model.embed(docs))
            reliable_upload(client, collection_name, embeddings, payloads, ids)
            processed_count = line_no
            write_checkpoint(collection_name, processed_count)
            print(f"✅ Chunk {chunk_id} uploaded. checkpoint -> {processed_count}")
            docs, payloads, ids = [], [], []

    # final leftover
    if docs:
        chunk_id += 1
        last_line_in_chunk = ids[-1]
        print(f"🚀 Uploading final chunk {chunk_id} (lines up to {last_line_in_chunk}) size={len(docs)} ...")
        embeddings = list(embedding_model.embed(docs))
        reliable_upload(client, collection_name, embeddings, payloads, ids)
        processed_count = last_line_in_chunk
        write_checkpoint(collection_name, processed_count)
        print(f"✅ Final chunk uploaded. checkpoint -> {processed_count}")

    print(f"🎉 All done. Last processed line: {processed_count}")


# ------------------------------
# Small Haversine (for later searching)
# ------------------------------
def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# 4️⃣ Hybrid search (using query_points)
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
        embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
        embeddings = list(embedding_model.embed([text_query]))
        qvec = embeddings[0]
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
# Example usage / CLI
# ------------------------------
if __name__ == "__main__":
    QDRANT_URL = os.getenv("QDRANT_URL", "https://YOUR-INSTANCE.gcp.cloud.qdrant.io")
    API_KEY = os.getenv("QDRANT_API_KEY")
    if not API_KEY:
        raise RuntimeError("Set QDRANT_API_KEY in your environment or .env")

    client = QdrantClient(url=QDRANT_URL, api_key=API_KEY)

    collection_name = "tweets_collection"
    jsonl_file_path = "datasets/text_coordinates_regions.jsonl"
    chunk_size = 500  # tune to your machine

    print("Collections:", client.get_collections())

    embed_and_upload_in_chunks_resumable(
        client=client,
        collection_name=collection_name,
        jsonl_file_path=jsonl_file_path,
        chunk_size=chunk_size,
        model_name="BAAI/bge-small-en-v1.5",
        resume=True,
    )
