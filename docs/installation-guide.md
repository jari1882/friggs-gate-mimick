# 🛠️ Frigg's Gate Installation Guide

This guide helps you set up Frigg's Gate for development. Written for developers new to the project but assumes basic knowledge of modern web development tools.

---

## 📋 Prerequisites

### Required Knowledge
- **Node.js & npm/yarn** - Package management and script running
- **Git** - Version control basics  
- **Terminal/Command Line** - Running commands
- **Code Editor** - VS Code recommended for TypeScript support

### System Requirements
- **Node.js 18+** - JavaScript runtime
- **Yarn 1.22.19** - Package manager (preferred over npm)
- **Git** - For cloning the repository

---

## 🚀 Quick Setup

### 1. Clone and Enter Project
```bash
git clone [repository-url]
cd friggs_gate
```

### 2. Install Dependencies
```bash
yarn install
```
This installs all packages defined in `package.json` using the exact versions from `yarn.lock`.

### 3. Configure Environment
```bash
cp .env.example .env.local
```
Edit `.env.local` and set:
```bash
NEXT_PUBLIC_WS_BASE_URL=ws://localhost:8001
```
*Note: This connects to the WebSocket backend. Change the port if your backend runs elsewhere.*

### 4. Start Development Server
```bash
yarn dev
```
Opens at `http://localhost:3000`

---

## 🔧 Development Environment Details

### Package Manager: Yarn
This project uses **Yarn** (not npm) for consistent dependency management:
- **Lock file**: `yarn.lock` ensures everyone gets identical versions
- **Commands**: `yarn install`, `yarn dev`, `yarn build`
- **Why Yarn**: Faster installs, better monorepo support, deterministic builds

### Next.js Development Server
When you run `yarn dev`:
- **Hot reload** - Changes appear instantly in browser
- **TypeScript checking** - Errors show in terminal and browser
- **Source maps** - Debug with original source code
- **Fast refresh** - React state preserved across code changes

---

## 🌐 Backend Connection

### WebSocket Backend
Frigg's Gate communicates with a WebSocket backend (not REST API):

**Default endpoint**: `ws://localhost:8001/ws`

### Backend Setup (Separate Repository)
The backend is a separate project. You need both running:
1. **Backend WebSocket server** on port 8001
2. **Frontend development server** on port 3000

### Connection Behavior
- **Auto-connect**: Connects automatically when frontend starts
- **Auto-reconnect**: Retries 5 times with 3-second delays
- **Status indication**: Send button shows red border when disconnected
- **Error handling**: Connection errors appear in chat interface

---

## 📁 Project Structure Understanding

### Key Directories
```
friggs_gate/
├── app/                    # Next.js 13 App Router application
│   ├── components/         # React UI components
│   ├── hooks/             # Custom React hooks (state, WebSocket)
│   ├── services/          # Business logic (response interpretation)
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Shared utilities and constants
├── docs/                  # Documentation (this file)
├── public/                # Static assets (images, favicon)
└── [config files]        # Next.js, TypeScript, Tailwind configs
```

### Important Files for New Developers
- **`app/components/ChatWindow.tsx`** - Main application orchestrator
- **`app/hooks/useWebSocket.ts`** - WebSocket communication logic  
- **`package.json`** - Dependencies and available scripts
- **`README.md`** - Agent-optimized quick reference

---

## 🎨 Development Workflow

### Making Changes
1. **Edit files** - Use any code editor (VS Code recommended)
2. **Save** - Changes appear automatically in browser
3. **Check console** - Terminal shows TypeScript errors
4. **Test** - Interact with the interface to verify changes

### Common Commands
```bash
yarn dev          # Start development server
yarn build        # Build for production
yarn start        # Run production build locally
yarn lint         # Check code quality
yarn format       # Format code with Prettier
```

### TypeScript Integration
- **Strict mode enabled** - Catches errors at compile time
- **Auto-completion** - Editor provides intelligent suggestions
- **Error checking** - Red underlines show type errors
- **Build fails** - Won't build with TypeScript errors

---

## 🔍 Troubleshooting

### Common Issues

**"WebSocket connection failed"**
- Check if backend is running on port 8001
- Verify `NEXT_PUBLIC_WS_BASE_URL` in `.env.local`
- Look for CORS or firewall issues

**"Module not found" errors**  
- Run `yarn install` to ensure all dependencies are installed
- Delete `node_modules` and `yarn.lock`, then `yarn install`

**TypeScript errors on build**
- Fix all red underlines in your editor
- Check `tsconfig.json` if you suspect configuration issues
- TypeScript strict mode is required - don't disable it

**Hot reload not working**
- Restart development server (`Ctrl+C`, then `yarn dev`)
- Check file permissions if using Docker or VM
- Ensure you're editing files inside the project directory

**Styling not applied**
- Check Tailwind classes for typos
- Verify `tailwind.config.ts` includes your file paths
- Restart dev server after Tailwind config changes

### Getting Help
1. **Check browser console** - JavaScript errors appear here
2. **Check terminal** - Build errors and TypeScript issues show here  
3. **Review documentation** - `README.md` for quick reference, `docs/mental-model.md` for concepts

---

## 🏗️ Building and Deployment

### Production Build
```bash
yarn build
```
Creates optimized production files in `.next/` directory.

### Running Production Build Locally
```bash
yarn build
yarn start
```
Runs the production build at `http://localhost:3000`.

### Environment Variables for Production
Set these in your deployment environment:
```bash
NEXT_PUBLIC_WS_BASE_URL=wss://your-backend-domain.com/ws
```
*Note: Use `wss://` (secure WebSocket) for production HTTPS sites.*

---

## 🔒 Security Considerations

### Content Security
- **DOMPurify** - All user-generated content is sanitized
- **TypeScript** - Prevents many runtime security issues
- **Environment variables** - Sensitive data not hardcoded

### WebSocket Security
- **Origin validation** - Backend should validate connection origins
- **Message validation** - All WebSocket messages should be validated
- **Error handling** - Sensitive error details not exposed to frontend

---

## 🎯 Next Steps

After successful installation:

1. **Understand the system** - Read `docs/mental-model.md`
2. **Make a small change** - Try modifying a component
3. **Learn the architecture** - Study `ChatWindow.tsx` as the main orchestrator
4. **Explore components** - Look at `StructuredInput.tsx` and `StructuredOutputDock.tsx`
5. **Understand state management** - Review the dual-state system hooks

### Development Best Practices
- **Use the README** - `README.md` is your quick reference for file locations
- **Follow TypeScript** - Don't bypass type checking
- **Respect state separation** - Persistent vs session state in correct stores
- **Use existing patterns** - Study existing components before creating new ones
- **Test WebSocket scenarios** - Verify behavior when connection drops/reconnects

---

*For conceptual understanding, see `docs/mental-model.md`. For technical deep dive, see `docs/frontend-guide.md`.*