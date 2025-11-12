"""
Text-to-Speech endpoint
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from models.schemas import TTSRequest
from services.tts_service import TTSService
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


def get_tts_service():
    """Dependency to get TTS service"""
    return TTSService()


@router.post("/")
async def text_to_speech(
    request: TTSRequest,
    tts_service: TTSService = Depends(get_tts_service)
):
    """
    Convert text to speech and return audio file
    """
    try:
        audio_file = tts_service.generate_speech(
            text=request.text,
            language=request.language
        )
        
        return FileResponse(
            audio_file,
            media_type="audio/mpeg",
            filename="speech.mp3"
        )
        
    except Exception as e:
        logger.error(f"Error generating speech: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error generating speech: {str(e)}")

