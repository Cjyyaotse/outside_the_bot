import os
from dotenv import load_dotenv
from fastapi import FastAPI, Query
from src.main import (
    hybrid_search,
    build_prompt,
    prepare_context_text,
    get_llm_response
)
from qdrant_client import QdrantClient

# Load environment variables
load_dotenv()

QDRANT_URL = os.getenv("QDRANT_URL")
API_KEY = os.getenv("QDRANT_API_KEY")
if not API_KEY:
    raise RuntimeError("Set QDRANT_API_KEY in your environment (or .env) before running.")

# Initialize Qdrant client
qdrant_client = QdrantClient(url=QDRANT_URL, api_key=API_KEY)

# FastAPI app
app = FastAPI(title="Tweet Classification API")

def extract_documents(results):
    if isinstance(results, dict):
        # Path B: results is a dict with 2 lists
        docs = [item["document"] for item in results.get("nearest_by_location", [])]
        docs += [item["document"] for item in results.get("similar_texts_by_vector", [])]
        return docs
    elif isinstance(results, list):
        # Path A: results is already a list of dicts
        return [item["document"] for item in results]
    else:
        return []


@app.get("/", tags=["Root"])
def root():
    """
    Root endpoint to check if the API is running.
    """
    return {"message": "Welcome to the Tweet Classification App"}


@app.get("/get_tweets_inspo", tags=["Tweet Search"])
def search_tweets(
    query_lat: float = Query(..., description="Latitude of the location"),
    query_lon: float = Query(..., description="Longitude of the location"),
    collection_name: str = Query("tweets_collection", description="Qdrant collection name"),
    topic: str | None = Query(None, description="Enter a topic of choice"),
    radius_km: float | None = Query(None, description="Radius of choice")
):
    """
    Perform a hybrid search of tweets based on query text and location,
    then summarize results with Mistral into a structured JSON response.
    """

    # Step 1: Perform hybrid semantic + location search
    results = hybrid_search(
        client=qdrant_client,
        query_lat=query_lat,
        query_lon=query_lon,
        collection_name=collection_name,
        text_query=topic,
        radius_km=radius_km
    )

    tweets = extract_documents(results)
    # Step 2: Extract context (make sure `results` contains text or format accordingly)
    context_text = results

    # Step 3: Build prompt for Mistral
    prompt = build_prompt(context_text)

    # Step 4: Get structured JSON response from Mistral
    result = get_llm_response(prompt, context_text)

    return {
    "tweets": tweets,
    "summary":result
    }
