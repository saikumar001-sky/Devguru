<script setup lang="ts">
import CodeBlock from "@/components/docs/CodeBlock.vue";
import DocCallout from "@/components/docs/DocCallout.vue";

const install = `
# Project-local (recommended — pins the version for your whole team)
npm install -D secrethawk
npx secrethawk --help

# Or run once without installing
npx secrethawk scan

# Or install globally
npm install -g secrethawk
`;

const scanExamples = `
# Scan the current directory (default target is ".")
secrethawk scan

# Scan a folder or a single file
secrethawk scan ./src
secrethawk scan ./config/production.js

# Only some file types (directory scans only)
secrethawk scan --ext .js,.ts,.env

# Only critical rules
secrethawk scan --severity critical

# Only specific rules
secrethawk scan --rules aws-access-key,github-pat

# What is staged right now (what "git commit" would record)
secrethawk scan --staged

# Commit history: last 30 days by default, max 50 commits
secrethawk scan --history
secrethawk scan --history "2 weeks ago" --limit 200

# Machine-readable output
secrethawk scan --format json
secrethawk scan --format sarif --output results.sarif
secrethawk scan --format html --output reports/secrets.html
`;

const npmScripts = `
{
  "scripts": {
    "secrets": "secrethawk scan",
    "secrets:staged": "secrethawk scan --staged",
    "secrets:history": "secrethawk scan --history \\"90 days\\" --limit 500",
    "prepare": "secrethawk hooks install || true"
  }
}
`;

const terminalOutput = `
🦅 SecretHawk - Security Scan Report
════════════════════════════════════════════════════════════
src/config.js
  [CRITICAL] AWS Access Key at line 12:15
    Secret: AKIA************MPLE (entropy: 3.68)

  >   12 | const key = "AKIA…";
────────────────────────────────────────────────────────────
`;

const scanFlags = [
  ["[path]", "Positional. File or directory to scan. Defaults to the current directory."],
  ["--staged", "Scan the staged (index) version of every added, copied or modified file."],
  ["--history [since]", "Scan commit patches. `since` is anything `git log --since` accepts; default `\"30 days\"`."],
  ["--limit <n>", "With --history: maximum number of commits (default 50)."],
  ["--format <fmt>", "`terminal` (default), `json`, `sarif` or `html`."],
  ["--output <file>", "Write the report to a file (parent folders are created)."],
  ["--ext <list>", "Comma-separated extensions, e.g. `.js,.ts,.env`. Directory scans only."],
  ["--severity <level>", "Minimum rule severity: `critical`, `high`, `medium` or `low`."],
  ["--rules <ids>", "Comma-separated rule IDs; replaces `rules.enabled` from the config."],
  ["--entropy <n>", "Entropy threshold for rules that opt into the global threshold."],
  ["--config <file>", "Use this config file instead of searching for one."],
];
</script>

<template>
  <p>
    The <code>secrethawk</code> binary ships with both the <code>secrethawk</code> and <code>@secrethawk/cli</code>
    packages. It wires the other packages together: it loads your config, filters rules, gathers content
    from disk or Git, and prints a report.
  </p>

  <h2>Install</h2>
  <CodeBlock :code="install" lang="bash" />

  <h2>Commands</h2>
  <table>
    <thead><tr><th>Command</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td><code>secrethawk scan [path]</code></td><td>Scan a file or directory (the default command).</td></tr>
      <tr><td><code>secrethawk scan --staged</code></td><td>Scan files staged in the Git index.</td></tr>
      <tr><td><code>secrethawk scan --history [since]</code></td><td>Scan recent commit patches.</td></tr>
      <tr><td><code>secrethawk init</code></td><td>Write a starter <code>.secret-hawk.json</code>.</td></tr>
      <tr><td><code>secrethawk hooks install</code></td><td>Install <code>pre-commit</code> and <code>pre-push</code> hooks.</td></tr>
      <tr><td><code>secrethawk hooks uninstall</code></td><td>Remove hooks written by SecretHawk.</td></tr>
      <tr><td><code>secrethawk hooks run &lt;hook&gt;</code></td><td>Run the <code>pre-commit</code> or <code>pre-push</code> check now.</td></tr>
      <tr><td><code>secrethawk rules</code></td><td>Print the rule catalog (ID, category, severity, description).</td></tr>
      <tr><td><code>secrethawk config</code></td><td>Print the resolved config and which file it came from.</td></tr>
      <tr><td><code>secrethawk --help</code>, <code>--version</code></td><td>Help and version (<code>-h</code>, <code>-v</code> also work).</td></tr>
    </tbody>
  </table>

  <h2>scan</h2>
  <CodeBlock :code="scanExamples" lang="bash" />
  <h3>Options</h3>
  <table>
    <thead><tr><th>Flag</th><th>Description</th></tr></thead>
    <tbody>
      <tr v-for="[flag, desc] in scanFlags" :key="flag">
        <td class="whitespace-nowrap"><code>{{ flag }}</code></td>
        <td>{{ desc.replace(/`/g, "") }}</td>
      </tr>
    </tbody>
  </table>
  <p>Flags accept both <code>--format json</code> and <code>--format=json</code>.</p>

  <h3>Output</h3>
  <CodeBlock :code="terminalOutput" lang="text" title="Terminal report" />

  <h3>Exit codes</h3>
  <table>
    <thead><tr><th>Code</th><th>Meaning</th></tr></thead>
    <tbody>
      <tr><td><code>0</code></td><td>No findings.</td></tr>
      <tr><td><code>1</code></td><td>At least one finding, or an error (missing path, invalid config, unknown command).</td></tr>
    </tbody>
  </table>
  <DocCallout tone="info">
    Directory scans always skip <code>node_modules</code>, <code>dist</code>, <code>build</code>,
    <code>coverage</code>, <code>.next</code>, <code>.nuxt</code>, <code>.cache</code>, minified bundles and lock
    files, plus anything in your <code>.gitignore</code> and the config's <code>ignore</code> list.
  </DocCallout>

  <h2>init</h2>
  <CodeBlock
code="npx secrethawk init
npx secrethawk init --force                      # overwrite an existing file
npx secrethawk init --filename .secrethawk.json  # different file name" lang="bash" />
  <p>
    The generated file enables six common rules (<code>aws-access-key</code>, <code>github-pat</code>,
    <code>slack-token</code>, <code>stripe-api-key</code>, <code>jwt</code>, <code>database-url</code>). Change
    <code>rules.enabled</code> to <code>["*"]</code> to run all 18 — see
    <RouterLink to="/secrethawk/config">Configuration</RouterLink>.
  </p>

  <h2>hooks</h2>
  <CodeBlock
code="npx secrethawk hooks install
npx secrethawk hooks run pre-commit   # same check the hook runs
npx secrethawk hooks run pre-push
npx secrethawk hooks uninstall" lang="bash" />
  <p>Details, Husky / lefthook setups and caveats are on the <RouterLink to="/secrethawk/hooks">Git hooks</RouterLink> page.</p>

  <h2>rules &amp; config</h2>
  <CodeBlock
code="npx secrethawk rules     # list all detection rules
npx secrethawk config    # show the merged configuration
npx secrethawk config --config ./ci/secrethawk.json" lang="bash" />

  <h2>Use it from npm scripts</h2>
  <CodeBlock :code="npmScripts" lang="json" title="package.json" />
  <p>
    The <code>prepare</code> script runs after every <code>npm install</code>, so everyone who clones the repository gets
    the hooks automatically.
  </p>
  <DocCallout tone="warning">
    <code>hooks install</code> exits with an error when there is no <code>.git</code> folder (Docker builds, CI installs
    from a tarball). <code>|| true</code> keeps <code>npm install</code> from failing there; on Windows shells without
    <code>||</code>, run the install step manually instead.
  </DocCallout>

  <h2>Run the CLI from code</h2>
  <CodeBlock
code='import { runCli } from "secrethawk";

const exitCode = await runCli(["scan", "./src", "--severity", "high"]);
process.exitCode = exitCode;' lang="js" />
</template>
