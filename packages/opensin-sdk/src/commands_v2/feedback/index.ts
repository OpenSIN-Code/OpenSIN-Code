<<<<<<< HEAD
import type { Command } from '../../commands'
import { isPolicyAllowed } from '../../services/policyLimits/index'
import { isEnvTruthy } from '../../utils/envUtils'
import { isEssentialTrafficOnly } from '../../utils/privacyLevel'
=======
import type { Command } from '../../commands_v2/index.js'
import { isPolicyAllowed } from '../../services/policyLimits/index.js'
import { isEnvTruthy } from '../../utils_v2/envUtils.js'
import { isEssentialTrafficOnly } from '../../utils_v2/privacyLevel.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

const feedback = {
  aliases: ['bug'],
  type: 'local-jsx',
  name: 'feedback',
  description: `Submit feedback about OpenSIN Code`,
  argumentHint: '[report]',
  isEnabled: () =>
    !(
      isEnvTruthy(process.env.OPENSIN_CODE_USE_BEDROCK) ||
      isEnvTruthy(process.env.OPENSIN_CODE_USE_VERTEX) ||
      isEnvTruthy(process.env.OPENSIN_CODE_USE_FOUNDRY) ||
      isEnvTruthy(process.env.DISABLE_FEEDBACK_COMMAND) ||
      isEnvTruthy(process.env.DISABLE_BUG_COMMAND) ||
      isEssentialTrafficOnly() ||
      process.env.USER_TYPE === 'ant' ||
      !isPolicyAllowed('allow_product_feedback')
    ),
  load: () => import('./feedback'),
} satisfies Command

export default feedback
