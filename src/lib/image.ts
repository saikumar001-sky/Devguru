export type OutputFormat = "image/jpeg" | "image/webp" | "image/png";

export interface CompressOptions {
  /** 0–1, ignored for PNG. */
  quality: number;
  /** 0–1 multiplier applied to both dimensions. */
  scale: number;
  format: OutputFormat;
}

export interface CompressResult {
  blob: Blob;
  width: number;
  height: number;
}

export async function compressImage(
  source: ImageBitmap,
  { quality, scale, format }: CompressOptions,
): Promise<CompressResult> {
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context is not available");

  if (format === "image/jpeg") {
    // JPEG has no alpha channel — paint white instead of letting transparency turn black.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, format, quality));
  if (!blob) throw new Error("The browser could not encode this image");
  return { blob, width, height };
}

export function extensionFor(format: OutputFormat): string {
  return { "image/jpeg": "jpg", "image/webp": "webp", "image/png": "png" }[format];
}
