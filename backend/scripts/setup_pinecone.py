"""
Script to setup Pinecone index and load mock data
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from pinecone import Pinecone, ServerlessSpec
from langchain_openai import AzureOpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_pinecone import PineconeVectorStore
from langchain.schema import Document
from config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_index_if_not_exists():
    """Create Pinecone index if it doesn't exist"""
    try:
        pc = Pinecone(api_key=settings.pinecone_api_key)
        
        index_name = settings.pinecone_index_name
        existing_indexes = [index.name for index in pc.list_indexes()]
        
        if index_name not in existing_indexes:
            logger.info(f"Creating Pinecone index: {index_name}")
            # Note: text-embedding-3-small has dimension 1536
            pc.create_index(
                name=index_name,
                dimension=1536,  # Azure OpenAI text-embedding-3-small dimension
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="aws",
                    region="us-east-1"
                )
            )
            logger.info(f"Index {index_name} created successfully")
        else:
            logger.info(f"Index {index_name} already exists")
            
    except Exception as e:
        logger.error(f"Error creating index: {str(e)}")
        raise


def load_mock_data():
    """Load and split mock travel data"""
    mock_data_dir = Path(settings.mock_data_dir)
    
    documents = []
    
    # Load Vietnamese content
    vi_file = mock_data_dir / "travel_content_vi.txt"
    if vi_file.exists():
        with open(vi_file, 'r', encoding='utf-8') as f:
            content = f.read()
            documents.append(Document(
                page_content=content,
                metadata={"source": "travel_content_vi.txt", "language": "vi"}
            ))
            logger.info(f"Loaded Vietnamese content: {len(content)} characters")
    
    # Load English content
    en_file = mock_data_dir / "travel_content_en.txt"
    if en_file.exists():
        with open(en_file, 'r', encoding='utf-8') as f:
            content = f.read()
            documents.append(Document(
                page_content=content,
                metadata={"source": "travel_content_en.txt", "language": "en"}
            ))
            logger.info(f"Loaded English content: {len(content)} characters")
    
    return documents


def split_documents(documents):
    """Split documents into chunks"""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    
    chunks = text_splitter.split_documents(documents)
    logger.info(f"Split into {len(chunks)} chunks")
    
    return chunks


def upload_to_pinecone(chunks):
    """Upload document chunks to Pinecone"""
    try:
        # Verify settings loaded
        logger.info(f"🔑 Checking configuration...")
        logger.info(f"   Pinecone API Key: {'***' + settings.pinecone_api_key[-4:] if settings.pinecone_api_key else 'NOT SET'}")
        logger.info(f"   Pinecone Index: {settings.pinecone_index_name}")
        logger.info(f"   Azure OpenAI Embedding Key: {'***' + settings.azure_openai_embedding_api_key[-4:] if settings.azure_openai_embedding_api_key else 'NOT SET'}")
        
        # Initialize Pinecone with API key
        logger.info("🔌 Initializing Pinecone...")
        pc = Pinecone(api_key=settings.pinecone_api_key)
        
        # Get the Pinecone index object
        index = pc.Index(settings.pinecone_index_name)
        logger.info(f"✅ Connected to Pinecone index: {settings.pinecone_index_name}")
        
        # Initialize embeddings
        logger.info("🤖 Initializing Azure OpenAI Embeddings...")
        embeddings = AzureOpenAIEmbeddings(
            azure_endpoint=settings.azure_openai_endpoint,
            api_key=settings.azure_openai_embedding_api_key,
            api_version=settings.azure_openai_api_version,
            deployment=settings.azure_openai_embedding_deployment,
            model="text-embedding-3-small"  # Explicitly specify model name
        )
        logger.info(f"✅ Using embedding model: {settings.azure_openai_embedding_deployment} (text-embedding-3-small)")
        
        # Upload to Pinecone - Manual approach to avoid API key issues
        logger.info("📤 Uploading chunks to Pinecone...")
        
        vectors_to_upsert = []
        for i, chunk in enumerate(chunks):
            # Generate embedding for this chunk
            text = chunk.page_content
            vector = embeddings.embed_query(text)
            
            # Prepare vector data
            vector_id = f"doc_{i}"
            metadata = {
                "text": text,
                "source": chunk.metadata.get("source", "unknown"),
                "language": chunk.metadata.get("language", "unknown")
            }
            
            vectors_to_upsert.append((vector_id, vector, metadata))
            
            if (i + 1) % 5 == 0:
                logger.info(f"   Processed {i + 1}/{len(chunks)} chunks...")
        
        # Upsert vectors to Pinecone in batches
        batch_size = 100
        for i in range(0, len(vectors_to_upsert), batch_size):
            batch = vectors_to_upsert[i:i + batch_size]
            index.upsert(vectors=batch)
            logger.info(f"   Uploaded batch {i//batch_size + 1} ({len(batch)} vectors)")
        
        logger.info(f"✅ Successfully uploaded {len(chunks)} chunks to Pinecone")
        
        # Verify upload
        stats = index.describe_index_stats()
        logger.info(f"📊 Index stats: {stats.total_vector_count} total vectors")
        
    except Exception as e:
        logger.error(f"❌ Error uploading to Pinecone: {str(e)}")
        logger.error(f"   Error type: {type(e).__name__}")
        import traceback
        logger.error(f"   Traceback: {traceback.format_exc()}")
        raise


def main():
    """Main setup function"""
    try:
        logger.info("Starting Pinecone setup...")
        
        # Step 1: Create index
        create_index_if_not_exists()
        
        # Step 2: Load mock data
        logger.info("Loading mock data...")
        documents = load_mock_data()
        
        if not documents:
            logger.error("No documents loaded. Please check mock data files.")
            return
        
        # Step 3: Split documents
        logger.info("Splitting documents...")
        chunks = split_documents(documents)
        
        # Step 4: Upload to Pinecone
        upload_to_pinecone(chunks)
        
        logger.info("Pinecone setup completed successfully!")
        
    except Exception as e:
        logger.error(f"Setup failed: {str(e)}")
        raise


if __name__ == "__main__":
    main()

