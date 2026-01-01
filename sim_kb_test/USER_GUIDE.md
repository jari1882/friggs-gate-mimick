# SIM-KB User Guide

**AI-Powered Knowledge Base for BPSer Data**

---

## Quick Start (3 Steps)

1. `python main.py`
2. Press `6` (BPSer)
3. Press `8` (Utilities), then `3` (SIM-KB Test)

---

## What You Can Ask

### Carriers
- "What carriers do we have?"
- "Tell me about Protective Life"
- "What documents are available for [carrier]?"

### Performance
- "How did Protective Life perform in Annuities?"
- "Show me [carrier]'s scorecard for [product]"
- "What were [carrier]'s top/worst performing questions?"

### System
- "What products do we track?"
- "Show me the BPSer team roles"

---

## Data Available

- **25 Carriers** (Protective Life, Lincoln Financial, Augusta Financial, etc.)
- **4 Products** (Life, Annuity, ABLTC, Disability)
- **41 Scorecards** (Carrier performance by product)
- **10 Research Docs** (Deep research on carriers)
- **6 BPSer Roles** (CPO, COO, CDO, CFO, CEO, PB)

---

## Commands

- `stats` - Show database statistics
- `clear` - Clear conversation history
- `help` - Show help
- `exit` - Exit chat

---

## Quick Tips

**Do:**
- Ask in plain English
- Be specific about carrier + product for scorecards
- Try variations if not found ("Protective Life" vs "Protective")

**Don't:**
- Use commands from old system (no need!)
- Expect data we don't have (only 2026 loaded)
- Type carrier names exactly - AI understands variations

---

## 30-Second Demo Script

Perfect for showing your boss or team how the system works!

### Setup (5 seconds)

```bash
python main.py
```

Navigate to:
- Press `6` (BPSer)
- Press `8` (Utilities)
- Press `3` (SIM-KB Test)

---

### Demo Question 1: List Carriers (10 seconds)
```
What carriers do we have data for?
```

**Expected:** List of 25 insurance carriers

**Shows:** The system knows all available data

---

### Demo Question 2: Carrier Details (15 seconds)
```
Tell me about Protective Life
```

**Expected:**
- Lists documents available (2 scorecards + 5 research docs)
- Shows what products they offer (Life, Annuity)

**Shows:** AI can navigate relationships (carrier → documents)

---

### Demo Question 3: Performance Analysis (30 seconds)
```
How did Protective Life perform in Annuities?
```

**Expected:**
- Full scorecard breakdown
- Rankings for each question
- Ranking changes (up/down from prior year)
- Natural language summary

**Shows:**
- AI retrieves and formats complex data
- AI synthesizes information
- AI provides context (ranking changes)

---

### Key Points to Emphasize

1. **No Technical Skills Needed**
   - Just ask questions in plain English
   - No SQL, no file paths, no commands to remember

2. **Instant Access**
   - Seconds vs. minutes to find information
   - No digging through JSON files

3. **Smart Synthesis**
   - AI understands relationships
   - Combines multiple data sources
   - Provides context automatically

4. **Ready for Production**
   - 25 carriers loaded
   - 51 documents indexed
   - All 2026 data available
   - Can add more data anytime

5. **Built for BPSer**
   - Can integrate with crew agents
   - Replaces reading raw files
   - Foundation for knowledge-driven analysis

---

### Backup Questions (If Time Allows)

```
What are the BPSer team roles?
```
Shows: System metadata, team structure

```
What documents do we have for Lincoln Financial?
```
Shows: Cross-carrier navigation

```
Show me Protective Life's top performing questions in Annuities
```
Shows: AI can do filtered analysis

---

### Demo Talking Points

**"This is just the beginning..."**

Next steps could include:
- Semantic search across research documents
- Integration with BPSer analysis crews
- Add 2025 data for year-over-year comparisons
- API endpoints for programmatic access
- Expand to other data sources

**"The foundation is solid..."**

- Schema.org compliant (industry standard)
- SQLite database (no infrastructure needed)
- Clean separation: data storage vs. AI navigation
- Easy to expand and enhance

**Total Demo Time: 1-2 minutes**

**Goal:** Show that asking questions is faster and easier than searching files.

**Key Takeaway:** AI understands your data structure and can navigate it automatically.

---

## Complete Test Questions

Copy and paste these questions into the chat interface to test functionality!

### Basic Queries

```
What carriers do we have data for?
```

```
Tell me about Protective Life
```

```
What products do we track?
```

```
Show me the BPSer team roles
```

### Carrier-Specific Questions

```
What documents do we have for Protective Life?
```

```
What documents are available for Lincoln Financial?
```

```
Tell me about Augusta Financial
```

### Scorecard Questions

```
How did Protective Life perform in Annuities?
```

```
Show me Protective Life's Annuity scorecard
```

```
What were Protective Life's top performing questions in Annuities?
```

```
How did Protective Life rank on Business Confidence in Annuities?
```

### Research Questions

```
What research documents do we have for Protective Life?
```

```
Tell me about Protective Life's research documents
```

### Comparison Questions

```
Compare Protective Life and Lincoln Financial
```

```
Which carriers have Annuity data?
```

---

### Commands to Try

```
stats
```
Shows database statistics

```
clear
```
Clears conversation history

```
help
```
Shows help message

```
exit
```
Exits the chat

---

### Expected Behavior

**Should work:**
- Questions about carriers that exist (Protective Life, Lincoln Financial, Augusta Financial, etc.)
- Questions about products (Life, Annuity, ABLTC, Disability)
- Questions about scorecards (combining carrier + product)
- Questions about roles and system structure

**Will not work (yet):**
- Semantic search across research documents (need to run indexer first)
- Questions about 2025 data (only 2026 loaded)
- Questions about carriers not in the database

---

### Advanced Testing

Once basic queries work, try these:

#### Multi-step Questions
```
What are Protective Life's biggest weaknesses in Annuities based on their scorecard?
```

```
Which questions did Protective Life improve on in Annuities?
```

#### Synthesis Questions
```
Give me a summary of Protective Life's overall performance
```

```
What types of documents do we have for each carrier?
```

#### Navigation Questions
```
Walk me through the database structure
```

```
What relationships exist in the knowledge base?
```

---

## Troubleshooting

### "Carrier not found"
- Ask "What carriers do we have?" first
- Try full name: "Protective Life" not "Protective"
- Check spelling
- Use `stats` command to see what's in the database

### Slow response
- Wait 5-10 seconds (AI is thinking)
- First query takes longer

### API Error / OpenAI API Error
- Make sure you're in bifrost-mimick (not bifrost)
- .env file should auto-load
- Check that .env exists at: `/Users/jacksonrishel/bifrost-mimick/.env`
- The .env file should be automatically loaded

### No response
- Wait 5-10 seconds (AI is thinking)
- First query may take longer

### If you want more detailed data
- The AI provides summaries - ask follow-up questions for more detail
- Example: "Tell me more about the Business Confidence score"

### If Something Goes Wrong During Demo

**"Carrier not found"**
- Try: "Protective Life" instead of "Protective"
- Or: Ask "What carriers do we have?" first

**OpenAI API Error**
- Check: .env file has OPENAI_API_KEY
- Should auto-load from bifrost-mimick/.env

**No response**
- Wait 5-10 seconds (AI is thinking)
- First query may take longer

---

## Files & Locations

**Database:** `~/Documents/data/bpser/sim_kb_test.db`

**Code:** `/Users/jacksonrishel/bifrost-mimick/cyphers/bpser/sim_kb_test/`

**Documentation:**
- `USER_GUIDE.md` - This file (for end users and testing)
- `PROJECT_SUMMARY.md` - For your boss (business overview)
- `README.md` - Technical documentation (for developers)

---

**Questions?** Just ask the AI! That's what it's for.

**Happy Testing!**

The AI should understand these questions and navigate the database automatically to find answers.
