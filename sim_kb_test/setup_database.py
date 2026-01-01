#!/usr/bin/env python3
"""
Setup script for SIM-KB Test
Initializes database and loads data from knowledge base
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
except ImportError:
    pass  # dotenv not installed, that's ok if env var is already set

# Ensure we can import the modules
sys.path.insert(0, str(Path(__file__).parent))

# Try relative imports first, fall back to absolute
try:
    from .db_manager import DBManager
    from .data_loader import DataLoader
    from .semantic_search import SemanticSearch
except ImportError:
    from db_manager import DBManager
    from data_loader import DataLoader
    from semantic_search import SemanticSearch


def main():
    """Main setup function"""
    print("=" * 70)
    print("SIM-KB Light Test - Database Setup")
    print("=" * 70)

    # Initialize database
    db = DBManager()
    print(f"\n📁 Database: {db.db_path}")

    # Initialize schema
    print("\n🔧 Initializing database schema...")
    db.initialize_schema()
    print("✅ Schema initialized")

    # Load data
    print("\n🔄 Loading data from knowledge base...")
    loader = DataLoader(db)
    loader.load_all()

    # Show summary
    print("\n" + "=" * 70)
    print("📊 Database Summary:")
    print("=" * 70)

    with db:
        orgs = db.query("SELECT COUNT(*) as count FROM organizations")
        products = db.query("SELECT COUNT(*) as count FROM products")
        roles = db.query("SELECT COUNT(*) as count FROM roles")
        docs = db.query("SELECT COUNT(*) as count FROM documents")

        print(f"  Organizations: {orgs[0]['count']}")
        print(f"  Products: {products[0]['count']}")
        print(f"  Roles: {roles[0]['count']}")
        print(f"  Documents: {docs[0]['count']}")

    # Ask about indexing
    print("\n" + "=" * 70)
    print("🔍 Semantic Search Indexing")
    print("=" * 70)
    print("\nWould you like to generate embeddings for semantic search?")
    print("This will use OpenAI API and may take a few minutes.")
    print("(Requires OPENAI_API_KEY environment variable)")

    response = input("\nGenerate embeddings? (y/n): ").strip().lower()

    if response == 'y':
        print("\n🔄 Generating embeddings...")
        search = SemanticSearch(db)

        try:
            search.index_all_documents()

            # Show embedding count
            with db:
                embeddings = db.query("SELECT COUNT(*) as count FROM embeddings")
                print(f"\n✅ Generated {embeddings[0]['count']} embeddings")

        except Exception as e:
            print(f"\n⚠️  Error generating embeddings: {e}")
            print("You can run semantic indexing later with: python index_documents.py")

    print("\n✨ Setup complete!")
    print("=" * 70)
    print("\nTo test the system:")
    print("  1. Run: python -m cyphers.bpser.sim_kb_test.query_interface")
    print("  2. Or use the menu: BPSer > Utilities > SIM-KB Test")
    print("=" * 70)


if __name__ == "__main__":
    main()
