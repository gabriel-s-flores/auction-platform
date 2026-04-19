// This file populates the database on the first run, which is why some eslint rules are disabled
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

interface SeedAuctionInput {
  title: string;
  description: string | null;
  startingPrice: number;
  highestBid: number;
  status: "OPEN" | "PENDING_APPROVAL" | "REJECTED";
  endsAt: Date;
  sellerId: string;
  approvedById?: string | null;
  approvedAt?: Date | null;
  rejectionReason?: string | null;
}

async function ensureAuction(input: SeedAuctionInput) {
  const existingAuction = await prisma.auction.findFirst({
    where: {
      sellerId: input.sellerId,
      title: input.title,
    },
    select: { id: true },
  });

  const data = {
    approvedAt: input.approvedAt ?? null,
    approvedById: input.approvedById ?? null,
    description: input.description,
    endsAt: input.endsAt,
    highestBid: input.highestBid,
    rejectionReason: input.rejectionReason ?? null,
    sellerId: input.sellerId,
    startingPrice: input.startingPrice,
    status: input.status,
    title: input.title,
  };

  if (!existingAuction) {
    return prisma.auction.create({ data });
  }

  return prisma.auction.update({
    where: { id: existingAuction.id },
    data,
  });
}

async function main() {
  const superAdminPasswordHash = await Bun.password.hash("superadmin123456");
  const adminPasswordHash = await Bun.password.hash("admin123456");
  const userPasswordHash = await Bun.password.hash("user123456");

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@auction.local" },
    update: {
      isBanned: false,
      name: "Super Admin",
      passwordHash: superAdminPasswordHash,
      role: "SUPER_ADMIN",
    },
    create: {
      email: "superadmin@auction.local",
      isBanned: false,
      name: "Super Admin",
      passwordHash: superAdminPasswordHash,
      role: "SUPER_ADMIN",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@auction.local" },
    update: {
      isBanned: false,
      name: "Admin",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
    create: {
      email: "admin@auction.local",
      isBanned: false,
      name: "Admin",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@auction.local" },
    update: {
      isBanned: false,
      name: "User",
      passwordHash: userPasswordHash,
      role: "USER",
    },
    create: {
      email: "user@auction.local",
      isBanned: false,
      name: "User",
      passwordHash: userPasswordHash,
      role: "USER",
    },
  });

  const now = Date.now();

  await Promise.all([
    ensureAuction({
      title: "Notebook Gamer",
      description: "RTX 4070",
      startingPrice: 450000,
      highestBid: 450000,
      status: "OPEN",
      endsAt: new Date(now + 1000 * 60 * 60 * 24),
      sellerId: admin.id,
      approvedAt: new Date(),
      approvedById: superAdmin.id,
    }),
    ensureAuction({
      title: "iPhone 15 Pro",
      description: "256GB",
      startingPrice: 300000,
      highestBid: 300000,
      status: "OPEN",
      endsAt: new Date(now + 1000 * 60 * 60 * 12),
      sellerId: user.id,
      approvedAt: new Date(),
      approvedById: admin.id,
    }),
    ensureAuction({
      title: "Bicicleta Elétrica",
      description: "Autonomia de 45km e bateria removível",
      startingPrice: 180000,
      highestBid: 180000,
      status: "PENDING_APPROVAL",
      endsAt: new Date(now + 1000 * 60 * 60 * 36),
      sellerId: user.id,
    }),
  ]);
}

try {
  await main();
} catch (error) {
  // eslint-disable-next-line no-console
  console.error(error);
  // eslint-disable-next-line n/no-process-exit
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
