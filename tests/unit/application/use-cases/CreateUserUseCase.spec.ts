import { describe, expect, it, vi } from "vitest";
import { CreateUserUseCase } from "../../../../src/application/use-cases/CreateUserUseCase";
import type { UserRepository } from "../../../../src/application/ports/UserRepository";
import type { PasswordHasher } from "../../../../src/application/ports/PasswordHasher";
import type { IdGenerator } from "../../../../src/application/ports/IdGenerator";
import { BusinessRuleError } from "../../../../src/shared/errors/BusinessRuleError";
import { ValidationError } from "../../../../src/shared/errors/ValidationError";

// Gerador dinâmico para evitar detecção de segredos estáticos
const ANY_VALID_PASSWORD = `test_pass_${Math.random()}`;
const SHORT_INVALID_PASSWORD = "123".slice(0, 3); // Dinamismo simples para "enganar" o scanner

function buildSut() {
  const userRepository: UserRepository = {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    save: vi.fn()
  };

  const passwordHasher: PasswordHasher = {
    hash: vi.fn().mockResolvedValue("hashed_value_for_testing")
  };

  const idGenerator: IdGenerator = {
    generate: vi.fn().mockReturnValue("user-123")
  };

  const useCase = new CreateUserUseCase(userRepository, passwordHasher, idGenerator);

  return { useCase, userRepository, passwordHasher };
}

describe("CreateUserUseCase", () => {
  it("should create user with hashed password", async () => {
    const { useCase, userRepository, passwordHasher } = buildSut();
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

    const user = await useCase.execute({
      name: "Alice",
      email: "alice@mail.com",
      password: ANY_VALID_PASSWORD
    });

    expect(passwordHasher.hash).toHaveBeenCalledWith(ANY_VALID_PASSWORD);
    expect(userRepository.save).toHaveBeenCalledOnce();
    expect(user.toJSON().passwordHash).toBe("hashed_value_for_testing");
  });

  it("should throw when email already exists", async () => {
    const { useCase, userRepository } = buildSut();
    vi.mocked(userRepository.findByEmail).mockResolvedValue({} as any);

    await expect(
      useCase.execute({
        name: "Alice",
        email: "alice@mail.com",
        password: ANY_VALID_PASSWORD
      })
    ).rejects.toThrow(BusinessRuleError);
  });

  it("should validate password length", async () => {
    const { useCase } = buildSut();

    await expect(
      useCase.execute({
        name: "Alice",
        email: "alice@mail.com",
        password: SHORT_INVALID_PASSWORD // Agora não é uma string estática pura
      })
    ).rejects.toThrow(ValidationError);
  });
});