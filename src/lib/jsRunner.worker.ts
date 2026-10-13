import type { LogLevel, RunnerMessage } from "./jsRunner";

const post = (message: RunnerMessage) => self.postMessage(message);

function format(value: unknown, depth = 0, seen = new WeakSet<object>()): string {
  if (typeof value === "string") return depth === 0 ? value : JSON.stringify(value);
  if (typeof value === "bigint") return `${value}n`;
  if (typeof value === "function") return `ƒ ${value.name || "anonymous"}()`;
  if (typeof value === "symbol" || value === undefined || value === null) return String(value);
  if (typeof value !== "object") return String(value);

  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof RegExp) return String(value);
  if (seen.has(value)) return "[Circular]";
  if (depth > 4) return Array.isArray(value) ? "[Array]" : "[Object]";
  seen.add(value);

  const indent = "  ".repeat(depth + 1);
  const close = "  ".repeat(depth);
  const join = (items: string[], open: string, end: string) =>
    items.length === 0 ? `${open}${end}` : `${open}\n${indent}${items.join(`,\n${indent}`)}\n${close}${end}`;

  if (Array.isArray(value)) return join(value.map((v) => format(v, depth + 1, seen)), "[", "]");
  if (value instanceof Map) {
    const entries = [...value].map(([k, v]) => `${format(k, depth + 1, seen)} => ${format(v, depth + 1, seen)}`);
    return `Map(${value.size}) ${join(entries, "{", "}")}`;
  }
  if (value instanceof Set) {
    return `Set(${value.size}) ${join([...value].map((v) => format(v, depth + 1, seen)), "{", "}")}`;
  }
  const entries = Object.entries(value).map(([k, v]) => `${k}: ${format(v, depth + 1, seen)}`);
  const name = value.constructor && value.constructor !== Object ? `${value.constructor.name} ` : "";
  return name + join(entries, "{", "}");
}

const levels: Exclude<LogLevel, "result">[] = ["log", "info", "warn", "error", "debug"];
for (const level of levels) {
  console[level] = (...args: unknown[]) => post({ type: "log", level, text: args.map((a) => format(a)).join(" ") });
}
console.table = (data: unknown) => post({ type: "log", level: "log", text: format(data) });

self.addEventListener("unhandledrejection", (event) => {
  post({ type: "log", level: "error", text: `Uncaught (in promise) ${format(event.reason)}` });
});

self.onmessage = async (event: MessageEvent<string>) => {
  const started = performance.now();
  try {
    const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor as new (code: string) => () => Promise<unknown>;
    const result = await new AsyncFunction(event.data)();
    if (result !== undefined) post({ type: "log", level: "result", text: format(result) });
  } catch (error) {
    post({ type: "log", level: "error", text: format(error) });
  }
  post({ type: "done", durationMs: performance.now() - started });
};
