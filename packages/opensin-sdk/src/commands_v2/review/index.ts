<<<<<<< HEAD
import type { Command } from '../../commands'
=======
import type { Command } from '../../commands_v2/index.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

const review = {
  type: 'local-jsx',
  name: 'review',
  description: 'Review code changes',
  load: () => import('./ultrareviewCommand'),
} satisfies Command

export default review
