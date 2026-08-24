import { relative } from 'path'
<<<<<<< HEAD
import type { ToolUseContext } from '../../Tool'
import type { LocalCommandResult } from '../../types/command'
import { getCwd } from '../../utils/cwd'
import { cacheKeys } from '../../utils/fileStateCache'
=======
import type { ToolUseContext } from '../../tools_v2/Tool.js'
import type { LocalCommandResult } from '../../types/command.js'
import { getCwd } from '../../utils_v2/cwd.js'
import { cacheKeys } from '../../utils_v2/fileStateCache.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

export async function call(
  _args: string,
  context: ToolUseContext,
): Promise<LocalCommandResult> {
  const files = context.readFileState ? cacheKeys(context.readFileState) : []

  if (files.length === 0) {
    return { type: 'text' as const, value: 'No files in context' }
  }

  const fileList = files.map(file => relative(getCwd(), file)).join('\n')
  return { type: 'text' as const, value: `Files in context:\n${fileList}` }
}
