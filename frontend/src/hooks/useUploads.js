import { useEffect, useState } from 'react';
import { useTransactions } from './useTransactions';
import { useCachedState } from './useCachedState';
import { fetchTransactions, fetchUploads } from '../routes/transactions';

const SELECTED_KEY = 'squirrel:selectedUploadId';

// "Selected upload" just filters the one fetched set - switching never re-fetches.
export function useUploads() {
  const [allTransactions, setAllTransactions] = useTransactions();
  const [uploads, setUploads] = useCachedState('squirrel:uploads', []);
  const [selectedUploadId, setSelectedUploadId] = useState(() => {
    const cached = sessionStorage.getItem(SELECTED_KEY);
    return cached ? JSON.parse(cached) : null;
  });

  // null selectedUploadId means "All uploads" (see UploadSelector).
  const transactions = selectedUploadId === null ? allTransactions : allTransactions.filter((t) => t.upload_id === selectedUploadId);

  function changeUpload(uploadId) {
    sessionStorage.setItem(SELECTED_KEY, JSON.stringify(uploadId));
    setSelectedUploadId(uploadId);
  }

  // Keeps the current selection if it still exists, else falls back to the latest upload.
  // On failure (e.g. backend unreachable), keeps whatever was already loaded/cached.
  async function refresh(preferredUploadId = selectedUploadId) {
    try {
      const [list, all] = await Promise.all([fetchUploads(), fetchTransactions({ all: true })]);
      setUploads(list);
      setAllTransactions(all);
      changeUpload(list.some((u) => u.id === preferredUploadId) ? preferredUploadId : (list[0]?.id ?? null));
    } catch {
      // offline - leave cached data in place
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { transactions, allTransactions, uploads, selectedUploadId, changeUpload, refresh };
}
