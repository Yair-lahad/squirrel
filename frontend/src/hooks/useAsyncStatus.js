import { useState } from 'react';

// Runs an async task behind a shared {message, error} status: shows
// `pending` immediately, then either the message `onSuccess(result)` builds
// or the thrown error's message.
export function useAsyncStatus() {
  const [status, setStatus] = useState({ message: '', error: false });

  async function run(pending, task, onSuccess) {
    setStatus({ message: pending, error: false });
    try {
      const result = await task();
      const message = await onSuccess(result);
      setStatus({ message, error: false });
      return result;
    } catch (err) {
      setStatus({ message: err.message, error: true });
      return undefined;
    }
  }

  return { status, run };
}
