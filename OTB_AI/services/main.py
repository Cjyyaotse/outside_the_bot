"""
This module integrates Qdrant (vector database), Mistral LLM, and OpenAI (as fallback)
to perform tweet-based semantic + location searches and generate structured summaries.

It includes:
- Embedding generation using `fastembed`.
- Context preparation from Qdrant search results.
- Prompt building for structured JSON responses.
- Calling Mistral (or OpenAI fallback) to analyze tweets and summarize them.
"""

import os
import json
import numpy as np
from dotenv import load_dotenv
from mistralai import Mistral
from qdrant_client import QdrantClient
from fastembed import TextEmbedding
from src.embeddings.text_embeddings import hybrid_search
from langchain.chat_models import init_chat_model

# ------------------------------
# 1️⃣ Load API key and initialize Mistral
# ------------------------------

# Load environment variables from .env file
load_dotenv()

# API key for Mistral LLM
api_key = os.getenv("MISTRAL_API_KEY")

# Initialize Mistral client
client_llm = Mistral(api_key=api_key)

# Initialize fallback OpenAI model (via LangChain)
openai_model = init_chat_model("gpt-4o-mini", model_provider="openai")

# Load Qdrant credentials from env
QDRANT_URL = os.getenv("QDRANT_URL")
API_KEY = os.getenv("QDRANT_API_KEY")

# Fail fast if API key is missing
if not API_KEY:
    raise RuntimeError("Set QDRANT_API_KEY in your environment (or .env) before running.")

# ------------------------------
# 2️⃣ Initialize Qdrant client
# ------------------------------

# Qdrant client for vector storage + similarity search
qdrant_client = QdrantClient(url=QDRANT_URL, api_key=API_KEY)


# ------------------------------
# 3️⃣ Function to get query embedding
# ------------------------------

def get_text_embedding(text: str) -> np.ndarray:
    """
    Generate an embedding vector for a given input text.

    Args:
        text (str): The text to embed.

    Returns:
        np.ndarray: Embedding vector representation of the input text.
    """
    # Load embedding model (BAAI/bge-small-en-v1.5)
    embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
    # Compute embedding and return as numpy array
    return np.array(list(embedding_model.embed([text]))[0])


# ------------------------------
# 5️⃣ Prepare context for LLM
# ------------------------------

def prepare_context_text(results) -> str:
    """
    Convert Qdrant search results into a text block usable by an LLM.

    Handles multiple result formats:
    - List of tweet dicts when `text_query` was provided.
    - Dict with 'nearest_by_location' and 'similar_texts_by_vector' when no text query.

    Args:
        results (list | dict): Qdrant search results.

    Returns:
        str: Concatenated tweet texts, or a fallback message if none found.
    """
    if not results:
        return "No tweets found nearby."

    if isinstance(results, list):
        # Case: text_query provided → results is a list of tweet dicts
        return "\n".join([item.get("document", "") for item in results])
    elif isinstance(results, dict):
        # Case: text_query None → results is a dict with hybrid keys
        all_tweets = []
        if "similar_texts_by_vector" in results and results["similar_texts_by_vector"]:
            all_tweets.extend([item.get("document", "") for item in results["similar_texts_by_vector"]])
        if "nearest_by_location" in results and results["nearest_by_location"]:
            all_tweets.extend([item.get("document", "") for item in results["nearest_by_location"]])
        return "\n".join(all_tweets)

    # If results are in an unexpected format
    return "No tweets found nearby."


# ------------------------------
# 6️⃣ Refined JSON prompt
# ------------------------------

def build_prompt(context_text: str) -> str:
    """
    Build a structured prompt for the LLM to summarize tweets.

    The LLM should:
    - Find main themes or conversations.
    - Respond with humor and plain language.
    - Output in strict JSON format with:
        1. description: brief summary of conversations.
        2. trending topics: four comma-separated trending words.

    Args:
        context_text (str): Tweets concatenated as context.

    Returns:
        str: Formatted prompt string for LLM.
    """
    return f"""
You are given a set of tweets from a specific geographical location.
Analyze these tweets and find the main theme or what people in this location like to talk about.
Response should have some decent level of humor, format text in plain language and remove any additional characters
like symbols.
Return the output in strict JSON format with the following keys:
1. "description": a brief sentence of about 10 words summarizing the common topic of conversation.
2. "trending topics": four comma separated words that will tell the trending topics.

Tweets context:
---------------------
{context_text}
---------------------
"""


# ------------------------------
# 7️⃣ Run Mistral LLM
# ------------------------------

def get_llm_response(prompt_text: str, context_text: str, model="mistral-large-latest") -> dict:
    """
    Call Mistral LLM to analyze tweets, fallback to OpenAI if it fails.

    Args:
        prompt_text (str): Prompt string containing context + instructions.
        context_text (str): Raw context text (tweets).
        model (str): Model to use (default "mistral-large-latest").

    Returns:
        dict: Parsed JSON response with at least "description" and "trending topics".
    """
    try:
        # Try Mistral chat API
        messages = [{"role": "user", "content": prompt_text}]
        chat_response = client_llm.chat.complete(model=model, messages=messages)
        response_text = chat_response.choices[0].message.content.strip()
    except Exception:
        # 🔹 Fallback to OpenAI if Mistral fails
        response_text = openai_model.invoke(prompt_text).content.strip()

    # 🔥 Clean up if LLM wraps response in ```json ... ```
    if response_text.startswith("```"):
        response_text = response_text.strip("`")  # remove backticks
        if response_text.lower().startswith("json"):
            response_text = response_text[4:]  # remove "json" prefix
        response_text = response_text.strip()

    # Try parsing JSON response
    try:
        parsed_output = json.loads(response_text)
    except json.JSONDecodeError:
        # If invalid JSON, fallback to free-text summary
        parsed_output = {"description": response_text, "trending topics": ""}

    return parsed_output


# ------------------------------
# 8️⃣ Example usage
# ------------------------------

if __name__ == "__main__":
    # Example: query tweets around New York (lat/lon)
    query_text = "Joy"
    query_lat, query_lon = 40.730610, -73.935242

    # Perform hybrid search (semantic + location)
    results = hybrid_search(
        client=qdrant_client,
        collection_name="tweets_collection",
        query_lat=query_lat,
        query_lon=query_lon,
        # query_text=query_text,  # optional: enable semantic query
        top_k=5
    )

    # Prepare context for LLM
    context_text = prepare_context_text(results)

    # Build LLM prompt
    prompt = build_prompt(context_text)

    # Run LLM and get structured summary
    result = get_llm_response(prompt, context_text)

    # Print JSON-like response
    print(result)
