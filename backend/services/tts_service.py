"""
Text-to-Speech service using Google TTS (gTTS)
"""
from gtts import gTTS
from pathlib import Path
import hashlib
from config import settings
import logging

logger = logging.getLogger(__name__)


class TTSService:
    """Text-to-Speech service"""
    
    def __init__(self):
        self.audio_dir = Path(settings.audio_dir)
        self.audio_dir.mkdir(parents=True, exist_ok=True)
    
    def generate_speech(self, text: str, language: str = "vi") -> str:
        """
        Generate speech from text and return file path
        
        Args:
            text: Text to convert to speech
            language: Language code (vi or en)
        
        Returns:
            Path to generated audio file
        """
        try:
            # Create filename based on text hash (for caching)
            text_hash = hashlib.md5(f"{text}_{language}".encode()).hexdigest()
            audio_file = self.audio_dir / f"{text_hash}.mp3"
            
            # Return cached file if exists
            if audio_file.exists():
                logger.info(f"Using cached audio file: {audio_file}")
                return str(audio_file)
            
            # Generate speech
            logger.info(f"Generating speech for text length: {len(text)}")
            
            # Map language codes
            lang_code = "vi" if language == "vi" else "en"
            
            tts = gTTS(text=text, lang=lang_code, slow=False)
            tts.save(str(audio_file))
            
            logger.info(f"Speech generated successfully: {audio_file}")
            return str(audio_file)
            
        except Exception as e:
            logger.error(f"Error generating speech: {str(e)}", exc_info=True)
            raise

