import type { ImageDto } from "@auction/shared-types";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import { ImageCarousel } from "./ImageCarousel";

function makeImage(overrides: Partial<ImageDto> = {}): ImageDto {
  return {
    alt: "Relogio",
    id: "image-1",
    isPrimary: true,
    position: 0,
    thumbnailUrl: "https://res.cloudinary.com/demo/image/upload/v1/watch-thumb.jpg",
    url: "https://res.cloudinary.com/demo/image/upload/v1/watch.jpg",
    ...overrides,
  };
}

describe("ImageCarousel", () => {
  test("renders an empty state without images", () => {
    render(<ImageCarousel images={[]} />);

    expect(screen.getByText("Sem imagens")).toBeInTheDocument();
  });

  test("renders the main image and opens the preview", async () => {
    const user = userEvent.setup();

    render(<ImageCarousel images={[makeImage()]} />);

    expect(screen.getByRole("img", { name: "Relogio" })).toHaveAttribute(
      "src",
      expect.stringContaining("watch.jpg"),
    );

    await user.click(screen.getByRole("button", { name: "Abrir visualização ampliada da imagem" }));

    expect(
      screen.getByRole("dialog", { name: "Visualização ampliada da imagem" }),
    ).toBeInTheDocument();
  });

  test("navigates between multiple images", async () => {
    const user = userEvent.setup();

    render(
      <ImageCarousel
        images={[
          makeImage(),
          makeImage({
            alt: "Camera",
            id: "image-2",
            isPrimary: false,
            position: 1,
            thumbnailUrl: "https://res.cloudinary.com/demo/image/upload/v1/camera-thumb.jpg",
            url: "https://res.cloudinary.com/demo/image/upload/v1/camera.jpg",
          }),
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Próxima imagem" }));

    expect(screen.getByRole("img", { name: "Camera" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Selecionar imagem 2" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
