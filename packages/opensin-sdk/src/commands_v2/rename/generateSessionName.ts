<<<<<<< HEAD
import { queryHaiku } from '../../services/api/opensin'
import type { Message } from '../../types/message'
import { logForDebugging } from '../../utils/debug'
import { errorMessage } from '../../utils/errors'
import { safeParseJSON } from '../../utils/json'
import { extractTextContent } from '../../utils/messages'
import { extractConversationText } from '../../utils/sessionTitle'
import { asSystemPrompt } from '../../utils/systemPromptType'
=======
import { queryHaiku } from '../../services/api/opensin.js'
import type { Message } from '../../types/message.js'
import { logForDebugging } from '../../utils_v2/debug.js'
import { errorMessage } from '../../utils_v2/errors.js'
import { safeParseJSON } from '../../utils_v2/json.js'
import { extractTextContent } from '../../utils_v2/messages.js'
import { extractConversationText } from '../../utils_v2/sessionTitle.js'
import { asSystemPrompt } from '../../utils_v2/systemPromptType.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

export async function generateSessionName(
  messages: Message[],
  signal: AbortSignal,
): Promise<string | null> {
  const conversationText = extractConversationText(messages)
  if (!conversationText) {
    return null
  }

  try {
    const result = await queryHaiku({
      systemPrompt: asSystemPrompt([
        'Generate a short kebab-case name (2-4 words) that captures the main topic of this conversation. Use lowercase words separated by hyphens. Examples: "fix-login-bug", "add-auth-feature", "refactor-api-client", "debug-test-failures". Return JSON with a "name" field.',
      ]),
      userPrompt: conversationText,
      outputFormat: {
        type: 'json_schema',
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
          required: ['name'],
          additionalProperties: false,
        },
      },
      signal,
      options: {
        querySource: 'rename_generate_name',
        agents: [],
        isNonInteractiveSession: false,
        hasAppendSystemPrompt: false,
        mcpTools: [],
      },
    })

    const content = extractTextContent(result.message.content)

    const response = safeParseJSON(content)
    if (
      response &&
      typeof response === 'object' &&
      'name' in response &&
      typeof (response as { name: unknown }).name === 'string'
    ) {
      return (response as { name: string }).name
    }
    return null
  } catch (error) {
    // Haiku timeout/rate-limit/network are expected operational failures —
    // logForDebugging, not logError. Called automatically on every 3rd bridge
    // message (initReplBridge.ts), so errors here would flood the error file.
    logForDebugging(`generateSessionName failed: ${errorMessage(error)}`, {
      level: 'error',
    })
    return null
  }
}
