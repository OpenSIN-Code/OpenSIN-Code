/**
 * Selectors for deriving computed state from AppState.
 * Keep selectors pure and simple - just data extraction, no side effects.
 *
 * Ported from sin-claude and adapted for OpenSIN branding.
 */

import type { AppState } from './AppStateStore.js'

/**
 * Get the currently viewed agent task, if any.
 * Returns undefined if:
 * - No agent is being viewed (viewingAgentTaskId is undefined)
 * - The task ID doesn't exist in tasks
 */
export function getViewedAgentTask(
  appState: Pick<AppState, 'viewingAgentTaskId' | 'tasks'>,
): unknown | undefined {
  const { viewingAgentTaskId, tasks } = appState

  if (!viewingAgentTaskId) {
    return undefined
  }

  const task = tasks[viewingAgentTaskId]
  if (!task) {
    return undefined
  }

  return task
}

/**
 * Return type for getActiveAgentForInput selector.
 * Discriminated union for type-safe input routing.
 */
export type ActiveAgentForInput =
  | { type: 'leader' }
  | { type: 'viewed'; task: unknown }
  | { type: 'named_agent'; task: unknown }

/**
 * Determine where user input should be routed.
 * Returns:
 * - { type: 'leader' } when not viewing an agent (input goes to leader)
 * - { type: 'viewed', task } when viewing an agent (input goes to that agent)
 *
 * Used by input routing logic to direct user messages to the correct agent.
 */
export function getActiveAgentForInput(
  appState: AppState,
): ActiveAgentForInput {
  const viewedTask = getViewedAgentTask(appState)
  if (viewedTask) {
    return { type: 'viewed', task: viewedTask }
  }

  const { viewingAgentTaskId, tasks } = appState
  if (viewingAgentTaskId) {
    const task = tasks[viewingAgentTaskId]
    if (task) {
      return { type: 'named_agent', task }
    }
  }

  return { type: 'leader' }
}

/**
 * Check if OpenSIN is in a remote session.
 */
export function isRemoteSession(
  appState: Pick<AppState, 'remoteConnectionStatus'>,
): boolean {
  return appState.remoteConnectionStatus === 'connected'
}

/**
 * Check if bridge is fully connected and active.
 */
export function isBridgeActive(
  appState: Pick<AppState, 'replBridgeConnected' | 'replBridgeSessionActive'>,
): boolean {
  return appState.replBridgeConnected && appState.replBridgeSessionActive
}

/**
 * Get the current permission mode.
 */
export function getPermissionMode(
  appState: Pick<AppState, 'toolPermissionContext'>,
): string {
  return appState.toolPermissionContext.mode
}

/**
 * Check if fast mode is enabled.
 */
export function isFastMode(
  appState: Pick<AppState, 'fastMode'>,
): boolean {
  return appState.fastMode ?? false
}

/**
 * Get active overlay count.
 */
export function getActiveOverlayCount(
  appState: Pick<AppState, 'activeOverlays'>,
): number {
  return appState.activeOverlays.size
}

/**
 * Get pending notification count.
 */
export function getPendingNotificationCount(
  appState: Pick<AppState, 'notifications'>,
): number {
  return appState.notifications.queue.length
}

/**
 * Get enabled plugin count.
 */
export function getEnabledPluginCount(
  appState: Pick<AppState, 'plugins'>,
): number {
  return appState.plugins.enabled.length
}

/**
 * Get MCP client count.
 */
export function getMCPClientCount(
  appState: Pick<AppState, 'mcp'>,
): number {
  return appState.mcp.clients.length
}

/**
 * Get teammate count from team context.
 */
export function getTeammateCount(
  appState: Pick<AppState, 'teamContext'>,
): number {
  if (!appState.teamContext) return 0
  return Object.keys(appState.teamContext.teammates).length
}

/**
 * Check if ultraplan is active.
 */
export function isUltraplanActive(
  appState: Pick<AppState, 'ultraplanSessionUrl' | 'ultraplanLaunching'>,
): boolean {
  return !!appState.ultraplanSessionUrl || !!appState.ultraplanLaunching
}

/**
 * Get speculation status.
 */
export function getSpeculationStatus(
  appState: Pick<AppState, 'speculation'>,
): 'idle' | 'active' {
  return appState.speculation.status
}

/**
 * Get total task count.
 */
export function getTotalTaskCount(
  appState: Pick<AppState, 'tasks'>,
): number {
  return Object.keys(appState.tasks).length
}

/**
 * Get pending inbox count.
 */
export function getPendingInboxCount(
  appState: Pick<AppState, 'inbox'>,
): number {
  return appState.inbox.messages.filter(m => m.status === 'pending').length
}
