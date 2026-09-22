/**
 * Novelore — In-Memory Storage Provider (Mock / Offline Test Provider)
 * Phase 2.3.1: Core Infrastructure
 * 
 * Implements StorageProvider contract completely in memory without Firebase.
 * Demonstrates architectural decoupling from Firebase Storage SDK.
 */

import { StorageDownloadResult, StorageUploadResult } from "../../types/assets";
import { StorageProvider } from "./StorageProvider";
import { AssetNotFoundError, AssetValidationError } from "./errors";

export class InMemoryStorageProvider implements StorageProvider {
  readonly providerName: string = "in-memory";
  private store: Map<string, { data: Uint8Array; mimeType: string; sizeBytes: number }> = new Map();

  async upload(
    path: string,
    data: Blob | Uint8Array | ArrayBuffer,
    mimeType: string
  ): Promise<StorageUploadResult> {
    if (!path) {
      throw new AssetValidationError("Ruta no especificada.");
    }

    let bytes: Uint8Array;
    if (typeof Blob !== "undefined" && data instanceof Blob) {
      const arrayBuffer = await data.arrayBuffer();
      bytes = new Uint8Array(arrayBuffer);
    } else if (data instanceof Uint8Array) {
      bytes = data;
    } else if (data instanceof ArrayBuffer) {
      bytes = new Uint8Array(data);
    } else {
      throw new AssetValidationError("Formato binario no soportado.");
    }

    this.store.set(path, {
      data: bytes,
      mimeType,
      sizeBytes: bytes.byteLength,
    });

    return {
      storagePath: path,
      sizeBytes: bytes.byteLength,
      mimeType,
    };
  }

  async download(path: string): Promise<StorageDownloadResult> {
    const entry = this.store.get(path);
    if (!entry) {
      throw new AssetNotFoundError(`Asset no encontrado en memoria: ${path}`);
    }

    const blob = new Blob([entry.data], { type: entry.mimeType });
    return {
      data: blob,
      mimeType: entry.mimeType,
      sizeBytes: entry.sizeBytes,
    };
  }

  async delete(path: string): Promise<void> {
    if (!this.store.has(path)) {
      throw new AssetNotFoundError(`Asset no encontrado para eliminar: ${path}`);
    }
    this.store.delete(path);
  }

  async exists(path: string): Promise<boolean> {
    return this.store.has(path);
  }

  async resolveUrl(path: string): Promise<string> {
    if (!this.store.has(path)) {
      throw new AssetNotFoundError(`Asset no encontrado para resolver URL: ${path}`);
    }
    return `memory://${path}`;
  }

  /**
   * Helper for tests: count items in memory
   */
  count(): number {
    return this.store.size;
  }

  /**
   * Helper for tests: clear memory
   */
  clear(): void {
    this.store.clear();
  }
}
