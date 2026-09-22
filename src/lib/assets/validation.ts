/**
 * Novelore — Asset Validation and Path Utilities
 * Phase 2.3.1: Core Infrastructure
 * 
 * Enforces canonical path conventions, validates MIME types, size thresholds,
 * and identifier safety.
 */

import { AssetType, UploadAssetParams } from "../../types/assets";
import { AssetValidationError } from "./errors";

/**
 * Canonical path pattern:
 * /users/{userId}/novels/{novelId}/assets/{assetType}/{assetId}
 */
export const CANONICAL_PATH_REGEX =
  /^\/?users\/([a-zA-Z0-9_\-]+)\/novels\/([a-zA-Z0-9_\-]+)\/assets\/(cover|entity_avatar|entity_gallery|board_image|board_document|custom_font)\/([a-zA-Z0-9_\-]+)$/;

export const VALID_ASSET_TYPES: readonly AssetType[] = [
  "cover",
  "entity_avatar",
  "entity_gallery",
  "board_image",
  "board_document",
  "custom_font",
] as const;

/**
 * Supported MIME types per asset category in Novelore.
 */
export const ALLOWED_MIME_TYPES: Record<AssetType, readonly string[]> = {
  cover: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"],
  entity_avatar: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"],
  entity_gallery: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"],
  board_image: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"],
  board_document: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/markdown",
  ],
  custom_font: [
    "font/ttf",
    "font/otf",
    "font/woff",
    "font/woff2",
    "application/x-font-ttf",
    "application/x-font-otf",
    "application/font-woff",
    "application/font-woff2",
    "font/opentype",
  ],
} as const;

/**
 * Proposed Product Size Limits [PROPOSED].
 * NOTE: These are product-level boundary decisions to protect user bandwidth and avoid
 * runaway storage usage. They are NOT infrastructure limits of Firebase Storage.
 */
export const PROPOSED_MAX_SIZES: Record<AssetType, number> = {
  cover: 5 * 1024 * 1024,          // 5 MB [PROPOSED]
  entity_avatar: 5 * 1024 * 1024,  // 5 MB [PROPOSED]
  entity_gallery: 10 * 1024 * 1024,// 10 MB [PROPOSED]
  board_image: 10 * 1024 * 1024,   // 10 MB [PROPOSED]
  board_document: 25 * 1024 * 1024,// 25 MB [PROPOSED]
  custom_font: 5 * 1024 * 1024,    // 5 MB [PROPOSED]
};

/**
 * Validates a safe entity or resource identifier.
 */
export function isValidIdentifier(id: string): boolean {
  if (typeof id !== "string") return false;
  const trimmed = id.trim();
  return trimmed.length > 0 && trimmed.length <= 128 && /^[a-zA-Z0-9_\-]+$/.test(trimmed);
}

/**
 * Generates an opaque, collision-resistant asset identifier.
 */
export function generateAssetId(prefix: string = "ast"): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID().replace(/-/g, "").substring(0, 16)}`;
  }
  const rand = Math.random().toString(36).substring(2, 10);
  const time = Date.now().toString(36);
  return `${prefix}_${time}_${rand}`;
}

/**
 * Builds the canonical storage path for an asset.
 * Guaranteed format: users/{userId}/novels/{novelId}/assets/{assetType}/{assetId}
 */
export function buildCanonicalStoragePath(
  userId: string,
  novelId: string,
  assetType: AssetType,
  assetId: string
): string {
  if (!isValidIdentifier(userId)) {
    throw new AssetValidationError(`Identificador de usuario inválido: '${userId}'`);
  }
  if (!isValidIdentifier(novelId)) {
    throw new AssetValidationError(`Identificador de novela inválido: '${novelId}'`);
  }
  if (!VALID_ASSET_TYPES.includes(assetType)) {
    throw new AssetValidationError(`Tipo de asset no soportado: '${assetType}'`);
  }
  if (!isValidIdentifier(assetId)) {
    throw new AssetValidationError(`Identificador de asset inválido: '${assetId}'`);
  }

  return `users/${userId}/novels/${novelId}/assets/${assetType}/${assetId}`;
}

/**
 * Parses and validates a canonical storage path.
 */
export function parseCanonicalStoragePath(path: string): {
  userId: string;
  novelId: string;
  assetType: AssetType;
  assetId: string;
} | null {
  const match = path.match(CANONICAL_PATH_REGEX);
  if (!match) return null;
  return {
    userId: match[1],
    novelId: match[2],
    assetType: match[3] as AssetType,
    assetId: match[4],
  };
}

/**
 * Validates upload parameters before calling storage provider.
 */
export function validateUploadParams(params: UploadAssetParams): { sizeBytes: number } {
  if (!params) {
    throw new AssetValidationError("Parámetros de subida requeridos.");
  }

  if (!isValidIdentifier(params.ownerId)) {
    throw new AssetValidationError(`Identificador de propietario inválido: '${params.ownerId}'`);
  }

  if (!isValidIdentifier(params.novelId)) {
    throw new AssetValidationError(`Identificador de novela inválido: '${params.novelId}'`);
  }

  if (!VALID_ASSET_TYPES.includes(params.assetType)) {
    throw new AssetValidationError(`Tipo de asset no reconocido: '${params.assetType}'`);
  }

  if (params.customAssetId && !isValidIdentifier(params.customAssetId)) {
    throw new AssetValidationError(`Identificador de asset personalizado inválido: '${params.customAssetId}'`);
  }

  if (!params.data) {
    throw new AssetValidationError("El contenido binario (data) es obligatorio.");
  }

  // Calculate binary size
  let sizeBytes = 0;
  if (typeof Blob !== "undefined" && params.data instanceof Blob) {
    sizeBytes = params.data.size;
  } else if (params.data instanceof Uint8Array) {
    sizeBytes = params.data.byteLength;
  } else if (params.data instanceof ArrayBuffer) {
    sizeBytes = params.data.byteLength;
  } else {
    throw new AssetValidationError("El formato binario no es Blob, Uint8Array ni ArrayBuffer.");
  }

  if (sizeBytes === 0) {
    throw new AssetValidationError("El archivo o contenido binario está vacío (0 bytes).");
  }

  // Validate proposed product size limit
  const maxAllowedSize = PROPOSED_MAX_SIZES[params.assetType];
  if (maxAllowedSize && sizeBytes > maxAllowedSize) {
    const sizeMb = (sizeBytes / (1024 * 1024)).toFixed(2);
    const maxMb = (maxAllowedSize / (1024 * 1024)).toFixed(0);
    throw new AssetValidationError(
      `El asset excede el límite propuesto de producto [PROPOSED] para '${params.assetType}': ${sizeMb} MB (máximo ${maxMb} MB).`
    );
  }

  // Validate MIME type
  const normalizedMime = (params.mimeType || "").trim().toLowerCase();
  if (!normalizedMime) {
    throw new AssetValidationError("El tipo MIME es obligatorio.");
  }

  const allowedForType = ALLOWED_MIME_TYPES[params.assetType];
  if (!allowedForType.includes(normalizedMime)) {
    throw new AssetValidationError(
      `Tipo MIME '${normalizedMime}' no permitido para el assetType '${params.assetType}'. Permitidos: ${allowedForType.join(", ")}`
    );
  }

  return { sizeBytes };
}
