import type { Meta, StoryObj } from "@storybook/react-vite";
import { AuctionCard } from "@ui";
import { Link } from "react-router-dom";

import {
  closedAuction,
  closedTimeRemaining,
  criticalAuction,
  criticalTimeRemaining,
  openAuction,
  openTimeRemaining,
} from "./mock-data";

const meta = {
  title: "Commerce/AuctionCard",
  component: AuctionCard,
  tags: ["autodocs"],
  args: {
    auction: openAuction,
    linkComponent: Link,
    onPlaceBid: () => undefined,
    timeRemaining: openTimeRemaining,
  },
  argTypes: {
    linkComponent: {
      control: false,
    },
    onPlaceBid: {
      control: false,
    },
  },
  parameters: {
    initialRoute: "/auctions",
  },
  render: (args) => (
    <div className="w-full max-w-sm">
      <AuctionCard {...args} />
    </div>
  ),
} satisfies Meta<typeof AuctionCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OpenAuction: Story = {};

export const CriticalExtension: Story = {
  args: {
    auction: criticalAuction,
    timeRemaining: criticalTimeRemaining,
  },
};

export const ClosedAuctionState: Story = {
  args: {
    auction: closedAuction,
    timeRemaining: closedTimeRemaining,
  },
};