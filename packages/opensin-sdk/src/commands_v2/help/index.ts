<<<<<<< HEAD
import type { Command } from '../../commands'
=======
import type { Command } from '../../commands_v2/index.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

const help = {
  type: 'local-jsx',
  name: 'help',
  description: 'Show help and available commands',
  load: () => import('./help'),
} satisfies Command

export default help
