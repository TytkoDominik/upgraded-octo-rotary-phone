import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ImportUsersForm } from './ImportUsersForm';
import * as api from '../api/users';
import type { ImportResult } from '../types';

vi.mock('../api/users');

describe('ImportUsersForm', () => {
  it('disables Import button until file is selected', () => {
    render(<ImportUsersForm onResult={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Import' })).toBeDisabled();
  });

  it('calls importUsers with selected file and triggers onResult', async () => {
    const mockResult: ImportResult = { created: 2, failed: [] };
    vi.mocked(api.importUsers).mockResolvedValue(mockResult);
    const onResult = vi.fn();

    render(<ImportUsersForm onResult={onResult} />);

    const file = new File(['username,email\nalice,alice@test.com'], 'users.csv', {
      type: 'text/csv',
    });
    await userEvent.upload(screen.getByLabelText('CSV File'), file);
    await userEvent.click(screen.getByRole('button', { name: 'Import' }));

    await waitFor(() => expect(onResult).toHaveBeenCalledWith(mockResult));
    expect(api.importUsers).toHaveBeenCalledWith(file);
  });

  it('shows error message when importUsers rejects', async () => {
    vi.mocked(api.importUsers).mockRejectedValue(new Error('Upload failed'));

    render(<ImportUsersForm onResult={vi.fn()} />);

    const file = new File(['bad'], 'users.csv', { type: 'text/csv' });
    await userEvent.upload(screen.getByLabelText('CSV File'), file);
    await userEvent.click(screen.getByRole('button', { name: 'Import' }));

    await waitFor(() => screen.getByText('Upload failed'));
  });
});
