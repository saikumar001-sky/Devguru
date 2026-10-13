<script setup lang="ts">
import { computed, ref, shallowRef } from "vue";
import { FileText, File as FileIcon, X } from "lucide-vue-next";
import { utf8ToBytes } from "@noble/hashes/utils.js";
import ToolPage from "@/components/layout/ToolPage.vue";
import AppPanel from "@/components/ui/AppPanel.vue";
import AppButton from "@/components/ui/AppButton.vue";
import CopyButton from "@/components/ui/CopyButton.vue";
import SegmentedControl from "@/components/ui/SegmentedControl.vue";
import ToggleSwitch from "@/components/ui/ToggleSwitch.vue";
import FileDropzone from "@/components/ui/FileDropzone.vue";
import { HASH_ALGORITHMS, encodeDigest, hashBytes, hashFile, type DigestEncoding, type HashId } from "@/lib/hash";
import { errorMessage, formatBytes } from "@/lib/format";
import { toast } from "@/composables/useToast";

const source = ref<"text" | "file">("text");
const sources = [
  { value: "text" as const, label: "Text", icon: FileText },
  { value: "file" as const, label: "File", icon: FileIcon },
];
const encoding = ref<DigestEncoding>("hex");
const useHmac = ref(false);
const hmacKey = ref("");
const expected = ref("");

const text = ref("The quick brown fox jumps over the lazy dog");
const key = computed(() => (useHmac.value ? utf8ToBytes(hmacKey.value) : undefined));

// ---- File ----
const file = shallowRef<File | null>(null);
const fileDigests = shallowRef<Record<HashId, Uint8Array> | null>(null);
const progress = ref(0);
let fileRun = 0;

async function digestFile(next: File) {
  const run = ++fileRun;
  file.value = next;
  fileDigests.value = null;
  progress.value = 0;
  try {
    const digests = await hashFile(next, key.value, (p) => run === fileRun && (progress.value = p));
    if (run === fileRun) fileDigests.value = digests;
  } catch (error) {
    toast.error(errorMessage(error));
  }
}

function clearFile() {
  fileRun++;
  file.value = null;
  fileDigests.value = null;
}

const digests = computed(() => {
  if (source.value === "text") return hashBytes(utf8ToBytes(text.value), key.value);
  return fileDigests.value;
});

const rows = computed(() => {
  const normalizedExpected = expected.value.trim().toLowerCase();
  return HASH_ALGORITHMS.map((alg) => {
    const raw = digests.value?.[alg.id];
    const value = raw ? encodeDigest(raw, encoding.value) : "";
    const matches =
      !!normalizedExpected &&
      !!raw &&
      [encodeDigest(raw, "hex"), encodeDigest(raw, "base64").toLowerCase()].includes(normalizedExpected);
    return { ...alg, value, matches };
  });
});

const anyMatch = computed(() => rows.value.some((r) => r.matches));

// HMAC key changes invalidate file results.
function onKeyChange() {
  if (source.value === "file" && file.value) digestFile(file.value);
}
</script>

<template>
  <ToolPage>
    <template #actions>
      <SegmentedControl v-model="source" :options="sources" aria-label="Input type" />
    </template>

    <div class="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
      <div class="flex min-w-0 flex-col gap-4">
        <AppPanel :title="source === 'text' ? 'Input text' : 'Input file'">
          <template v-if="source === 'text'">
            <textarea v-model="text" rows="8" spellcheck="false" class="field-mono resize-y" placeholder="Text to hash (UTF-8)…" />
            <p class="mt-2 text-xs text-muted">{{ formatBytes(utf8ToBytes(text).length) }} · hashed as UTF-8</p>
          </template>
          <template v-else>
            <FileDropzone v-if="!file" accept="" title="Drop any file or click to browse" hint="Hashed locally in chunks — large files are fine" @file="digestFile" />
            <div v-else class="flex flex-col gap-3">
              <div class="flex items-center gap-3 rounded-lg bg-surface-2 p-3">
                <FileIcon class="size-5 shrink-0 text-brand" />
                <div class="min-w-0 flex-1 text-sm">
                  <p class="truncate font-medium">{{ file.name }}</p>
                  <p class="text-xs text-muted">{{ formatBytes(file.size) }}{{ file.type ? ` · ${file.type}` : "" }}</p>
                </div>
                <AppButton size="sm" variant="ghost" :icon="X" aria-label="Remove file" @click="clearFile" />
              </div>
              <div v-if="!fileDigests" class="h-2 overflow-hidden rounded-full bg-surface-3">
                <div class="h-full rounded-full bg-brand transition-[width]" :style="{ width: `${Math.round(progress * 100)}%` }" />
              </div>
            </div>
          </template>
        </AppPanel>

        <AppPanel title="Options">
          <div class="flex flex-col gap-4">
            <div>
              <span class="label">Output</span>
              <SegmentedControl
                v-model="encoding"
                :options="[
                  { value: 'hex', label: 'hex' },
                  { value: 'HEX', label: 'HEX' },
                  { value: 'base64', label: 'Base64' },
                ]"
                aria-label="Output encoding"
              />
            </div>
            <div>
              <ToggleSwitch v-model="useHmac" label="HMAC (keyed hash)" @update:model-value="onKeyChange" />
              <input
                v-if="useHmac"
                v-model="hmacKey"
                class="field-mono mt-2"
                spellcheck="false"
                placeholder="Secret key"
                aria-label="HMAC key"
                @change="onKeyChange"
              />
            </div>
            <div>
              <label class="label" for="expected-hash">Verify against expected hash</label>
              <input id="expected-hash" v-model="expected" class="field-mono" spellcheck="false" placeholder="Paste a hash to compare" />
              <p v-if="expected.trim()" class="mt-2 text-xs font-medium" :class="anyMatch ? 'text-success' : 'text-danger'">
                {{ anyMatch ? "✓ Matches " + rows.find((r) => r.matches)?.label : "✗ No algorithm produced this hash" }}
              </p>
            </div>
          </div>
        </AppPanel>
      </div>

      <AppPanel :title="useHmac ? 'HMAC digests' : 'Digests'" flush class="self-start">
        <ul class="divide-y divide-border">
          <li
            v-for="row in rows"
            :key="row.id"
            :class="row.matches ? 'bg-success-soft' : ''"
            class="flex items-start gap-3 px-4 py-3"
          >
            <div class="w-24 shrink-0">
              <p class="text-sm font-semibold">{{ row.label }}</p>
              <p v-if="row.weak" class="text-[11px] text-warning" title="Broken for security use — fine for checksums">legacy</p>
            </div>
            <code class="min-w-0 flex-1 font-mono text-[13px] break-all" :class="{ 'text-muted': !row.value }">
              {{ row.value || "…" }}
            </code>
            <CopyButton :text="row.value" label="" variant="ghost" />
          </li>
        </ul>
      </AppPanel>
    </div>
  </ToolPage>
</template>
