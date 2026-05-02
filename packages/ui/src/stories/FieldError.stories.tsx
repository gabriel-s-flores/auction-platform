import type { Meta, StoryObj } from "@storybook/react-vite";
import { FieldError } from "@ui";

const meta = {
  title: "Forms/FieldError",
  component: FieldError,
  tags: ["autodocs"],
  args: {
    children: "Informe um valor válido.",
    id: "field-error-story",
  },
} satisfies Meta<typeof FieldError>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HiddenWhenEmpty: Story = {
  args: {
    children: null,
  },
};
