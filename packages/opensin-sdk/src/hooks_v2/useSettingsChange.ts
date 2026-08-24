import { useCallback, useEffect } from 'react'
<<<<<<< HEAD
import { settingsChangeDetector } from '../utils/settings/changeDetector'
import type { SettingSource } from '../utils/settings/constants'
import { getSettings_DEPRECATED } from '../utils/settings/settings'
import type { SettingsJson } from '../utils/settings/types'
=======
import { settingsChangeDetector } from '../../utils_v2/settings/changeDetector.js'
import type { SettingSource } from '../../utils_v2/settings/constants.js'
import { getSettings_DEPRECATED } from '../../utils_v2/settings/settings.js'
import type { SettingsJson } from '../../utils_v2/settings/types.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

export function useSettingsChange(
  onChange: (source: SettingSource, settings: SettingsJson) => void,
): void {
  const handleChange = useCallback(
    (source: SettingSource) => {
      // Cache is already reset by the notifier (changeDetector.fanOut) —
      // resetting here caused N-way thrashing with N subscribers: each
      // cleared the cache, re-read from disk, then the next cleared again.
      const newSettings = getSettings_DEPRECATED()
      onChange(source, newSettings)
    },
    [onChange],
  )

  useEffect(
    () => settingsChangeDetector.subscribe(handleChange),
    [handleChange],
  )
}
