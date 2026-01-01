"""
Natural Language Chat Interface for SIM-KB
LLM-powered conversational access to the knowledge base
"""

import sys
from pathlib import Path
from typing import Optional
from rich.console import Console
from rich.panel import Panel
from rich.markdown import Markdown

try:
    from .db_manager import DBManager
    from .llm_navigator import LLMNavigator
except ImportError:
    from db_manager import DBManager
    from llm_navigator import LLMNavigator


class ChatInterface:
    """Natural language chat interface for SIM-KB"""

    def __init__(self, db_manager: Optional[DBManager] = None):
        """
        Initialize chat interface

        Args:
            db_manager: Database manager instance
        """
        self.db = db_manager or DBManager()
        self.navigator = LLMNavigator(self.db)
        self.console = Console()

    def show_welcome(self):
        """Display welcome message"""
        welcome_text = """
# 🧠 SIM-KB Chat Interface

Ask me anything about the insurance carriers in the knowledge base!

## Example Questions:
- "What carriers do we have data for?"
- "Tell me about Protective Life"
- "How did Protective Life perform in Annuities?"
- "What are the BPSer team roles?"
- "Show me Protective Life's Annuity scorecard"
- "What documents do we have for Lincoln Financial?"

## Commands:
- **clear** - Clear conversation history
- **stats** - Show database statistics
- **help** - Show this help message
- **exit** or **quit** - Exit the chat

---

I'm connected to the SIM-KB database and ready to help!
"""
        self.console.print(Panel(Markdown(welcome_text), border_style="cyan", title="Welcome"))

    def show_stats(self):
        """Show database statistics"""
        with self.db:
            stats = {
                'Organizations': self.db.query("SELECT COUNT(*) as count FROM organizations")[0]['count'],
                'Products': self.db.query("SELECT COUNT(*) as count FROM products")[0]['count'],
                'Roles': self.db.query("SELECT COUNT(*) as count FROM roles")[0]['count'],
                'Documents': self.db.query("SELECT COUNT(*) as count FROM documents")[0]['count'],
                'Embeddings': self.db.query("SELECT COUNT(*) as count FROM embeddings")[0]['count'],
            }

        stats_text = "# 📊 SIM-KB Statistics\n\n"
        for entity_type, count in stats.items():
            stats_text += f"- **{entity_type}:** {count}\n"

        if stats['Embeddings'] == 0:
            stats_text += "\n⚠️ **Semantic search not available** - Run `python index_documents.py` to enable"

        self.console.print(Panel(Markdown(stats_text), border_style="blue"))

    def show_help(self):
        """Show help message"""
        self.show_welcome()

    def run(self):
        """Run the interactive chat loop"""
        self.show_welcome()

        while True:
            try:
                # Get user input
                user_input = self.console.input("\n[bold cyan]You:[/bold cyan] ").strip()

                if not user_input:
                    continue

                # Handle commands
                if user_input.lower() in ['exit', 'quit']:
                    self.console.print("\n[green]👋 Goodbye![/green]")
                    break

                elif user_input.lower() == 'clear':
                    self.navigator.reset_conversation()
                    self.console.print("[yellow]🔄 Conversation history cleared[/yellow]")
                    continue

                elif user_input.lower() == 'stats':
                    self.show_stats()
                    continue

                elif user_input.lower() == 'help':
                    self.show_help()
                    continue

                # Process with LLM
                self.console.print("\n[dim]Thinking...[/dim]")

                try:
                    response = self.navigator.chat(user_input)

                    # Display response
                    self.console.print(f"\n[bold green]SIM-KB:[/bold green]")
                    self.console.print(Markdown(response))

                except Exception as e:
                    self.console.print(f"\n[red]❌ Error: {e}[/red]")
                    self.console.print("[yellow]Tip: Make sure OPENAI_API_KEY is set[/yellow]")

            except KeyboardInterrupt:
                self.console.print("\n\n[green]👋 Goodbye![/green]")
                break
            except EOFError:
                self.console.print("\n\n[green]👋 Goodbye![/green]")
                break
            except Exception as e:
                self.console.print(f"\n[red]❌ Unexpected error: {e}[/red]")


def main():
    """Main entry point"""
    chat = ChatInterface()
    chat.run()


if __name__ == "__main__":
    main()
