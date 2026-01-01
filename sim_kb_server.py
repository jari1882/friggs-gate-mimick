"""
Simple HTTP server for SIM-KB Test integration with Frigg's Gate
Provides a REST API endpoint that wraps the sim_kb_test chat interface
"""

import sys
import os
from pathlib import Path

# Load .env from bifrost-mimick BEFORE importing sim_kb_test modules
from dotenv import load_dotenv
bifrost_env_path = Path.home() / "bifrost-mimick" / ".env"
if bifrost_env_path.exists():
    print(f"📋 Loading environment from {bifrost_env_path}")
    load_dotenv(bifrost_env_path)
    print(f"✅ Environment loaded - API key {'found' if os.getenv('OPENAI_API_KEY') else 'NOT FOUND'}")
else:
    print(f"⚠️  Warning: .env file not found at {bifrost_env_path}")
    print(f"   Make sure OPENAI_API_KEY is set in your environment")

from flask import Flask, request, jsonify
from flask_cors import CORS

# Add sim_kb_test to path
sys.path.insert(0, str(Path(__file__).parent / "sim_kb_test"))

try:
    from sim_kb_test.db_manager import DBManager
    from sim_kb_test.llm_navigator import LLMNavigator
except ImportError:
    from db_manager import DBManager
    from llm_navigator import LLMNavigator

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

# Initialize sim_kb_test components
db = None
navigator = None
conversation_state = {}  # Store conversation history per session


def get_navigator():
    """Lazy initialization of navigator"""
    global db, navigator
    if navigator is None:
        print("🔧 Initializing DBManager and LLMNavigator...")
        try:
            db = DBManager()
            print(f"✅ DBManager initialized")
            navigator = LLMNavigator(db)
            print(f"✅ LLMNavigator initialized")
        except Exception as e:
            print(f"❌ Error initializing navigator: {e}")
            import traceback
            traceback.print_exc()
            raise
    return navigator


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "sim-kb-server"})


@app.route('/sim/chat', methods=['POST'])
def chat():
    """
    Chat endpoint for SIM-KB

    Request body:
        {
            "message": "your question here",
            "session_id": "optional-session-id"
        }

    Response:
        {
            "response": "assistant response",
            "success": true
        }
    """
    try:
        data = request.get_json()
        print(f"📥 Received request: {data}")

        if not data or 'message' not in data:
            return jsonify({
                "success": False,
                "error": "Missing 'message' in request body"
            }), 400

        message = data['message']
        session_id = data.get('session_id', 'default')

        # Get navigator
        nav = get_navigator()

        # Handle special commands
        if message.lower() in ['exit', 'quit']:
            if session_id in conversation_state:
                del conversation_state[session_id]
            return jsonify({
                "success": True,
                "response": "Exiting SIM-KB mode."
            })

        if message.lower() == 'clear':
            nav.reset_conversation()
            if session_id in conversation_state:
                conversation_state[session_id] = []
            return jsonify({
                "success": True,
                "response": "Conversation history cleared."
            })

        if message.lower() == 'stats':
            with db:
                stats = {
                    'Organizations': db.query("SELECT COUNT(*) as count FROM organizations")[0]['count'],
                    'Products': db.query("SELECT COUNT(*) as count FROM products")[0]['count'],
                    'Roles': db.query("SELECT COUNT(*) as count FROM roles")[0]['count'],
                    'Documents': db.query("SELECT COUNT(*) as count FROM documents")[0]['count'],
                    'Embeddings': db.query("SELECT COUNT(*) as count FROM embeddings")[0]['count'],
                }

            stats_text = "# SIM-KB Statistics\n\n"
            for entity_type, count in stats.items():
                stats_text += f"- **{entity_type}:** {count}\n"

            if stats['Embeddings'] == 0:
                stats_text += "\n⚠️ **Semantic search not available** - Run `python index_documents.py` to enable"

            return jsonify({
                "success": True,
                "response": stats_text
            })

        if message.lower() == 'help':
            help_text = """# SIM-KB Help

Ask me anything about the insurance carriers in the knowledge base!

## Example Questions:
- "What carriers do we have data for?"
- "Tell me about Protective Life"
- "How did Protective Life perform in Annuities?"
- "What are the BPSer team roles?"

## Commands:
- **clear** - Clear conversation history
- **stats** - Show database statistics
- **help** - Show this help message
- **exit** - Exit SIM-KB mode
"""
            return jsonify({
                "success": True,
                "response": help_text
            })

        # Process with LLM
        try:
            response = nav.chat(message)

            # Store in conversation history
            if session_id not in conversation_state:
                conversation_state[session_id] = []
            conversation_state[session_id].append({
                "user": message,
                "assistant": response
            })

            return jsonify({
                "success": True,
                "response": response
            })

        except Exception as e:
            print(f"❌ Error processing message: {e}")
            import traceback
            traceback.print_exc()
            return jsonify({
                "success": False,
                "error": f"Error processing message: {str(e)}"
            }), 500

    except Exception as e:
        print(f"❌ Server error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": f"Server error: {str(e)}"
        }), 500


@app.route('/sim/reset', methods=['POST'])
def reset():
    """Reset conversation history"""
    try:
        data = request.get_json() or {}
        session_id = data.get('session_id', 'default')

        nav = get_navigator()
        nav.reset_conversation()

        if session_id in conversation_state:
            del conversation_state[session_id]

        return jsonify({
            "success": True,
            "message": "Conversation reset"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == '__main__':
    print("🚀 Starting SIM-KB Server...")
    print("📡 Listening on http://localhost:5001")
    print("💬 Chat endpoint: POST http://localhost:5001/sim/chat")
    print("🔄 Reset endpoint: POST http://localhost:5001/sim/reset")
    print("❤️  Health check: GET http://localhost:5001/health")
    app.run(host='0.0.0.0', port=5001, debug=True)
