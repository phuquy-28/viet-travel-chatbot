# Technical Context - Vietnam Travel Chatbot

## Technology Stack

### Backend Technologies

#### Core Framework
- **FastAPI 0.115+**
  - Purpose: Web framework for backend API
  - Why: Fast, modern, auto-generated docs, async support
  - Features used: Routing, dependency injection, Pydantic integration

#### AI/ML Stack
- **Langchain 0.3+**
  - Purpose: RAG orchestration framework
  - Components: LLMs, Embeddings, Vector Stores, Tools, Chains
  - Why: Industry standard for RAG applications

- **Langchain-OpenAI 0.2+**
  - Purpose: Azure OpenAI integration
  - Classes: `AzureChatOpenAI`, `AzureOpenAIEmbeddings`
  - Why: Official Azure support

- **Langchain-Pinecone 0.2+**
  - Purpose: Pinecone vector store integration
  - Why: Seamless integration with Langchain

- **Azure OpenAI**
  - Models:
    - **gpt-4o-mini**: LLM for text generation
    - **text-embedding-3-small**: Embeddings (1536 dimensions)
  - API Version: `2024-07-01-preview`
  - Why: Enterprise-grade, reliable, good performance

- **Pinecone 5.4+**
  - Purpose: Vector database for RAG
  - Tier: Serverless (free tier)
  - Index: `vietnam-travel`
  - Dimension: 1536
  - Metric: Cosine similarity
  - Why: Managed, scalable, free tier available

#### Supporting Libraries
- **gTTS (Google Text-to-Speech) 2.5+**
  - Purpose: Convert text to speech
  - Languages: Vietnamese (vi), English (en)
  - Why: Free, unlimited, natural voices

- **Pydantic 2.10+**
  - Purpose: Data validation and settings management
  - Features: Type hints, automatic validation
  - Why: Type safety, FastAPI integration

- **Pydantic-Settings**
  - Purpose: Environment variable management
  - Why: Type-safe configuration

- **Python-dotenv**
  - Purpose: Load `.env` files
  - Why: Standard for environment variables

- **Uvicorn**
  - Purpose: ASGI server
  - Why: Fast, production-ready, supports async

#### Python Version
- **Python 3.10+**
  - Required for: Type hints, pattern matching, performance
  - Tested on: Python 3.10, 3.11

### Frontend Technologies

#### Core Framework
- **Next.js 16.0+**
  - Purpose: React framework for frontend
  - Features: App Router, Server Components, File-based routing
  - Why: Best-in-class React framework, excellent DX

- **React 19+**
  - Purpose: UI library
  - Features: Hooks, Context API, Suspense
  - Why: Industry standard, large ecosystem

- **TypeScript 5+**
  - Purpose: Type safety
  - Why: Catch errors at compile time, better IDE support

#### Styling
- **Tailwind CSS 4+**
  - Purpose: Utility-first CSS framework
  - Why: Rapid development, consistent design, small bundle size

- **Tailwind Animate CSS**
  - Purpose: Animation utilities
  - Why: Easy animations with Tailwind

#### UI Components
- **Radix UI**
  - Purpose: Unstyled, accessible component primitives
  - Why: Accessibility, customization, headless UI

- **Lucide React**
  - Purpose: Icon library
  - Icons used: Plus, MessageSquare, Compass, Settings, Send, Mic, etc.
  - Why: Modern, consistent, tree-shakeable

#### Content Rendering
- **React Markdown**
  - Purpose: Render markdown in React
  - Why: AI responses contain markdown formatting

#### Node Version
- **Node.js 18+**
  - Required for: Next.js 16
  - Tested on: Node 18, 20

### Development Tools

#### Package Management
- **pip**: Python packages
- **npm**: Node.js packages

#### Linting & Formatting
- **ESLint**: JavaScript/TypeScript linting
- **Prettier** (implicit): Code formatting

#### Version Control
- **Git**: Source control
- **.gitignore**: Excludes node_modules, .env, __pycache__, etc.

### Deployment Stack (Recommended)

#### Backend
- **Docker**: Containerization
- **Railway/Render/AWS**: Hosting
- **Gunicorn + Uvicorn**: Production WSGI server

#### Frontend
- **Vercel**: Next.js hosting (recommended)
- Alternatives: Netlify, Cloudflare Pages

## Development Environment

### Setup Requirements
```
Python 3.10+
Node.js 18+
npm or yarn
Git
```

### Virtual Environment
```bash
# Backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### Environment Variables

#### Backend (.env)
```env
# Azure OpenAI - LLM
AZURE_OPENAI_LLM_API_KEY=sk-...
AZURE_OPENAI_ENDPOINT=https://xxx.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o-mini
AZURE_OPENAI_API_VERSION=2024-07-01-preview

# Azure OpenAI - Embeddings
AZURE_OPENAI_EMBEDDING_API_KEY=sk-...
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-3-small

# Pinecone
PINECONE_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
PINECONE_ENVIRONMENT=gcp-starter
PINECONE_INDEX_NAME=vietnam-travel

# Application
DEBUG=True
CORS_ORIGINS=http://localhost:3000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Running Locally
```bash
# Backend (Terminal 1)
cd backend
source venv/bin/activate
python main.py
# → http://localhost:8000

# Frontend (Terminal 2)
cd frontend
npm run dev
# → http://localhost:3000
```

## API Architecture

### REST API Endpoints

#### Chat
- `POST /api/chat/` - Send message, get response

#### Conversations
- `GET /api/conversations/` - List all conversations
- `GET /api/conversations/{id}` - Get specific conversation
- `POST /api/conversations/new` - Create new conversation
- `DELETE /api/conversations/{id}` - Delete conversation

#### Text-to-Speech
- `POST /api/tts/` - Convert text to audio

#### Destinations
- `GET /api/destinations/` - List destinations (with filters)
- `GET /api/destinations/{id}` - Get destination details

#### Health
- `GET /health` - Health check

### API Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

## Data Flow

### Chat Request Flow
```
1. User types message in frontend
2. Frontend sends POST to /api/chat/
3. Backend loads conversation history
4. Backend queries Pinecone for relevant docs
5. Backend augments prompt with context
6. Backend calls Azure OpenAI LLM
7. Backend parses response
8. Backend saves messages to JSON file
9. Backend returns response to frontend
10. Frontend displays message and follow-up questions
```

### RAG Pipeline
```
1. User query: "Best hotels in Hanoi"
2. Embedding: query → vector (1536 dims)
3. Retrieval: Pinecone similarity search → top 5 docs
4. Augmentation: Build prompt with context from docs
5. Generation: Azure OpenAI generates response
6. Post-processing: Extract answer, sources, links
```

### TTS Flow
```
1. User clicks "Listen" button
2. Frontend sends POST to /api/tts/
3. Backend checks cache (MD5 hash of text)
4. If cached: Return existing MP3
5. If not: gTTS generates audio → save → return
6. Frontend plays audio in <audio> element
```

## Technical Constraints

### Pinecone Free Tier
- **Limit**: 5 indexes maximum
- **Storage**: 100K vectors per index
- **Regions**: GCP Starter (Iowa)
- **Impact**: Must delete old indexes if limit reached

### Azure OpenAI
- **Rate Limits**: Per deployment (TPM, RPM)
- **Quota**: Monthly token limits
- **Separate Keys**: Required for LLM and Embeddings
- **Same Endpoint**: Both models use same Azure resource URL

### Langchain Pinecone Wrapper
- **Issue**: API key handling in wrapper is problematic
- **Workaround**: Manual embedding + direct upsert to Pinecone
- **Impact**: More control, but more code

## Dependencies

### Backend (requirements.txt)
```
fastapi==0.115.5
uvicorn==0.32.1
langchain==0.3.9
langchain-openai==0.2.8
langchain-pinecone==0.2.0
pinecone==5.4.2
openai>=1.52.0,<2.0.0
pydantic==2.10.3
pydantic-settings==2.6.1
python-dotenv==1.0.1
gtts==2.5.4
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5",
    "@radix-ui/react-*": "latest",
    "tailwindcss": "^4",
    "lucide-react": "latest",
    "react-markdown": "latest"
  }
}
```

## Build & Bundle

### Backend
- No build step (interpreted Python)
- Production: Docker container recommended

### Frontend
- Build command: `npm run build`
- Output: `.next/` directory
- Static optimization for pages
- Code splitting automatic

## Performance Considerations

### Backend
- **Async/await**: Non-blocking I/O
- **Caching**: TTS audio files cached
- **Connection pooling**: Pinecone maintains connection pool

### Frontend
- **Code splitting**: Automatic with Next.js
- **Image optimization**: Next.js Image component
- **Lazy loading**: Components loaded on demand

## Security Considerations

### API Keys
- Never commit `.env` files
- Use environment variables
- Rotate keys regularly

### CORS
- Whitelist specific origins
- No wildcard `*` in production

### Input Validation
- Pydantic schemas validate all inputs
- TypeScript types on frontend

## Known Issues & Solutions

### Issue 1: Pinecone Index Limit
- **Problem**: Free tier allows only 5 indexes
- **Solution**: Delete old indexes manually or upgrade

### Issue 2: Hydration Mismatch (Frontend)
- **Problem**: Browser extensions (Grammarly) inject HTML attributes
- **Solution**: `suppressHydrationWarning` on `<html>` and `<body>`
- **Impact**: Warning only, no functional issue

### Issue 3: Dependency Conflicts
- **Problem**: `openai` and `httpx` version conflicts
- **Solution**: Use `openai>=1.52.0,<2.0.0`, let pip resolve `httpx`

### Issue 4: Embedding Model Mismatch
- **Problem**: LangChain defaults to `text-embedding-ada-002`
- **Solution**: Explicitly set `model="text-embedding-3-small"`

## Monitoring & Debugging

### Logging
```python
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
```

### API Monitoring
- Swagger UI for manual testing
- cURL for automated testing
- Browser DevTools for frontend

### Common Debug Commands
```bash
# Check backend health
curl http://localhost:8000/health

# Test chat endpoint
curl -X POST http://localhost:8000/api/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "language": "vi"}'

# Check Pinecone index stats
# (in Python REPL)
from pinecone import Pinecone
pc = Pinecone(api_key="...")
index = pc.Index("vietnam-travel")
print(index.describe_index_stats())
```

## Future Technical Enhancements

### Backend
- PostgreSQL/MongoDB instead of JSON files
- Redis caching layer
- Background job queue (Celery)
- WebSocket for real-time chat

### Frontend
- Progressive Web App (PWA)
- Offline support
- Service workers for caching

### Infrastructure
- Kubernetes for orchestration
- Load balancing
- Auto-scaling
- CDN for static assets

