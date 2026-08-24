<<<<<<< HEAD
import type { Command } from '../../commands'
import { checkStatsigFeatureGate_CACHED_MAY_BE_STALE } from '../../services/analytics/growthbook'
=======
import type { Command } from '../../commands_v2/index.js'
import { checkStatsigFeatureGate_CACHED_MAY_BE_STALE } from '../../services/analytics/growthbook.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

const thinkback = {
  type: 'local-jsx',
  name: 'think-back',
  description: 'Your 2025 OpenSIN Code Year in Review',
  isEnabled: () =>
    checkStatsigFeatureGate_CACHED_MAY_BE_STALE('tengu_thinkback'),
  load: () => import('./thinkback'),
} satisfies Command

export default thinkback
