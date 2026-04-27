/* eslint-disable sonarjs/no-hardcoded-passwords */
import { describe, expect, test } from "bun:test";

import { AppError } from "#application/errors/app-error";
import { AuditService } from "#application/services/audit-service";
import type { PasswordHasher } from "#application/services/password-hasher";
import { BanUserUseCase } from "#application/use-cases/admin/ban-user.use-case";
import { CreateAdminUseCase } from "#application/use-cases/admin/create-admin.use-case";
import { DemoteAdminUseCase } from "#application/use-cases/admin/demote-admin.use-case";
import { PromoteUserUseCase } from "#application/use-cases/admin/promote-user.use-case";
import { UnbanUserUseCase } from "#application/use-cases/admin/unban-user.use-case";
import type { ActionType, ActivityLog } from "#domain/entities/activity-log";
import type { User, UserRole } from "#domain/entities/user";
import type {
  ActivityLogRepository,
  CreateActivityLogInput,
} from "#domain/repositories/activity-log-repository";
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
    name: "Regular User",
    email: "user@example.com",
    passwordHash: "password-hash",
    role: "USER",
    isBanned: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function makeActivityLog(input: CreateActivityLogInput): ActivityLog {
  return {
    id: "activity-1",
    action: input.action as ActionType,
    entityType: input.entityType,
    entityId: input.entityId,
    actorId: input.actorId ?? null,
    actorName: null,
    actorEmail: null,
    metadata: input.metadata ?? null,
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
    createdAt: new Date("2026-01-02T00:00:00.000Z"),
  };
}

async function notImplemented(): Promise<never> {
  throw new Error("not implemented");
}

async function expectAppError(
  action: () => Promise<unknown>,
  statusCode: number,
  message: string
): Promise<void> {
  try {
    await action();
    throw new Error("expected action to throw");
  } catch (error) {
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).statusCode).toBe(statusCode);
    expect((error as Error).message).toBe(message);
  }
}

class FakeActivityLogRepository implements ActivityLogRepository {
  createdInputs: CreateActivityLogInput[] = [];

  async create(input: CreateActivityLogInput): Promise<ActivityLog> {
    this.createdInputs.push(input);

    return makeActivityLog(input);
  }

  async findById(): Promise<ActivityLog | null> {
    return notImplemented();
  }

  async list(): Promise<{ data: ActivityLog[]; total: number }> {
    return notImplemented();
  }

  async listAll(): Promise<ActivityLog[]> {
    return notImplemented();
  }

  async listRecentForAdminNotifications(): Promise<ActivityLog[]> {
    return notImplemented();
  }
}

class FakePasswordHasher implements PasswordHasher {
  hashedValues: string[] = [];

  async hash(value: string): Promise<string> {
    this.hashedValues.push(value);

    return `hashed:${value}`;
  }

  async compare(): Promise<boolean> {
    return notImplemented();
  }
}

class FakeUserRepository implements UserRepository {
  createdInputs: CreateUserInput[] = [];
  existingByEmail: User | null = null;
  superAdminCount = 2;
  updatedBanStatus: Array<{ userId: string; isBanned: boolean }> = [];
  updatedRoles: Array<{ userId: string; role: UserRole }> = [];
  usersById = new Map<string, User>();

  async findByEmail(): Promise<User | null> {
    return this.existingByEmail;
  }

  async findById(userId: string): Promise<User | null> {
    return this.usersById.get(userId) ?? null;
  }

  async list(): Promise<{ data: User[]; total: number }> {
    return notImplemented();
  }

  async listAdmins(): Promise<AdminUser[]> {
    return notImplemented();
  }

  async countByRole(role: UserRole): Promise<number> {
    return role === "SUPER_ADMIN" ? this.superAdminCount : 0;
  }

  async getDetail(): Promise<UserDetail | null> {
    return notImplemented();
  }

  async updateBanStatus(userId: string, isBanned: boolean): Promise<User | null> {
    this.updatedBanStatus.push({ userId, isBanned });
    const user = this.usersById.get(userId);

    if (!user) {
      return null;
    }

    const updatedUser = { ...user, isBanned };
    this.usersById.set(userId, updatedUser);

    return updatedUser;
  }

  async updateRole(userId: string, role: UserRole): Promise<User | null> {
    this.updatedRoles.push({ userId, role });
    const user = this.usersById.get(userId);

    if (!user) {
      return null;
    }

    const updatedUser = { ...user, role };
    this.usersById.set(userId, updatedUser);

    return updatedUser;
  }

  async create(input: CreateUserInput): Promise<User> {
    this.createdInputs.push(input);

    return makeUser({
      id: "admin-created",
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      role: input.role ?? "USER",
      isBanned: input.isBanned ?? false,
    });
  }
}

function makeUseCases() {
  const activityLogRepository = new FakeActivityLogRepository();
  const auditService = new AuditService(activityLogRepository);
  const passwordHasher = new FakePasswordHasher();
  const userRepository = new FakeUserRepository();

  return {
    activityLogRepository,
    banUserUseCase: new BanUserUseCase(userRepository, auditService),
    createAdminUseCase: new CreateAdminUseCase(userRepository, passwordHasher, auditService),
    demoteAdminUseCase: new DemoteAdminUseCase(userRepository, auditService),
    passwordHasher,
    promoteUserUseCase: new PromoteUserUseCase(userRepository, auditService),
    unbanUserUseCase: new UnbanUserUseCase(userRepository, auditService),
    userRepository,
  };
}

describe("admin moderation use cases", () => {
  test("bans a regular user and writes an audit log", async () => {
    const { activityLogRepository, banUserUseCase, userRepository } = makeUseCases();
    userRepository.usersById.set("target-user", makeUser({ id: "target-user" }));

    await banUserUseCase.execute({
      actorId: "admin-1",
      actorRole: "ADMIN",
      userId: "target-user",
      reason: "Policy violation",
      ipAddress: "127.0.0.1",
    });

    expect(userRepository.updatedBanStatus).toEqual([
      { userId: "target-user", isBanned: true },
    ]);
    expect(activityLogRepository.createdInputs[0]).toMatchObject({
      action: "USER_BANNED",
      actorId: "admin-1",
      entityId: "target-user",
      entityType: "user",
      metadata: {
        email: "user@example.com",
        name: "Regular User",
        reason: "Policy violation",
        role: "USER",
      },
    });
  });

  test("prevents admins from banning other admins", async () => {
    const { banUserUseCase, userRepository } = makeUseCases();
    userRepository.usersById.set("target-admin", makeUser({ id: "target-admin", role: "ADMIN" }));

    await expectAppError(
      () =>
        banUserUseCase.execute({
          actorId: "admin-1",
          actorRole: "ADMIN",
          userId: "target-admin",
          reason: "Policy violation",
        }),
      403,
      "Admins só podem banir usuários comuns"
    );
  });

  test("unbans a banned user", async () => {
    const { unbanUserUseCase, userRepository } = makeUseCases();
    userRepository.usersById.set("target-user", makeUser({ id: "target-user", isBanned: true }));

    await unbanUserUseCase.execute({
      actorId: "admin-1",
      actorRole: "ADMIN",
      userId: "target-user",
    });

    expect(userRepository.updatedBanStatus).toEqual([
      { userId: "target-user", isBanned: false },
    ]);
  });

  test("promotes an active user to admin and records the role change", async () => {
    const { activityLogRepository, promoteUserUseCase, userRepository } = makeUseCases();
    userRepository.usersById.set("target-user", makeUser({ id: "target-user" }));

    await promoteUserUseCase.execute({
      actorId: "super-admin-1",
      userId: "target-user",
    });

    expect(userRepository.updatedRoles).toEqual([{ userId: "target-user", role: "ADMIN" }]);
    expect(activityLogRepository.createdInputs[0]?.metadata).toEqual({
      email: "user@example.com",
      name: "Regular User",
      previousRole: "USER",
      newRole: "ADMIN",
    });
  });

  test("does not promote banned users", async () => {
    const { promoteUserUseCase, userRepository } = makeUseCases();
    userRepository.usersById.set("target-user", makeUser({ id: "target-user", isBanned: true }));

    await expectAppError(
      () => promoteUserUseCase.execute({ actorId: "super-admin-1", userId: "target-user" }),
      409,
      "Não é possível promover um usuário banido"
    );
  });

  test("does not demote the last super admin", async () => {
    const { demoteAdminUseCase, userRepository } = makeUseCases();
    userRepository.superAdminCount = 1;
    userRepository.usersById.set(
      "super-admin-1",
      makeUser({ id: "super-admin-1", role: "SUPER_ADMIN" })
    );

    await expectAppError(
      () => demoteAdminUseCase.execute({ actorId: "super-admin-2", adminId: "super-admin-1" }),
      409,
      "Não é permitido rebaixar o último SUPER_ADMIN"
    );
  });

  test("creates an admin with a hashed password and audit log", async () => {
    const {
      activityLogRepository,
      createAdminUseCase,
      passwordHasher,
      userRepository,
    } = makeUseCases();

    const output = await createAdminUseCase.execute({
      actorId: "super-admin-1",
      name: "New Admin",
      email: "new-admin@example.com",
      password: "admin-secret",
    });

    expect(passwordHasher.hashedValues).toEqual(["admin-secret"]);
    expect(userRepository.createdInputs).toEqual([
      {
        email: "new-admin@example.com",
        name: "New Admin",
        passwordHash: "hashed:admin-secret",
        role: "ADMIN",
      },
    ]);
    expect(output).toMatchObject({
      id: "admin-created",
      email: "new-admin@example.com",
      role: "ADMIN",
    });
    expect(activityLogRepository.createdInputs[0]?.action).toBe("ADMIN_CREATED");
  });

  test("rejects duplicated admin emails before hashing", async () => {
    const { createAdminUseCase, passwordHasher, userRepository } = makeUseCases();
    userRepository.existingByEmail = makeUser({ email: "taken@example.com" });

    await expectAppError(
      () =>
        createAdminUseCase.execute({
          actorId: "super-admin-1",
          name: "Taken",
          email: "taken@example.com",
          password: "admin-secret",
        }),
      409,
      "E-mail já cadastrado"
    );

    expect(passwordHasher.hashedValues).toEqual([]);
    expect(userRepository.createdInputs).toEqual([]);
  });
});
