<script setup lang="ts">
import { computed, ref } from "vue";
import { Download, ShieldCheck, Sparkles } from "lucide-vue-next";
import ToolPage from "@/components/layout/ToolPage.vue";
import AppPanel from "@/components/ui/AppPanel.vue";
import AppButton from "@/components/ui/AppButton.vue";
import CopyButton from "@/components/ui/CopyButton.vue";
import SegmentedControl from "@/components/ui/SegmentedControl.vue";
import { useLocalStorage } from "@/composables/useLocalStorage";
import { REDACTION_RULES, redact, type RedactionStyle } from "@/lib/redact";
import { downloadText } from "@/lib/format";

const SAMPLE = `2026-10-13T09:30:12Z INFO  POST /api/login user=jane.doe@example.com ip=203.0.113.42
2026-10-13T09:30:12Z DEBUG headers={"Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI0MiJ9.dBjftJeZ4CVP"}
2026-10-13T09:30:13Z INFO  payment card=4111 1111 1111 1111 phone=+91 98765 43210 pan=ABCPE1234F
2026-10-13T09:30:13Z WARN  retrying db=postgres://admin:s3cr3tP@ss@db.internal:5432/app
2026-10-13T09:30:14Z ERROR config {"password": "hunter2", "api_key": "sk_live_51HxYzAbCdEfGh1234", "aws": "AKIAIOSFODNN7EXAMPLE"}
2026-10-13T09:30:15Z INFO  request_id=5a9bb58b-ded3-4de1-bb12-0ba907bbc829 took=182ms`;

const input = ref(SAMPLE);
const style = useLocalStorage<RedactionStyle>("redact:style", "label");
const enabled = useLocalStorage<string[]>(
  "redact:rules",
  REDACTION_RULES.filter((r) => r.defaultOn).map((r) => r.id),
);
const customTerms = useLocalStorage("redact:custom", "");

const styles = [
  { value: "label" as const, label: "[EMAIL]" },
  { value: "pseudonym" as const, label: "<EMAIL_1>" },
  { value: "mask" as const, label: "*****" },
  { value: "partial" as const, label: "***1234" },
];

const result = computed(() =>
  redact(input.value, new Set(enabled.value), style.value, customTerms.value.split(",")),
);
const total = computed(() => Object.values(result.value.counts).reduce((a, b) => a + b, 0));

function toggle(id: string) {
  enabled.value = enabled.value.includes(id) ? enabled.value.filter((x) => x !== id) : [...enabled.value, id];
}
</script>

<template>
  <ToolPage>
    <template #actions>
      <AppButton :icon="Sparkles" variant="ghost" @click="input = SAMPLE">Sample</AppButton>
      <SegmentedControl v-model="style" :options="styles" aria-label="Replacement style" />
    </template>

    <div class="grid gap-4 xl:grid-cols-[1fr_1fr_300px]">
      <AppPanel title="Input" description="Logs, JSON, stack traces, emails… processed locally.">
        <textarea v-model="input" rows="16" spellcheck="false" class="field-mono resize-y text-xs" placeholder="Paste text containing sensitive data…" />
      </AppPanel>

      <AppPanel title="Redacted" flush>
        <template #actions>
          <span class="text-xs font-medium" :class="total ? 'text-success' : 'text-muted'">{{ total }} redacted</span>
          <AppButton size="sm" :icon="Download" :disabled="!input" @click="downloadText(result.output, 'redacted.txt')">Download</AppButton>
          <CopyButton :text="result.output" />
        </template>
        <pre class="max-h-[470px] overflow-auto p-4 font-mono text-xs leading-relaxed break-words whitespace-pre-wrap scrollbar-thin"><template v-for="(seg, i) in result.segments" :key="i"><mark v-if="seg.ruleId" class="rounded-sm bg-brand-soft px-0.5 text-brand" :title="`${seg.ruleId}`">{{ seg.text }}</mark><template v-else>{{ seg.text }}</template></template></pre>
      </AppPanel>

      <AppPanel title="Detect" class="xl:row-span-2">
        <ul class="flex flex-col gap-1">
          <li v-for="rule in REDACTION_RULES" :key="rule.id">
            <label class="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 hover:bg-surface-2">
              <input
                type="checkbox"
                :checked="enabled.includes(rule.id)"
                class="mt-0.5 size-4 accent-[var(--brand)]"
                @change="toggle(rule.id)"
              />
              <span class="min-w-0 flex-1">
                <span class="block text-sm">{{ rule.label }}</span>
                <span class="block truncate font-mono text-[11px] text-muted">{{ rule.example }}</span>
              </span>
              <span
                v-if="result.counts[rule.id]"
                class="rounded-full bg-brand-soft px-1.5 py-0.5 text-[11px] font-semibold text-brand"
              >{{ result.counts[rule.id] }}</span>
            </label>
          </li>
        </ul>
        <div class="mt-4 border-t border-border pt-4">
          <label class="label" for="custom-terms">Custom terms (comma-separated)</label>
          <input id="custom-terms" v-model="customTerms" class="field" placeholder="Acme Corp, Project Falcon" />
          <p v-if="result.counts.custom" class="mt-1.5 text-xs text-muted">{{ result.counts.custom }} custom match(es)</p>
        </div>
        <p class="mt-4 flex gap-2 text-xs text-muted">
          <ShieldCheck class="size-4 shrink-0 text-success" />
          Pattern-based detection catches common formats but can miss things — review before sharing.
        </p>
      </AppPanel>
    </div>
  </ToolPage>
</template>
