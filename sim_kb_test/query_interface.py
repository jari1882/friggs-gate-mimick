"""
Query Interface for SIM-KB Light Test
Interactive query and traversal interface for testing LLM-navigable knowledge graph
"""

import json
from typing import Optional, List, Dict, Any
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.markdown import Markdown

try:
    from .db_manager import DBManager
    from .semantic_search import SemanticSearch
except ImportError:
    from db_manager import DBManager
    from semantic_search import SemanticSearch


class QueryInterface:
    """Interactive query interface for SIM-KB"""

    def __init__(self, db_manager: Optional[DBManager] = None):
        """
        Initialize query interface

        Args:
            db_manager: Database manager instance (creates new if None)
        """
        self.db = db_manager or DBManager()
        self.search = SemanticSearch(self.db)
        self.console = Console()

    def show_schema_map(self):
        """Display the SIM-KB schema map for LLM navigation"""
        schema_text = """
# SIM-KB Schema Map (v0)

## Types
- **Organization** - Insurance carriers
- **Product** - Insurance product types (Life, Annuity, ABLTC, Disability)
- **Role** - C-suite roles (CPO, COO, CDO, CFO, CEO, PB)
- **CreativeWork** - Documents (research, scorecards)
- **Offer** - Performance metrics

## Relationships
- Organization **has** Products
- Organization **has** CreativeWork (scorecards, research)
- Product **has** CreativeWork (scorecards)
- Product **has** Offers (performance metrics)

## Query Patterns
1. Find carrier by name → Get scorecards/research
2. Find product → Get all carriers offering it
3. Semantic search → Find relevant documents
4. Carrier + Product → Get specific scorecard
"""
        self.console.print(Panel(Markdown(schema_text), title="📋 SIM-KB Schema", border_style="blue"))

    def list_organizations(self, limit: int = 20):
        """List all organizations"""
        rows = self.db.query(
            f"SELECT id, display_name, name FROM organizations ORDER BY display_name LIMIT {limit}"
        )

        table = Table(title="🏢 Organizations (Carriers)")
        table.add_column("ID", style="cyan")
        table.add_column("Display Name", style="green")
        table.add_column("Internal Name", style="dim")

        for row in rows:
            table.add_row(str(row['id']), row['display_name'], row['name'])

        self.console.print(table)
        self.console.print(f"\nTotal: {len(rows)} organizations")

    def list_products(self):
        """List all products"""
        rows = self.db.query(
            "SELECT id, name, product_type, description FROM products ORDER BY name"
        )

        table = Table(title="📦 Products")
        table.add_column("ID", style="cyan")
        table.add_column("Name", style="green")
        table.add_column("Type", style="yellow")
        table.add_column("Description", style="dim")

        for row in rows:
            table.add_row(
                str(row['id']),
                row['name'],
                row['product_type'],
                row['description'] or ""
            )

        self.console.print(table)

    def list_roles(self):
        """List all roles"""
        rows = self.db.query(
            "SELECT id, role_name, role_short_name, temperature FROM roles ORDER BY id"
        )

        table = Table(title="👥 BPSer Team Roles")
        table.add_column("ID", style="cyan")
        table.add_column("Role", style="green")
        table.add_column("Short", style="yellow")
        table.add_column("Temp", style="magenta")

        for row in rows:
            table.add_row(
                str(row['id']),
                row['role_name'],
                row['role_short_name'] or "",
                f"{row['temperature']:.1f}" if row['temperature'] else ""
            )

        self.console.print(table)

    def get_carrier_documents(self, carrier_name: str):
        """Get all documents for a carrier"""
        # Find organization
        org_rows = self.db.query(
            "SELECT id, display_name FROM organizations WHERE display_name LIKE ?",
            (f"%{carrier_name}%",)
        )

        if not org_rows:
            self.console.print(f"[red]❌ No carrier found matching '{carrier_name}'[/red]")
            return

        org = org_rows[0]
        self.console.print(f"\n📊 Documents for: [green]{org['display_name']}[/green]\n")

        # Get documents
        doc_rows = self.db.query(
            """SELECT d.id, d.title, d.document_type, dol.relationship_type
               FROM documents d
               JOIN document_org_links dol ON d.id = dol.document_id
               WHERE dol.organization_id = ?
               ORDER BY d.document_type, d.title""",
            (org['id'],)
        )

        if not doc_rows:
            self.console.print("[yellow]No documents found[/yellow]")
            return

        table = Table()
        table.add_column("ID", style="cyan")
        table.add_column("Type", style="yellow")
        table.add_column("Title", style="green")
        table.add_column("Relationship", style="dim")

        for row in doc_rows:
            table.add_row(
                str(row['id']),
                row['document_type'],
                row['title'],
                row['relationship_type']
            )

        self.console.print(table)
        self.console.print(f"\nTotal: {len(doc_rows)} documents")

    def get_carrier_scorecard(self, carrier_name: str, product_type: str):
        """Get carrier scorecard for a specific product"""
        # Find organization and product
        org_rows = self.db.query(
            "SELECT id, display_name FROM organizations WHERE display_name LIKE ?",
            (f"%{carrier_name}%",)
        )

        if not org_rows:
            self.console.print(f"[red]❌ No carrier found matching '{carrier_name}'[/red]")
            return

        product_rows = self.db.query(
            "SELECT id, name FROM products WHERE name LIKE ?",
            (f"%{product_type}%",)
        )

        if not product_rows:
            self.console.print(f"[red]❌ No product found matching '{product_type}'[/red]")
            return

        org = org_rows[0]
        product = product_rows[0]

        # Get scorecard
        doc_rows = self.db.query(
            """SELECT d.*
               FROM documents d
               JOIN document_org_links dol ON d.id = dol.document_id
               JOIN document_product_links dpl ON d.id = dpl.document_id
               WHERE dol.organization_id = ? AND dpl.product_id = ? AND d.document_type = 'carrier_scorecard'
               LIMIT 1""",
            (org['id'], product['id'])
        )

        if not doc_rows:
            self.console.print(f"[yellow]No scorecard found for {org['display_name']} - {product['name']}[/yellow]")
            return

        doc = doc_rows[0]
        content = json.loads(doc['content'])
        metadata = content.get('metadata', {})
        questions = content.get('questions', [])

        # Display scorecard
        self.console.print(Panel(
            f"[bold]{org['display_name']} - {product['name']} Scorecard[/bold]\n"
            f"Year: {metadata.get('year')}\n"
            f"Questions: {metadata.get('record_count')}",
            border_style="green"
        ))

        # Show top questions
        table = Table(title="Top Questions by Rank")
        table.add_column("Rank", style="cyan")
        table.add_column("Question", style="green")
        table.add_column("Score", style="yellow")
        table.add_column("Rank", style="magenta")
        table.add_column("Delta", style="red")

        for q in questions[:10]:
            rank_delta = q.get('rank_delta', 0)
            delta_str = f"+{rank_delta}" if rank_delta > 0 else str(rank_delta)
            delta_style = "green" if rank_delta > 0 else "red" if rank_delta < 0 else "dim"

            table.add_row(
                str(q.get('rank')),
                q.get('question'),
                f"{q.get('n_score', 0):.3f}",
                str(q.get('rank_current')),
                f"[{delta_style}]{delta_str}[/{delta_style}]"
            )

        self.console.print(table)

    def semantic_search_query(self, query: str, limit: int = 5):
        """Perform semantic search"""
        self.console.print(f"\n🔍 Searching for: [cyan]{query}[/cyan]\n")

        results = self.search.search(query, limit=limit)

        if not results:
            self.console.print("[yellow]No results found[/yellow]")
            return

        for i, result in enumerate(results, 1):
            similarity_pct = result['similarity'] * 100

            self.console.print(Panel(
                f"[bold]{result['title']}[/bold]\n"
                f"Type: {result['document_type']} | "
                f"Similarity: [green]{similarity_pct:.1f}%[/green]\n\n"
                f"{result['chunk_text'][:300]}...",
                title=f"Result {i}",
                border_style="blue"
            ))

    def show_statistics(self):
        """Show database statistics"""
        stats = {
            'Organizations': self.db.query("SELECT COUNT(*) as count FROM organizations")[0]['count'],
            'Products': self.db.query("SELECT COUNT(*) as count FROM products")[0]['count'],
            'Roles': self.db.query("SELECT COUNT(*) as count FROM roles")[0]['count'],
            'Documents': self.db.query("SELECT COUNT(*) as count FROM documents")[0]['count'],
            'Embeddings': self.db.query("SELECT COUNT(*) as count FROM embeddings")[0]['count'],
        }

        table = Table(title="📊 SIM-KB Statistics")
        table.add_column("Entity Type", style="cyan")
        table.add_column("Count", style="green")

        for entity_type, count in stats.items():
            table.add_row(entity_type, str(count))

        self.console.print(table)

    def interactive_mode(self):
        """Run interactive query mode"""
        self.console.print(Panel(
            "[bold cyan]SIM-KB Light Test - Query Interface[/bold cyan]\n"
            "Type 'help' for available commands",
            border_style="green"
        ))

        while True:
            try:
                command = input("\nsimkb> ").strip()

                if not command:
                    continue

                if command == "exit" or command == "quit":
                    self.console.print("[green]Goodbye![/green]")
                    break

                elif command == "help":
                    self.show_help()

                elif command == "schema":
                    self.show_schema_map()

                elif command == "stats":
                    self.show_statistics()

                elif command == "orgs":
                    self.list_organizations()

                elif command == "products":
                    self.list_products()

                elif command == "roles":
                    self.list_roles()

                elif command.startswith("carrier "):
                    carrier_name = command[8:].strip()
                    self.get_carrier_documents(carrier_name)

                elif command.startswith("scorecard "):
                    parts = command[10:].strip().split(",")
                    if len(parts) == 2:
                        self.get_carrier_scorecard(parts[0].strip(), parts[1].strip())
                    else:
                        self.console.print("[red]Usage: scorecard <carrier>, <product>[/red]")

                elif command.startswith("search "):
                    query = command[7:].strip()
                    self.semantic_search_query(query)

                else:
                    self.console.print(f"[red]Unknown command: {command}[/red]")
                    self.console.print("Type 'help' for available commands")

            except KeyboardInterrupt:
                self.console.print("\n[green]Goodbye![/green]")
                break
            except Exception as e:
                self.console.print(f"[red]Error: {e}[/red]")

    def show_help(self):
        """Show help text"""
        help_text = """
# Available Commands

## Schema & Stats
- **schema** - Show SIM-KB schema map
- **stats** - Show database statistics

## Listings
- **orgs** - List all organizations (carriers)
- **products** - List all products
- **roles** - List BPSer team roles

## Graph Traversal
- **carrier <name>** - Get all documents for a carrier
- **scorecard <carrier>, <product>** - Get specific scorecard

## Semantic Search
- **search <query>** - Perform semantic search across documents

## Examples
- `carrier Protective`
- `scorecard Protective Life, Annuity`
- `search underwriting strengths`

## Exit
- **exit** or **quit** - Exit the interface
"""
        self.console.print(Markdown(help_text))


def main():
    """Main function"""
    interface = QueryInterface()
    interface.interactive_mode()


if __name__ == "__main__":
    main()
