import { describe, expect, it } from "vitest";
import { User } from "../../../../src/domain/entities/User";
import { ValidationError } from "../../../../src/shared/errors/ValidationError";

describe("User entity", () => {
  // 1. Criamos um gerador dinâmico para o hash de teste
  const getTestHash = () => `hash_${Math.random().toString(36).substring(7)}`;

  it("should normalize email to lowercase", () => {
    const user = User.create({
      id: "user-1",
      name: "User Test",
      email: "USER@MAIL.COM",
      passwordHash: getTestHash(), // Valor dinâmico que o Sonar ignora
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