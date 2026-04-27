import type { ImageDto } from "@auction/shared-types";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { ImageUploader } from "./ImageUploader";

function makeImage(overrides: Partial<ImageDto> = {}): ImageDto {
  return {
    alt: "Auction image",
    id: "image-1",
    isPrimary: true,
    position: 0,
    thumbnailUrl: "https://res.cloudinary.com/demo/image/upload/v1/image.jpg",
    url: "https://res.cloudinary.com/demo/image/upload/v1/image.jpg",
    ...overrides,
  };
}

function getFileInput(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector("input[type='file']");
  expect(input).not.toBeNull();

  return input as HTMLInputElement;
}

describe("ImageUploader", () => {
  test("uploads valid image files without compression when disabled", async () => {
    const onUpload = vi.fn(async () => []);
    const file = new File(["image"], "watch.jpg", { type: "image/jpeg" });

    const { container } = render(
      <ImageUploader
        enableCompression={false}
        images={[]}
        onChange={vi.fn()}
        onDelete={vi.fn(async () => undefined)}
        onUpload={onUpload}
      />
    );

    fireEvent.change(getFileInput(container), {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(onUpload).toHaveBeenCalledWith([file]);
    });
  });

  test("shows validation errors and skips upload for disallowed file types", async () => {
    const onUpload = vi.fn(async () => []);
    const file = new File(["not-image"], "notes.txt", { type: "text/plain" });

    const { container } = render(
      <ImageUploader
        enableCompression={false}
        images={[]}
        onChange={vi.fn()}
        onDelete={vi.fn(async () => undefined)}
        onUpload={onUpload}
      />
    );

    fireEvent.change(getFileInput(container), {
      target: { files: [file] },
    });

    expect(await screen.findByText(/Tipo não permitido: notes.txt/)).toBeInTheDocument();
    expect(onUpload).not.toHaveBeenCalled();
  });

  test("changes the primary image and deletes images through callbacks", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onDelete = vi.fn(async () => undefined);

    render(
      <ImageUploader
        images={[
          makeImage({ id: "image-1", isPrimary: true, position: 0 }),
          makeImage({ id: "image-2", isPrimary: false, position: 1 }),
        ]}
        onChange={onChange}
        onDelete={onDelete}
        onUpload={vi.fn(async () => [])}
      />
    );

    const [removeButton] = screen.getAllByTitle("Remover imagem");
    if (!removeButton) {
      throw new Error("Expected at least one remove button");
    }

    await user.click(screen.getByTitle("Definir como principal"));
    await user.click(removeButton);

    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ id: "image-1", isPrimary: false }),
      expect.objectContaining({ id: "image-2", isPrimary: true }),
    ]);
    expect(onDelete).toHaveBeenCalledWith("image-1");
  });
});
