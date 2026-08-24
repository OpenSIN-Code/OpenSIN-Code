<<<<<<< HEAD
import { getIsRemoteMode } from '../../bootstrap/state'
import type { Command } from '../../commands'
=======
import { getIsRemoteMode } from '../../bootstrap_system/state.js'
import type { Command } from '../../commands_v2/index.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

const session = {
  type: 'local-jsx',
  name: 'session',
  aliases: ['remote'],
  description: 'Show remote session URL and QR code',
  isEnabled: () => getIsRemoteMode(),
  get isHidden() {
    return !getIsRemoteMode()
  },
  load: () => import('./session'),
} satisfies Command

export default session
