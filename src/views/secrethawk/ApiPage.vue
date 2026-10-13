<script setup lang="ts">
import CodeBlock from "@/components/docs/CodeBlock.vue";
import ApiItem from "@/components/docs/ApiItem.vue";
import DocCallout from "@/components/docs/DocCallout.vue";

const scanTextExample = `
import { scanText } from "@secrethawk/core";
import { defaultRules } from "@secrethawk/rules";

const findings = scanText(requestBody, {
  rules: defaultRules,
  file: "POST /api/settings",          // label used in reports
  allowlist: ["AKIAIOSFODNN7EXAMPLE"],
});

if (findings.length) {
  logger.warn("Request contained credentials", findings.map((f) => f.ruleId));
}
`;

const helpers = `
import { calculateShannonEntropy, isHighEntropy, maskSecret, getPosition } from "@secrethawk/core";

calculateShannonEntropy("aaaaaaaa");          // 0
calculateShannonEntropy("x7Gq9LmZ2pVr");       // ≈ 3.58
isHighEntropy("x7Gq9LmZ2pVr");                 // true (threshold 3.5)

maskSecret("AKIAIOSFODNN7EXAMPLE");            // "AKIA************MPLE"
maskSecret("hunter2");                         // "*******" (short values are fully masked)

getPosition("a\\nbc\\ndef", 5);                  // { line: 3, column: 1 }
`;

const allInOne = `
import {
  scanStaged,       // staged files + your config
  scanGitHistory,   // commit history + your config
  scanDirectory,    // from @secrethawk/code
  installHooks,     // from @secrethawk/hooks
  runCli,           // the CLI itself
} from "secrethawk";

const { findings, filesScanned, durationMs } = await scanStaged();
const history = await scanGitHistory({ since: "30 days", limit: 50 });
`;
</script>

<template>
  <p>
    <code>@secrethawk/core</code> is the detection engine every other package uses. It has no dependencies and no
    Node.js APIs, so it also runs in browsers, edge functions and workers — the
    <RouterLink to="/secrethawk/playground">Playground</RouterLink> uses it directly.
  </p>

  <h2>scanText</h2>
  <CodeBlock :code="scanTextExample" lang="js" />
  <ApiItem signature="scanText(content, options?)" returns="Finding[]">
    <table>
      <thead><tr><th>Option</th><th>Default</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><code>rules</code></td><td><code>[]</code></td><td>Rules to apply. <strong>Pass rules explicitly</strong> — nothing runs by default.</td></tr>
        <tr><td><code>file</code></td><td><code>"&lt;inline&gt;"</code></td><td>Label copied into each finding's <code>file</code>.</td></tr>
        <tr><td><code>allowlist</code></td><td><code>[]</code></td><td>Strings, RegExps or <code>{ rule, file, pattern }</code> objects.</td></tr>
        <tr><td><code>entropyThreshold</code></td><td><code>null</code></td><td>Minimum entropy for rules with <code>entropy: true</code> and no <code>minEntropy</code> (falls back to 3.5).</td></tr>
        <tr><td><code>checkEntropy</code></td><td><code>true</code></td><td>Set <code>false</code> to ignore all entropy minimums.</td></tr>
      </tbody>
    </table>
    <p class="mt-2">
      For each rule match, in order: inline suppression comments → entropy minimum → allowlist. Surviving matches become
      findings with a masked <code>match</code>, 1-based <code>line</code>/<code>column</code> and a ±1-line
      <code>snippet</code>.
    </p>
  </ApiItem>
  <DocCallout tone="warning">
    <code>scanText</code> does not read <code>.secret-hawk.json</code>. Use <code>loadConfig</code> +
    <code>filterRules</code> (see <RouterLink to="/secrethawk/code">Code scanning</RouterLink>) to apply the project's
    settings.
  </DocCallout>

  <h2>Helpers</h2>
  <CodeBlock :code="helpers" lang="js" />
  <ApiItem signature="calculateShannonEntropy(str)" returns="number">Bits per character (0 for empty or uniform strings). Alias: <code>calculateEntropy</code>.</ApiItem>
  <ApiItem signature="isHighEntropy(str, threshold = 3.5)" returns="boolean" />
  <ApiItem signature="maskSecret(value, visibleCount = 4)" returns="string">
    Keeps <code>visibleCount</code> characters at each end with 4–24 asterisks between. Values of
    <code>2 × visibleCount</code> characters or fewer are fully masked.
  </ApiItem>
  <ApiItem signature="getPosition(content, index)" returns="{ line, column }">1-based line and column for a character offset.</ApiItem>
  <ApiItem signature="getLineSnippet(content, line, contextLines = 1)" returns="{ lineNumber, text, isTarget }[]" />
  <ApiItem signature="isAllowlisted(finding, allowlist)" returns="boolean" />
  <ApiItem signature="hasInlineSuppression(content, line, ruleId)" returns="boolean">
    True when that line or the previous one carries a <code>secrethawk-ignore</code>-style comment for the rule.
  </ApiItem>

  <h2>The all-in-one package</h2>
  <p><code>secrethawk</code> re-exports every package and adds two config-aware shortcuts:</p>
  <CodeBlock :code="allInOne" lang="js" />
  <ApiItem signature="scanStaged({ cwd?, config? })" returns="Promise<{ findings, filesScanned, durationMs }>">
    Loads the config (or the file in <code>config</code>), filters rules and scans staged content.
  </ApiItem>
  <ApiItem signature="scanGitHistory({ cwd?, config?, since = '30 days', limit = 50 })" returns="Promise<{ findings, commitsScanned, durationMs }>" />
  <ApiItem signature="runCli(argv = process.argv.slice(2))" returns="Promise<number>">Runs a CLI command and resolves to its exit code.</ApiItem>
</template>
