import { useState } from 'react';
import { fetchFile } from '../routes/file';
import Button from '../components/ui/Button';

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
      <Button type="button" variant="ghost" onClick={handleLoad}>Load sample file</Button>
      <span className="status">{status}</span>
    </div>
  );
}
