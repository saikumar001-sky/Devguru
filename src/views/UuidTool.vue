<script setup lang="ts">
import { computed, ref } from "vue";
import { Download, RefreshCw, ScanSearch, Sparkles } from "lucide-vue-next";
import ToolPage from "@/components/layout/ToolPage.vue";
import AppPanel from "@/components/ui/AppPanel.vue";
import AppButton from "@/components/ui/AppButton.vue";
import CopyButton from "@/components/ui/CopyButton.vue";
import SegmentedControl from "@/components/ui/SegmentedControl.vue";
import ToggleSwitch from "@/components/ui/ToggleSwitch.vue";
import InlineAlert from "@/components/ui/InlineAlert.vue";
import { decodeUuid, generateUuids, type UuidVersion } from "@/lib/uuid";
import { downloadText, errorMessage, formatDateTime } from "@/lib/format";
import { useLocalStorage } from "@/composables/useLocalStorage";

const tab = ref<"generate" | "decode">("generate");
const tabs = [
  { value: "generate" as const, label: "Generate", icon: Sparkles },
  { value: "decode" as const, label: "Decode", icon: ScanSearch },
];

// ---- Generate ----
const MAX = 1000;
const options = useLocalStorage("uuid-options", { version: 4 as UuidVersion, count: 10, uppercase: false, hyphens: true });
const uuids = ref<string[]>([]);
const output = computed(() => uuids.value.join("\n"));

function generate() {
  const count = Math.min(Math.max(Math.trunc(options.value.count) || 1, 1), MAX);
  options.value.count = count;
  uuids.value = generateUuids(count, options.value.version, options.value);
}
generate();

// ---- Decode ----
const toDecode = ref("018f4c3e-7b2a-7c41-9d3e-5a1b2c3d4e5f");
const decoded = computed(() => {
  if (!toDecode.value.trim()) return null;
  try {
    return { ok: true as const, uuid: decodeUuid(toDecode.value) };
  } catch (error) {
    return { ok: false as const, error: errorMessage(error) };
  }
});
</script>

<template>
  <ToolPage>
    <template #actions>
      <SegmentedControl v-model="tab" :options="tabs" aria-label="Mode" />
    </template>

    <div v-if="tab === 'generate'" class="grid gap-4 lg:grid-cols-[320px_1fr]">
      <AppPanel title="Options" class="self-start">
        <div class="flex flex-col gap-5">
          <div>
            <span class="label">Version</span>
            <SegmentedControl
              v-model="options.version"
              :options="[
                { value: 4, label: 'v4 · random' },
                { value: 7, label: 'v7 · time-ordered' },
              ]"
              aria-label="UUID version"
            />
            <p class="mt-2 text-xs text-muted">
              {{ options.version === 7 ? "Sortable by creation time — great for database keys." : "122 random bits — the most widely used format." }}
            </p>
          </div>
          <div>
            <label class="label" for="uuid-count">How many (max {{ MAX }})</label>
            <input id="uuid-count" v-model.number="options.count" type="number" min="1" :max="MAX" class="field" @keydown.enter="generate" />
          </div>
          <div class="flex flex-col gap-3">
            <ToggleSwitch v-model="options.uppercase" label="Uppercase" />
            <ToggleSwitch v-model="options.hyphens" label="Hyphens" />
          </div>
          <AppButton variant="primary" :icon="RefreshCw" @click="generate">Generate</AppButton>
        </div>
      </AppPanel>

      <AppPanel :title="`${uuids.length} UUID${uuids.length === 1 ? '' : 's'}`" flush>
        <template #actions>
          <AppButton size="sm" :icon="Download" @click="downloadText(output, 'uuids.txt')">Download</AppButton>
          <CopyButton :text="output" label="Copy all" />
        </template>
        <ol class="max-h-[60vh] overflow-y-auto py-2 font-mono text-[13px] scrollbar-thin">
          <li v-for="(id, i) in uuids" :key="id" class="group flex items-center gap-3 px-4 py-1 hover:bg-surface-2">
            <span class="w-8 text-right text-xs text-muted/70 select-none">{{ i + 1 }}</span>
            <span class="flex-1 break-all">{{ id }}</span>
            <CopyButton :text="id" label="" variant="ghost" class="opacity-0 group-hover:opacity-100 focus:opacity-100" />
          </li>
        </ol>
      </AppPanel>
    </div>

    <div v-else class="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
      <AppPanel title="UUID">
        <input v-model="toDecode" class="field-mono" spellcheck="false" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
        <p class="mt-2 text-xs text-muted">Accepts hyphenated, compact, braced <code>{…}</code> or <code>urn:uuid:</code> forms.</p>
        <InlineAlert v-if="decoded && !decoded.ok" class="mt-3">{{ decoded.error }}</InlineAlert>
      </AppPanel>

      <AppPanel v-if="decoded?.ok" title="Details">
        <dl class="divide-y divide-border text-sm">
          <div class="grid gap-1 py-2.5 sm:grid-cols-[160px_1fr]">
            <dt class="text-muted">Canonical</dt>
            <dd class="font-mono break-all">{{ decoded.uuid.canonical }}</dd>
          </div>
          <div class="grid gap-1 py-2.5 sm:grid-cols-[160px_1fr]">
            <dt class="text-muted">Version</dt>
            <dd>{{ decoded.uuid.version }} — {{ decoded.uuid.versionLabel }}</dd>
          </div>
          <div class="grid gap-1 py-2.5 sm:grid-cols-[160px_1fr]">
            <dt class="text-muted">Variant</dt>
            <dd>{{ decoded.uuid.variant }}</dd>
          </div>
          <div v-if="decoded.uuid.timestamp" class="grid gap-1 py-2.5 sm:grid-cols-[160px_1fr]">
            <dt class="text-muted">Created</dt>
            <dd>{{ formatDateTime(decoded.uuid.timestamp) }} <span class="text-xs text-muted">({{ decoded.uuid.timestamp.toISOString() }})</span></dd>
          </div>
          <div v-if="decoded.uuid.clockSequence !== undefined" class="grid gap-1 py-2.5 sm:grid-cols-[160px_1fr]">
            <dt class="text-muted">Clock sequence</dt>
            <dd class="font-mono">{{ decoded.uuid.clockSequence }}</dd>
          </div>
          <div v-if="decoded.uuid.node" class="grid gap-1 py-2.5 sm:grid-cols-[160px_1fr]">
            <dt class="text-muted">Node</dt>
            <dd class="font-mono">{{ decoded.uuid.node }}</dd>
          </div>
          <div class="grid gap-1 py-2.5 sm:grid-cols-[160px_1fr]">
            <dt class="text-muted">Integer value</dt>
            <dd class="font-mono break-all">{{ decoded.uuid.integer }}</dd>
          </div>
        </dl>
      </AppPanel>
    </div>
  </ToolPage>
</template>
