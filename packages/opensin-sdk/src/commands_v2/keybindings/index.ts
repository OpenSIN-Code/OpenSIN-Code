<<<<<<< HEAD
import type { Command } from '../../commands'
import { isKeybindingCustomizationEnabled } from '../../keybindings/loadUserBindings'
=======
import type { Command } from '../../commands_v2/index.js'
import { isKeybindingCustomizationEnabled } from '../../keybindings_v2/loadUserBindings.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

const keybindings = {
  name: 'keybindings',
  description: 'Open or create your keybindings configuration file',
  isEnabled: () => isKeybindingCustomizationEnabled(),
  supportsNonInteractive: false,
  type: 'local',
  load: () => import('./keybindings'),
} satisfies Command

export default keybindings
