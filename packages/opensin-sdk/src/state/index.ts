/**
 * OpenSIN State Management Module.
 *
 * Provides a complete state management system ported from sin-claude:
 * - Store factory (createStore)
 * - AppState type and default state factory
 * - React hooks (useAppState, useSetAppState, etc.)
 * - Selector functions for derived state
 *
 * @module state
 */

// Core Store
export { createStore } from './store.js'
export type { Store } from './store.js'

// AppState
export {
  getDefaultAppState,
  getEmptyToolPermissionContext,
  createEmptyAttributionState,
  IDLE_SPECULATION_STATE,
} from './AppStateStore.js'

export type {
  AppState,
  AppStateStore,
  CompletionBoundary,
  SpeculationState,
  SpeculationResult,
  FooterItem,
  PermissionMode,
  ToolPermissionContext,
  ModelSetting,
  EffortValue,
  DenialTrackingState,
  AttributionState,
  FileHistoryState,
  SessionHooksState,
  Notification,
  PluginSource,
  PluginError,
  LoadedPlugin,
  AgentDefinition,
  AgentDefinitionsResult,
  TodoItem,
  TodoList,
} from './AppStateStore.js'

// React Hooks
export {
  AppStateProvider,
  useAppState,
  useSetAppState,
  useAppStateStore,
  useAppStateMaybeOutsideOfProvider,
  AppStoreContext,
} from './AppState.tsx'

// Selectors
export {
  getViewedAgentTask,
  getActiveAgentForInput,
  isRemoteSession,
  isBridgeActive,
  getPermissionMode,
  isFastMode,
  getActiveOverlayCount,
  getPendingNotificationCount,
  getEnabledPluginCount,
  getMCPClientCount,
  getTeammateCount,
  isUltraplanActive,
  getSpeculationStatus,
  getTotalTaskCount,
  getPendingInboxCount,
  type ActiveAgentForInput,
} from './selectors.js'
