import type { AuctionDto } from "@auction/shared-types";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { QuickBidModal } from "./QuickBidModal";

const auctionImage =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 960" role="img" aria-label="Relogio de colecao">
      <defs>
        <linearGradient id="bg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#78350f" />
        </linearGradient>
      </defs>
      <rect width="960" height="960" fill="url(#bg)" />
      <circle cx="480" cy="480" r="250" fill="#f8fafc" opacity="0.95" />
      <circle cx="480" cy="480" r="205" fill="#111827" />
      <circle cx="480" cy="480" r="180" fill="#f59e0b" opacity="0.16" />
      <line x1="480" y1="480" x2="480" y2="330" stroke="#f8fafc" stroke-width="20" stroke-linecap="round" />
      <line x1="480" y1="480" x2="610" y2="560" stroke="#f8fafc" stroke-width="16" stroke-linecap="round" />
      <circle cx="480" cy="480" r="24" fill="#f59e0b" />
      <rect x="410" y="92" width="140" height="170" rx="42" fill="#f8fafc" opacity="0.9" />
      <rect x="410" y="698" width="140" height="170" rx="42" fill="#f8fafc" opacity="0.9" />
    </svg>
  `);

const baseAuction: AuctionDto = {
  approvedAt: "2026-04-18T20:00:00.000Z",
  approvedById: "admin-1",
  createdAt: "2026-04-15T12:00:00.000Z",
  description: "Peca revisada, com caixa original e certificado de autenticidade.",
  endsAt: "2099-12-31T23:59:59.000Z",
  highestBid: 4200,
  id: "auction-story",
  images: [
    {
      alt: "Relogio de colecao",
      id: "image-story",
      isPrimary: true,
      position: 0,
      thumbnailUrl: auctionImage,
      url: auctionImage,
    },
  ],
  rejectionReason: null,
  sellerId: "seller-1",
  startingPrice: 3500,
  status: "OPEN",
  title: "Relogio mecanico vintage",
  updatedAt: "2026-04-19T20:00:00.000Z",
  version: 3,
};

function createAuction(overrides: Partial<AuctionDto> = {}): AuctionDto {
  return {
    ...baseAuction,
    ...overrides,
  };
}

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function createBidConflictError() {
  return {
    isAxiosError: true,
    response: {
      data: {
        error: "Lance deve ser maior que o lance atual",
      },
      status: 409,
    },
  };
}

type QuickBidStoryProps = {
  auction: AuctionDto;
  isOwner?: boolean;
  submitMode?: "success" | "conflict" | "network-error";
};

function QuickBidStory({ auction, isOwner = false, submitMode = "success" }: QuickBidStoryProps) {
  const [isOpen, setIsOpen] = useState(true);
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          mutations: { retry: false },
          queries: { retry: false },
        },
      }),
    [],
  );

  async function submitBid() {
    await delay(600);

    if (submitMode === "conflict") {
      throw createBidConflictError();
    }

    if (submitMode === "network-error") {
      throw new Error("Conexao indisponivel no ambiente de demonstracao.");
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-[720px] rounded-xl border border-stone-200 bg-stone-50 p-6">
        <button
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
          onClick={() => setIsOpen(true)}
          type="button"
        >
          Abrir lance rapido
        </button>

        <QuickBidModal
          auction={auction}
          isOpen={isOpen}
          isOwner={isOwner}
          onClose={() => setIsOpen(false)}
          onViewDetails={() => setIsOpen(false)}
          submitBid={submitBid}
        />
      </div>
    </QueryClientProvider>
  );
}

const meta = {
  title: "Web/Auctions/QuickBidModal",
  component: QuickBidModal,
  tags: ["autodocs"],
  args: {
    auction: baseAuction,
    isOpen: true,
    isOwner: false,
    onClose: () => undefined,
    onViewDetails: () => undefined,
  },
  argTypes: {
    onClose: { control: false },
    onViewDetails: { control: false },
    submitBid: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Fluxo de lance rapido usado pelo CTA Dar lance nos cards da listagem de leiloes.",
      },
    },
    initialRoute: "/auctions",
    layout: "fullscreen",
  },
} satisfies Meta<typeof QuickBidModal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const InteractiveSuccess: Story = {
  render: () => <QuickBidStory auction={createAuction()} />,
};

export const OwnerBlocked: Story = {
  render: () => <QuickBidStory auction={createAuction()} isOwner />,
};

export const BidConflict: Story = {
  render: () => <QuickBidStory auction={createAuction()} submitMode="conflict" />,
};

export const ClosedAuction: Story = {
  render: () => (
    <QuickBidStory
      auction={createAuction({
        endsAt: "2026-01-01T00:00:00.000Z",
        status: "CLOSED",
      })}
    />
  ),
};

export const NetworkFailure: Story = {
  render: () => <QuickBidStory auction={createAuction()} submitMode="network-error" />,
};
