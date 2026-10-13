import { base64ToBytes } from "./base64";

export interface TimeClaim {
  key: string;
  label: string;
  date: Date;
}

export interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  timeClaims: TimeClaim[];
  expired: boolean;
  notYetValid: boolean;
}

const TIME_CLAIMS: Record<string, string> = {
  iat: "Issued at",
  nbf: "Not before",
  exp: "Expires",
  auth_time: "Authenticated at",
};

function decodeSegment(segment: string, name: string): Record<string, unknown> {
  try {
    const json = new TextDecoder().decode(base64ToBytes(segment));
    const value: unknown = JSON.parse(json);
    if (typeof value !== "object" || value === null) throw new Error();
    return value as Record<string, unknown>;
  } catch {
    throw new Error(`The ${name} segment is not valid Base64URL-encoded JSON`);
  }
}

export function decodeJwt(token: string, now = Date.now()): DecodedJwt {
  const parts = token.trim().replace(/^Bearer\s+/i, "").split(".");
  if (parts.length !== 3) {
    throw new Error(`A JWT has 3 dot-separated parts — this has ${parts.length}`);
  }
  const [rawHeader, rawPayload, signature] = parts as [string, string, string];
  const header = decodeSegment(rawHeader, "header");
  const payload = decodeSegment(rawPayload, "payload");

  const timeClaims = Object.entries(TIME_CLAIMS)
    .filter(([key]) => typeof payload[key] === "number")
    .map(([key, label]) => ({ key, label, date: new Date((payload[key] as number) * 1000) }));

  const exp = typeof payload.exp === "number" ? payload.exp * 1000 : undefined;
  const nbf = typeof payload.nbf === "number" ? payload.nbf * 1000 : undefined;

  return {
    header,
    payload,
    signature,
    timeClaims,
    expired: exp !== undefined && exp < now,
    notYetValid: nbf !== undefined && nbf > now,
  };
}
