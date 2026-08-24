<<<<<<< HEAD
import type { SettingSource } from 'src/utils/settings/constants'
import type { AgentDefinition } from '../../tools/AgentTool/loadAgentsDir'
=======
import type { SettingSource } from '../../utils_v2/settings/constants.js'
import type { AgentDefinition } from '../../tools/AgentTool/loadAgentsDir.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

export const AGENT_PATHS = {
  FOLDER_NAME: '.opensin',
  AGENTS_DIR: 'agents',
} as const

// Base types for common patterns
type WithPreviousMode = { previousMode: ModeState }
type WithAgent = { agent: AgentDefinition }

// Simplified state type using intersection types
export type ModeState =
  | { mode: 'main-menu' }
  | { mode: 'list-agents'; source: SettingSource | 'all' | 'built-in' }
  | ({ mode: 'agent-menu' } & WithAgent & WithPreviousMode)
  | ({ mode: 'view-agent' } & WithAgent & WithPreviousMode)
  | { mode: 'create-agent' }
  | ({ mode: 'edit-agent' } & WithAgent & WithPreviousMode)
  | ({ mode: 'delete-confirm' } & WithAgent & WithPreviousMode)

export type AgentValidationResult = {
  isValid: boolean
  warnings: string[]
  errors: string[]
}
