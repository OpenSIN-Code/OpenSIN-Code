<<<<<<< HEAD
import type { Command } from '../../commands'
=======
import type { Command } from '../../commands_v2/index.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

const mobile = {
  type: 'local-jsx',
  name: 'mobile',
  aliases: ['ios', 'android'],
  description: 'Show QR code to download the OpenSIN mobile app',
  load: () => import('./mobile'),
} satisfies Command

export default mobile
