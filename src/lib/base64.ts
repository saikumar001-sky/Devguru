function bytesToBinary(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return binary;
}

export function bytesToBase64(bytes: Uint8Array): string {
  return btoa(bytesToBinary(bytes));
}

export function encodeBase64(text: string, urlSafe = false): string {
  const encoded = btoa(bytesToBinary(new TextEncoder().encode(text)));
  return urlSafe ? toUrlSafe(encoded) : encoded;
}

export function toUrlSafe(base64: string): string {
  return base64.replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

/** Decodes standard or URL-safe Base64 (padding optional) into raw bytes. */
export function base64ToBytes(input: string): Uint8Array {
  let normalized = input.replace(/\s+/g, "").replaceAll("-", "+").replaceAll("_", "/");
  normalized += "=".repeat((4 - (normalized.length % 4)) % 4);
  let binary: string;
  try {
    binary = atob(normalized);
  } catch {
    throw new Error("Input is not valid Base64");
  }
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

export function decodeBase64(input: string): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(base64ToBytes(input));
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Decoded bytes are not valid UTF-8 text (is this binary data?)");
    }
    throw error;
  }
}

const SIGNATURES: [prefix: string, mime: string][] = [
  ["iVBORw0KGgo", "image/png"],
  ["/9j/", "image/jpeg"],
  ["R0lGOD", "image/gif"],
  ["UklGR", "image/webp"],
  ["PHN2Zy", "image/svg+xml"],
  ["PD94bW", "image/svg+xml"],
  ["Qk", "image/bmp"],
  ["AAABAA", "image/x-icon"],
];

/** Turns a data URL or bare Base64 string into a displayable image data URL. */
export function toImageDataUrl(input: string): string {
  const trimmed = input.trim();
  if (trimmed.startsWith("data:image/")) return trimmed;
  const clean = trimmed.replace(/\s+/g, "");
  const mime = SIGNATURES.find(([prefix]) => clean.startsWith(prefix))?.[1];
  if (!mime) throw new Error("Could not detect an image format in this Base64 data");
  return `data:${mime};base64,${clean}`;
}
