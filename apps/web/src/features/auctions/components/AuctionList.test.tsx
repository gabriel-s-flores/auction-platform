import type { AuctionDto } from "@auction/shared-types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PropsWithChildren } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { useAuth } from "@/shared/auth/auth-context";
import { ModalProvider } from "@/shared/modal";

import { useAuctions } from "../hooks/useAuctions";
import { useCountdownTicker } from "../hooks/useCountdownTicker";
import { AuctionList } from "./AuctionList";

vi.mock("../hooks/useAuctions", () => ({
  useAuctions: vi.fn(),
}));

vi.mock("../hooks/useCountdownTicker", () => ({
  useCountdownTicker: vi.fn(),
}));

vi.mock("@/shared/auth/auth-context", () => ({
  useAuth: vi.fn(),
}));

const mockedUseAuctions = vi.mocked(useAuctions);
const mockedUseAuth = vi.mocked(useAuth);
const mockedUseCountdownTicker = vi.mocked(useCountdownTicker);

function makeAuction(overrides: Partial<AuctionDto> = {}): AuctionDto {
  return {
    approvedAt: "2026-01-01T00:00:00.000Z",
    approvedById: "admin-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    description: "Mechanical chronograph",
    endsAt: "2099-01-01T00:00:00.000Z",
    highestBid: 150,
    id: "auction-1",
    images: [],
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

function TestWrapper({ children }: PropsWithChildren) {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });

  return (
    <MemoryRouter initialEntries={["/auctions"]}>
      <QueryClientProvider client={queryClient}>
        <ModalProvider>{children}</ModalProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

function renderAuctionList() {
  render(<AuctionList />, { wrapper: TestWrapper });
}

describe("AuctionList quick bid flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuctions.mockReturnValue({
      data: [makeAuction()],
      isError: false,
      isLoading: false,
    } as ReturnType<typeof useAuctions>);
    mockedUseCountdownTicker.mockReturnValue(Date.parse("2026-01-01T00:00:00.000Z"));
  });

  test("opens the quick bid modal from an authenticated auction card click", async () => {
    const user = userEvent.setup();
    mockedUseAuth.mockReturnValue({
      checkAuth: vi.fn().mockResolvedValue(undefined),
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn().mockResolvedValue(undefined),
      user: {
        email: "buyer@example.com",
        id: "buyer-1",
        role: "USER",
      },
    });

    renderAuctionList();

    await user.click(screen.getByRole("button", { name: "Dar lance" }));

    expect(screen.getByRole("dialog", { name: "Confirmar lance" })).toBeInTheDocument();
    expect(screen.getByLabelText("Valor do lance")).toHaveValue(151);
  });

  test("shows a login prompt for unauthenticated bid intent", async () => {
    const user = userEvent.setup();
    mockedUseAuth.mockReturnValue({
      checkAuth: vi.fn().mockResolvedValue(undefined),
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn().mockResolvedValue(undefined),
      user: null,
    });

    renderAuctionList();

    await user.click(screen.getByRole("button", { name: "Dar lance" }));

    expect(await screen.findByText("Entrar para dar lance")).toBeInTheDocument();
    expect(
      screen.getByText("Faça login para enviar lances e participar deste leilão."),
    ).toBeInTheDocument();
  });
});
