import type { Meta, StoryObj } from "@storybook/react-vite";
import { ResponsiveImage } from "@ui";

import { missingImageUrl, mockGalleryImages, placeholderImageUrl } from "./mock-data";

const meta = {
  title: "Media/ResponsiveImage",
  component: ResponsiveImage,
  tags: ["autodocs"],
  args: {
    alt: "Produto em destaque",
    className: "h-72 w-full max-w-md rounded-2xl",
    loading: "eager",
    src: mockGalleryImages[0]?.url ?? "",
  },
  argTypes: {
    children: {
      control: false,
    },
    onClick: {
      control: false,
    },
    style: {
      control: false,
    },
  },
  render: (args) => (
    <div className="w-full max-w-md">
      <ResponsiveImage {...args} />
    </div>
  ),
} satisfies Meta<typeof ResponsiveImage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPlaceholder: Story = {
  args: {
    placeholderUrl: placeholderImageUrl,
  },
};

export const ErrorFallback: Story = {
  args: {
    src: missingImageUrl,
  },
};