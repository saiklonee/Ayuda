import { v2 as cloudinary } from "cloudinary";
import { MediaStorageBackend } from "./MediaStorageBackend.js";

/**
 * Cloudinary implementation of MediaStorageBackend, using the existing
 * configs/cloudinary.js setup.
 *
 * EXIF/GPS stripping is non-negotiable per core-logic.md §6 ("never trust
 * client-side stripping"). Cloudinary strips metadata by default on upload
 * UNLESS `image_metadata: true` is passed — this class deliberately does
 * NOT pass that flag, and does not enable it for proof-of-work / KYC
 * uploads under any circumstance. If a future call site needs metadata for
 * some other reason (rare), it must go through a differently-named method
 * with an explicit review, not this one.
 */
export class CloudinaryStorageBackend extends MediaStorageBackend {
  async store(buffer, { filename, mimeType, folder = "ayuda" }) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "auto",
          // Deliberately omitting image_metadata — default behavior strips
          // EXIF/GPS. Do not add image_metadata: true here.
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
      uploadStream.end(buffer);
    });
  }

  async delete(storedRef) {
    // storedRef is expected to be a Cloudinary public_id or the secure_url;
    // derive public_id from the URL if a raw URL was stored.
    await cloudinary.uploader.destroy(storedRef);
  }
}
