/**
 * OpenSIN AppState - Complete state shape for the application.
 *
 * This file defines the AppState type with all state slices,
 * the AppStateStore type, and the default state factory.
 *
 * Ported from sin-claude and adapted for OpenSIN branding.
 */

import type { Store } from './store.js'

// ─── Completion Boundary ───────────────────────────────────────────────────

export type CompletionBoundary =
  | { type: 'complete'; completedAt: number; outputTokens: number }
  | { type: 'bash'; command: string; completedAt: number }
  | { type: 'edit'; toolName: string; filePath: string; completedAt: number }
  | {
      type: 'denied_tool'
      toolName: string
      detail: string
      completedAt: number
    }

// ─── Speculation (Autocomplete Prediction) ─────────────────────────────────

export type SpeculationResult = {
  messages: unknown[]
  boundary: CompletionBoundary | null
  timeSavedMs: number
}

export type SpeculationState =
  | { status: 'idle' }
  | {
      status: 'active'
      id: string
      abort: () => void
      startTime: number
      messagesRef: { current: unknown[] }
      writtenPathsRef: { current: Set<string> }
      boundary: CompletionBoundary | null
      suggestionLength: number
      toolUseCount: number
      isPipelined: boolean
      contextRef: { current: unknown }
      pipelinedSuggestion?: {
        text: string
        promptId: 'user_intent' | 'stated_intent'
        generationRequestId: string | null
      } | null
    }

export const IDLE_SPECULATION_STATE: SpeculationState = { status: 'idle' }

// ─── Footer Items ──────────────────────────────────────────────────────────

export type FooterItem =
  | 'tasks'
  | 'tmux'
  | 'bagel'
  | 'teams'
  | 'bridge'
  | 'companion'

// ─── Permission Mode ───────────────────────────────────────────────────────

export type PermissionMode =
  | 'default'
  | 'auto'
  | 'acceptEdits'
  | 'plan'
  | 'bypassPermissions'
  | 'yolo'

export type ToolPermissionContext = {
  mode: PermissionMode
  rules: unknown[]
  alwaysAllowRules: unknown[]
  isBypassPermissionsModeAvailable: boolean
}

export function getEmptyToolPermissionContext(): ToolPermissionContext {
  return {
    mode: 'default',
    rules: [],
    alwaysAllowRules: [],
    isBypassPermissionsModeAvailable: true,
  }
}

// ─── Model Setting ─────────────────────────────────────────────────────────

export type ModelSetting = string | null

// ─── Effort Value ──────────────────────────────────────────────────────────

export type EffortValue = 'low' | 'medium' | 'high'

// ─── Denial Tracking ───────────────────────────────────────────────────────

export type DenialTrackingState = {
  consecutiveDenials: number
  totalDenials: number
  lastDeniedTool: string | null
}

// ─── Attribution State ─────────────────────────────────────────────────────

export type AttributionState = {
  enabled: boolean
  author: string | null
  email: string | null
}

export function createEmptyAttributionState(): AttributionState {
  return { enabled: false, author: null, email: null }
}

// ─── File History ──────────────────────────────────────────────────────────

export type FileHistoryState = {
  snapshots: unknown[]
  trackedFiles: Set<string>
  snapshotSequence: number
}

// ─── Session Hooks ─────────────────────────────────────────────────────────

export type SessionHooksState = Map<string, unknown>

// ─── Notification ──────────────────────────────────────────────────────────

export type Notification = {
  id: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  timestamp: number
}

// ─── Plugin Types ──────────────────────────────────────────────────────────

export type PluginSource = 'bundled' | 'builtin' | 'marketplace' | 'local'

export type PluginError = {
  id: string
  name: string
  error: string
  stack?: string
}

export type LoadedPlugin = {
  id: string
  name: string
  source: PluginSource
  enabled: boolean
  commands: unknown[]
  skills: unknown[]
  hooks: unknown[]
  mcpServers: unknown[]
  error?: PluginError
}

// ─── Agent Definitions ─────────────────────────────────────────────────────

export type AgentDefinition = {
  name: string
  description: string
  systemPrompt?: string
}

export type AgentDefinitionsResult = {
  activeAgents: AgentDefinition[]
  allAgents: AgentDefinition[]
}

// ─── Todo ──────────────────────────────────────────────────────────────────

export type TodoItem = {
  content: string
  status: 'pending' | 'completed' | 'in_progress'
  agentId?: string
}

export type TodoList = TodoItem[]

// ─── AppState ──────────────────────────────────────────────────────────────

export type AppState = {
  // Settings & Config
  settings: Record<string, unknown>
  verbose: boolean
  mainLoopModel: ModelSetting
  mainLoopModelForSession: ModelSetting
  statusLineText: string | undefined
  expandedView: 'none' | 'tasks' | 'teammates'
  isBriefOnly: boolean
  showTeammateMessagePreview?: boolean
  selectedIPAgentIndex: number
  coordinatorTaskIndex: number
  viewSelectionMode: 'none' | 'selecting-agent' | 'viewing-agent'
  footerSelection: FooterItem | null

  // Tool Permissions
  toolPermissionContext: ToolPermissionContext

  // Agent & Model
  agent: string | undefined
  kairosEnabled: boolean
  thinkingEnabled: boolean | undefined
  promptSuggestionEnabled: boolean
  effortValue?: EffortValue

  // Remote & Bridge
  remoteSessionUrl: string | undefined
  remoteConnectionStatus:
    | 'connecting'
    | 'connected'
    | 'reconnecting'
    | 'disconnected'
  remoteBackgroundTaskCount: number
  replBridgeEnabled: boolean
  replBridgeExplicit: boolean
  replBridgeOutboundOnly: boolean
  replBridgeConnected: boolean
  replBridgeSessionActive: boolean
  replBridgeReconnecting: boolean
  replBridgeConnectUrl: string | undefined
  replBridgeSessionUrl: string | undefined
  replBridgeEnvironmentId: string | undefined
  replBridgeSessionId: string | undefined
  replBridgeError: string | undefined
  replBridgeInitialName: string | undefined
  showRemoteCallout: boolean

  // Tasks & Agents
  tasks: { [taskId: string]: unknown }
  agentNameRegistry: Map<string, string>
  foregroundedTaskId?: string
  viewingAgentTaskId?: string
  agentDefinitions: AgentDefinitionsResult
  todos: { [agentId: string]: TodoList }
  remoteAgentTaskSuggestions: { summary: string; task: string }[]

  // File History & Attribution
  fileHistory: FileHistoryState
  attribution: AttributionState

  // MCP
  mcp: {
    clients: unknown[]
    tools: unknown[]
    commands: unknown[]
    resources: Record<string, unknown[]>
    pluginReconnectKey: number
  }

  // Plugins
  plugins: {
    enabled: LoadedPlugin[]
    disabled: LoadedPlugin[]
    commands: unknown[]
    errors: PluginError[]
    installationStatus: {
      marketplaces: Array<{
        name: string
        status: 'pending' | 'installing' | 'installed' | 'failed'
        error?: string
      }>
      plugins: Array<{
        id: string
        name: string
        status: 'pending' | 'installing' | 'installed' | 'failed'
        error?: string
      }>
    }
    needsRefresh: boolean
  }

  // Notifications & Elicitation
  notifications: {
    current: Notification | null
    queue: Notification[]
  }
  elicitation: {
    queue: unknown[]
  }

  // Session
  sessionHooks: SessionHooksState
  companionReaction?: string
  companionPetAt?: number

  // Tungsten (tmux integration)
  tungstenActiveSession?: {
    sessionName: string
    socketName: string
    target: string
  }
  tungstenLastCapturedTime?: number
  tungstenLastCommand?: {
    command: string
    timestamp: number
  }
  tungstenPanelVisible?: boolean
  tungstenPanelAutoHidden?: boolean

  // Bagel (WebBrowser tool)
  bagelActive?: boolean
  bagelUrl?: string
  bagelPanelVisible?: boolean

  // Team/Swarm Context
  teamContext?: {
    teamName: string
    teamFilePath: string
    leadAgentId: string
    selfAgentId?: string
    selfAgentName?: string
    isLeader?: boolean
    selfAgentColor?: string
    teammates: {
      [teammateId: string]: {
        name: string
        agentType?: string
        color?: string
        tmuxSessionName: string
        tmuxPaneId: string
        cwd: string
        worktreePath?: string
        spawnedAt: number
      }
    }
  }

  // Standalone Agent Context
  standaloneAgentContext?: {
    name: string
    color?: string
  }

  // Inbox (teammate messages)
  inbox: {
    messages: Array<{
      id: string
      from: string
      text: string
      timestamp: string
      status: 'pending' | 'processing' | 'processed'
      color?: string
      summary?: string
    }>
  }

  // Worker Sandbox Permissions
  workerSandboxPermissions: {
    queue: Array<{
      requestId: string
      workerId: string
      workerName: string
      workerColor?: string
      host: string
      createdAt: number
    }>
    selectedIndex: number
  }
  pendingWorkerRequest: {
    toolName: string
    toolUseId: string
    description: string
  } | null
  pendingSandboxRequest: {
    requestId: string
    host: string
  } | null

  // Prompt Suggestion
  promptSuggestion: {
    text: string | null
    promptId: 'user_intent' | 'stated_intent' | null
    shownAt: number
    acceptedAt: number
    generationRequestId: string | null
  }

  // Speculation
  speculation: SpeculationState
  speculationSessionTimeSavedMs: number

  // Skill Improvement
  skillImprovement: {
    suggestion: {
      skillName: string
      updates: { section: string; change: string; reason: string }[]
    } | null
  }

  // Auth
  authVersion: number

  // Initial Message (from CLI or plan mode exit)
  initialMessage: {
    message: unknown
    clearContext?: boolean
    mode?: PermissionMode
    allowedPrompts?: unknown[]
  } | null

  // Plan Verification
  pendingPlanVerification?: {
    plan: string
    verificationStarted: boolean
    verificationCompleted: boolean
  }

  // Denial Tracking
  denialTracking?: DenialTrackingState

  // Overlays
  activeOverlays: ReadonlySet<string>

  // Fast Mode
  fastMode?: boolean

  // Advisor Model
  advisorModel?: string

  // Ultraplan
  ultraplanLaunching?: boolean
  ultraplanSessionUrl?: string
  ultraplanPendingChoice?: { plan: string; sessionId: string; taskId: string }
  ultraplanLaunchPending?: { blurb: string }
  isUltraplanMode?: boolean

  // Bridge Permission Callbacks
  replBridgePermissionCallbacks?: unknown
  channelPermissionCallbacks?: unknown
}

export type AppStateStore = Store<AppState>

export function getDefaultAppState(): AppState {
  return {
    settings: {},
    tasks: {},
    agentNameRegistry: new Map(),
    verbose: false,
    mainLoopModel: null,
    mainLoopModelForSession: null,
    statusLineText: undefined,
    expandedView: 'none',
    isBriefOnly: false,
    showTeammateMessagePreview: false,
    selectedIPAgentIndex: -1,
    coordinatorTaskIndex: -1,
    viewSelectionMode: 'none',
    footerSelection: null,
    kairosEnabled: false,
    remoteSessionUrl: undefined,
    remoteConnectionStatus: 'connecting',
    remoteBackgroundTaskCount: 0,
    replBridgeEnabled: false,
    replBridgeExplicit: false,
    replBridgeOutboundOnly: false,
    replBridgeConnected: false,
    replBridgeSessionActive: false,
    replBridgeReconnecting: false,
    replBridgeConnectUrl: undefined,
    replBridgeSessionUrl: undefined,
    replBridgeEnvironmentId: undefined,
    replBridgeSessionId: undefined,
    replBridgeError: undefined,
    replBridgeInitialName: undefined,
    showRemoteCallout: false,
    toolPermissionContext: getEmptyToolPermissionContext(),
    agent: undefined,
    agentDefinitions: { activeAgents: [], allAgents: [] },
    fileHistory: {
      snapshots: [],
      trackedFiles: new Set(),
      snapshotSequence: 0,
    },
    attribution: createEmptyAttributionState(),
    mcp: {
      clients: [],
      tools: [],
      commands: [],
      resources: {},
      pluginReconnectKey: 0,
    },
    plugins: {
      enabled: [],
      disabled: [],
      commands: [],
      errors: [],
      installationStatus: {
        marketplaces: [],
        plugins: [],
      },
      needsRefresh: false,
    },
    todos: {},
    remoteAgentTaskSuggestions: [],
    notifications: {
      current: null,
      queue: [],
    },
    elicitation: {
      queue: [],
    },
    thinkingEnabled: false,
    promptSuggestionEnabled: false,
    sessionHooks: new Map(),
    companionReaction: undefined,
    companionPetAt: undefined,
    inbox: {
      messages: [],
    },
    workerSandboxPermissions: {
      queue: [],
      selectedIndex: 0,
    },
    pendingWorkerRequest: null,
    pendingSandboxRequest: null,
    promptSuggestion: {
      text: null,
      promptId: null,
      shownAt: 0,
      acceptedAt: 0,
      generationRequestId: null,
    },
    speculation: IDLE_SPECULATION_STATE,
    speculationSessionTimeSavedMs: 0,
    skillImprovement: {
      suggestion: null,
    },
    authVersion: 0,
    initialMessage: null,
    effortValue: undefined,
    activeOverlays: new Set<string>(),
    fastMode: false,
  }
}
