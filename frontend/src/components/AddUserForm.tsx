import { useState } from 'react';
import { createUser } from '../api/users';

export function AddUserForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const user = await createUser(username, email);
      setStatus({ type: 'success', message: `User ${user.username} added successfully` });
      setUsername('');
      setEmail('');
    } catch (err) {
      setStatus({ type: 'error', message: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={2}
        />
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={loading}>
        Add User
      </button>
      {status && (
        <p style={{ color: status.type === 'success' ? 'green' : 'red' }}>{status.message}</p>
      )}
    </form>
  );
}
