/**
 * Core store factory for OpenSIN state management.
 *
 * Provides a lightweight, immutable state store with atomic updates
 * and subscriber notification. Based on the Zustand-lite pattern.
 */

type Listener = () => void

type OnChange<T> = (args: { newState: T; oldState: T }) => void

/**
 * A minimal immutable state store.
 *
 * @typeParam T - The shape of the state object.
 */
export type Store<T> = {
  /** Returns the current state snapshot (immutable). */
  getState: () => T

  /**
   * Atomically update state by applying an updater function.
   * Listeners are notified only if the next state differs from the previous
   * (compared via Object.is).
   */
  setState: (updater: (prev: T) => T) => void

  /**
   * Subscribe to state changes. Returns an unsubscribe function.
   */
  subscribe: (listener: Listener) => () => void
}

/**
 * Create a new immutable state store.
 *
 * @param initialState - The initial state value.
 * @param onChange - Optional callback invoked on every successful state change.
 * @returns A Store instance with getState, setState, and subscribe methods.
 *
 * @example
 * ```ts
 * const store = createStore({ count: 0 })
 * store.subscribe(() => console.log(store.getState()))
 * store.setState(prev => ({ count: prev.count + 1 }))
 * ```
 */
export function createStore<T>(
  initialState: T,
  onChange?: OnChange<T>,
): Store<T> {
  let state = initialState
  const listeners = new Set<Listener>()

  return {
    getState: () => state,

    setState: (updater: (prev: T) => T) => {
      const prev = state
      const next = updater(prev)
      if (Object.is(next, prev)) return
      state = next
      onChange?.({ newState: next, oldState: prev })
      for (const listener of listeners) listener()
    },

    subscribe: (listener: Listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
