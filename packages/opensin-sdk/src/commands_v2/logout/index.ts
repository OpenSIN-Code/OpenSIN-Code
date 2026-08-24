<<<<<<< HEAD
import type { Command } from '../../commands'
import { isEnvTruthy } from '../../utils/envUtils'
=======
import type { Command } from '../../commands_v2/index.js'
import { isEnvTruthy } from '../../utils_v2/envUtils.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

export default {
  type: 'local-jsx',
  name: 'logout',
  description: 'Sign out from your OpenSIN account',
  isEnabled: () => !isEnvTruthy(process.env.DISABLE_LOGOUT_COMMAND),
  load: () => import('./logout'),
} satisfies Command
