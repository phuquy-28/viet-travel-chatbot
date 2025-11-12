"""
Conversation management endpoints
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models.schemas import ConversationSummary, ConversationDetail
from services.conversation_service import ConversationService
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


def get_conversation_service():
    """Dependency to get conversation service"""
    return ConversationService()


@router.get("/", response_model=List[ConversationSummary])
async def list_conversations(
    conv_service: ConversationService = Depends(get_conversation_service)
):
    """
    Get list of all conversations (for sidebar)
    """
    try:
        conversations = conv_service.list_conversations()
        return conversations
    except Exception as e:
        logger.error(f"Error listing conversations: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{conversation_id}", response_model=ConversationDetail)
async def get_conversation(
    conversation_id: str,
    conv_service: ConversationService = Depends(get_conversation_service)
):
    """
    Get full conversation detail by ID
    """
    try:
        conversation = conv_service.get_conversation(conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return conversation
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting conversation: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    conv_service: ConversationService = Depends(get_conversation_service)
):
    """
    Delete a conversation
    """
    try:
        success = conv_service.delete_conversation(conversation_id)
        if not success:
            raise HTTPException(status_code=404, detail="Conversation not found")
        return {"message": "Conversation deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting conversation: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/new")
async def create_new_conversation(
    conv_service: ConversationService = Depends(get_conversation_service)
):
    """
    Create a new conversation and return its ID
    """
    try:
        conversation_id = conv_service.create_conversation()
        return {"conversation_id": conversation_id}
    except Exception as e:
        logger.error(f"Error creating conversation: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

