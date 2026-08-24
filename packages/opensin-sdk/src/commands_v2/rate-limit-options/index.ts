<<<<<<< HEAD
import type { Command } from '../../commands'
import { isOpenSINAISubscriber } from '../../utils/auth'
=======
import type { Command } from '../../commands_v2/index.js'
import { isOpenSINAISubscriber } from '../../utils_v2/auth.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

const rateLimitOptions = {
  type: 'local-jsx',
  name: 'rate-limit-options',
  description: 'Show options when rate limit is reached',
  isEnabled: () => {
    if (!isOpenSINAISubscriber()) {
      return false
    }

    return true
  },
  isHidden: true, // Hidden from help - only used internally
  load: () => import('./rate-limit-options'),
} satisfies Command

export default rateLimitOptions
