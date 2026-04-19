import { Prisma } from "@prisma/client";

import type { EditStatus, EditType, PendingAuctionEdit } from "#domain/entities/pending-auction-edit";
import type {
  CreatePendingEditInput,
  ListPendingEditsInput,
  PendingEditRepository,
  PendingEditSummary,
} from "#domain/repositories/pending-edit-repository";
import { prisma } from "#infrastructure/database/prisma-client";

function mapPendingEdit(model: {
 id: string;
 auctionId: string;
 editType: string;
 oldValue: Prisma.JsonValue | null;
 newValue: Prisma.JsonValue;
 status: string;
 rejectionReason: string | null;
 submittedById: string;
 reviewedById: string | null;
 reviewedAt: Date | null;
 createdAt: Date;
}): PendingAuctionEdit {
 return {
 id: model.id,
 auctionId: model.auctionId,
 editType: model.editType as EditType,
 oldValue: model.oldValue as Record<string, unknown> | null,
 newValue: model.newValue as Record<string, unknown>,
 status: model.status as EditStatus,
 rejectionReason: model.rejectionReason,
 submittedById: model.submittedById,
 reviewedById: model.reviewedById,
 reviewedAt: model.reviewedAt,
 createdAt: model.createdAt
 };
}

function mapPendingEditSummary(model: {
  id: string;
  auctionId: string;
  editType: string;
  oldValue: Prisma.JsonValue | null;
  newValue: Prisma.JsonValue;
  status: string;
  rejectionReason: string | null;
  submittedById: string;
  reviewedById: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  auction: { title: string };
  submittedBy: { name: string; email: string };
}): PendingEditSummary {
  return {
    ...mapPendingEdit(model),
    auctionTitle: model.auction.title,
    submittedByEmail: model.submittedBy.email,
    submittedByName: model.submittedBy.name,
  };
}

export class PrismaPendingEditRepository implements PendingEditRepository {
 async create(input: CreatePendingEditInput): Promise<PendingAuctionEdit> {
 const edit = await prisma.pendingAuctionEdit.create({
 data: {
 auctionId: input.auctionId,
 editType: input.editType,
 oldValue: input.oldValue ? (input.oldValue as Prisma.InputJsonValue) : Prisma.JsonNull,
 newValue: input.newValue as Prisma.InputJsonValue,
 submittedById: input.submittedById
 }
 });
 return mapPendingEdit(edit);
 }

 async findById(id: string): Promise<PendingAuctionEdit | null> {
 const edit = await prisma.pendingAuctionEdit.findUnique({ where: { id } });
 return edit ? mapPendingEdit(edit) : null;
 }

  async list(input: ListPendingEditsInput): Promise<{ data: PendingEditSummary[]; total: number }> {
 const page = input.page ?? 1;
 const limit = input.limit ?? 20;
 const skip = (page - 1) * limit;

 const where: Prisma.PendingAuctionEditWhereInput = {};
 if (input.status) where.status = input.status;
 if (input.auctionId) where.auctionId = input.auctionId;

 const [edits, total] = await Promise.all([
 prisma.pendingAuctionEdit.findMany({
 where,
 skip,
 take: limit,
 orderBy: { createdAt: "desc" },
 include: { auction: true, submittedBy: true }
 }),
 prisma.pendingAuctionEdit.count({ where })
 ]);

 return {
  data: edits.map(mapPendingEditSummary),
 total
 };
 }

 async approve(id: string, reviewedBy: string): Promise<PendingAuctionEdit> {
 const edit = await prisma.pendingAuctionEdit.update({
 where: { id },
 data: {
 status: "APPROVED",
 reviewedById: reviewedBy,
 reviewedAt: new Date()
 }
 });
 return mapPendingEdit(edit);
 }

 async reject(id: string, reviewedBy: string, reason: string): Promise<PendingAuctionEdit> {
 const edit = await prisma.pendingAuctionEdit.update({
 where: { id },
 data: {
 status: "REJECTED",
 reviewedById: reviewedBy,
 reviewedAt: new Date(),
 rejectionReason: reason
 }
 });
 return mapPendingEdit(edit);
 }
}
