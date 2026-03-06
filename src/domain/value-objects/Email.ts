import { ValidationError } from "../../shared/errors/ValidationError";

export class Email {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  public static create(email: string): Email {
    if (!email || email.length > 254) {
      throw new ValidationError("Email is too long or empty");
    }

    const normalized = email.trim().toLowerCase();

    // Regex simplificada e mais segura contra backtracking
    // Ela foca em: [texto] @ [texto] . [texto] sem repetições aninhadas complexas
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

    if (!emailRegex.test(normalized)) {
      throw new ValidationError("Invalid email format");
    }

    return new Email(normalized);
  }

  public getValue(): string {
    return this.value;
  }
}