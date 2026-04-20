import type { Meta, StoryObj } from "@storybook/react-vite";
import { Alert } from "@ui";

const meta = {
  title: "Feedback/Alert",
  component: Alert,
  tags: ["autodocs"],
  args: {
    children: "Atualização salva com sucesso.",
    variant: "info",
  },
  render: (args) => <Alert {...args} className="max-w-md" />,
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    children: "Novas imagens serão exibidas assim que o processamento terminar.",
    variant: "info",
  },
};

export const Success: Story = {
  args: {
    children: "Lance confirmado e registrado no leilão.",
    variant: "success",
  },
};

export const ErrorState: Story = {
  args: {
    children: "Não foi possível concluir o envio. Tente novamente em instantes.",
    variant: "error",
  },
};