<<<<<<< HEAD
import type { Command } from '../../commands'
=======
import type { Command } from '../../commands_v2/index.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

const status = {
  type: 'local-jsx',
  name: 'status',
  description:
    'Show OpenSIN Code status including version, model, account, API connectivity, and tool statuses',
  immediate: true,
  load: () => import('./status'),
} satisfies Command

export default status
