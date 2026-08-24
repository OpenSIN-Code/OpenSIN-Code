<<<<<<< HEAD
import type { Command } from '../../commands'
=======
import type { Command } from '../../commands_v2/index.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

const tag = {
  type: 'local-jsx',
  name: 'tag',
  description: 'Toggle a searchable tag on the current session',
  isEnabled: () => process.env.USER_TYPE === 'ant',
  argumentHint: '<tag-name>',
  load: () => import('./tag'),
} satisfies Command

export default tag
