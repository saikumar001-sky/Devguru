# DevEase

A fast, private toolbox for developers and testers. Everything runs in the browser — nothing is uploaded.

| Tool | What it does |
| --- | --- |
| JavaScript Playground | Runs code in an isolated Web Worker (top-level `await`, 5s infinite-loop guard) |
| HTML Playground | Live, sandboxed preview of HTML/CSS/JS |
| Regex Tester | Live highlighting, groups, replace preview, presets; runs in a worker with a 1s backtracking guard |
| Keycode Viewer | `key`, `code`, `keyCode`, modifiers and history for any key press |
| JSON Formatter | Validate with exact line/column errors, pretty-print, minify, sort keys |
| Data Redaction | Mask emails, JWTs, API keys, passwords, cards (Luhn), Aadhaar (Verhoeff), PAN, phones, IPs… in logs |
| Text Diff | Line / word / character diff with ignore-case and ignore-whitespace |
| JWT Decoder | Header, payload, `exp`/`iat`/`nbf` with relative times and expiry status |
| Base64 | UTF-8-safe text encode/decode (incl. Base64URL), image ⇄ Base64 |
| Hash Generator | MD5, SHA-1, SHA-256/384/512, SHA3-256 and HMAC for text or (streamed) files, with verify |
| UUID Generator | v4 and v7 in bulk (up to 1000), offline decoder for any UUID version |
| Timestamp Converter | Unix s/ms/µs/ns auto-detect, ISO/HTTP dates, multi-zone view, wall-time-in-zone → epoch |
| Image Compressor | Resize and re-encode to WebP / JPEG / PNG with live size comparison |
| Color Converter | HEX, RGB, HSL, OKLCH, WCAG contrast, screen eyedropper |
| Box Shadows | 96 curated shadows, copy as CSS or Tailwind class |

It also hosts the **[SecretHawk](https://www.npmjs.com/package/secrethawk) documentation** at `#/secrethawk` — CLI, code scanning, Git, hooks, configuration, rules, CI recipes, and a playground that runs the real `@secrethawk/core` engine in the browser.

Press <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>K</kbd> anywhere to jump to a tool.

## Stack

Vue 3.5 · TypeScript · Vite 8 · Tailwind CSS 4 · CodeMirror 6 · Lucide icons

## Scripts

```sh
npm install
npm run dev         # start dev server
npm run build       # type-check + production build
npm run type-check  # vue-tsc only
npm run lint        # ESLint
npm run format      # Prettier
```

## Project layout

```
src/
  tools.ts            # tool registry — drives the router, sidebar, home page and command palette
  views/              # one file per tool
  views/secrethawk/   # SecretHawk docs (one component per section, registered in sections.ts)
  components/ui/      # shared primitives (AppButton, AppPanel, CodeEditor, …)
  components/layout/  # app shell (sidebar, top bar, command palette, ToolPage)
  composables/        # useTheme, useToast, useClipboard, useLocalStorage
  lib/                # framework-free logic (uuid, jwt, base64, color, image, jsRunner)
  data/               # static data (box shadows)
```

Adding a tool = add a view in `src/views/` and one entry in `src/tools.ts`.
