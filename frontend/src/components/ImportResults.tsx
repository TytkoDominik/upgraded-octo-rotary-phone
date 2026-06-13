import type { ImportResult } from '../types';

interface Props {
  result: ImportResult;
}

export function ImportResults({ result }: Props) {
  const failCount = result.failed.length;
  return (
    <div>
      <p>{result.created} users imported successfully</p>
      {failCount > 0 && (
        <>
          <p>
            {failCount} {failCount === 1 ? 'row' : 'rows'} failed
          </p>
          <ul>
            {result.failed.map((f) => (
              <li key={f.row}>
                Row {f.row} ({f.username}, {f.email}): {f.errors.join(', ')}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
