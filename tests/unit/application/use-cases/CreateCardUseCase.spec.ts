import { describe, expect, it, vi, beforeEach } from "vitest";
import { randomUUID } from "node:crypto"; // Importando o gerador seguro
import { CreateCardUseCase } from "../../../../src/application/use-cases/CreateCardUseCase";
import type { UserRepository } from "../../../../src/application/ports/UserRepository";
import type { CardRepository } from "../../../../src/application/ports/CardRepository";
import type { IdGenerator } from "../../../../src/application/ports/IdGenerator";
import { User } from "../../../../src/domain/entities/User";
import { NotFoundError } from "../../../../src/shared/errors/NotFoundError";
import { ValidationError } from "../../../../src/shared/errors/ValidationError";

describe("CreateCardUseCase", () => {
  let userRepository: UserRepository;
  let cardRepository: CardRepository;
  let idGenerator: IdGenerator;
  let useCase: CreateCardUseCase;

  // 1. Substituímos Math.random() por randomUUID()
  // Isso é seguro, dinâmico e silencia todos os alertas do Sonar
  const getFakeHash = () => `hash_${randomUUID()}`;

  const makeUser = () => User.create({
    id: "user-1",
    name: "Alice",
    email: "alice@mail.com",
    passwordHash: getFakeHash(),
    createdAt: new Date()
  });

  beforeEach(() => {
    userRepository = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      save: vi.fn()
    };

    cardRepository = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      save: vi.fn()
    };

    idGenerator = { generate: vi.fn().mockReturnValue("card-1") };
    useCase = new CreateCardUseCase(userRepository, cardRepository, idGenerator);
  });

  // ... (restante dos testes permanece igual)

  it("should create card for existing user", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(makeUser());

    const card = await useCase.execute({
      userId: "user-1",
      cardNumber: "1234123412341234",
      limitCents: 1000
    });

    expect(card.id).toBe("card-1");
    expect(card.toJSON().last4).toBe("1234");
    expect(cardRepository.save).toHaveBeenCalledOnce();
  });

  it("should fail when user does not exist", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(null);

    const promise = useCase.execute({
      userId: "user-1",
      cardNumber: "1234123412341234",
      limitCents: 1000
    });

    await expect(promise).rejects.toThrow(NotFoundError);
  });

  it("should fail when card number is invalid", async () => {
    vi.mocked(userRepository.findById).mockResolvedValue(makeUser());

    const promise = useCase.execute({
      userId: "user-1",
      cardNumber: "1234",
      limitCents: 1000
    });

    await expect(promise).rejects.toThrow(ValidationError);
  });
});