# Project Brief - Vietnam Travel Chatbot

## Project Overview
An intelligent AI-powered chatbot system for Vietnam travel consulting, using RAG (Retrieval-Augmented Generation) technology to provide accurate, context-aware travel advice.

## Core Objectives
1. Build a full-stack travel advisory chatbot system
2. Implement RAG using Langchain, Pinecone, and Azure OpenAI
3. Provide intelligent Q&A about Vietnam tourism
4. Support trip planning and itinerary creation
5. Enable multi-language support (Vietnamese and English)
6. Deliver seamless conversation management
7. Integrate Text-to-Speech functionality

## Technical Foundation
- **Backend**: FastAPI with Python 3.10+
- **Frontend**: Next.js 16 with TypeScript
- **AI/ML**: Azure OpenAI (GPT-4o-mini for LLM, text-embedding-3-small for embeddings)
- **Vector Store**: Pinecone (serverless)
- **RAG Framework**: Langchain
- **TTS**: Google Text-to-Speech (gTTS)
- **Storage**: Filesystem-based JSON for conversations

## Key Requirements (from SRS v2.0)

### Functional Requirements
- **FR1**: Multi-language support (Vietnamese/English)
- **FR2**: Q&A using RAG with Pinecone vector store
- **FR3**: Trip planning assistance
- **FR4**: External link integration via Function Calling
- **FR5**: Conversation management (save, load, context, follow-ups)
- **FR6**: Text-to-Speech with audio playback
- **FR7**: Modern Next.js UI
- **FR8**: Destination Discovery feature with visual filtering

### Non-Functional Requirements
- **NFR1**: Performance - Response time < 5 seconds
- **NFR2**: Usability - Responsive, intuitive interface
- **NFR3**: Reliability - Robust error handling
- **NFR4**: Language Quality - Natural TTS voices
- **NFR5**: Architecture - Stateless, scalable API design

## Success Criteria
- All functional requirements implemented and working
- Complete mock data covering 12+ Vietnam destinations
- Full API documentation with Swagger UI
- Responsive frontend with excellent UX
- Production-ready deployment configuration
- Comprehensive documentation for developers

## Constraints
- Free tier limitations for Pinecone (5 indexes max)
- Azure OpenAI rate limits and quotas
- Separate API keys for LLM and Embedding models
- Same Azure OpenAI endpoint for both models

## Deliverables
1. Working backend API with 9+ endpoints
2. Modern frontend with chat and destination discovery
3. RAG system with Pinecone integration
4. Complete documentation (setup guides, README files)
5. Mock data for testing and demo
6. Pinecone setup script
7. Environment configuration templates

## Timeline
- Initial development: ~6-8 hours
- Status: **100% Complete**
- All requirements met according to SRS v2.0

