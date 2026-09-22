/**
 * Novelore — Asset and Binary Domain Models
 * Phase 2.3.1: Core Infrastructure
 * 
 * Minimal AssetReference domain model as audited and designed in Phase 2.3.
 */

export type AssetType =
  | "cover"
  | "entity_avatar"
  | "entity_gallery"
  | "board_image"
  | "board_document"
  | "custom_font";

/**
 * Minimal canonical asset reference in Novelore.
 * Stored in Firestore documents instead of heavy Base64 strings.
 */
export interface AssetReference {
  /** Unique immutable identifier of the asset */
  id: string;
  /** Parent novel identifier */
  novelId: string;
  /** Owner user UID */
  ownerId: string;
  /** Categorized asset domain type */
  assetType: AssetType;
  /** Canonical path in storage (/users/{userId}/novels/{novelId}/assets/{assetType}/{assetId}) */
  storagePath: string;
  /** Validated MIME type */
  mimeType: string;
  /** Exact binary size in bytes */
  sizeBytes: number;
  /** Creation ISO timestamp */
  createdAt: string;

  // Optional fields — evaluated in Phase 2.3 audit, NOT mandatory for core operations
  /** Original file name if uploaded by user (useful for attached documents) */
  originalName?: string;
  /** Cryptographic hash (SHA-256 or MD5) for integrity/deduplication */
  hash?: string;
  /** Dynamically resolved download URL (NOT persisted as a required primary field) */
  downloadUrl?: string;
}

/**
 * Input parameters for uploading an asset via AssetService.
 */
export interface UploadAssetParams {
  novelId: string;
  ownerId: string;
  assetType: AssetType;
  data: Blob | Uint8Array | ArrayBuffer;
  mimeType: string;
  customAssetId?: string;
  originalName?: string;
}

/**
 * Result from a low-level storage provider upload operation.
 */
export interface StorageUploadResult {
  storagePath: string;
  sizeBytes: number;
  mimeType: string;
}

/**
 * Result from a low-level storage provider download operation.
 */
export interface StorageDownloadResult {
  data: Blob;
  mimeType: string;
  sizeBytes: number;
}
