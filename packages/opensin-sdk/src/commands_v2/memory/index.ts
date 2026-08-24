<<<<<<< HEAD
import type { Command } from '../../commands'
=======
import type { Command } from '../../commands_v2/index.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

const memory: Command = {
  type: 'local-jsx',
  name: 'memory',
  description: 'Edit OpenSIN memory files',
  load: () => import('./memory'),
}

export default memory
