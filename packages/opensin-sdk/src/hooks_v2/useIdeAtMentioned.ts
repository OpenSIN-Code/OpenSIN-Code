import { useEffect, useRef } from 'react'
<<<<<<< HEAD
import { logError } from 'src/utils/log'
=======
import { logError } from '../../utils_v2/log.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))
import { z } from 'zod/v4'
import type {
  ConnectedMCPServer,
  MCPServerConnection,
<<<<<<< HEAD
} from '../services/mcp/types'
import { getConnectedIdeClient } from '../utils/ide'
import { lazySchema } from '../utils/lazySchema'
=======
} from '../services/mcp/types.js'
import { getConnectedIdeClient } from '../../utils_v2/ide.js'
import { lazySchema } from '../../utils_v2/lazySchema.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))
export type IDEAtMentioned = {
  filePath: string
  lineStart?: number
  lineEnd?: number
}

const NOTIFICATION_METHOD = 'at_mentioned'

const AtMentionedSchema = lazySchema(() =>
  z.object({
    method: z.literal(NOTIFICATION_METHOD),
    params: z.object({
      filePath: z.string(),
      lineStart: z.number().optional(),
      lineEnd: z.number().optional(),
    }),
  }),
)

/**
 * A hook that tracks IDE at-mention notifications by directly registering
 * with MCP client notification handlers,
 */
export function useIdeAtMentioned(
  mcpClients: MCPServerConnection[],
  onAtMentioned: (atMentioned: IDEAtMentioned) => void,
): void {
  const ideClientRef = useRef<ConnectedMCPServer | undefined>(undefined)

  useEffect(() => {
    // Find the IDE client from the MCP clients list
    const ideClient = getConnectedIdeClient(mcpClients)

    if (ideClientRef.current !== ideClient) {
      ideClientRef.current = ideClient
    }

    // If we found a connected IDE client, register our handler
    if (ideClient) {
      ideClient.client.setNotificationHandler(
        AtMentionedSchema(),
        notification => {
          if (ideClientRef.current !== ideClient) {
            return
          }
          try {
            const data = notification.params
            // Adjust line numbers to be 1-based instead of 0-based
            const lineStart =
              data.lineStart !== undefined ? data.lineStart + 1 : undefined
            const lineEnd =
              data.lineEnd !== undefined ? data.lineEnd + 1 : undefined
            onAtMentioned({
              filePath: data.filePath,
              lineStart: lineStart,
              lineEnd: lineEnd,
            })
          } catch (error) {
            logError(error as Error)
          }
        },
      )
    }

    // No cleanup needed as MCP clients manage their own lifecycle
  }, [mcpClients, onAtMentioned])
}
