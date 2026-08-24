<<<<<<< HEAD
import { getHostPlatformForAnalytics } from '../../utils/env'
import { type CompletionType, logUnaryEvent } from '../../utils/unaryLogging'
import type { ToolUseConfirm } from './PermissionRequest'
=======
import { getHostPlatformForAnalytics } from '../../utils_v2/env.js'
import { type CompletionType, logUnaryEvent } from '../../utils_v2/unaryLogging.js'
import type { ToolUseConfirm } from './PermissionRequest.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

export function logUnaryPermissionEvent(
  completion_type: CompletionType,
  {
    assistantMessage: {
      message: { id: message_id },
    },
  }: ToolUseConfirm,
  event: 'accept' | 'reject',
  hasFeedback?: boolean,
): void {
  void logUnaryEvent({
    completion_type,
    event,
    metadata: {
      language_name: 'none',
      message_id,
      platform: getHostPlatformForAnalytics(),
      hasFeedback: hasFeedback ?? false,
    },
  })
}
