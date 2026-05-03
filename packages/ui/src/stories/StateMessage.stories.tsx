import type { Meta, StoryObj } from "@storybook/react-vite";
import { StateMessage } from "@ui";

const meta = {
  title: "Feedback/StateMessage",
  component: StateMessage,
  tags: ["autodocs"],
  args: {
    children: "Nenhum registro encontrado.",
  },
  render: (args) => <StateMessage {...args} />,
} satisfies Meta<typeof StateMessage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ErrorState: Story = {
  args: {
    children: "Falha ao carregar os dados.",
    variant: "error",
  },
};
