"""
Database Manager for SIM-KB Light Test
Handles SQLite connection, initialization, and basic CRUD operations
"""

import sqlite3
import json
from pathlib import Path
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid


class DBManager:
    """Manages SQLite database connections and operations for SIM-KB"""

    def __init__(self, db_path: Optional[str] = None):
        """
        Initialize database manager

        Args:
            db_path: Path to SQLite database file. If None, uses default location.
        """
        if db_path is None:
            # Default to Documents/data/bpser directory
            db_path = str(Path.home() / "Documents" / "data" / "bpser" / "sim_kb_test.db")

        self.db_path = db_path
        self.conn = None

    def connect(self) -> sqlite3.Connection:
        """Connect to the database"""
        if self.conn is None:
            self.conn = sqlite3.connect(self.db_path)
            self.conn.row_factory = sqlite3.Row  # Enable column access by name
        return self.conn

    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
            self.conn = None

    def initialize_schema(self):
        """Initialize database schema from schema.sql"""
        schema_path = Path(__file__).parent / "schema.sql"

        with open(schema_path, 'r') as f:
            schema_sql = f.read()

        conn = self.connect()
        cursor = conn.cursor()
        cursor.executescript(schema_sql)
        conn.commit()

    def generate_hemlix_id(self, entity_type: str) -> str:
        """
        Generate a Hemlix ID for an entity

        Args:
            entity_type: Type of entity (org, product, doc, person, role, offer)

        Returns:
            Hemlix ID string
        """
        # Simple implementation - timestamp + UUID
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        return f"hmx_{entity_type}_{timestamp}_{unique_id}"

    def register_hemlix_id(self, hemlix_id: str, entity_type: str, entity_id: int):
        """Register a Hemlix ID in the registry"""
        conn = self.connect()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO hemlix_registry (hemlix_id, entity_type, entity_id) VALUES (?, ?, ?)",
            (hemlix_id, entity_type, entity_id)
        )
        conn.commit()

    def insert_organization(self, name: str, display_name: Optional[str] = None) -> int:
        """
        Insert an organization

        Returns:
            Organization ID
        """
        hemlix_id = self.generate_hemlix_id("org")
        display_name = display_name or name

        conn = self.connect()
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO organizations (hemlix_id, name, display_name)
               VALUES (?, ?, ?)""",
            (hemlix_id, name, display_name)
        )
        conn.commit()
        org_id = cursor.lastrowid

        self.register_hemlix_id(hemlix_id, "organization", org_id)
        return org_id

    def insert_product(self, name: str, product_type: str, description: Optional[str] = None) -> int:
        """
        Insert a product

        Returns:
            Product ID
        """
        hemlix_id = self.generate_hemlix_id("prod")

        conn = self.connect()
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO products (hemlix_id, name, product_type, description)
               VALUES (?, ?, ?, ?)""",
            (hemlix_id, name, product_type, description)
        )
        conn.commit()
        product_id = cursor.lastrowid

        self.register_hemlix_id(hemlix_id, "product", product_id)
        return product_id

    def insert_role(self, role_name: str, role_short_name: Optional[str] = None,
                   temperature: Optional[float] = None, goal: Optional[str] = None,
                   backstory: Optional[str] = None) -> int:
        """
        Insert a role

        Returns:
            Role ID
        """
        hemlix_id = self.generate_hemlix_id("role")

        conn = self.connect()
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO roles (hemlix_id, role_name, role_short_name, temperature, goal, backstory)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (hemlix_id, role_name, role_short_name, temperature, goal, backstory)
        )
        conn.commit()
        role_id = cursor.lastrowid

        self.register_hemlix_id(hemlix_id, "role", role_id)
        return role_id

    def insert_document(self, title: str, document_type: str, content: str,
                       metadata: Optional[Dict[str, Any]] = None,
                       file_path: Optional[str] = None) -> int:
        """
        Insert a document

        Returns:
            Document ID
        """
        hemlix_id = self.generate_hemlix_id("doc")
        metadata_json = json.dumps(metadata) if metadata else None

        conn = self.connect()
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO documents (hemlix_id, title, document_type, content, metadata, file_path)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (hemlix_id, title, document_type, content, metadata_json, file_path)
        )
        conn.commit()
        doc_id = cursor.lastrowid

        self.register_hemlix_id(hemlix_id, "document", doc_id)
        return doc_id

    def link_document_to_org(self, document_id: int, organization_id: int,
                            relationship_type: str = "related"):
        """Link a document to an organization"""
        conn = self.connect()
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO document_org_links (document_id, organization_id, relationship_type)
               VALUES (?, ?, ?)""",
            (document_id, organization_id, relationship_type)
        )
        conn.commit()

    def link_document_to_product(self, document_id: int, product_id: int):
        """Link a document to a product"""
        conn = self.connect()
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO document_product_links (document_id, product_id)
               VALUES (?, ?)""",
            (document_id, product_id)
        )
        conn.commit()

    def get_or_create_organization(self, name: str, display_name: Optional[str] = None) -> int:
        """Get existing organization ID or create new one"""
        conn = self.connect()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM organizations WHERE name = ?", (name,))
        row = cursor.fetchone()

        if row:
            return row[0]
        else:
            return self.insert_organization(name, display_name)

    def get_or_create_product(self, name: str, product_type: str) -> int:
        """Get existing product ID or create new one"""
        conn = self.connect()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM products WHERE name = ? AND product_type = ?",
                      (name, product_type))
        row = cursor.fetchone()

        if row:
            return row[0]
        else:
            return self.insert_product(name, product_type)

    def query(self, sql: str, params: tuple = ()) -> List[sqlite3.Row]:
        """Execute a query and return results"""
        conn = self.connect()
        cursor = conn.cursor()
        cursor.execute(sql, params)
        return cursor.fetchall()

    def __enter__(self):
        """Context manager entry"""
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.close()
