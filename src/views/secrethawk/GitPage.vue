<script setup lang="ts">
import CodeBlock from "@/components/docs/CodeBlock.vue";
import ApiItem from "@/components/docs/ApiItem.vue";
import DocCallout from "@/components/docs/DocCallout.vue";

const staged = `
import { isGitRepo, getStagedFiles, getStagedContent } from "@secrethawk/git";
import { scanText } from "@secrethawk/core";
import { defaultRules } from "@secrethawk/rules";

if (!(await isGitRepo())) process.exit(0);

// Paths relative to the repo root, as git reports them
const files = await getStagedFiles({ absolute: false });

for (const file of files) {
  // The version that will be committed — not the working-tree copy
  const content = await getStagedContent(file);
  const findings = scanText(content, { rules: defaultRules, file });
  findings.forEach((f) => console.log(\`\${file}:\${f.line} \${f.ruleName} \${f.match}\`));
}
`;

const prDiff = `
// Scan only lines added on this branch — ideal for pull-request checks
import { getDiff, parseDiff } from "@secrethawk/git";
import { scanText } from "@secrethawk/core";
import { defaultRules } from "@secrethawk/rules";

const diff = await getDiff("origin/main...HEAD");
const findings = [];

for (const { file, addedLines } of parseDiff(diff)) {
  for (const { lineNumber, content } of addedLines) {
    for (const f of scanText(content, { rules: defaultRules, file })) {
      findings.push({ ...f, line: lineNumber }); // map back to the real line number
    }
  }
}

if (findings.length) {
  console.error(\`✖ \${findings.length} secret(s) added in this branch\`);
  process.exit(1);
}
`;

const history = `
import { scanHistory } from "@secrethawk/git";
import { scanText } from "@secrethawk/core";
import { defaultRules } from "@secrethawk/rules";

const commits = await scanHistory({ since: "6 months ago", limit: 500 });

for (const commit of commits) {
  const findings = scanText(commit.patch, { rules: defaultRules, file: commit.hash.slice(0, 8) });
  if (findings.length) {
    console.log(\`\${commit.hash.slice(0, 8)} \${commit.author} — \${commit.message}\`);
    findings.forEach((f) => console.log(\`   \${f.ruleName}: \${f.match}\`));
  }
}
`;

const shortcut = `
// The all-in-one package wraps this with your .secret-hawk.json applied:
import { scanStaged, scanGitHistory } from "secrethawk";

const { findings, filesScanned } = await scanStaged();
const { findings: old, commitsScanned } = await scanGitHistory({ since: "90 days", limit: 200 });
`;
</script>

<template>
  <p>
    <code>@secrethawk/git</code> reads repository state by calling the <code>git</code> executable (no native
    dependencies). Use it to scan exactly what is about to be committed, what a branch adds, or what is already in
    history.
  </p>
  <CodeBlock code="npm install @secrethawk/git" lang="bash" />
  <DocCallout tone="info">
    Requires <code>git</code> on the <code>PATH</code>. Every function accepts a <code>cwd</code> — some as an
    options field (<code>{ cwd }</code>), the repository helpers as a plain string argument.
  </DocCallout>

  <h2>Scan staged changes</h2>
  <CodeBlock :code="staged" lang="js" />

  <h2>Scan only what a branch adds</h2>
  <CodeBlock :code="prDiff" lang="js" title="scripts/check-pr.mjs" />
  <DocCallout tone="tip">
    In CI, fetch the base branch first: <code>git fetch origin main --depth=1</code> (or use
    <code>fetch-depth: 0</code> on GitHub Actions).
  </DocCallout>

  <h2>Scan commit history</h2>
  <CodeBlock :code="history" lang="js" />
  <CodeBlock :code="shortcut" lang="js" title="Shortcut" />

  <h2>API reference</h2>
  <h3>Repository</h3>
  <ApiItem signature="isGitRepo(cwd?)" returns="Promise<boolean>">True inside a work tree. Never throws.</ApiItem>
  <ApiItem signature="getRepoRoot(cwd?)" returns="Promise<string>">Absolute path of the top-level folder.</ApiItem>
  <ApiItem signature="getCurrentBranch(cwd?)" returns="Promise<string>">Current branch name (<code>"HEAD"</code> when detached).</ApiItem>
  <ApiItem signature="getBranches({ cwd?, all? })" returns="Promise<string[]>">Local branches; <code>all: true</code> includes remote-tracking ones.</ApiItem>

  <h3>Staging area</h3>
  <ApiItem signature="getStagedFiles({ cwd?, absolute = true })" returns="Promise<string[]>">
    Added, copied and modified staged files (deleted files are excluded). Set <code>absolute: false</code> for
    repo-relative paths.
  </ApiItem>
  <ApiItem signature="getStagedContent(file, { cwd? })" returns="Promise<string>">
    The staged blob (<code>git show :path</code>). Accepts absolute or repo-relative paths.
  </ApiItem>
  <ApiItem signature="getStagedDiff({ cwd? })" returns="Promise<string>">Unified diff of everything staged.</ApiItem>

  <h3>Diffs &amp; changed files</h3>
  <ApiItem signature="getDiff(rangeOrRef?, { cwd? })" returns="Promise<string>">
    <code>git diff</code> for a ref or range such as <code>HEAD~1</code> or <code>origin/main...HEAD</code>; working tree
    vs index when omitted.
  </ApiItem>
  <ApiItem signature="parseDiff(rawDiff)" returns="{ file, addedLines: { lineNumber, content }[] }[]">
    Turns a unified diff into the lines each file gains. Files with no additions are left out.
  </ApiItem>
  <ApiItem signature="getChangedFiles({ since?, untracked = true, absolute = true, cwd? })" returns="Promise<string[]>">
    Without <code>since</code>: unstaged + staged changes. With <code>since</code> (a ref): files changed relative to
    it. Untracked files are included unless <code>untracked: false</code>.
  </ApiItem>

  <h3>Commits</h3>
  <ApiItem signature="getCommits({ limit = 20, since?, until?, branch?, cwd? })" returns="Promise<{ hash, author, email, date, message }[]>">
    <code>since</code> / <code>until</code> take anything <code>git log</code> accepts (<code>"2 weeks ago"</code>,
    <code>"2026-01-01"</code>).
  </ApiItem>
  <ApiItem signature="scanHistory({ since?, until?, branch?, limit = 50, cwd? })" returns="Promise<{ hash, author, email, date, message, patch }[]>">
    Same as <code>getCommits</code>, plus each commit's full <code>patch</code>.
  </ApiItem>
  <ApiItem signature="git(args, { cwd?, maxBuffer = 10 MB })" returns="Promise<string>">
    Low-level helper: runs <code>git</code> with an argument array (no shell) and returns stdout.
  </ApiItem>

  <DocCallout tone="warning" title="History scans see deleted lines too">
    A commit patch contains removed lines as well as added ones, so a secret you already deleted still shows up in
    history scans. That's intentional — it's still in the repository. Rotate the secret, then rewrite history if needed.
  </DocCallout>
</template>
