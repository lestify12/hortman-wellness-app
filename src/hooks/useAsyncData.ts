import { useCallback, useEffect, useRef, useState } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refreshing: boolean;
  /** Re-runs the fetcher; pass `true` to show the pull-to-refresh spinner. */
  reload(asRefresh?: boolean): Promise<void>;
  /** Local optimistic write — useful after a mutation returns. */
  setData(next: T | null): void;
}

/**
 * Minimal async-data hook.
 *
 * Deliberately small: it covers loading/error/refresh for the repository layer
 * without pulling in a query library. If the app later adopts React Query, the
 * call sites keep the same shape.
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: readonly unknown[] = [],
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mounted = useRef(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async (asRefresh = false) => {
    if (asRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      if (!mounted.current) return;
      setData(result);
    } catch (err) {
      if (!mounted.current) return;
      setError(err instanceof Error ? err : new Error('Something went wrong.'));
    } finally {
      if (!mounted.current) return;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void run(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refreshing, reload: run, setData };
}
