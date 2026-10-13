export type JsonParseResult =
  | { ok: true; value: unknown }
  | { ok: false; message: string; line?: number; column?: number };

export function parseJson(text: string): JsonParseResult {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (error) {
    // Native messages vary by engine and rarely give a position, so locate the error ourselves.
    const located = locateJsonError(text);
    if (!located) return { ok: false, message: error instanceof Error ? error.message : String(error) };
    const before = text.slice(0, located.offset).split("\n");
    return { ok: false, message: located.message, line: before.length, column: before.at(-1)!.length + 1 };
  }
}

class JsonSyntaxError {
  readonly offset: number;
  readonly message: string;
  constructor(offset: number, message: string) {
    this.offset = offset;
    this.message = message;
  }
}

const NUMBER = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y;

/** A strict JSON scanner that returns the first syntax error with a human-friendly message. */
export function locateJsonError(text: string): JsonSyntaxError | null {
  let i = 0;
  const fail = (message: string): never => {
    throw new JsonSyntaxError(i, message);
  };
  const found = () => (i >= text.length ? "end of input" : `'${text[i]}'`);
  const skipWhitespace = () => {
    while (i < text.length && " \t\n\r".includes(text[i]!)) i++;
  };

  function value(): void {
    skipWhitespace();
    const c = text[i];
    if (c === "{") return object();
    if (c === "[") return array();
    if (c === '"') return string();
    if (c === "-" || (c !== undefined && c >= "0" && c <= "9")) return number();
    for (const literal of ["true", "false", "null"]) {
      if (text.startsWith(literal, i)) {
        i += literal.length;
        return;
      }
    }
    if (c === "'") fail("Strings must use double quotes");
    fail(`Unexpected ${found()} — expected a value`);
  }

  function object() {
    i++;
    skipWhitespace();
    if (text[i] === "}") return void i++;
    for (;;) {
      skipWhitespace();
      if (text[i] !== '"') fail(`Unexpected ${found()} — property names must be in double quotes`);
      string();
      skipWhitespace();
      if (text[i] !== ":") fail(`Unexpected ${found()} — expected ':' after property name`);
      i++;
      value();
      skipWhitespace();
      if (text[i] === "}") return void i++;
      if (text[i] !== ",") fail(`Unexpected ${found()} — expected ',' or '}'`);
      i++;
      skipWhitespace();
      if (text[i] === "}") fail("Trailing commas are not allowed");
    }
  }

  function array() {
    i++;
    skipWhitespace();
    if (text[i] === "]") return void i++;
    for (;;) {
      value();
      skipWhitespace();
      if (text[i] === "]") return void i++;
      if (text[i] !== ",") fail(`Unexpected ${found()} — expected ',' or ']'`);
      i++;
      skipWhitespace();
      if (text[i] === "]") fail("Trailing commas are not allowed");
    }
  }

  function string() {
    i++;
    while (i < text.length) {
      const c = text[i]!;
      if (c === '"') return void i++;
      if (c === "\\") {
        const next = text[i + 1];
        if (next === "u") {
          if (!/^[0-9a-fA-F]{4}$/.test(text.slice(i + 2, i + 6))) fail("Invalid \\u escape sequence");
          i += 6;
        } else if (next !== undefined && '"\\/bfnrt'.includes(next)) {
          i += 2;
        } else {
          fail(`Invalid escape sequence '\\${next ?? ""}'`);
        }
        continue;
      }
      if (c < " ") fail("Control characters (like newlines) must be escaped inside strings");
      i++;
    }
    fail("Unterminated string");
  }

  function number() {
    NUMBER.lastIndex = i;
    const match = NUMBER.exec(text);
    if (!match) fail("Invalid number");
    i += match![0].length;
  }

  try {
    value();
    skipWhitespace();
    if (i < text.length) fail(`Unexpected ${found()} after the end of the JSON value`);
    return null;
  } catch (error) {
    if (error instanceof JsonSyntaxError) return error;
    throw error;
  }
}

export function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort((a, b) => a.localeCompare(b))
        .map((key) => [key, sortKeysDeep((value as Record<string, unknown>)[key])]),
    );
  }
  return value;
}

export interface JsonStats {
  keys: number;
  depth: number;
  type: string;
}

export function jsonStats(value: unknown): JsonStats {
  let keys = 0;
  const walk = (node: unknown, depth: number): number => {
    if (!node || typeof node !== "object") return depth;
    const children = Array.isArray(node) ? node : Object.values(node);
    if (!Array.isArray(node)) keys += children.length;
    return children.reduce<number>((max, child) => Math.max(max, walk(child, depth + 1)), depth + 1);
  };
  const depth = walk(value, 0);
  const type = Array.isArray(value) ? `array(${value.length})` : value === null ? "null" : typeof value;
  return { keys, depth, type };
}
