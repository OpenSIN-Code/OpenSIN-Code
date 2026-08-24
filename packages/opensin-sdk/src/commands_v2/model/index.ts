<<<<<<< HEAD
import type { Command } from '../../commands'
import { shouldInferenceConfigCommandBeImmediate } from '../../utils/immediateCommand'
import { getMainLoopModel, renderModelName } from '../../utils/model/model'
=======
import type { Command } from '../../commands_v2/index.js'
import { shouldInferenceConfigCommandBeImmediate } from '../../utils_v2/immediateCommand.js'
import { getMainLoopModel, renderModelName } from '../../utils_v2/model/model.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

export default {
  type: 'local-jsx',
  name: 'model',
  get description() {
    return `Set the AI model for OpenSIN Code (currently ${renderModelName(getMainLoopModel())})`
  },
  argumentHint: '[model]',
  get immediate() {
    return shouldInferenceConfigCommandBeImmediate()
  },
  load: () => import('./model'),
} satisfies Command
