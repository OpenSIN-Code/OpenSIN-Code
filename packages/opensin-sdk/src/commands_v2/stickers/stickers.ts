<<<<<<< HEAD
import type { LocalCommandResult } from '../../types/command'
import { openBrowser } from '../../utils/browser'
=======
import type { LocalCommandResult } from '../../types/command.js'
import { openBrowser } from '../../utils_v2/browser.js'
>>>>>>> 14499e481 (feat: Complete sin-claude migration to OpenSIN-Code (1,565+ files))

export async function call(): Promise<LocalCommandResult> {
  const url = 'https://www.stickermule.com/opensincode'
  const success = await openBrowser(url)

  if (success) {
    return { type: 'text', value: 'Opening sticker page in browser…' }
  } else {
    return {
      type: 'text',
      value: `Failed to open browser. Visit: ${url}`,
    }
  }
}
