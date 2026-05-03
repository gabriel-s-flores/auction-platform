import type { AuctionDto } from "@auction/shared-types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { auctionsService } from "@/features/auctions/services/auctions.service";

import { QuickBidModal } from "./QuickBidModal";

vi.mock("@/features/auctions/services/auctions.service", () => ({
  auctionsService: {
    placeBid: vi.fn(),
  },
}));

const mockedAuctionsService = vi.mocked(auctionsService);

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
        thumbnailUrl: "https://example.com/watch-thumb.jpg",
        url: "https://example.com/watch.jpg",
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

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function renderQuickBidModal(options?: {
  auction?: AuctionDto;
  isOwner?: boolean;
  onClose?: () => void;
  onViewDetails?: () => void;
}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });

  render(
    <QuickBidModal
      auction={options?.auction ?? makeAuction()}
      isOpen
      isOwner={options?.isOwner ?? false}
      onClose={options?.onClose ?? vi.fn()}
      onViewDetails={options?.onViewDetails ?? vi.fn()}
    />,
    { wrapper: createWrapper(queryClient) },
  );
}

describe("QuickBidModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("submits the minimum bid and shows success feedback", async () => {
    const user = userEvent.setup();
    mockedAuctionsService.placeBid.mockResolvedValue({
      bid: {
        amount: 151,
        auctionId: "auction-1",
        bidderId: "buyer-1",
        createdAt: "2026-01-01T00:00:00.000Z",
        id: "bid-1",
      },
    });

    renderQuickBidModal();

    expect(screen.getByRole("dialog", { name: "Confirmar lance" })).toBeInTheDocument();
    expect(screen.getByLabelText("Valor do lance")).toHaveValue(151);

    await user.click(screen.getByRole("button", { name: "Confirmar lance" }));

    await waitFor(() => {
      expect(mockedAuctionsService.placeBid).toHaveBeenCalledWith("auction-1", {
        amount: 151,
      });
    });
    expect(screen.getByText(/Lance de .*151.* enviado com sucesso/)).toBeInTheDocument();
    expect(screen.getByLabelText("Valor do lance")).toHaveValue(152);
  });

  test("blocks values below the current minimum before calling the API", async () => {
    const user = userEvent.setup();

    renderQuickBidModal();

    const amountInput = screen.getByLabelText("Valor do lance");
    await user.clear(amountInput);
    await user.type(amountInput, "150");
    await user.click(screen.getByRole("button", { name: "Confirmar lance" }));

    expect(screen.getByText(/Informe um lance de pelo menos/)).toBeInTheDocument();
    expect(mockedAuctionsService.placeBid).not.toHaveBeenCalled();
  });

  test("disables bidding when the viewer owns the auction", () => {
    renderQuickBidModal({ isOwner: true });

    expect(
      screen.getByText("Vendedores não podem dar lances em seus próprios leilões."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmar lance" })).toBeDisabled();
    expect(screen.getByLabelText("Valor do lance")).toBeDisabled();
  });
});
