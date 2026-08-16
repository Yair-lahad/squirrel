import { fetchFile } from '../routes/file';
import { useAsyncStatus } from '../hooks/useAsyncStatus';
import Button from '../components/ui/Button';

export default function FileLoader({ onLoaded }) {
  const { status, run } = useAsyncStatus();

  function handleLoad() {
    run('Loading…', fetchFile, async (data) => {
      await onLoaded(data);
      return `Loaded ${data.length} transactions.`;
    });
  }

  return (
    <div className="inline-loader">
      <Button type="button" variant="ghost" onClick={handleLoad}>Load sample file</Button>
      <span className={`status${status.error ? ' error' : ''}`}>{status.message}</span>
    </div>
  );
}
