import { Prisma, type AuctionStatus as PrismaAuctionStatus } from "@prisma/client";

import { AppError } from "#application/errors/app-error";
import type { Auction } from "#domain/entities/auction";
import type { Bid } from "#domain/entities/bid";
import type {
  AuctionRepository,
  CloseAuctionResult,
  CreateAuctionInput,
  PlaceBidInput,
  PlaceBidResult
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

  async placeBid(input: PlaceBidInput): Promise<PlaceBidResult> {
    return prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const auctions = await tx.$queryRaw<Auction[]>`
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

        if (auction.status !== "OPEN" || auction.endsAt.getTime() <= Date.now()) {
          throw new AppError("Leilão não está aberto para lances", 409);
        }

        if (input.amount <= auction.highestBid) {
          throw new AppError("Lance deve ser maior que o lance atual", 409);
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
            version: { increment: 1 }
          }
        });

        return {
          auction: mapAuction(updatedAuction),
          bid: mapBid(bid)
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable
      }
    );
  }
}
