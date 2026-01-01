#!/usr/bin/env python3
"""
Standalone script to index documents for semantic search
"""

import sys
import os
from pathlib import Path

# Load .env file if it exists
try:
    from dotenv import load_dotenv
    # Look for .env in bifrost-mimick root
    env_path = Path(__file__).parent.parent.parent.parent / ".env"
    if env_path.exists():
        load_dotenv(env_path)
        print(f"✅ Loaded .env from: {env_path}")
except ImportError:
    pass  # dotenv not installed, that's ok if env var is already set

# Ensure we can import the modules
sys.path.insert(0, str(Path(__file__).parent))

# Try relative imports first, fall back to absolute
try:
    from .db_manager import DBManager
    from .semantic_search import SemanticSearch
except ImportError:
    from db_manager import DBManager
    from semantic_search import SemanticSearch


def main():
    """Main indexing function"""
    print("=" * 70)
    print("SIM-KB Light Test - Document Indexing")
    print("=" * 70)

    db = DBManager()
    search = SemanticSearch(db)

    print(f"\n📁 Database: {db.db_path}")
    print("\n🔄 Generating embeddings for all documents...")
    print("This may take a few minutes...\n")

    try:
        search.index_all_documents()

        # Show summary
        with db:
            embeddings = db.query("SELECT COUNT(*) as count FROM embeddings")
            docs = db.query("SELECT COUNT(*) as count FROM documents")

            print("\n" + "=" * 70)
            print("📊 Indexing Complete")
            print("=" * 70)
            print(f"  Documents: {docs[0]['count']}")
            print(f"  Embeddings: {embeddings[0]['count']}")

        # Test search
        print("\n" + "=" * 70)
        print("🔍 Test Search")
        print("=" * 70)

        test_query = "What are the underwriting strengths?"
        print(f"\nQuery: {test_query}\n")

        results = search.search(test_query, limit=3)

        for i, result in enumerate(results, 1):
            print(f"{i}. {result['title']}")
            print(f"   Similarity: {result['similarity']:.3f}")
            print(f"   Preview: {result['chunk_text'][:100]}...\n")

        print("=" * 70)
        print("✨ Indexing complete!")
        print("=" * 70)

    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nMake sure:")
        print("  1. OPENAI_API_KEY environment variable is set")
        print("  2. OpenAI library is installed: pip install openai")
        print("  3. numpy is installed: pip install numpy")
        sys.exit(1)


if __name__ == "__main__":
    main()
