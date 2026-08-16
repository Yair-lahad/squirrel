import { useState } from 'react';

// State backed by sessionStorage - so if a fetch fails (e.g. backend
// unreachable), the UI falls back to the last successfully loaded data
// instead of showing nothing.
export function useCachedState(key, initial) {
  const [value, setValue] = useState(() => {
    const cached = sessionStorage.getItem(key);
    return cached ? JSON.parse(cached) : initial;
  });

  function set(next) {
    sessionStorage.setItem(key, JSON.stringify(next));
    setValue(next);
  }

  return [value, set];
}
