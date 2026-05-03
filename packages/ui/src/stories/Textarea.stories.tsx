import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "@ui";

const meta = {
  title: "Forms/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: {
    className: "max-w-md",
    defaultValue: "Descrição detalhada do item em leilão.",
  },
  render: (args) => <Textarea {...args} />,
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Placeholder: Story = {
  args: {
    defaultValue: undefined,
    placeholder: "Descreva o lote",
  },
};
