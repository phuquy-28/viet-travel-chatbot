"""
Destination discovery endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models.schemas import Destination
from services.destination_service import DestinationService
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/", response_model=List[Destination])
async def get_destinations(
    region: Optional[str] = Query(None, description="Filter by region: north, central, south"),
    type: Optional[str] = Query(None, description="Filter by type: beach, mountain, culture, city"),
    language: str = Query("vi", description="Language: vi or en")
):
    """
    Get list of destinations with optional filters
    """
    try:
        service = DestinationService()
        destinations = service.get_destinations(
            region=region,
            destination_type=type,
            language=language
        )
        return destinations
    except Exception as e:
        logger.error(f"Error getting destinations: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{destination_id}", response_model=Destination)
async def get_destination_detail(
    destination_id: str,
    language: str = Query("vi", description="Language: vi or en")
):
    """
    Get detailed information about a specific destination
    """
    try:
        service = DestinationService()
        destination = service.get_destination_by_id(destination_id, language)
        
        if not destination:
            raise HTTPException(status_code=404, detail="Destination not found")
            
        return destination
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting destination detail: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

