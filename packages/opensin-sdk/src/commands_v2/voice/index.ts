<<<<<<< HEAD
import type { Command } from '../../commands'
=======
import type { Command } from '../../commands_v2/index.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))
import {
  isVoiceGrowthBookEnabled,
  isVoiceModeEnabled,
} from '../../voice/voiceModeEnabled'

const voice = {
  type: 'local',
  name: 'voice',
  description: 'Toggle voice mode',
  availability: ['opensin-ai'],
  isEnabled: () => isVoiceGrowthBookEnabled(),
  get isHidden() {
    return !isVoiceModeEnabled()
  },
  supportsNonInteractive: false,
  load: () => import('./voice'),
} satisfies Command

export default voice
