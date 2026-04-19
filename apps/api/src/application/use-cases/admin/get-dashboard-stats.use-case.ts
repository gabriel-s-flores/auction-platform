import { prisma } from "#infrastructure/database/prisma-client";

export interface DashboardStatsOutput {
  totalAuctions: number;
  pendingAuctions: number;
  activeAuctions: number;
  totalBidsToday: number;
  newUsersToday: number;
  totalUsers: number;
}

function getStartOfToday() {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export class GetDashboardStatsUseCase {
  async execute(): Promise<DashboardStatsOutput> {
    const startOfToday = getStartOfToday();
    const now = new Date();

    const [
      totalAuctions,
      pendingAuctions,
      activeAuctions,
      totalBidsToday,
      newUsersToday,
      totalUsers,
    ] = await Promise.all([
      prisma.auction.count(),
      prisma.auction.count({ where: { status: "PENDING_APPROVAL" } }),
      prisma.auction.count({
        where: {
          status: "OPEN",
          endsAt: { gt: now },
        },
      }),
      prisma.bid.count({
        where: {
          createdAt: { gte: startOfToday },
        },
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: startOfToday },
        },
      }),
      prisma.user.count(),
    ]);

    return {
      totalAuctions,
      pendingAuctions,
      activeAuctions,
      totalBidsToday,
      newUsersToday,
      totalUsers,
    };
  }
}