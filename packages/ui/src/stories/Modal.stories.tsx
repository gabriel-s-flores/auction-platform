import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "../components/Button";
import { Modal } from "../components/Modal";

const meta = {
  title: "Overlays/Modal",
  component: Modal,
  tags: ["autodocs"],
  args: {
    isOpen: false,
    title: "Título",
    message: "Mensagem de exemplo",
    variant: "info",
    buttons: [{ label: "OK", action: "confirm" }],
    onAction: () => {},
  },
  parameters: {
    docs: {
      description: {
        component: "Acessível, animado e variantado. Usado para confirmações, alertas e ações destrutivas.",
      },
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;

type Story = StoryObj<typeof meta>;

function InfoStory() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button type="button" onClick={() => { setIsOpen(true); }}>
        Abrir modal
      </Button>

      {isOpen ? (
        <Modal
          isOpen
          variant="info"
          title="Confirmar ação"
          message="Tem certeza que deseja prosseguir com esta operação?"
          buttons={[
            { label: "Cancelar", variant: "secondary", action: "cancel" },
            { label: "Confirmar", variant: "primary", action: "confirm" },
          ]}
          onAction={(action) => {
            if (action === "cancel" || action === "confirm") {
              setIsOpen(false);
            }
          }}
        />
      ) : null}
    </>
  );
}

export const Info: Story = {
  render: InfoStory,
};

function DestructiveStory() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button type="button" className="bg-rose-600" onClick={() => { setIsOpen(true); }}>
        Excluir item
      </Button>

      {isOpen ? (
        <Modal
          isOpen
          variant="destructive"
          title="Excluir item"
          message="Esta ação não pode ser desfeita. Deseja excluir permanentemente?"
          buttons={[
            { label: "Cancelar", variant: "secondary", action: "cancel" },
            { label: "Excluir", variant: "primary", action: "confirm" },
          ]}
          onAction={(action) => {
            if (action === "cancel" || action === "confirm") {
              setIsOpen(false);
            }
          }}
        />
      ) : null}
    </>
  );
}

export const Destructive: Story = {
  render: DestructiveStory,
};

function AlertStory() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button type="button" onClick={() => { setIsOpen(true); }}>
        Exibir alerta
      </Button>

      {isOpen ? (
        <Modal
          isOpen
          variant="info"
          message="O item foi salvo em rascunho e pode ser editado posteriormente."
          buttons={[{ label: "Entendi", variant: "primary", action: "confirm" }]}
          onAction={() => {
            setIsOpen(false);
          }}
        />
      ) : null}
    </>
  );
}

export const Alert: Story = {
  render: AlertStory,
};

function StackedStory() {
  const [firstOpen, setFirstOpen] = useState(false);
  const [secondOpen, setSecondOpen] = useState(false);

  return (
    <>
      <Button type="button" onClick={() => { setFirstOpen(true); }}>
        Abrir pilha de modais
      </Button>

      {firstOpen ? (
        <Modal
          isOpen
          variant="info"
          title="Primeiro modal"
          message="Este é o primeiro modal da pilha."
          buttons={[
            { label: "Fechar", variant: "secondary", action: "cancel" },
            { label: "Próximo", variant: "primary", action: "confirm" },
          ]}
          onAction={(action) => {
            if (action === "cancel") {
              setFirstOpen(false);
            }

            if (action === "confirm") {
              setSecondOpen(true);
            }
          }}
        />
      ) : null}

      {secondOpen ? (
        <Modal
          isOpen
          variant="info"
          title="Segundo modal"
          message="Este é o segundo modal da pilha."
          buttons={[{ label: "Fechar", variant: "primary", action: "confirm" }]}
          onAction={() => {
            setSecondOpen(false);
            setFirstOpen(false);
          }}
        />
      ) : null}
    </>
  );
}

export const Stacked: Story = {
  render: StackedStory,
};
