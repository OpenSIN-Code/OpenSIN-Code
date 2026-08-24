<<<<<<< HEAD
import type { Command } from '../../commands'
import { getSubscriptionType } from '../../utils/auth'
import { isEnvTruthy } from '../../utils/envUtils'
=======
import type { Command } from '../../commands_v2/index.js'
import { getSubscriptionType } from '../../utils_v2/auth.js'
import { isEnvTruthy } from '../../utils_v2/envUtils.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

const upgrade = {
  type: 'local-jsx',
  name: 'upgrade',
  description: 'Upgrade to Max for higher rate limits and more Opus',
  availability: ['opensin-ai'],
  isEnabled: () =>
    !isEnvTruthy(process.env.DISABLE_UPGRADE_COMMAND) &&
    getSubscriptionType() !== 'enterprise',
  load: () => import('./upgrade'),
} satisfies Command

export default upgrade
