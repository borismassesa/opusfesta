'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export type EditorApi = {
  id: string
  label: string
  dirty: boolean
  save: () => Promise<{ ok: boolean; error?: string }>
  discard: () => void
}

// Plain mutable store. Editors mutate via register/unregister; consumers
// subscribe via callback. The store reference itself is stable across the
// lifetime of the provider, so editor useEffects with [store, ...] deps
// don't fire on every parent render.
class EditorStore {
  editors = new Map<string, EditorApi>()
  private listeners = new Set<() => void>()

  register(api: EditorApi) {
    this.editors.set(api.id, api)
    this.listeners.forEach((l) => l())
  }

  unregister(id: string) {
    if (this.editors.delete(id)) this.listeners.forEach((l) => l())
  }

  subscribe(cb: () => void) {
    this.listeners.add(cb)
    return () => {
      this.listeners.delete(cb)
    }
  }
}

const Ctx = createContext<EditorStore | null>(null)

export function VendorEditorProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => new EditorStore())
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useEditorRegistration({
  id,
  label,
  dirty,
  save,
  discard,
}: {
  id: string
  label: string
  dirty: boolean
  save: () => Promise<{ ok: boolean; error?: string }>
  discard: () => void
}) {
  const store = useContext(Ctx)
  const saveRef = useRef(save)
  const discardRef = useRef(discard)
  saveRef.current = save
  discardRef.current = discard

  useEffect(() => {
    if (!store) return
    store.register({
      id,
      label,
      dirty,
      save: () => saveRef.current(),
      discard: () => discardRef.current(),
    })
    return () => store.unregister(id)
  }, [store, id, label, dirty])
}

// Returns the current registry as a fresh array. Only re-renders the consumer
// when the store fires a notify (register/unregister), via a force-update
// counter — much simpler than useSyncExternalStore for our needs.
export function useEditorRegistry(): EditorApi[] {
  const store = useContext(Ctx)
  const [, force] = useState(0)
  useEffect(() => {
    if (!store) return
    return store.subscribe(() => force((n) => n + 1))
  }, [store])
  return store ? Array.from(store.editors.values()) : []
}
