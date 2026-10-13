<script setup lang="ts">
import { computed } from "vue";
import { Download, Eraser, Sparkles } from "lucide-vue-next";
import ToolPage from "@/components/layout/ToolPage.vue";
import AppPanel from "@/components/ui/AppPanel.vue";
import AppButton from "@/components/ui/AppButton.vue";
import CopyButton from "@/components/ui/CopyButton.vue";
import CodeEditor, { type EditorProblem } from "@/components/ui/CodeEditor.vue";
import SegmentedControl from "@/components/ui/SegmentedControl.vue";
import ToggleSwitch from "@/components/ui/ToggleSwitch.vue";
import InlineAlert from "@/components/ui/InlineAlert.vue";
import { useLocalStorage } from "@/composables/useLocalStorage";
import { jsonStats, locateJsonError, parseJson, sortKeysDeep } from "@/lib/json";
import { downloadText, formatBytes } from "@/lib/format";

type Indent = "2" | "4" | "tab" | "min";

const SAMPLE = `{"id":42,"name":"DevEase","tags":["dev","qa"],"owner":{"email":"team@example.com","active":true},"limits":{"rpm":600,"burst":null}}`;

const input = useLocalStorage("json-formatter", SAMPLE);
const indent = useLocalStorage<Indent>("json-formatter:indent", "2");
const sortKeys = useLocalStorage("json-formatter:sort", false);

const indents = [
  { value: "2" as const, label: "2 spaces" },
  { value: "4" as const, label: "4 spaces" },
  { value: "tab" as const, label: "Tab" },
  { value: "min" as const, label: "Minify" },
];

const parsed = computed(() => (input.value.trim() ? parseJson(input.value) : null));

const output = computed(() => {
  if (!parsed.value?.ok) return "";
  const value = sortKeys.value ? sortKeysDeep(parsed.value.value) : parsed.value.value;
  const space = { "2": 2, "4": 4, tab: "\t", min: undefined }[indent.value];
  return JSON.stringify(value, null, space);
});

const encoder = new TextEncoder();
const inputSize = computed(() => encoder.encode(input.value).length);
const outputSize = computed(() => encoder.encode(output.value).length);

const stats = computed(() => (parsed.value?.ok ? jsonStats(parsed.value.value) : null));

function lintJson(text: string): EditorProblem[] {
  if (!text.trim()) return [];
  const error = locateJsonError(text);
  return error ? [{ offset: error.offset, message: error.message }] : [];
}
</script>

<template>
  <ToolPage>
    <template #actions>
      <AppButton :icon="Sparkles" variant="ghost" @click="input = SAMPLE">Sample</AppButton>
      <AppButton :icon="Eraser" variant="ghost" @click="input = ''">Clear</AppButton>
    </template>

    <div class="flex flex-wrap items-center gap-3">
      <SegmentedControl v-model="indent" :options="indents" aria-label="Indentation" />
      <ToggleSwitch v-model="sortKeys" label="Sort keys" />
    </div>

    <div class="grid gap-4 lg:h-[calc(100dvh-19rem)] lg:min-h-[460px] lg:grid-cols-2">
      <AppPanel title="Input" flush class="h-[50vh] lg:h-auto">
        <template #actions>
          <span class="text-xs text-muted">{{ formatBytes(inputSize) }}</span>
        </template>
        <CodeEditor v-model="input" language="json" :lint="lintJson" />
      </AppPanel>

      <AppPanel title="Output" flush class="h-[50vh] lg:h-auto">
        <template #actions>
          <AppButton size="sm" :icon="Download" :disabled="!output" @click="downloadText(output, 'formatted.json', 'application/json')">
            Download
          </AppButton>
          <CopyButton :text="output" />
        </template>
        <CodeEditor :model-value="output" language="json" readonly />
      </AppPanel>
    </div>

    <InlineAlert v-if="parsed && !parsed.ok">
      <span v-if="parsed.line">Line {{ parsed.line }}, column {{ parsed.column }}: </span>{{ parsed.message }}
    </InlineAlert>
    <InlineAlert v-else-if="stats" tone="success">
      Valid JSON · {{ stats.type }} · {{ stats.keys }} keys · depth {{ stats.depth }} ·
      {{ formatBytes(outputSize) }} output
    </InlineAlert>
  </ToolPage>
</template>
