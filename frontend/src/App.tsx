import { useState } from 'react';
import { AddUserForm } from './components/AddUserForm';
import { ImportUsersForm } from './components/ImportUsersForm';
import { ImportResults } from './components/ImportResults';
import type { ImportResult } from './types';

export function App() {
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  return (
    <main style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>User Management</h1>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Add Single User</h2>
        <AddUserForm />
      </section>

      <section>
        <h2>Import Users from CSV</h2>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Expected format: <code>username,email</code> (header row required)
        </p>
        <ImportUsersForm onResult={setImportResult} />
        {importResult && <ImportResults result={importResult} />}
      </section>
    </main>
  );
}
