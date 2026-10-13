<script setup lang="ts">
import { ArrowDown } from "lucide-vue-next";
import CodeBlock from "@/components/docs/CodeBlock.vue";
import DocCallout from "@/components/docs/DocCallout.vue";
import { sections } from "./sections";

const quickStart = `
# 1. Install as a dev dependency
npm install -D secrethawk

# 2. (optional) Create .secret-hawk.json in the project root
npx secrethawk init

# 3. Block secrets on every commit and push
npx secrethawk hooks install

# 4. Scan the whole project now
npx secrethawk scan
`;

const packages = [
  ["secrethawk", "All-in-one: CLI binary + every API below re-exported", "Most projects and CI"],
  ["@secrethawk/cli", "The `secrethawk` command (scan, init, hooks, rules, config)", "CLI only"],
  ["@secrethawk/core", "Detection engine: regex matching, entropy, masking, suppression, allowlist", "Scanning strings in your own tools"],
  ["@secrethawk/rules", "The 18 built-in detection rules and helpers to filter them", "Custom scanners"],
  ["@secrethawk/code", "Scan files and directories (globs, .gitignore, binary & size checks)", "Build scripts, custom linters"],
  ["@secrethawk/git", "Read staged files, staged content, diffs, commits and history", "Git tooling"],
  ["@secrethawk/hooks", "Install and run pre-commit / pre-push hooks", "Custom hook setups"],
  ["@secrethawk/config", "Find, merge and validate `.secret-hawk.json`", "Respecting the user's config"],
  ["@secrethawk/reporters", "Terminal, JSON, SARIF 2.1.0 and HTML output", "CI and dashboards"],
];

const layers = [
  { label: "Entry points", items: ["secrethawk (CLI)", "@secrethawk/hooks", "your scripts"] },
  { label: "Content sources", items: ["@secrethawk/code — files on disk", "@secrethawk/git — staged index & commits"] },
  { label: "Detection", items: ["@secrethawk/config", "@secrethawk/rules", "@secrethawk/core · scanText()"] },
  { label: "Output", items: ["@secrethawk/reporters", "exit code 0 / 1"] },
];

const pick = (id: string) => sections.find((s) => s.id === id)!;
</script>

<template>
  <p>
    <strong>SecretHawk</strong> is a modular secret scanner for JavaScript and TypeScript projects. It finds
    exposed credentials — AWS keys, GitHub/GitLab tokens, Stripe and Slack secrets, JWTs, database URLs,
    private keys and high-entropy assignments — in your files, in the Git staging area and in commit
    history, and can stop a commit before the secret is ever recorded.
  </p>
  <ul>
    <li>Pure ESM, Node.js <strong>18+</strong>, MIT licensed.</li>
    <li>Use it as a CLI, as Git hooks, or as a library — each layer is its own npm package.</li>
    <li>Secrets are masked in reports (<code>AKIA************MPLE</code>).</li>
  </ul>

  <h2>Quick start</h2>
  <CodeBlock :code="quickStart" lang="bash" />
  <p>
    <code>secrethawk scan</code> exits with code <strong>1</strong> when anything is found and <strong>0</strong> when
    the project is clean, so it works as-is in npm scripts and CI pipelines.
  </p>

  <h2>Which package do I need?</h2>
  <table>
    <thead><tr><th>Package</th><th>What it gives you</th><th>Use it for</th></tr></thead>
    <tbody>
      <tr v-for="[name, what, use] in packages" :key="name">
        <td><code>{{ name }}</code></td>
        <td>{{ what }}</td>
        <td class="text-muted">{{ use }}</td>
      </tr>
    </tbody>
  </table>
  <DocCallout tone="tip">
    Not sure? Install <code>secrethawk</code>. It depends on every other package, so
    <code>import { scanDirectory, getStagedFiles, installHooks } from "secrethawk"</code> just works.
  </DocCallout>

  <h2>How it fits together</h2>
  <div class="not-prose my-5 flex flex-col items-stretch gap-2">
    <template v-for="(layer, i) in layers" :key="layer.label">
      <div class="grid gap-2 rounded-xl border border-border bg-surface-2 p-3 sm:grid-cols-[140px_1fr] sm:items-center">
        <span class="text-xs font-semibold tracking-wide text-muted uppercase">{{ layer.label }}</span>
        <div class="flex flex-wrap gap-2">
          <span v-for="item in layer.items" :key="item" class="rounded-lg border border-border bg-surface px-2.5 py-1 font-mono text-xs">{{ item }}</span>
        </div>
      </div>
      <ArrowDown v-if="i < layers.length - 1" class="mx-auto size-4 text-muted" />
    </template>
  </div>

  <h3>What happens during a scan</h3>
  <ol>
    <li><strong>Load config</strong> — the nearest <code>.secret-hawk.json</code> (or friends) is merged over the defaults.</li>
    <li><strong>Pick rules</strong> — <code>rules.enabled</code>, <code>rules.disabled</code> and <code>--severity</code> filter the 18 built-in rules.</li>
    <li><strong>Collect content</strong> — files on disk, the staged version of each file, or commit patches.</li>
    <li>
      <strong>Match</strong> — every rule's regex runs over the text. A match is dropped if the line (or the line above)
      has a <code>secrethawk-ignore</code> comment, if it is below the rule's minimum entropy, or if it is allowlisted.
    </li>
    <li><strong>Report</strong> — findings are masked and printed (or written as JSON/SARIF/HTML), and the exit code is set.</li>
  </ol>

  <h2>Next steps</h2>
  <div class="not-prose grid gap-3 sm:grid-cols-2">
    <RouterLink
      v-for="id in ['cli', 'hooks', 'code', 'playground']"
      :key="id"
      :to="`/secrethawk/${id}`"
      class="group flex items-center gap-3 rounded-xl border border-border p-4 transition-colors hover:border-brand/40"
    >
      <span class="grid size-9 place-items-center rounded-lg bg-brand-soft text-brand"><component :is="pick(id).icon" class="size-4" /></span>
      <span class="font-semibold group-hover:text-brand">{{ pick(id).title }}</span>
    </RouterLink>
  </div>
</template>
