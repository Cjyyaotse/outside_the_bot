"""
This module implements a FastAPI application for tweet classification and analysis.

It provides endpoints for:
- Checking API status.
- Searching for similar tweets based on text queries.
- Retrieving static metrics like total tweets and unique locations.
- Performing hybrid semantic and location-based searches for tweets, then summarizing them using an LLM.
"""

import os
from dotenv import load_dotenv
from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
from services.main import (
    hybrid_search,
    build_prompt,
    prepare_context_text,
    get_llm_response
)
from qdrant_client import QdrantClient
from services.metrics import (
    get_total_tweets,
    get_unique_locations,
    search_similar_tweets
)

# Load environment variables from a .env file (if present)
load_dotenv()

# Qdrant service configuration
QDRANT_URL = os.getenv("QDRANT_URL")
API_KEY = os.getenv("QDRANT_API_KEY")

# Ensure API key is set before starting the app
if not API_KEY:
    raise RuntimeError("Set QDRANT_API_KEY in your environment (or .env) before running.")

# Initialize Qdrant client with API key and URL
qdrant_client = QdrantClient(url=QDRANT_URL, api_key=API_KEY)

# Create FastAPI application instance
app = FastAPI(title="Tweet Classification API")


def extract_documents(results):
    """
    Extract documents from hybrid search results.

    Args:
        results (dict | list): Search results returned by Qdrant queries.
            - If a dict: contains keys 'nearest_by_location' and 'similar_texts_by_vector'.
            - If a list: contains direct document dictionaries.

    Returns:
        list[str]: A list of extracted document strings.
    """
    if isinstance(results, dict):
        # Path B: results is a dict with 2 lists
        docs = [item["document"] for item in results.get("nearest_by_location", [])]
        docs += [item["document"] for item in results.get("similar_texts_by_vector", [])]
        return docs
    elif isinstance(results, list):
        # Path A: results is already a list of dicts
        return [item["document"] for item in results]
    else:
        # Unexpected result format
        return []


@app.get("/", tags=["Root"])
def root():
    """
    Root endpoint to confirm that the API is running.

    Returns:
        dict: A simple welcome message.
    """
    return {"message": "Welcome to the Tweet Classification App"}


@app.get("/get_similar_tweets")
def similar_tweets(query_text: str):
    """
    Retrieve tweets that are semantically similar to a given query text.

    Args:
        query_text (str): Input text query to search for similar tweets.

    Returns:
        JSONResponse: Search results containing similar tweets.
    """
    response = search_similar_tweets(
        qdrant_client,
        collection_name="tweets_collection",
        query_text=query_text
    )
    return JSONResponse(content=response)


@app.post("/get_static_metrics")
def static_metrics():
    """
    Retrieve static metrics about stored tweets.

    Returns:
        JSONResponse: Contains:
            - total_conversations (int): Total number of tweets.
            - active_hotspots (int): Count of unique tweet locations.
    """
    total_tweets = get_total_tweets(qdrant_client)
    unique_locations_count = get_unique_locations(qdrant_client)
    return JSONResponse(content={
        "total_conversations": total_tweets,
        "active_hotspots": unique_locations_count
    })


@app.get("/get_tweets_inspo", tags=["Tweet Search"])
def search_tweets(
    query_lat: float = Query(..., description="Latitude of the location"),
    query_lon: float = Query(..., description="Longitude of the location"),
    collection_name: str = Query("tweets_collection", description="Qdrant collection name"),
    topic: str | None = Query(None, description="Enter a topic of choice"),
    radius_km: float | None = Query(None, description="Radius of choice")
):
    """
    Perform a hybrid search of tweets based on location and (optionally) text,
    then summarize results using an LLM.

    Args:
        query_lat (float): Latitude of the target location.
        query_lon (float): Longitude of the target location.
        collection_name (str): Qdrant collection name to search in. Defaults to "tweets_collection".
        topic (str | None): Optional semantic text query (topic of interest).
        radius_km (float | None): Optional search radius in kilometers.

    Returns:
        JSONResponse: Contains:
            - tweets (list[str]): Retrieved tweet texts.
            - summary (dict | str): LLM-generated structured summary of the tweets.
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

    # Extract tweet texts from search results
    tweets = extract_documents(results)

    # Step 2: Prepare context text (can be raw results or pre-processed)
    context_text = results

    # Step 3: Build LLM prompt from context
    prompt = build_prompt(context_text)

    # Step 4: Query LLM for structured summary
    result = get_llm_response(prompt, context_text)

    return JSONResponse(content={
        "tweets": tweets,
        "summary": result
    })


@app.get("/get_tweets(trending)", tags=["Trending tweets"])
def get_tweets(topic: str):
    """
    Placeholder endpoint for fetching trending tweets on a specific topic.

    Args:
        topic (str): The topic of interest.

    Returns:
        dict: Empty dictionary (to be implemented later).
    """
    tweets = {}
    return tweets
