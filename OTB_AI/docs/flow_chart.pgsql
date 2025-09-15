                ┌─────────────────────┐
                │   Event Data Input  │
                │ (tweets,geolocation)│
                └─────────┬───────────┘
                          │
                          ▼
                ┌─────────────────────┐
                │   Preprocessing     │    │
                │  - Text cleaning    │
                └─────────┬───────────┘
                          │
                          ▼
                ┌─────────────────────┐
                │   Embedding Models  │ │
                │  - Text embeddings  │
                └─────────┬───────────┘
                          │
                          ▼
                ┌────────────────────────┐
                │   Qdrant Vector Store  │
                │  - Store embeddings    │
                │  - Payload:            │
                │    {geo, tweets,       │
                │     metadata}          │
                └─────────┬──────────────┘
                          │
          ┌───────────────┼──────────────────┐
          │               │                  │
          ▼               ▼                  ▼
 ┌─────────────────┐ ┌───────────────┐ ┌─────────────────┐
 │ Map Interface   │ │ Semantic Query │ │ Route Generator │
 │ (pins on map)   │ │ (find similar  │ │ (link related   │
 │ + filters       │ │  memories)     │ │  memories)      │
 └─────────────────┘ └───────────────┘ └─────────────────┘
          │
          ▼
 ┌────────────────────────────┐
 │   User Experience Layer    │
 │ - Click pin = fetch media  │
 │ - Show tweets              │
 └────────────────────────────┘
