"""
Text-to-Speech service using Google TTS (gTTS)
"""
from gtts import gTTS
from pathlib import Path
import hashlib
import re
from config import settings
import logging

logger = logging.getLogger(__name__)


class TTSService:
    """Text-to-Speech service"""
    
    def __init__(self):
        self.audio_dir = Path(settings.audio_dir)
        self.audio_dir.mkdir(parents=True, exist_ok=True)
    
    def _strip_markdown(self, text: str) -> str:
        """
        Remove markdown formatting from text for better TTS output
        
        Args:
            text: Text with markdown formatting
            
        Returns:
            Plain text without markdown
        """
        # Remove code blocks (``` ... ```)
        text = re.sub(r'```[\s\S]*?```', '', text)
        
        # Remove inline code (`code`)
        text = re.sub(r'`([^`]+)`', r'\1', text)
        
        # Remove images (![alt](url))
        text = re.sub(r'!\[([^\]]*)\]\([^\)]+\)', r'\1', text)
        
        # Remove links but keep text ([text](url))
        text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
        
        # Remove bold (**text** or __text__)
        text = re.sub(r'\*\*([^\*]+)\*\*', r'\1', text)
        text = re.sub(r'__([^_]+)__', r'\1', text)
        
        # Remove italic (*text* or _text_)
        text = re.sub(r'\*([^\*]+)\*', r'\1', text)
        text = re.sub(r'_([^_]+)_', r'\1', text)
        
        # Remove strikethrough (~~text~~)
        text = re.sub(r'~~([^~]+)~~', r'\1', text)
        
        # Remove headers (# ## ### etc)
        text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
        
        # Remove horizontal rules (--- or *** or ___)
        text = re.sub(r'^[\-\*_]{3,}\s*$', '', text, flags=re.MULTILINE)
        
        # Remove blockquotes (> text)
        text = re.sub(r'^>\s+', '', text, flags=re.MULTILINE)
        
        # Remove list markers (- * + or 1. 2. etc)
        text = re.sub(r'^[\-\*\+]\s+', '', text, flags=re.MULTILINE)
        text = re.sub(r'^\d+\.\s+', '', text, flags=re.MULTILINE)
        
        # Remove HTML tags (if any)
        text = re.sub(r'<[^>]+>', '', text)
        
        # Clean up extra whitespace
        text = re.sub(r'\n{3,}', '\n\n', text)  # Max 2 consecutive newlines
        text = re.sub(r' {2,}', ' ', text)  # Remove multiple spaces
        text = text.strip()
        
        return text
    
    def generate_speech(self, text: str, language: str = "vi") -> str:
        """
        Generate speech from text and return file path
        
        Args:
            text: Text to convert to speech (may contain markdown)
            language: Language code (vi or en)
        
        Returns:
            Path to generated audio file
        """
        try:
            # Strip markdown formatting from text
            clean_text = self._strip_markdown(text)
            
            if not clean_text:
                logger.warning("Text is empty after markdown stripping")
                clean_text = "No content available"
            
            # Create filename based on text hash (for caching)
            text_hash = hashlib.md5(f"{clean_text}_{language}".encode()).hexdigest()
            audio_file = self.audio_dir / f"{text_hash}.mp3"
            
            # Return cached file if exists
            if audio_file.exists():
                logger.info(f"Using cached audio file: {audio_file}")
                return str(audio_file)
            
            # Generate speech
            logger.info(f"Generating speech for text length: {len(clean_text)} (original: {len(text)})")
            
            # Map language codes
            lang_code = "vi" if language == "vi" else "en"
            
            tts = gTTS(text=clean_text, lang=lang_code, slow=False)
            tts.save(str(audio_file))
            
            logger.info(f"Speech generated successfully: {audio_file}")
            return str(audio_file)
            
        except Exception as e:
            logger.error(f"Error generating speech: {str(e)}", exc_info=True)
            raise

