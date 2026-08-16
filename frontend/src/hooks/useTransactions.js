import { useCachedState } from './useCachedState';

export function useTransactions() {
  return useCachedState('squirrel:transactions', []);
}
