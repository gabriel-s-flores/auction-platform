import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "@ui";

const meta = {
  title: "Data Display/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: {
    children: "Pendente",
    variant: "neutral",
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Neutral: Story = {
  args: {
    children: "Em análise",
    variant: "neutral",
  },
};

export const Success: Story = {
  args: {
    children: "Aprovado",
    variant: "success",
  },
};

export const Danger: Story = {
  args: {
    children: "Encerrado",
    variant: "danger",
  },
};