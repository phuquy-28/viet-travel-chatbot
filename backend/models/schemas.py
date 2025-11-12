"""
Pydantic schemas for request/response models
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime


class ChatMessage(BaseModel):
    """Single chat message"""
    role: Literal["user", "assistant", "system"]
    content: str
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    """Request for chat endpoint"""
    message: str = Field(..., min_length=1, max_length=2000)
    conversation_id: Optional[str] = None
    language: Literal["vi", "en"] = "vi"


class ChatResponse(BaseModel):
    """Response from chat endpoint"""
    message: str
    conversation_id: str
    follow_up_questions: List[str] = []
    sources: List[dict] = []
    links: List[dict] = []


class ConversationSummary(BaseModel):
    """Summary of a conversation"""
    conversation_id: str
    title: str
    last_message: str
    created_at: datetime
    updated_at: datetime
    message_count: int


class ConversationDetail(BaseModel):
    """Full conversation detail"""
    conversation_id: str
    title: str
    messages: List[ChatMessage]
    created_at: datetime
    updated_at: datetime
    language: str


class TTSRequest(BaseModel):
    """Request for text-to-speech"""
    text: str = Field(..., min_length=1, max_length=5000)
    language: Literal["vi", "en"] = "vi"


class Destination(BaseModel):
    """Destination information"""
    id: str
    name: str
    name_en: str
    region: Literal["north", "central", "south"]
    type: List[str]  # beach, mountain, culture, city, etc.
    description: str
    description_en: str
    image_url: str
    highlights: List[str]
    highlights_en: List[str]


class DestinationFilter(BaseModel):
    """Filters for destination discovery"""
    region: Optional[Literal["north", "central", "south"]] = None
    type: Optional[str] = None  # beach, mountain, culture, city
    language: Literal["vi", "en"] = "vi"

