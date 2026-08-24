import { useEffect, useState } from 'react'
import {
  type OpenSINAILimits,
  currentLimits,
  statusListeners,
} from './opensinAiLimits.js'

export function useOpenSINAiLimits(): OpenSINAILimits {
  const [limits, setLimits] = useState<OpenSINAILimits>({ ...currentLimits })

  useEffect(() => {
    const listener = (newLimits: OpenSINAILimits) => {
      setLimits({ ...newLimits })
    }
    statusListeners.add(listener)

    return () => {
      statusListeners.delete(listener)
    }
  }, [])

  return limits
}
