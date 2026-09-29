from typing import List, Any
from sentence_transformers import CrossEncoder
import numpy as np

class DocumentReranker:
    """
    Re-ranks documents using a cross-encoder model for improved accuracy.
    Cross-encoders are more accurate than bi-encoders but slower.
    """
    
    def __init__(self, model_name: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"):
        """
        Initialize the reranker with a cross-encoder model.
        
        Args:
            model_name: HuggingFace model name for cross-encoding
        """
        print(f"[INFO] Loading cross-encoder model: {model_name}")
        self.model = CrossEncoder(model_name)
        print(f"[INFO] Cross-encoder loaded successfully")
    
    def rerank(self, query: str, documents: List[dict], top_k: int = 5) -> List[dict]:
        """
        Re-rank documents based on their relevance to the query.
        
        Args:
            query: The search query
            documents: List of document dictionaries with 'content' key
            top_k: Number of top documents to return
            
        Returns:
            Re-ranked list of documents with updated similarity scores
        """
        if not documents:
            return []
        
        # Create query-document pairs
        pairs = [[query, doc['content']] for doc in documents]
        
        # Get relevance scores
        scores = self.model.predict(pairs)
        
        # Add rerank scores to documents
        for doc, score in zip(documents, scores):
            doc['rerank_score'] = float(score)
            doc['original_score'] = doc.get('similarity_score', 0)
        
        # Sort by rerank score
        reranked_docs = sorted(documents, key=lambda x: x['rerank_score'], reverse=True)
        
        print(f"[INFO] Re-ranked {len(documents)} documents, returning top {top_k}")
        
        return reranked_docs[:top_k]
