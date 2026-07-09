import { useState } from 'react';
import { fetchFile } from '../routes/file';

export default function FileLoader({ onLoaded }) {
  const [status, setStatus] = useState('');

  async function handleLoad() {
    setStatus('Loading…');
    const data = await fetchFile();
    onLoaded(data);
    setStatus(`Loaded ${data.length} transactions.`);
  }

  return (
    <div className="inline-loader">
      <button type="button" onClick={handleLoad}>Load sample file</button>
      <span className="status">{status}</span>
    </div>
  );
}
