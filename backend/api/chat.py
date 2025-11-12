"""
Chat endpoint for conversational interface
"""
from fastapi import APIRouter, HTTPException, Depends
from models.schemas import ChatRequest, ChatResponse
from services.rag_service import RAGService
from services.conversation_service import ConversationService
import logging
import uuid

router = APIRouter()
logger = logging.getLogger(__name__)


def get_rag_service():
    """Dependency to get RAG service"""
    return RAGService()


def get_conversation_service():
    """Dependency to get conversation service"""
    return ConversationService()


@router.post("/", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    rag_service: RAGService = Depends(get_rag_service),
    conv_service: ConversationService = Depends(get_conversation_service)
):
    """
    Main chat endpoint - handles user messages and returns AI responses
    """
    try:
        # Generate or use existing conversation ID
        conversation_id = request.conversation_id or str(uuid.uuid4())
        
        # Load conversation history
        history = conv_service.get_conversation_messages(conversation_id)
        
        # Generate response using RAG
        response = await rag_service.generate_response(
            query=request.message,
            history=history,
            language=request.language
        )
        
        # Save messages to conversation
        conv_service.add_message(
            conversation_id=conversation_id,
            role="user",
            content=request.message,
            language=request.language
        )
        
        conv_service.add_message(
            conversation_id=conversation_id,
            role="assistant",
            content=response["answer"],
            language=request.language
        )
        
        # Update conversation title if it's the first message
        if len(history) == 0:
            title = request.message[:50] + ("..." if len(request.message) > 50 else "")
            conv_service.update_conversation_title(conversation_id, title)
        
        return ChatResponse(
            message=response["answer"],
            conversation_id=conversation_id,
            follow_up_questions=response.get("follow_up_questions", []),
            sources=response.get("sources", []),
            links=response.get("links", [])
        )
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

