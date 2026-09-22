/**
 * Novelore — Asset Service
 * Phase 2.3.1: Core Infrastructure
 * 
 * Domain-facing coordinator for asset operations.
 * Responsibilities:
 * - Validate upload parameters and MIME types
 * - Enforce canonical storage path convention
 * - Delegate binary operations to StorageProvider
 * - Construct typed AssetReference models
 * - Provide provider-agnostic runtime URL resolution
 * - Exclude any UI components or specific entity business logic
 */

import { AssetReference, StorageDownloadResult, UploadAssetParams } from "../../types/assets";
import { StorageProvider } from "./StorageProvider";
import {
  buildCanonicalStoragePath,
  generateAssetId,
  parseCanonicalStoragePath,
  validateUploadParams,
} from "./validation";
import { AssetError, AssetValidationError } from "./errors";

export class AssetService {
  private provider: StorageProvider;

  /**
   * @param provider StorageProvider instance injected from composition root.
   */
  constructor(provider: StorageProvider) {
    if (!provider) {
      throw new Error("AssetService requires a valid StorageProvider instance.");
    }
    this.provider = provider;
  }

  /**
   * Returns current storage provider name.
   */
  getProviderName(): string {
    return this.provider.providerName;
  }

  /**
   * Validates parameters and uploads a binary asset to storage.
   * Returns a minimal canonical AssetReference upon success.
   * 
   * GUARANTEE: If the upload operation fails, no false AssetReference is returned.
   */
  async uploadAsset(params: UploadAssetParams): Promise<AssetReference> {
    // 1. Validate inputs (MIME type, size limit [PROPOSED], ID format, binary validity)
    const { sizeBytes: calculatedSize } = validateUploadParams(params);

    // 2. Generate opaque, unique asset identifier
    const assetId = params.customAssetId || generateAssetId(params.assetType.substring(0, 3));

    // 3. Build canonical path: /users/{userId}/novels/{novelId}/assets/{assetType}/{assetId}
    const storagePath = buildCanonicalStoragePath(
      params.ownerId,
      params.novelId,
      params.assetType,
      assetId
    );

    // 4. Delegate upload to the agnostic StorageProvider
    const uploadResult = await this.provider.upload(
      storagePath,
      params.data,
      params.mimeType.trim().toLowerCase()
    );

    // 5. Construct canonical AssetReference
    const assetRef: AssetReference = {
      id: assetId,
      novelId: params.novelId,
      ownerId: params.ownerId,
      assetType: params.assetType,
      storagePath,
      mimeType: uploadResult.mimeType || params.mimeType,
      sizeBytes: uploadResult.sizeBytes > 0 ? uploadResult.sizeBytes : calculatedSize,
      createdAt: new Date().toISOString(),
    };

    if (params.originalName) {
      assetRef.originalName = params.originalName;
    }

    return assetRef;
  }

  /**
   * Downloads raw binary data from storage given a canonical path.
   */
  async downloadAsset(storagePath: string): Promise<StorageDownloadResult> {
    this.validatePath(storagePath);
    return await this.provider.download(storagePath);
  }

  /**
   * Deletes a binary asset from storage given its canonical path.
   */
  async deleteAsset(storagePath: string): Promise<void> {
    this.validatePath(storagePath);
    await this.provider.delete(storagePath);
  }

  /**
   * Checks whether an asset exists in storage at the given canonical path.
   */
  async assetExists(storagePath: string): Promise<boolean> {
    this.validatePath(storagePath);
    return await this.provider.exists(storagePath);
  }

  /**
   * Dynamically resolves an accessible URL for the asset.
   * NOTE: The returned URL is transient and MUST NOT be permanently stored
   * as a primary persistence key in Firestore.
   */
  async resolveAssetUrl(storagePath: string): Promise<string> {
    this.validatePath(storagePath);
    if (!this.provider.resolveUrl) {
      throw new AssetError(
        `El proveedor '${this.provider.providerName}' no soporta resolución dinámica de URLs.`,
        "URL_RESOLUTION_NOT_SUPPORTED"
      );
    }
    return await this.provider.resolveUrl(storagePath);
  }

  /**
   * Helper to validate that a path adheres to the canonical storage pattern.
   */
  private validatePath(storagePath: string): void {
    if (!storagePath || typeof storagePath !== "string") {
      throw new AssetValidationError("Ruta de almacenamiento inválida o vacía.");
    }
    const parsed = parseCanonicalStoragePath(storagePath);
    if (!parsed) {
      throw new AssetValidationError(
        `La ruta '${storagePath}' no cumple la convención canónica: users/{userId}/novels/{novelId}/assets/{assetType}/{assetId}`
      );
    }
  }
}
