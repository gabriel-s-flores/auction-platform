import { type UploadApiErrorResponse, type UploadApiResponse,v2 as cloudinary } from "cloudinary";

import type { StorageService, UploadResult } from "#application/services/storage-service";
import { env } from "#infrastructure/config/env";

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
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: filename.replace(/\.[^/.]+$/, ""), // Remove extension
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
    // To: https://res.cloudinary.com/cloud_name/image/upload/w_64,h_64,c_fill/v123/public_id

    const parts = url.split("/upload/");
    if (parts.length !== 2) {
      return url; // Not a Cloudinary URL, return as-is
    }

    return `${parts[0]}/upload/w_${width},h_${height},c_fill/${parts[1]}`;
  }
}
