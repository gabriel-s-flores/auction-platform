import { readdir, readFile } from "node:fs/promises";

import { describe, expect, test } from "bun:test";

const migrationsUrl = new URL("../../../prisma/migrations/", import.meta.url);
const schemaUrl = new URL("../../../prisma/schema.prisma", import.meta.url);
const seedUrl = new URL("../../../prisma/seed.ts", import.meta.url);

describe("prisma artifacts", () => {
  test("keeps the schema models required by the integration suite", async () => {
    const schema = await readFile(schemaUrl, "utf8");

    for (const model of [
      "model ActivityLog",
      "model Auction",
      "model Bid",
      "model Image",
      "model PendingAuctionEdit",
      "model User",
    ]) {
      expect(schema).toContain(model);
    }

    expect(schema).toContain("enum AuctionStatus");
    expect(schema).toContain("enum UserRole");
  });

  test("keeps timestamped migration folders with SQL files", async () => {
    const migrationDirs = (await readdir(migrationsUrl, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort((left, right) => left.localeCompare(right));

    expect(migrationDirs.length).toBeGreaterThanOrEqual(3);
    expect(migrationDirs.every((dirName) => /^\d{14}_[a-z0-9_]+$/.test(dirName))).toBe(true);

    const migrationSql = await Promise.all(
      migrationDirs.map((migrationDir) =>
        readFile(new URL(`${migrationDir}/migration.sql`, migrationsUrl), "utf8")
      )
    );
    const combinedSql = migrationSql.join("\n");

    expect(combinedSql).toContain("CREATE TABLE");
    expect(combinedSql).toContain('"auctions"');
    expect(combinedSql).toContain('"images"');
  });

  test("keeps seed data for baseline auth roles", async () => {
    const seed = await readFile(seedUrl, "utf8");

    expect(seed).toContain("superadmin@auction.local");
    expect(seed).toContain("admin@auction.local");
    expect(seed).toContain("user@auction.local");
    expect(seed).toContain('role: "SUPER_ADMIN"');
    expect(seed).toContain('role: "ADMIN"');
    expect(seed).toContain('role: "USER"');
  });
});
