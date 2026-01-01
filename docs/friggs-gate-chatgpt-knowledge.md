# Friggs Gate - ChatGPT Knowledge Base

## Project Overview

**Friggs Gate** is the web-based frontend interface to the Life Nervous System (LNS) - a cognitive architecture platform. It serves as an agent-optimized interface providing structured input/output workspace for LNS interaction with real-time streaming, citation tracking, and multi-panel workspace coordination.

### Core Purpose
- Web-based cognitive interface for structured LNS interaction
- Real-time streaming chat with backend intelligence
- Citation tracking and multi-panel workspace coordination
- Agent-driven workflows with automated UI responses

## Architecture

### Technology Stack
- **Framework**: Next.js 13.5.4 with App Router
- **Language**: TypeScript 5.1.6 (strict mode)
- **Styling**: Tailwind CSS 3.3.3 + minimal global CSS
- **State Management**: Zustand stores
- **UI Components**: Chakra UI 2.8.1
- **Security**: DOMPurify for XSS protection
- **Real-time**: WebSocket connection to Rainbow Bridge

### Project Structure
```
friggs-gate/
├── app/                           # Next.js App Router
│   ├── components/                # UI building blocks
│   │   ├── ChatWindow.tsx         # Master interface controller
│   │   ├── StructuredInput.tsx    # Left panel workspace forms
│   │   ├── StructuredOutputDock.tsx  # Right panel results display
│   │   ├── ChatMessageBubble.tsx  # Individual message rendering
│   │   └── [theme, input, citation components]
│   ├── hooks/                     # State management
│   │   ├── useFriggState.ts       # Persistent user preferences
│   │   ├── useWebSocket.ts        # WebSocket connection management
│   │   └── useWorkspaceCoordinator.ts  # Dynamic workspace state
│   ├── services/                  # Connection layer
│   │   └── connectionService.ts   # Clean WebSocket transport
│   ├── utils/                     # Shared utilities
│   ├── config/                    # Configuration files
│   ├── globals.css                # Foundation styles
│   ├── layout.tsx                 # Root layout + providers
│   └── page.tsx                   # Entry point (renders ChatWindow)
├── docs/                          # Agent development guides
├── public/                        # Static assets
└── [config files]                 # Next.js, Tailwind, TypeScript
```

## Key Components

### ChatWindow.tsx (Master Controller)
- **Location**: `app/components/ChatWindow.tsx`
- **Purpose**: Primary UI orchestrator - handles all chat interaction
- **Key Features**:
  - Message state management
  - WebSocket communication via connectionService
  - Three-panel layout coordination (left input, center chat, right output)
  - Real-time streaming message handling
  - Integration with workspace coordinator

### State Management

#### useFriggState.ts (Persistent State)
- **Purpose**: User preferences that survive browser sessions (localStorage)
- **Manages**:
  - Theme settings (dark/light mode)
  - Font selection
  - Panel widths and minimization states
  - UI layout preferences

#### useWorkspaceCoordinator.ts (Session State)
- **Purpose**: Dynamic UI behavior during conversations (memory only)
- **Manages**:
  - Current tool selection
  - Panel visibility states
  - Structured output content
  - Form validation states

### Structured Input/Output System

#### StructuredInput.tsx (Left Panel)
- **Purpose**: Form-based tool inputs
- **Features**:
  - Tool selection (QuickQuote, LifeExpectancy, etc.)
  - Dynamic form rendering based on tool type
  - Form validation and submission
  - Resizable panel with minimization

#### StructuredOutputDock.tsx (Right Panel)
- **Purpose**: Structured results display
- **Features**:
  - Dynamic content rendering
  - Resizable panel with minimization
  - Future-ready for charts, interactive results
  - Coordinated with workspace state

### Connection Architecture

#### WebSocket Connection (Rainbow Bridge)
- **Endpoint**: `ws://localhost:8001/ws`
- **Service**: `app/services/connectionService.ts`
- **Protocol**: Clean text-in/text-out transport
- **Features**:
  - Auto-connect and auto-reconnect (5 attempts, 3s delay)
  - Clean message format for chat interactions
  - Error handling and status management

**Message Format**:
```typescript
// Outgoing
{
  type: "chat_message",
  payload: { content: string }
}

// Response
{
  success: boolean,
  content?: string,
  error?: string
}
```

## Development Workflow

### Commands
- `yarn dev` - Development server (port 3000)
- `yarn build` - Production build
- `yarn start` - Production server
- `yarn lint` - ESLint validation
- `yarn format` - Prettier code formatting

### Environment Setup
- Copy `.env.example` to `.env.local`
- Set `NEXT_PUBLIC_WS_BASE_URL` (defaults to ws://localhost:8001/ws)
- Ensure backend Rainbow Bridge is running on port 8001

### Key Dependencies
- **next@13.5.4** - Framework and server
- **react@18.2.0** - UI library
- **typescript@5.1.6** - Type safety
- **@chakra-ui/react@^2.8.1** - Component library
- **tailwindcss@3.3.3** - Utility-first styling
- **dompurify@^3.0.8** - XSS protection (required)
- **marked@^7.0.2** - Markdown parsing
- **zustand@^5.0.6** - State management

## Features

### Chat Interface
- Real-time message streaming
- Markdown rendering with syntax highlighting
- Citation tracking and inline references
- Message history management
- Auto-resizing textarea input

### Multi-Panel Layout
- **Left Panel**: Structured input forms for tools
- **Center Panel**: Chat conversation area
- **Right Panel**: Structured output display
- Resizable panels with minimum/maximum constraints
- Panel minimization for focus modes
- Responsive design with progressive disclosure

### Tool System
- **QuickQuote**: Form-based quote generation
- **LifeExpectancy**: Life expectancy calculations
- Extensible tool architecture for new form types
- Dynamic tool selection and validation

### Theme System
- Light/dark mode toggle
- Multiple font options (Montserrat, Georgia, etc.)
- Persistent user preferences
- Responsive design across screen sizes

### Security Features
- DOMPurify for all user-generated content
- TypeScript strict mode enforcement
- CSP headers and input validation
- Secure WebSocket connections

## Backend Integration

### Life Nervous System Architecture
- **Friggs Gate** (Frontend) → **Rainbow Bridge** (Gateway) → **Bifrost** (Orchestrator)
- Clean separation of concerns with pure transport layer
- No business logic in frontend - pure UI coordination
- Backend intelligence signals trigger UI state changes

### Intelligence Integration
- `responseInterpreter.ts` translates backend responses into UI actions
- Automatic panel activation based on AI responses
- Tool coordination between backend and workspace state
- Pattern detection for UI automation

## Development Guidelines

### Architecture Principles
- **Pure UI Layer**: Components handle presentation only
- **Clean Transport**: WebSocket service only handles communication
- **Behavior-First**: Start with desired behavior, trace to responsible component
- **Component Co-location**: Styles live with components via Tailwind classes

### File Organization
- **Single-purpose components**: Each component has one clear responsibility
- **Pointer-based documentation**: Follow references rather than duplicating details
- **Agent-optimized**: Documentation structured for rapid AI onboarding
- **Minimal CSS**: Only global foundation styles, everything else via Tailwind

### Security Requirements
- Always use DOMPurify for user content
- Follow TypeScript strict mode
- Validate all form inputs
- Secure WebSocket communication only

### State Management Rules
- Persistent UI preferences → `useFriggState`
- Session workspace behavior → `useWorkspaceCoordinator`
- Component-specific state → local `useState`
- Never mix persistent and session state

## Common Development Tasks

### Adding New Chat Features
1. Modify `ChatWindow.tsx` for UI changes
2. Update message handling in `sendMessage()` function
3. Add any persistent settings to `useFriggState.ts`
4. Test with WebSocket backend

### Creating New Tools
1. Add tool type to `StructuredInput.tsx` type union
2. Create new form component following existing patterns
3. Add to `toolComponents` object mapping
4. Create validation function
5. Update `useWorkspaceCoordinator.ts` tool selection type
6. Add detection pattern to `responseInterpreter.ts` if AI-triggered

### Modifying Visual Appearance
1. **App-wide changes**: Edit `globals.css`
2. **Component-specific**: Add/modify Tailwind classes in JSX
3. **Custom design tokens**: Extend `tailwind.config.ts`
4. **Never create**: Separate CSS files for components

### Panel Layout Changes
1. Identify target panel component
2. Modify resize constraints (min/max width logic)
3. Update `useResizeObserver` logic if needed
4. Test responsive behavior at different screen sizes

## Deployment

### Production Configuration
- Vercel deployment with main branch auto-deploy
- Environment variables configured via Vercel dashboard
- Static optimization for performance
- SSR for SEO and initial load speed

### Build Process
- Next.js static optimization
- Tailwind CSS purging for minimal bundle size
- TypeScript compilation and type checking
- Asset optimization and code splitting

## Mental Model for Development

### Information Flow
1. **User Input** → ChatWindow → WebSocket → Backend
2. **Backend Response** → WebSocket → ChatWindow → UI Update
3. **State Changes** → Store Updates → Component Re-renders
4. **Panel Coordination** → Workspace Coordinator → Layout Updates

### Component Hierarchy
```
layout.tsx (HTML scaffold)
└── page.tsx (entry point)
    └── ChatWindow.tsx (master controller)
        ├── Header (theme, fonts, controls)
        └── Main Layout (three-panel flex)
            ├── StructuredInput (left panel)
            ├── Chat Area (center, flex-1)
            └── StructuredOutputDock (right panel)
```

### State Architecture
```
Persistent (localStorage)     Session (memory)
├── Panel positions          ├── Current tool selection
├── Theme settings           ├── Panel visibility
└── User preferences         └── Dynamic content
```

This knowledge base provides comprehensive information about Friggs Gate for answering questions about its architecture, features, development workflow, and codebase structure.