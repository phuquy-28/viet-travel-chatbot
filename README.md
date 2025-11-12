# Vietnam Travel Chatbot - AI Travel Advisory System

![Vietnam Travel](https://img.shields.io/badge/Version-2.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

An intelligent chatbot system using RAG (Retrieval-Augmented Generation) for Vietnam travel consulting, built with Langchain, Pinecone, Azure OpenAI, and Next.js.

## 🎯 Key Features

### 1. Intelligent Q&A
- Answer questions about tourist destinations, culture, and cuisine
- Use RAG to provide accurate information from knowledge base
- Support context from conversation history

### 2. Trip Planning
- Create customized travel itineraries
- Suggest suitable locations and activities
- Customize based on time and budget

### 3. Function Calling - External Links
- Automatically provide useful links (Google Maps, blogs, videos)
- Suggest relevant external resources
- Social media integration

### 4. Text-to-Speech (TTS)
- Convert text to speech
- Support Vietnamese and English
- Audio player in UI

### 5. Conversation Management
- Store conversation history
- Load and continue previous conversations
- Auto-generate conversation titles

### 6. Destination Discovery
- Visual interface to browse destinations
- Filter by region and type
- Card-based layout with images

### 7. Multi-language Support
- Support Vietnamese and English
- Language toggle in UI
- Responses in selected language

## 🏗️ Architecture

```
┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│             │          │             │          │             │
│   Next.js   │◄────────►│   FastAPI   │◄────────►│  Pinecone   │
│  Frontend   │   REST   │   Backend   │          │Vector Store │
│             │   API    │             │          │             │
└─────────────┘          └─────────────┘          └─────────────┘
                                │
                                │
                     ┌──────────┼──────────┐
                     │          │          │
                     ▼          ▼          ▼
              ┌──────────┐ ┌────────┐ ┌────────┐
              │  Azure   │ │ gTTS   │ │  JSON  │
              │ OpenAI   │ │Service │ │  DB    │
              └──────────┘ └────────┘ └────────┘
```

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- Azure OpenAI account
- Pinecone account

### 1. Clone Repository

```bash
git clone <repository-url>
cd viet-travel-chatbot
```

### 2. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Setup Pinecone and load data
python scripts/setup_pinecone.py

# Run server
python main.py
```

Backend will run at: `http://localhost:8000`

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
# Create .env.local file:
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run development server
npm run dev
```

Frontend will run at: `http://localhost:3000`

### 4. Access Application

Open browser and navigate to: `http://localhost:3000`

## 📚 Documentation

Detailed documentation for each component:

- [Backend Documentation](backend/README.md) - FastAPI, RAG, Services
- [Frontend Documentation](frontend/README.md) - Next.js, Components, UI
- [API Documentation](http://localhost:8000/docs) - Swagger UI (when backend is running)

## 🔧 Configuration

### Backend Environment Variables

```env
# Azure OpenAI - LLM
AZURE_OPENAI_LLM_API_KEY=your_llm_key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o-mini
AZURE_OPENAI_API_VERSION=2024-07-01-preview

# Azure OpenAI - Embeddings
AZURE_OPENAI_EMBEDDING_API_KEY=your_embedding_key
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-3-small

# Pinecone
PINECONE_API_KEY=your_key
PINECONE_INDEX_NAME=vietnam-travel

# Application
DEBUG=True
CORS_ORIGINS=http://localhost:3000
```

### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📊 Tech Stack

### Backend
- **FastAPI** - Web framework
- **Langchain** - RAG orchestration
- **Pinecone** - Vector database
- **Azure OpenAI** - LLM & Embeddings
- **gTTS** - Text-to-Speech
- **Python 3.10+**

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Components
- **React Markdown** - Markdown rendering

## 🧪 Testing

### Test Backend

```bash
cd backend

# Test health endpoint
curl http://localhost:8000/health

# Test chat endpoint
curl -X POST http://localhost:8000/api/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message": "Gợi ý địa điểm ở Hà Nội", "language": "vi"}'
```

### Test Frontend

```bash
cd frontend
npm run lint
npm run build
```

## 📝 Test Cases (based on SRS)

### TC1: Vietnamese Q&A
```
User: "What are good hotels in Sa Pa?"
Expected: Bot responds with hotel information from knowledge base
```

### TC2: Trip Planning
```
User: "Plan a 2-day itinerary in Hoi An"
Expected: Bot creates basic itinerary with daily activities
```

### TC3: Function Calling - Links
```
User: "Recommend good pho restaurants in Hanoi"
Expected: Bot responds + provides Google Maps links
```

### TC4: Conversation History
```
User: "What can I do there?" (after TC3)
Expected: Bot understands "there" refers to "Hanoi" from context
```

### TC5: Text-to-Speech
```
Action: Click "Listen" button on message
Expected: Plays audio in Vietnamese voice
```

### TC6: Load Conversation
```
Action: Close tab, reopen, click conversation in sidebar
Expected: Loads conversation content
```

### TC7: Destination Discovery
```
Action: Click "Explore Destinations", filter by "Beach"
Expected: Displays beach destinations
```

## 🚢 Deployment

### Backend Deployment

Recommended: Railway, Render, or AWS

```bash
# Build Docker image
docker build -t vietnam-travel-backend ./backend
docker run -p 8000:8000 vietnam-travel-backend
```

### Frontend Deployment

Recommended: Vercel

```bash
cd frontend
npm install -g vercel
vercel
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Azure OpenAI for LLM capabilities
- Pinecone for vector database
- Langchain for RAG framework
- Next.js team for amazing framework
- Vietnam Tourism Board for inspiration

## 📞 Support

If you encounter issues:
1. Check [Issues](../../issues) page
2. Review documentation in `backend/README.md` and `frontend/README.md`
3. Create new issue with detailed description

---

Made with ❤️ for Vietnam Tourism

