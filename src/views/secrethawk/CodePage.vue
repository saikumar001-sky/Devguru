<script setup lang="ts">
import CodeBlock from "@/components/docs/CodeBlock.vue";
import ApiItem from "@/components/docs/ApiItem.vue";
import DocCallout from "@/components/docs/DocCallout.vue";

const basic = `
import { scanDirectory } from "@secrethawk/code";

const result = await scanDirectory("./src", {
  extensions: [".js", ".ts", ".env"],
  ignore: ["**/fixtures/**", "**/__snapshots__/**"],
});

console.log(\`Scanned \${result.filesScanned} files, skipped \${result.skippedCount} (.gitignore)\`);
for (const f of result.findings) {
  console.log(\`[\${f.severity}] \${f.ruleName} \${f.file}:\${f.line}:\${f.column} → \${f.match}\`);
}
`;

const withConfig = `
// scripts/check-secrets.mjs — respects the project's .secret-hawk.json
import { scanDirectory } from "@secrethawk/code";
import { loadConfig } from "@secrethawk/config";
import { filterRules } from "@secrethawk/rules";
import { terminalReporter } from "@secrethawk/reporters";

const { config } = await loadConfig();
const rules = filterRules({
  enabled: config.rules.enabled,
  disabled: config.rules.disabled,
  minSeverity: "high",
});

const result = await scanDirectory(".", {
  rules,
  ignore: config.ignore,
  allowlist: config.allowlist,
  maxFileSize: config.maxFileSize,
});

terminalReporter(result);
process.exitCode = result.findings.length > 0 ? 1 : 0;
`;

const buildGuard = `
// Fail a production build if the bundle contains a secret
import { scanDirectory } from "secrethawk";

// Target dist/ itself: built-in ignores like **/dist/** are matched relative to the target.
const { findings } = await scanDirectory("./dist");

if (findings.length) {
  console.error(\`✖ \${findings.length} secret(s) found in build output\`);
  process.exit(1);
}
`;

const scanList = `
import { scanFiles } from "@secrethawk/code";
import { getChangedFiles } from "@secrethawk/git";

// Scan only what changed since main (including untracked files)
const files = await getChangedFiles({ since: "origin/main" });
const { findings } = await scanFiles(files);
`;

const finding = `
{
  id: "aws-access-key:12:15",
  ruleId: "aws-access-key",
  ruleName: "AWS Access Key",
  description: "Identifies standard AWS Access Key IDs (AKIA prefix).",
  severity: "critical",          // "critical" | "high" | "medium" | "low"
  confidence: 100,               // 0–100, from the rule
  file: "/repo/src/config.js",
  line: 12,                      // 1-based
  column: 15,                    // 1-based
  match: "AKIA************MPLE", // masked — safe to log
  rawMatch: "AKIA…",             // the real secret — never log this
  entropy: 3.68,
  snippet: [{ lineNumber: 12, text: "const key = …", isTarget: true }, /* ±1 line */]
}
`;
</script>

<template>
  <p>
    <code>@secrethawk/code</code> scans files on disk. It expands globs, honours <code>.gitignore</code>, skips binary
    and oversized files, and runs files in parallel batches.
  </p>
  <CodeBlock code="npm install @secrethawk/code" lang="bash" />

  <h2>Scan a directory</h2>
  <CodeBlock :code="basic" lang="js" />

  <ApiItem signature="scanDirectory(dir = '.', options?)" returns="Promise<{ filesScanned, skippedCount, findings, durationMs }>">
    <table>
      <thead><tr><th>Option</th><th>Default</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><code>rules</code></td><td><code>defaultRules</code></td><td>Rules to run (all 18 built-ins by default).</td></tr>
        <tr><td><code>ignore</code></td><td><code>[]</code></td><td>Extra glob patterns to skip, added to the built-in list.</td></tr>
        <tr><td><code>extensions</code></td><td><code>null</code></td><td>Only scan these extensions, e.g. <code>[".js", ".env"]</code>.</td></tr>
        <tr><td><code>useGitignore</code></td><td><code>true</code></td><td>Skip files matched by the <code>.gitignore</code> at the root of the scanned folder (nested and parent <code>.gitignore</code> files are not read). Counted in <code>skippedCount</code>.</td></tr>
        <tr><td><code>maxFileSize</code></td><td>5 MB</td><td>Files larger than this (bytes) are skipped.</td></tr>
        <tr><td><code>allowlist</code></td><td><code>[]</code></td><td>Values or patterns to ignore — see <RouterLink to="/secrethawk/config" class="text-brand">allowlist</RouterLink>.</td></tr>
        <tr><td><code>concurrency</code></td><td><code>8</code></td><td>Files scanned in parallel.</td></tr>
      </tbody>
    </table>
    <p class="mt-3">
      Always ignored: <code>.git</code>, <code>node_modules</code>, <code>dist</code>, <code>build</code>,
      <code>coverage</code>, <code>.next</code>, <code>.nuxt</code>, <code>.cache</code>, <code>*.min.js</code>,
      <code>*.bundle.js</code>, <code>package-lock.json</code>, <code>pnpm-lock.yaml</code>, <code>yarn.lock</code>.
      Dotfiles such as <code>.env</code> are included.
    </p>
  </ApiItem>

  <h2>Scan one file</h2>
  <CodeBlock
code='import { scanFile } from "@secrethawk/code";

const findings = await scanFile("./.env.production");
if (findings.length) console.error("Secrets found!", findings.map((f) => f.match));' lang="js" />
  <ApiItem signature="scanFile(path, options?)" returns="Promise<Finding[]>">
    <p>
      Options: <code>rules</code>, <code>allowlist</code>, <code>maxFileSize</code> (5 MB),
      <code>entropyThreshold</code>, <code>checkBinary</code> (<code>true</code>). Returns <code>[]</code> for missing,
      binary or oversized files rather than throwing.
    </p>
  </ApiItem>

  <h2>Scan a list of files</h2>
  <CodeBlock :code="scanList" lang="js" />
  <ApiItem signature="scanFiles(files, options?)" returns="Promise<{ filesScanned, findings, durationMs }>">
    <p>Options: <code>rules</code>, <code>maxFileSize</code>, <code>allowlist</code>, <code>concurrency</code>.</p>
  </ApiItem>
  <ApiItem signature="scan(target = '.', options?)" returns="Promise<{ filesScanned, skippedCount, findings, durationMs }>">
    <p>Calls <code>scanFile</code> for a file and <code>scanDirectory</code> for anything else.</p>
  </ApiItem>

  <h2>Respect the project config</h2>
  <p>The scanning functions don't read <code>.secret-hawk.json</code> themselves — load it and pass the values in:</p>
  <CodeBlock :code="withConfig" lang="js" title="scripts/check-secrets.mjs" />

  <h2>Recipe: guard the build output</h2>
  <CodeBlock :code="buildGuard" lang="js" title="scripts/check-dist.mjs" />
  <DocCallout tone="info">
    Built-in ignores are matched relative to the scanned folder, so pass <code>./dist</code> as the target (as above)
    rather than scanning the repo root.
  </DocCallout>

  <h2>The finding object</h2>
  <p>Every scanner returns findings with this shape:</p>
  <CodeBlock :code="finding" lang="js" />
  <DocCallout tone="danger" title="rawMatch and snippet contain the real secret">
    Use <code>match</code> when logging. If you store findings (JSON reports, CI artifacts, issue trackers), strip
    <code>rawMatch</code> and <code>snippet</code> first.
  </DocCallout>

  <h2>Other exports</h2>
  <table>
    <thead><tr><th>Export</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td><code>isBinaryFile(path)</code></td><td>Promise&lt;boolean&gt; — checks the file's leading bytes.</td></tr>
      <tr><td><code>isBinaryBuffer(buffer)</code></td><td>Same check on a Buffer you already have.</td></tr>
      <tr><td><code>createGitignoreMatcher(rootDir)</code></td><td>Matcher for the folder's <code>.gitignore</code> (<code>.ignores(relPath)</code>).</td></tr>
      <tr><td><code>scanContent</code>, <code>defaultRules</code></td><td>Re-exports of <code>scanText</code> and the rule list, for convenience.</td></tr>
    </tbody>
  </table>
</template>
