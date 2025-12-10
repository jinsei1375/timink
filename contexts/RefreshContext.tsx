import { RefreshEvent } from '@/types';
import { createContext, useCallback, useContext, useRef } from 'react';

type RefreshListener = () => void;

interface RefreshContextType {
  subscribe: (event: RefreshEvent, listener: RefreshListener) => () => void;
  emit: (event: RefreshEvent) => void;
}

const RefreshContext = createContext<RefreshContextType | null>(null);

export function RefreshProvider({ children }: { children: React.ReactNode }) {
  const listenersRef = useRef<Map<RefreshEvent, Set<RefreshListener>>>(new Map());

  const subscribe = useCallback((event: RefreshEvent, listener: RefreshListener) => {
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event)!.add(listener);

    // Unsubscribe function
    return () => {
      listenersRef.current.get(event)?.delete(listener);
    };
  }, []);

  const emit = useCallback((event: RefreshEvent) => {
    const listeners = listenersRef.current.get(event);
    if (listeners) {
      listeners.forEach((listener) => listener());
    }
  }, []);

  return <RefreshContext.Provider value={{ subscribe, emit }}>{children}</RefreshContext.Provider>;
}

export function useRefresh() {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error('useRefresh must be used within RefreshProvider');
  }
  return context;
}
