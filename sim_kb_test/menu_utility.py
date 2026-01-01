"""
SIM-KB Test Utility
Menu utility for testing SIM-KB semantic search and graph traversal
"""

import sys
from pathlib import Path

# Add sim_kb_test to path
sim_kb_path = Path(__file__).parent.parent / "sim_kb_test"
sys.path.insert(0, str(sim_kb_path))

from infrastructure.menu_system.core.menu_manager import UtilityCommand
from rich.console import Console
from rich.panel import Panel


class SimKBTestUtility(UtilityCommand):
    """
    SIM-KB Test - Semantic Knowledge Base with LLM Navigation

    Tests the lightweight SIM-KB implementation with:
    - Schema.org-aligned knowledge graph
    - Semantic search with embeddings
    - Graph traversal (Org → Documents → Products)
    - LLM-navigable schema map
    """

    def __init__(self, name: str, description: str):
        super().__init__(name=name, description=description, category="utilities")
        self.console = Console()
        # Get the sim_kb_test directory path
        self.sim_kb_path = Path(__file__).parent

    def execute(self) -> None:
        """Execute the SIM-KB test utility"""
        try:
            from .db_manager import DBManager
            from .chat_interface import ChatInterface

            # Check if database exists
            db = DBManager()
            db_path = Path(db.db_path)

            if not db_path.exists():
                self._show_setup_required(db_path)
                return

            # Check if database is populated
            with db:
                doc_count = db.query("SELECT COUNT(*) as count FROM documents")[0]['count']

                if doc_count == 0:
                    self._show_data_load_required(db_path)
                    return

            # Launch chat interface
            self.console.print(Panel(
                "[bold cyan]SIM-KB Chat Interface[/bold cyan]\n"
                f"Database: {db_path}\n"
                f"Documents: {doc_count}\n\n"
                "Starting AI-powered chat interface...\n"
                "Ask questions in natural language!",
                border_style="green"
            ))

            interface = ChatInterface(db)
            interface.run()

        except ImportError as e:
            self.console.print(Panel(
                f"[bold red]❌ Import Error[/bold red]\n\n"
                f"Failed to import SIM-KB modules: {e}\n\n"
                f"The SIM-KB test modules may not be properly installed.",
                border_style="red"
            ))
        except Exception as e:
            self.console.print(Panel(
                f"[bold red]❌ Error[/bold red]\n\n"
                f"An error occurred: {e}",
                border_style="red"
            ))

    def _show_setup_required(self, db_path: Path):
        """Show setup instructions"""
        self.console.print(Panel(
            "[bold yellow]⚠️  SIM-KB Database Not Found[/bold yellow]\n\n"
            f"Database path: {db_path}\n\n"
            "[bold]Setup Instructions:[/bold]\n\n"
            "1. Navigate to sim_kb_test directory:\n"
            f"   cd {self.sim_kb_path}\n\n"
            "2. Run data loader to initialize database:\n"
            "   python data_loader.py\n\n"
            "3. Run semantic search indexer:\n"
            "   python semantic_search.py\n\n"
            "4. Return to menu and run this utility again",
            border_style="yellow"
        ))

    def _show_data_load_required(self, db_path: Path):
        """Show data loading instructions"""
        self.console.print(Panel(
            "[bold yellow]⚠️  SIM-KB Database is Empty[/bold yellow]\n\n"
            f"Database exists at: {db_path}\n"
            "But it contains no data.\n\n"
            "[bold]Data Loading Instructions:[/bold]\n\n"
            "1. Navigate to sim_kb_test directory:\n"
            f"   cd {self.sim_kb_path}\n\n"
            "2. Run data loader:\n"
            "   python data_loader.py\n\n"
            "3. Run semantic search indexer:\n"
            "   python semantic_search.py\n\n"
            "4. Return to menu and run this utility again",
            border_style="yellow"
        ))
