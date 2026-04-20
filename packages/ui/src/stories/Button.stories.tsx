import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@ui";

const meta = {
  title: "Actions/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Confirmar lance",
    variant: "primary",
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    children: "Salvar rascunho",
    variant: "secondary",
  },
};

export const Disabled: Story = {
  args: {
    children: "Leilão encerrado",
    disabled: true,
  },
};