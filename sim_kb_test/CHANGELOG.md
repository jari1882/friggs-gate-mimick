# SIM-KB Change Log

## 2024-12-30 - Restructured to Two-Mode System

**Major Change:** Completely restructured the system to support two distinct operating modes with different data sources and perspectives.

**Background:** The system needed to handle two very different query types:
1. General carrier performance analysis (e.g., "How did Protective Life perform in Life insurance in 2026?")
2. Role-based question analysis with competitive comparison (e.g., "For underwriting, how did Protective Life perform relative to other companies?")

**Changes Made:**

### 1. Added New Data Sources
- **Question Scorecards**: Loaded 71 question scorecard documents showing how all carriers performed on specific questions (e.g., "Business Confidence - Life", "Compensation - Annuity")
- **Production History**: Loaded production history data for 20 carriers (year-over-year performance, market share)
- Total documents increased from 51 to 174

**Files Modified:**
- `data_loader.py`:
  - Added `load_question_scorecards()` method (loads 71 files from question_scorecards/json/)
  - Added `load_production_history()` method (loads production_history_2026.json)
  - Updated `load_all()` to call these methods

### 2. Added Three New Tools to LLM Navigator

**MODE 1 Tools:**
- `get_production_history(carrier_name)` - Returns production data (2022-2026), YoY growth, market share

**MODE 2 Tools:**
- `get_question_scorecard(question_name, product_type)` - Returns all carriers' performance on a specific question, ranked
- `get_role_perspective(role_name)` - Returns role information (goal, backstory) to assume that role's perspective

**Files Modified:**
- `llm_navigator.py`:
  - Added three new tool specifications to `_get_tools_spec()`
  - Added three implementation methods
  - Updated `_execute_tool()` to handle new tools
  - Tool count increased from 7 to 10

### 3. Restructured Schema Prompt with Two-Mode Logic

**MODE 1: Carrier Performance Analysis (General Perspective)**
- **Triggers**: "What was [carrier]'s [product] performance in 2026?"
- **Data**: Carrier scorecard + production history
- **Perspective**: General LLM, no role assumption
- **Focus**: Overall performance, trends, rankings across all questions

**MODE 2: Role-Based Question Analysis (CPO Perspective)**
- **Triggers**: "For [question], how did [carrier] perform?"
- **Data**: Role perspective (CPO) + question scorecard
- **Perspective**: LLM assumes CPO role and speaks from that backstory
- **Focus**: Specific question performance, competitive comparison
- **CPO Questions** (~5 types):
  - Products that Meet Customer Need
  - Compensation (including Permanent, Term)
  - Underwriting - Medical
  - Underwriting - Financial
  - Communication with Underwriting

**Files Modified:**
- `llm_navigator.py`:
  - Completely rewrote `get_schema_prompt()` with mode selection logic
  - Added trigger patterns for each mode
  - Added step-by-step process for each mode
  - Organized tools into MODE 1, MODE 2, and General categories

### Expected Behavior After Changes:

**Mode 1 Example:**
```
User: "What was Protective Life's Life performance in 2026?"
System:
  1. Calls get_scorecard("Protective Life", "Life")
  2. Calls get_production_history("Protective Life")
  3. Responds as general LLM with overview of all metrics + production trends
```

**Mode 2 Example:**
```
User: "For underwriting, how did Protective Life perform relative to other companies?"
System:
  1. Calls get_role_perspective("CPO") to assume role
  2. Calls get_question_scorecard("Underwriting - Medical", "Life")
  3. Responds AS the CPO, using their backstory and perspective
  4. Compares Protective Life to all other carriers in the question scorecard
```

**Database Changes:**
- Documents increased: 51 → 174
- New document types: `question_scorecard`, `production_history`
- No schema changes needed (existing document structure supports new types)

**Rollback:**
If this causes issues, you can revert by:
1. Restore previous `llm_navigator.py` from git
2. Restore previous `data_loader.py` from git
3. Re-run `setup_database.py` to reload old data structure

---

## 2024-12-28 - Added get_document_content Tool

**Issue:** LLM could list documents but couldn't access their actual content. When user asked "what do the research documents say about underwriting", LLM responded "I don't have access to the content."

**Root Cause:** The `get_carrier_documents` tool only returns document titles and metadata, not content. SQL query was: `SELECT d.title, d.document_type, d.metadata` (missing `d.content`).

**Fix Applied:**
Added new tool: `get_document_content(document_title, carrier_name)` that:
1. Searches for a document by title (with optional carrier filter)
2. Returns the FULL content (markdown for research, JSON for scorecards)
3. Limits to 8000 chars to prevent token overflow
4. Allows targeted content access instead of loading everything

**Changes Made:**
- Added `get_document_content()` function to LLMNavigator class
- Added tool spec to `_get_tools_spec()` (now 7 tools total)
- Added tool execution to `_execute_tool()`
- Updated schema prompt to explain when to use this tool
- Clarified that `get_carrier_documents` returns titles only

**Expected Behavior After Fix:**
- "Tell me about Protective Life" → Lists documents (lightweight)
- "What does DR2 say about underwriting?" → Calls get_document_content("DR2", "Protective Life") → Returns full markdown content

**Files Modified:**
- `llm_navigator.py` (added tool, ~65 lines)

**Testing:**
Ask: "What do the research documents say about Protective Life's underwriting position?"
Should now call get_document_content and provide actual content.

---

## 2024-12-26 - Schema Prompt Update: 2026 vs 2025 Data Clarification

**Issue:** LLM was showing 2025 scores instead of 2026 scores when users asked about carrier performance.

**Root Cause:** Scorecard JSON files contain both years:
- `n_score` / `rank_current` = 2026 data (current year)
- `py_n_score` / `py_rank` = 2025 data (prior year)

LLM had no instructions about which fields to use by default.

**Fix Applied:**
Updated `llm_navigator.py` schema prompt (lines 64-84) to include:

1. **CRITICAL section** explaining scorecard data structure
2. **Field mapping** clearly labeling which fields are 2026 vs 2025
3. **Rules** telling LLM to:
   - Use 2026 data (`n_score`, `rank_current`) BY DEFAULT
   - Only use 2025 data when specifically asked about prior year
   - Provide context when showing deltas

**Expected Behavior After Fix:**
- "How did Protective Life perform?" → Shows 2026 scores
- "How did Protective Life perform in 2025?" → Shows 2025 scores
- "Compare 2026 vs 2025" → Shows both with context

**Files Modified:**
- `llm_navigator.py` (schema prompt)

**Testing:**
After this change, restart the chat interface and ask:
- "How did Protective Life perform in Annuities?"
- Should now show 2026 data (n_score = 0.7, rank = 12, etc.)

**Rollback:**
If this causes issues, the schema prompt can be reverted by removing the "CRITICAL: Scorecard Data Structure" section.

---

**Note:** This is a prompt-only fix. No database schema or data was changed. The raw scorecard JSON files contain both years and are unchanged.
