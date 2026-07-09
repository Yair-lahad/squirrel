import { useEffect, useState } from 'react';

// Runs an analytics fetch whenever `deps` change and holds the latest
// result — the aggregation logic itself lives server-side (backend/logic/analytics/),
// this just wires a component up to it.
export function useAnalytics(fetcher, deps) {
  const [data, setData] = useState(null);

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
