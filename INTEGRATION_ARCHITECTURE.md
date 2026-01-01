# SIM-KB Integration Architecture
## Why This Pattern Works & What's Next

---

## How It Works (The Simple View)

### What We Built

**Type `/sim` in the chat** → Enter a specialized mode that talks to our insurance carrier knowledge base

```
User types in friggs-gate chat
    ↓
ChatWindow.tsx (React component)
    ↓
    Checks: Are we in /sim mode?
    ↓
    YES → HTTP request to sim_kb_server.py (Python)
    NO  → WebSocket to Rainbow Bridge (normal chat)
    ↓
sim_kb_server.py → sim_kb_test → OpenAI + SQLite
    ↓
Response flows back through the chain
```

### The 3-Panel Mental Model

Frigg's Gate has **3 independent panels**:
- **Left**: Structured inputs (forms, tools)
- **Middle**: Unstructured chat (conversations)
- **Right**: Structured outputs (terminal-style results)

**Key insight**: The middle panel (chat) is just a message router. It doesn't care *where* responses come from - WebSocket, HTTP, local functions, whatever. We exploited this.

### How We Wired It

**1. Added a toggle state** (`isSimMode: boolean`)
   - Type `/sim` → toggle ON
   - Type `/sim` again → toggle OFF

**2. Conditional routing in the message handler**
```typescript
if (isSimMode) {
    // Send to HTTP server at localhost:5001
    response = await fetch('http://localhost:5001/sim/chat', {...})
} else {
    // Send to WebSocket (normal Bifrost)
    response = await sendWebSocketMessage(messageValue)
}
```

**3. Separate backend server** (`sim_kb_server.py`)
   - Flask HTTP server on port 5001
   - Wraps the sim_kb_test Python module
   - Returns markdown-formatted responses

**That's it.** No changes to Bifrost. No changes to the 3-panel layout. Just a mode switch in the middle panel.

---

## Why This Is Good

### 1. **Zero Breaking Changes**
Frigg's Gate still works exactly the same. `/sim` is an *addition*, not a modification.

### 2. **Clean Separation**
- **Frontend**: Stays pure React/TypeScript/Next.js
- **Backend**: Python code lives in Python land
- **Data**: SQLite database separate from chat history

### 3. **Independent Scaling**
- Can restart sim backend without touching frontend
- Can add more HTTP endpoints without modifying chat UI
- Each system has its own error handling

### 4. **Reusable Pattern**
This same approach works for *any* specialized mode:
- `/crew` for CrewAI agent orchestration
- `/analyze` for financial analysis
- `/research` for deep research mode

---

## What's Next: CrewAI Integration

### What We Have in Bifrost-Mimick

**Hel's Shadow**: A full CrewAI implementation with:
- **6-agent BPSer Crew** (CPO, COO, CDO, CFO, CEO, Writer)
- **YAML-driven configs** (agents.yaml, tasks.yaml)
- **Sequential task execution** with context passing
- **Real data injection** from knowledge base

**Example**: Type "Analyze Protective Life" → Crew runs 6 agents → Each writes a section → Combined into final report

### How to Wire It Into Frigg's Gate

**Same pattern as /sim:**

1. **Add `/crew` command** in commands.ts
2. **Add crew mode state** (`isCrewMode: boolean`)
3. **Create crew_server.py** (Flask HTTP server on port 5002)
4. **Route crew questions** to the new backend

**User experience:**
```
Type: /crew
Response: "CrewAI mode active. Which crew would you like to run?"

Type: Analyze Northwestern Mutual with BPSer crew
Response: [6 agents execute sequentially, each building on the last]
          [Final comprehensive report appears]
```

### Why This Architecture Works for Crews

**CrewAI needs**:
- Sequential execution (can take 30-60 seconds)
- Progress updates ("Agent 2 of 6 working...")
- Data access (knowledge base, documents)
- Configuration management (which crew, which data)

**Our pattern provides**:
- **Time**: HTTP requests can be long-running
- **Streaming**: Can add SSE for progress updates later
- **Data**: Direct access to bifrost-mimick modules
- **Isolation**: Crew crashes don't affect main chat

---

## The Bigger Picture

### Current State
```
Frigg's Gate (React UI)
    ↓
Middle Panel Router
    ↓
    ├─ Normal mode → Rainbow Bridge → Bifrost
    └─ /sim mode → sim_kb_server → SIM-KB
```

### Future State (3-6 months)
```
Frigg's Gate (React UI)
    ↓
Middle Panel Router
    ↓
    ├─ Normal mode → Rainbow Bridge → Bifrost
    ├─ /sim mode → sim_kb_server → SIM-KB
    ├─ /crew mode → crew_server → CrewAI (BPSer, GAM, etc.)
    ├─ /analyze mode → analysis_server → Financial Analysis
    └─ /research mode → research_server → Deep Research
```

**Each mode**:
- Has its own backend server
- Uses its own data sources
- Returns in its own format
- Doesn't interfere with others

### Why This Scales

**Adding new modes is trivial:**
1. Create `{mode}_server.py` (copy sim_kb_server.py)
2. Add `/{mode}` to commands.ts
3. Add routing logic in ChatWindow.tsx (5 lines of code)
4. Deploy backend on new port

**No core architecture changes needed.**

---

## Technical Notes

### Port Allocation
- 3000: Next.js frontend (friggs-gate)
- 8001: Rainbow Bridge WebSocket (bifrost)
- 5001: SIM-KB HTTP server
- 5002: CrewAI HTTP server (future)
- 5003: Analysis HTTP server (future)

### Why HTTP Instead of WebSocket for Modes?

**WebSocket** = Real-time bidirectional communication
- Good for: Chat, streaming responses, live updates
- Used by: Rainbow Bridge (main chat)

**HTTP** = Request-response, stateless
- Good for: Distinct tasks with clear start/end
- Used by: SIM-KB queries, crew execution, analysis runs

**Hybrid approach** = Best of both worlds

### Data Flow Comparison

**Normal Chat** (WebSocket):
```
User → ChatWindow → WebSocket → Rainbow Bridge → Orchestrator → LLM → Back
```

**SIM Mode** (HTTP):
```
User → ChatWindow → HTTP POST → sim_kb_server → LLMNavigator → OpenAI + DB → Back
```

**Future Crew Mode** (HTTP + potential SSE):
```
User → ChatWindow → HTTP POST → crew_server → CrewAI → 6 Agents → Back
                        ↓ (optional)
                    SSE stream for progress
```

---

## Summary

**What we did**: Added a mode switch in the middle panel that routes to different backends

**Why it works**: Clean separation, no breaking changes, reusable pattern

**What's next**: Apply same pattern for CrewAI, financial analysis, research modes

**Key principle**: The chat UI is just a message router. Backends do the heavy lifting. Keep them independent.

---

**Questions to consider:**
1. Do we want progress updates for long-running crews? (Would need SSE streaming)
2. Should crew results go to the right panel (structured output) or middle (chat)?
3. Do we want a crew selector UI in the left panel, or keep it all in chat?

**Ready to discuss implementation plan when you are.**
