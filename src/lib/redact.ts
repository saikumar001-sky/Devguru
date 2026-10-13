export interface RedactionRule {
  id: string;
  label: string;
  /** Short tag used in replacements, e.g. EMAIL. */
  tag: string;
  example: string;
  defaultOn: boolean;
  /** Must use the `g` and `d` flags. A `secret` named group, if present, limits what gets redacted. */
  pattern: RegExp;
  validate?: (match: string) => boolean;
}

function luhn(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = +digits[digits.length - 1 - i]!;
    if (i % 2 === 1) d = d * 2 > 9 ? d * 2 - 9 : d * 2;
    sum += d;
  }
  return sum % 10 === 0;
}

// Verhoeff checksum — every valid Aadhaar number passes it, so it filters out random 12-digit runs.
const VERHOEFF_D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 0, 6, 7, 8, 9, 5], [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7], [4, 0, 1, 2, 3, 9, 5, 6, 7, 8], [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2], [7, 6, 5, 9, 8, 2, 1, 0, 4, 3], [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];
const VERHOEFF_P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 5, 7, 6, 2, 8, 3, 0, 9, 4], [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7], [9, 4, 5, 3, 1, 2, 6, 8, 7, 0], [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5], [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

function verhoeff(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  let c = 0;
  for (let i = 0; i < digits.length; i++) {
    c = VERHOEFF_D[c]![VERHOEFF_P[i % 8]![+digits[digits.length - 1 - i]!]!]!;
  }
  return c === 0;
}

// Order matters: when matches overlap, the rule listed first wins.
export const REDACTION_RULES: RedactionRule[] = [
  {
    id: "private-key",
    label: "Private keys",
    tag: "PRIVATE_KEY",
    example: "-----BEGIN PRIVATE KEY-----",
    defaultOn: true,
    pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/dg,
  },
  {
    id: "jwt",
    label: "JWTs",
    tag: "JWT",
    example: "eyJhbGciOi…",
    defaultOn: true,
    pattern: /\beyJ[\w-]+\.eyJ[\w-]+\.[\w-]*/dg,
  },
  {
    id: "url-credentials",
    label: "URL credentials",
    tag: "CREDENTIALS",
    example: "https://user:pass@host",
    defaultOn: true,
    // The password may itself contain "@", so match up to the last "@" before the host.
    pattern: /[a-z][a-z0-9+.-]*:\/\/(?<secret>[^\s:/@]+:[^\s/]+)@/dgi,
  },
  {
    id: "auth-header",
    label: "Authorization headers",
    tag: "TOKEN",
    example: "Bearer abc123…",
    defaultOn: true,
    pattern: /\b(?:Bearer|Basic|Token)\s+(?<secret>[\w.~+/=-]{8,})/dg,
  },
  {
    id: "cloud-keys",
    label: "API keys (AWS, GitHub, Stripe, Slack, Google…)",
    tag: "API_KEY",
    example: "AKIA…, ghp_…, sk_live_…",
    defaultOn: true,
    pattern:
      /\b(?:(?:AKIA|ASIA)[A-Z0-9]{16}|gh[pousr]_[A-Za-z0-9]{36,}|github_pat_\w{40,}|(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{10,}|xox[abposr]-[A-Za-z0-9-]{10,}|AIza[\w-]{35}|glpat-[\w-]{20,}|sk-(?:proj-|ant-)?[\w-]{20,})\b/dg,
  },
  {
    id: "secret-fields",
    label: "Password / secret fields",
    tag: "SECRET",
    example: 'password=…, "api_key": "…"',
    defaultOn: true,
    pattern:
      /["']?\b(?:password|passwd|pwd|pass|secret|client[_-]?secret|token|access[_-]?token|refresh[_-]?token|api[_-]?key|apikey|access[_-]?key|private[_-]?key|auth)\b["']?\s*[:=]\s*["']?(?<secret>[^\s"',;&}]{3,})/dgi,
  },
  {
    id: "email",
    label: "Email addresses",
    tag: "EMAIL",
    example: "jane@example.com",
    defaultOn: true,
    pattern: /\b[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/dg,
  },
  {
    id: "credit-card",
    label: "Credit card numbers",
    tag: "CARD",
    example: "4111 1111 1111 1111",
    defaultOn: true,
    pattern: /\b\d(?:[ -]?\d){12,18}\b/dg,
    validate: luhn,
  },
  {
    id: "aadhaar",
    label: "Aadhaar numbers",
    tag: "AADHAAR",
    example: "2345 6789 0123",
    defaultOn: true,
    pattern: /\b[2-9]\d{3}[\s-]?\d{4}[\s-]?\d{4}\b/dg,
    validate: verhoeff,
  },
  {
    id: "pan",
    label: "PAN numbers",
    tag: "PAN",
    example: "ABCDE1234F",
    defaultOn: true,
    pattern: /\b[A-Z]{3}[ABCFGHLJPT][A-Z]\d{4}[A-Z]\b/dg,
  },
  {
    id: "ssn",
    label: "US Social Security numbers",
    tag: "SSN",
    example: "123-45-6789",
    defaultOn: true,
    pattern: /\b\d{3}-\d{2}-\d{4}\b/dg,
  },
  {
    id: "phone",
    label: "Phone numbers",
    tag: "PHONE",
    example: "+91 98765 43210",
    defaultOn: true,
    pattern: /(?<![\w+.(])\+?\(?\d[\d \t()-]{8,17}\d(?![\w.])/dg,
    validate: (m) => {
      const digits = m.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 15) return false;
      // Bare digit runs are usually ids/timestamps — only accept them if they look like an Indian mobile.
      return m.startsWith("+") || /[ \t()-]/.test(m) || /^[6-9]\d{9}$/.test(digits);
    },
  },
  {
    id: "ipv4",
    label: "IPv4 addresses",
    tag: "IP",
    example: "192.168.1.10",
    defaultOn: true,
    pattern: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/dg,
  },
  {
    id: "ipv6",
    label: "IPv6 addresses",
    tag: "IP",
    example: "2001:db8::1",
    defaultOn: true,
    pattern: /(?<![\w:])(?:[A-Fa-f0-9]{1,4}:){2,7}[A-Fa-f0-9]{0,4}(?::[A-Fa-f0-9]{1,4}){0,5}(?![\w:])/dg,
    validate: (m) => m.includes("::") || m.split(":").length === 8,
  },
  {
    id: "mac",
    label: "MAC addresses",
    tag: "MAC",
    example: "00:1A:2B:3C:4D:5E",
    defaultOn: false,
    pattern: /\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b/dg,
  },
  {
    id: "uuid",
    label: "UUIDs",
    tag: "UUID",
    example: "5a9bb58b-ded3-…",
    defaultOn: false,
    pattern: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/dgi,
  },
];

export type RedactionStyle = "label" | "mask" | "partial" | "pseudonym";

export interface Segment {
  text: string;
  /** Rule id when this segment is a replacement. */
  ruleId?: string;
  original?: string;
}

export interface RedactionResult {
  output: string;
  segments: Segment[];
  counts: Record<string, number>;
}

interface Hit {
  start: number;
  end: number;
  rule: RedactionRule;
  priority: number;
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function redact(
  text: string,
  enabledIds: ReadonlySet<string>,
  style: RedactionStyle,
  customTerms: string[] = [],
): RedactionResult {
  const rules = REDACTION_RULES.filter((r) => enabledIds.has(r.id));
  const terms = customTerms.map((t) => t.trim()).filter(Boolean);
  if (terms.length) {
    rules.push({
      id: "custom",
      label: "Custom terms",
      tag: "REDACTED",
      example: "",
      defaultOn: true,
      pattern: new RegExp(terms.map(escapeRegExp).join("|"), "dgi"),
    });
  }

  const hits: Hit[] = [];
  rules.forEach((rule, priority) => {
    for (const m of text.matchAll(rule.pattern)) {
      if (rule.validate && !rule.validate(m[0])) continue;
      const span = m.indices?.groups?.secret ?? m.indices![0]!;
      if (span[1] > span[0]) hits.push({ start: span[0], end: span[1], rule, priority });
    }
  });

  // Earliest start wins; on a tie the longer match, then the higher-priority (earlier) rule.
  hits.sort((a, b) => a.start - b.start || b.end - a.end || a.priority - b.priority);

  const segments: Segment[] = [];
  const counts: Record<string, number> = {};
  const pseudonyms = new Map<string, string>();
  const perTag: Record<string, number> = {};
  let cursor = 0;

  for (const hit of hits) {
    if (hit.start < cursor) continue;
    if (hit.start > cursor) segments.push({ text: text.slice(cursor, hit.start) });
    const original = text.slice(hit.start, hit.end);
    segments.push({ text: replacementFor(original, hit.rule.tag), ruleId: hit.rule.id, original });
    counts[hit.rule.id] = (counts[hit.rule.id] ?? 0) + 1;
    cursor = hit.end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) });

  return { output: segments.map((s) => s.text).join(""), segments, counts };

  function replacementFor(original: string, tag: string): string {
    switch (style) {
      case "label":
        return `[${tag}]`;
      case "mask":
        return original.replace(/[^\s\-.:@]/g, "*");
      case "partial":
        return original.length <= 6
          ? "*".repeat(original.length)
          : original.slice(0, -4).replace(/[^\s\-.:@]/g, "*") + original.slice(-4);
      case "pseudonym": {
        const key = `${tag}\u0000${original.toLowerCase()}`;
        if (!pseudonyms.has(key)) {
          perTag[tag] = (perTag[tag] ?? 0) + 1;
          pseudonyms.set(key, `<${tag}_${perTag[tag]}>`);
        }
        return pseudonyms.get(key)!;
      }
    }
  }
}
