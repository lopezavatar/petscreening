export type ValidationStatus = 'valid' | 'warning' | 'error';

export interface ValidationResult {
  status: ValidationStatus;
  message: string;
}
