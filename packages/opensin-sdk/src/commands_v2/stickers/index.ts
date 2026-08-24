<<<<<<< HEAD
import type { Command } from '../../commands'
=======
import type { Command } from '../../commands_v2/index.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

const stickers = {
  type: 'local',
  name: 'stickers',
  description: 'Order OpenSIN Code stickers',
  supportsNonInteractive: false,
  load: () => import('./stickers'),
} satisfies Command

export default stickers
