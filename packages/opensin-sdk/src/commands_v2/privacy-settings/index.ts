<<<<<<< HEAD
import type { Command } from '../../commands'
import { isConsumerSubscriber } from '../../utils/auth'
=======
import type { Command } from '../../commands_v2/index.js'
import { isConsumerSubscriber } from '../../utils_v2/auth.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

const privacySettings = {
  type: 'local-jsx',
  name: 'privacy-settings',
  description: 'View and update your privacy settings',
  isEnabled: () => {
    return isConsumerSubscriber()
  },
  load: () => import('./privacy-settings'),
} satisfies Command

export default privacySettings
