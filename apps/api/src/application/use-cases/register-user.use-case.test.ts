/* eslint-disable sonarjs/no-hardcoded-passwords */
import { describe, expect, test } from "bun:test";

import { AppError } from "#application/errors/app-error";
import type { PasswordHasher } from "#application/services/password-hasher";
import { RegisterUserUseCase } from "#application/use-cases/register-user.use-case";
import type { User } from "#domain/entities/user";
import type {
  AdminUser,
  CreateUserInput,
  UserDetail,
  UserRepository,
} from "#domain/repositories/user-repository";

function makeUser(overrides: Partial<User> = {}): User {
  const now = new Date("2026-01-01T00:00:00.000Z");

  return {
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
    passwordHash: "hashed-password",
    role: "USER",
    isBanned: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

async function notImplemented(): Promise<never> {
  throw new Error("not implemented");
}

class FakeUserRepository implements UserRepository {
  existingUser: User | null = null;
  createdInput: CreateUserInput | null = null;

  async findByEmail(): Promise<User | null> {
    return this.existingUser;
  }

  async findById(): Promise<User | null> {
    return notImplemented();
  }

  async list(): Promise<{ data: User[]; total: number }> {
    return notImplemented();
  }

  async listAdmins(): Promise<AdminUser[]> {
    return notImplemented();
  }

  async countByRole(): Promise<number> {
    return notImplemented();
  }

  async getDetail(): Promise<UserDetail | null> {
    return notImplemented();
  }

  async updateBanStatus(): Promise<User | null> {
    return notImplemented();
  }

  async updateRole(): Promise<User | null> {
    return notImplemented();
  }

  async create(input: CreateUserInput): Promise<User> {
    this.createdInput = input;

    return makeUser({
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      role: input.role ?? "USER",
      isBanned: input.isBanned ?? false,
    });
  }
}

class FakePasswordHasher implements PasswordHasher {
  comparedValues: Array<{ value: string; hash: string }> = [];
  hashedValues: string[] = [];

  async hash(value: string): Promise<string> {
    this.hashedValues.push(value);

    return `hashed:${value}`;
  }

  async compare(value: string, hash: string): Promise<boolean> {
    this.comparedValues.push({ value, hash });

    return hash === `hashed:${value}`;
  }
}

describe("RegisterUserUseCase", () => {
  test("hashes the password and creates a user when the email is available", async () => {
    const userRepository = new FakeUserRepository();
    const passwordHasher = new FakePasswordHasher();
    const useCase = new RegisterUserUseCase(userRepository, passwordHasher);

    const user = await useCase.execute({
      name: "Gabriel",
      email: "gabriel@example.com",
      password: "super-secret",
    });

    expect(passwordHasher.hashedValues).toEqual(["super-secret"]);
    expect(userRepository.createdInput).toEqual({
      name: "Gabriel",
      email: "gabriel@example.com",
      passwordHash: "hashed:super-secret",
    });
    expect(user.email).toBe("gabriel@example.com");
    expect(user.passwordHash).toBe("hashed:super-secret");
  });

  test("rejects duplicated emails before hashing or creating the user", async () => {
    const userRepository = new FakeUserRepository();
    const passwordHasher = new FakePasswordHasher();
    userRepository.existingUser = makeUser({ email: "taken@example.com" });

    const useCase = new RegisterUserUseCase(userRepository, passwordHasher);

    try {
      await useCase.execute({
        name: "Taken",
        email: "taken@example.com",
        password: "super-secret",
      });
      throw new Error("expected RegisterUserUseCase to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).statusCode).toBe(409);
      expect((error as Error).message).toBe("E-mail já cadastrado");
    }

    expect(passwordHasher.hashedValues).toEqual([]);
    expect(userRepository.createdInput).toBeNull();
  });
});
