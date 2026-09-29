import os
import uuid
import numpy as np
from typing import List, Any, Dict
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings
from src.embedding import EmbeddingPipeline

class ChromaVectorStore:
    def __init__(self, persist_dir: str = "./data/vector_store", embedding_model: str = "openai/gpt-oss-120b", 
                 chunk_size: int = 1000, chunk_overlap: int = 200, collection_name: str = "pdf_documents"):
        self.persist_dir = persist_dir
        self.collection_name = collection_name
        self.embedding_model = embedding_model
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.model = SentenceTransformer(embedding_model)
        self.client = None
        self.collection = None
        self._initialize_store()
        print(f"[INFO] Loaded embedding model: {embedding_model}")

    def _initialize_store(self):
        """
        Initialize the ChromaDB client and collection
        """
        try:
            # Make persistent ChromaDB client
            os.makedirs(self.persist_dir, exist_ok=True)
            self.client = chromadb.PersistentClient(
                path=self.persist_dir,
                settings=Settings(anonymized_telemetry=False)
            )

            # Get or create collection
            self.collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine", "description": "PDF Document embeddings for RAG"}
            )
            print(f"[INFO] Vector Store initialized with collection: {self.collection_name}")
            print(f"[INFO] Existing documents in collection: {self.collection.count()}")

        except Exception as e:
            print(f"[ERROR] Error initializing ChromaDB: {str(e)}")
            raise e

    def build_from_documents(self, documents: List[Any]):
        """
        Build vector store from raw documents
        """
        print(f"[INFO] Building vector store from {len(documents)} raw documents...")
        emb_pipe = EmbeddingPipeline(model_name=self.embedding_model, chunk_size=self.chunk_size, chunk_overlap=self.chunk_overlap)
        chunks = emb_pipe.chunk_documents(documents)
        
        # Generate embeddings
        texts = [chunk.page_content for chunk in chunks]
        print(f"[INFO] Generating embeddings for {len(texts)} chunks...")
        embeddings = emb_pipe.embed_chunks(chunks)
        
        # Add to vector store
        self.add_documents(chunks, embeddings)
        print(f"[INFO] Vector store built and saved to {self.persist_dir}")

    def add_documents(self, documents: List[Any], embeddings: np.ndarray):
        """
        Add documents to the vector store
        Args:
        documents: List of LangChain Document objects
        embeddings: Numpy array of embeddings
        """
        if len(documents) != len(embeddings):
            raise ValueError("Number of documents and embeddings must match")
        
        print(f"[INFO] Adding {len(documents)} documents to the vector store...")

        # Prepare data for ChromaDB
        ids = []
        metadatas = []
        documents_text = []
        embeddings_list = []
        
        for i, (doc, embedding) in enumerate(zip(documents, embeddings)):
            # Generate unique id
            try:
                doc_id = f"doc_{uuid.uuid4().hex[:8]}_{i}"
                ids.append(doc_id)
                
                # Add metadata
                metadata = dict(doc.metadata)
                metadata['doc_index'] = i
                metadata['content_length'] = len(doc.page_content)
                metadatas.append(metadata)
                
                documents_text.append(doc.page_content)
                embeddings_list.append(embedding.tolist())
            except Exception as e:
                print(f"[ERROR] Error preparing document {i} for ChromaDB: {str(e)}")
                continue
        
        try:
            # Add to ChromaDB collection
            self.collection.add(
                ids=ids,
                embeddings=embeddings_list,
                metadatas=metadatas,
                documents=documents_text
            )
            print(f"[INFO] Added {len(documents)} documents to the vector store.")
            print(f"[INFO] Total documents in collection: {self.collection.count()}")
        except Exception as e:
            print(f"[ERROR] Error adding documents to vector store: {str(e)}")
            raise e

    def query(self, query_text: str, top_k: int = 5, score_threshold: float = 0.0) -> List[Dict[str, Any]]:
        """
        Retrieve relevant documents for a given query
        Args:
        query_text: Input query string
        top_k: Number of top results to retrieve (default: 5)
        score_threshold: Minimum similarity score threshold (default: 0.0)
        Returns:
        List of retrieved documents with metadata and similarity scores
        """
        print(f"[INFO] Querying vector store for: '{query_text}'")
        print(f"[INFO] Using top_k: {top_k}, score_threshold: {score_threshold}")
        
        # Generate embedding for the query
        query_embedding = self.model.encode([query_text])[0]

        try:
            results = self.collection.query(
                query_embeddings=[query_embedding.tolist()],
                n_results=top_k
            )
            
            # Process results
            retrieved_docs = []

            if results['documents'] and results['documents'][0]:
                documents = results['documents'][0]
                metadatas = results['metadatas'][0]
                distances = results['distances'][0]
                ids = results['ids'][0]

                for i, (doc_id, document, metadata, distance) in enumerate(zip(ids, documents, metadatas, distances)):
                    # Convert distance to similarity score (ChromaDB uses cosine distance)
                    similarity_score = 1 - distance
                    if similarity_score >= score_threshold:
                        retrieved_docs.append({
                            "id": doc_id,
                            "content": document,
                            "metadata": metadata,
                            "similarity_score": similarity_score,
                            "distance": distance,
                            "rank": i + 1
                        })
                print(f"[INFO] Retrieved {len(retrieved_docs)} documents from vector store query.")
            else:
                print("[INFO] No documents retrieved from vector store query.")
            
            return retrieved_docs

        except Exception as e:
            print(f"[ERROR] Error during retrieval: {str(e)}")
            raise e