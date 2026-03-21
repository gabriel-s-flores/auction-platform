export interface UploadResult {
  url: string;
  publicId: string;
  mimeType: string;
  size: number;
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
}

export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export function isAllowedMimeType(mimeType: string): mimeType is AllowedMimeType {
  return ALLOWED_MIME_TYPES.includes(mimeType as AllowedMimeType);
}
