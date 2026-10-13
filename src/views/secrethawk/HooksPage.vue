<script setup lang="ts">
import CodeBlock from "@/components/docs/CodeBlock.vue";
import ApiItem from "@/components/docs/ApiItem.vue";
import DocCallout from "@/components/docs/DocCallout.vue";

const flow = ["git commit", ".git/hooks/pre-commit", "secrethawk hooks run pre-commit", "scan staged files", "secrets found?"];

const preCommitScript = `
#!/bin/sh
# SecretHawk pre-commit hook
# Automatically blocks commits containing exposed secrets

if command -v secrethawk >/dev/null 2>&1; then
  secrethawk hooks run pre-commit
elif command -v npx >/dev/null 2>&1; then
  npx secrethawk hooks run pre-commit
else
  node ./node_modules/@secrethawk/cli/bin/secrethawk.js hooks run pre-commit
fi
`;

const blocked = `
$ git commit -m "add config"

❌ Commit rejected: Exposed secrets detected in staged files!

🦅 SecretHawk - Security Scan Report
════════════════════════════════════════════════════════════
src/config.js
  [CRITICAL] AWS Access Key at line 12:15
    Secret: AKIA************MPLE (entropy: 3.68)
────────────────────────────────────────────────────────────
Please remove or allowlist the secrets before committing.
`;

const husky = `
# Husky v9
npm install -D husky secrethawk
npx husky init

echo "npx secrethawk hooks run pre-commit" > .husky/pre-commit
echo "npx secrethawk hooks run pre-push"   > .husky/pre-push
`;

const lefthook = `
# lefthook.yml
pre-commit:
  commands:
    secrethawk:
      run: npx secrethawk hooks run pre-commit
pre-push:
  commands:
    secrethawk:
      run: npx secrethawk hooks run pre-push
`;

const simpleGitHooks = `
{
  "devDependencies": {
    "secrethawk": "^0.1.1",
    "simple-git-hooks": "^2.11.0"
  },
  "simple-git-hooks": {
    "pre-commit": "npx secrethawk hooks run pre-commit",
    "pre-push": "npx secrethawk hooks run pre-push"
  },
  "scripts": {
    "prepare": "simple-git-hooks"
  }
}
`;

const programmatic = `
import { installHooks, runPreCommitHook, uninstallHooks } from "@secrethawk/hooks";

// Only the pre-commit hook
const { installed } = await installHooks({ prePush: false });
console.log("Installed:", installed); // ["pre-commit"]

// Run the same check yourself, e.g. from another hook manager
const { passed, findings, filesScanned } = await runPreCommitHook();
if (!passed) {
  for (const f of findings) console.error(\`\${f.file}:\${f.line} \${f.ruleName} \${f.match}\`);
  process.exit(1);
}

// Remove them again — only files containing "SecretHawk" are deleted
const { removed } = await uninstallHooks();
`;
</script>

<template>
  <p>
    <code>@secrethawk/hooks</code> stops secrets on the developer's machine: a <strong>pre-commit</strong> hook scans the
    staged version of each file, and a <strong>pre-push</strong> hook re-checks recent commits before they leave.
  </p>

  <div class="not-prose my-6 flex flex-wrap items-center gap-2 text-xs">
    <template v-for="(step, i) in flow" :key="step">
      <span class="rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 font-mono">{{ step }}</span>
      <span v-if="i < flow.length - 1" class="text-muted">→</span>
    </template>
    <span class="text-muted">→</span>
    <span class="rounded-lg bg-danger-soft px-2.5 py-1.5 font-medium text-danger">yes: block (exit 1)</span>
    <span class="rounded-lg bg-success-soft px-2.5 py-1.5 font-medium text-success">no: allow (exit 0)</span>
  </div>

  <h2>Install</h2>
  <CodeBlock
code="npm install -D secrethawk
npx secrethawk hooks install
# ✔ Git hooks successfully installed: pre-commit, pre-push" lang="bash" />
  <p>This writes two executable scripts into <code>.git/hooks/</code>. Each finds the CLI the fastest way available:</p>
  <CodeBlock :code="preCommitScript" lang="bash" title=".git/hooks/pre-commit" />

  <h3>Share it with your team</h3>
  <p>
    <code>.git/hooks</code> is not committed, so every clone needs its own install. Add a <code>prepare</code> script and
    it happens on <code>npm install</code>:
  </p>
  <CodeBlock code='{ "scripts": { "prepare": "secrethawk hooks install || true" } }' lang="json" title="package.json" />

  <h2>What each hook checks</h2>
  <table>
    <thead><tr><th>Hook</th><th>Scans</th><th>Config used</th></tr></thead>
    <tbody>
      <tr>
        <td><code>pre-commit</code></td>
        <td>The staged (index) content of every added, copied or modified file — exactly what the commit will contain, even if the working copy differs.</td>
        <td>Rules, allowlist, entropy threshold</td>
      </tr>
      <tr>
        <td><code>pre-push</code></td>
        <td>The patches of the 10 most recent commits on the current branch.</td>
        <td>Rules and allowlist</td>
      </tr>
    </tbody>
  </table>
  <p>When a check fails you'll see:</p>
  <CodeBlock :code="blocked" lang="text" title="Terminal" />

  <h3>Fixing a blocked commit</h3>
  <ol>
    <li>Move the value into an environment variable or secret manager, then <code>git add</code> the fixed file.</li>
    <li>If it's a fake value (test fixture, docs example), add <code>// secrethawk-ignore</code> on that line or put it in the <RouterLink to="/secrethawk/config">allowlist</RouterLink>.</li>
    <li>If the secret was real, <strong>rotate it</strong> — it may already be in your shell history, editor backups or an earlier commit.</li>
  </ol>
  <DocCallout tone="warning" title="Hooks can be skipped">
    <code>git commit --no-verify</code> bypasses every hook. Treat hooks as a fast first line of defence and also run
    <code>secrethawk scan</code> in <RouterLink to="/secrethawk/reporters">CI</RouterLink>, where it can't be skipped.
  </DocCallout>

  <h2>Using Husky, lefthook or simple-git-hooks</h2>
  <DocCallout tone="danger" title="Don't mix hooks install with a hook manager">
    Husky sets <code>core.hooksPath</code>, so Git stops reading <code>.git/hooks</code> and the scripts written by
    <code>secrethawk hooks install</code> never run. And if your hooks do live in <code>.git/hooks</code>,
    <code>hooks install</code> <strong>overwrites</strong> any existing <code>pre-commit</code> / <code>pre-push</code>
    file. With a hook manager, call <code>secrethawk hooks run …</code> from it instead.
  </DocCallout>
  <CodeBlock :code="husky" lang="bash" title="Husky" />
  <CodeBlock :code="lefthook" lang="yaml" title="lefthook.yml" />
  <CodeBlock :code="simpleGitHooks" lang="json" title="package.json (simple-git-hooks)" />
  <p>
    With <strong>lint-staged</strong>, don't pass file names to SecretHawk — run <code>secrethawk scan --staged</code> as
    a separate hook step so it reads the staged content itself.
  </p>

  <h2>Run the checks manually</h2>
  <CodeBlock
code="npx secrethawk hooks run pre-commit   # ✔ SecretHawk pre-commit check passed.
npx secrethawk hooks run pre-push" lang="bash" />

  <h2>Uninstall</h2>
  <CodeBlock
code="npx secrethawk hooks uninstall
# ✔ Removed SecretHawk Git hooks: pre-commit, pre-push" lang="bash" />
  <p>Only hook files containing the text <code>SecretHawk</code> are removed; other hooks are left alone.</p>

  <h2>Programmatic API</h2>
  <CodeBlock :code="programmatic" lang="js" />
  <ApiItem signature="installHooks({ cwd?, preCommit = true, prePush = true })" returns="Promise<{ installed: string[] }>">
    Writes the hook scripts (mode <code>755</code>) into <code>&lt;repo root&gt;/.git/hooks</code>. Throws when
    <code>cwd</code> isn't inside a Git repository.
  </ApiItem>
  <ApiItem signature="uninstallHooks({ cwd? })" returns="Promise<{ removed: string[] }>">
    Deletes SecretHawk's hook files. Returns <code>{ removed: [] }</code> outside a repository.
  </ApiItem>
  <ApiItem signature="runPreCommitHook({ cwd? })" returns="Promise<{ passed, findings, filesScanned }>">
    Scans staged content using the project config. <code>passed</code> is <code>true</code> when there are no staged
    files.
  </ApiItem>
  <ApiItem signature="runPrePushHook({ cwd? })" returns="Promise<{ passed, findings }>">
    Scans the last 10 commits' patches using the project config.
  </ApiItem>
</template>
