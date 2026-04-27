import { describe, expect, test } from "vitest";

import {
  generateSrcset,
  getCardSizes,
  getCarouselSizes,
  getPlaceholderUrl,
  getResponsiveUrls,
  getThumbnailByPreset,
  getThumbnailUrl,
  isCloudinaryUrl,
} from "./image-utils";

const cloudinaryUrl = "https://res.cloudinary.com/demo/image/upload/v1/watch.jpg";

describe("image utils", () => {
  test("detects Cloudinary URLs", () => {
    expect(isCloudinaryUrl(cloudinaryUrl)).toBe(true);
    expect(isCloudinaryUrl("https://example.com/watch.jpg")).toBe(false);
  });

  test("generates optimized Cloudinary thumbnail URLs", () => {
    expect(getThumbnailUrl(cloudinaryUrl, 400, 300)).toBe(
      "https://res.cloudinary.com/demo/image/upload/w_400,h_300,c_fill,g_auto,q_auto:best,f_auto/v1/watch.jpg"
    );
    expect(getThumbnailByPreset(cloudinaryUrl, "card")).toContain(
      "w_400,h_400,c_fill,g_auto,q_auto:best,f_auto"
    );
  });

  test("leaves non-Cloudinary URLs untouched", () => {
    const externalUrl = "https://example.com/watch.jpg";

    expect(getThumbnailByPreset(externalUrl, "card")).toBe(externalUrl);
    expect(getPlaceholderUrl(externalUrl)).toBe(externalUrl);
    expect(getResponsiveUrls(externalUrl)).toEqual({
      large: externalUrl,
      medium: externalUrl,
      original: externalUrl,
      small: externalUrl,
      thumbnail: externalUrl,
      xlarge: externalUrl,
    });
  });

  test("builds responsive srcset and sizes helpers", () => {
    const urls = getResponsiveUrls(cloudinaryUrl);

    expect(generateSrcset(urls)).toContain("400w");
    expect(generateSrcset(urls)).toContain("1600w");
    expect(getCarouselSizes()).toContain("100vw");
    expect(getCardSizes()).toContain("200px");
  });
});
