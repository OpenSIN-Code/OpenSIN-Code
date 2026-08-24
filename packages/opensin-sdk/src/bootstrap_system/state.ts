/**
 * OpenSIN Bootstrap State
 *
 * Global state for the bootstrap system.
 */

let isNonInteractiveSession = false
let sessionTrustAccepted = false

export function getIsNonInteractive(): boolean {
  return isNonInteractiveSession
}

export function setIsNonInteractive(value: boolean): void {
  isNonInteractiveSession = value
}

export function getSessionTrustAccepted(): boolean {
  return sessionTrustAccepted
}

export function setSessionTrustAccepted(value: boolean): void {
  sessionTrustAccepted = value
}
