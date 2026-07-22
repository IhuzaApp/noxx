// Tiny in-memory pub/sub store used by all the new feature modules.
// Lets multiple components share a list and re-render on changes without a backend.
import { useEffect, useState } from "react";

export function createStore<T>(initial: T[]) {
  let data = [...initial];
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());
  return {
    get: () => data,
    set: (next: T[]) => {
      data = next;
      emit();
    },
    add: (item: T) => {
      data = [item, ...data];
      emit();
    },
    update: (predicate: (x: T) => boolean, patch: Partial<T>) => {
      data = data.map((x) => (predicate(x) ? { ...x, ...patch } : x));
      emit();
    },
    remove: (predicate: (x: T) => boolean) => {
      data = data.filter((x) => !predicate(x));
      emit();
    },
    subscribe: (l: () => void) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

export function useStore<T>(store: ReturnType<typeof createStore<T>>): T[] {
  const [, force] = useState(0);
  useEffect(() => {
    const unsub = store.subscribe(() => force((n) => n + 1));
    return () => {
      unsub();
    };
  }, [store]);
  return store.get();
}
