import type { AuctionDto } from "@auction/shared-types";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { MemoryRouter } from "react-router-dom";
import { expect, fn, spyOn, userEvent, within } from "storybook/test";

import * as authContext from "@/shared/auth/auth-context";
import { ModalProvider } from "@/shared/modal";

import * as auctionsHooks from "../hooks/useAuctions";
import * as countdownTickerHook from "../hooks/useCountdownTicker";
import { AuctionList } from "./AuctionList";

const useAuctionsSpy = spyOn(auctionsHooks, "useAuctions");
const useAuthSpy = spyOn(authContext, "useAuth");
const useCountdownTickerSpy = spyOn(countdownTickerHook, "useCountdownTicker");

function makeAuction(overrides: Partial<AuctionDto> = {}): AuctionDto {
  return {
    approvedAt: "2026-05-01T00:00:00.000Z",
    approvedById: "admin-1",
    createdAt: "2026-05-01T00:00:00.000Z",
    description: "Item revisado com certificado de autenticidade.",
    endsAt: "2026-05-03T13:00:00.000Z",
    highestBid: 1500,
    id: "auction-1",
    images: [],
    rejectionReason: null,
    sellerId: "seller-1",
    startingPrice: 1200,
    status: "OPEN",
    title: "Relogio vintage",
    updatedAt: "2026-05-01T00:00:00.000Z",
    version: 1,
    ...overrides,
  };
}

function StoryProviders({ children }: PropsWithChildren) {
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

type AuctionListStoryArgs = {
  auctions: AuctionDto[];
  isAuthenticated: boolean;
  isError: boolean;
  isLoading: boolean;
};

function AuctionListStory({
  auctions,
  isAuthenticated,
  isError,
  isLoading,
}: AuctionListStoryArgs) {
  useAuctionsSpy.mockReturnValue({ data: auctions, isError, isLoading } as ReturnType<
    typeof auctionsHooks.useAuctions
  >);
  useAuthSpy.mockReturnValue({
    checkAuth: fn(),
    isAuthenticated,
    login: fn(),
    logout: fn(),
    user: isAuthenticated ? { email: "buyer@example.com", id: "buyer-1", role: "USER" } : null,
  });
  useCountdownTickerSpy.mockReturnValue(Date.parse("2026-05-03T12:00:00.000Z"));

  return (
    <StoryProviders>
      <div className="min-h-screen bg-stone-50 p-6">
        <AuctionList />
      </div>
    </StoryProviders>
  );
}

const meta = {
  title: "Web/Auctions/AuctionList",
  component: AuctionList,
  tags: ["autodocs"],
  args: {
    auctions: [makeAuction(), makeAuction({ id: "auction-2", title: "Camera analogica" })],
    isAuthenticated: true,
    isError: false,
    isLoading: false,
  },
  argTypes: {
    auctions: { control: false },
  },
  render: (args) => <AuctionListStory {...args} />,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<AuctionListStoryArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EndingSoon: Story = {
  args: {
    auctions: [makeAuction({ endsAt: "2026-05-03T12:03:00.000Z" })],
  },
};

export const Empty: Story = {
  args: {
    auctions: [],
  },
};

export const Loading: Story = {
  args: {
    auctions: [],
    isLoading: true,
  },
};

export const ErrorState: Story = {
  args: {
    auctions: [],
    isError: true,
  },
};

export const UnauthenticatedBidPrompt: Story = {
  args: {
    isAuthenticated: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [firstBidButton] = canvas.getAllByRole("button", { name: "Dar lance" });
    if (!firstBidButton) {
      throw new Error("Bid button not found in AuctionList story.");
    }
    await userEvent.click(firstBidButton);
    await expect(canvas.getByText("Entrar para dar lance")).toBeInTheDocument();
  },
};
