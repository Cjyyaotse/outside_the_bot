# Chirpmap: Tweet Visualizer and Analyzer

**Chirpmap** (part of the "Outside The Bot" project) is a full-stack web application designed to analyze and visualize tweets stored in a Qdrant vector database. Users interact with an intuitive global map interface to search for tweets by location (e.g., entering a state, region, or clicking on the map), retrieve semantically relevant results, generate AI-powered summaries of trending topics and conversations, and compare tweet insights across regions. It leverages semantic search, location-based filtering, and large language models (LLMs) like Mistral (with OpenAI fallback) to provide actionable analytics, such as main themes, sentiment, and unique geo-locations. Ideal for researchers, journalists, or anyone exploring social media trends geographically.

This project separates concerns into a robust Python-based backend API for data processing and retrieval, and a modern JavaScript/TypeScript frontend for interactive visualization using Mapbox maps, autocomplete search, and dynamic UI elements.

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
### Backend Features
- **Semantic Search**: Retrieve tweets similar to a query using text embeddings (`BAAI/bge-small-en-v1.5`).
- **Location-Based Search**: Filter tweets by latitude/longitude with customizable radius.
- **Hybrid Search**: Combine semantic and location filters for precise results.
- **LLM Summarization**: Generate structured JSON summaries (e.g., themes, trends) using Mistral or OpenAI fallback.
- **Static Metrics**: Quick analytics like total tweets and unique locations.
- **Batch Processing**: Analyze multiple locations in one request for regional comparisons.
- **Error Handling**: Built-in fallbacks and input validation for reliability.

### Frontend Features
- **Interactive Map**: Visualize tweet locations worldwide using Mapbox.
- **Search & Autocomplete**: Enter locations or topics with real-time suggestions.
- **Regional Analysis**: Display tweets, summaries, and trends for selected areas.
- **Region Comparison**: Side-by-side insights between locations.
- **Modal Previews**: Browse available tweet locations before querying.

The backend powers the frontend's data needs, enabling seamless hybrid searches and visualizations.

## Architecture
The system integrates:
- **Backend (FastAPI)**: Handles API requests, queries Qdrant for embeddings/metadata, generates embeddings with FastEmbed, and prompts LLMs for summaries.
- **Database (Qdrant)**: Stores tweet vectors, text, and geospatial data (lat/long).
- **Embeddings (FastEmbed)**: Uses `BAAI/bge-small-en-v1.5` for semantic similarity.
- **LLMs**: Mistral for primary summaries; OpenAI (gpt-4o-mini) as fallback.
- **Geocoding (Geopy)**: Optional reverse lookup for coordinates to place names.
- **Frontend (React)**: Consumes backend API for map rendering, search, and UI interactions.

**Data Flow**:
1. Tweets stored in Qdrant with embeddings and geo-data.
2. Frontend sends queries to backend API.
3. Backend performs hybrid search, summarizes via LLM, and returns JSON.
4. Frontend renders maps, lists, and comparisons.

For a visual diagram, see [architecture.md](architecture.md) (if added in future updates).

## Prerequisites
- **Python 3.8+** (for backend).
- **Node.js 18+ and npm** (for frontend; download from [nodejs.org](https://nodejs.org)).
- **Qdrant Server**: Run locally (via Docker) or use Qdrant Cloud.
- **API Keys**: For Mistral, OpenAI, and Qdrant.
- **Git**: For cloning the repo.
- **Docker** (optional, for Qdrant setup).

These instructions work across **Windows**, **macOS**, and **Linux**. Use Command Prompt/PowerShell on Windows, Terminal on macOS/Linux. For virtual environments, use `venv` on all OSes.


## Installation
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Cjyyaotse/outside_the_bot.git
   cd outside_the_bot
   ```

2. **Backend Setup (OTB_AI Directory)**:
   ```bash
   cd OTB_AI
   ```
   - Create a virtual environment:
     - **Linux/macOS**:
       ```bash
       python -m venv venv
       source venv/bin/activate
       ```
     - **Windows**:
       ```bash
       python -m venv venv
       venv\Scripts\activate
       ```
   - Install dependencies:
     ```bash
     pip install -r requirements.txt
     ```

3. **Frontend Setup (OTB_frontend Directory)**:
   ```bash
   cd ../OTB_frontend
   npm install
   ```

4. **Set Up Environment Variables** (Both Backend and Frontend):
   - **Backend**: Copy `OTB_AI/example.env` to `OTB_AI/.env` and edit:
     ```env
     MISTRAL_API_KEY=your_mistral_api_key
     QDRANT_API_KEY=your_qdrant_api_key
     QDRANT_URL=your_qdrant_url  # e.g., http://localhost:6333 for local
     OPENAI_API_KEY=your_openai_api_key
     ```
   - **Frontend**: Copy `OTB_frontend/example.env` to `OTB_frontend/.env` and edit (uses Vite for React):
     ```env
     VITE_DEFAULT_PUBLIC_TOKEN=your_public_token_if_needed
     VITE_MISTRAL_API_KEY=your_mistral_api_key
     VITE_QDRANT_API_KEY=your_qdrant_api_key
     VITE_QDRANT_URL=your_qdrant_url
     VITE_OPENAI_API_KEY=your_openai_api_key
     ```
     *Note*: Prefix with `VITE_` for frontend exposure. Restart dev server after changes.

## Usage
1. **Start the Backend**:
   From `OTB_AI`:
   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8000 --reload
   ```
   API ready at `http://localhost:8000`. Test with `/docs` for Swagger UI.

2. **Start the Frontend**:
   From `OTB_frontend`:
   ```bash
   npm run dev
   ```
   App runs at `http://localhost:5173`. Ensure backend is running first.

3. **Interact with the App**:
   - Open `http://localhost:5173` in your browser.
   - Use the modal to preview locations with tweets.
   - Search by location name (autocomplete helps), set radius/topic if desired, and click "Analyze Region".
   - Click the map for precise coordinates.
   - Compare regions via the comparison tool for side-by-side summaries.
   - If no tweets found, a message displays.

For production: Build frontend (`npm run build`) and serve static files; deploy backend via Uvicorn/Gunicorn.

## API Endpoints
Access full docs at `http://localhost:8000/docs`.

| Endpoint | Method | Description | Example Request |
|----------|--------|-------------|-----------------|
| `/` | GET | Health check | `curl http://localhost:8000/` |
| `/get_tweets_inspo` | POST | Semantic/location search | `curl -X POST http://localhost:8000/get_tweets_inspo -H "Content-Type: application/json" -d '{"query": "climate change", "lat": 37.7749, "long": -122.4194, "radius": 10}'` |
| `/get_tweets_inspo_batch` | POST | Batch search for multiple locations | Similar to above, but with `locations` array |
| `/static_metrics` | GET | Total tweets and unique locations | `curl http://localhost:8000/static_metrics` |

Responses: JSON with tweets, summaries, and metrics.

## Project Structure
```
outside_the_bot/
├── OTB_AI/                 # Backend
│   ├── app.py              # FastAPI app
│   ├── requirements.txt    # Python deps
│   ├── example.env         # Env template
│   └── ...                 # Models, utils, etc.
├── OTB_frontend/           # Frontend
│   ├── src/                # React components (Map, Search, etc.)
│   ├── package.json        # npm deps
│   ├── example.env         # Env template
│   └── ...                 # Assets, vite.config.js
├── README.md               # This file
└── LICENSE
```

## Dependencies
### Backend
See `OTB_AI/requirements.txt`:
- `fastapi`, `uvicorn`
- `qdrant-client`, `fastembed`
- `mistralai`, `langchain-openai`
- `python-dotenv`, `pydantic`, `geopy`, `numpy`

### Frontend
See `OTB_frontend/package.json`:
- `react`, `vite`
- `@mapbox/mapbox-gl-geocoder` (for search/map)
- `axios` (for API calls)
- UI libs (e.g., for modals/comparisons)

## Documentation
For detailed documentation check "Outside_The_Bot_Project_Documentation_.docx" in the root project Directory

## Contributing
We welcome contributions!
1. Fork the repo.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit changes: `git commit -m "Add your feature"`.
4. Push: `git push origin feature/your-feature`.
5. Open a Pull Request.

Follow PEP 8 for Python; use ESLint/Prettier for JS. Discuss major changes via issues.

## License
MIT License. See [LICENSE](LICENSE) for details.
