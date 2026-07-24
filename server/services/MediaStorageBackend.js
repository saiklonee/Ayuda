/**
 * Interface every media storage backend must satisfy. Proof-of-work uploads
 * and verification docs go through this, never directly through the
 * Cloudinary SDK in a controller — swapping providers later is then a
 * one-file change, not a rewrite (core-logic.md §6, project-spec.md §5.1).
 */
export class MediaStorageBackend {
  /**
   * Stores a file buffer, returns a stable public/servable URL.
   */
  async store(buffer, { filename, mimeType }) {
    throw new Error("store() not implemented");
  }

  async delete(storedRef) {
    throw new Error("delete() not implemented");
  }
}
