import { ValidationError } from "../../shared/errors/ValidationError";

export function assertNonEmptyString(value: string | undefined | null, fieldName: string): void {
  // O ?. substitui a necessidade de checar se 'value' existe antes do trim
  if (!value?.trim()) {
    throw new ValidationError(`${fieldName} is required`);
  }
}

export function assertPositiveInteger(value: number, fieldName: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new ValidationError(`${fieldName} must be a positive integer`);
  }
}