export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export interface FailedRow {
  row: number;
  username: string;
  email: string;
  errors: string[];
}

export interface ImportResult {
  created: number;
  failed: FailedRow[];
}
