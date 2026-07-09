import { useEffect, useState } from 'react';

function storageKey(page) {
  return `squirrel:transactions:${page}`;
}

export function usePageTransactions(page) {
  const [transactions, setTransactionsState] = useState(() => {
    const cached = sessionStorage.getItem(storageKey(page));
    return cached ? JSON.parse(cached) : [];
  });

  useEffect(() => {
    const cached = sessionStorage.getItem(storageKey(page));
    setTransactionsState(cached ? JSON.parse(cached) : []);
  }, [page]);

  function setTransactions(data) {
    sessionStorage.setItem(storageKey(page), JSON.stringify(data));
    setTransactionsState(data);
  }

  return [transactions, setTransactions];
}
