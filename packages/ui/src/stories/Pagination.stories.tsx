import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pagination } from "@ui";

const meta = {
  title: "Navigation/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  args: {
    currentPage: 2,
    totalPages: 5,
    onPageChange: () => undefined,
  },
  render: (args) => <Pagination {...args} />,
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
