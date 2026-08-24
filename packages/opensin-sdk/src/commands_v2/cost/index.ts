/**
 * Cost command - minimal metadata only.
 * Implementation is lazy-loaded from cost.ts to reduce startup time.
 */
<<<<<<< HEAD
import type { Command } from '../../commands'
import { isOpenSINAISubscriber } from '../../utils/auth'
=======
import type { Command } from '../../commands_v2/index.js'
import { isOpenSINAISubscriber } from '../../utils_v2/auth.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

const cost = {
  type: 'local',
  name: 'cost',
  description: 'Show the total cost and duration of the current session',
  get isHidden() {
    // Keep visible for Ants even if they're subscribers (they see cost breakdowns)
    if (process.env.USER_TYPE === 'ant') {
      return false
    }
    return isOpenSINAISubscriber()
  },
  supportsNonInteractive: true,
  load: () => import('./cost'),
} satisfies Command

export default cost
