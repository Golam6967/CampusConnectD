import re
from typing import List

class QueryPreprocessor:
    """
    Preprocess and expand queries for better retrieval accuracy.
    """
    
    def __init__(self):
        # Domain-specific abbreviations
        self.abbreviations = {
            'cs': 'computer science',
            'cse': 'computer science engineering',
            'ict': 'information communication technology',
            'prof': 'professor',
            'dept': 'department',
            'sem': 'semester',
            'reg': 'registration',
            'lib': 'library',
            'gym': 'gymnasium',
            'univ': 'university',
            'iut': 'islamic university of technology',
            'fest': 'festival',
            'comp': 'competition',
            'regs': 'registration',
            'info': 'information'
        }
        
        print("[INFO] Query preprocessor initialized")
    
    def expand_abbreviations(self, query: str) -> str:
        """
        Expand common abbreviations in the query.
        
        Args:
            query: Original query string
            
        Returns:
            Query with expanded abbreviations
        """
        query_lower = query.lower()
        
        for abbr, full in self.abbreviations.items():
            # Use word boundaries to avoid partial replacements
            pattern = r'\b' + re.escape(abbr) + r'\b'
            query_lower = re.sub(pattern, full, query_lower)
        
        return query_lower
    
    def clean_query(self, query: str) -> str:
        """
        Clean the query by removing special characters and extra whitespace.
        
        Args:
            query: Original query string
            
        Returns:
            Cleaned query string
        """
        # Remove special characters except spaces and basic punctuation
        query = re.sub(r'[^\w\s\?\.\,\-]', ' ', query)
        
        # Remove extra whitespace
        query = ' '.join(query.split())
        
        return query
    
    def preprocess(self, query: str) -> str:
        """
        Full preprocessing pipeline: clean and expand abbreviations.
        
        Args:
            query: Original query string
            
        Returns:
            Preprocessed query string
        """
        # Clean first
        query = self.clean_query(query)
        
        # Then expand abbreviations
        query = self.expand_abbreviations(query)
        
        return query
    
    def generate_variations(self, query: str, max_variations: int = 2) -> List[str]:
        """
        Generate alternative phrasings of the query.
        For now, returns the original query. Can be enhanced with LLM-based expansion.
        
        Args:
            query: Original query string
            max_variations: Maximum number of variations to generate
            
        Returns:
            List of query variations including the original
        """
        variations = [query]
        
        # Add simple variations
        if '?' in query:
            # Remove question mark
            variations.append(query.replace('?', ''))
        
        # Add "tell me about" variation if query is short
        if len(query.split()) <= 5 and not query.lower().startswith(('what', 'when', 'where', 'who', 'how', 'why')):
            variations.append(f"tell me about {query}")
        
        return variations[:max_variations + 1]
