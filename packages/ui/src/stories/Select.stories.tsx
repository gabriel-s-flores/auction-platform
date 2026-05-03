import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "@ui";

const meta = {
  title: "Forms/Select",
  component: Select,
  tags: ["autodocs"],
  args: {
    className: "max-w-md",
    defaultValue: "",
  },
  render: (args) => (
    <Select {...args}>
      <option value="">Todos</option>
      <option value="open">Aberto</option>
      <option value="closed">Encerrado</option>
    </Select>
  ),
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
