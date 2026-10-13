export type EpochUnit = "s" | "ms" | "µs" | "ns";

export interface ParsedTime {
  date: Date;
  /** How the input was interpreted, e.g. "Unix seconds" or "ISO / date string". */
  source: string;
}

const UNIT_DIVISORS: Record<EpochUnit, number> = { s: 1e-3, ms: 1, "µs": 1e3, ns: 1e6 };
const UNIT_LABELS: Record<EpochUnit, string> = {
  s: "Unix seconds",
  ms: "Unix milliseconds",
  "µs": "Unix microseconds",
  ns: "Unix nanoseconds",
};

/** Guesses the unit of a numeric epoch from its magnitude (works for dates between ~1973 and ~5138). */
export function detectEpochUnit(digits: number): EpochUnit {
  if (digits <= 11) return "s";
  if (digits <= 14) return "ms";
  if (digits <= 17) return "µs";
  return "ns";
}

export function parseTimeInput(input: string): ParsedTime | null {
  const value = input.trim();
  if (!value) return null;
  if (/^now$/i.test(value)) return { date: new Date(), source: "Current time" };

  if (/^-?\d+(\.\d+)?$/.test(value)) {
    const digits = value.replace(/^-/, "").split(".")[0]!.length;
    const unit = detectEpochUnit(digits);
    const date = new Date(Number(value) / UNIT_DIVISORS[unit]);
    return Number.isNaN(date.getTime()) ? null : { date, source: UNIT_LABELS[unit] };
  }

  const ms = Date.parse(value);
  return Number.isNaN(ms) ? null : { date: new Date(ms), source: "Date string" };
}

const partsFormatters = new Map<string, Intl.DateTimeFormat>();

function wallClockUtc(date: Date, timeZone: string): number {
  let formatter = partsFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    partsFormatters.set(timeZone, formatter);
  }
  const parts = Object.fromEntries(formatter.formatToParts(date).map((p) => [p.type, p.value]));
  return Date.UTC(+parts.year!, +parts.month! - 1, +parts.day!, +parts.hour!, +parts.minute!, +parts.second!);
}

/** Minutes the zone is ahead of UTC at the given instant (e.g. 330 for Asia/Kolkata). */
export function timeZoneOffset(date: Date, timeZone: string): number {
  const instant = Math.floor(date.getTime() / 1000) * 1000;
  return Math.round((wallClockUtc(new Date(instant), timeZone) - instant) / 60_000);
}

export function formatOffset(minutes: number): string {
  const sign = minutes < 0 ? "−" : "+";
  const abs = Math.abs(minutes);
  return `UTC${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}

/**
 * Interprets a wall-clock time ("2026-10-13T09:30") as local time in `timeZone`
 * and returns the matching instant. Iterates twice to settle across DST changes.
 */
export function wallTimeToDate(wallTime: string, timeZone: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(wallTime);
  if (!match) return null;
  const [, y, mo, d, h, mi, s = "0"] = match;
  const asUtc = Date.UTC(+y!, +mo! - 1, +d!, +h!, +mi!, +s);
  let guess = asUtc - timeZoneOffset(new Date(asUtc), timeZone) * 60_000;
  guess = asUtc - timeZoneOffset(new Date(guess), timeZone) * 60_000;
  return new Date(guess);
}

/** "2026-10-13T09:30" for a datetime-local input, as seen in `timeZone`. */
export function toWallTime(date: Date, timeZone: string): string {
  return new Date(wallClockUtc(date, timeZone)).toISOString().slice(0, 16);
}

export function formatInZone(date: Date, timeZone: string): string {
  return date.toLocaleString(undefined, {
    timeZone,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// Browsers (via CLDR) still report some legacy zone names; show the current IANA names instead.
const MODERN_NAMES: Record<string, string> = {
  "Asia/Calcutta": "Asia/Kolkata",
  "Asia/Katmandu": "Asia/Kathmandu",
  "Asia/Rangoon": "Asia/Yangon",
  "Asia/Saigon": "Asia/Ho_Chi_Minh",
  "Europe/Kiev": "Europe/Kyiv",
  "Atlantic/Faeroe": "Atlantic/Faroe",
  "America/Buenos_Aires": "America/Argentina/Buenos_Aires",
  "America/Indianapolis": "America/Indiana/Indianapolis",
  "America/Louisville": "America/Kentucky/Louisville",
  "Pacific/Truk": "Pacific/Chuuk",
  "Pacific/Ponape": "Pacific/Pohnpei",
};

const modernize = (zone: string) => MODERN_NAMES[zone] ?? zone;

export function allTimeZones(): string[] {
  let zones: string[];
  try {
    zones = Intl.supportedValuesOf("timeZone");
  } catch {
    zones = [];
  }
  return [...new Set(["UTC", ...zones.map(modernize)])].sort((a, b) => (a === "UTC" ? -1 : b === "UTC" ? 1 : a.localeCompare(b)));
}

export const localTimeZone = modernize(Intl.DateTimeFormat().resolvedOptions().timeZone);
