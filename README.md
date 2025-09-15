# Tweet Classification and Analysis API

This project is a FastAPI-based application for analyzing and classifying tweets stored in a Qdrant vector database. It supports semantic and location-based searches, retrieves static metrics (e.g., total tweets and unique locations), and generates structured summaries using large language models (Mistral, with OpenAI as a fallback). The application is designed for analytics and retrieval of tweet data, providing insights into trending topics and conversations at specific geographic locations.

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Dependencies](#dependencies)
- [Running Tests](#running-tests)
- [Contributing](#contributing)
- [License](#license)

## Features
- **Semantic Search**: Retrieve tweets semantically similar to a query text using text embeddings (`BAAI/bge-small-en-v1.5`).
- **Location-Based Search**: Find tweets near a specified latitude/longitude with an optional radius.
- **Hybrid Search**: Combine semantic and location-based searches for more relevant results.
- **LLM Summarization**: Generate structured JSON summaries of tweets (e.g., main themes, trending topics) using Mistral or OpenAI.
- **Static Metrics**: Provide analytics like total tweet count and unique geo-locations.
- **Batch Processing**: Perform searches and summarization for multiple locations in a single request.
- **Robust Error Handling**: Includes fallbacks (e.g., OpenAI if Mistral fails) and validation for API inputs.

## Architecture
The application integrates several components:
- **FastAPI**: Serves RESTful API endpoints for tweet search and analytics.
- **Qdrant**: A vector database storing tweet embeddings and metadata (text, latitude, longitude).
- **FastEmbed**: Generates text embeddings for semantic searches using `BAAI/bge-small-en-v1.5`.
- **Mistral LLM**: Primary model for generating humorous, structured summaries of tweets.
- **OpenAI (gpt-4o-mini)**: Fallback LLM if Mistral fails due to token limit.
- **Geopy**: Used for reverse geocoding to map coordinates to city/region names (optional, based on earlier context).

The data flow involves:
1. Storing tweets in Qdrant with embeddings and geospatial data.
2. Performing hybrid searches (semantic + location) via Qdrant.
3. Preparing tweet context and prompting an LLM for summaries.
4. Serving results through FastAPI endpoints.

## Prerequisites
- Python 3.8+
- Qdrant server (cloud or local instance)
- API keys for Mistral and OpenAI
- Git (for cloning the repository)
- pip (for installing dependencies)

## Installation
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Cjyyaotse/outside_the_bot.git
   cd OTB_AI
   ```

2. **Create a Virtual Environment** (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set Up Environment Variables**:
   Create a `.env` file in the project root and add the following:
   ```env
   MISTRAL_API_KEY=your_mistral_api_key
   QDRANT_API_KEY=your_qdrant_api_key
   QDRANT_URL=your_qdrant_url
   OPENAI_API_KEY=your_openai_api_key
   ```
   Replace `your_mistral_api_key`, `your_qdrant_api_key`, `your_qdrant_url`, and `your_openai_api_key` with your actual credentials.

5. **Start the FastAPI Server**:
   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8000
   ```
   The API will be available at `http://localhost:8000`.

## Environment Variables
The application requires the following environment variables, which should be defined in a `.env` file or your environment:
- `MISTRAL_API_KEY`: API key for Mistral LLM.
- `QDRANT_API_KEY`: API key for Qdrant vector database.
- `QDRANT_URL`: URL of the Qdrant server (e.g., `https://your-qdrant-cluster.qdrant.io`).
- `OPENAI_API_KEY`: API key for OpenAI (used as a fallback for Mistral).

Example `.env` file:
```env
MISTRAL_API_KEY=abc123
QDRANT_API_KEY=xyz789
QDRANT_URL=https://your-qdrant-cluster.qdrant.io
OPENAI_API_KEY=def456
```

## Usage
1. **Start the API**:
   Run the FastAPI server as described in [Installation](#installation).

2. **Access the API**:
   - Open `http://localhost:8000/docs` in a browser to view the interactive Swagger UI for testing endpoints.
   - Use tools like `curl`, Postman, or Python's `requests` library to make API calls.

3. **Example Requests**:
   - **Get API Status**:
     ```bash
     curl http://localhost:8000/
     ```
     Response:
     ```json
     {"message": "Welcome to the Tweet Classification App"}
     ```

   - **Get Static Metrics**:
     ```bash
     curl -X POST http://localhost:8000/get_static_metrics
     ```
     Response:
     ```json
     {
       "total_conversations": 10000,
       "active_hotspots": 150
     }
     ```

   - **Search Tweets by Location and Topic**:
     ```bash
     curl "http://localhost:8000/get_tweets_inspo?query_lat=40.7128&query_lon=-74.0060&topic=food&radius_km=10"
     ```
     Response:
     ```json
     {
       "tweets": ["Loving the pizza in NYC!", "Best tacos in town!"],
       "summary": {
         "description": "New Yorkers are obsessed with food",
         "trending topics": "pizza, tacos, dining, foodie"
       }
     }
     ```

   - **Batch Search for Two Locations**:
     ```bash
     curl -X POST http://localhost:8000/get_tweets_inspo_batch \
     -H "Content-Type: application/json" \
     -d '{"locations": [{"lat": 40.7128, "lon": -74.0060}, {"lat": 34.0522, "lon": -118.2437}], "radius_km": 10, "topic": "food"}'
     ```
     Response:
     ```json
     {
       "results": [
         {
           "location_index": 0,
           "lat": 40.7128,
           "lon": -74.0060,
           "radius_km": 10,
           "topic": "food",
           "tweets": ["Loving the pizza in NYC!"],
           "summary": {
             "description": "New Yorkers are obsessed with food",
             "trending topics": "pizza, tacos, dining, foodie"
           }
         },
         {
           "location_index": 1,
           "lat": 34.0522,
           "lon": -118.2437,
           "radius_km": 10,
           "topic": "food",
           "tweets": ["LA food trucks are amazing!"],
           "summary": {
             "description": "LA loves its food trucks",
             "trending topics": "foodtrucks, tacos, streetfood, dining"
           }
         }
       ]
     }
     ```

## API Endpoints
The API provides the following endpoints:

| Endpoint | Method | Description | Parameters |
|----------|--------|-------------|------------|
| `/` | GET | Check API status | None |
| `/get_similar_tweets` | GET | Retrieve tweets semantically similar to a query text | `query_text` (string) |
| `/get_static_metrics` | POST | Get total tweet count and unique locations | None |
| `/get_tweets_inspo` | GET | Perform hybrid search (location + optional topic) and summarize with LLM | `query_lat` (float), `query_lon` (float), `topic` (string, optional), `radius_km` (float, optional) |
| `/get_tweets_inspo_batch` | POST | Perform hybrid search for two locations and summarize with LLM | JSON body with `locations` (array of `{lat, lon}`), `radius_km` (float, optional), `topic` (string, optional) |

See the Swagger UI (`/docs`) for detailed endpoint documentation and interactive testing.


## Dependencies
The project requires the following Python packages:
```
fastapi
uvicorn
qdrant-client
fastembed
python-dotenv
pydantic
mistralai
langchain
numpy
geopy  # Optional, for reverse geocoding
```
Install them using:
```bash
pip install fastapi uvicorn qdrant-client fastembed python-dotenv pydantic mistralai langchain numpy geopy
```

## Running Tests
To test the application:
1. Ensure a Qdrant server is running and populated with tweet data in the `tweets_collection`.
2. Start the FastAPI server: `uvicorn app:app --host 0.0.0.0 --port 8000`.
3. Use the Swagger UI (`http://localhost:8000/docs`) or tools like Postman to test endpoints.
4. Example test script (using `requests`):
   ```python
   import requests
   response = requests.get("http://localhost:8000/get_similar_tweets?query_text=football")
   print(response.json())
   ```

## Contributing
Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

Please ensure your code follows PEP 8 style guidelines and includes appropriate tests.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
