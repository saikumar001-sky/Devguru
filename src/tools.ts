import type { Component } from "vue";
import {
  Binary,
  Braces,
  CalendarClock,
  CodeXml,
  EyeOff,
  FileJson,
  Fingerprint,
  GitCompare,
  Hash,
  ImageDown,
  Keyboard,
  KeyRound,
  Layers,
  Palette,
  Regex,
  ShieldCheck,
} from "lucide-vue-next";

export type ToolCategory = "Code" | "Data" | "Encode & Decode" | "Generate & Convert" | "Design" | "Docs";

export interface Tool {
  /** Route name; also the route path unless `path` is set. */
  id: string;
  /** Custom route path, e.g. to accept params. */
  path?: string;
  title: string;
  description: string;
  category: ToolCategory;
  icon: Component;
  keywords: string[];
  component: () => Promise<Component>;
}

export const categories: ToolCategory[] = ["Code", "Data", "Encode & Decode", "Generate & Convert", "Design", "Docs"];

export const tools: Tool[] = [
  {
    id: "js-compiler",
    title: "JavaScript Playground",
    description: "Run JavaScript in an isolated sandbox and inspect console output.",
    category: "Code",
    icon: Braces,
    keywords: ["js", "compiler", "console", "run", "eval", "repl"],
    component: () => import("@/views/JsPlayground.vue"),
  },
  {
    id: "html-compiler",
    title: "HTML Playground",
    description: "Write HTML, CSS and JS with a live, sandboxed preview.",
    category: "Code",
    icon: CodeXml,
    keywords: ["html", "css", "preview", "compiler", "web"],
    component: () => import("@/views/HtmlPlayground.vue"),
  },
  {
    id: "regex-tester",
    title: "Regex Tester",
    description: "Test JavaScript regular expressions with live highlighting and replace.",
    category: "Code",
    icon: Regex,
    keywords: ["regex", "regexp", "regular expression", "pattern", "match", "replace"],
    component: () => import("@/views/RegexTester.vue"),
  },
  {
    id: "keycode-viewer",
    title: "Keycode Viewer",
    description: "Press any key to see its key, code, keyCode and modifiers.",
    category: "Code",
    icon: Keyboard,
    keywords: ["keyboard", "keycode", "key", "event", "which", "shortcut"],
    component: () => import("@/views/KeycodeViewer.vue"),
  },
  {
    id: "json-formatter",
    title: "JSON Formatter",
    description: "Validate, pretty-print, minify and sort JSON with precise error locations.",
    category: "Data",
    icon: FileJson,
    keywords: ["json", "format", "beautify", "minify", "validate", "lint", "pretty"],
    component: () => import("@/views/JsonFormatter.vue"),
  },
  {
    id: "data-redaction",
    title: "Data Redaction",
    description: "Mask emails, tokens, keys, cards and other PII in logs before sharing.",
    category: "Data",
    icon: EyeOff,
    keywords: ["redact", "mask", "pii", "anonymize", "sanitize", "secrets", "logs", "gdpr"],
    component: () => import("@/views/DataRedaction.vue"),
  },
  {
    id: "text-diff-checker",
    title: "Text Diff",
    description: "Compare two texts by line, word or character.",
    category: "Data",
    icon: GitCompare,
    keywords: ["diff", "compare", "text", "changes"],
    component: () => import("@/views/TextDiff.vue"),
  },
  {
    id: "jwt-decoder",
    title: "JWT Decoder",
    description: "Inspect a token's header, payload and expiry.",
    category: "Encode & Decode",
    icon: KeyRound,
    keywords: ["jwt", "token", "auth", "bearer", "decode"],
    component: () => import("@/views/JwtDecoder.vue"),
  },
  {
    id: "base64-generator",
    title: "Base64",
    description: "Encode and decode text or images to and from Base64.",
    category: "Encode & Decode",
    icon: Binary,
    keywords: ["base64", "encode", "decode", "image", "data url"],
    component: () => import("@/views/Base64Tool.vue"),
  },
  {
    id: "hash-generator",
    title: "Hash Generator",
    description: "MD5, SHA-1, SHA-2 and SHA-3 hashes and HMACs for text or files.",
    category: "Encode & Decode",
    icon: Hash,
    keywords: ["hash", "md5", "sha", "sha256", "sha512", "hmac", "checksum", "digest"],
    component: () => import("@/views/HashGenerator.vue"),
  },
  {
    id: "uuid-generator",
    title: "UUID Generator",
    description: "Generate v4 / v7 UUIDs in bulk and decode existing ones.",
    category: "Generate & Convert",
    icon: Fingerprint,
    keywords: ["uuid", "guid", "id", "random", "v4", "v7"],
    component: () => import("@/views/UuidTool.vue"),
  },
  {
    id: "timestamp-converter",
    title: "Timestamp Converter",
    description: "Convert Unix timestamps and dates across time zones.",
    category: "Generate & Convert",
    icon: CalendarClock,
    keywords: ["timestamp", "epoch", "unix", "date", "time", "timezone", "utc", "iso"],
    component: () => import("@/views/TimestampConverter.vue"),
  },
  {
    id: "image-compressor",
    title: "Image Compressor",
    description: "Resize and re-encode images to JPEG, WebP or PNG.",
    category: "Design",
    icon: ImageDown,
    keywords: ["image", "compress", "resize", "webp", "jpeg", "png"],
    component: () => import("@/views/ImageCompressor.vue"),
  },
  {
    id: "color-picker",
    title: "Color Converter",
    description: "Convert between HEX, RGB, HSL and OKLCH, and check contrast.",
    category: "Design",
    icon: Palette,
    keywords: ["color", "colour", "hex", "rgb", "hsl", "oklch", "contrast", "picker"],
    component: () => import("@/views/ColorConverter.vue"),
  },
  {
    id: "box-shadows",
    title: "Box Shadows",
    description: "A curated gallery of CSS box shadows, ready to copy.",
    category: "Design",
    icon: Layers,
    keywords: ["css", "shadow", "box-shadow", "tailwind"],
    component: () => import("@/views/BoxShadows.vue"),
  },
  {
    id: "secrethawk",
    path: "/secrethawk/:section?",
    title: "SecretHawk Docs",
    description: "Guide to the secrethawk scanner: CLI, code, Git, hooks, config and CI.",
    category: "Docs",
    icon: ShieldCheck,
    keywords: ["secrethawk", "secrets", "scanner", "docs", "pre-commit", "hooks", "cli", "npm", "leak"],
    component: () => import("@/views/secrethawk/SecretHawkDocs.vue"),
  },
];

export function findTool(id: unknown): Tool | undefined {
  return tools.find((tool) => tool.id === id);
}
