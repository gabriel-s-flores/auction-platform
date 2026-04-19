import { type UploadApiErrorResponse, type UploadApiResponse, v2 as cloudinary } from "cloudinary";
import { randomBytes } from "crypto";

import type { ResponsiveImageUrls, StorageService, ThumbnailPreset, UploadResult } from "#application/services/storage-service";
import { env } from "#infrastructure/config/env";

/** Thumbnail preset configurations */
const THUMBNAIL_PRESETS: Record<ThumbnailPreset, { width: number; height: number }> = {
  strip: { width: 160, height: 160 },
  card: { width: 400, height: 400 },
  search: { width: 120, height: 120 },
  og: { width: 1200, height: 630 },
};

/** Responsive image widths for srcset */
const RESPONSIVE_WIDTHS = {
  small: 400,
  medium: 800,
  large: 1200,
  xlarge: 1600,
};

export class CloudinaryStorage implements StorageService {
  constructor() {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }

  async upload(
    file: Buffer,
    filename: string,
    mimeType: string,
    folder = "auctions"
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      // Generate unique filename to prevent collisions when users upload files with same name
      // Using timestamp, process ID, and random bytes for uniqueness
      const timestamp = Date.now();
      const processId = process.pid || 0;
      const randomBytesHex = randomBytes(4).toString("hex"); // 8 hex characters for randomness
      const baseName = filename.replace(/\.[^/.]+$/, "");
      const extension = filename.substring(filename.lastIndexOf('.'));
      const uniqueFilename = `${baseName}-${timestamp}-${processId}-${randomBytesHex}${extension}`;

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: uniqueFilename.replace(/\.[^/.]+$/, ""), // Remove extension from unique filename
          resource_type: "image",
          overwrite: false,
          transformation: [{ quality: "auto:best" }, { fetch_format: "auto" }],
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            reject(error);
            return;
          }
          if (!result) {
            reject(new Error("Upload failed - no result returned"));
            return;
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            mimeType,
            size: result.bytes,
          });
        }
      );

      // Write buffer to stream
      uploadStream.end(file);
    });
  }

  async delete(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }

  getThumbnailUrl(url: string, width: number, height: number): string {
    // Cloudinary URL transformation
    // Transform: https://res.cloudinary.com/cloud_name/image/upload/v123/public_id
    // To: https://res.cloudinary.com/cloud_name/image/upload/w_400,h_400,c_fill,g_auto,q_auto:best,f_auto/v123/public_id

    const parts = url.split("/upload/");
    if (parts.length !== 2) {
      return url; // Not a Cloudinary URL, return as-is
    }

    return `${parts[0]}/upload/w_${width},h_${height},c_fill,g_auto,q_auto:best,f_auto/${parts[1]}`;
  }

  getThumbnailByPreset(url: string, preset: ThumbnailPreset): string {
    const { width, height } = THUMBNAIL_PRESETS[preset];
    return this.getThumbnailUrl(url, width, height);
  }

  getResponsiveUrls(url: string): ResponsiveImageUrls {
    const parts = url.split("/upload/");
    if (parts.length !== 2) {
      // Not a Cloudinary URL, return original for all sizes
      return {
        original: url,
        thumbnail: url,
      };
    }

    const [baseUrl, pathWithVersion] = parts;

    // Generate thumbnail (160x160 for carousel strip)
    const thumbnail = `${baseUrl}/upload/w_160,h_160,c_fill,g_auto,q_auto:best,f_auto/${pathWithVersion}`;

    // Generate responsive width variants (maintain aspect ratio, limit width)
    const small = `${baseUrl}/upload/w_${RESPONSIVE_WIDTHS.small},c_limit,q_auto:best,f_auto/${pathWithVersion}`;
    const medium = `${baseUrl}/upload/w_${RESPONSIVE_WIDTHS.medium},c_limit,q_auto:best,f_auto/${pathWithVersion}`;
    const large = `${baseUrl}/upload/w_${RESPONSIVE_WIDTHS.large},c_limit,q_auto:best,f_auto/${pathWithVersion}`;
    const xlarge = `${baseUrl}/upload/w_${RESPONSIVE_WIDTHS.xlarge},c_limit,q_auto:best,f_auto/${pathWithVersion}`;

    return {
      original: url,
      thumbnail,
      small,
      medium,
      large,
      xlarge,
    };
  }
}