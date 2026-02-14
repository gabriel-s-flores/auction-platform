import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await Bun.password.hash("admin123456");
  const userPasswordHash = await Bun.password.hash("user123456");

  const admin = await prisma.user.upsert({
    where: { email: "admin@auction.local" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@auction.local",
      passwordHash: adminPasswordHash,
      role: "ADMIN"
    }
  });

  await prisma.user.upsert({
    where: { email: "user@auction.local" },
    update: {},
    create: {
      name: "User",
      email: "user@auction.local",
      passwordHash: userPasswordHash,
      role: "USER"
    }
  });

  await prisma.auction.createMany({
    data: [
      {
        title: "Notebook Gamer",
        description: "RTX 4070",
        startingPrice: 450000,
        highestBid: 450000,
        status: "OPEN",
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        sellerId: admin.id
      },
      {
        title: "iPhone 15 Pro",
        description: "256GB",
        startingPrice: 300000,
        highestBid: 300000,
        status: "OPEN",
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 12),
        sellerId: admin.id
      }
    ],
    skipDuplicates: true
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
