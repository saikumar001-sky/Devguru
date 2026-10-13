import { md5, sha1 } from "@noble/hashes/legacy.js";
import { sha256, sha384, sha512 } from "@noble/hashes/sha2.js";
import { sha3_256 } from "@noble/hashes/sha3.js";
import { hmac } from "@noble/hashes/hmac.js";
import { bytesToHex } from "@noble/hashes/utils.js";
import { bytesToBase64 } from "./base64";

export const HASH_ALGORITHMS = [
  { id: "md5", label: "MD5", fn: md5, weak: true },
  { id: "sha1", label: "SHA-1", fn: sha1, weak: true },
  { id: "sha256", label: "SHA-256", fn: sha256, weak: false },
  { id: "sha384", label: "SHA-384", fn: sha384, weak: false },
  { id: "sha512", label: "SHA-512", fn: sha512, weak: false },
  { id: "sha3_256", label: "SHA3-256", fn: sha3_256, weak: false },
] as const;

export type HashAlgorithm = (typeof HASH_ALGORITHMS)[number];
export type HashId = HashAlgorithm["id"];
export type DigestEncoding = "hex" | "HEX" | "base64";

function createHasher(algorithm: HashAlgorithm, key?: Uint8Array) {
  return key ? hmac.create(algorithm.fn, key) : algorithm.fn.create();
}

export function hashBytes(data: Uint8Array, key?: Uint8Array): Record<HashId, Uint8Array> {
  return Object.fromEntries(
    HASH_ALGORITHMS.map((alg) => [alg.id, createHasher(alg, key).update(data).digest()]),
  ) as Record<HashId, Uint8Array>;
}

/** Streams a file through every algorithm at once so large files never sit fully in memory. */
export async function hashFile(
  file: Blob,
  key: Uint8Array | undefined,
  onProgress: (fraction: number) => void,
): Promise<Record<HashId, Uint8Array>> {
  const hashers = HASH_ALGORITHMS.map((alg) => [alg.id, createHasher(alg, key)] as const);
  const reader = file.stream().getReader();
  let read = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const [, hasher] of hashers) hasher.update(value);
    read += value.length;
    onProgress(file.size ? read / file.size : 1);
    // Yield so the progress bar can repaint between chunks.
    await new Promise((resolve) => setTimeout(resolve));
  }
  return Object.fromEntries(hashers.map(([id, h]) => [id, h.digest()])) as Record<HashId, Uint8Array>;
}

export function encodeDigest(digest: Uint8Array, encoding: DigestEncoding): string {
  if (encoding === "base64") return bytesToBase64(digest);
  const hex = bytesToHex(digest);
  return encoding === "HEX" ? hex.toUpperCase() : hex;
}
