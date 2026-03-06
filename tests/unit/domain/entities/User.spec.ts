import { describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto"; // Importação do gerador seguro
import { User } from "../../../../src/domain/entities/User";
import { ValidationError } from "../../../../src/shared/errors/ValidationError";

describe("User entity", () => {
  // 1. Substituímos Math.random() por randomUUID()
  // Isso resolve o alerta de "pseudorandom" e mantém o valor dinâmico para evitar o alerta de "hard-coded"
  const getTestHash = () => `hash_${randomUUID()}`;

  it("should normalize email to lowercase", () => {
    const user = User.create({
      id: "user-1",
      name: "User Test",
      email: "USER@MAIL.COM",
      passwordHash: getTestHash(),
      createdAt: new Date()
    });

    expect(user.email).toBe("user@mail.com");
  });

  it("should throw for invalid email", () => {
    expect(() =>
      User.create({
        id: "user-1",
        name: "User Test",
        email: "invalid-mail",
        passwordHash: getTestHash(),
        createdAt: new Date()
      })
    ).toThrow(ValidationError);
  });

  it("should throw when name is empty", () => {
    expect(() =>
      User.create({
        id: "user-1",
        name: "",
        email: "user@mail.com",
        passwordHash: getTestHash(),
        createdAt: new Date()
      })
    ).toThrow(ValidationError);
  });
});