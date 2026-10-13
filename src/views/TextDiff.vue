<script setup lang="ts">
import { computed, ref } from "vue";
import { diffChars, diffLines, diffWords, type ChangeObject } from "diff";
import { ArrowLeftRight, Eraser } from "lucide-vue-next";
import ToolPage from "@/components/layout/ToolPage.vue";
import AppPanel from "@/components/ui/AppPanel.vue";
import AppButton from "@/components/ui/AppButton.vue";
import SegmentedControl from "@/components/ui/SegmentedControl.vue";
import ToggleSwitch from "@/components/ui/ToggleSwitch.vue";

type Mode = "lines" | "words" | "chars";

const original = ref(`{
  "name": "devease",
  "version": "1.0.0",
  "private": true,
  "license": "MIT"
}`);
const changed = ref(`{
  "name": "devease",
  "version": "2.0.0",
  "private": true,
  "type": "module",
  "license": "MIT"
}`);
const mode = ref<Mode>("lines");
const ignoreCase = ref(false);
const ignoreWhitespace = ref(false);

const modes = [
  { value: "lines" as const, label: "Lines" },
  { value: "words" as const, label: "Words" },
  { value: "chars" as const, label: "Characters" },
];

const changes = computed<ChangeObject<string>[]>(() => {
  const opts = { ignoreCase: ignoreCase.value };
  if (mode.value === "lines") return diffLines(original.value, changed.value, { ...opts, ignoreWhitespace: ignoreWhitespace.value });
  if (mode.value === "words") return diffWords(original.value, changed.value, opts);
  return diffChars(original.value, changed.value, opts);
});

interface Row {
  kind: "added" | "removed" | "same";
  text: string;
  oldNo?: number;
  newNo?: number;
}

const rows = computed<Row[]>(() => {
  const out: Row[] = [];
  let oldNo = 1;
  let newNo = 1;
  for (const change of changes.value) {
    const lines = change.value.replace(/\n$/, "").split("\n");
    for (const text of lines) {
      if (change.added) out.push({ kind: "added", text, newNo: newNo++ });
      else if (change.removed) out.push({ kind: "removed", text, oldNo: oldNo++ });
      else out.push({ kind: "same", text, oldNo: oldNo++, newNo: newNo++ });
    }
  }
  return out;
});

const stats = computed(() => {
  const unit = mode.value === "lines" ? "count" : "value";
  let added = 0;
  let removed = 0;
  for (const c of changes.value) {
    const n = unit === "count" ? (c.count ?? 0) : c.value.length;
    if (c.added) added += n;
    if (c.removed) removed += n;
  }
  return { added, removed, identical: added === 0 && removed === 0 };
});

const unitLabel = computed(() => ({ lines: "lines", words: "chars", chars: "chars" })[mode.value]);

function swap() {
  [original.value, changed.value] = [changed.value, original.value];
}

const rowStyles = {
  added: "bg-success-soft text-success",
  removed: "bg-danger-soft text-danger",
  same: "",
};
</script>

<template>
  <ToolPage>
    <template #actions>
      <AppButton :icon="ArrowLeftRight" @click="swap">Swap</AppButton>
      <AppButton :icon="Eraser" variant="ghost" @click="original = changed = ''">Clear</AppButton>
    </template>

    <div class="grid gap-4 md:grid-cols-2">
      <AppPanel title="Original">
        <textarea v-model="original" rows="10" spellcheck="false" class="field-mono resize-y" placeholder="Paste the original text…" />
      </AppPanel>
      <AppPanel title="Changed">
        <textarea v-model="changed" rows="10" spellcheck="false" class="field-mono resize-y" placeholder="Paste the changed text…" />
      </AppPanel>
    </div>

    <AppPanel title="Differences" flush>
      <template #actions>
        <ToggleSwitch v-model="ignoreCase" label="Ignore case" />
        <ToggleSwitch v-if="mode === 'lines'" v-model="ignoreWhitespace" label="Ignore whitespace" />
        <SegmentedControl v-model="mode" :options="modes" aria-label="Diff granularity" />
      </template>

      <div class="flex items-center gap-4 border-b border-border px-4 py-2 text-xs font-medium">
        <span v-if="stats.identical" class="text-success">✓ Texts are identical</span>
        <template v-else>
          <span class="text-success">+{{ stats.added }} {{ unitLabel }}</span>
          <span class="text-danger">−{{ stats.removed }} {{ unitLabel }}</span>
        </template>
      </div>

      <div class="max-h-[60vh] overflow-auto font-mono text-[13px] scrollbar-thin">
        <table v-if="mode === 'lines'" class="w-full border-collapse">
          <tbody>
            <tr v-for="(row, i) in rows" :key="i" :class="rowStyles[row.kind]">
              <td class="w-10 px-2 text-right text-muted/70 select-none">{{ row.oldNo }}</td>
              <td class="w-10 px-2 text-right text-muted/70 select-none">{{ row.newNo }}</td>
              <td class="w-5 text-center select-none">{{ row.kind === "added" ? "+" : row.kind === "removed" ? "−" : "" }}</td>
              <td class="px-2 py-0.5 break-all whitespace-pre-wrap">{{ row.text || " " }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="p-4 leading-relaxed break-words whitespace-pre-wrap">
          <span
            v-for="(part, i) in changes"
            :key="i"
            :class="part.added ? 'rounded-sm bg-success-soft text-success' : part.removed ? 'rounded-sm bg-danger-soft text-danger line-through' : ''"
          >{{ part.value }}</span>
        </p>
      </div>
    </AppPanel>
  </ToolPage>
</template>
