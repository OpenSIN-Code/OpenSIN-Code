import { useEffect, useRef } from 'react'
<<<<<<< HEAD
import { getIsRemoteMode } from '../../bootstrap/state'
import {
  type Notification,
  useNotifications,
} from '../../context/notifications'
import { logError } from '../../utils/log'
=======
import { getIsRemoteMode } from '../../bootstrap_system/state.js'
import {
  type Notification,
  useNotifications,
} from '../../context/notifications.js'
import { logError } from '../../utils_v2/log.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

type Result = Notification | Notification[] | null

/**
 * Fires notification(s) once on mount. Encapsulates the remote-mode gate and
 * once-per-session ref guard that was hand-rolled across 10+ notifs/ hooks.
 *
 * The compute fn runs exactly once on first effect. Return null to skip,
 * a Notification to fire one, or an array to fire several. Sync or async.
 * Rejections are routed to logError.
 */
export function useStartupNotification(
  compute: () => Result | Promise<Result>,
): void {
  const { addNotification } = useNotifications()
  const hasRunRef = useRef(false)
  const computeRef = useRef(compute)
  computeRef.current = compute

  useEffect(() => {
    if (getIsRemoteMode() || hasRunRef.current) return
    hasRunRef.current = true

    void Promise.resolve()
      .then(() => computeRef.current())
      .then(result => {
        if (!result) return
        for (const n of Array.isArray(result) ? result : [result]) {
          addNotification(n)
        }
      })
      .catch(logError)
  }, [addNotification])
}
