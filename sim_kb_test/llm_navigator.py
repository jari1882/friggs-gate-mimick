"""
LLM Navigator for SIM-KB
Schema-aware AI agent that navigates the knowledge base using natural language
"""

import json
import os
from pathlib import Path
from typing import Optional, List, Dict, Any
from openai import OpenAI

# Load .env file if it exists
try:
    from dotenv import load_dotenv
    # Look for .env in bifrost-mimick root
    env_path = Path(__file__).parent.parent.parent.parent / ".env"
    if env_path.exists():
        load_dotenv(env_path)
except ImportError:
    pass  # dotenv not installed, that's ok if env var is already set

try:
    from .db_manager import DBManager
    from .semantic_search import SemanticSearch
except ImportError:
    from db_manager import DBManager
    from semantic_search import SemanticSearch


class LLMNavigator:
    """LLM-powered knowledge base navigator with schema awareness"""

    def __init__(self, db_manager: Optional[DBManager] = None):
        """
        Initialize LLM navigator

        Args:
            db_manager: Database manager instance
        """
        self.db = db_manager or DBManager()
        self.search = SemanticSearch(self.db)
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = "gpt-4o-mini"
        self.conversation_history = []

    def get_schema_prompt(self) -> str:
        """
        Get the schema map system prompt for the LLM

        IMPORTANT (2024-12-26): Added CRITICAL section explaining scorecard data structure
        to ensure LLM uses 2026 data (n_score, rank_current) by default instead of 2025
        data (py_n_score, py_rank). See CHANGELOG.md for details.
        """
        return """You are a knowledge navigator for the SIM-KB (Simulation Knowledge Base) system.

The system operates in TWO DISTINCT MODES based on the user's question type. You MUST identify which mode to use and follow that mode's process.

# MODE SELECTION LOGIC

## MODE 1: Carrier Performance Analysis (General Perspective)
**When to use:** User asks about a carrier's overall performance for a product
**Trigger patterns:**
- "What was [carrier]'s [product] performance in 2026?"
- "How did [carrier] perform in [product]?"
- "Tell me about [carrier]'s [product] business"

**Required data:**
1. Carrier scorecard (use get_scorecard)
2. Production history (use get_production_history)

**Perspective:** General LLM - No role assumption needed

## MODE 2: Role-Based Question Analysis (CPO Perspective)
**When to use:** User asks how a carrier performed on a specific question relative to others
**Trigger patterns:**
- "For [question], how did [carrier] perform?"
- "How did [carrier] do on [question] compared to other companies?"
- "What was [carrier]'s ranking on [question]?"

**Required actions:**
1. Assume CPO role (use get_role_perspective with "CPO")
2. Get the specific question scorecard (use get_question_scorecard)
3. Analyze from CPO perspective using role's goal and backstory

**CPO Question Focus Areas (only use these ~5 questions):**
- Products that Meet Customer Need
- Compensation (including Permanent, Term variants)
- Underwriting - Medical
- Underwriting - Financial
- Communication with Underwriting

**Perspective:** You ARE the CPO - speak from their backstory and goal

# SIM-KB Schema Map

## Entity Types
- **Organization** - Insurance carriers (e.g., Protective Life, Lincoln Financial)
- **Product** - Insurance product types (Life, Annuity, ABLTC, Disability)
- **Role** - BPSer team roles (CPO, COO, CDO, CFO, CEO, Pitch Bitch)
- **CreativeWork** - Documents (carrier_scorecard, question_scorecard, research, production_history)

## Relationships
- Organization **has** Documents (scorecards, research, production history)
- Organization **offers** Products
- Product **has** Documents (scorecards, question scorecards)
- Documents contain performance data, research findings, and analysis

## CRITICAL: Scorecard Data Structure

Carrier scorecards contain performance metrics with BOTH current year (2026) and prior year (2025) data.

**Field Mapping - YOU MUST USE THE CORRECT FIELDS:**

**2026 Data (CURRENT YEAR - USE BY DEFAULT):**
- `n_score` = 2026 normalized score (0-1 scale)
- `rank_current` = 2026 rank among carriers
- `score_delta` = change from 2025 to 2026
- `rank_delta` = change in rank from 2025 to 2026

**2025 Data (PRIOR YEAR - ONLY USE WHEN SPECIFICALLY ASKED):**
- `py_n_score` = 2025 normalized score (0-1 scale)
- `py_rank` = 2025 rank among carriers

**IMPORTANT RULES:**
1. **By default, ALWAYS report 2026 data** (n_score, rank_current)
2. Only mention 2025 data (py_n_score, py_rank) when the user specifically asks about "prior year", "2025", "last year", or "year-over-year comparison"
3. When showing deltas (score_delta, rank_delta), provide context: "up from 2025" or "down from 2025"
4. The metadata.year field is always 2026 for this dataset

## Available Tools

### MODE 1 Tools (Carrier Performance):
- **get_scorecard(carrier_name, product_type)** - Get performance scorecard for carrier+product
- **get_production_history(carrier_name)** - Get production history data for carrier

### MODE 2 Tools (Role-Based Question Analysis):
- **get_role_perspective(role_name)** - Get CPO role info (goal, backstory) to assume that perspective
- **get_question_scorecard(question_name, product_type)** - Get question scorecard showing all carriers

### General Tools (use as needed):
- **list_organizations()** - List all insurance carriers
- **get_carrier_documents(carrier_name)** - Get all documents for a specific carrier (titles only)
- **get_document_content(document_title, carrier_name)** - Get the FULL CONTENT of a specific document
- **semantic_search(query)** - Search documents by semantic meaning
- **list_products()** - List all product types
- **list_roles()** - List BPSer team roles

## Your Task

**CRITICAL - Follow this process:**

1. **Identify the mode** based on user question pattern
2. **MODE 1 Process:**
   - Call get_scorecard(carrier, product)
   - Call get_production_history(carrier)
   - Synthesize as general LLM
   - Focus on overall performance, trends, rankings

3. **MODE 2 Process:**
   - First, call get_role_perspective("CPO") to assume the role
   - Call get_question_scorecard(question, product)
   - IMPORTANT: Respond AS the CPO using their backstory and perspective
   - Compare carrier's performance to others in the question scorecard
   - Only analyze CPO-relevant questions (product, compensation, underwriting)

4. **Always use 2026 data (n_score, rank_current) unless specifically asked about 2025**
5. **If data is missing or unclear, say so honestly**

Be conversational and helpful. In Mode 2, embody the CPO role fully.
"""

    def _get_tools_spec(self) -> List[Dict[str, Any]]:
        """Get OpenAI function calling spec for tools"""
        return [
            {
                "type": "function",
                "function": {
                    "name": "list_organizations",
                    "description": "List all insurance carrier organizations in the database",
                    "parameters": {
                        "type": "object",
                        "properties": {},
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_carrier_documents",
                    "description": "Get all documents (scorecards, research) for a specific carrier",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "carrier_name": {
                                "type": "string",
                                "description": "Name of the carrier (e.g., 'Protective Life', 'Lincoln Financial')"
                            }
                        },
                        "required": ["carrier_name"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_scorecard",
                    "description": "Get performance scorecard for a specific carrier and product combination",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "carrier_name": {
                                "type": "string",
                                "description": "Name of the carrier"
                            },
                            "product_type": {
                                "type": "string",
                                "description": "Product type (Life, Annuity, ABLTC, or Disability)"
                            }
                        },
                        "required": ["carrier_name", "product_type"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_document_content",
                    "description": "Get the full content of a specific document by title. Use this when user asks 'what does [document] say' or wants details from a specific document.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "document_title": {
                                "type": "string",
                                "description": "Full or partial title of the document (e.g., 'DR2', 'Protective Life DR2', 'underwriting')"
                            },
                            "carrier_name": {
                                "type": "string",
                                "description": "Optional carrier name to narrow search if title is ambiguous"
                            }
                        },
                        "required": ["document_title"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "semantic_search",
                    "description": "Search all documents using semantic similarity (finds meaning, not just keywords)",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "Search query describing what you're looking for"
                            },
                            "limit": {
                                "type": "integer",
                                "description": "Maximum number of results to return (default: 5)",
                                "default": 5
                            }
                        },
                        "required": ["query"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "list_products",
                    "description": "List all insurance product types available",
                    "parameters": {
                        "type": "object",
                        "properties": {},
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "list_roles",
                    "description": "List BPSer team roles (CPO, COO, CDO, CFO, CEO, Pitch Bitch)",
                    "parameters": {
                        "type": "object",
                        "properties": {},
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_production_history",
                    "description": "Get production history data for a specific carrier (used in Mode 1: carrier performance analysis)",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "carrier_name": {
                                "type": "string",
                                "description": "Name of the carrier to get production history for"
                            }
                        },
                        "required": ["carrier_name"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_question_scorecard",
                    "description": "Get question scorecard showing how all carriers performed on a specific question (used in Mode 2: role-based question analysis)",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "question_name": {
                                "type": "string",
                                "description": "The question name (e.g., 'Business Confidence', 'Compensation', 'Underwriting - Medical')"
                            },
                            "product_type": {
                                "type": "string",
                                "description": "Product type (Life, Annuity, ABLTC, Disability)"
                            }
                        },
                        "required": ["question_name", "product_type"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "get_role_perspective",
                    "description": "Get role information to assume that role's perspective (used in Mode 2: role-based analysis)",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "role_name": {
                                "type": "string",
                                "description": "Role short name (CPO, COO, CDO, CFO, CEO, PB)"
                            }
                        },
                        "required": ["role_name"]
                    }
                }
            }
        ]

    # Tool implementations
    def list_organizations(self) -> str:
        """List all organizations"""
        rows = self.db.query(
            "SELECT display_name, name FROM organizations ORDER BY display_name"
        )
        orgs = [row['display_name'] for row in rows]
        return json.dumps({
            "count": len(orgs),
            "organizations": orgs
        })

    def get_carrier_documents(self, carrier_name: str) -> str:
        """Get all documents for a carrier"""
        # Find organization
        org_rows = self.db.query(
            "SELECT id, display_name FROM organizations WHERE display_name LIKE ?",
            (f"%{carrier_name}%",)
        )

        if not org_rows:
            return json.dumps({"error": f"No carrier found matching '{carrier_name}'"})

        org = org_rows[0]

        # Get documents
        doc_rows = self.db.query(
            """SELECT d.id, d.title, d.document_type, dol.relationship_type, d.metadata
               FROM documents d
               JOIN document_org_links dol ON d.id = dol.document_id
               WHERE dol.organization_id = ?
               ORDER BY d.document_type, d.title""",
            (org['id'],)
        )

        documents = []
        for row in doc_rows:
            doc = {
                "title": row['title'],
                "type": row['document_type'],
                "relationship": row['relationship_type']
            }
            if row['metadata']:
                metadata = json.loads(row['metadata'])
                doc['metadata'] = metadata
            documents.append(doc)

        return json.dumps({
            "carrier": org['display_name'],
            "document_count": len(documents),
            "documents": documents
        })

    def get_scorecard(self, carrier_name: str, product_type: str) -> str:
        """Get scorecard for carrier and product"""
        # Find organization and product
        org_rows = self.db.query(
            "SELECT id, display_name FROM organizations WHERE display_name LIKE ?",
            (f"%{carrier_name}%",)
        )

        if not org_rows:
            return json.dumps({"error": f"No carrier found matching '{carrier_name}'"})

        product_rows = self.db.query(
            "SELECT id, name FROM products WHERE name LIKE ?",
            (f"%{product_type}%",)
        )

        if not product_rows:
            return json.dumps({"error": f"No product found matching '{product_type}'"})

        org = org_rows[0]
        product = product_rows[0]

        # Get scorecard
        doc_rows = self.db.query(
            """SELECT d.content, d.metadata
               FROM documents d
               JOIN document_org_links dol ON d.id = dol.document_id
               JOIN document_product_links dpl ON d.id = dpl.document_id
               WHERE dol.organization_id = ? AND dpl.product_id = ?
                 AND d.document_type = 'carrier_scorecard'
               LIMIT 1""",
            (org['id'], product['id'])
        )

        if not doc_rows:
            return json.dumps({
                "error": f"No scorecard found for {org['display_name']} - {product['name']}"
            })

        content = json.loads(doc_rows[0]['content'])
        return json.dumps({
            "carrier": org['display_name'],
            "product": product['name'],
            "scorecard": content
        })

    def semantic_search(self, query: str, limit: int = 5) -> str:
        """Perform semantic search"""
        # Check if embeddings exist
        embedding_count = self.db.query("SELECT COUNT(*) as count FROM embeddings")[0]['count']

        if embedding_count == 0:
            return json.dumps({
                "error": "Semantic search not available - embeddings not generated",
                "hint": "Run: python index_documents.py"
            })

        results = self.search.search(query, limit=limit)

        # Format results
        formatted_results = []
        for result in results:
            formatted_results.append({
                "title": result['title'],
                "document_type": result['document_type'],
                "similarity_score": f"{result['similarity'] * 100:.1f}%",
                "excerpt": result['chunk_text'][:300]
            })

        return json.dumps({
            "query": query,
            "result_count": len(formatted_results),
            "results": formatted_results
        })

    def list_products(self) -> str:
        """List all products"""
        rows = self.db.query("SELECT name, description FROM products ORDER BY name")
        products = [{"name": row['name'], "description": row['description']} for row in rows]
        return json.dumps({"products": products})

    def list_roles(self) -> str:
        """List all roles"""
        rows = self.db.query(
            "SELECT role_name, role_short_name, goal FROM roles ORDER BY id"
        )
        roles = []
        for row in rows:
            roles.append({
                "role": row['role_name'],
                "short_name": row['role_short_name'],
                "goal": row['goal']
            })
        return json.dumps({"roles": roles})

    def get_document_content(self, document_title: str, carrier_name: str = None) -> str:
        """
        Get the full content of a specific document

        Args:
            document_title: Title or partial title of the document
            carrier_name: Optional carrier name to narrow search

        Returns:
            JSON with document content
        """
        # Build query
        if carrier_name:
            # Search with carrier filter
            org_rows = self.db.query(
                "SELECT id FROM organizations WHERE display_name LIKE ?",
                (f"%{carrier_name}%",)
            )

            if not org_rows:
                return json.dumps({"error": f"No carrier found matching '{carrier_name}'"})

            org_id = org_rows[0]['id']

            doc_rows = self.db.query(
                """SELECT d.title, d.content, d.document_type, d.metadata
                   FROM documents d
                   JOIN document_org_links dol ON d.id = dol.document_id
                   WHERE dol.organization_id = ? AND d.title LIKE ?
                   LIMIT 1""",
                (org_id, f"%{document_title}%")
            )
        else:
            # Search all documents
            doc_rows = self.db.query(
                """SELECT d.title, d.content, d.document_type, d.metadata
                   FROM documents d
                   WHERE d.title LIKE ?
                   LIMIT 1""",
                (f"%{document_title}%",)
            )

        if not doc_rows:
            return json.dumps({"error": f"No document found matching '{document_title}'"})

        doc = doc_rows[0]

        # For research documents, content is markdown
        # For scorecards, content is JSON
        content = doc['content']

        # Limit content size to avoid token overflow (max 8000 chars)
        if len(content) > 8000:
            content = content[:8000] + "\n\n[Content truncated - document is very long]"

        return json.dumps({
            "title": doc['title'],
            "type": doc['document_type'],
            "content": content,
            "metadata": json.loads(doc['metadata']) if doc['metadata'] else {}
        })

    def get_production_history(self, carrier_name: str) -> str:
        """
        Get production history data for a specific carrier (Mode 1 tool)

        Args:
            carrier_name: Name of the carrier

        Returns:
            JSON with production history for the carrier
        """
        # Find organization
        org_rows = self.db.query(
            "SELECT id, display_name FROM organizations WHERE display_name LIKE ?",
            (f"%{carrier_name}%",)
        )

        if not org_rows:
            return json.dumps({"error": f"No carrier found matching '{carrier_name}'"})

        org = org_rows[0]

        # Get production history document
        doc_rows = self.db.query(
            """SELECT d.content
               FROM documents d
               JOIN document_org_links dol ON d.id = dol.document_id
               WHERE dol.organization_id = ? AND d.document_type = 'production_history'
               LIMIT 1""",
            (org['id'],)
        )

        if not doc_rows:
            return json.dumps({
                "error": f"No production history found for {org['display_name']}"
            })

        # Parse the production history JSON
        prod_data = json.loads(doc_rows[0]['content'])

        # Find this carrier's data
        carriers = prod_data.get('carriers', [])
        carrier_data = None
        for c in carriers:
            if c.get('carrier_display', '').lower() == org['display_name'].lower():
                carrier_data = c
                break

        if not carrier_data:
            return json.dumps({
                "error": f"No production history data found for {org['display_name']}"
            })

        return json.dumps({
            "carrier": org['display_name'],
            "production_history": carrier_data,
            "metadata": prod_data.get('metadata', {})
        })

    def get_question_scorecard(self, question_name: str, product_type: str) -> str:
        """
        Get question scorecard showing all carriers for a specific question (Mode 2 tool)

        Args:
            question_name: The question name
            product_type: Product type

        Returns:
            JSON with question scorecard data
        """
        # Find product
        product_rows = self.db.query(
            "SELECT id, name FROM products WHERE name LIKE ?",
            (f"%{product_type}%",)
        )

        if not product_rows:
            return json.dumps({"error": f"No product found matching '{product_type}'"})

        product = product_rows[0]

        # Get question scorecard
        doc_rows = self.db.query(
            """SELECT d.content, d.metadata
               FROM documents d
               JOIN document_product_links dpl ON d.id = dpl.document_id
               WHERE dpl.product_id = ?
                 AND d.document_type = 'question_scorecard'
                 AND d.title LIKE ?
               LIMIT 1""",
            (product['id'], f"%{question_name}%")
        )

        if not doc_rows:
            return json.dumps({
                "error": f"No question scorecard found for '{question_name}' - {product['name']}"
            })

        content = json.loads(doc_rows[0]['content'])
        return json.dumps({
            "question": question_name,
            "product": product['name'],
            "scorecard": content
        })

    def get_role_perspective(self, role_name: str) -> str:
        """
        Get role information to assume that role's perspective (Mode 2 tool)

        Args:
            role_name: Role short name (CPO, COO, CDO, CFO, CEO, PB)

        Returns:
            JSON with role information including goal and backstory
        """
        # Query for role
        role_rows = self.db.query(
            "SELECT role_name, role_short_name, goal, backstory, temperature FROM roles WHERE role_short_name LIKE ?",
            (f"%{role_name}%",)
        )

        if not role_rows:
            return json.dumps({"error": f"No role found matching '{role_name}'"})

        role = role_rows[0]
        return json.dumps({
            "role": role['role_name'],
            "short_name": role['role_short_name'],
            "goal": role['goal'],
            "backstory": role['backstory'],
            "temperature": role['temperature']
        })

    def _execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> str:
        """Execute a tool function"""
        if tool_name == "list_organizations":
            return self.list_organizations()
        elif tool_name == "get_carrier_documents":
            return self.get_carrier_documents(**arguments)
        elif tool_name == "get_scorecard":
            return self.get_scorecard(**arguments)
        elif tool_name == "get_document_content":
            return self.get_document_content(**arguments)
        elif tool_name == "semantic_search":
            return self.semantic_search(**arguments)
        elif tool_name == "list_products":
            return self.list_products()
        elif tool_name == "list_roles":
            return self.list_roles()
        elif tool_name == "get_production_history":
            return self.get_production_history(**arguments)
        elif tool_name == "get_question_scorecard":
            return self.get_question_scorecard(**arguments)
        elif tool_name == "get_role_perspective":
            return self.get_role_perspective(**arguments)
        else:
            return json.dumps({"error": f"Unknown tool: {tool_name}"})

    def chat(self, user_message: str) -> str:
        """
        Process a user message and return response

        Args:
            user_message: User's natural language query

        Returns:
            AI response
        """
        # Add user message to history
        self.conversation_history.append({
            "role": "user",
            "content": user_message
        })

        # Build messages with schema prompt
        messages = [
            {"role": "system", "content": self.get_schema_prompt()}
        ] + self.conversation_history

        # Call LLM with tools
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            tools=self._get_tools_spec(),
            tool_choice="auto"
        )

        assistant_message = response.choices[0].message

        # Handle tool calls
        if assistant_message.tool_calls:
            # Add assistant message with tool calls to history
            self.conversation_history.append({
                "role": "assistant",
                "content": assistant_message.content,
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments
                        }
                    }
                    for tc in assistant_message.tool_calls
                ]
            })

            # Execute each tool call
            for tool_call in assistant_message.tool_calls:
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)

                # Execute tool
                function_response = self._execute_tool(function_name, function_args)

                # Add tool response to history
                self.conversation_history.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": function_response
                })

            # Get final response with tool results
            messages = [
                {"role": "system", "content": self.get_schema_prompt()}
            ] + self.conversation_history

            final_response = self.client.chat.completions.create(
                model=self.model,
                messages=messages
            )

            final_message = final_response.choices[0].message.content
            self.conversation_history.append({
                "role": "assistant",
                "content": final_message
            })

            return final_message
        else:
            # No tool calls, just return response
            response_text = assistant_message.content
            self.conversation_history.append({
                "role": "assistant",
                "content": response_text
            })
            return response_text

    def reset_conversation(self):
        """Clear conversation history"""
        self.conversation_history = []
