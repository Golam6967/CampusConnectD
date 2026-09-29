import os
from dotenv import load_dotenv
from typing import List, Dict
from src.vectorstore import ChromaVectorStore
from src.reranker import DocumentReranker
from src.query_preprocessor import QueryPreprocessor
from langchain_groq import ChatGroq
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

load_dotenv()

class RAGSearch:
    def __init__(self, persist_dir: str = "./data/vector_store", embedding_model: str = "all-MiniLM-L6-v2", llm_model: str = "llama-3.3-70b-versatile"):
        self.vectorstore = ChromaVectorStore(persist_dir=persist_dir, embedding_model=embedding_model)
        
        # Initialize reranker for improved accuracy
        self.reranker = DocumentReranker(model_name="cross-encoder/ms-marco-MiniLM-L-6-v2")
        
        # Initialize query preprocessor
        self.query_preprocessor = QueryPreprocessor()
        
        # Check if vector store has documents, if not build it
        if self.vectorstore.collection.count() == 0:
            from src.dataloader import load_all_documents
            print("[INFO] Vector store is empty. Building from documents...")
            docs = load_all_documents("data")
            self.vectorstore.build_from_documents(docs)
        
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            raise ValueError("GROQ_API_KEY environment variable is not set")
        
        # Initialize LLM with proper temperature for consistent, factual responses
        self.llm = ChatGroq(
            groq_api_key=groq_api_key, 
            model_name=llm_model,
            temperature=0.2,  # Low temperature for factual, consistent responses
            max_tokens=1024
        )
        print(f"[INFO] Groq LLM initialized: {llm_model}")

    def search_and_summarize(self, query: str, top_k: int = 5) -> str:
        """Legacy method for backward compatibility"""
        results = self.vectorstore.query(query, top_k=top_k)
        texts = [r["content"] for r in results]
        context = "\n\n".join(texts)
        if not context:
            return "No relevant documents found."
        prompt = f"""Summarize the following context for the query: '{query}'\n\nContext:\n{context}\n\nSummary:"""
        response = self.llm.invoke(prompt)
        return response.content
    
    def calculate_confidence(self, query: str, documents: List[Dict]) -> Dict:
        """
        Calculate confidence score based on document relevance.
        
        Args:
            query: The search query
            documents: Retrieved documents with rerank_score
            
        Returns:
            dict with confidence level and score
        """
        if not documents:
            return {"level": "low", "score": 0.0}
        
        # Use rerank scores for confidence calculation
        avg_score = np.mean([doc.get('rerank_score', 0) for doc in documents[:3]])
        
        # Normalize score (cross-encoder scores can be negative)
        # Typical range is -10 to 10, normalize to 0-1
        normalized_score = (avg_score + 10) / 20
        normalized_score = max(0, min(1, normalized_score))
        
        if normalized_score > 0.7:
            level = "high"
        elif normalized_score > 0.4:
            level = "medium"
        else:
            level = "low"
        
        return {"level": level, "score": float(normalized_score)}
    
    def ask(self, query: str, top_k: int = 5) -> dict:
        """
        Advanced RAG function with improved accuracy through:
        1. Query preprocessing and expansion
        2. Retrieve more candidates initially
        3. Re-rank with cross-encoder
        4. Confidence scoring
        5. Enhanced prompt engineering
        
        Args:
            query: The user's question
            top_k: Number of final documents to use (default: 5)
            
        Returns:
            dict with keys: answer, sources, context, confidence, relevance_score
        """
        print(f"[INFO] Processing query: {query}")
        
        # Step 1: Preprocess query
        processed_query = self.query_preprocessor.preprocess(query)
        print(f"[INFO] Preprocessed query: {processed_query}")
        
        # Step 2: Retrieve more candidates for re-ranking (fetch 3x more)
        initial_k = min(top_k * 3, 15)
        results = self.vectorstore.query(processed_query, top_k=initial_k)
        
        if not results:
            return {
                "answer": "I don't have information about that in my knowledge base. Please ask questions related to campus events, clubs, courses, facilities, or other campus-specific topics.",
                "sources": [],
                "context": "",
                "confidence": {"level": "low", "score": 0.0},
                "relevance_score": 0.0
            }
        
        # Step 3: Re-rank documents for better accuracy
        reranked_results = self.reranker.rerank(processed_query, results, top_k=top_k)
        print(f"[INFO] Re-ranked {len(results)} documents to top {len(reranked_results)}")
        
        # Step 4: Calculate confidence
        confidence = self.calculate_confidence(processed_query, reranked_results)
        print(f"[INFO] Confidence: {confidence['level']} (score: {confidence['score']:.2f})")
        
        # Step 5: Build context with source attribution
        context_parts = []
        sources = []
        
        for i, result in enumerate(reranked_results, 1):
            metadata = result.get('metadata', {})
            content = result.get('content', '')
            
            source_file = metadata.get('source_file', 'Unknown')
            page = metadata.get('page', 'N/A')
            doc_type = metadata.get('document_type', 'general')
            
            source_info = {
                "source_file": source_file,
                "page": page,
                "document_type": doc_type,
                "similarity_score": result.get('original_score', 0),
                "rerank_score": result.get('rerank_score', 0),
                "content_preview": content[:200] + "..." if len(content) > 200 else content
            }
            sources.append(source_info)
            
            # Build context without source markers (cleaner for user)
            context_parts.append(content)
        
        context = "\n\n---\n\n".join(context_parts)
        
        # Step 6: Enhanced prompt template with clear instructions
        prompt_template = """You are a helpful campus assistant for CampusConnect. Your role is to provide accurate, specific information based on official campus documents.

CRITICAL INSTRUCTIONS:
1. Answer ONLY based on the provided context from official documents
2. If the context doesn't contain enough information, say: "I don't have specific information about that in my knowledge base. Please contact the campus office or visit the official campus website for more details."
3. Be specific with dates, times, locations, deadlines, and requirements
4. If multiple sources provide different information, mention all perspectives
5. Use bullet points for lists and multiple items
6. Be concise but comprehensive - provide complete answers
7. If asked about procedures, list all steps clearly
8. Provide information naturally without citing sources

CONTEXT FROM OFFICIAL CAMPUS DOCUMENTS:
{context}

STUDENT QUESTION: {question}

DETAILED ANSWER:"""
        
        prompt = prompt_template.format(context=context, question=query)
        
        try:
            # Generate response with optimal parameters for accuracy
            response = self.llm.invoke(prompt)
            answer = response.content
            
            # Add disclaimer for low confidence
            if confidence['level'] == 'low':
                answer += "\n\n⚠️ Note: My confidence in this answer is low. Please verify this information with official campus sources."
            
        except Exception as e:
            print(f"[ERROR] LLM invocation failed: {str(e)}")
            answer = "I encountered an error processing your question. Please try again."
            confidence = {"level": "low", "score": 0.0}
        
        return {
            "answer": answer,
            "sources": sources,
            "context": context,
            "confidence": confidence,
            "relevance_score": confidence['score'],
            "num_sources": len(reranked_results)
        }