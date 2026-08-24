<<<<<<< HEAD
import type { Command } from '../../commands'
=======
import type { Command } from '../../commands_v2/index.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

const installSlackApp = {
  type: 'local',
  name: 'install-slack-app',
  description: 'Install the OpenSIN Slack app',
  availability: ['opensin-ai'],
  supportsNonInteractive: false,
  load: () => import('./install-slack-app'),
} satisfies Command

export default installSlackApp
