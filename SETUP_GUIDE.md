# 🚀 Vietnam Travel Chatbot Setup Guide

Detailed step-by-step instructions to run the application.

## 📋 System Requirements

- **Python 3.10+**
- **Node.js 18+**
- **npm or yarn**
- **Git**

## 🔑 Required API Keys

Before starting, you need:

1. **Azure OpenAI API Keys** (2 separate keys)
   - Sign up at: https://azure.microsoft.com/en-us/products/ai-services/openai-service
   - **LLM API Key** - Deployment: `gpt-4o-mini`
   - **Embedding API Key** - Deployment: `text-embedding-3-small`
   - Same endpoint but different API keys

2. **Pinecone API Key**
   - Sign up at: https://www.pinecone.io/
   - Free tier is sufficient for demo

---

## 🛠️ Backend Setup (10 minutes)

### Step 1: Navigate to backend directory

```bash
cd backend
```

### Step 2: Create Python virtual environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install dependencies

```bash
pip install -r requirements.txt
```

> ⏱️ May take 2-3 minutes

### Step 4: Configure environment variables

Create `.env` file from template:

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Open `.env` file and fill in information:

```env
# Azure OpenAI - LLM (REQUIRED)
# API key for gpt-4o-mini model
AZURE_OPENAI_LLM_API_KEY=your_llm_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o-mini
AZURE_OPENAI_API_VERSION=2024-07-01-preview

# Azure OpenAI - Embeddings (REQUIRED)
# API key for text-embedding-3-small model
AZURE_OPENAI_EMBEDDING_API_KEY=your_embedding_api_key_here
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-3-small

# Pinecone (REQUIRED)
PINECONE_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
PINECONE_ENVIRONMENT=gcp-starter
PINECONE_INDEX_NAME=vietnam-travel

# Application Settings
DEBUG=True
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Step 5: Setup Pinecone Vector Store

Run script to create index and load data:

```bash
python scripts/setup_pinecone.py
```

**Expected Output:**
```
INFO: Starting Pinecone setup...
INFO: Creating Pinecone index: vietnam-travel
INFO: Index vietnam-travel created successfully
INFO: Loading mock data...
INFO: Loaded Vietnamese content: 12450 characters
INFO: Loaded English content: 9876 characters
INFO: Splitting documents...
INFO: Split into 85 chunks
INFO: Uploading chunks to Pinecone...
INFO: Successfully uploaded 85 chunks to Pinecone
INFO: Pinecone setup completed successfully!
```

> ⏱️ May take 2-5 minutes depending on internet connection

### Step 6: Run Backend Server

```bash
python main.py
```

**Expected Output:**
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

✅ Backend running at: `http://localhost:8000`

**Test backend:**
```bash
# Test health endpoint
curl http://localhost:8000/health
# Expected: {"status":"healthy","debug":true}
```

---

## 💻 Frontend Setup (5 minutes)

### Step 1: Open new terminal and navigate to frontend

```bash
cd frontend
```

### Step 2: Install dependencies

```bash
npm install
```

> ⏱️ May take 1-2 minutes

### Step 3: Configure environment

Create `.env.local` file:

```bash
# Windows
echo NEXT_PUBLIC_API_URL=http://localhost:8000 > .env.local

# Mac/Linux
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

### Step 4: Run Frontend Development Server

```bash
npm run dev
```

**Expected Output:**
```
   ▲ Next.js 16.0.0
   - Local:        http://localhost:3000
   - Environments: .env.local

 ✓ Ready in 2.3s
```

✅ Frontend running at: `http://localhost:3000`

---

## 🎉 Access Application

Open browser and navigate to:

```
http://localhost:3000
```

You will see the chatbot interface with:
- Welcome screen with suggestions
- Sidebar with "New Conversation"
- Language toggle (Vi/EN)

---

## 🧪 Test Features

### Test 1: Basic Chat

1. Enter: "Suggest tourist spots in Hanoi"
2. Wait for AI response
3. Check if follow-up questions appear
4. Click "Listen" button to test TTS

### Test 2: Conversation History

1. Send several messages
2. Reload page
3. Check if new conversation appears in sidebar
4. Click on conversation to reload

### Test 3: Destination Discovery

1. Click "Explore Destinations" in sidebar
2. Test filters (Region, Type)
3. View destination cards

### Test 4: Multi-language

1. Toggle to "EN" in sidebar
2. Send English message
3. Check English response

---

## ❌ Troubleshooting

### Backend won't start

**Error: Module not found**
```bash
pip install -r requirements.txt --force-reinstall
```

**Error: Pinecone connection failed**
- Check API key in `.env`
- Check internet connection
- Verify API key at https://app.pinecone.io/

**Error: Azure OpenAI authentication failed**
- Check API key and endpoint
- Verify deployment names
- Check quota limits in Azure portal

### Frontend can't connect to Backend

**Error: Failed to fetch**
- Check backend is running (`http://localhost:8000/health`)
- Verify `.env.local` has correct URL
- Check CORS settings in backend

### No response from Chat

1. Check browser console (F12) for errors
2. Check backend logs
3. Verify Pinecone has data:
   ```bash
   python scripts/setup_pinecone.py
   ```

---

## 📝 Tips

### Run both services simultaneously

**Windows (PowerShell):**
```powershell
# Terminal 1
cd backend
venv\Scripts\activate
python main.py

# Terminal 2
cd frontend
npm run dev
```

**Mac/Linux:**
```bash
# Terminal 1
cd backend && source venv/bin/activate && python main.py

# Terminal 2
cd frontend && npm run dev
```

### Stop services

- Backend: Press `Ctrl+C` in terminal
- Frontend: Press `Ctrl+C` in terminal

### Clear cache and restart

**Backend:**
```bash
rm -rf __pycache__
rm -rf data/conversations/*
rm -rf data/audio/*
python main.py
```

**Frontend:**
```bash
rm -rf .next
npm run dev
```

---

## 📚 Next Steps

After the app runs successfully:

1. ✅ Read [README.md](README.md) to understand architecture
2. ✅ Read [backend/README.md](backend/README.md) for backend details
3. ✅ Read [frontend/README.md](frontend/README.md) for frontend details
4. ✅ View API docs at `http://localhost:8000/docs`
5. ✅ Try test cases from SRS

---

## 🆘 Support

If you encounter issues:

1. Check Troubleshooting section above
2. Check logs in terminal
3. Search in Issues
4. Create new Issue with:
   - Error message
   - Steps to reproduce
   - Environment info (OS, Python version, Node version)

---

**Good luck! 🎊**

Made with ❤️ for Vietnam Tourism

