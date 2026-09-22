/**
 * Novelore — Asset and Storage Error Hierarchy
 * Phase 2.3.1: Core Infrastructure
 * 
 * Provides domain-specific, provider-agnostic error classes for asset operations.
 * Isolates UI and domain layers from vendor-specific error payloads.
 */

export class AssetError extends Error {
  readonly code: string;
  readonly details?: Record<string, unknown>;

  constructor(message: string, code: string = "ASSET_ERROR", details?: Record<string, unknown>) {
    super(message);
    this.name = "AssetError";
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AssetValidationError extends AssetError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "ASSET_VALIDATION_ERROR", details);
    this.name = "AssetValidationError";
  }
}

export class AssetAuthenticationError extends AssetError {
  constructor(message: string = "Operación no autorizada: el usuario no está autenticado.", details?: Record<string, unknown>) {
    super(message, "ASSET_UNAUTHENTICATED", details);
    this.name = "AssetAuthenticationError";
  }
}

export class AssetPermissionError extends AssetError {
  constructor(message: string = "Permiso denegado para el recurso solicitado.", details?: Record<string, unknown>) {
    super(message, "ASSET_PERMISSION_DENIED", details);
    this.name = "AssetPermissionError";
  }
}

export class AssetNotFoundError extends AssetError {
  constructor(message: string = "El asset solicitado no existe.", details?: Record<string, unknown>) {
    super(message, "ASSET_NOT_FOUND", details);
    this.name = "AssetNotFoundError";
  }
}

export class AssetUploadError extends AssetError {
  constructor(message: string = "Error al subir el asset a almacenamiento.", details?: Record<string, unknown>) {
    super(message, "ASSET_UPLOAD_FAILED", details);
    this.name = "AssetUploadError";
  }
}

export class AssetDownloadError extends AssetError {
  constructor(message: string = "Error al descargar el asset desde almacenamiento.", details?: Record<string, unknown>) {
    super(message, "ASSET_DOWNLOAD_FAILED", details);
    this.name = "AssetDownloadError";
  }
}

export class AssetDeleteError extends AssetError {
  constructor(message: string = "Error al eliminar el asset en almacenamiento.", details?: Record<string, unknown>) {
    super(message, "ASSET_DELETE_FAILED", details);
    this.name = "AssetDeleteError";
  }
}

export class AssetNetworkError extends AssetError {
  constructor(message: string = "Error de conexión o tiempo de espera agotado.", details?: Record<string, unknown>) {
    super(message, "ASSET_NETWORK_ERROR", details);
    this.name = "AssetNetworkError";
  }
}

/**
 * Normalizes vendor-specific errors (e.g. Firebase Storage errors) into
 * Novelore's standardized domain error hierarchy.
 */
export function normalizeStorageError(
  error: unknown,
  context: { operation: string; storagePath?: string }
): AssetError {
  if (error instanceof AssetError) {
    return error;
  }

  const rawMessage = error instanceof Error ? error.message : String(error);
  const rawCode = (error && typeof error === "object" && "code" in error && typeof (error as any).code === "string")
    ? (error as any).code
    : "";

  const details = {
    originalError: rawMessage,
    originalCode: rawCode,
    operation: context.operation,
    storagePath: context.storagePath,
  };

  // Firebase Storage specific error codes
  if (rawCode === "storage/unauthorized" || rawCode === "permission-denied") {
    return new AssetPermissionError(
      `Permisos insuficientes para ${context.operation} en ${context.storagePath || "el asset"}.`,
      details
    );
  }

  if (rawCode === "storage/unauthenticated") {
    return new AssetAuthenticationError(
      `Usuario no autenticado al intentar ${context.operation}.`,
      details
    );
  }

  if (rawCode === "storage/object-not-found" || rawCode === "not-found") {
    return new AssetNotFoundError(
      `Asset no encontrado en la ruta: ${context.storagePath || "desconocida"}.`,
      details
    );
  }

  if (rawCode === "storage/retry-limit-exceeded" || rawCode === "storage/canceled" || rawCode.includes("network")) {
    return new AssetNetworkError(
      `Fallo de conexión o límite de reintentos excedido al ${context.operation}.`,
      details
    );
  }

  if (rawCode === "storage/quota-exceeded") {
    return new AssetUploadError(
      `Cuota de almacenamiento excedida al ${context.operation}.`,
      details
    );
  }

  if (rawCode === "storage/invalid-argument" || rawCode === "storage/invalid-format") {
    return new AssetValidationError(
      `Argumento o formato de asset inválido para ${context.operation}: ${rawMessage}`,
      details
    );
  }

  // Fallback by operation type
  if (context.operation === "upload") {
    return new AssetUploadError(`Error durante la subida del asset: ${rawMessage}`, details);
  }
  if (context.operation === "download") {
    return new AssetDownloadError(`Error durante la descarga del asset: ${rawMessage}`, details);
  }
  if (context.operation === "delete") {
    return new AssetDeleteError(`Error durante la eliminación del asset: ${rawMessage}`, details);
  }

  return new AssetError(`Error de almacenamiento (${context.operation}): ${rawMessage}`, "ASSET_UNKNOWN_ERROR", details);
}
