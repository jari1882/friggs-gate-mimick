# 🚪 Frigg's Gate – Life Nervous System Frontend

> **Status**: ✅ Development Ready: Complete · 🎯 Production Integration Phase · 🧠 Agent Ready · 🔄 Active Development

**Agent-optimized frontend interface** to the Life Nervous System (LNS) with Next.js architecture and structured workspace coordination. **Pointer-based documentation** - follow references rather than duplicating implementation details.

---

## 1. 🎯 Purpose

Web-based cognitive interface providing structured input/output workspace for LNS interaction. Features real-time streaming, citation tracking, and multi-panel workspace coordination for agent-driven workflows.

**Start with**: `yarn dev` then open [http://localhost:3000](http://localhost:3000).

---

## 2. 🧠 Architecture Summary

### Core Systems
- **Chat Interface**: `app/components/ChatWindow.tsx` - Pure UI layer with no business logic
- **Connection Service**: `app/services/connectionService.ts` - Clean WebSocket transport (text in → text out)
- **Workspace Coordination**: Structured input panels, output dock, resizable layout system  
- **State Management**: Zustand-based persistent user preferences + session workspace state
- **Backend Integration**: Direct connection to 🌈 Rainbow Bridge → 🌀 Bifrost orchestration

### Structure
- **`/app/`**: Next.js 13 App Router architecture (components, hooks, services, utils)
- **`/docs/`**: Agent-optimized development guides and mental models
- **`/public/`**: Static assets and branding

### Quality
- **Agent-Ready**: Complete mental model documentation for rapid agent onboarding
- **Production Architecture**: Next.js 13.5.4, TypeScript 5.1.6, Tailwind CSS 3.3.3
- **Security Hardened**: DOMPurify XSS protection, CSP headers, input validation
- **Performance Optimized**: SSR, code splitting, streaming responses

---

## 3. 📚 Documentation

- **README.md**: Agent-optimized navigation hub (this file)
- **docs/mental-model.md**: Complete development guide with behavior-first editing approach

---

## 4. 🚀 Quick Start

**Environment**: Requires Node.js and Yarn

```bash
# Install dependencies
yarn install

# Development server
yarn dev

# Production build
yarn build && yarn start
```

---

## 5. 🔑 Key Entry Points

| Purpose | File |
|---------|------|
| **Master Controller** | **`app/components/ChatWindow.tsx`** (Pure UI layer - no business logic) |
| **Connection Service** | **`app/services/connectionService.ts`** (Clean WebSocket transport) |
| **WebSocket Hook** | **`app/hooks/useWebSocket.ts`** (Simple connection management) |
| **Structured Input** | **`app/components/StructuredInput.tsx`** (Left panel forms) |
| **Output Display** | **`app/components/StructuredOutputDock.tsx`** (Right panel results) |
| **State Management** | **`app/hooks/useFriggState.ts`** (Persistent preferences) |
| **Workspace Logic** | **`app/hooks/useWorkspaceCoordinator.ts`** (Dynamic session state) |
| **Global Styles** | **`app/globals.css`** (Foundation styling) |
| Configuration | `package.json`, `tailwind.config.ts`, `next.config.js` |

---

## 6. 📁 Directory Map

```
FRIGGS-GATE/ (LNS Frontend)
├── app/                           # Next.js App Router
│   ├── components/                # UI building blocks
│   │   ├── ChatWindow.tsx         # Master interface controller
│   │   ├── StructuredInput.tsx    # Left panel workspace forms
│   │   ├── StructuredOutputDock.tsx  # Right panel results display
│   │   ├── ChatMessageBubble.tsx  # Individual message rendering
│   │   └── [theme, input, citation components]
│   ├── hooks/                     # State management
│   │   ├── useFriggState.ts       # Persistent user preferences
│   │   └── useWorkspaceCoordinator.ts  # Dynamic workspace state
│   ├── services/                  # Connection layer
│   │   ├── connectionService.ts   # Clean WebSocket transport
│   │   └── responseInterpreter.ts # Workspace coordination
│   ├── utils/                     # Shared utilities
│   ├── globals.css                # Foundation styles
│   ├── layout.tsx                 # Root layout + providers
│   └── page.tsx                   # Entry point (renders ChatWindow)
├── docs/                          # Agent development guides
│   └── mental-model.md            # Complete editing roadmap
├── public/                        # Static assets
└── [config files]                 # Next.js, Tailwind, TypeScript
```

---

## 7. 🤖 Agent Implementation Guidelines

- **Pure UI Layer**: `ChatWindow.tsx` only handles presentation - no protocol knowledge
- **Connection Layer**: `ConnectionService` handles all WebSocket communication with Rainbow Bridge
- **Clean Interface**: Use `sendMessage(content: string): Promise<string>` for all backend communication
- **Workspace Panels**: Extend `StructuredInput.tsx` for new tools, `StructuredOutputDock.tsx` for results
- **State Management**: Use `useFriggState` for persistent settings, `useWorkspaceCoordinator` for session state
- **Styling**: Tailwind utility classes only (no separate CSS files)
- **Mental Model**: See `docs/mental-model.md` for behavior-first editing approach

---

## 8. 🔌 Rainbow Bridge Connection

**Endpoint**: `ws://localhost:8001/ws` (env: `NEXT_PUBLIC_WS_BASE_URL`)

**Clean Message Format**:
```typescript
{
  type: "chat_message",
  payload: { content: string }
}
```

**Response Format**:
```typescript
{
  success: boolean,
  content?: string,
  error?: string
}
```

**Pure Transport**: Text in → Text out via `ConnectionService` interface

**Connection**: Auto-connect, auto-reconnect (5 attempts, 3s delay)

**Architecture**: Friggs Gate → Rainbow Bridge → Bifrost Orchestrator

---

## 9. 🧠 State Architecture

```
useFriggState.ts (Persistent - localStorage)     useWorkspaceCoordinator.ts (Session - memory)
├── Panel widths/positions                        ├── Current tool selection
├── Theme settings                                ├── Panel visibility  
└── User preferences                              └── Dynamic content
```

**Flow**: User Action → Store Update → Component Re-render → WebSocket Response → ResponseInterpreter → UI Update

---

## 10. ⚠️ Development Constraints

- **Pure transport layer** - ConnectionService only handles WebSocket communication
- **No business logic** - ChatWindow is pure UI, no protocol knowledge
- **Clean interface** - Text in → Text out only
- **Rainbow Bridge protocol** - Uses new message format
- **Tailwind styling** - no separate CSS files
- **TypeScript strict mode** - required
- **DOMPurify** - required for user content
- **Two-store state** - persistent vs session separation

---

## 11. 🔧 Development Commands

| Command | Purpose |
|---------|---------|
| `yarn dev` | Development server (port 3000) |
| `yarn build` | Production build |
| `yarn lint` | ESLint validation |
| `yarn format` | Prettier code formatting |