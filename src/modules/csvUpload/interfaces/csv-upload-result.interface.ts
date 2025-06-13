export interface CsvUploadResult<T> {
  validData: T[];
  errors: {
    row: number;
    errors: string[];
  }[];
}
