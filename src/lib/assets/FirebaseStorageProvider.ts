/**
 * Novelore — Firebase Storage Provider (Legacy Stub)
 * Converted to offline stub in Phase 1 (Local-First).
 */

import { StorageProvider } from "./StorageProvider";
import { StorageDownloadResult, StorageUploadResult } from "../../types/assets";

export class FirebaseStorageProvider implements StorageProvider {
  readonly providerName: string = "firebase-storage-stub";

  constructor(_customStorage?: any) {}

  async upload(
    path: string,
    _data: Blob | Uint8Array | ArrayBuffer,
    mimeType: string
  ): Promise<StorageUploadResult> {
    return {
      storagePath: path,
      sizeBytes: 0,
      mimeType,
    };
  }

  async download(_path: string): Promise<StorageDownloadResult> {
    return {
      data: new Blob([]),
      mimeType: "application/octet-stream",
      sizeBytes: 0,
    };
  }

  async delete(_path: string): Promise<void> {}

  async exists(_path: string): Promise<boolean> {
    return false;
  }

  async resolveUrl(_path: string): Promise<string> {
    return "";
  }
}
