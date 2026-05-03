import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormField, Input } from "@ui";

const meta = {
  title: "Forms/FormField",
  component: FormField,
  tags: ["autodocs"],
  args: {
    id: "auction-title",
    label: "Título",
    hint: "Use um nome claro para o lote.",
  },
  render: (args) => (
    <FormField {...args}>
      <Input id={args.id} className="max-w-md" defaultValue="Relógio vintage" />
    </FormField>
  ),
} satisfies Meta<typeof FormField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
  args: {
    error: "Informe um título válido.",
  },
};
