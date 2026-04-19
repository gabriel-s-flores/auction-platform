import { AppError } from "#application/errors/app-error";
import type { AuditService } from "#application/services/audit-service";
import type { PasswordHasher } from "#application/services/password-hasher";
import type { UserRole } from "#domain/entities/user";
import type { UserRepository } from "#domain/repositories/user-repository";

interface CreateAdminInput {
  actorId: string;
  name: string;
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

interface CreateAdminOutput {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastLoginAt: string | null;
}

export class CreateAdminUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly auditService: AuditService
  ) {}

  async execute(input: CreateAdminInput): Promise<CreateAdminOutput> {
    const existingUser = await this.userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new AppError("E-mail já cadastrado", 409);
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const admin = await this.userRepository.create({
      email: input.email,
      name: input.name,
      passwordHash,
      role: "ADMIN",
    });

    await this.auditService.log(
      "ADMIN_CREATED",
      "user",
      admin.id,
      {
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
      {
        actorId: input.actorId,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      }
    );

    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt.toISOString(),
      lastLoginAt: null,
    };
  }
}