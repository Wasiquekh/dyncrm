// imageCompression.ts
export async function compressIfImage(
  file: File,
  opts?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number; // 0–1
    mimeType?: "image/jpeg" | "image/webp";
    compressIfLargerThanBytes?: number; // only compress if file is larger than this
  }
): Promise<File> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.7,
    mimeType = "image/jpeg",
    compressIfLargerThanBytes = 400 * 1024, // 400 KB
  } = opts || {};

  if (!file.type.startsWith("image/")) return file; // not an image → skip

  // If small already, skip compression
  if (file.size <= compressIfLargerThanBytes) return file;

  // Try decoding
  const imgUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(imgUrl);
    const { width, height } = getScaledSize(
      img.naturalWidth,
      img.naturalHeight,
      maxWidth,
      maxHeight
    );

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    // Draw scaled
    ctx.drawImage(img, 0, 0, width, height);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, mimeType, quality)
    );

    if (!blob) return file;

    // If somehow bigger than original, keep original
    if (blob.size >= file.size) return file;

    // Create a new File with similar name + extension
    const newExt = mimeType === "image/webp" ? "webp" : "jpg";
    const newName = replaceExt(file.name, newExt);

    return new File([blob], newName, {
      type: mimeType,
      lastModified: Date.now(),
    });
  } catch {
    // Fallback to original on any decode error (e.g., HEIC on unsupported browsers)
    return file;
  } finally {
    URL.revokeObjectURL(imgUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function getScaledSize(
  w: number,
  h: number,
  maxW: number,
  maxH: number
): { width: number; height: number } {
  const ratio = Math.min(maxW / w, maxH / h, 1);
  return { width: Math.round(w * ratio), height: Math.round(h * ratio) };
}

function replaceExt(name: string, newExtWithoutDot: string) {
  const idx = name.lastIndexOf(".");
  return idx === -1
    ? `${name}.${newExtWithoutDot}`
    : `${name.slice(0, idx)}.${newExtWithoutDot}`;
}
