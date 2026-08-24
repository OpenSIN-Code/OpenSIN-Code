/**
 * React hooks for OpenSIN AppState.
 *
 * Provides useAppState (selector-based subscription),
 * useSetAppState (stable updater), and useAppStateStore (direct store access).
 *
 * Ported from sin-claude and adapted for OpenSIN branding.
 */

import React, { useContext, useSyncExternalStore } from 'react'
import { type AppState, type AppStateStore, getDefaultAppState } from './AppStateStore.js'
import { createStore } from './store.js'

export const AppStoreContext = React.createContext<AppStateStore | null>(null)
const HasAppStateContext = React.createContext<boolean>(false)

type AppStateProviderProps = {
  children: React.ReactNode
  initialState?: AppState
  onChangeAppState?: (args: {
    newState: AppState
    oldState: AppState
  }) => void
}

/**
 * Provider component that wraps the app and supplies AppState via context.
 */
export function AppStateProvider({
  children,
  initialState,
  onChangeAppState,
}: AppStateProviderProps): React.ReactElement {
  const hasAppStateContext = useContext(HasAppStateContext)
  if (hasAppStateContext) {
    throw new Error(
      'AppStateProvider cannot be nested within another AppStateProvider',
    )
  }

  const [store] = React.useState(() =>
    createStore(initialState ?? getDefaultAppState(), onChangeAppState),
  )

  // Disable bypass permissions mode on mount if remote settings loaded
  React.useEffect(() => {
    const { toolPermissionContext } = store.getState()
    if (
      toolPermissionContext.isBypassPermissionsModeAvailable &&
      toolPermissionContext.mode === 'bypassPermissions'
    ) {
      store.setState((prev) => ({
        ...prev,
        toolPermissionContext: {
          ...prev.toolPermissionContext,
          mode: 'default' as const,
        },
      }))
    }
  }, [store])

  return (
    <HasAppStateContext.Provider value={true}>
      <AppStoreContext.Provider value={store}>
        {children}
      </AppStoreContext.Provider>
    </HasAppStateContext.Provider>
  )
}

function useAppStore(): AppStateStore {
  const store = useContext(AppStoreContext)
  if (!store) {
    throw new ReferenceError(
      'useAppState/useSetAppState cannot be called outside of an <AppStateProvider />',
    )
  }
  return store
}

/**
 * Subscribe to a slice of AppState. Only re-renders when the selected value
 * changes (compared via Object.is).
 *
 * For multiple independent fields, call the hook multiple times:
 * ```
 * const verbose = useAppState(s => s.verbose)
 * const model = useAppState(s => s.mainLoopModel)
 * ```
 *
 * Do NOT return new objects from the selector -- Object.is will always see
 * them as changed. Instead, select an existing sub-object reference:
 * ```
 * const { text, promptId } = useAppState(s => s.promptSuggestion) // good
 * ```
 */
export function useAppState<T>(
  selector: (state: AppState) => T,
): T {
  const store = useAppStore()

  const get = React.useCallback(() => {
    const state = store.getState()
    return selector(state)
  }, [store, selector])

  return useSyncExternalStore(store.subscribe, get, get)
}

/**
 * Get the setAppState updater without subscribing to any state.
 * Returns a stable reference that never changes -- components using only
 * this hook will never re-render from state changes.
 */
export function useSetAppState(): AppStateStore['setState'] {
  return useAppStore().setState
}

/**
 * Get the store directly (for passing getState/setState to non-React code).
 */
export function useAppStateStore(): AppStateStore {
  return useAppStore()
}

const NOOP_SUBSCRIBE = () => () => {}

/**
 * Safe version of useAppState that returns undefined if called outside of
 * AppStateProvider. Useful for components that may be rendered in contexts
 * where AppStateProvider isn't available.
 */
export function useAppStateMaybeOutsideOfProvider<T>(
  selector: (state: AppState) => T,
): T | undefined {
  const store = useContext(AppStoreContext)

  const get = React.useCallback(() => {
    if (!store) return undefined
    return selector(store.getState())
  }, [store, selector])

  return useSyncExternalStore(
    store ? store.subscribe : NOOP_SUBSCRIBE,
    get,
  )
}
