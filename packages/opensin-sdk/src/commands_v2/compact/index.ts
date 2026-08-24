<<<<<<< HEAD
import type { Command } from '../../commands'
import { isEnvTruthy } from '../../utils/envUtils'
=======
import type { Command } from '../../commands_v2/index.js'
import { isEnvTruthy } from '../../utils_v2/envUtils.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

const compact = {
  type: 'local',
  name: 'compact',
  description:
    'Clear conversation history but keep a summary in context. Optional: /compact [instructions for summarization]',
  isEnabled: () => !isEnvTruthy(process.env.DISABLE_COMPACT),
  supportsNonInteractive: true,
  argumentHint: '<optional custom summarization instructions>',
  load: () => import('./compact'),
} satisfies Command

export default compact
