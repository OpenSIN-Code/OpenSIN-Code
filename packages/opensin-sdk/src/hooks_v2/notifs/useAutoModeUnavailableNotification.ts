import { feature } from 'bun:bundle'
import { useEffect, useRef } from 'react'
<<<<<<< HEAD
import { useNotifications } from 'src/context/notifications'
import { getIsRemoteMode } from '../../bootstrap/state'
import { useAppState } from '../../state/AppState'
import type { PermissionMode } from '../../utils/permissions/PermissionMode'
import {
  getAutoModeUnavailableNotification,
  getAutoModeUnavailableReason,
} from '../../utils/permissions/permissionSetup'
import { hasAutoModeOptIn } from '../../utils/settings/settings'
=======
import { useNotifications } from 'src/context/notifications.js'
import { getIsRemoteMode } from '../../bootstrap_system/state.js'
import { useAppState } from '../../state/AppState.js'
import type { PermissionMode } from '../../utils_v2/permissions/PermissionMode.js'
import {
  getAutoModeUnavailableNotification,
  getAutoModeUnavailableReason,
} from '../../utils_v2/permissions/permissionSetup.js'
import { hasAutoModeOptIn } from '../../utils_v2/settings/settings.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

/**
 * Shows a one-shot notification when the shift-tab carousel wraps past where
 * auto mode would have been. Covers all reasons (settings, circuit-breaker,
 * org-allowlist). The startup case (defaultMode: auto silently downgraded) is
 * handled by verifyAutoModeGateAccess → checkAndDisableAutoModeIfNeeded.
 */
export function useAutoModeUnavailableNotification(): void {
  const { addNotification } = useNotifications()
  const mode = useAppState(s => s.toolPermissionContext.mode)
  const isAutoModeAvailable = useAppState(
    s => s.toolPermissionContext.isAutoModeAvailable,
  )
  const shownRef = useRef(false)
  const prevModeRef = useRef<PermissionMode>(mode)

  useEffect(() => {
    const prevMode = prevModeRef.current
    prevModeRef.current = mode

    if (!feature('TRANSCRIPT_CLASSIFIER')) return
    if (getIsRemoteMode()) return
    if (shownRef.current) return

    const wrappedPastAutoSlot =
      mode === 'default' &&
      prevMode !== 'default' &&
      prevMode !== 'auto' &&
      !isAutoModeAvailable &&
      hasAutoModeOptIn()

    if (!wrappedPastAutoSlot) return

    const reason = getAutoModeUnavailableReason()
    if (!reason) return

    shownRef.current = true
    addNotification({
      key: 'auto-mode-unavailable',
      text: getAutoModeUnavailableNotification(reason),
      color: 'warning',
      priority: 'medium',
    })
  }, [mode, isAutoModeAvailable, addNotification])
}
