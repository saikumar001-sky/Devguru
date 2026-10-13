<script setup lang="ts">
import { computed, ref } from "vue";
import { allRules } from "@secrethawk/rules";
import { Download } from "lucide-vue-next";
import CodeBlock from "@/components/docs/CodeBlock.vue";
import ApiItem from "@/components/docs/ApiItem.vue";
import DocCallout from "@/components/docs/DocCallout.vue";
import AppButton from "@/components/ui/AppButton.vue";
import SegmentedControl from "@/components/ui/SegmentedControl.vue";
import { downloadText } from "@/lib/format";

const defaults = `
{
  "rules": { "enabled": ["*"], "disabled": [] },
  "ignore": ["node_modules/**", "dist/**", "build/**", "coverage/**", ".git/**"],
  "allowlist": [],
  "entropy": { "enabled": true, "threshold": 4.0 },
  "maxFileSize": 5242880
}
`;

const allowlistExample = `
{
  "allowlist": [
    "AKIAIOSFODNN7EXAMPLE",
    "^sk_test_",
    { "rule": "jwt", "file": "tests/fixtures/" },
    { "rule": "database-url", "pattern": "localhost|127\\\\.0\\\\.0\\\\.1" }
  ]
}
`;

const suppression = `
// Ignore every rule on this line
const demoToken = "ghp_${"x".repeat(36)}"; // secrethawk-ignore

// Ignore one specific rule
const awsExample = "AKIAIOSFODNN7EXAMPLE"; // secrethawk-ignore: aws-access-key

// A comment on the line above works too
// secrethawk-ignore
const fixture = "sk_${"live"}_${"x".repeat(24)}";
`;

const pyStyle = `
# Works with #, // and /* comments, so .env, YAML, shell and Python files are covered
DATABASE_URL=postgres://user:pass@localhost/dev  # secrethawk-ignore: database-url
`;

const programmatic = `
import { loadConfig, validateConfig, writeConfig, DEFAULT_CONFIG } from "@secrethawk/config";

const { config, configPath } = await loadConfig();          // search from process.cwd()
const ci = await loadConfig(process.cwd(), "ci/secrethawk.json"); // explicit file

const { valid, errors } = validateConfig({ ignore: "dist/**" });
// valid === false, errors[0] === "'ignore' must be an array of glob strings"

await writeConfig(".secret-hawk.json", { ...DEFAULT_CONFIG, allowlist: ["example-token"] });
`;

// ---- Interactive builder ----
const target = ref<"file" | "package">("file");
const selected = ref<string[]>(allRules.map((r) => r.id));
const ignore = ref("node_modules/**\ndist/**\nbuild/**\ncoverage/**\n.git/**");
const allowlist = ref("");
const threshold = ref(4);
const maxMb = ref(5);

const lines = (text: string) => text.split("\n").map((l) => l.trim()).filter(Boolean);

const built = computed(() => {
  const config = {
    rules: {
      enabled: selected.value.length === allRules.length ? ["*"] : selected.value,
      disabled: [] as string[],
    },
    ignore: lines(ignore.value),
    allowlist: lines(allowlist.value),
    entropy: { enabled: true, threshold: Number(threshold.value) || 4 },
    maxFileSize: Math.round((Number(maxMb.value) || 5) * 1024 * 1024),
  };
  return target.value === "file"
    ? JSON.stringify(config, null, 2)
    : JSON.stringify({ secrethawk: config }, null, 2);
});

function toggleAll(on: boolean) {
  selected.value = on ? allRules.map((r) => r.id) : [];
}
</script>

<template>
  <p>
    SecretHawk works with zero configuration. Add a config file to choose rules, skip paths and allow known-safe
    values. <code>@secrethawk/config</code> finds, merges and validates it; the CLI and hooks use it automatically.
  </p>

  <h2>Where the config lives</h2>
  <p>Starting in the current folder and walking up to the filesystem root, the first match wins. In each folder:</p>
  <ol>
    <li><code>.secret-hawk.json</code></li>
    <li><code>.secrethawk.json</code></li>
    <li><code>.secrethawkrc.json</code></li>
    <li><code>.secrethawkrc</code> (JSON)</li>
    <li>a <code>"secrethawk"</code> object in <code>package.json</code></li>
  </ol>
  <p>
    <code>--config &lt;file&gt;</code> skips the search. Run <code>npx secrethawk config</code> to see the result and
    where it came from. Your file is deep-merged over the defaults — objects merge, arrays <strong>replace</strong>.
  </p>
  <CodeBlock :code="defaults" lang="json" title="Defaults" />

  <h2>Options</h2>
  <table>
    <thead><tr><th>Key</th><th>Type</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td><code>rules.enabled</code></td><td><code>string[]</code></td><td>Rule IDs to run, or <code>["*"]</code> for all. See <RouterLink to="/secrethawk/rules">Rules</RouterLink>.</td></tr>
      <tr><td><code>rules.disabled</code></td><td><code>string[]</code></td><td>Rule IDs to turn off; wins over <code>enabled</code>.</td></tr>
      <tr><td><code>ignore</code></td><td><code>string[]</code></td><td>Globs skipped by directory scans, in addition to the built-in list. Staged and history scans don't use it.</td></tr>
      <tr><td><code>allowlist</code></td><td><code>array</code></td><td>Matches to ignore everywhere — see below.</td></tr>
      <tr><td><code>entropy.threshold</code></td><td><code>number</code></td><td>Minimum Shannon entropy for custom rules that set <code>entropy: true</code> without their own <code>minEntropy</code>. Built-in rules carry their own minimums.</td></tr>
      <tr><td><code>entropy.enabled</code></td><td><code>boolean</code></td><td>Kept for compatibility; entropy checks currently always run.</td></tr>
      <tr><td><code>maxFileSize</code></td><td><code>number</code></td><td>Byte limit, for your own scripts to pass to <code>scanDirectory</code> (the CLI uses the 5 MB default).</td></tr>
    </tbody>
  </table>
  <DocCallout tone="warning" title="init enables only six rules">
    <code>secrethawk init</code> writes a starter file with six rules enabled. Without a config file, all 18 run. Use
    <code>["*"]</code> (or the builder below) to get everything.
  </DocCallout>

  <h2>Allowlist</h2>
  <p>Each entry can be:</p>
  <ul>
    <li><strong>A string</strong> — ignored if the secret contains it, or if it matches the string as a regular expression.</li>
    <li><strong>An object</strong> <code>{ rule?, file?, pattern? }</code> — every given field must match: rule ID, a substring of the file path, and a regex for the secret.</li>
  </ul>
  <CodeBlock :code="allowlistExample" lang="json" title=".secret-hawk.json" />
  <DocCallout tone="info">
    Strings double as regexes, so escape regex characters such as <code>.</code> or <code>+</code> when you mean them
    literally, and keep entries specific — <code>"test"</code> would ignore every secret containing “test”.
  </DocCallout>

  <h2>Inline suppression</h2>
  <p>For one-off fixtures, suppress findings right in the code:</p>
  <CodeBlock :code="suppression" lang="js" />
  <CodeBlock :code="pyStyle" lang="bash" title=".env" />
  <p>
    Recognised markers: <code>secrethawk-ignore</code>, <code>secrethawk-disable</code>,
    <code>secrethawk-disable-line</code> and <code>secrethawk-skip</code>, after <code>//</code>, <code>#</code> or
    <code>/*</code>, on the same line or the line above. Add <code>: rule-id</code> to
    <code>ignore</code>/<code>disable</code> to target one rule.
  </p>

  <h2>Config builder</h2>
  <div class="not-prose my-4 grid gap-5 rounded-xl border border-border p-4 lg:grid-cols-2">
    <div class="flex flex-col gap-4 text-sm">
      <div>
        <span class="label">Save as</span>
        <SegmentedControl
          v-model="target"
          :options="[
            { value: 'file', label: '.secret-hawk.json' },
            { value: 'package', label: 'package.json field' },
          ]"
          aria-label="Config location"
        />
      </div>
      <div>
        <div class="mb-1.5 flex items-center justify-between">
          <span class="label mb-0">Rules ({{ selected.length }}/{{ allRules.length }})</span>
          <span class="flex gap-2 text-xs">
            <button class="cursor-pointer text-brand" @click="toggleAll(true)">All</button>
            <button class="cursor-pointer text-muted hover:text-fg" @click="toggleAll(false)">None</button>
          </span>
        </div>
        <div class="grid max-h-56 gap-1 overflow-y-auto rounded-lg border border-border p-2 scrollbar-thin sm:grid-cols-2">
          <label v-for="rule in allRules" :key="rule.id" class="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 hover:bg-surface-2">
            <input v-model="selected" type="checkbox" :value="rule.id" class="size-3.5 accent-[var(--brand)]" />
            <span class="truncate font-mono text-xs">{{ rule.id }}</span>
          </label>
        </div>
      </div>
      <label>
        <span class="label">Ignore globs (one per line)</span>
        <textarea v-model="ignore" rows="4" class="field-mono text-xs" />
      </label>
      <label>
        <span class="label">Allowlist (one per line)</span>
        <textarea v-model="allowlist" rows="3" class="field-mono text-xs" placeholder="AKIAIOSFODNN7EXAMPLE" />
      </label>
      <div class="grid grid-cols-2 gap-3">
        <label><span class="label">Entropy threshold</span><input v-model.number="threshold" type="number" step="0.1" min="0" class="field" /></label>
        <label><span class="label">Max file size (MB)</span><input v-model.number="maxMb" type="number" min="1" class="field" /></label>
      </div>
    </div>
    <div class="min-w-0">
      <CodeBlock :code="built" lang="json" :title="target === 'file' ? '.secret-hawk.json' : 'package.json (merge into yours)'" />
      <AppButton size="sm" :icon="Download" @click="downloadText(built, target === 'file' ? '.secret-hawk.json' : 'secrethawk.package.json', 'application/json')">
        Download
      </AppButton>
    </div>
  </div>

  <h2>Programmatic API</h2>
  <CodeBlock :code="programmatic" lang="js" />
  <ApiItem signature="loadConfig(cwd = process.cwd(), explicitPath?)" returns="Promise<{ config, configPath }>">
    Searches as described above, merges over the defaults and validates. <code>configPath</code> is
    <code>null</code> when the defaults were used. Throws on invalid JSON or an invalid config.
  </ApiItem>
  <ApiItem signature="validateConfig(config)" returns="{ valid, errors: string[] }">Checks the types of <code>rules</code>, <code>ignore</code>, <code>allowlist</code> and <code>entropy</code>.</ApiItem>
  <ApiItem signature="writeConfig(path, config = DEFAULT_CONFIG)" returns="Promise<void>">Writes pretty-printed JSON with a trailing newline.</ApiItem>
  <ApiItem signature="DEFAULT_CONFIG, createDefaultConfig()">The defaults shown above; <code>createDefaultConfig()</code> returns a fresh deep copy.</ApiItem>
</template>
