import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "@ui";

const meta = {
  title: "Forms/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    className: "max-w-md",
    defaultValue: "Relógio mecânico vintage",
  },
  render: (args) => <Input {...args} />,
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    defaultValue: "Envio bloqueado",
    disabled: true,
  },
};

export const Placeholder: Story = {
  args: {
    defaultValue: undefined,
    placeholder: "Digite o título do lote",
  },
};