import { describe, expect, test } from "bun:test";

import { AppError } from "#application/errors/app-error";
import { AuditService } from "#application/services/audit-service";
import { SubmitAuctionEditUseCase } from "#application/use-cases/submit-auction-edit.use-case";
import type { ActivityLog } from "#domain/entities/activity-log";
import type { Auction } from "#domain/entities/auction";
import type { PendingAuctionEdit } from "#domain/entities/pending-auction-edit";
import type {
  ActivityLogRepository,
  CreateActivityLogInput,
} from "#domain/repositories/activity-log-repository";
import type {
  AuctionRepository,
  CloseAuctionResult,
  PlaceBidResult,
  UserAuctionListItem,
  UserBidActivitySummary,
  UserDashboardSummary,
  UserWinSummary,
} from "#domain/repositories/auction-repository";
import type {
  CreatePendingEditInput,
  PendingEditRepository,
  PendingEditSummary,
  UserPendingEditSummary,
} from "#domain/repositories/pending-edit-repository";

function makeAuction(overrides: Partial<Auction> = {}): Auction {
  const now = new Date("2026-01-01T00:00:00.000Z");

  return {
    id: "auction-1",
    title: "Current title",
    description: "Current description",
    startingPrice: 100,
    highestBid: 100,
    status: "OPEN",
    endsAt: new Date("2026-02-01T00:00:00.000Z"),
    version: 1,
    rejectionReason: null,
    approvedById: "admin-1",
    approvedAt: now,
    sellerId: "seller-1",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function makePendingEdit(overrides: Partial<PendingAuctionEdit> = {}): PendingAuctionEdit {
  return {
    id: "edit-1",
    auctionId: "auction-1",
    editType: "TITLE",
    oldValue: { title: "Current title" },
    newValue: { title: "New title" },
    status: "PENDING_APPROVAL",
    rejectionReason: null,
    submittedById: "seller-1",
    reviewedById: null,
    reviewedAt: null,
    createdAt: new Date("2026-01-02T00:00:00.000Z"),
    ...overrides,
  };
}

function makePendingEditSummary(overrides: Partial<PendingEditSummary> = {}): PendingEditSummary {
  return {
    ...makePendingEdit(overrides),
    auctionTitle: "Current title",
    submittedByName: "Seller",
    submittedByEmail: "seller@example.com",
    ...overrides,
  };
}

function makeActivityLog(input: CreateActivityLogInput): ActivityLog {
  return {
    id: "activity-1",
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    actorId: input.actorId ?? null,
    actorName: null,
    actorEmail: null,
    metadata: input.metadata ?? null,
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
    createdAt: new Date("2026-01-03T00:00:00.000Z"),
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
  auction: Auction | null = makeAuction();

  async listOpenAuctions(): Promise<Auction[]> {
    return notImplemented();
  }

  async findById(): Promise<Auction | null> {
    return this.auction;
  }

  async create(): Promise<Auction> {
    return notImplemented();
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

  async close(): Promise<CloseAuctionResult> {
    return notImplemented();
  }

  async closeExpiredAuctions(): Promise<string[]> {
    return notImplemented();
  }

  async placeBid(): Promise<PlaceBidResult> {
    return notImplemented();
  }
}

class FakePendingEditRepository implements PendingEditRepository {
  createdInput: CreatePendingEditInput | null = null;
  pendingEdits: PendingEditSummary[] = [];

  async create(input: CreatePendingEditInput): Promise<PendingAuctionEdit> {
    this.createdInput = input;

    return makePendingEdit({
      auctionId: input.auctionId,
      editType: input.editType,
      oldValue: input.oldValue,
      newValue: input.newValue,
      submittedById: input.submittedById,
    });
  }

  async findById(): Promise<PendingAuctionEdit | null> {
    return notImplemented();
  }

  async list(): Promise<{ data: PendingEditSummary[]; total: number }> {
    return {
      data: this.pendingEdits,
      total: this.pendingEdits.length,
    };
  }

  async listBySubmittedBy(): Promise<{ data: UserPendingEditSummary[]; total: number }> {
    return notImplemented();
  }

  async approve(): Promise<PendingAuctionEdit> {
    return notImplemented();
  }

  async reject(): Promise<PendingAuctionEdit> {
    return notImplemented();
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

function makeUseCase() {
  const auctionRepository = new FakeAuctionRepository();
  const pendingEditRepository = new FakePendingEditRepository();
  const activityLogRepository = new FakeActivityLogRepository();
  const auditService = new AuditService(activityLogRepository);
  const useCase = new SubmitAuctionEditUseCase(
    auctionRepository,
    pendingEditRepository,
    auditService
  );

  return {
    activityLogRepository,
    auctionRepository,
    pendingEditRepository,
    useCase,
  };
}

describe("SubmitAuctionEditUseCase", () => {
  test("creates a trimmed title edit and writes an audit log", async () => {
    const { activityLogRepository, pendingEditRepository, useCase } = makeUseCase();

    const result = await useCase.execute({
      auctionId: "auction-1",
      submittedById: "seller-1",
      editType: "TITLE",
      title: "  New title  ",
      ipAddress: "127.0.0.1",
      userAgent: "bun-test",
    });

    expect(result).toEqual({
      id: "edit-1",
      auctionId: "auction-1",
      editType: "TITLE",
      status: "PENDING_APPROVAL",
      createdAt: "2026-01-02T00:00:00.000Z",
    });
    expect(pendingEditRepository.createdInput).toEqual({
      auctionId: "auction-1",
      editType: "TITLE",
      oldValue: { title: "Current title" },
      newValue: { title: "New title" },
      submittedById: "seller-1",
    });
    expect(activityLogRepository.createdInputs).toEqual([
      {
        action: "EDIT_SUBMITTED",
        entityType: "pending_edit",
        entityId: "edit-1",
        metadata: {
          auctionId: "auction-1",
          editType: "TITLE",
        },
        actorId: "seller-1",
        ipAddress: "127.0.0.1",
        userAgent: "bun-test",
      },
    ]);
  });

  test("normalizes empty descriptions to null before creating the edit", async () => {
    const { pendingEditRepository, useCase } = makeUseCase();

    await useCase.execute({
      auctionId: "auction-1",
      submittedById: "seller-1",
      editType: "DESCRIPTION",
      description: "   ",
    });

    expect(pendingEditRepository.createdInput?.oldValue).toEqual({
      description: "Current description",
    });
    expect(pendingEditRepository.createdInput?.newValue).toEqual({
      description: null,
    });
  });

  test("rejects edits from users that do not own the auction", async () => {
    const { useCase } = makeUseCase();

    await expectAppError(
      () =>
        useCase.execute({
          auctionId: "auction-1",
          submittedById: "other-user",
          editType: "TITLE",
          title: "New title",
        }),
      403,
      "Você não tem permissão para editar este leilão"
    );
  });

  test("rejects duplicate pending edits of the same type", async () => {
    const { pendingEditRepository, useCase } = makeUseCase();
    pendingEditRepository.pendingEdits = [
      makePendingEditSummary({
        editType: "TITLE",
      }),
    ];

    await expectAppError(
      () =>
        useCase.execute({
          auctionId: "auction-1",
          submittedById: "seller-1",
          editType: "TITLE",
          title: "Another title",
        }),
      409,
      "Já existe uma edição pendente deste tipo para este leilão"
    );
  });

  test("rejects unchanged titles", async () => {
    const { useCase } = makeUseCase();

    await expectAppError(
      () =>
        useCase.execute({
          auctionId: "auction-1",
          submittedById: "seller-1",
          editType: "TITLE",
          title: "Current title",
        }),
      400,
      "O novo título deve ser diferente do atual"
    );
  });
});
