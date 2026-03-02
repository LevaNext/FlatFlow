/**
 * Shared helpers for fill logic (e.g. photo upload). Used by site-specific fill modules.
 */

/**
 * Convert a data URL to a File for use in file inputs or drag-and-drop.
 */
export function dataUrlToFile(dataUrl: string, index: number): File {
  const [header, base64] = dataUrl.split(",");
  const mimeMatch = /:(.*?);/.exec(header ?? "");
  const mime = mimeMatch?.[1] ?? "image/webp";
  const bin = atob(base64 ?? "");
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++)
    arr[i] = (bin.codePointAt(i) ?? 0) & 0xff;
  let ext = "webp";
  if (mime.includes("png")) ext = "png";
  else if (mime.includes("jpeg") || mime.includes("jpg")) ext = "jpg";
  return new File([arr], `image-${index}.${ext}`, { type: mime });
}
