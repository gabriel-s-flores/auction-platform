import { type AuctionStatus as PrismaAuctionStatus, Prisma } from "@prisma/client";

import { AppError } from "#application/errors/app-error";
import type { Auction } from "#domain/entities/auction";
import type { Bid } from "#domain/entities/bid";
import type {
  AuctionRepository,
  CloseAuctionResult,
  CreateAuctionInput,
  ListUserAuctionsInput,
  ListUserBidActivityInput,
  ListUserWinsInput,
  PlaceBidInput,
  PlaceBidResult,
  UserAuctionListItem,
  UserBidActivitySummary,
  UserDashboardSummary,
  UserWinSummary,
} from "#domain/repositories/auction-repository";
import { prisma } from "#infrastructure/database/prisma-client";

function mapAuction(model: {
  id: string;
  title: string;
  description: string | null;
  startingPrice: number;
  highestBid: number;
  status: PrismaAuctionStatus;
  endsAt: Date;
  sellerId: string;
  version: number;
  rejectionReason: string | null;
  approvedById: string | null;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): Auction {
  return {
    id: model.id,
    title: model.title,
    description: model.description,
    startingPrice: model.startingPrice,
    highestBid: model.highestBid,
    status: model.status,
    endsAt: model.endsAt,
    sellerId: model.sellerId,
    version: model.version,
    rejectionReason: model.rejectionReason,
    approvedById: model.approvedById,
    approvedAt: model.approvedAt,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt
  };
}

function mapBid(model: { id: string; auctionId: string; bidderId: string; amount: number; createdAt: Date }): Bid {
  return {
    id: model.id,
    auctionId: model.auctionId,
    bidderId: model.bidderId,
    amount: model.amount,
    createdAt: model.createdAt
  };
}

export class PrismaAuctionRepository implements AuctionRepository {
  async listOpenAuctions(): Promise<Auction[]> {
    const auctions = await prisma.auction.findMany({
      where: {
        status: "OPEN",
        endsAt: { gt: new Date() }
      },
      orderBy: { endsAt: "asc" }
    });

    return auctions.map(mapAuction);
  }

  async findById(auctionId: string): Promise<Auction | null> {
    const auction = await prisma.auction.findUnique({ where: { id: auctionId } });
    return auction ? mapAuction(auction) : null;
  }

  async create(input: CreateAuctionInput): Promise<Auction> {
    const auction = await prisma.auction.create({
      data: {
        title: input.title,
        description: input.description,
        startingPrice: input.startingPrice,
        highestBid: input.startingPrice,
        endsAt: input.endsAt,
        sellerId: input.sellerId
      }
    });

    return mapAuction(auction);
  }

  async getUserDashboardSummary(userId: string): Promise<UserDashboardSummary> {
    const now = new Date();

    const [
      totalAuctions,
      activeAuctions,
      pendingAuctions,
      closedAuctions,
      rejectedAuctions,
      wonAuctionRows,
      activeBidRows,
    ] = await Promise.all([
      prisma.auction.count({
        where: { sellerId: userId },
      }),
      prisma.auction.count({
        where: {
          sellerId: userId,
          status: "OPEN",
          endsAt: { gt: now },
        },
      }),
      prisma.auction.count({
        where: {
          sellerId: userId,
          status: "PENDING_APPROVAL",
        },
      }),
      prisma.auction.count({
        where: {
          sellerId: userId,
          status: "CLOSED",
        },
      }),
      prisma.auction.count({
        where: {
          sellerId: userId,
          status: "REJECTED",
        },
      }),
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(DISTINCT a.id)::bigint AS "count"
        FROM "auctions" a
        INNER JOIN "bids" b ON b."auctionId" = a.id
        WHERE a."status" = 'CLOSED'::"AuctionStatus"
          AND b."bidderId" = ${userId}::uuid
          AND b."amount" = a."highestBid"
      `,
      prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(DISTINCT a.id)::bigint AS "count"
        FROM "auctions" a
        INNER JOIN "bids" b ON b."auctionId" = a.id
        WHERE a."status" = 'OPEN'::"AuctionStatus"
          AND a."endsAt" > ${now}
          AND b."bidderId" = ${userId}::uuid
      `,
    ]);

    return {
      totalAuctions,
      activeAuctions,
      pendingAuctions,
      closedAuctions,
      rejectedAuctions,
      wonAuctions: Number(wonAuctionRows[0]?.count ?? 0n),
      activeBidParticipations: Number(activeBidRows[0]?.count ?? 0n),
    };
  }

  async listBySeller(input: ListUserAuctionsInput): Promise<{ data: UserAuctionListItem[]; total: number }> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Prisma.AuctionWhereInput = {
      sellerId: input.userId,
      status: input.status,
    };

    const [auctions, total] = await Promise.all([
      prisma.auction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              bids: true,
            },
          },
        },
      }),
      prisma.auction.count({ where }),
    ]);

    return {
      data: auctions.map((auction) => ({
        ...mapAuction(auction),
        bidsCount: auction._count.bids,
      })),
      total,
    };
  }

  async listWinsByBidder(input: ListUserWinsInput): Promise<{ data: UserWinSummary[]; total: number }> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;
    const skip = (page - 1) * limit;

    const [rows, countRows] = await Promise.all([
      prisma.$queryRaw<Array<{
        auctionId: string;
        title: string;
        finalBid: number;
        endsAt: Date;
        sellerId: string;
        sellerName: string;
      }>>(Prisma.sql`
        SELECT
          a.id AS "auctionId",
          a.title,
          a."highestBid" AS "finalBid",
          a."endsAt",
          a."sellerId",
          seller.name AS "sellerName"
        FROM "auctions" a
        INNER JOIN "users" seller ON seller.id = a."sellerId"
        WHERE a."status" = 'CLOSED'::"AuctionStatus"
          AND EXISTS (
            SELECT 1
            FROM "bids" b
            WHERE b."auctionId" = a.id
              AND b."bidderId" = ${input.userId}::uuid
              AND b."amount" = a."highestBid"
          )
        ORDER BY a."endsAt" DESC
        LIMIT ${limit}
        OFFSET ${skip}
      `),
      prisma.$queryRaw<Array<{ total: bigint }>>(Prisma.sql`
        SELECT COUNT(DISTINCT a.id)::bigint AS "total"
        FROM "auctions" a
        WHERE a."status" = 'CLOSED'::"AuctionStatus"
          AND EXISTS (
            SELECT 1
            FROM "bids" b
            WHERE b."auctionId" = a.id
              AND b."bidderId" = ${input.userId}::uuid
              AND b."amount" = a."highestBid"
          )
      `),
    ]);

    return {
      data: rows,
      total: Number(countRows[0]?.total ?? 0n),
    };
  }

  async listBidActivityByUser(
    input: ListUserBidActivityInput
  ): Promise<{ data: UserBidActivitySummary[]; total: number }> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;
    const skip = (page - 1) * limit;
    const statusFilter = input.status
      ? Prisma.sql`WHERE activity."status" = ${input.status}`
      : Prisma.empty;

    const [rows, countRows] = await Promise.all([
      prisma.$queryRaw<Array<{
        auctionId: string;
        title: string;
        auctionStatus: PrismaAuctionStatus;
        auctionEndsAt: Date;
        sellerName: string;
        highestBid: number;
        userHighestBid: number;
        userBidCount: number;
        status: UserBidActivitySummary["status"];
      }>>(Prisma.sql`
        WITH activity AS (
          SELECT
            a.id AS "auctionId",
            a.title,
            a."status" AS "auctionStatus",
            a."endsAt" AS "auctionEndsAt",
            seller.name AS "sellerName",
            a."highestBid",
            MAX(b.amount)::int AS "userHighestBid",
            COUNT(b.id)::int AS "userBidCount",
            CASE
              WHEN a."status" = 'CLOSED'::"AuctionStatus" AND a."highestBid" = MAX(b.amount) THEN 'WON'
              WHEN a."status" = 'CLOSED'::"AuctionStatus" THEN 'LOST'
              WHEN a."highestBid" = MAX(b.amount) THEN 'LEADING'
              ELSE 'OUTBID'
            END AS "status"
          FROM "bids" b
          INNER JOIN "auctions" a ON a.id = b."auctionId"
          INNER JOIN "users" seller ON seller.id = a."sellerId"
          WHERE b."bidderId" = ${input.userId}::uuid
          GROUP BY a.id, seller.name
        )
        SELECT *
        FROM activity
        ${statusFilter}
        ORDER BY "auctionEndsAt" DESC
        LIMIT ${limit}
        OFFSET ${skip}
      `),
      prisma.$queryRaw<Array<{ total: bigint }>>(Prisma.sql`
        WITH activity AS (
          SELECT
            a.id AS "auctionId",
            CASE
              WHEN a."status" = 'CLOSED'::"AuctionStatus" AND a."highestBid" = MAX(b.amount) THEN 'WON'
              WHEN a."status" = 'CLOSED'::"AuctionStatus" THEN 'LOST'
              WHEN a."highestBid" = MAX(b.amount) THEN 'LEADING'
              ELSE 'OUTBID'
            END AS "status"
          FROM "bids" b
          INNER JOIN "auctions" a ON a.id = b."auctionId"
          WHERE b."bidderId" = ${input.userId}::uuid
          GROUP BY a.id
        )
        SELECT COUNT(*)::bigint AS "total"
        FROM activity
        ${statusFilter}
      `),
    ]);

    return {
      data: rows,
      total: Number(countRows[0]?.total ?? 0n),
    };
  }

  async close(auctionId: string, userId: string, isAdmin: boolean): Promise<CloseAuctionResult> {
    const auction = await prisma.auction.findUnique({ where: { id: auctionId } });

    if (!auction) {
      return "NOT_FOUND";
    }

    if (auction.status === "CLOSED") {
      return "ALREADY_CLOSED";
    }

    if (!isAdmin && auction.sellerId !== userId) {
      return "FORBIDDEN";
    }

    await prisma.auction.update({
      where: { id: auctionId },
      data: { status: "CLOSED", version: { increment: 1 } }
    });

    return "CLOSED";
  }

  async closeExpiredAuctions(now: Date): Promise<string[]> {
    const expiredAuctions = await prisma.auction.findMany({
      where: {
        status: "OPEN",
        endsAt: { lte: now }
      },
      select: {
        id: true
      }
    });

    if (expiredAuctions.length === 0) {
      return [];
    }

    const auctionIds = expiredAuctions.map((auction) => auction.id);

    const updates = await prisma.$transaction(
      auctionIds.map((auctionId) =>
        prisma.auction.updateMany({
          where: {
            id: auctionId,
            status: "OPEN"
          },
          data: {
            status: "CLOSED",
            version: { increment: 1 }
          }
        })
      )
    );

    const closedAuctionIds: string[] = [];

    updates.forEach((update, index) => {
      if (update.count > 0) {
        closedAuctionIds.push(auctionIds[index]!);
      }
    });

    return closedAuctionIds;
  }

  async placeBid(input: PlaceBidInput): Promise<PlaceBidResult> {
    return prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const auctions = await tx.$queryRaw<{
          id: string;
          title: string;
          description: string | null;
          startingPrice: number;
          highestBid: number;
          status: PrismaAuctionStatus;
          endsAt: Date;
          sellerId: string;
          version: number;
          rejectionReason: string | null;
          approvedById: string | null;
          approvedAt: Date | null;
          createdAt: Date;
          updatedAt: Date;
        }[]>`
          SELECT
            "id",
            "title",
            "description",
            "startingPrice",
            "highestBid",
            "status",
            "endsAt",
            "sellerId",
            "version",
            "rejectionReason",
            "approvedById",
            "approvedAt",
            "createdAt",
            "updatedAt"
          FROM "auctions"
          WHERE "id" = ${input.auctionId}::uuid
          FOR UPDATE
        `;

        const auction = auctions[0];

        if (!auction) {
          throw new AppError("Leilão não encontrado", 404);
        }

        if (auction.status !== "OPEN") {
          throw new AppError("Leilão não está aberto para lances", 400);
        }

        if (auction.endsAt.getTime() <= Date.now()) {
          throw new AppError("Leilão encerrado", 400);
        }

        if (input.amount <= auction.highestBid) {
          throw new AppError("Lance deve ser maior que o lance atual", 409);
        }
        if (input.bidderId === auction.sellerId) {
          throw new AppError("Vendedores não podem dar lances em seus próprios leilões", 403);
        }

        // Anti-sniping logic: extend auction if <= 30 seconds remaining
        const ANTI_SNIPING_THRESHOLD_MS = 30 * 1000; // 30 seconds
        const EXTENSION_DURATION_MS = 30 * 1000; // 30 seconds
        const now = Date.now();
        const timeRemaining = auction.endsAt.getTime() - now;
        const previousEndsAt = auction.endsAt;
        let wasExtended = false;
        let newEndsAt = auction.endsAt;

        if (timeRemaining <= ANTI_SNIPING_THRESHOLD_MS) {
          // Use Math.max to prevent race conditions when multiple bids arrive
          // in rapid succession - ensures time never exceeds 30 seconds
          newEndsAt = new Date(Math.max(
            auction.endsAt.getTime(),
            now + EXTENSION_DURATION_MS
          ));
          wasExtended = true;
        }

        const bid = await tx.bid.create({
          data: {
            auctionId: input.auctionId,
            bidderId: input.bidderId,
            amount: input.amount
          }
        });

        const updatedAuction = await tx.auction.update({
          where: { id: input.auctionId },
          data: {
            highestBid: input.amount,
            endsAt: newEndsAt,
            version: { increment: 1 }
          }
        });

        return {
          auction: mapAuction(updatedAuction),
          bid: mapBid(bid),
          wasExtended,
          previousEndsAt
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable
      }
    );
  }
}
