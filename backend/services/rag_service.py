"""
RAG Service with Langchain, Pinecone, and Function Calling
"""
from typing import List, Dict, Any, Optional
import json
from pathlib import Path

from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import HumanMessage, AIMessage, SystemMessage
from langchain.tools import tool
from pinecone import Pinecone

from config import settings
import logging

logger = logging.getLogger(__name__)


class RAGService:
    """RAG service for generating responses with context retrieval"""
    
    def __init__(self):
        self._setup_llm()
        self._setup_embeddings()
        self._setup_vector_store()
        self._setup_tools()
    
    def _setup_llm(self):
        """Initialize Azure OpenAI LLM"""
        try:
            self.llm = AzureChatOpenAI(
                azure_endpoint=settings.azure_openai_endpoint,
                api_key=settings.azure_openai_llm_api_key,
                api_version=settings.azure_openai_api_version,
                deployment_name=settings.azure_openai_deployment_name,
                temperature=0.7,
                max_tokens=1000
            )
            logger.info(f"LLM initialized successfully with deployment: {settings.azure_openai_deployment_name}")
        except Exception as e:
            logger.error(f"Error initializing LLM: {str(e)}")
            raise
    
    def _setup_embeddings(self):
        """Initialize Azure OpenAI Embeddings"""
        try:
            self.embeddings = AzureOpenAIEmbeddings(
                azure_endpoint=settings.azure_openai_endpoint,
                api_key=settings.azure_openai_embedding_api_key,
                api_version=settings.azure_openai_api_version,
                deployment=settings.azure_openai_embedding_deployment,
                model="text-embedding-3-small"  # Explicitly specify model name
            )
            logger.info(f"Embeddings initialized successfully with deployment: {settings.azure_openai_embedding_deployment} (text-embedding-3-small)")
        except Exception as e:
            logger.error(f"Error initializing embeddings: {str(e)}")
            raise
    
    def _setup_vector_store(self):
        """Initialize Pinecone vector store"""
        try:
            pc = Pinecone(api_key=settings.pinecone_api_key)
            
            # Check if index exists
            index_name = settings.pinecone_index_name
            existing_indexes = [index.name for index in pc.list_indexes()]
            
            if index_name not in existing_indexes:
                logger.warning(f"Pinecone index '{index_name}' not found. Please create and populate it.")
                self.vector_store = None
            else:
                # Get index object
                index = pc.Index(index_name)
                
                # Initialize vector store with index object
                self.vector_store = PineconeVectorStore(
                    index=index,
                    embedding=self.embeddings,
                    text_key="text"  # Metadata field for text content
                )
                logger.info(f"Pinecone vector store connected to index: {index_name}")
                
        except Exception as e:
            logger.error(f"Error setting up vector store: {str(e)}")
            self.vector_store = None
    
    def _setup_tools(self):
        """Setup function calling tools"""
        # Load mock links data
        links_file = Path(settings.mock_data_dir) / "external_links.json"
        
        if links_file.exists():
            with open(links_file, 'r', encoding='utf-8') as f:
                self.mock_links = json.load(f)
        else:
            logger.warning("External links mock data not found")
            self.mock_links = {}
    
    def get_external_links(self, topic: str, language: str = "vi") -> List[Dict[str, str]]:
        """
        Function to get external links related to a topic
        This simulates function calling for retrieving links
        
        Args:
            topic: Topic to search links for
            language: Language preference
        
        Returns:
            List of link dictionaries with url, title, type
        """
        try:
            # Normalize topic for matching
            topic_lower = topic.lower()
            
            links = []
            
            # Search in mock data
            for key, data in self.mock_links.items():
                if key.lower() in topic_lower or any(
                    keyword.lower() in topic_lower 
                    for keyword in data.get("keywords", [])
                ):
                    links.extend(data.get("links", []))
            
            # Return first 5 most relevant links
            return links[:5]
            
        except Exception as e:
            logger.error(f"Error getting external links: {str(e)}")
            return []
    
    def _build_system_prompt(self, language: str) -> str:
        """Build system prompt based on language"""
        if language == "vi":
            return """Bạn là một trợ lý du lịch thông minh chuyên về Việt Nam. 
Nhiệm vụ của bạn là:
1. Trả lời các câu hỏi về du lịch Việt Nam một cách chính xác và hữu ích
2. Đề xuất lịch trình du lịch phù hợp với nhu cầu
3. Giới thiệu các địa điểm, ẩm thực, văn hóa
4. Cung cấp các liên kết hữu ích khi phù hợp

Hãy trả lời bằng tiếng Việt, thân thiện và nhiệt tình. 
Sử dụng thông tin từ context được cung cấp để đưa ra câu trả lời chính xác.
Nếu không chắc chắn, hãy thừa nhận và đề xuất hướng tìm hiểu thêm."""
        else:
            return """You are an intelligent travel assistant specializing in Vietnam.
Your tasks are:
1. Answer questions about Vietnam travel accurately and helpfully
2. Suggest appropriate travel itineraries
3. Introduce destinations, cuisine, and culture
4. Provide useful links when appropriate

Respond in English, being friendly and enthusiastic.
Use information from the provided context to give accurate answers.
If unsure, acknowledge it and suggest ways to learn more."""
    
    def _retrieve_context(self, query: str, k: int = 4) -> tuple[List[str], List[dict]]:
        """
        Retrieve relevant documents from vector store
        
        Returns:
            Tuple of (context_strings, source_documents)
        """
        if not self.vector_store:
            logger.warning("Vector store not available, returning empty context")
            return [], []
        
        try:
            # Perform similarity search
            docs = self.vector_store.similarity_search(query, k=k)
            
            contexts = [doc.page_content for doc in docs]
            sources = [
                {
                    "content": doc.page_content[:200] + "...",
                    "metadata": doc.metadata
                }
                for doc in docs
            ]
            
            logger.info(f"Retrieved {len(contexts)} context documents")
            return contexts, sources
            
        except Exception as e:
            logger.error(f"Error retrieving context: {str(e)}")
            return [], []
    
    def _generate_follow_up_questions(self, query: str, answer: str, language: str) -> List[str]:
        """Generate follow-up questions based on conversation"""
        try:
            if language == "vi":
                prompt = f"""Dựa trên câu hỏi và câu trả lời sau, hãy tạo 3 câu hỏi tiếp theo hữu ích mà người dùng có thể quan tâm.

Câu hỏi: {query}
Câu trả lời: {answer}

Chỉ trả về 3 câu hỏi, mỗi câu trên một dòng, không cần đánh số."""
            else:
                prompt = f"""Based on the following question and answer, generate 3 useful follow-up questions that the user might be interested in.

Question: {query}
Answer: {answer}

Return only 3 questions, one per line, without numbering."""
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            questions = [q.strip() for q in response.content.strip().split('\n') if q.strip()]
            
            return questions[:3]
            
        except Exception as e:
            logger.error(f"Error generating follow-up questions: {str(e)}")
            return []
    
    async def generate_response(
        self,
        query: str,
        history: List[Dict[str, str]],
        language: str = "vi"
    ) -> Dict[str, Any]:
        """
        Generate response using RAG
        
        Args:
            query: User's question
            history: Conversation history
            language: Language (vi or en)
        
        Returns:
            Dict with answer, sources, links, follow_up_questions
        """
        try:
            # 1. Retrieve relevant context
            contexts, sources = self._retrieve_context(query)
            
            # 2. Check if we should retrieve external links (simple keyword matching)
            links = []
            link_keywords = ['link', 'website', 'maps', 'blog', 'video', 'xem', 'tìm', 'giới thiệu', 'recommend']
            if any(keyword in query.lower() for keyword in link_keywords):
                links = self.get_external_links(query, language)
            
            # 3. Build prompt with context
            system_prompt = self._build_system_prompt(language)
            
            if contexts:
                context_text = "\n\n".join(contexts)
                if language == "vi":
                    context_prompt = f"\nThông tin tham khảo:\n{context_text}\n"
                else:
                    context_prompt = f"\nReference information:\n{context_text}\n"
            else:
                context_prompt = ""
            
            # 4. Build message history
            messages = [SystemMessage(content=system_prompt + context_prompt)]
            
            # Add conversation history (last 5 messages to keep context manageable)
            for msg in history[-5:]:
                if msg["role"] == "user":
                    messages.append(HumanMessage(content=msg["content"]))
                elif msg["role"] == "assistant":
                    messages.append(AIMessage(content=msg["content"]))
            
            # Add current query
            messages.append(HumanMessage(content=query))
            
            # 5. Generate response
            logger.info(f"Generating response for query: {query[:100]}...")
            response = self.llm.invoke(messages)
            answer = response.content
            
            # 6. Generate follow-up questions
            follow_up_questions = self._generate_follow_up_questions(query, answer, language)
            
            # 7. Format links if any
            if links:
                if language == "vi":
                    links_text = "\n\n**Liên kết hữu ích:**\n"
                else:
                    links_text = "\n\n**Useful links:**\n"
                
                for link in links:
                    links_text += f"- [{link['title']}]({link['url']}) - {link.get('type', 'Link')}\n"
                
                answer += links_text
            
            return {
                "answer": answer,
                "sources": sources,
                "links": links,
                "follow_up_questions": follow_up_questions
            }
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}", exc_info=True)
            
            # Return friendly error message
            if language == "vi":
                error_message = "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau."
            else:
                error_message = "Sorry, I'm experiencing technical difficulties. Please try again later."
            
            return {
                "answer": error_message,
                "sources": [],
                "links": [],
                "follow_up_questions": []
            }

