<<<<<<< HEAD
import type { Command } from '../../commands'
import { hasOpenSINApiKeyAuth } from '../../utils/auth'
import { isEnvTruthy } from '../../utils/envUtils'
=======
import type { Command } from '../../commands_v2/index.js'
import { hasOpenSINApiKeyAuth } from '../../utils_v2/auth.js'
import { isEnvTruthy } from '../../utils_v2/envUtils.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

export default () =>
  ({
    type: 'local-jsx',
    name: 'login',
    description: hasOpenSINApiKeyAuth()
      ? 'Switch OpenSIN accounts'
      : 'Sign in with your OpenSIN account',
    isEnabled: () => !isEnvTruthy(process.env.DISABLE_LOGIN_COMMAND),
    load: () => import('./login'),
  }) satisfies Command
