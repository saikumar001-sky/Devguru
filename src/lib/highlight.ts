import { classHighlighter, highlightCode } from "@lezer/highlight";
import { parser as jsParser } from "@lezer/javascript";
import { parser as jsonParser } from "@lezer/json";

export type CodeLanguage = "js" | "json" | "bash" | "yaml" | "text";

export interface Token {
  text: string;
  /** Space-separated `tok-*` classes, empty for plain text. */
  cls: string;
}

/** Splits code into styled tokens. Returns plain data so the template never needs v-html. */
export function tokenize(code: string, language: CodeLanguage): Token[] {
  if (language === "js" || language === "json") {
    const parser = language === "js" ? jsParser : jsonParser;
    const tokens: Token[] = [];
    highlightCode(
      code,
      parser.parse(code),
      classHighlighter,
      (text, cls) => tokens.push({ text, cls }),
      () => tokens.push({ text: "\n", cls: "" }),
    );
    return tokens;
  }
  if (language === "bash" || language === "yaml") return tokenizeLines(code, language);
  return [{ text: code, cls: "" }];
}

const SHELL_TOKEN = /(#.*$)|("(?:[^"\\]|\\.)*"|'[^']*')|(\s--?[\w-]+(?:=\S*)?)|(\$\{?\w+\}?)/gm;
const YAML_TOKEN = /(#.*$)|("(?:[^"\\]|\\.)*"|'[^']*')|(^\s*-?\s*[\w./-]+(?=:))|(\$\{\{.*?\}\})/gm;

function tokenizeLines(code: string, language: "bash" | "yaml"): Token[] {
  const regex = language === "bash" ? SHELL_TOKEN : YAML_TOKEN;
  const classes = ["tok-comment", "tok-string", language === "bash" ? "tok-keyword" : "tok-propertyName", "tok-variableName"];
  const tokens: Token[] = [];
  let cursor = 0;
  for (const match of code.matchAll(regex)) {
    if (match.index > cursor) tokens.push({ text: code.slice(cursor, match.index), cls: "" });
    const group = match.slice(1).findIndex((g) => g !== undefined);
    tokens.push({ text: match[0], cls: classes[group] ?? "" });
    cursor = match.index + match[0].length;
  }
  if (cursor < code.length) tokens.push({ text: code.slice(cursor), cls: "" });
  return tokens;
}
