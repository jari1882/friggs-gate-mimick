"""
Data Loader for SIM-KB Light Test
Loads data from the BPSer knowledge base directory into the SQLite database
"""

import json
from pathlib import Path
from typing import Optional, Dict, Any, List
import re

try:
    from .db_manager import DBManager
except ImportError:
    from db_manager import DBManager


class DataLoader:
    """Loads BPSer knowledge base data into SIM-KB"""

    def __init__(self, db_manager: DBManager, kb_path: Optional[str] = None):
        """
        Initialize data loader

        Args:
            db_manager: Database manager instance
            kb_path: Path to knowledge base directory
        """
        self.db = db_manager

        if kb_path is None:
            kb_path = str(Path.home() / "Documents" / "data" / "bpser" / "knowledge_base")

        self.kb_path = Path(kb_path)
        self.year = 2026  # Current study year

    def load_all(self):
        """Load all data from knowledge base"""
        print("🔄 Loading BPSer knowledge base into SIM-KB...")

        # Load in order of dependencies
        print("\n1. Loading products...")
        self.load_products()

        print("\n2. Loading organizations (carriers)...")
        self.load_organizations()

        print("\n3. Loading roles...")
        self.load_roles()

        print("\n4. Loading carrier scorecards...")
        self.load_carrier_scorecards()

        print("\n5. Loading research documents...")
        self.load_research_documents()

        print("\n6. Loading question scorecards...")
        self.load_question_scorecards()

        print("\n7. Loading production history...")
        self.load_production_history()

        print("\n✅ Knowledge base loaded successfully!")

    def load_products(self):
        """Load insurance product types"""
        products = [
            ("Life", "Life Insurance"),
            ("Annuity", "Annuity Products"),
            ("ABLTC", "Asset-Based Long-Term Care"),
            ("Disability", "Disability Insurance")
        ]

        for product_type, description in products:
            product_id = self.db.insert_product(
                name=product_type,
                product_type=product_type,
                description=description
            )
            print(f"  ✓ Created product: {product_type} (ID: {product_id})")

    def load_organizations(self):
        """Load carrier organizations from scorecards"""
        scorecard_dir = self.kb_path / str(self.year) / "carrier_scorecards" / "json"

        if not scorecard_dir.exists():
            print(f"  ⚠️  Scorecard directory not found: {scorecard_dir}")
            return

        carriers = set()

        # Extract carrier names from scorecard files
        for json_file in scorecard_dir.glob("*.json"):
            with open(json_file, 'r') as f:
                data = json.load(f)
                carrier_display = data.get("metadata", {}).get("carrier_display")
                if carrier_display:
                    carriers.add(carrier_display)

        # Insert each carrier
        for carrier in sorted(carriers):
            org_id = self.db.insert_organization(
                name=self._normalize_carrier_name(carrier),
                display_name=carrier
            )
            print(f"  ✓ Created organization: {carrier} (ID: {org_id})")

    def load_roles(self):
        """Load BPSer team roles"""
        team_file = self.kb_path / str(self.year) / "agents" / "BPSer_team.json"

        if not team_file.exists():
            print(f"  ⚠️  Team file not found: {team_file}")
            return

        with open(team_file, 'r') as f:
            team_data = json.load(f)

        for employee in team_data.get("employees", []):
            role_name = employee.get("role")
            role_short_name = employee.get("role_short_name")
            profile = employee.get("profile", {})

            role_id = self.db.insert_role(
                role_name=role_name,
                role_short_name=role_short_name,
                temperature=profile.get("temperature"),
                goal=profile.get("goal"),
                backstory=profile.get("backstory")
            )
            print(f"  ✓ Created role: {role_name} (ID: {role_id})")

    def load_carrier_scorecards(self):
        """Load carrier scorecard JSON files"""
        scorecard_dir = self.kb_path / str(self.year) / "carrier_scorecards" / "json"

        if not scorecard_dir.exists():
            print(f"  ⚠️  Scorecard directory not found: {scorecard_dir}")
            return

        count = 0
        for json_file in scorecard_dir.glob("*.json"):
            with open(json_file, 'r') as f:
                data = json.load(f)

            metadata = data.get("metadata", {})
            carrier_display = metadata.get("carrier_display")
            product = metadata.get("product")

            if not carrier_display or not product:
                continue

            # Get org and product IDs
            org_id = self.db.get_or_create_organization(
                self._normalize_carrier_name(carrier_display),
                carrier_display
            )
            product_id = self.db.get_or_create_product(product, product)

            # Create document
            title = f"{carrier_display} {product} Scorecard {self.year}"
            doc_id = self.db.insert_document(
                title=title,
                document_type="carrier_scorecard",
                content=json.dumps(data),
                metadata=metadata,
                file_path=str(json_file)
            )

            # Link to org and product
            self.db.link_document_to_org(doc_id, org_id, "scorecard")
            self.db.link_document_to_product(doc_id, product_id)

            count += 1

        print(f"  ✓ Loaded {count} carrier scorecards")

    def load_research_documents(self):
        """Load research markdown documents"""
        research_dir = self.kb_path / str(self.year) / "research"

        if not research_dir.exists():
            print(f"  ⚠️  Research directory not found: {research_dir}")
            return

        count = 0
        for md_file in research_dir.glob("*.md"):
            # Parse filename: {carrier}_DR{n}_{topic}.md
            filename = md_file.stem
            match = re.match(r'(.+)_DR(\d)_(.+)', filename)

            if not match:
                continue

            carrier_name = match.group(1).replace('_', ' ')
            dr_number = match.group(2)
            topic = match.group(3).replace('_', ' ')

            # Normalize carrier name
            carrier_display = self._display_carrier_name(carrier_name)

            # Read content
            with open(md_file, 'r') as f:
                content = f.read()

            # Get org ID
            org_id = self.db.get_or_create_organization(
                self._normalize_carrier_name(carrier_display),
                carrier_display
            )

            # Create document
            title = f"{carrier_display} - DR{dr_number}: {topic.title()}"
            metadata = {
                "carrier": carrier_display,
                "dr_number": int(dr_number),
                "topic": topic,
                "year": self.year
            }

            doc_id = self.db.insert_document(
                title=title,
                document_type="research",
                content=content,
                metadata=metadata,
                file_path=str(md_file)
            )

            # Link to org
            self.db.link_document_to_org(doc_id, org_id, "research")

            count += 1

        print(f"  ✓ Loaded {count} research documents")

    def load_question_scorecards(self):
        """Load question scorecard JSON files (question-oriented performance data)"""
        scorecard_dir = self.kb_path / str(self.year) / "question_scorecards" / "json"

        if not scorecard_dir.exists():
            print(f"  ⚠️  Question scorecard directory not found: {scorecard_dir}")
            return

        count = 0
        for json_file in scorecard_dir.glob("*.json"):
            with open(json_file, 'r') as f:
                data = json.load(f)

            metadata = data.get("metadata", {})
            question = metadata.get("question")
            product = metadata.get("product")

            if not question or not product:
                continue

            # Get product ID
            product_id = self.db.get_or_create_product(product, product)

            # Create document
            title = f"{question} - {product} ({self.year})"
            doc_id = self.db.insert_document(
                title=title,
                document_type="question_scorecard",
                content=json.dumps(data),
                metadata=metadata,
                file_path=str(json_file)
            )

            # Link to product
            self.db.link_document_to_product(doc_id, product_id)

            count += 1

        print(f"  ✓ Loaded {count} question scorecards")

    def load_production_history(self):
        """Load production history JSON file"""
        prod_file = self.kb_path / str(self.year) / "production_history" / "json" / f"production_history_{self.year}.json"

        if not prod_file.exists():
            print(f"  ⚠️  Production history file not found: {prod_file}")
            return

        with open(prod_file, 'r') as f:
            data = json.load(f)

        metadata = data.get("metadata", {})

        # Create a single document for all production history
        title = f"Production History {self.year}"
        doc_id = self.db.insert_document(
            title=title,
            document_type="production_history",
            content=json.dumps(data),
            metadata=metadata,
            file_path=str(prod_file)
        )

        # Link each carrier mentioned in production history
        carriers = data.get("carriers", [])
        linked_count = 0
        for carrier_data in carriers:
            carrier_display = carrier_data.get("carrier_display")
            if carrier_display:
                org_id = self.db.get_or_create_organization(
                    self._normalize_carrier_name(carrier_display),
                    carrier_display
                )
                self.db.link_document_to_org(doc_id, org_id, "production_history")
                linked_count += 1

        print(f"  ✓ Loaded production history ({linked_count} carriers)")

    def _normalize_carrier_name(self, name: str) -> str:
        """Normalize carrier name for database storage"""
        # Convert to lowercase, replace spaces with underscores
        return name.lower().replace(' ', '_').replace('&', 'and')

    def _display_carrier_name(self, filename_carrier: str) -> str:
        """Convert filename carrier name to display name"""
        # Handle special cases
        if filename_carrier.lower() == "augusta financial" or filename_carrier.lower() == "augustar financial":
            return "Augusta Financial"
        elif filename_carrier.lower() == "protective life":
            return "Protective Life"

        # Default: title case
        return filename_carrier.title()


def main():
    """Main function to run data loading"""
    print("=" * 60)
    print("SIM-KB Light Test - Data Loader")
    print("=" * 60)

    # Initialize database
    db = DBManager()
    print(f"\n📁 Database: {db.db_path}")

    # Initialize schema
    print("\n🔧 Initializing database schema...")
    db.initialize_schema()
    print("✅ Schema initialized")

    # Load data
    loader = DataLoader(db)
    loader.load_all()

    # Show summary
    print("\n" + "=" * 60)
    print("📊 Database Summary:")
    print("=" * 60)

    with db:
        orgs = db.query("SELECT COUNT(*) as count FROM organizations")
        products = db.query("SELECT COUNT(*) as count FROM products")
        roles = db.query("SELECT COUNT(*) as count FROM roles")
        docs = db.query("SELECT COUNT(*) as count FROM documents")

        print(f"  Organizations: {orgs[0]['count']}")
        print(f"  Products: {products[0]['count']}")
        print(f"  Roles: {roles[0]['count']}")
        print(f"  Documents: {docs[0]['count']}")

    print("\n✨ Data loading complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
