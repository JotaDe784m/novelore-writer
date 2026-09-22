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
 * Optimizes a base64 data URL if it exceeds the specified size threshold.
 */
export async function compressDataUrlIfLarge(
  dataUrl: string,
  thresholdBytes = 45000,
  maxDimension = 640,
  quality = 0.65
): Promise<string> {
  if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
    return dataUrl;
  }
  if (dataUrl.length <= thresholdBytes) {
    return dataUrl;
  }
  try {
    return await compressImage(dataUrl, maxDimension, maxDimension, quality);
  } catch {
    return dataUrl;
  }
}
