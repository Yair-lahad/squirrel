import { useEffect, useState } from 'react';

// Runs an analytics fetch whenever `deps` change and holds the latest
// result - the aggregation logic itself lives server-side (backend/core/analytics/),
// this just wires a component up to it.
export function useAnalytics(fetcher, deps, initial = null) {
  const [data, setData] = useState(initial);

  useEffect(() => {
    let cancelled = false;
    fetcher().then((result) => {
      if (!cancelled) setData(result);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return data;
}
