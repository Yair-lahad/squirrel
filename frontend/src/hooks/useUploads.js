import { useEffect, useState } from 'react';
import { useTransactions } from './useTransactions';
import { fetchTransactions, fetchUploads } from '../routes/transactions';

// Owns which "upload" (file/mock/vendor fetch) is currently selected and
// keeps the shared transactions list (sessionStorage-backed, via
// useTransactions) in sync with that selection.
export function useUploads() {
  const [transactions, setTransactions] = useTransactions();
  const [uploads, setUploads] = useState([]);
  const [selectedUploadId, setSelectedUploadId] = useState(null);

  async function loadForUpload(uploadId) {
    setTransactions(await fetchTransactions(uploadId ? { uploadId } : { all: true }));
  }

  // Refreshes the upload list (e.g. after a new load) and keeps the current
  // selection if it still exists, otherwise falls back to the latest upload.
  async function refresh(preferredUploadId = selectedUploadId) {
    const list = await fetchUploads();
    setUploads(list);
    const uploadId = list.some((u) => u.id === preferredUploadId) ? preferredUploadId : (list[0]?.id ?? null);
    setSelectedUploadId(uploadId);
    await loadForUpload(uploadId);
  }

  useEffect(() => {
    refresh();
  }, []);

  function changeUpload(uploadId) {
    setSelectedUploadId(uploadId);
    loadForUpload(uploadId);
  }

  return { transactions, uploads, selectedUploadId, changeUpload, refresh };
}
