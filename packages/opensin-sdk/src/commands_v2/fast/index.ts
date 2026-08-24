<<<<<<< HEAD
import type { Command } from '../../commands'
import {
  FAST_MODE_MODEL_DISPLAY,
  isFastModeEnabled,
} from '../../utils/fastMode'
import { shouldInferenceConfigCommandBeImmediate } from '../../utils/immediateCommand'
=======
import type { Command } from '../../commands_v2/index.js'
import {
  FAST_MODE_MODEL_DISPLAY,
  isFastModeEnabled,
} from '../../utils_v2/fastMode.js'
import { shouldInferenceConfigCommandBeImmediate } from '../../utils_v2/immediateCommand.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

const fast = {
  type: 'local-jsx',
  name: 'fast',
  get description() {
    return `Toggle fast mode (${FAST_MODE_MODEL_DISPLAY} only)`
  },
  availability: ['opensin-ai', 'console'],
  isEnabled: () => isFastModeEnabled(),
  get isHidden() {
    return !isFastModeEnabled()
  },
  argumentHint: '[on|off]',
  get immediate() {
    return shouldInferenceConfigCommandBeImmediate()
  },
  load: () => import('./fast'),
} satisfies Command

export default fast
