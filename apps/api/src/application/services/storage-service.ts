export interface UploadResult {
  url: string;
  publicId: string;
  mimeType: string;
  size: number;
}

export type ThumbnailPreset = "strip" | "card" | "search" | "og";

export interface ResponsiveImageUrls {
  /** Original URL */
  original: string;
  /** Thumbnail for carousel strip (80x80) */
  thumbnail: string;
  /** Small width variant (400px) */
  small?: string;
  /** Medium width variant (800px) */
  medium?: string;
  /** Large width variant (1200px) */
  large?: string;
  /** Extra large width variant (1600px) */
  xlarge?: string;
}

export interface StorageService {
  upload: (
    file: Buffer,
    filename: string,
    mimeType: string,
    folder?: string
  ) => Promise<UploadResult>;
  delete: (publicId: string) => Promise<void>;
  getThumbnailUrl: (url: string, width: number, height: number) => string;
  /** Get thumbnail URL using predefined presets */
  getThumbnailByPreset: (url: string, preset: ThumbnailPreset) => string;
  /** Get responsive image URLs for different viewport sizes */
  getResponsiveUrls: (url: string) => ResponsiveImageUrls;
}

export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export function isAllowedMimeType(mimeType: string): mimeType is AllowedMimeType {
  return ALLOWED_MIME_TYPES.includes(mimeType as AllowedMimeType);
}
