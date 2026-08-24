<<<<<<< HEAD
import type { Command } from '../../commands'
import { isPolicyAllowed } from '../../services/policyLimits/index'
import { isOpenSINAISubscriber } from '../../utils/auth'
=======
import type { Command } from '../../commands_v2/index.js'
import { isPolicyAllowed } from '../../services/policyLimits/index.js'
import { isOpenSINAISubscriber } from '../../utils_v2/auth.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

export default {
  type: 'local-jsx',
  name: 'remote-env',
  description: 'Configure the default remote environment for teleport sessions',
  isEnabled: () =>
    isOpenSINAISubscriber() && isPolicyAllowed('allow_remote_sessions'),
  get isHidden() {
    return !isOpenSINAISubscriber() || !isPolicyAllowed('allow_remote_sessions')
  },
  load: () => import('./remote-env'),
} satisfies Command
