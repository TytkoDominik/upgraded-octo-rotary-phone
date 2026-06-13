import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AddUserForm } from './AddUserForm';
import * as api from '../api/users';

vi.mock('../api/users');

describe('AddUserForm', () => {
  it('calls createUser with entered values and shows success', async () => {
    vi.mocked(api.createUser).mockResolvedValue({
      id: 1,
      username: 'alice',
      email: 'alice@test.com',
      createdAt: '',
    });

    render(<AddUserForm />);
    await userEvent.type(screen.getByLabelText('Username'), 'alice');
    await userEvent.type(screen.getByLabelText('Email'), 'alice@test.com');
    await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

    await waitFor(() =>
      expect(screen.getByText('User alice added successfully')).toBeInTheDocument(),
    );
    expect(api.createUser).toHaveBeenCalledWith('alice', 'alice@test.com');
  });

  it('shows error message when createUser rejects', async () => {
    vi.mocked(api.createUser).mockRejectedValue(new Error('Username or email already exists'));

    render(<AddUserForm />);
    await userEvent.type(screen.getByLabelText('Username'), 'alice');
    await userEvent.type(screen.getByLabelText('Email'), 'alice@test.com');
    await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

    await waitFor(() =>
      expect(screen.getByText('Username or email already exists')).toBeInTheDocument(),
    );
  });

  it('disables button while submitting', async () => {
    vi.mocked(api.createUser).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ id: 1, username: 'alice', email: 'alice@test.com', createdAt: '' }), 100)),
    );

    render(<AddUserForm />);
    await userEvent.type(screen.getByLabelText('Username'), 'alice');
    await userEvent.type(screen.getByLabelText('Email'), 'alice@test.com');
    await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

    expect(screen.getByRole('button', { name: 'Add User' })).toBeDisabled();
    await waitFor(() => screen.getByText('User alice added successfully'));
  });
});
