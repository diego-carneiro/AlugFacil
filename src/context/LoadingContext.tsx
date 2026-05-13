import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface LoadingContextValue {
  pending: number;
}

const LoadingContext = createContext<LoadingContextValue>({ pending: 0 });

// Module-level bridges — set by the provider on mount so the fetch
// interceptor (which runs outside React) can signal loading changes.
let _inc: (() => void) | null = null;
let _dec: (() => void) | null = null;

export function notifyFetchStart(): void {
  _inc?.();
}

export function notifyFetchEnd(): void {
  _dec?.();
}

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState(0);

  const inc = useCallback(() => setPending((p) => p + 1), []);
  const dec = useCallback(() => setPending((p) => Math.max(0, p - 1)), []);

  useEffect(() => {
    _inc = inc;
    _dec = dec;
    return () => {
      _inc = null;
      _dec = null;
    };
  }, [inc, dec]);

  return (
    <LoadingContext.Provider value={{ pending }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading(): LoadingContextValue {
  return useContext(LoadingContext);
}
