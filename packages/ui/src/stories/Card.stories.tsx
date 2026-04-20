import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge, Button, Card } from "@ui";

const meta = {
  title: "Data Display/Card",
  component: Card,
  tags: ["autodocs"],
  argTypes: {
    children: {
      control: false,
    },
  },
  render: (args) => (
    <div className="w-full max-w-md">
      <Card {...args} />
    </div>
  ),
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SimpleContent: Story = {
  args: {
    children: (
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900">Resumo do lote</h3>
        <p className="text-sm text-slate-600">
          Lote revisado, pronto para publicação e com todas as imagens obrigatórias.
        </p>
      </div>
    ),
  },
};

export const ComposedLayout: Story = {
  args: {
    children: (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Leilão premium</p>
            <h3 className="text-lg font-semibold text-slate-900">Bolsa edição limitada</h3>
          </div>
          <Badge variant="success">Publicado</Badge>
        </div>

        <p className="text-sm text-slate-600">
          Documentação aprovada e imagens otimizadas para publicação no catálogo principal.
        </p>

        <div className="flex justify-end">
          <Button variant="secondary">Ver detalhes</Button>
        </div>
      </div>
    ),
  },
};