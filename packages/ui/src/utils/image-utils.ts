/**
 * Responsive image widths for srcset
 */
export const RESPONSIVE_WIDTHS = {
  small: 400,
  medium: 800,
  large: 1200,
  xlarge: 1600,
} as const;

/**
 * Thumbnail preset configurations
 */
export const THUMBNAIL_PRESETS = {
  strip: { width: 80, height: 80 },
  card: { width: 160, height: 120 },
  search: { width: 120, height: 120 },
  og: { width: 1200, height: 630 },
} as const;

export interface ResponsiveImageUrls {
  /** Original URL */
  original: string;
  /** Thumbnail (80x80) */
  thumbnail: string;
  /** Small width variant (400px) */
  small: string;
  /** Medium width variant (800px) */
  medium: string;
  /** Large width variant (1200px) */
  large: string;
  /** Extra large width variant (1600px) */
  xlarge: string;
}

/**
 * Check if a URL is a Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes("res.cloudinary.com");
}

/**
 * Transform a Cloudinary URL with width/height constraints
 */
function transformCloudinaryUrl(
  url: string,
  transformation: string
): string {
  const parts = url.split("/upload/");
  if (parts.length !== 2) {
    return url;
  }
  return `${parts[0]}/upload/${transformation}/${parts[1]}`;
}

/**
 * Generate a thumbnail URL with the specified dimensions
 */
export function getThumbnailUrl(
  url: string,
  width: number,
  height: number
): string {
  if (!isCloudinaryUrl(url)) {
    return url;
  }
  return transformCloudinaryUrl(url, `w_${width},h_${height},c_fill,g_auto`);
}

/**
 * Generate a thumbnail URL using a preset
 */
export function getThumbnailByPreset(
  url: string,
  preset: keyof typeof THUMBNAIL_PRESETS
): string {
  const { width, height } = THUMBNAIL_PRESETS[preset];
  return getThumbnailUrl(url, width, height);
}

/**
 * Generate responsive image URLs for different viewport sizes
 */
export function getResponsiveUrls(url: string): ResponsiveImageUrls {
  if (!isCloudinaryUrl(url)) {
    return {
      original: url,
      thumbnail: url,
      small: url,
      medium: url,
      large: url,
      xlarge: url,
    };
  }

  // Use transformCloudinaryUrl helper instead of manual URL manipulation
  return {
    original: url,
    thumbnail: transformCloudinaryUrl(url, "w_80,h_80,c_fill,g_auto"),
    small: transformCloudinaryUrl(url, `w_${RESPONSIVE_WIDTHS.small},c_limit,q_auto:best,f_auto`),
    medium: transformCloudinaryUrl(url, `w_${RESPONSIVE_WIDTHS.medium},c_limit,q_auto:best,f_auto`),
    large: transformCloudinaryUrl(url, `w_${RESPONSIVE_WIDTHS.large},c_limit,q_auto:best,f_auto`),
    xlarge: transformCloudinaryUrl(url, `w_${RESPONSIVE_WIDTHS.xlarge},c_limit,q_auto:best,f_auto`),
  };
}

/**
 * Generate srcset string from responsive URLs
 */
export function generateSrcset(urls: ResponsiveImageUrls): string {
  return [
    `${urls.small} ${RESPONSIVE_WIDTHS.small}w`,
    `${urls.medium} ${RESPONSIVE_WIDTHS.medium}w`,
    `${urls.large} ${RESPONSIVE_WIDTHS.large}w`,
    `${urls.xlarge} ${RESPONSIVE_WIDTHS.xlarge}w`,
  ].join(", ");
}

/**
 * Generate a sizes attribute for carousel images
 */
export function getCarouselSizes(): string {
  return "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px";
}

/**
 * Generate a sizes attribute for card thumbnails
 */
export function getCardSizes(): string {
  return "(max-width: 640px) 100px, 200px";
}

/**
 * Generate a blur placeholder URL (LQIP - Low Quality Image Placeholder)
 * Uses Cloudinary's blur transformation
 */
export function getPlaceholderUrl(url: string): string {
  if (!isCloudinaryUrl(url)) {
    return url;
  }
  return transformCloudinaryUrl(url, "w_20,e_blur:10,q_auto:low");
}
