<<<<<<< HEAD
import type { Command } from '../../commands'
import { isEnvTruthy } from '../../utils/envUtils'
=======
import type { Command } from '../../commands_v2/index.js'
import { isEnvTruthy } from '../../utils_v2/envUtils.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

const installGitHubApp = {
  type: 'local-jsx',
  name: 'install-github-app',
  description: 'Set up OpenSIN GitHub Actions for a repository',
  availability: ['opensin-ai', 'console'],
  isEnabled: () => !isEnvTruthy(process.env.DISABLE_INSTALL_GITHUB_APP_COMMAND),
  load: () => import('./install-github-app'),
} satisfies Command

export default installGitHubApp
