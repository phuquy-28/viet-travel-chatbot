"""
Service for managing conversation history (filesystem-based)
"""
import json
import uuid
from pathlib import Path
from datetime import datetime
from typing import List, Optional, Dict
from config import settings
from models.schemas import ChatMessage, ConversationSummary, ConversationDetail
import logging

logger = logging.getLogger(__name__)


class ConversationService:
    """Manages conversation storage and retrieval using JSON files"""
    
    def __init__(self):
        self.conversations_dir = Path(settings.conversations_dir)
        self.conversations_dir.mkdir(parents=True, exist_ok=True)
    
    def _get_conversation_path(self, conversation_id: str) -> Path:
        """Get file path for a conversation"""
        return self.conversations_dir / f"{conversation_id}.json"
    
    def create_conversation(self, language: str = "vi") -> str:
        """Create a new conversation and return its ID"""
        conversation_id = str(uuid.uuid4())
        now = datetime.utcnow()
        
        conversation_data = {
            "conversation_id": conversation_id,
            "title": "New Conversation",
            "messages": [],
            "created_at": now.isoformat(),
            "updated_at": now.isoformat(),
            "language": language
        }
        
        file_path = self._get_conversation_path(conversation_id)
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(conversation_data, f, ensure_ascii=False, indent=2)
        
        logger.info(f"Created new conversation: {conversation_id}")
        return conversation_id
    
    def get_conversation(self, conversation_id: str) -> Optional[ConversationDetail]:
        """Get full conversation detail"""
        file_path = self._get_conversation_path(conversation_id)
        
        if not file_path.exists():
            return None
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Convert messages to ChatMessage objects
            messages = [
                ChatMessage(
                    role=msg["role"],
                    content=msg["content"],
                    timestamp=datetime.fromisoformat(msg["timestamp"]) if "timestamp" in msg else None
                )
                for msg in data.get("messages", [])
            ]
            
            return ConversationDetail(
                conversation_id=data["conversation_id"],
                title=data.get("title", "Untitled"),
                messages=messages,
                created_at=datetime.fromisoformat(data["created_at"]),
                updated_at=datetime.fromisoformat(data["updated_at"]),
                language=data.get("language", "vi")
            )
        except Exception as e:
            logger.error(f"Error loading conversation {conversation_id}: {str(e)}")
            return None
    
    def get_conversation_messages(self, conversation_id: str) -> List[Dict[str, str]]:
        """Get conversation messages as list of dicts for RAG context"""
        conversation = self.get_conversation(conversation_id)
        
        if not conversation:
            return []
        
        return [
            {"role": msg.role, "content": msg.content}
            for msg in conversation.messages
        ]
    
    def list_conversations(self, limit: int = 50) -> List[ConversationSummary]:
        """List all conversations (sorted by updated_at, most recent first)"""
        conversations = []
        
        for file_path in self.conversations_dir.glob("*.json"):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                
                messages = data.get("messages", [])
                last_message = messages[-1]["content"] if messages else ""
                
                conversations.append(
                    ConversationSummary(
                        conversation_id=data["conversation_id"],
                        title=data.get("title", "Untitled"),
                        last_message=last_message[:100],
                        created_at=datetime.fromisoformat(data["created_at"]),
                        updated_at=datetime.fromisoformat(data["updated_at"]),
                        message_count=len(messages)
                    )
                )
            except Exception as e:
                logger.error(f"Error loading conversation from {file_path}: {str(e)}")
                continue
        
        # Sort by updated_at (most recent first)
        conversations.sort(key=lambda x: x.updated_at, reverse=True)
        
        return conversations[:limit]
    
    def add_message(
        self,
        conversation_id: str,
        role: str,
        content: str,
        language: str = "vi"
    ):
        """Add a message to a conversation"""
        file_path = self._get_conversation_path(conversation_id)
        
        # Create conversation if it doesn't exist
        if not file_path.exists():
            now = datetime.utcnow()
            conversation_data = {
                "conversation_id": conversation_id,
                "title": "New Conversation",
                "messages": [],
                "created_at": now.isoformat(),
                "updated_at": now.isoformat(),
                "language": language
            }
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(conversation_data, f, ensure_ascii=False, indent=2)
            logger.info(f"Created new conversation: {conversation_id}")
        
        # Load existing conversation
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Add new message
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow().isoformat()
        }
        data["messages"].append(message)
        data["updated_at"] = datetime.utcnow().isoformat()
        
        # Save updated conversation
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        logger.info(f"Added message to conversation {conversation_id}")
    
    def update_conversation_title(self, conversation_id: str, title: str):
        """Update conversation title"""
        file_path = self._get_conversation_path(conversation_id)
        
        if not file_path.exists():
            return
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        data["title"] = title
        data["updated_at"] = datetime.utcnow().isoformat()
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def delete_conversation(self, conversation_id: str) -> bool:
        """Delete a conversation"""
        file_path = self._get_conversation_path(conversation_id)
        
        if not file_path.exists():
            return False
        
        file_path.unlink()
        logger.info(f"Deleted conversation {conversation_id}")
        return True

