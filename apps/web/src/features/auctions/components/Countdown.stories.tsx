import type { Meta, StoryObj } from "@storybook/react-vite";

import { Countdown } from "./Countdown";

function getFutureIso(offsetMs: number) {
  return new Date(Date.now() + offsetMs).toISOString();
}

const meta = {
  title: "Web/Auctions/Countdown",
  component: Countdown,
  tags: ["autodocs"],
  args: {
    endsAt: getFutureIso(2 * 60 * 60 * 1000 + 15 * 60 * 1000),
    variant: "default",
  },
  argTypes: {
    onExpire: { control: false },
    variant: {
      control: "inline-radio",
      options: ["default", "compact", "hero"],
    },
  },
} satisfies Meta<typeof Countdown>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: {
    endsAt: getFutureIso(12 * 60 * 1000 + 15 * 1000),
    variant: "compact",
  },
};

export const Hero: Story = {
  args: {
    endsAt: getFutureIso(3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
    variant: "hero",
  },
};

export const Critical: Story = {
  args: {
    endsAt: getFutureIso(25 * 1000),
    variant: "hero",
  },
};

export const Expired: Story = {
  args: {
    endsAt: "2026-01-01T00:00:00.000Z",
  },
};
