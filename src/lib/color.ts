export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

let ctx: CanvasRenderingContext2D | null = null;

/** Parses any CSS color the browser understands (hex, rgb, hsl, oklch, named…) by painting one pixel. */
export function parseColor(input: string): Rgba | null {
  const value = input.trim();
  if (!value || !CSS.supports("color", value)) return null;

  if (!ctx) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
  }
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = value;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return { r: r!, g: g!, b: b!, a: Math.round((a! / 255) * 100) / 100 };
}

const hex2 = (n: number) => Math.round(n).toString(16).padStart(2, "0");
const round = (n: number, digits = 0) => Number(n.toFixed(digits));
const alphaSuffix = (a: number) => (a < 1 ? ` / ${round(a, 2)}` : "");

export function toHex({ r, g, b, a }: Rgba): string {
  return `#${hex2(r)}${hex2(g)}${hex2(b)}${a < 1 ? hex2(a * 255) : ""}`;
}

export function toRgb({ r, g, b, a }: Rgba): string {
  return `rgb(${r} ${g} ${b}${alphaSuffix(a)})`;
}

export function toHsl({ r, g, b, a }: Rgba): string {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return `hsl(${round(h)} ${round(s * 100)}% ${round(l * 100)}%${alphaSuffix(a)})`;
}

const linearize = (c: number) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

export function toOklch({ r, g, b, a }: Rgba): string {
  const [lr, lg, lb] = [linearize(r), linearize(g), linearize(b)];
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(A, B);
  const H = C < 0.0001 ? 0 : (Math.atan2(B, A) * 180) / Math.PI;
  return `oklch(${round(L * 100, 1)}% ${round(C, 3)} ${round((H + 360) % 360, 1)}${alphaSuffix(a)})`;
}

function luminance({ r, g, b }: Rgba): number {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/** WCAG 2.x contrast ratio between two opaque colors (1–21). */
export function contrastRatio(x: Rgba, y: Rgba): number {
  const [hi, lo] = [luminance(x), luminance(y)].sort((p, q) => q - p) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

export function wcagRating(ratio: number): "AAA" | "AA" | "AA Large" | "Fail" {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  if (ratio >= 3) return "AA Large";
  return "Fail";
}
