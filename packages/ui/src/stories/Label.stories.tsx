import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input, Label } from "@ui";

const meta = {
  title: "Forms/Label",
  component: Label,
  tags: ["autodocs"],
  args: {
    children: "Título do lote",
    htmlFor: "auction-title",
  },
} satisfies Meta<typeof Label>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AssociatedWithInput: Story = {
  render: (args) => (
    <div className="w-full max-w-md">
      <Label {...args} />
      <Input defaultValue="Bolsa de coleção" id="auction-title" />
    </div>
  ),
};