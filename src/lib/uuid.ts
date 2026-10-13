export type UuidVersion = 4 | 7;

export interface UuidFormat {
  uppercase?: boolean;
  hyphens?: boolean;
}

export function generateUuid(version: UuidVersion = 4, format: UuidFormat = {}): string {
  const raw = version === 7 ? uuidV7() : crypto.randomUUID();
  return applyFormat(raw, format);
}

export function generateUuids(count: number, version: UuidVersion, format: UuidFormat): string[] {
  return Array.from({ length: count }, () => generateUuid(version, format));
}

function applyFormat(uuid: string, { uppercase = false, hyphens = true }: UuidFormat): string {
  let out = hyphens ? uuid : uuid.replaceAll("-", "");
  if (uppercase) out = out.toUpperCase();
  return out;
}

/** RFC 9562 UUIDv7: 48-bit Unix ms timestamp followed by random bits — sortable by creation time. */
function uuidV7(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let ms = Date.now();
  for (let i = 5; i >= 0; i--) {
    bytes[i] = ms & 0xff;
    ms = Math.floor(ms / 256);
  }
  bytes[6] = (bytes[6]! & 0x0f) | 0x70;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export interface DecodedUuid {
  canonical: string;
  version: number;
  versionLabel: string;
  variant: string;
  integer: string;
  timestamp?: Date;
  clockSequence?: number;
  node?: string;
}

const VERSION_LABELS: Record<number, string> = {
  1: "Time-based (Gregorian)",
  2: "DCE Security",
  3: "Name-based (MD5)",
  4: "Random",
  5: "Name-based (SHA-1)",
  6: "Reordered time-based",
  7: "Unix epoch time-based",
  8: "Custom",
};

// 100-ns intervals between the Gregorian epoch (1582-10-15) and the Unix epoch.
const GREGORIAN_OFFSET = 122_192_928_000_000_000n;

export function decodeUuid(input: string): DecodedUuid {
  const hex = input
    .trim()
    .toLowerCase()
    .replace(/^urn:uuid:/, "")
    .replace(/^\{|\}$/g, "")
    .replaceAll("-", "");

  if (!/^[0-9a-f]{32}$/.test(hex)) {
    throw new Error("Not a valid UUID — expected 32 hexadecimal digits");
  }

  const canonical = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  const integer = BigInt(`0x${hex}`).toString();

  if (/^0+$/.test(hex)) {
    return { canonical, version: 0, versionLabel: "Nil UUID", variant: "—", integer };
  }
  if (/^f+$/.test(hex)) {
    return { canonical, version: 15, versionLabel: "Max UUID", variant: "—", integer };
  }

  const version = parseInt(hex[12]!, 16);
  const result: DecodedUuid = {
    canonical,
    version,
    versionLabel: VERSION_LABELS[version] ?? "Unknown",
    variant: variantOf(parseInt(hex[16]!, 16)),
    integer,
  };

  if (version === 1 || version === 6) {
    const ticks =
      version === 1
        ? BigInt(`0x${hex.slice(13, 16)}${hex.slice(8, 12)}${hex.slice(0, 8)}`)
        : BigInt(`0x${hex.slice(0, 12)}${hex.slice(13, 16)}`);
    result.timestamp = new Date(Number((ticks - GREGORIAN_OFFSET) / 10_000n));
    result.clockSequence = parseInt(hex.slice(16, 20), 16) & 0x3fff;
    result.node = hex.slice(20).match(/../g)!.join(":");
  } else if (version === 7) {
    result.timestamp = new Date(parseInt(hex.slice(0, 12), 16));
  }

  return result;
}

function variantOf(nibble: number): string {
  if ((nibble & 0b1000) === 0) return "NCS (reserved)";
  if ((nibble & 0b0100) === 0) return "RFC 9562 / DCE 1.1";
  if ((nibble & 0b0010) === 0) return "Microsoft (reserved)";
  return "Future (reserved)";
}
