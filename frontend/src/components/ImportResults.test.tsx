import { render, screen } from '@testing-library/react';
import { ImportResults } from './ImportResults';

describe('ImportResults', () => {
  it('shows count of created users', () => {
    render(<ImportResults result={{ created: 3, failed: [] }} />);
    expect(screen.getByText('3 users imported successfully')).toBeInTheDocument();
  });

  it('shows no failures message when all rows succeed', () => {
    render(<ImportResults result={{ created: 2, failed: [] }} />);
    expect(screen.queryByText(/failed/i)).not.toBeInTheDocument();
  });

  it('shows failed row count and errors', () => {
    render(
      <ImportResults
        result={{
          created: 1,
          failed: [
            { row: 2, username: '', email: 'bad', errors: ['email must be an email'] },
          ],
        }}
      />,
    );
    expect(screen.getByText('1 row failed')).toBeInTheDocument();
    expect(screen.getByText(/email must be an email/)).toBeInTheDocument();
    expect(screen.getByText(/Row 2/)).toBeInTheDocument();
  });

  it('pluralises "rows failed" when multiple failures', () => {
    render(
      <ImportResults
        result={{
          created: 0,
          failed: [
            { row: 1, username: 'a', email: 'bad1', errors: ['error'] },
            { row: 2, username: 'b', email: 'bad2', errors: ['error'] },
          ],
        }}
      />,
    );
    expect(screen.getByText('2 rows failed')).toBeInTheDocument();
  });
});
