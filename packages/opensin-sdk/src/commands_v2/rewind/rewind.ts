<<<<<<< HEAD
import type { LocalCommandResult } from '../../commands'
import type { ToolUseContext } from '../../Tool'
=======
import type { LocalCommandResult } from '../../commands_v2/index.js'
import type { ToolUseContext } from '../../tools_v2/Tool.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

export async function call(
  _args: string,
  context: ToolUseContext,
): Promise<LocalCommandResult> {
  if (context.openMessageSelector) {
    context.openMessageSelector()
  }
  // Return a skip message to not append any messages.
  return { type: 'skip' }
}
