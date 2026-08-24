<<<<<<< HEAD
import { getIsNonInteractiveSession } from '../../bootstrap/state'
import type { Command } from '../../commands'
import { isOverageProvisioningAllowed } from '../../utils/auth'
import { isEnvTruthy } from '../../utils/envUtils'
=======
import { getIsNonInteractiveSession } from '../../bootstrap_system/state.js'
import type { Command } from '../../commands_v2/index.js'
import { isOverageProvisioningAllowed } from '../../utils_v2/auth.js'
import { isEnvTruthy } from '../../utils_v2/envUtils.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

function isExtraUsageAllowed(): boolean {
  if (isEnvTruthy(process.env.DISABLE_EXTRA_USAGE_COMMAND)) {
    return false
  }
  return isOverageProvisioningAllowed()
}

export const extraUsage = {
  type: 'local-jsx',
  name: 'extra-usage',
  description: 'Configure extra usage to keep working when limits are hit',
  isEnabled: () => isExtraUsageAllowed() && !getIsNonInteractiveSession(),
  load: () => import('./extra-usage'),
} satisfies Command

export const extraUsageNonInteractive = {
  type: 'local',
  name: 'extra-usage',
  supportsNonInteractive: true,
  description: 'Configure extra usage to keep working when limits are hit',
  isEnabled: () => isExtraUsageAllowed() && getIsNonInteractiveSession(),
  get isHidden() {
    return !getIsNonInteractiveSession()
  },
  load: () => import('./extra-usage-noninteractive'),
} satisfies Command
