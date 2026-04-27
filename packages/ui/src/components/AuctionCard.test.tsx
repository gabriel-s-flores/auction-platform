import type { AuctionDto } from "@auction/shared-types";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { LinkProps } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";

import { AuctionCard } from "./AuctionCard";

function toHref(to: LinkProps["to"]): string {
  if (typeof to === "string") {
    return to;
  }

  return to.pathname ?? "/";
}

function TestLink({ children, className, to }: LinkProps) {
  return (
    <a className={className} href={toHref(to)}>
      {children}
    </a>
  );
}

function makeAuction(overrides: Partial<AuctionDto> = {}): AuctionDto {
  return {
    approvedAt: "2026-01-01T00:00:00.000Z",
    approvedById: "admin-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    description: "Mechanical chronograph",
    endsAt: "2099-01-01T00:00:00.000Z",
    highestBid: 150,
    id: "auction-1",
    images: [
      {
        alt: "Vintage watch",
        id: "image-1",
        isPrimary: true,
        position: 0,
        thumbnailUrl: "https://res.cloudinary.com/demo/image/upload/v1/watch.jpg",
        url: "https://res.cloudinary.com/demo/image/upload/v1/watch.jpg",
      },
    ],
    rejectionReason: null,
    sellerId: "seller-1",
    startingPrice: 100,
    status: "OPEN",
    title: "Vintage Watch",
    updatedAt: "2026-01-01T00:00:00.000Z",
    version: 0,
    ...overrides,
  };
}

const openTimeRemaining = {
  displayText: "10 dias",
  formattedTime: "10d 00h",
  isCritical: false,
  isExpired: false,
  isWarning: false,
};

describe("AuctionCard", () => {
  test("renders auction summary and bid action for open auctions", async () => {
    const user = userEvent.setup();
    const onPlaceBid = vi.fn();

    render(
      <AuctionCard
        auction={makeAuction()}
        linkComponent={TestLink}
        onPlaceBid={onPlaceBid}
        timeRemaining={openTimeRemaining}
      />
    );

    expect(screen.getByRole("heading", { name: "Vintage Watch" })).toBeInTheDocument();
    expect(screen.getByText("Aberto")).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*150/)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Vintage Watch" })).toHaveAttribute(
      "src",
      expect.stringContaining("w_400,h_400")
    );
    expect(screen.getByRole("link", { name: "Ver detalhes" })).toHaveAttribute(
      "href",
      "/auctions/auction-1"
    );

    await user.click(screen.getByRole("button", { name: "Dar lance" }));

    expect(onPlaceBid).toHaveBeenCalledWith("auction-1");
  });

  test("disables bidding for expired or closed auctions", async () => {
    const user = userEvent.setup();
    const onPlaceBid = vi.fn();

    render(
      <AuctionCard
        auction={makeAuction({ status: "CLOSED" })}
        linkComponent={TestLink}
        onPlaceBid={onPlaceBid}
        timeRemaining={{
          ...openTimeRemaining,
          displayText: "Encerrado",
          formattedTime: "00:00",
          isExpired: true,
        }}
      />
    );

    const bidButton = screen.getByRole("button", { name: "Dar lance" });

    expect(screen.getByText("Encerrado")).toBeInTheDocument();
    expect(bidButton).toBeDisabled();

    await user.click(bidButton);

    expect(onPlaceBid).not.toHaveBeenCalled();
  });
});
