import { useState } from 'react';

const STORAGE_KEY = 'squirrel:transactions';

export function useTransactions() {
  const [transactions, setTransactionsState] = useState(() => {
    const cached = sessionStorage.getItem(STORAGE_KEY);
    return cached ? JSON.parse(cached) : [];
  });

  function setTransactions(data) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setTransactionsState(data);
  }

  return [transactions, setTransactions];
}
