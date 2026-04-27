import { describe, expect, test } from "bun:test";

import { AppError } from "#application/errors/app-error";
import { CloseAuctionUseCase } from "#application/use-cases/close-auction.use-case";
import { CreateAuctionUseCase } from "#application/use-cases/create-auction.use-case";
import { PlaceBidUseCase } from "#application/use-cases/place-bid.use-case";
import type { Auction } from "#domain/entities/auction";
import type { Bid } from "#domain/entities/bid";
import type {
  AuctionRepository,
  CloseAuctionResult,
  CreateAuctionInput,
  PlaceBidInput,
  PlaceBidResult,
  UserAuctionListItem,
  UserBidActivitySummary,
  UserDashboardSummary,
  UserWinSummary,
} from "#domain/repositories/auction-repository";

function makeAuction(overrides: Partial<Auction> = {}): Auction {
  const now = new Date("2026-01-01T00:00:00.000Z");

  return {
    id: "auction-1",
    title: "Vintage Camera",
    description: "A nice camera",
    startingPrice: 100,
    highestBid: 100,
    status: "PENDING_APPROVAL",
    endsAt: new Date("2026-02-01T00:00:00.000Z"),
    version: 0,
    rejectionReason: null,
    approvedById: null,
    approvedAt: null,
    sellerId: "seller-1",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function makeBid(overrides: Partial<Bid> = {}): Bid {
  return {
    id: "bid-1",
    auctionId: "auction-1",
    bidderId: "bidder-1",
    amount: 150,
    createdAt: new Date("2026-01-02T00:00:00.000Z"),
    ...overrides,
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

class FakeAuctionRepository implements AuctionRepository {
  closeInput: { auctionId: string; userId: string; isAdmin: boolean } | null = null;
  closeResult: CloseAuctionResult = "CLOSED";
  createdInput: CreateAuctionInput | null = null;
  placeBidInput: PlaceBidInput | null = null;
  placeBidResult: PlaceBidResult = {
    auction: makeAuction({ endsAt: new Date("2026-02-01T00:00:30.000Z") }),
    bid: makeBid(),
    wasExtended: true,
    previousEndsAt: new Date("2026-02-01T00:00:00.000Z"),
  };

  async listOpenAuctions(): Promise<Auction[]> {
    return notImplemented();
  }

  async findById(): Promise<Auction | null> {
    return notImplemented();
  }

  async create(input: CreateAuctionInput): Promise<Auction> {
    this.createdInput = input;

    return makeAuction({
      title: input.title,
      description: input.description,
      startingPrice: input.startingPrice,
      highestBid: input.startingPrice,
      endsAt: input.endsAt,
      sellerId: input.sellerId,
    });
  }

  async getUserDashboardSummary(): Promise<UserDashboardSummary> {
    return notImplemented();
  }

  async listBySeller(): Promise<{ data: UserAuctionListItem[]; total: number }> {
    return notImplemented();
  }

  async listWinsByBidder(): Promise<{ data: UserWinSummary[]; total: number }> {
    return notImplemented();
  }

  async listBidActivityByUser(): Promise<{ data: UserBidActivitySummary[]; total: number }> {
    return notImplemented();
  }

  async close(auctionId: string, userId: string, isAdmin: boolean): Promise<CloseAuctionResult> {
    this.closeInput = { auctionId, userId, isAdmin };

    return this.closeResult;
  }

  async closeExpiredAuctions(): Promise<string[]> {
    return notImplemented();
  }

  async placeBid(input: PlaceBidInput): Promise<PlaceBidResult> {
    this.placeBidInput = input;

    return this.placeBidResult;
  }
}

describe("CreateAuctionUseCase", () => {
  test("creates an auction when the price is positive and the end date is in the future", async () => {
    const repository = new FakeAuctionRepository();
    const useCase = new CreateAuctionUseCase(repository);
    const endsAt = new Date(Date.now() + 60_000);

    const auction = await useCase.execute({
      title: "Vintage Camera",
      description: "A nice camera",
      startingPrice: 100,
      endsAt,
      sellerId: "seller-1",
    });

    expect(repository.createdInput).toEqual({
      title: "Vintage Camera",
      description: "A nice camera",
      startingPrice: 100,
      endsAt,
      sellerId: "seller-1",
    });
    expect(auction.highestBid).toBe(100);
  });

  test("rejects non-positive starting prices", async () => {
    const useCase = new CreateAuctionUseCase(new FakeAuctionRepository());

    await expectAppError(
      () =>
        useCase.execute({
          title: "Vintage Camera",
          description: null,
          startingPrice: 0,
          endsAt: new Date(Date.now() + 60_000),
          sellerId: "seller-1",
        }),
      400,
      "Preço inicial deve ser maior que zero"
    );
  });

  test("rejects auctions that end in the past", async () => {
    const useCase = new CreateAuctionUseCase(new FakeAuctionRepository());

    await expectAppError(
      () =>
        useCase.execute({
          title: "Vintage Camera",
          description: null,
          startingPrice: 100,
          endsAt: new Date(Date.now() - 60_000),
          sellerId: "seller-1",
        }),
      400,
      "Data de encerramento deve estar no futuro"
    );
  });
});

describe("CloseAuctionUseCase", () => {
  test("delegates the close operation with the current actor and role", async () => {
    const repository = new FakeAuctionRepository();
    const useCase = new CloseAuctionUseCase(repository);

    await useCase.execute({
      auctionId: "auction-1",
      userId: "admin-1",
      isAdmin: true,
    });

    expect(repository.closeInput).toEqual({
      auctionId: "auction-1",
      userId: "admin-1",
      isAdmin: true,
    });
  });

  test("maps repository close failures to application errors", async () => {
    const cases: Array<{
      result: CloseAuctionResult;
      statusCode: number;
      message: string;
    }> = [
      { result: "NOT_FOUND", statusCode: 404, message: "Leilão não encontrado" },
      { result: "FORBIDDEN", statusCode: 403, message: "Sem permissão para encerrar este leilão" },
      { result: "ALREADY_CLOSED", statusCode: 409, message: "Leilão já está encerrado" },
    ];

    for (const item of cases) {
      const repository = new FakeAuctionRepository();
      repository.closeResult = item.result;
      const useCase = new CloseAuctionUseCase(repository);

      await expectAppError(
        () =>
          useCase.execute({
            auctionId: "auction-1",
            userId: "user-1",
            isAdmin: false,
          }),
        item.statusCode,
        item.message
      );
    }
  });
});

describe("PlaceBidUseCase", () => {
  test("rejects non-positive bid amounts before reaching the repository", async () => {
    const repository = new FakeAuctionRepository();
    const useCase = new PlaceBidUseCase(repository);

    await expectAppError(
      () =>
        useCase.execute({
          auctionId: "auction-1",
          bidderId: "bidder-1",
          amount: 0,
        }),
      400,
      "Lance deve ser maior que zero"
    );

    expect(repository.placeBidInput).toBeNull();
  });

  test("returns bid details and exposes anti-sniping extension metadata", async () => {
    const repository = new FakeAuctionRepository();
    const useCase = new PlaceBidUseCase(repository);

    const result = await useCase.execute({
      auctionId: "auction-1",
      bidderId: "bidder-1",
      amount: 150,
    });

    expect(repository.placeBidInput).toEqual({
      auctionId: "auction-1",
      bidderId: "bidder-1",
      amount: 150,
    });
    expect(result.bid).toEqual(repository.placeBidResult.bid);
    expect(result.wasExtended).toBe(true);
    expect(result.newEndsAt).toEqual(repository.placeBidResult.auction.endsAt);
  });
});
