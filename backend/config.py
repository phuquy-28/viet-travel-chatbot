"""
Configuration settings for the Vietnam Travel Chatbot backend
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Azure OpenAI - LLM
    azure_openai_llm_api_key: str
    azure_openai_endpoint: str
    azure_openai_deployment_name: str = "gpt-4o-mini"
    azure_openai_api_version: str = "2024-07-01-preview"
    
    # Azure OpenAI - Embeddings
    azure_openai_embedding_api_key: str
    azure_openai_embedding_deployment: str = "text-embedding-3-small"
    
    # Pinecone
    pinecone_api_key: str
    pinecone_environment: str = "gcp-starter"
    pinecone_index_name: str = "vietnam-travel"
    
    # Application
    debug: bool = True
    cors_origins: str = "http://localhost:3000,http://localhost:3001"
    
    # Data directories
    conversations_dir: str = "data/conversations"
    audio_dir: str = "data/audio"
    mock_data_dir: str = "data/mock"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins as list"""
        return [origin.strip() for origin in self.cors_origins.split(",")]


# Global settings instance
settings = Settings()

