# OpenSIN-Code Architecture

> Complete architecture documentation for OpenSIN-Code
>
> **Date:** April 6, 2026
> **Version:** 1.0.0

---

## Overview

OpenSIN-Code is the core code agent for the OpenSIN ecosystem, providing intelligent code generation, analysis, and refactoring capabilities. It is built as a TypeScript SDK with React-based terminal UI.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        OpenSIN-Code                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   CLI Agent │  │   VS Code   │  │   JetBrains Plugin  │ │
│  │  (standalone)│  │  Extension  │  │                     │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         │                │                     │            │
│  ┌──────▼────────────────▼─────────────────────▼──────────┐ │
│  │                    SDK Core                            │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │ │
│  │  │  State   │  │ Services │  │  Hooks   │            │ │
│  │  │  Mgmt    │  │  Layer   │  │  System  │            │ │
│  │  └──────────┘  └──────────┘  └──────────┘            │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │ │
│  │  │Utilities │  │Components│  │ Commands │            │ │
│  │  │  Layer   │  │  Library │  │  System  │            │ │
│  │  └──────────┘  └──────────┘  └──────────┘            │ │
│  │  ┌──────────────────────────────────────────────┐    │ │
│  │  │              Tools (42+)                     │    │ │
│  │  └──────────────────────────────────────────────┘    │ │
│  └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Core Modules

### 1. State Management

**Location:** `src/state/`

The state management system uses a lightweight immutable store pattern with React integration via `useSyncExternalStore`.

```
state/
├── store.ts              # Core store factory (createStore)
├── AppStateStore.ts      # AppState type + default factory
├── AppState.tsx          # React hooks provider
├── selectors.ts          # Derived state selectors
└── index.ts              # Public API exports
```

**Key Concepts:**
- Immutable state updates with `Object.is` comparison
- Selector pattern for optimized re-renders
- Side effect handling via `onChangeAppState`
- 60+ state fields across 12 slices

### 2. Services Layer

**Location:** `src/services/`

Services provide backend functionality and are organized into 22 subdirectories with 130 files total.

```
services/
├── analytics/            # Event logging (Datadog, GrowthBook)
├── mcp/                  # MCP client and connections
├── api/                  # OpenSIN API client
├── lsp/                  # Language Server Protocol
├── oauth/                # OAuth 2.0 with PKCE
├── compact/              # Context compaction
├── SessionMemory/        # Session note-taking
├── extractMemories/      # Memory extraction
├── autoDream/            # Background consolidation
├── MagicDocs/            # Auto markdown maintenance
├── AgentSummary/         # Periodic summarization
├── toolUseSummary/       # Haiku-powered summaries
├── diagnosticTracking/   # IDE diagnostics
├── remoteManagedSettings/# Enterprise settings
├── tips/                 # User tips system
├── teamMemorySync/       # Team memory sync
├── settingsSync/         # Cross-env settings sync
├── plugins/              # Plugin management
├── PromptSuggestion/     # Prompt coaching
├── policyLimits/         # Policy enforcement
└── tools/                # Tool orchestration
```

**Dependency Graph:**
```
Analytics (foundation, no deps)
    ↑
    ├─→ MCP
    ├─→ SessionMemory
    ├─→ extractMemories
    ├─→ autoDream
    ├─→ Compact
    ├─→ OAuth
    ├─→ tips
    ├─→ teamMemorySync
    ├─→ settingsSync
    └─→ plugins

API (claude.ts)
    ↑
    ├─→ Compact
    ├─→ toolUseSummary
    └─→ OAuth (token exchange)
```

### 3. Hooks System

**Location:** `src/hooks_v2/`

107 React hooks providing reactive functionality for the terminal UI.

**Categories:**
- **State/Config:** `useSettings`, `useDynamicConfig`, `useSettingsChange`
- **Session/Remote:** `useRemoteSession`, `useSSHSession`, `useDirectConnect`
- **Tool/Merge:** `useMergedTools`, `useMergedCommands`, `useCanUseTool`
- **Queue/Input:** `useCommandQueue`, `useQueueProcessor`, `useTextInput`
- **Task/Scheduling:** `useScheduledTasks`, `useTasksV2`
- **Team/Swarm:** `useInboxPoller`, `useSwarmPermissionPoller`
- **UI/Autocomplete:** `useTypeahead` (1200+ lines), `useHistorySearch`
- **IDE Integration:** `useIDEIntegration`, `useIdeConnectionStatus`
- **Notifications:** 19 notification hooks in `notifs/`
- **Business Logic:** `useManagePlugins`, `useApiKeyVerification`, `useVoice`

### 4. Utilities Layer

**Location:** `src/utils_v2/`

565 utility files providing core functionality.

**Key Categories:**
- **Session/State:** `sessionStorage.ts` (5,105 lines)
- **Git:** `git.ts` (926 lines), `gitFilesystem.ts`
- **Permissions:** `permissions/` directory with classifier
- **Model Management:** `model/` directory with providers
- **Token/Context:** `context.ts`, `tokenBudget.ts`, `tokens.ts`
- **Error Handling:** `errors.ts` with classification
- **Abort Controllers:** Memory-safe with WeakRef
- **Hooks:** `hooks/` directory with session hooks
- **Environment:** `envUtils.ts`, `platform.ts`
- **Filesystem:** `fsOperations.ts`, `sanitization.ts`
- **String/Text:** `truncate.ts`, `markdown.ts`, `xml.ts`
- **Bash/Shell:** `bash/` directory with parser
- **Swarm/Teammate:** `swarm/` directory

### 5. Component Library

**Location:** `src/components_v2/`

405 UI components with complete theme system.

**Design System:**
- Theme provider with auto/dark/light modes
- ThemedBox and ThemedText primitives
- Dialog with keyboard handling
- Select/FuzzyPicker for choices
- TextInput with cursor management
- ProgressBar/LoadingState for feedback
- Tabs, ListItem, Virtual scrolling

### 6. Commands System

**Location:** `src/commands_v2/`

166 slash commands organized by functionality.

**Priority Commands:**
- `/commit` - Git commit with auto-message
- `/security-review` - Security audit
- `/insights` - Usage analytics (115KB)
- `/ctx_viz` - Context visualization
- `/ultraplan` - Advanced planning
- `/teleport` - Remote session teleport

### 7. Tools System

**Location:** `src/tools_v2/`

187 tool files implementing 42+ tools.

**Core Tools:**
- `AgentTool` - Multi-agent orchestration
- `BashTool` - Shell execution with security
- `FileRead/Edit/Write` - File operations
- `Glob/Grep` - File search
- `WebFetch/WebSearch` - Web access
- `LSPTool` - Language server integration
- `MCPTool` - MCP server communication

## Configuration

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "strict": true,
    "jsx": "react-jsx"
  }
}
```

### Feature Flags

40+ feature flags managed via GrowthBook integration in `services/analytics/growthbook.ts`.

## Testing

- **Framework:** Vitest
- **Tests:** 433 passing
- **Coverage:** Core modules covered
- **Location:** `src/__tests__/`

## Build & Deploy

```bash
npm run build    # TypeScript compilation
npm run dev      # Watch mode
npm test         # Run tests
npm start        # Start CLI
```

## Dependencies

### Core
- `react` - UI framework
- `ink` - Terminal UI
- `typescript` - Type safety
- `vitest` - Testing

### Services
- `@growthbook/growthbook` - Feature flags
- `@opentelemetry/*` - Event logging
- `axios` - HTTP client
- `zod` - Schema validation

### Utilities
- `lodash-es` - Utility functions
- `chalk` - Terminal colors
- `ignore` - Gitignore parsing

## Migration Notes

This codebase was migrated from sin-claude (4,170 files) to OpenSIN-Code (1,565+ files). All "claude" and "anthropic" references have been renamed to "opensin".

See [MIGRATION.md](./MIGRATION.md) for complete migration documentation.
