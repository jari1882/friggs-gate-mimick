# SIM-KB Light Test

A lightweight, Schema.org-aligned knowledge base with semantic search and LLM-navigable graph traversal for BPSer data.

## Overview

SIM-KB (Simulation Knowledge Base) establishes a foundational knowledge architecture for the BPSer system, enabling:

- **Structured Knowledge Graph** - Schema.org types (Organizations, Products, CreativeWork, Roles, Offers)
- **Semantic Search** - OpenAI embeddings with vector similarity search
- **Graph Traversal** - Navigate relationships between carriers, products, documents
- **LLM Navigation** - Schema-aware query patterns for agent-driven exploration

## Architecture

### Data Model

```
Organizations (Carriers)
  ├─ has Products (Life, Annuity, ABLTC, Disability)
  ├─ has Documents (Scorecards, Research)
  └─ has Offers (Performance Metrics)

Products
  ├─ has Documents (Scorecards)
  └─ has Offers (Performance Metrics)

Roles (BPSer Team)
  └─ CPO, COO, CDO, CFO, CEO, Pitch Bitch
```

### Components

1. **db_manager.py** - SQLite database management with Hemlix IDs
2. **data_loader.py** - Load data from knowledge base directory
3. **semantic_search.py** - Embedding generation and semantic search
4. **query_interface.py** - Interactive query interface
5. **sim_kb_test_utility.py** - Menu integration

## Setup

### Prerequisites

```bash
pip install openai numpy rich
export OPENAI_API_KEY="your-api-key"
```

### Initialize Database

```bash
cd /Users/jacksonrishel/bifrost-mimick/cyphers/bpser/sim_kb_test
python setup_database.py
```

This will:
1. Create SQLite database at `~/Documents/data/bpser/sim_kb_test.db`
2. Load data from `~/Documents/data/bpser/knowledge_base/2026/`
3. Optionally generate embeddings for semantic search

### Index Documents (Optional)

If you skipped embedding generation during setup:

```bash
python index_documents.py
```

## Usage

### From Menu

```
Main Menu > BPSer (6) > Utilities (8) > SIM-KB Test
```

### From Command Line

```bash
cd /Users/jacksonrishel/bifrost-mimick/cyphers/bpser/sim_kb_test
python -m query_interface
```

**For example questions and detailed usage, see [USER_GUIDE.md](USER_GUIDE.md)**

## Schema Map

```yaml
Types:
  - Organization (Insurance carriers)
  - Product (Life, Annuity, ABLTC, Disability)
  - Role (CPO, COO, CDO, CFO, CEO, PB)
  - CreativeWork (Documents: research, scorecards)
  - Offer (Performance metrics)

Relationships:
  - Organization → Products
  - Organization → Documents (scorecards, research)
  - Product → Documents (scorecards)
  - Product → Offers (performance metrics)
```

## Query Patterns

See [USER_GUIDE.md](USER_GUIDE.md) for complete examples of questions to ask and expected responses.

## Data Sources

### Loaded from Knowledge Base

- **Carriers**: Extracted from scorecard files
- **Products**: Life, Annuity, ABLTC, Disability
- **Roles**: From `BPSer_team.json`
- **Scorecards**: `carrier_scorecards/json/*.json`
- **Research**: `research/*_DR{1-5}_*.md`

### Document Types

- **carrier_scorecard** - Per-carrier performance scores
- **question_scorecard** - Per-question carrier comparisons
- **research** - Deep research documents (DR1-DR5)
- **production_history** - Historical production data

## Schema.org Alignment

All entities follow Schema.org types:

- `schema:Organization` - Carriers
- `schema:Product` - Insurance products
- `schema:Person` - Team members (not yet implemented)
- `schema:Role` - C-suite roles
- `schema:CreativeWork` - Documents
- `schema:Offer` - Performance metrics

## Future Enhancements

### Phase 1 - Schema Endpoint
- `/schema` route returns full ontology
- Navigator caches schema instead of embedding it

### Phase 2 - Graph Query Layer
- Introduce Cypher-like or GraphQL
- Explicit node/edge modeling

### Phase 3 - Property Graph
- Full graph engine
- Query planner
- Multi-hop reasoning
- Vector-augmented edge inference

## Troubleshooting

See [USER_GUIDE.md](USER_GUIDE.md) for common issues and solutions.

**Setup Issues:**
- **Database not found:** Run `python setup_database.py` to initialize
- **No semantic search results:** Check OPENAI_API_KEY is set, run `python index_documents.py`
- **Import errors:** Run from correct directory or use menu utility

## Files

```
sim_kb_test/
├── README.md                    # Technical documentation (this file)
├── USER_GUIDE.md                # End-user guide with examples and troubleshooting
├── PROJECT_SUMMARY.md           # Executive/business summary
├── __init__.py                  # Package init
├── schema.sql                   # Database schema
├── db_manager.py                # Database operations
├── data_loader.py               # Knowledge base loader
├── semantic_search.py           # Embeddings and search
├── llm_navigator.py             # AI agent with schema knowledge
├── chat_interface.py            # Natural language chat interface
├── query_interface.py           # Interactive interface
├── menu_utility.py              # Menu integration
├── setup_database.py            # Setup script
└── index_documents.py           # Indexing script
```

## Architecture Principles

From the [SIM-KB POC Plan](../../bifrost/cyphers/bpser/sim-kb/artificats/initial-plan.md):

1. **SIM-KB = Canonical Truth** - All structured knowledge lives here
2. **Schema-Ready, Named Types** - No blobs, no arbitrary dicts
3. **Versioned Boundary Types** - Named, versioned, evolvable
4. **LLM = Graph Navigator** - LLM performs traversal, SIM-KB stores data
5. **Atomic Units** - Self-contained, composable components

---

**Built**: December 2024
**Version**: 0.1.0
**Status**: POC / Testing
