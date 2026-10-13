<script setup lang="ts">
import CodeBlock from "@/components/docs/CodeBlock.vue";
import ApiItem from "@/components/docs/ApiItem.vue";
import DocCallout from "@/components/docs/DocCallout.vue";

const formats = `
npx secrethawk scan                                        # colored terminal report
npx secrethawk scan --format json > secrethawk.json        # JSON to stdout
npx secrethawk scan --format sarif --output results.sarif  # GitHub code scanning
npx secrethawk scan --format html --output report.html     # standalone dashboard
`;

const json = `
{
  "scanner": "SecretHawk",
  "version": "0.1.0",
  "timestamp": "2026-10-13T09:30:00.000Z",
  "summary": {
    "filesScanned": 214,
    "totalFindings": 2,
    "critical": 1,
    "high": 1,
    "medium": 0,
    "low": 0,
    "durationMs": 182
  },
  "findings": [ /* finding objects — see Code scanning */ ]
}
`;

const githubActions = `
name: Secret scan

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read
  security-events: write   # needed to upload SARIF

jobs:
  secrethawk:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0     # full history, so --history has commits to read

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci

      # Fail the job on any finding
      - name: Scan files
        run: npx secrethawk scan

      # Show results in the Security tab (runs even if the scan failed)
      - name: SARIF report
        if: always()
        run: npx secrethawk scan --format sarif --output secrethawk.sarif || true

      - uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: secrethawk.sarif
          category: secrethawk
`;

const gitlab = `
# .gitlab-ci.yml
secret-scan:
  image: node:20
  stage: test
  variables:
    GIT_DEPTH: 0
  script:
    - npm ci
    - npx secrethawk scan
    - npx secrethawk scan --history "7 days"
`;

const scheduled = `
# .github/workflows/secret-history.yml — weekly sweep of the last 90 days
on:
  schedule:
    - cron: "0 6 * * 1"
  workflow_dispatch:

jobs:
  history:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - run: npx --yes secrethawk scan --history "90 days" --limit 1000
`;

const programmatic = `
import fs from "node:fs/promises";
import { scanDirectory } from "@secrethawk/code";
import { getReporter, terminalReporter } from "@secrethawk/reporters";

const result = await scanDirectory(".");

terminalReporter(result);                                   // prints and returns the text
const quiet = terminalReporter(result, { silent: true });   // returns only

const sarif = getReporter("sarif")(result);
await fs.writeFile("results.sarif", sarif);
`;
</script>

<template>
  <p>
    <code>@secrethawk/reporters</code> turns a scan result into terminal text, JSON, SARIF 2.1.0 or a standalone HTML
    page. Pick one with <code>--format</code> and save it with <code>--output</code>.
  </p>
  <CodeBlock :code="formats" lang="bash" />

  <table>
    <thead><tr><th>Format</th><th>Best for</th><th>Contains the secret?</th></tr></thead>
    <tbody>
      <tr><td><code>terminal</code></td><td>Local runs and hook output</td><td>Masked value, plus the source line around it</td></tr>
      <tr><td><code>json</code></td><td>Scripts, dashboards, custom processing</td><td><strong>Yes</strong> — <code>rawMatch</code> and <code>snippet</code></td></tr>
      <tr><td><code>sarif</code></td><td>GitHub code scanning and other SARIF viewers</td><td>Masked value only</td></tr>
      <tr><td><code>html</code></td><td>Sharing a readable report</td><td>Masked value, plus the source line</td></tr>
    </tbody>
  </table>
  <DocCallout tone="danger" title="Treat reports as secrets">
    JSON reports include the unmasked secret, and terminal/HTML reports show the line it's on. Don't upload them as
    public CI artifacts or paste them into issues. Use SARIF when results leave the machine.
  </DocCallout>

  <h3>JSON shape</h3>
  <CodeBlock :code="json" lang="json" />

  <h2>GitHub Actions</h2>
  <CodeBlock :code="githubActions" lang="yaml" title=".github/workflows/secrets.yml" />
  <p>
    Findings appear under <strong>Security → Code scanning</strong>. Critical and high severities are reported as
    errors, the rest as warnings.
  </p>

  <h2>GitLab CI</h2>
  <CodeBlock :code="gitlab" lang="yaml" title=".gitlab-ci.yml" />

  <h2>Scheduled history sweep</h2>
  <p>Hooks only see new commits. A weekly job catches anything that slipped in with <code>--no-verify</code>:</p>
  <CodeBlock :code="scheduled" lang="yaml" />

  <h2>Programmatic API</h2>
  <CodeBlock :code="programmatic" lang="js" />
  <ApiItem signature="getReporter(name)" returns="(result, options?) => string">
    <code>name</code> is <code>terminal</code>, <code>json</code>, <code>sarif</code> or <code>html</code>; anything
    else throws.
  </ApiItem>
  <ApiItem signature="terminalReporter(result, { silent = false })" returns="string">ANSI-colored report; printed unless <code>silent</code>.</ApiItem>
  <ApiItem signature="jsonReporter(result, { pretty = true })" returns="string">The JSON document shown above.</ApiItem>
  <ApiItem signature="sarifReporter(result)" returns="string">SARIF 2.1.0 log with one rule per triggered rule ID.</ApiItem>
  <ApiItem signature="htmlReporter(result)" returns="string">Self-contained HTML page with severity filters.</ApiItem>
  <p>
    <code>result</code> is <code>{ findings, filesScanned?, durationMs? }</code> — the object every scanner returns.
    <code>colors</code> (the ANSI helpers) is exported too.
  </p>
</template>
