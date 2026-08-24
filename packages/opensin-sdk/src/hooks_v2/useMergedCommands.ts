import uniqBy from 'lodash-es/uniqBy'
import { useMemo } from 'react'
<<<<<<< HEAD
import type { Command } from '../commands'
=======
import type { Command } from '../../commands_v2/index.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

export function useMergedCommands(
  initialCommands: Command[],
  mcpCommands: Command[],
): Command[] {
  return useMemo(() => {
    if (mcpCommands.length > 0) {
      return uniqBy([...initialCommands, ...mcpCommands], 'name')
    }
    return initialCommands
  }, [initialCommands, mcpCommands])
}
