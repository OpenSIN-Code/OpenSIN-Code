<<<<<<< HEAD
import type { Command } from '../../commands'
=======
import type { Command } from '../../commands_v2/index.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

const stats = {
  type: 'local-jsx',
  name: 'stats',
  description: 'Show your OpenSIN Code usage statistics and activity',
  load: () => import('./stats'),
} satisfies Command

export default stats
