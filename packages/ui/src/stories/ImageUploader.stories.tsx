import type { ImageDto } from "@auction/shared-types";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ImageUploader } from "@ui";
import { type ComponentProps, useEffect, useState } from "react";

import { createStoryImage, mockGalleryImages, normalizeStoryImages } from "./mock-data";

const noopAsyncUpload = async () => [] as ImageDto[];
const noopAsyncDelete = async () => undefined;
const noopChange = () => undefined;

function StatefulImageUploader({
  images: initialImages,
  ...args
}: ComponentProps<typeof ImageUploader>) {
  const [images, setImages] = useState<ImageDto[]>(initialImages);

  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  const handleChange = (nextImages: ImageDto[]) => {
    setImages(normalizeStoryImages(nextImages));
  };

  const handleUpload = async (files: File[]) => {
    const nextImages = files.map((file, index) =>
      createStoryImage(`uploaded-${file.name}-${index}`, file.name, {
        isPrimary: images.length === 0 && index === 0,
        position: images.length + index,
      })
    );

    setImages((currentImages) => normalizeStoryImages([...currentImages, ...nextImages]));

    return nextImages;
  };

  const handleDelete = async (imageId: string) => {
    setImages((currentImages) =>
      normalizeStoryImages(currentImages.filter((image) => image.id !== imageId))
    );
  };

  return (
    <div className="w-full max-w-3xl">
      <ImageUploader
        {...args}
        images={images}
        onChange={handleChange}
        onDelete={handleDelete}
        onUpload={handleUpload}
      />
    </div>
  );
}

const meta = {
  title: "Forms/ImageUploader",
  component: ImageUploader,
  tags: ["autodocs"],
  args: {
    disabled: false,
    images: [],
    isUploading: false,
    maxImages: 6,
    onChange: noopChange,
    onDelete: noopAsyncDelete,
    onUpload: noopAsyncUpload,
    uploadProgress: 0,
  },
  argTypes: {
    onChange: {
      control: false,
    },
    onDelete: {
      control: false,
    },
    onUpload: {
      control: false,
    },
  },
  render: (args) => <StatefulImageUploader {...args} />,
} satisfies Meta<typeof ImageUploader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithImages: Story = {
  args: {
    images: mockGalleryImages,
  },
};

export const UploadingProgress: Story = {
  args: {
    images: mockGalleryImages.slice(0, 2),
    isUploading: true,
    uploadProgress: 64,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    images: mockGalleryImages.slice(0, 2),
  },
};