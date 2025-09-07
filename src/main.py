import os
import json
import numpy as np
from dotenv import load_dotenv
from mistralai import Mistral
from qdrant_client import QdrantClient
from fastembed import TextEmbedding
from src.embeddings.text_embeddings import hybrid_search

# ------------------------------
# 1️⃣ Load API key and initialize Mistral
# ------------------------------
load_dotenv()
api_key = os.getenv("MISTRAL_API_KEY")
client_llm = Mistral(api_key=api_key)

QDRANT_URL = os.getenv("QDRANT_URL")
API_KEY = os.getenv("QDRANT_API_KEY")
if not API_KEY:
    raise RuntimeError("Set QDRANT_API_KEY in your environment (or .env) before running.")

# ------------------------------
# 2️⃣ Initialize Qdrant client
# ------------------------------
qdrant_client = QdrantClient(url=QDRANT_URL, api_key=API_KEY)

# ------------------------------
# 3️⃣ Function to get query embedding
# ------------------------------
def get_text_embedding(text: str) -> np.ndarray:
    """Return embedding vector for a single text."""
    embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
    return np.array(list(embedding_model.embed([text]))[0])


# ------------------------------
# 5️⃣ Prepare context for LLM
# ------------------------------
'''
def prepare_context_text(results):
    if not results:
        return "No tweets found nearby."
    return "\n".join([point.payload.get("document", "") for point in results])
'''
# ------------------------------
# 6️⃣ Refined JSON prompt
# ------------------------------
def build_prompt(context_text: str) -> str:
    return f"""
You are given a set of tweets from a specific geographical location.
Analyze these tweets and find the main theme or what people in this location like to talk about.
Response should have some decent level of humor, format text in plain language and remove any additional characters
like symbols.
Return the output in strict JSON format with the following keys:
1. "description": a brief sentence or two summarizing the common topic of conversation.
2. "emoji_text": a few emojis that represent the theme.

Tweets context:
---------------------
{context_text}
---------------------
"""


# ------------------------------
# 7️⃣ Run Mistral LLM
# ------------------------------
def run_mistral_json(prompt_text: str, model="mistral-large-latest") -> dict:
    messages = [{"role": "user", "content": prompt_text}]
    chat_response = client_llm.chat.complete(model=model, messages=messages)
    response_text = chat_response.choices[0].message.content.strip()

    # 🔥 Clean up if response is wrapped in ```json ... ```
    if response_text.startswith("```"):
        response_text = response_text.strip("`")  # remove backticks
        if response_text.lower().startswith("json"):
            response_text = response_text[4:]  # drop 'json' prefix
        response_text = response_text.strip()

    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        # fallback if LLM output is not strict JSON
        return {"description": response_text, "emoji_text": ""}


# ------------------------------
# 8️⃣ Example usage
# ------------------------------
if __name__ == "__main__":  # ✅ fixed from "main"
    query_text = "Joy"
    query_lat, query_lon = 40.730610, -73.935242

    results = hybrid_search(
        client=qdrant_client,
        collection_name="tweets_collection",
        query_lat=query_lat,
        query_lon=query_lon,
        #query_text=query_text,
        top_k=5
    )

    context_text = results
    prompt = build_prompt(context_text)
    result = run_mistral_json(prompt)

    print(result)
