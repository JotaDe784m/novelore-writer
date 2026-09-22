/**
 * Novelore — Storage Provider Abstraction
 * Phase 2.3.1: Core Infrastructure
 * 
 * Provider-agnostic storage interface.
 * Higher application layers (UI, AssetService, domain models) depend exclusively
 * on this contract, never directly on Firebase Storage SDK or vendor implementations.
 * 
 * Future-proof for additional storage backends (e.g., local mock, Google Drive,
 * OneDrive, Dropbox) without rewriting application business logic.
 */

import { StorageDownloadResult, StorageUploadResult } from "../../types/assets";

export interface StorageProvider {
  /** Provider identifier (e.g. 'firebase-storage', 'in-memory', 'google-drive') */
  readonly providerName: string;

  /**
   * Uploads binary data to the given storage path.
   * 
   * @param path Canonical path where the binary is stored
   * @param data Binary payload as Blob, Uint8Array or ArrayBuffer
   * @param mimeType Validated MIME type
   * @returns StorageUploadResult containing confirmed path, byte size, and MIME type
   */
  upload(
    path: string,
    data: Blob | Uint8Array | ArrayBuffer,
    mimeType: string
  ): Promise<StorageUploadResult>;

  /**
   * Downloads binary data from the given storage path.
   * 
   * @param path Canonical storage path
   * @returns StorageDownloadResult containing raw Blob, MIME type, and size
   */
  download(path: string): Promise<StorageDownloadResult>;

  /**
   * Deletes the binary object stored at the given path.
   * 
   * @param path Canonical storage path
   */
  delete(path: string): Promise<void>;

  /**
   * Checks whether an object exists at the given path.
   * 
   * @param path Canonical storage path
   * @returns true if the asset exists, false otherwise
   */
  exists(path: string): Promise<boolean>;

  /**
   * Dynamically resolves an accessible URL for the asset at runtime.
   * NOTE: URLs are dynamically obtained and NOT permanently persisted in primary Firestore records.
   * 
   * @param path Canonical storage path
   * @returns Temporary or direct URL string
   */
  resolveUrl?(path: string): Promise<string>;
}
