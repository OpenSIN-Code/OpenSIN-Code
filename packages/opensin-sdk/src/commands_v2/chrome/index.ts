<<<<<<< HEAD
import { getIsNonInteractiveSession } from '../../bootstrap/state'
import type { Command } from '../../commands'
=======
import { getIsNonInteractiveSession } from '../../bootstrap_system/state.js'
import type { Command } from '../../commands_v2/index.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

const command: Command = {
  name: 'chrome',
  description: 'OpenSIN in Chrome (Beta) settings',
  availability: ['opensin-ai'],
  isEnabled: () => !getIsNonInteractiveSession(),
  type: 'local-jsx',
  load: () => import('./chrome'),
}

export default command
