# Vietnam Travel Chatbot - Backend

Backend API for the Vietnam travel advisory chatbot application, using RAG (Retrieval-Augmented Generation) with Langchain, Pinecone, and Azure OpenAI.

## Technologies

- **FastAPI**: Web framework
- **Langchain**: RAG orchestration
- **Pinecone**: Vector database
- **Azure OpenAI**: LLM and Embeddings
- **gTTS**: Text-to-Speech
- **Python 3.10+**

## Directory Structure

```
backend/
├── api/                    # API endpoints
│   ├── chat.py            # Chat endpoint
│   ├── conversations.py   # Conversation management
│   ├── tts.py            # Text-to-Speech
│   └── destinations.py    # Destination discovery
├── services/              # Business logic
│   ├── rag_service.py    # RAG with Langchain
│   ├── conversation_service.py
│   ├── tts_service.py
│   └── destination_service.py
├── models/                # Data models
│   └── schemas.py        # Pydantic schemas
├── data/                  # Data storage
│   ├── conversations/    # Chat history (JSON)
│   ├── audio/           # TTS audio files
│   └── mock/            # Mock data
├── scripts/              # Utility scripts
│   └── setup_pinecone.py # Setup Pinecone index
├── config.py             # Configuration
├── main.py              # FastAPI app
└── requirements.txt     # Dependencies
```

## Installation

### 1. Clone repository and install dependencies

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure environment variables

Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Update values in `.env`:

```env
# Azure OpenAI - LLM (gpt-4o-mini)
AZURE_OPENAI_LLM_API_KEY=your_llm_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o-mini
AZURE_OPENAI_API_VERSION=2024-07-01-preview

# Azure OpenAI - Embeddings (text-embedding-3-small)
AZURE_OPENAI_EMBEDDING_API_KEY=your_embedding_api_key_here
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-3-small

# Pinecone
PINECONE_API_KEY=your_key_here
PINECONE_ENVIRONMENT=gcp-starter
PINECONE_INDEX_NAME=vietnam-travel
```

### 3. Setup Pinecone Vector Store

Run script to create index and load data:

```bash
python scripts/setup_pinecone.py
```

This script will:
- Create Pinecone index if it doesn't exist
- Read mock data from `data/mock/`
- Split into chunks
- Create embeddings and upload to Pinecone

### 4. Run server

```bash
# Development mode (with auto-reload)
python main.py

# Or use uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server will run at: `http://localhost:8000`

API documentation (Swagger): `http://localhost:8000/docs`

## API Endpoints

### Chat

**POST /api/chat/**
```json
{
  "message": "Suggest tourist spots in Hanoi",
  "conversation_id": "optional-uuid",
  "language": "vi"
}
```

Response:
```json
{
  "message": "Response from bot...",
  "conversation_id": "uuid",
  "follow_up_questions": ["...", "...", "..."],
  "sources": [...],
  "links": [...]
}
```

### Conversations

**GET /api/conversations/** - Get list of conversations

**GET /api/conversations/{id}** - Get conversation details

**POST /api/conversations/new** - Create new conversation

**DELETE /api/conversations/{id}** - Delete conversation

### Text-to-Speech

**POST /api/tts/**
```json
{
  "text": "Text to convert",
  "language": "vi"
}
```

Response: Audio file (MP3)

### Destinations

**GET /api/destinations/** - Get list of destinations
- Query params: `region`, `type`, `language`

**GET /api/destinations/{id}** - Destination details

## Features

### 1. RAG (Retrieval-Augmented Generation)
- Semantic search in Pinecone
- Augment prompt with context
- Generate responses with Azure OpenAI

### 2. Function Calling
- Auto-detect when external links are needed
- Return links from mock data
- Markdown format in response

### 3. Conversation Management
- Filesystem-based storage (JSON)
- Maintain context between messages
- Auto-generate conversation title

### 4. Text-to-Speech
- Support Vietnamese and English
- Cache audio files (MD5 hash)
- Use Google TTS

### 5. Multi-language
- Vietnamese and English
- Dynamic prompts based on language
- Separate mock data for each language

## Testing

Test API with cURL:

```bash
# Test chat
curl -X POST http://localhost:8000/api/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "Suggest tourist spots in Hanoi", "language": "vi"}'

# Test health
curl http://localhost:8000/health

# Test destinations
curl "http://localhost:8000/api/destinations/?region=north&language=vi"
```

## Troubleshooting

### Pinecone connection error
- Check API key and environment in `.env`
- Ensure index has been created
- Re-run `scripts/setup_pinecone.py`

### Azure OpenAI error
- Verify API key and endpoint
- Check deployment names
- Check quota and rate limits in Azure portal

### Dependencies error
```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

## Production Deployment

For production deployment:

1. Set `DEBUG=False` in `.env`
2. Use production WSGI server (Gunicorn):
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

3. Setup reverse proxy (Nginx)
4. Enable HTTPS
5. Setup monitoring and logging

## License

MIT

