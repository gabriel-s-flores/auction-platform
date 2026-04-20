import type { Meta, StoryObj } from "@storybook/react-vite";
import { ImageCarousel } from "@ui";

import { mockGalleryImages } from "./mock-data";

const meta = {
  title: "Media/ImageCarousel",
  component: ImageCarousel,
  tags: ["autodocs"],
  args: {
    className: "w-full max-w-4xl",
    images: mockGalleryImages,
  },
  render: (args) => (
    <div className="w-full max-w-4xl">
      <ImageCarousel {...args} />
    </div>
  ),
} satisfies Meta<typeof ImageCarousel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EmptyState: Story = {
  args: {
    images: [],
  },
};

export const SingleImage: Story = {
  args: {
    images: mockGalleryImages.slice(0, 1),
  },
};

export const MultipleImages: Story = {};