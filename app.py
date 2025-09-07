import os
from dotenv import load_dotenv
from fastapi import FastAPI, Query
from src.main import (
    hybrid_search,
    build_prompt,
    run_mistral_json
)
from qdrant_client import QdrantClient

load_dotenv()

QDRANT_URL = os.getenv("QDRANT_URL")
API_KEY = os.getenv("QDRANT_API_KEY")
if not API_KEY:
    raise RuntimeError("Set QDRANT_API_KEY in your environment (or .env) before running.")

qdrant_client = QdrantClient(url=QDRANT_URL, api_key=API_KEY)
app = FastAPI(title="Tweet Classification API")


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
        collection_name=collection_name
    )

    # Step 2: Prepare context from retrieved tweets
    context_text = results

    # Step 3: Build prompt for Mistral
    prompt = build_prompt(context_text)

    # Step 4: Get structured JSON response from Mistral
    result = run_mistral_json(prompt)

    return result
