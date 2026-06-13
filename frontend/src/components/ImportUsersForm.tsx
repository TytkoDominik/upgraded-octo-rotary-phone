import { useState } from 'react';
import { importUsers } from '../api/users';
import type { ImportResult } from '../types';

interface Props {
  onResult: (result: ImportResult) => void;
}

export function ImportUsersForm({ onResult }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const result = await importUsers(file);
      onResult(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="csv-file">CSV File</label>
        <input
          id="csv-file"
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>
      <button type="submit" disabled={loading || !file}>
        Import
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
