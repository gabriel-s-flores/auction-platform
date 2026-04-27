/* eslint-disable sonarjs/no-hardcoded-passwords */
import type { Auction, PrismaClient, User } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "bun:test";

import type { AuditService } from "#application/services/audit-service";
import type { ApproveAuctionUseCase } from "#application/use-cases/admin/approve-auction.use-case";
import type { RejectAuctionUseCase } from "#application/use-cases/admin/reject-auction.use-case";
import type { CloseAuctionUseCase } from "#application/use-cases/close-auction.use-case";
import type { CloseExpiredAuctionsUseCase } from "#application/use-cases/close-expired-auctions.use-case";
import type { CreateAuctionUseCase } from "#application/use-cases/create-auction.use-case";
import type { AuctionRepository, PlaceBidResult } from "#domain/repositories/auction-repository";

const testDatabaseUrl = Bun.env.TEST_DATABASE_URL;

function assertSafeTestDatabaseUrl(databaseUrl: string): void {
  if (!databaseUrl.toLowerCase().includes("test")) {
    throw new Error("TEST_DATABASE_URL must point to a database with 'test' in its name.");
  }
}

function isAppError(error: unknown): error is Error & { statusCode: number } {
  const candidate = error as { statusCode?: unknown };

  return error instanceof Error && typeof candidate.statusCode === "number";
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
    expect(isAppError(error)).toBe(true);

    if (isAppError(error)) {
      expect(error.statusCode).toBe(statusCode);
      expect(error.message).toBe(message);
    }
  }
}

function fulfilledResults<T>(
  results: PromiseSettledResult<T>[]
): PromiseFulfilledResult<T>[] {
  return results.filter(
    (result): result is PromiseFulfilledResult<T> => result.status === "fulfilled"
  );
}

function rejectedResults<T>(results: PromiseSettledResult<T>[]): PromiseRejectedResult[] {
  return results.filter(
    (result): result is PromiseRejectedResult => result.status === "rejected"
  );
}

if (!testDatabaseUrl) {
  throw new Error("TEST_DATABASE_URL is required for database integration tests.");
} else {
  assertSafeTestDatabaseUrl(testDatabaseUrl);
  process.env.DATABASE_URL = testDatabaseUrl;
  Bun.env.DATABASE_URL = testDatabaseUrl;

  let approveAuctionUseCase: ApproveAuctionUseCase;
  let auctionRepository: AuctionRepository;
  let closeAuctionUseCase: CloseAuctionUseCase;
  let closeExpiredAuctionsUseCase: CloseExpiredAuctionsUseCase;
  let createAuctionUseCase: CreateAuctionUseCase;
  let prisma: PrismaClient;
  let rejectAuctionUseCase: RejectAuctionUseCase;

  async function resetDatabase(): Promise<void> {
    await prisma.$transaction([
      prisma.adminNotificationRead.deleteMany(),
      prisma.activityLog.deleteMany(),
      prisma.pendingAuctionEdit.deleteMany(),
      prisma.image.deleteMany(),
      prisma.bid.deleteMany(),
      prisma.auction.deleteMany(),
      prisma.user.deleteMany(),
    ]);
  }

  async function createUser(role: User["role"] = "USER", emailPrefix = "user"): Promise<User> {
    return prisma.user.create({
      data: {
        email: `${emailPrefix}-${role.toLowerCase()}@integration.test`,
        isBanned: false,
        name: `${emailPrefix} ${role}`,
        passwordHash: "integration-test-password-hash",
        role,
      },
    });
  }

  async function createAuction(input: {
    sellerId: string;
    approvedById?: string | null;
    endsAt?: Date;
    highestBid?: number;
    rejectionReason?: string | null;
    startingPrice?: number;
    status?: Auction["status"];
    title?: string;
  }): Promise<Auction> {
    const startingPrice = input.startingPrice ?? 100;

    return prisma.auction.create({
      data: {
        approvedAt: input.approvedById ? new Date("2026-01-01T00:00:00.000Z") : null,
        approvedById: input.approvedById ?? null,
        description: "Integration test auction",
        endsAt: input.endsAt ?? new Date(Date.now() + 60_000),
        highestBid: input.highestBid ?? startingPrice,
        rejectionReason: input.rejectionReason ?? null,
        sellerId: input.sellerId,
        startingPrice,
        status: input.status ?? "OPEN",
        title: input.title ?? "Integration test auction",
      },
    });
  }

  beforeAll(async () => {
    const [{ AuditService: AuditServiceClass }, { CloseAuctionUseCase: CloseAuctionUseCaseClass }, { CloseExpiredAuctionsUseCase: CloseExpiredAuctionsUseCaseClass }, { CreateAuctionUseCase: CreateAuctionUseCaseClass }, { ApproveAuctionUseCase: ApproveAuctionUseCaseClass }, { RejectAuctionUseCase: RejectAuctionUseCaseClass }, { prisma: prismaClient }, { PrismaActivityLogRepository }, { PrismaAuctionRepository }] = await Promise.all([
      import("#application/services/audit-service"),
      import("#application/use-cases/close-auction.use-case"),
      import("#application/use-cases/close-expired-auctions.use-case"),
      import("#application/use-cases/create-auction.use-case"),
      import("#application/use-cases/admin/approve-auction.use-case"),
      import("#application/use-cases/admin/reject-auction.use-case"),
      import("#infrastructure/database/prisma-client"),
      import("#infrastructure/repositories/prisma-activity-log.repository"),
      import("#infrastructure/repositories/prisma-auction.repository"),
    ]);

    prisma = prismaClient;
    auctionRepository = new PrismaAuctionRepository();

    const activityLogRepository = new PrismaActivityLogRepository();
    const auditService: AuditService = new AuditServiceClass(activityLogRepository);

    approveAuctionUseCase = new ApproveAuctionUseCaseClass(auctionRepository, auditService);
    closeAuctionUseCase = new CloseAuctionUseCaseClass(auctionRepository);
    closeExpiredAuctionsUseCase = new CloseExpiredAuctionsUseCaseClass(auctionRepository);
    createAuctionUseCase = new CreateAuctionUseCaseClass(auctionRepository);
    rejectAuctionUseCase = new RejectAuctionUseCaseClass(auctionRepository, auditService);

    await resetDatabase();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await resetDatabase();
    await prisma.$disconnect();
  });

  describe("bid placement integration", () => {
    test("serializes equal concurrent bids so only one can win", async () => {
      const seller = await createUser("USER", "seller");
      const bidderA = await createUser("USER", "bidder-a");
      const bidderB = await createUser("USER", "bidder-b");
      const auction = await createAuction({ sellerId: seller.id, status: "OPEN" });

      const results = await Promise.allSettled<PlaceBidResult>([
        auctionRepository.placeBid({
          amount: 150,
          auctionId: auction.id,
          bidderId: bidderA.id,
        }),
        auctionRepository.placeBid({
          amount: 150,
          auctionId: auction.id,
          bidderId: bidderB.id,
        }),
      ]);

      expect(fulfilledResults(results)).toHaveLength(1);
      expect(rejectedResults(results)).toHaveLength(1);

      const storedAuction = await prisma.auction.findUniqueOrThrow({
        where: { id: auction.id },
        include: { bids: true },
      });

      expect(storedAuction.highestBid).toBe(150);
      expect(storedAuction.version).toBe(1);
      expect(storedAuction.bids).toHaveLength(1);
      expect(storedAuction.bids[0]?.amount).toBe(150);
    });

    test("extends an auction when a valid bid arrives inside the anti-sniping window", async () => {
      const seller = await createUser("USER", "seller");
      const bidder = await createUser("USER", "bidder");
      const originalEndsAt = new Date(Date.now() + 20_000);
      const auction = await createAuction({
        endsAt: originalEndsAt,
        sellerId: seller.id,
        status: "OPEN",
      });

      const result = await auctionRepository.placeBid({
        amount: 150,
        auctionId: auction.id,
        bidderId: bidder.id,
      });

      const storedAuction = await prisma.auction.findUniqueOrThrow({
        where: { id: auction.id },
      });

      expect(result.wasExtended).toBe(true);
      expect(result.auction.endsAt.getTime()).toBeGreaterThan(originalEndsAt.getTime());
      expect(storedAuction.endsAt.getTime()).toBeGreaterThan(originalEndsAt.getTime());
    });

    test("rejects a bid from the auction seller", async () => {
      const seller = await createUser("USER", "seller");
      const auction = await createAuction({ sellerId: seller.id, status: "OPEN" });

      await expectAppError(
        () =>
          auctionRepository.placeBid({
            amount: 150,
            auctionId: auction.id,
            bidderId: seller.id,
          }),
        403,
        "Vendedores não podem dar lances em seus próprios leilões"
      );
    });
  });

  describe("auction lifecycle integration", () => {
    test("creates a pending auction and approves it with audit metadata", async () => {
      const seller = await createUser("USER", "seller");
      const admin = await createUser("ADMIN", "admin");

      const createdAuction = await createAuctionUseCase.execute({
        description: "Needs review",
        endsAt: new Date(Date.now() + 60_000),
        sellerId: seller.id,
        startingPrice: 250,
        title: "Pending review auction",
      });

      expect(createdAuction.status).toBe("PENDING_APPROVAL");
      expect(createdAuction.highestBid).toBe(250);

      await approveAuctionUseCase.execute({
        adminId: admin.id,
        auctionId: createdAuction.id,
        ipAddress: "127.0.0.1",
        userAgent: "integration-test",
      });

      const approvedAuction = await prisma.auction.findUniqueOrThrow({
        where: { id: createdAuction.id },
      });
      const approvalLog = await prisma.activityLog.findFirstOrThrow({
        where: {
          action: "AUCTION_APPROVED",
          actorId: admin.id,
          entityId: createdAuction.id,
        },
      });

      expect(approvedAuction.status).toBe("OPEN");
      expect(approvedAuction.approvedById).toBe(admin.id);
      expect(approvedAuction.approvedAt).toBeInstanceOf(Date);
      expect(approvalLog.metadata).toEqual({ title: "Pending review auction" });
    });

    test("rejects a pending auction and stores the rejection reason", async () => {
      const seller = await createUser("USER", "seller");
      const admin = await createUser("ADMIN", "admin");
      const auction = await createAuction({
        sellerId: seller.id,
        status: "PENDING_APPROVAL",
        title: "Reject me",
      });

      await rejectAuctionUseCase.execute({
        adminId: admin.id,
        auctionId: auction.id,
        reason: "Missing required details",
      });

      const rejectedAuction = await prisma.auction.findUniqueOrThrow({
        where: { id: auction.id },
      });
      const rejectionLog = await prisma.activityLog.findFirstOrThrow({
        where: {
          action: "AUCTION_REJECTED",
          actorId: admin.id,
          entityId: auction.id,
        },
      });

      expect(rejectedAuction.status).toBe("REJECTED");
      expect(rejectedAuction.rejectionReason).toBe("Missing required details");
      expect(rejectionLog.metadata).toEqual({
        reason: "Missing required details",
        title: "Reject me",
      });
    });

    test("lets the seller close an open auction and increments its version", async () => {
      const seller = await createUser("USER", "seller");
      const auction = await createAuction({ sellerId: seller.id, status: "OPEN" });

      await closeAuctionUseCase.execute({
        auctionId: auction.id,
        isAdmin: false,
        userId: seller.id,
      });

      const closedAuction = await prisma.auction.findUniqueOrThrow({
        where: { id: auction.id },
      });

      expect(closedAuction.status).toBe("CLOSED");
      expect(closedAuction.version).toBe(1);
    });

    test("closes only expired open auctions during the expiration sweep", async () => {
      const seller = await createUser("USER", "seller");
      const now = new Date("2026-01-15T12:00:00.000Z");
      const expiredOpenAuction = await createAuction({
        endsAt: new Date("2026-01-15T11:59:00.000Z"),
        sellerId: seller.id,
        status: "OPEN",
        title: "Expired open",
      });
      const futureOpenAuction = await createAuction({
        endsAt: new Date("2026-01-15T12:01:00.000Z"),
        sellerId: seller.id,
        status: "OPEN",
        title: "Future open",
      });
      const pendingExpiredAuction = await createAuction({
        endsAt: new Date("2026-01-15T11:58:00.000Z"),
        sellerId: seller.id,
        status: "PENDING_APPROVAL",
        title: "Expired pending",
      });

      const result = await closeExpiredAuctionsUseCase.execute(now);

      const [expiredOpen, futureOpen, pendingExpired] = await Promise.all([
        prisma.auction.findUniqueOrThrow({ where: { id: expiredOpenAuction.id } }),
        prisma.auction.findUniqueOrThrow({ where: { id: futureOpenAuction.id } }),
        prisma.auction.findUniqueOrThrow({ where: { id: pendingExpiredAuction.id } }),
      ]);

      expect(result.closedAuctionIds).toEqual([expiredOpenAuction.id]);
      expect(result.closedCount).toBe(1);
      expect(expiredOpen.status).toBe("CLOSED");
      expect(expiredOpen.version).toBe(1);
      expect(futureOpen.status).toBe("OPEN");
      expect(pendingExpired.status).toBe("PENDING_APPROVAL");
    });
  });
}
