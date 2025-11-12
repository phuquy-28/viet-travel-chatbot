# System Patterns - Vietnam Travel Chatbot

## Architecture Overview

### High-Level Architecture
```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  Next.js        │◄───────►│  FastAPI        │◄───────►│  Pinecone       │
│  Frontend       │  HTTP   │  Backend        │  SDK    │  Vector Store   │
│  (Port 3000)    │  REST   │  (Port 8000)    │         │  (Cloud)        │
│                 │         │                 │         │                 │
└─────────────────┘         └────────┬────────┘         └─────────────────┘
                                     │
                          ┌──────────┼──────────┐
                          │          │          │
                          ▼          ▼          ▼
                    ┌──────────┐ ┌────────┐ ┌─────────┐
                    │  Azure   │ │ gTTS   │ │  JSON   │
                    │ OpenAI   │ │Service │ │  Files  │
                    └──────────┘ └────────┘ └─────────┘
```

## Backend Patterns

### 1. Service Layer Pattern
**Structure**: Controllers → Services → External APIs

```python
# API Layer (api/chat.py)
@router.post("/")
async def chat(request: ChatRequest):
    # Handle HTTP, validation
    rag_service = RAGService()
    response = await rag_service.generate_response(...)
    return ChatResponse(...)

# Service Layer (services/rag_service.py)
class RAGService:
    def __init__(self):
        self._setup_llm()
        self._setup_embeddings()
        self._setup_vector_store()
    
    async def generate_response(self, query, history, language):
        # Business logic here
```

**Benefits**:
- Separation of concerns
- Testability
- Reusability
- Clear dependencies

### 2. Dependency Injection
**Pattern**: FastAPI's `Depends()` for service injection

```python
def get_rag_service():
    return RAGService()

@router.post("/")
async def chat(
    request: ChatRequest,
    rag_service: RAGService = Depends(get_rag_service)
):
    # Service injected automatically
```

**Benefits**:
- Loose coupling
- Easy mocking for tests
- Lifecycle management

### 3. Pydantic for Data Validation
**Pattern**: Schema-first API design

```python
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    language: Literal["vi", "en"] = "vi"

class ChatResponse(BaseModel):
    message: str
    conversation_id: str
    follow_up_questions: List[str] = []
    sources: List[dict] = []
    links: List[dict] = []
```

**Benefits**:
- Automatic validation
- Type safety
- Auto-generated OpenAPI docs
- Clear contracts

### 4. Configuration Management
**Pattern**: Settings class with environment variables

```python
class Settings(BaseSettings):
    azure_openai_llm_api_key: str
    azure_openai_endpoint: str
    # ... more settings
    
    class Config:
        env_file = ".env"

settings = Settings()  # Singleton
```

**Benefits**:
- Centralized configuration
- Environment-specific settings
- Type-safe config access

### 5. RAG Pipeline Pattern
**Flow**: Query → Embed → Retrieve → Augment → Generate

```python
async def generate_response(self, query, history, language):
    # 1. Embed query
    query_vector = self.embeddings.embed_query(query)
    
    # 2. Retrieve from Pinecone
    docs = self.vector_store.similarity_search(query, k=5)
    
    # 3. Augment prompt with context
    context = "\n".join([doc.page_content for doc in docs])
    prompt = self._build_prompt(query, context, history, language)
    
    # 4. Generate response
    response = await self.llm.ainvoke(prompt)
    
    # 5. Extract and format
    return self._parse_response(response)
```

**Benefits**:
- Grounded responses (no hallucinations)
- Scalable knowledge base
- Context-aware generation

### 6. Filesystem Storage Pattern
**Structure**: JSON files for conversations

```
data/
├── conversations/
│   ├── {uuid-1}.json
│   ├── {uuid-2}.json
│   └── ...
└── audio/
    ├── {hash-1}.mp3
    ├── {hash-2}.mp3
    └── ...
```

**Benefits**:
- Simple, no database needed
- Human-readable
- Easy backup and migration
- Version control friendly

### 7. Function Calling Pattern
**Implementation**: LangChain tools

```python
@tool
def get_external_links(topic: str, location: str) -> List[dict]:
    """Get external links for a topic and location."""
    # Load from mock data
    # Return relevant links

tools = [get_external_links]
llm_with_tools = llm.bind_tools(tools)
```

**Benefits**:
- Extensible functionality
- LLM-driven tool selection
- Type-safe tool definitions

## Frontend Patterns

### 1. Component Composition
**Structure**: Atomic design principles

```
Pages
├── Home (page.tsx)
│   ├── Sidebar
│   └── ChatArea
│       ├── WelcomeScreen
│       └── ChatMessage (multiple)
│           └── TTS Button
└── Destinations (destinations/page.tsx)
    └── DestinationCard (multiple)
```

**Benefits**:
- Reusable components
- Clear hierarchy
- Maintainable code

### 2. Context API for State
**Pattern**: Global language state

```typescript
// contexts/language-context.tsx
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState<Language>("vi")
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

// Usage in any component
const { language, t } = useLanguage()
```

**Benefits**:
- Avoid prop drilling
- Centralized state
- Type-safe context

### 3. API Client Abstraction
**Pattern**: Typed HTTP client

```typescript
// lib/api-client.ts
export const apiClient = {
  sendMessage: async (data: ChatRequest): Promise<ChatResponse> => {
    const response = await fetch(`${API_URL}/api/chat/`, {
      method: "POST",
      body: JSON.stringify(data),
    })
    return response.json()
  },
  // ... more methods
}
```

**Benefits**:
- Centralized API logic
- Type safety
- Easy mocking for tests
- DRY principle

### 4. Controlled Components
**Pattern**: React state for form inputs

```typescript
const [input, setInput] = useState("")
const [messages, setMessages] = useState<Message[]>([])

<input
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyPress={(e) => e.key === "Enter" && handleSend()}
/>
```

**Benefits**:
- Predictable state
- Easy validation
- Single source of truth

### 5. Effect Hooks for Side Effects
**Pattern**: useEffect for data fetching and subscriptions

```typescript
useEffect(() => {
  if (conversationId) {
    loadConversation(conversationId)
  } else if (!conversationId && currentConversationId) {
    // Reset to new chat
    setMessages([])
    setCurrentConversationId(undefined)
  }
}, [conversationId])
```

**Benefits**:
- Declarative side effects
- Automatic cleanup
- Dependency tracking

### 6. Loading and Error States
**Pattern**: Explicit state management for async operations

```typescript
const [isLoading, setIsLoading] = useState(false)

try {
  setIsLoading(true)
  const response = await apiClient.sendMessage(...)
  setMessages(prev => [...prev, response])
} catch (error) {
  console.error(error)
  // Show error message to user
} finally {
  setIsLoading(false)
}
```

**Benefits**:
- Better UX
- Error handling
- Loading indicators

## Design Patterns

### 1. Repository Pattern (Implied)
- `ConversationService` acts as repository for conversations
- Abstracts storage implementation
- Could swap JSON for database without changing API

### 2. Strategy Pattern
- Language-specific prompts selected at runtime
- Different TTS voices based on language
- Flexible, extensible

### 3. Factory Pattern
- Service instantiation in dependency injection
- Component creation in React

### 4. Observer Pattern
- React's state updates trigger re-renders
- useEffect observes state changes

### 5. Singleton Pattern
- Settings instance
- Service instances (with FastAPI Depends)

## Integration Patterns

### 1. REST API
- Stateless HTTP endpoints
- JSON request/response
- Standard HTTP methods and status codes

### 2. CORS Configuration
- Backend allows specific origins
- Handles preflight requests
- Secure cross-origin communication

### 3. Environment-based Configuration
- `.env` for backend
- `.env.local` for frontend
- `NEXT_PUBLIC_` prefix for client-side access

## Error Handling Patterns

### Backend
```python
try:
    # Operation
except SpecificException as e:
    logger.error(f"Error: {str(e)}")
    raise HTTPException(status_code=500, detail=str(e))
```

### Frontend
```typescript
try {
  // API call
} catch (error) {
  console.error(error)
  setMessages(prev => [...prev, errorMessage])
}
```

## Logging Patterns

```python
import logging
logger = logging.getLogger(__name__)

logger.info("Operation successful")
logger.warning("Potential issue")
logger.error("Error occurred", exc_info=True)
```

## Security Patterns

### 1. API Key Management
- Never commit `.env` files
- Use environment variables
- Separate keys for LLM and Embeddings

### 2. Input Validation
- Pydantic schemas on backend
- TypeScript types on frontend
- Sanitize user input

### 3. CORS Restrictions
- Whitelist specific origins
- No wildcard in production

## Performance Patterns

### 1. Caching
- TTS audio files cached by MD5 hash
- Pinecone results cached in memory (potential)

### 2. Async/Await
- Non-blocking I/O operations
- Concurrent request handling

### 3. Lazy Loading
- Components loaded on demand
- Images optimized with Next.js

## Testing Patterns (Implied Structure)

### Backend
```python
def test_chat_endpoint():
    response = client.post("/api/chat/", json={...})
    assert response.status_code == 200
```

### Frontend
```typescript
test('renders welcome screen', () => {
  render(<WelcomeScreen />)
  expect(screen.getByText(/welcome/i)).toBeInTheDocument()
})
```

## Key Architectural Decisions

### 1. Separate API Keys for LLM and Embeddings
**Decision**: Use two different Azure OpenAI API keys
**Reason**: Different models may have different access permissions
**Impact**: More configuration, but more flexible

### 2. Filesystem Storage Instead of Database
**Decision**: Use JSON files for conversations
**Reason**: Simplicity, no database overhead for demo
**Impact**: Easy development, but not scalable for production

### 3. Client-side Filtering for Destinations
**Decision**: Filter destinations in frontend
**Reason**: Small dataset, better performance
**Impact**: Fast filtering, but limited scalability

### 4. Manual Pinecone Upserting
**Decision**: Generate embeddings manually and upsert directly
**Reason**: Issues with langchain-pinecone wrapper
**Impact**: More control, but more code

### 5. gTTS for Text-to-Speech
**Decision**: Use free Google TTS
**Reason**: Cost-effective, good quality
**Impact**: Unlimited usage, natural voices

