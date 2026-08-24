<<<<<<< HEAD
import type { HistoryMode } from 'src/hooks/useArrowKeyHistory'
import type { PromptInputMode } from 'src/types/textInputTypes'
=======
import type { HistoryMode } from '../../hooks_v2/useArrowKeyHistory.js'
import type { PromptInputMode } from '../../types/textInputTypes.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

export function prependModeCharacterToInput(
  input: string,
  mode: PromptInputMode,
): string {
  switch (mode) {
    case 'bash':
      return `!${input}`
    default:
      return input
  }
}

export function getModeFromInput(input: string): HistoryMode {
  if (input.startsWith('!')) {
    return 'bash'
  }
  return 'prompt'
}

export function getValueFromInput(input: string): string {
  const mode = getModeFromInput(input)
  if (mode === 'prompt') {
    return input
  }
  return input.slice(1)
}

export function isInputModeCharacter(input: string): boolean {
  return input === '!'
}
