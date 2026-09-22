/**
 * Novelore — Firebase Storage Provider
 * Phase 2.3.1: Core Infrastructure
 * 
 * Concrete implementation of StorageProvider wrapping Firebase Cloud Storage SDK.
 * All Firebase Storage specific dependencies, SDK calls, and error mappings
 * are completely encapsulated here.
 */

import {
  ref,
  uploadBytes,
  getBlob,
  getBytes,
  deleteObject,
  getMetadata,
  getDownloadURL,
  FirebaseStorage,
} from "firebase/storage";
import { StorageProvider } from "./StorageProvider";
import { StorageDownloadResult, StorageUploadResult } from "../../types/assets";
import { normalizeStorageError } from "./errors";
import { getFirebaseStorageInstance } from "../firebase";

export class FirebaseStorageProvider implements StorageProvider {
  readonly providerName: string = "firebase-storage";
  private storageInstance?: FirebaseStorage;

  /**
   * @param customStorage Optional FirebaseStorage instance for testing or custom configuration
   */
  constructor(customStorage?: FirebaseStorage) {
    this.storageInstance = customStorage;
  }

  private getStorage(): FirebaseStorage {
    if (!this.storageInstance) {
      this.storageInstance = getFirebaseStorageInstance();
    }
    return this.storageInstance;
  }

  async upload(
    path: string,
    data: Blob | Uint8Array | ArrayBuffer,
    mimeType: string
  ): Promise<StorageUploadResult> {
    try {
      const storage = this.getStorage();
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, data, {
        contentType: mimeType,
      });

      const sizeBytes = snapshot.metadata?.size ?? 0;
      const resolvedMime = snapshot.metadata?.contentType || mimeType;

      return {
        storagePath: path,
        sizeBytes,
        mimeType: resolvedMime,
      };
    } catch (err) {
      throw normalizeStorageError(err, { operation: "upload", storagePath: path });
    }
  }

  async download(path: string): Promise<StorageDownloadResult> {
    try {
      const storage = this.getStorage();
      const storageRef = ref(storage, path);

      // Attempt to retrieve metadata for contentType and size
      let mimeType = "application/octet-stream";
      let sizeBytes = 0;
      try {
        const metadata = await getMetadata(storageRef);
        if (metadata.contentType) mimeType = metadata.contentType;
        if (typeof metadata.size === "number") sizeBytes = metadata.size;
      } catch {
        // Fallback if getMetadata fails
      }

      let blobData: Blob;
      if (typeof getBlob === "function") {
        blobData = await getBlob(storageRef);
      } else {
        const bytes = await getBytes(storageRef);
        blobData = new Blob([bytes], { type: mimeType });
      }

      if (blobData.type && blobData.type !== "") {
        mimeType = blobData.type;
      }
      if (blobData.size) {
        sizeBytes = blobData.size;
      }

      return {
        data: blobData,
        mimeType,
        sizeBytes,
      };
    } catch (err) {
      throw normalizeStorageError(err, { operation: "download", storagePath: path });
    }
  }

  async delete(path: string): Promise<void> {
    try {
      const storage = this.getStorage();
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (err) {
      throw normalizeStorageError(err, { operation: "delete", storagePath: path });
    }
  }

  async exists(path: string): Promise<boolean> {
    try {
      const storage = this.getStorage();
      const storageRef = ref(storage, path);
      await getMetadata(storageRef);
      return true;
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "storage/object-not-found" || code === "not-found") {
        return false;
      }
      throw normalizeStorageError(err, { operation: "exists", storagePath: path });
    }
  }

  async resolveUrl(path: string): Promise<string> {
    try {
      const storage = this.getStorage();
      const storageRef = ref(storage, path);
      return await getDownloadURL(storageRef);
    } catch (err) {
      throw normalizeStorageError(err, { operation: "resolveUrl", storagePath: path });
    }
  }
}
