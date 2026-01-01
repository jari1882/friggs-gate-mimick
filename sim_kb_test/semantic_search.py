"""
Semantic Search for SIM-KB Light Test
Implements embedding generation and semantic search capabilities
"""

import json
import os
from typing import List, Dict, Any, Tuple, Optional
import numpy as np

try:
    from .db_manager import DBManager
except ImportError:
    from db_manager import DBManager


class SemanticSearch:
    """Handles embedding generation and semantic search"""

    def __init__(self, db_manager: DBManager):
        """
        Initialize semantic search

        Args:
            db_manager: Database manager instance
        """
        self.db = db_manager
        self.embedding_model = "text-embedding-3-small"
        self._openai_client = None

    def _get_openai_client(self):
        """Lazy load OpenAI client"""
        if self._openai_client is None:
            try:
                from openai import OpenAI
                self._openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            except ImportError:
                raise ImportError("OpenAI library not installed. Run: pip install openai")
            except Exception as e:
                raise Exception(f"Failed to initialize OpenAI client: {e}")

        return self._openai_client

    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """
        Split text into overlapping chunks

        Args:
            text: Text to chunk
            chunk_size: Maximum chunk size in characters
            overlap: Overlap between chunks

        Returns:
            List of text chunks
        """
        if len(text) <= chunk_size:
            return [text]

        chunks = []
        start = 0

        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]

            # Try to break at sentence boundary
            if end < len(text):
                last_period = chunk.rfind('.')
                last_newline = chunk.rfind('\n')
                break_point = max(last_period, last_newline)

                if break_point > chunk_size // 2:
                    chunk = text[start:start + break_point + 1]
                    end = start + break_point + 1

            chunks.append(chunk.strip())
            start = end - overlap

        return chunks

    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for text using OpenAI

        Args:
            text: Text to embed

        Returns:
            Embedding vector
        """
        client = self._get_openai_client()

        response = client.embeddings.create(
            model=self.embedding_model,
            input=text
        )

        return response.data[0].embedding

    def index_document(self, document_id: int):
        """
        Generate and store embeddings for a document

        Args:
            document_id: Document ID to index
        """
        # Get document content
        rows = self.db.query(
            "SELECT content, document_type FROM documents WHERE id = ?",
            (document_id,)
        )

        if not rows:
            raise ValueError(f"Document {document_id} not found")

        content = rows[0]['content']
        doc_type = rows[0]['document_type']

        # Chunk the content
        chunks = self.chunk_text(content)

        # Generate embeddings for each chunk
        conn = self.db.connect()
        cursor = conn.cursor()

        for idx, chunk in enumerate(chunks):
            # Generate embedding
            embedding = self.generate_embedding(chunk)
            embedding_json = json.dumps(embedding)

            # Store in database
            cursor.execute(
                """INSERT INTO embeddings (entity_type, entity_id, chunk_index, chunk_text, embedding_vector)
                   VALUES (?, ?, ?, ?, ?)""",
                ("documents", document_id, idx, chunk, embedding_json)
            )

        conn.commit()

    def index_all_documents(self):
        """Index all documents in the database"""
        print("🔄 Indexing all documents for semantic search...")

        rows = self.db.query("SELECT id, title, document_type FROM documents")

        total = len(rows)
        for i, row in enumerate(rows, 1):
            doc_id = row['id']
            title = row['title']
            doc_type = row['document_type']

            print(f"  [{i}/{total}] Indexing: {title}")

            try:
                self.index_document(doc_id)
            except Exception as e:
                print(f"    ⚠️  Error: {e}")

        print(f"\n✅ Indexed {total} documents")

    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        vec1_np = np.array(vec1)
        vec2_np = np.array(vec2)

        dot_product = np.dot(vec1_np, vec2_np)
        norm1 = np.linalg.norm(vec1_np)
        norm2 = np.linalg.norm(vec2_np)

        if norm1 == 0 or norm2 == 0:
            return 0.0

        return float(dot_product / (norm1 * norm2))

    def search(self, query: str, limit: int = 5, min_similarity: float = 0.5) -> List[Dict[str, Any]]:
        """
        Perform semantic search

        Args:
            query: Search query
            limit: Maximum number of results
            min_similarity: Minimum similarity score

        Returns:
            List of search results with scores
        """
        # Generate query embedding
        query_embedding = self.generate_embedding(query)

        # Get all document embeddings
        rows = self.db.query(
            """SELECT e.id, e.entity_id, e.chunk_index, e.chunk_text, e.embedding_vector,
                      d.title, d.document_type, d.metadata
               FROM embeddings e
               JOIN documents d ON e.entity_id = d.id
               WHERE e.entity_type = 'documents'"""
        )

        results = []

        for row in rows:
            embedding_vector = json.loads(row['embedding_vector'])
            similarity = self.cosine_similarity(query_embedding, embedding_vector)

            if similarity >= min_similarity:
                results.append({
                    'document_id': row['entity_id'],
                    'title': row['title'],
                    'document_type': row['document_type'],
                    'chunk_index': row['chunk_index'],
                    'chunk_text': row['chunk_text'],
                    'similarity': similarity,
                    'metadata': json.loads(row['metadata']) if row['metadata'] else {}
                })

        # Sort by similarity (descending)
        results.sort(key=lambda x: x['similarity'], reverse=True)

        return results[:limit]

    def get_document_context(self, document_id: int, carrier: Optional[str] = None,
                           product: Optional[str] = None) -> Dict[str, Any]:
        """
        Get full context for a document including related entities

        Args:
            document_id: Document ID
            carrier: Optional carrier name filter
            product: Optional product name filter

        Returns:
            Document context with related entities
        """
        # Get document
        doc_rows = self.db.query(
            "SELECT * FROM documents WHERE id = ?",
            (document_id,)
        )

        if not doc_rows:
            return {}

        doc = dict(doc_rows[0])

        # Get related organizations
        org_rows = self.db.query(
            """SELECT o.*, dol.relationship_type
               FROM organizations o
               JOIN document_org_links dol ON o.id = dol.organization_id
               WHERE dol.document_id = ?""",
            (document_id,)
        )

        doc['organizations'] = [dict(row) for row in org_rows]

        # Get related products
        product_rows = self.db.query(
            """SELECT p.*
               FROM products p
               JOIN document_product_links dpl ON p.id = dpl.product_id
               WHERE dpl.document_id = ?""",
            (document_id,)
        )

        doc['products'] = [dict(row) for row in product_rows]

        return doc


def main():
    """Main function to run indexing"""
    print("=" * 60)
    print("SIM-KB Light Test - Semantic Search Indexer")
    print("=" * 60)

    db = DBManager()
    search = SemanticSearch(db)

    # Index all documents
    search.index_all_documents()

    # Test search
    print("\n" + "=" * 60)
    print("🔍 Test Search")
    print("=" * 60)

    test_query = "What are the strengths in underwriting?"
    print(f"\nQuery: {test_query}\n")

    results = search.search(test_query, limit=3)

    for i, result in enumerate(results, 1):
        print(f"{i}. {result['title']}")
        print(f"   Type: {result['document_type']}")
        print(f"   Similarity: {result['similarity']:.3f}")
        print(f"   Preview: {result['chunk_text'][:150]}...")
        print()

    print("=" * 60)


if __name__ == "__main__":
    main()
