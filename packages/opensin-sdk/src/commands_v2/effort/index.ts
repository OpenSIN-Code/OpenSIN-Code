<<<<<<< HEAD
import type { Command } from '../../commands'
import { shouldInferenceConfigCommandBeImmediate } from '../../utils/immediateCommand'
=======
import type { Command } from '../../commands_v2/index.js'
import { shouldInferenceConfigCommandBeImmediate } from '../../utils_v2/immediateCommand.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

export default {
  type: 'local-jsx',
  name: 'effort',
  description: 'Set effort level for model usage',
  argumentHint: '[low|medium|high|max|auto]',
  get immediate() {
    return shouldInferenceConfigCommandBeImmediate()
  },
  load: () => import('./effort'),
} satisfies Command
