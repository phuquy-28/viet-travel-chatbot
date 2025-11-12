"""
Service for destination discovery
"""
import json
from pathlib import Path
from typing import List, Optional
from config import settings
from models.schemas import Destination
import logging

logger = logging.getLogger(__name__)


class DestinationService:
    """Manages destination data for discovery feature"""
    
    def __init__(self):
        self.mock_data_dir = Path(settings.mock_data_dir)
        self.destinations_file = self.mock_data_dir / "destinations.json"
        self._ensure_mock_data()
    
    def _ensure_mock_data(self):
        """Ensure mock destinations data exists"""
        if not self.destinations_file.exists():
            logger.warning("Destinations mock data not found, using empty list")
    
    def get_destinations(
        self,
        region: Optional[str] = None,
        destination_type: Optional[str] = None,
        language: str = "vi"
    ) -> List[Destination]:
        """
        Get list of destinations with optional filters
        
        Args:
            region: Filter by region (north, central, south)
            destination_type: Filter by type (beach, mountain, culture, city)
            language: Language for response
        
        Returns:
            List of destinations
        """
        try:
            if not self.destinations_file.exists():
                return []
            
            with open(self.destinations_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            destinations = []
            for item in data:
                # Apply filters
                if region and item.get("region") != region:
                    continue
                
                if destination_type and destination_type not in item.get("type", []):
                    continue
                
                destinations.append(Destination(**item))
            
            return destinations
            
        except Exception as e:
            logger.error(f"Error loading destinations: {str(e)}", exc_info=True)
            return []
    
    def get_destination_by_id(
        self,
        destination_id: str,
        language: str = "vi"
    ) -> Optional[Destination]:
        """Get destination by ID"""
        try:
            if not self.destinations_file.exists():
                return None
            
            with open(self.destinations_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            for item in data:
                if item.get("id") == destination_id:
                    return Destination(**item)
            
            return None
            
        except Exception as e:
            logger.error(f"Error loading destination: {str(e)}", exc_info=True)
            return None

