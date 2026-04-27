import type { AuctionDto } from "@auction/shared-types";
import { expect, test } from "@playwright/test";

const openAuction: AuctionDto = {
  approvedAt: "2026-01-01T00:00:00.000Z",
  approvedById: "admin-1",
  createdAt: "2026-01-01T00:00:00.000Z",
  description: "A working mechanical camera with original case.",
  endsAt: "2099-01-01T00:00:00.000Z",
  highestBid: 250,
  id: "auction-1",
  images: [
    {
      alt: "Vintage camera",
      id: "image-1",
      isPrimary: true,
      position: 0,
      thumbnailUrl: "https://example.com/camera-thumb.jpg",
      url: "https://example.com/camera.jpg",
    },
  ],
  rejectionReason: null,
  sellerId: "seller-1",
  startingPrice: 100,
  status: "OPEN",
  title: "Vintage Camera",
  updatedAt: "2026-01-01T00:00:00.000Z",
  version: 0,
};

test.beforeEach(async ({ page }) => {
  await page.route("**/socket.io/**", async (route) => {
    await route.abort();
  });

  await page.route(/\/api\/(?:auth|auctions)(?:\/|\?|$)/, async (route) => {
    const request = route.request();
    const { pathname } = new URL(request.url());

    if (request.method() === "GET" && pathname === "/api/auth/me") {
      await route.fulfill({
        contentType: "application/json",
        json: { message: "Unauthenticated" },
        status: 401,
      });
      return;
    }

    if (request.method() === "GET" && pathname === "/api/auctions") {
      await route.fulfill({
        contentType: "application/json",
        json: { data: [openAuction] },
        status: 200,
      });
      return;
    }

    if (request.method() === "GET" && pathname === "/api/auctions/auction-1") {
      await route.fulfill({
        contentType: "application/json",
        json: { data: openAuction },
        status: 200,
      });
      return;
    }

    await route.fulfill({
      contentType: "application/json",
      json: { message: `Unhandled test route: ${pathname}` },
      status: 404,
    });
  });
});

test("lists open auctions and navigates to the detail page", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Leilões abertos" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Todos os leilões" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Vintage Camera" })).toBeVisible();

  await page.getByRole("link", { name: "Ver detalhes" }).click();

  await expect(page).toHaveURL(/\/auctions\/auction-1$/);
  await expect(page.getByRole("heading", { name: "Vintage Camera" })).toBeVisible();
  await expect(page.getByText("Faça login para enviar lances")).toBeVisible();
});
