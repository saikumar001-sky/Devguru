<script setup lang="ts">
import { computed, ref } from "vue";
import { scanText, type Severity } from "@secrethawk/core";
import { filterRules } from "@secrethawk/rules";
import { RotateCcw, ShieldCheck } from "lucide-vue-next";
import CodeEditor from "@/components/ui/CodeEditor.vue";
import AppButton from "@/components/ui/AppButton.vue";
import SegmentedControl from "@/components/ui/SegmentedControl.vue";
import CodeBlock from "@/components/docs/CodeBlock.vue";

// Sample secrets are assembled at runtime so this source file never contains a contiguous
// token that GitHub push protection (or SecretHawk itself) would flag.
const fake = (prefix: string, body: string) => prefix + body;
const SAMPLE = `// config.js — paste your own code here; nothing leaves the browser
export const aws = {
  accessKeyId: "${fake("AKIA", "Q4XZ7N2LPR5TWY3B")}",
  region: "ap-south-1",
};

const github = "${fake("ghp_", "T9kLq2Wm8Zr4Xv6Bn1Cs7Df3Gh5Jk0Pq8Rt2Yu")}";
const db = "postgres://admin:${fake("Sup3r", "S3cret!")}@db.internal:5432/app";
const jwt = "${fake("eyJhbGciOiJIUzI1NiJ9", ".eyJzdWIiOiI0MiJ9.c2lnbmF0dXJlLWV4YW1wbGU")}";
const password = "${fake("Xk9#mQ", "2$vL7pW")}";

// Suppressed on purpose:
const docsExample = "${fake("AKIA", "IOSFODNN7EXAMPLE")}"; // secrethawk-ignore: aws-access-key
`;

const code = ref(SAMPLE);
const minSeverity = ref<"all" | Severity>("all");
const allowlistText = ref("");

const rules = computed(() =>
  filterRules({ minSeverity: minSeverity.value === "all" ? undefined : minSeverity.value }),
);

const scan = computed(() => {
  const started = performance.now();
  const allowlist = allowlistText.value.split(",").map((s) => s.trim()).filter(Boolean);
  const findings = scanText(code.value, { rules: rules.value, file: "playground.js", allowlist });
  findings.sort((a, b) => a.line - b.line || a.column - b.column);
  return { findings, ms: performance.now() - started };
});

const counts = computed(() => {
  const c = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const f of scan.value.findings) c[f.severity]++;
  return c;
});

const severityClass: Record<Severity, string> = {
  critical: "bg-danger-soft text-danger",
  high: "bg-warning-soft text-warning",
  medium: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  low: "bg-surface-2 text-muted",
};

const cliEquivalent = computed(() => {
  const parts = ["npx secrethawk scan ./config.js"];
  if (minSeverity.value !== "all") parts.push(`--severity ${minSeverity.value}`);
  return parts.join(" ");
});
</script>

<template>
  <p>
    This page runs the published <code>@secrethawk/core</code> and <code>@secrethawk/rules</code> packages in your
    browser — the same engine the CLI uses. Edit the code to see what gets flagged, what's suppressed and why.
  </p>

  <div class="not-prose my-5 flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-3">
      <SegmentedControl
        v-model="minSeverity"
        :options="[
          { value: 'all', label: 'All rules' },
          { value: 'high', label: 'High +' },
          { value: 'critical', label: 'Critical only' },
        ]"
        aria-label="Minimum severity"
      />
      <input v-model="allowlistText" class="field max-w-xs text-xs" placeholder="Allowlist, comma-separated" aria-label="Allowlist" />
      <AppButton size="sm" variant="ghost" :icon="RotateCcw" @click="code = SAMPLE">Reset sample</AppButton>
    </div>

    <div class="h-[380px] overflow-hidden rounded-xl border border-border">
      <CodeEditor v-model="code" language="javascript" />
    </div>

    <div class="flex flex-wrap items-center gap-2 text-xs">
      <span class="font-semibold">{{ scan.findings.length }} finding{{ scan.findings.length === 1 ? "" : "s" }}</span>
      <template v-for="(n, sev) in counts" :key="sev">
        <span v-if="n" :class="severityClass[sev]" class="rounded-full px-2 py-0.5 font-semibold uppercase">{{ n }} {{ sev }}</span>
      </template>
      <span class="ml-auto text-muted">{{ rules.length }} rules · {{ scan.ms.toFixed(1) }} ms</span>
    </div>

    <ul v-if="scan.findings.length" class="divide-y divide-border overflow-hidden rounded-xl border border-border">
      <li v-for="f in scan.findings" :key="f.id" class="flex flex-wrap items-start gap-x-4 gap-y-1 px-4 py-3 text-sm">
        <span :class="severityClass[f.severity]" class="mt-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase">{{ f.severity }}</span>
        <div class="min-w-0 flex-1">
          <p class="font-medium">{{ f.ruleName }} <code class="font-mono text-xs text-muted">{{ f.ruleId }}</code></p>
          <p class="mt-0.5 font-mono text-xs break-all">{{ f.match }}</p>
        </div>
        <div class="text-right font-mono text-xs text-muted">
          <p>line {{ f.line }}:{{ f.column }}</p>
          <p>entropy {{ f.entropy }} · {{ f.confidence }}%</p>
        </div>
      </li>
    </ul>
    <p v-else class="flex items-center justify-center gap-2 rounded-xl border border-border py-8 text-sm text-success">
      <ShieldCheck class="size-4" /> No secrets found
    </p>
  </div>

  <h3>Same check from the terminal</h3>
  <CodeBlock :code="cliEquivalent" lang="bash" />
  <p class="text-sm text-muted">
    The sample values are randomly generated and not real credentials.
  </p>
</template>
