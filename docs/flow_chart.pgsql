                ┌─────────────────────┐
                │   Event Data Input  │
                │  (images, audio,    │
                │  slides, comments,  │
                │  geolocation+time)  │
                └─────────┬───────────┘
                          │
                          ▼
                ┌─────────────────────┐
                │   Preprocessing     │
                │  - Frame extraction │
                │  - Audio to chunks  │
                │  - OCR on slides    │
                │  - Text cleaning    │
                └─────────┬───────────┘
                          │
                          ▼
                ┌─────────────────────┐
                │   Embedding Models  │
                │  - Image embeddings │
                │  - Audio embeddings │
                │  - Text embeddings  │
                └─────────┬───────────┘
                          │
                          ▼
                ┌────────────────────────┐
                │   Qdrant Vector Store  │
                │  - Store embeddings    │
                │  - Payload:            │
                │    {geo, time, type,   │
                │     metadata, decay}   │
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
 │ - Show clusters & routes   │
 │ - Apply temporal decay     │
 └────────────────────────────┘
