import { useSyncExternalStore } from 'react'
import type { QueuedCommand } from '../types/textInputTypes'
import {
  getCommandQueueSnapshot,
  subscribeToCommandQueue,
<<<<<<< HEAD
} from '../utils/messageQueueManager'
=======
} from '../../utils_v2/messageQueueManager.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

/**
 * React hook to subscribe to the unified command queue.
 * Returns a frozen array that only changes reference on mutation.
 * Components re-render only when the queue changes.
 */
export function useCommandQueue(): readonly QueuedCommand[] {
  return useSyncExternalStore(subscribeToCommandQueue, getCommandQueueSnapshot)
}
