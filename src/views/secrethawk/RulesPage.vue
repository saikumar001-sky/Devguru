<script setup lang="ts">
import { computed, ref } from "vue";
import { allRules } from "@secrethawk/rules";
import { Search } from "lucide-vue-next";
import CodeBlock from "@/components/docs/CodeBlock.vue";
import ApiItem from "@/components/docs/ApiItem.vue";
import DocCallout from "@/components/docs/DocCallout.vue";
import SegmentedControl from "@/components/ui/SegmentedControl.vue";

const query = ref("");
const severity = ref<"all" | "critical" | "high">("all");
const open = ref<string | null>(null);

const rules = computed(() => {
  const q = query.value.trim().toLowerCase();
  return allRules.filter(
    (r) =>
      (severity.value === "all" || r.severity === severity.value) &&
      (!q || [r.id, r.name, r.category, r.description].some((s) => s?.toLowerCase().includes(q))),
  );
});

const severityClass = (s?: string) =>
  s === "critical" ? "bg-danger-soft text-danger" : s === "high" ? "bg-warning-soft text-warning" : "bg-surface-2 text-muted";

const filtering = `
import { allRules, filterRules, getRuleById } from "@secrethawk/rules";

allRules.length;                                // 18
getRuleById("github-pat")?.severity;            // "critical"

filterRules({ minSeverity: "critical" });       // only critical rules
filterRules({ enabled: ["aws-access-key", "jwt"] });
filterRules({ enabled: ["*"], disabled: ["jwt", "password-assignment"] });
`;

const custom = `
import { scanDirectory } from "@secrethawk/code";
import { defaultRules, validateRule } from "@secrethawk/rules";

const internalApiKey = {
  id: "acme-api-key",
  name: "Acme Internal API Key",
  category: "internal",
  severity: "critical",          // "critical" | "high" | "medium" | "low"
  confidence: 95,                // shown in reports, 0–100
  description: "Keys for the Acme internal gateway.",
  pattern: /\\bacme_[a-z]{2}_[A-Za-z0-9]{32}\\b/g,
  minEntropy: 3.5,               // optional: drop low-randomness matches
};

const { valid, errors } = validateRule(internalApiKey);
if (!valid) throw new Error(errors.join(", "));

const result = await scanDirectory(".", { rules: [...defaultRules, internalApiKey] });
`;
</script>

<template>
  <p>
    <code>@secrethawk/rules</code> ships {{ allRules.length }} detection rules. Each is a plain object with a regex, a
    severity and a confidence score. The table below is generated from the installed package, so it is always accurate.
  </p>

  <h2>Built-in rules</h2>
  <div class="not-prose my-3 flex flex-wrap items-center gap-3">
    <label class="relative w-full sm:w-64">
      <Search class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
      <input v-model="query" class="field pl-9" placeholder="Filter rules…" aria-label="Filter rules" />
    </label>
    <SegmentedControl
      v-model="severity"
      :options="[
        { value: 'all', label: 'All' },
        { value: 'critical', label: 'Critical' },
        { value: 'high', label: 'High' },
      ]"
      aria-label="Severity"
    />
  </div>
  <div class="not-prose overflow-x-auto rounded-xl border border-border">
    <table class="w-full text-left text-sm">
      <thead class="bg-surface-2 text-xs text-muted">
        <tr>
          <th class="px-3 py-2 font-medium">Rule ID</th>
          <th class="px-3 py-2 font-medium">Category</th>
          <th class="px-3 py-2 font-medium">Severity</th>
          <th class="px-3 py-2 text-right font-medium">Confidence</th>
          <th class="px-3 py-2 text-right font-medium">Min entropy</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="rule in rules" :key="rule.id">
          <tr class="cursor-pointer border-t border-border hover:bg-surface-2" @click="open = open === rule.id ? null : rule.id">
            <td class="px-3 py-2">
              <code class="font-mono text-[13px]">{{ rule.id }}</code>
              <span class="block text-xs text-muted">{{ rule.name }}</span>
            </td>
            <td class="px-3 py-2 text-muted">{{ rule.category }}</td>
            <td class="px-3 py-2">
              <span :class="severityClass(rule.severity)" class="rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase">{{ rule.severity }}</span>
            </td>
            <td class="px-3 py-2 text-right font-mono">{{ rule.confidence }}%</td>
            <td class="px-3 py-2 text-right font-mono text-muted">{{ rule.minEntropy ?? "—" }}</td>
          </tr>
          <tr v-if="open === rule.id" class="bg-surface-2/60">
            <td colspan="5" class="px-3 pt-1 pb-3">
              <p class="mb-2 text-sm">{{ rule.description }}</p>
              <code class="block overflow-x-auto rounded-lg bg-surface p-2 font-mono text-xs break-all">/{{ rule.pattern.source }}/{{ rule.pattern.flags }}</code>
            </td>
          </tr>
        </template>
        <tr v-if="!rules.length"><td colspan="5" class="px-3 py-8 text-center text-muted">No rules match.</td></tr>
      </tbody>
    </table>
  </div>
  <p class="text-sm text-muted">Click a row to see the rule's description and regular expression.</p>

  <DocCallout tone="info" title="Entropy">
    <code>password-assignment</code>, <code>api-key-assignment</code>, <code>secret-assignment</code> and
    <code>aws-secret-access-key</code> only report matches whose Shannon entropy reaches the minimum shown above. The
    entropy is measured over the whole match — including the variable name — so placeholder values can still be
    reported; allowlist them or add a <code>secrethawk-ignore</code> comment.
  </DocCallout>

  <h2>Choosing rules</h2>
  <ul>
    <li>Config: <code>rules.enabled</code> / <code>rules.disabled</code> — see <RouterLink to="/secrethawk/config">Configuration</RouterLink>.</li>
    <li>CLI: <code>--rules aws-access-key,jwt</code> or <code>--severity critical</code>.</li>
    <li>List them in the terminal: <code>npx secrethawk rules</code>.</li>
  </ul>
  <CodeBlock :code="filtering" lang="js" />

  <h2>Writing a custom rule</h2>
  <p>
    Rules are plain objects, so you can add your own to any programmatic scan. (The CLI and hooks only run built-in
    rules.)
  </p>
  <CodeBlock :code="custom" lang="js" />
  <table>
    <thead><tr><th>Field</th><th>Required</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td><code>id</code></td><td>yes</td><td>Unique kebab-case ID; used in config, suppression comments and reports.</td></tr>
      <tr><td><code>name</code></td><td>yes</td><td>Human-readable name.</td></tr>
      <tr><td><code>pattern</code></td><td>yes</td><td>A <code>RegExp</code>. The <code>g</code> flag is added automatically; the whole match is reported.</td></tr>
      <tr><td><code>severity</code></td><td>no</td><td><code>critical</code>, <code>high</code> (default), <code>medium</code> or <code>low</code>.</td></tr>
      <tr><td><code>confidence</code></td><td>no</td><td>0–100, default 80.</td></tr>
      <tr><td><code>minEntropy</code></td><td>no</td><td>Skip matches with lower Shannon entropy.</td></tr>
      <tr><td><code>entropy</code></td><td>no</td><td><code>true</code> to use the global <code>entropy.threshold</code> (default 3.5) when <code>minEntropy</code> isn't set.</td></tr>
      <tr><td><code>category</code>, <code>description</code></td><td>no</td><td>Shown by <code>secrethawk rules</code> and in reports.</td></tr>
    </tbody>
  </table>

  <h2>API</h2>
  <ApiItem signature="allRules, defaultRules" returns="Rule[]">Every built-in rule. <code>defaultRules</code> is a copy used when no rules are passed.</ApiItem>
  <ApiItem signature="filterRules({ enabled?, disabled?, minSeverity? })" returns="Rule[]">
    Filters <code>allRules</code>. <code>enabled</code> containing <code>"*"</code> (or empty) keeps everything.
  </ApiItem>
  <ApiItem signature="getRuleById(id)" returns="Rule | undefined">Case-insensitive lookup.</ApiItem>
  <ApiItem signature="validateRule(rule)" returns="{ valid, errors }">Checks <code>id</code>, <code>name</code> and <code>pattern</code>.</ApiItem>
  <p>
    Each rule is also exported individually (for example <code>awsAccessKeyRule</code>), along with per-provider groups
    such as <code>awsRules</code>, <code>githubRules</code> and <code>stripeRules</code>.
  </p>
</template>
