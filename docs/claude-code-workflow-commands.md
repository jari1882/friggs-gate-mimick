# Claude Code Workflow Commands for Friggs Gate

## Core Development Commands

### Build & Development
```bash
yarn dev          # Start development server
yarn build        # Production build
yarn start        # Start production server
```

### Code Quality
```bash
yarn lint         # Run ESLint
yarn format       # Format code with Prettier
```

## Essential Claude Code Workflow Commands

### 1. Development Workflow
**Start development with live reload:**
```
yarn dev
```
- Runs Next.js dev server on port 3000
- Hot reload for instant feedback
- TypeScript compilation in watch mode

### 2. Code Quality Enforcement
**Lint and format before commits:**
```
yarn lint && yarn format
```
- Catches TypeScript errors, unused variables, React hooks violations
- Applies consistent formatting (LF line endings)
- Essential before any PR

### 3. Production Readiness Check
**Test production build:**
```
yarn build
```
- Validates all TypeScript types
- Optimizes bundle size
- Catches build-time errors

### 4. File Operations
**Find components:**
```
find app/components -name "*.tsx" | grep -i [search-term]
```

**Find config files:**
```
find app/config -name "*.ts"
```

### 5. Git Workflow Integration
**Pre-commit check:**
```bash
yarn lint && yarn build
```
- Run before every commit
- Prevents broken code in main branch

**Status check:**
```bash
git status && git diff --name-only
```

## Project-Specific Commands

### Friggs Gate Architecture
- **Frontend**: Next.js 13.5.4 with TypeScript
- **UI**: Chakra UI + Tailwind CSS
- **State**: Zustand for global state
- **Build**: Yarn package manager

### Key Directories
```
app/
├── components/     # React components (.tsx)
├── config/         # App configuration
├── hooks/          # Custom React hooks
├── services/       # API services
└── utils/          # Utility functions
```

### Development Patterns
1. **Component Development**: All components in `app/components/`
2. **Configuration**: Centralized in `app/config/`
3. **State Management**: Zustand hooks in `app/hooks/`
4. **Services**: WebSocket and API logic in `app/services/`

## Efficiency Multipliers

### 1. Automated Quality Checks
Always run before commits:
```bash
yarn lint && yarn format && yarn build
```

### 2. Component Analysis
Find specific component patterns:
```bash
grep -r "useState\|useEffect" app/components/
```

### 3. Configuration Updates
Edit centralized configs:
- `app/config/theme.ts` - UI theme
- `app/config/content.ts` - Content management  
- `app/config/commands.ts` - Command definitions

### 4. Dependency Management
```bash
yarn install              # Install dependencies
yarn add [package]        # Add new dependency
yarn add -D [package]     # Add dev dependency
```

### 5. TypeScript Development
- Strict mode enabled
- Path aliases: `@/*` maps to project root
- Next.js plugin for enhanced TypeScript support

## Critical Workflow Rules

1. **Always lint before commit** - `yarn lint`
2. **Format code consistently** - `yarn format`
3. **Test builds locally** - `yarn build`
4. **Use TypeScript strictly** - No `any` types
5. **Component-first development** - Reusable components in `app/components/`

## Performance Commands

### Bundle Analysis
```bash
yarn build && ls -la .next/static/
```

### Development Speed
```bash
yarn dev --turbo    # If using Turbopack (Next.js 13+)
```

### Memory Usage Check
```bash
ps aux | grep next
```
nv
## Team Collaboration Commands

### Code Review Prep
```bash
git status && git diff --name-only && yarn lint && yarn build
```

### Branch Management
```bash
git checkout -b feature/[feature-name]
git add . && git commit -m "feat: [description]"
```

### Deployment Check
```bash
yarn build && yarn start
```
Test locally before deployment to catch production issues.