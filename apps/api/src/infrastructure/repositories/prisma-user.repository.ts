import { type Prisma } from "@prisma/client";

import type { User, UserRole } from "#domain/entities/user";
import type {
  AdminUser,
  CreateUserInput,
  ListUsersInput,
  UserDetail,
  UserRepository,
} from "#domain/repositories/user-repository";
import { prisma } from "#infrastructure/database/prisma-client";

function mapUser(model: {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  isBanned: boolean;
  createdAt: Date;
  updatedAt: Date;
}): User {
  return {
    id: model.id,
    name: model.name,
    email: model.email,
    passwordHash: model.passwordHash,
    role: model.role,
    isBanned: model.isBanned,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt
  };
}

function mapAdminUser(model: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  activityLogs: Array<{ createdAt: Date }>;
}): AdminUser {
  return {
    id: model.id,
    name: model.name,
    email: model.email,
    role: model.role,
    createdAt: model.createdAt,
    lastLoginAt: model.activityLogs[0]?.createdAt ?? null,
  };
}

function buildWhere(input: ListUsersInput): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {};

  if (input.search) {
    where.OR = [
      {
        name: {
          contains: input.search,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: input.search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (input.role) {
    where.role = input.role;
  }

  if (input.isBanned !== undefined) {
    where.isBanned = input.isBanned;
  }

  return where;
}

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? mapUser(user) : null;
  }

  async findById(userId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user ? mapUser(user) : null;
  }

  async list(input: ListUsersInput): Promise<{ data: User[]; total: number }> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;
    const skip = (page - 1) * limit;
    const where = buildWhere(input);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users.map(mapUser),
      total,
    };
  }

  async listAdmins(): Promise<AdminUser[]> {
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ["ADMIN", "SUPER_ADMIN"],
        },
      },
      orderBy: [{ role: "desc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        activityLogs: {
          where: {
            action: "USER_LOGIN",
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            createdAt: true,
          },
        },
      },
    });

    return admins.map(mapAdminUser);
  }

  async countByRole(role: UserRole): Promise<number> {
    return prisma.user.count({
      where: { role },
    });
  }

  async getDetail(userId: string): Promise<UserDetail | null> {
    const [user, auctionsCount, bidsCount, wonAuctionRows] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.auction.count({ where: { sellerId: userId } }),
      prisma.bid.count({ where: { bidderId: userId } }),
      prisma.$queryRaw<Array<{ wonCount: bigint }>>`
        SELECT COUNT(DISTINCT a.id)::bigint AS "wonCount"
        FROM "auctions" a
        INNER JOIN "bids" b ON b."auctionId" = a.id
        WHERE a."status" = 'CLOSED'::"AuctionStatus"
          AND b."bidderId" = ${userId}::uuid
          AND b."amount" = a."highestBid"
      `,
    ]);

    if (!user) {
      return null;
    }

    return {
      ...mapUser(user),
      auctionsCount,
      bidsCount,
      wonAuctionsCount: Number(wonAuctionRows[0]?.wonCount ?? 0n),
    };
  }

  async updateBanStatus(userId: string, isBanned: boolean): Promise<User | null> {
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });

    if (!existingUser) {
      return null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isBanned },
    });

    return mapUser(updatedUser);
  }

  async updateRole(userId: string, role: UserRole): Promise<User | null> {
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });

    if (!existingUser) {
      return null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return mapUser(updatedUser);
  }

  async create(input: CreateUserInput): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email: input.email,
        isBanned: input.isBanned ?? false,
        name: input.name,
        passwordHash: input.passwordHash,
        role: input.role,
      },
    });
    return mapUser(user);
  }
}
