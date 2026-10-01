/**
 * Utility to downscale and optimize images client-side before storing in localStorage / Firestore
 */
export function compressImage(
  dataUrl: string,
  maxWidth = 720,
  maxHeight = 720,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve) => {
    // If it's already a web URL or SVG, no need to compress
    if (!dataUrl || !dataUrl.startsWith("data:image/") || dataUrl.includes("image/svg+xml")) {
      resolve(dataUrl);
      return;
    }

    // Safety timeout prevents hangs on malformed images
    const timeout = setTimeout(() => {
      resolve(dataUrl);
    }, 2500);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      clearTimeout(timeout);
      let width = img.width;
      let height = img.height;

      // If already small in dimension and byte size, keep as is
      if (width <= maxWidth && height <= maxHeight && dataUrl.length < 50000) {
        resolve(dataUrl);
        return;
      }

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      try {
        const compressed = canvas.toDataURL("image/webp", quality);
        // If webp is smaller, use it; otherwise fallback to jpeg
        if (compressed && compressed.length < dataUrl.length) {
          resolve(compressed);
        } else {
          const jpeg = canvas.toDataURL("image/jpeg", quality);
          resolve(jpeg && jpeg.length < dataUrl.length ? jpeg : dataUrl);
        }
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => {
      clearTimeout(timeout);
      resolve(dataUrl);
    };
    img.src = dataUrl;
  });
}


/**
 * Resuelve una ruta de asset física ('assets/gallery/...', 'assets/covers/...')
 * a una URL accesible por el motor de renderizado de Electron o el navegador.
 */
export function resolveAssetUrl(urlOrPath?: string, projectPath?: string): string {
  if (!urlOrPath) return "";
  const trimmed = urlOrPath.trim();
  if (
    trimmed.startsWith("data:") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  const cleanRel = trimmed.replace(/^\/+/, "");

  // Si estamos en entorno Electron, utilizar el protocolo nativo novelore-asset://
  if (typeof window !== "undefined" && window.electronAPI?.isElectron) {
    const effectiveProjectPath =
      projectPath ||
      (typeof window !== "undefined" ? (window as any).__novelore_current_project_path : undefined);

    if (effectiveProjectPath) {
      return `novelore-asset://project-asset?projectPath=${encodeURIComponent(
        effectiveProjectPath
      )}&relPath=${encodeURIComponent(cleanRel)}`;
    }
    return `novelore-asset://${cleanRel}`;
  }

  return cleanRel;
}

/**
 * Guarda físicamente una imagen en el almacenamiento local del proyecto (assets/gallery/ o assets/covers/).
 * Si está en modo web sin Electron, retorna el Base64 comprimido como fallback.
 */
export async function saveLocalImage(
  fileOrBase64: File | Blob | string,
  subfolder: "gallery" | "covers" | "fonts" | "documents",
  options?: { fileName?: string; projectPath?: string; compress?: boolean }
): Promise<{ success: boolean; relativePath: string; error?: string }> {
  try {
    let base64Data = "";
    let originalName = options?.fileName;

    if (typeof fileOrBase64 === "string") {
      // Si ya es una ruta relativa en assets, no es necesario re-guardarla
      if (fileOrBase64.startsWith("assets/")) {
        return { success: true, relativePath: fileOrBase64 };
      }
      base64Data = fileOrBase64;
    } else {
      if (fileOrBase64 instanceof File && !originalName) {
        originalName = fileOrBase64.name;
      }
      base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(fileOrBase64);
      });
    }

    // Optimización ligera previa al guardado
    if (options?.compress !== false && base64Data.startsWith("data:image/")) {
      const maxDim = subfolder === "covers" ? 1400 : 1600;
      base64Data = await compressImage(base64Data, maxDim, maxDim, 0.88);
    }

    // En Electron: guardar físicamente a través de IPC
    if (typeof window !== "undefined" && window.electronAPI?.saveAssetImage) {
      const res = await window.electronAPI.saveAssetImage({
        subfolder,
        fileName: originalName,
        bufferBase64: base64Data,
        projectPath: options?.projectPath,
      });

      if (res.success && res.relativePath) {
        return { success: true, relativePath: res.relativePath };
      }
      return { success: false, relativePath: "", error: res.error || "Error al guardar asset físico." };
    }

    // Fallback web / pruebas sin Electron: retornar dataUrl directamente
    return { success: true, relativePath: base64Data };
  } catch (err: any) {
    console.error("Error en saveLocalImage:", err);
    return { success: false, relativePath: "", error: err.message };
  }
}

/**
 * Elimina físicamente un asset multimedia del disco local
 */
export async function deleteLocalImage(
  relativePath: string,
  projectPath?: string
): Promise<{ success: boolean; error?: string }> {
  if (!relativePath || typeof window === "undefined" || !window.electronAPI?.deleteAssetImage) {
    return { success: true };
  }
  return await window.electronAPI.deleteAssetImage(relativePath, projectPath);
}

