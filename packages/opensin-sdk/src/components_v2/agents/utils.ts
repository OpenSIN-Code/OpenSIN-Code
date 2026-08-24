<<<<<<< HEAD
import capitalize from 'lodash-es/capitalize'
import type { SettingSource } from 'src/utils/settings/constants'
import { getSettingSourceName } from 'src/utils/settings/constants'
=======
import capitalize from 'lodash-es/capitalize.js'
import type { SettingSource } from '../../utils_v2/settings/constants.js'
import { getSettingSourceName } from '../../utils_v2/settings/constants.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

export function getAgentSourceDisplayName(
  source: SettingSource | 'all' | 'built-in' | 'plugin',
): string {
  if (source === 'all') {
    return 'Agents'
  }
  if (source === 'built-in') {
    return 'Built-in agents'
  }
  if (source === 'plugin') {
    return 'Plugin agents'
  }
  return capitalize(getSettingSourceName(source))
}
