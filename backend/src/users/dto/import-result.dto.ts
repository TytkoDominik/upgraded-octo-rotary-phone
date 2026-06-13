export interface FailedRow {
  row: number;
  username: string;
  email: string;
  errors: string[];
}

export interface ImportResultDto {
  created: number;
  failed: FailedRow[];
}
