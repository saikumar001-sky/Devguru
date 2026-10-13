<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, watch } from "vue";
import { Download, ImagePlus } from "lucide-vue-next";
import ToolPage from "@/components/layout/ToolPage.vue";
import AppPanel from "@/components/ui/AppPanel.vue";
import AppButton from "@/components/ui/AppButton.vue";
import SegmentedControl from "@/components/ui/SegmentedControl.vue";
import FileDropzone from "@/components/ui/FileDropzone.vue";
import { compressImage, extensionFor, type CompressResult, type OutputFormat } from "@/lib/image";
import { downloadBlob, errorMessage, formatBytes } from "@/lib/format";
import { toast } from "@/composables/useToast";

const file = shallowRef<File | null>(null);
const bitmap = shallowRef<ImageBitmap | null>(null);
const originalUrl = ref("");
const result = shallowRef<CompressResult | null>(null);
const resultUrl = ref("");
const busy = ref(false);

const format = ref<OutputFormat>("image/webp");
const quality = ref(75);
const scale = ref(100);

const formats = [
  { value: "image/webp" as const, label: "WebP" },
  { value: "image/jpeg" as const, label: "JPEG" },
  { value: "image/png" as const, label: "PNG" },
];

const savings = computed(() => {
  if (!file.value || !result.value) return 0;
  return Math.round((1 - result.value.blob.size / file.value.size) * 100);
});

function setUrl(target: typeof originalUrl, blob: Blob | null) {
  if (target.value) URL.revokeObjectURL(target.value);
  target.value = blob ? URL.createObjectURL(blob) : "";
}

async function onFile(next: File) {
  if (!next.type.startsWith("image/")) return toast.error("Please choose an image file");
  try {
    const decoded = await createImageBitmap(next);
    bitmap.value?.close();
    bitmap.value = decoded;
    file.value = next;
    setUrl(originalUrl, next);
  } catch {
    toast.error("This image format can't be decoded by your browser");
  }
}

let pending = 0;
async function recompress() {
  if (!bitmap.value) return;
  const ticket = ++pending;
  busy.value = true;
  try {
    const out = await compressImage(bitmap.value, { format: format.value, quality: quality.value / 100, scale: scale.value / 100 });
    if (ticket !== pending) return; // a newer run superseded this one
    result.value = out;
    setUrl(resultUrl, out.blob);
  } catch (error) {
    toast.error(errorMessage(error));
  } finally {
    if (ticket === pending) busy.value = false;
  }
}

let timer: number | undefined;
watch([bitmap, format, quality, scale], () => {
  window.clearTimeout(timer);
  timer = window.setTimeout(recompress, 120);
});

function download() {
  if (!result.value || !file.value) return;
  const base = file.value.name.replace(/\.[^.]+$/, "");
  downloadBlob(result.value.blob, `${base}-compressed.${extensionFor(format.value)}`);
}

function reset() {
  bitmap.value?.close();
  bitmap.value = null;
  file.value = null;
  result.value = null;
  setUrl(originalUrl, null);
  setUrl(resultUrl, null);
}

onBeforeUnmount(() => {
  window.clearTimeout(timer);
  reset();
});

const checker = "bg-[repeating-conic-gradient(#e5e5e5_0_25%,#fff_0_50%)] bg-[length:16px_16px]";
</script>

<template>
  <ToolPage>
    <template v-if="file" #actions>
      <AppButton :icon="ImagePlus" @click="reset">New image</AppButton>
      <AppButton variant="primary" :icon="Download" :loading="busy" :disabled="!result" @click="download">Download</AppButton>
    </template>

    <AppPanel v-if="!file">
      <FileDropzone title="Drop an image here or click to browse" hint="JPEG, PNG, WebP, GIF, AVIF… processed locally" @file="onFile" />
    </AppPanel>

    <template v-else>
      <AppPanel>
        <div class="grid items-end gap-6 md:grid-cols-3">
          <div>
            <span class="label">Output format</span>
            <SegmentedControl v-model="format" :options="formats" aria-label="Output format" />
          </div>
          <label :class="{ 'opacity-50': format === 'image/png' }">
            <span class="label flex justify-between">Quality <span class="font-mono normal-case">{{ format === "image/png" ? "lossless" : `${quality}%` }}</span></span>
            <input v-model.number="quality" type="range" min="5" max="100" :disabled="format === 'image/png'" class="w-full accent-[var(--brand)]" />
          </label>
          <label>
            <span class="label flex justify-between">
              Resize <span class="font-mono normal-case">{{ scale }}%{{ bitmap ? ` · ${Math.round(bitmap.width * scale / 100)}×${Math.round(bitmap.height * scale / 100)}` : "" }}</span>
            </span>
            <input v-model.number="scale" type="range" min="5" max="100" class="w-full accent-[var(--brand)]" />
          </label>
        </div>
      </AppPanel>

      <div class="grid gap-4 md:grid-cols-2">
        <AppPanel title="Original" :description="`${file.name} · ${bitmap?.width}×${bitmap?.height}`">
          <template #actions><span class="font-mono text-sm font-medium">{{ formatBytes(file.size) }}</span></template>
          <div :class="checker" class="grid h-80 place-items-center overflow-hidden rounded-lg">
            <img :src="originalUrl" alt="Original" class="max-h-full max-w-full object-contain" />
          </div>
        </AppPanel>
        <AppPanel title="Compressed" :description="result ? `${format.split('/')[1]?.toUpperCase()} · ${result.width}×${result.height}` : 'Processing…'">
          <template #actions>
            <span
              v-if="result"
              :class="savings >= 0 ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'"
              class="rounded-full px-2 py-0.5 text-xs font-semibold"
            >
              {{ savings >= 0 ? `−${savings}%` : `+${-savings}%` }}
            </span>
            <span class="font-mono text-sm font-medium">{{ result ? formatBytes(result.blob.size) : "…" }}</span>
          </template>
          <div :class="[checker, { 'opacity-60': busy }]" class="grid h-80 place-items-center overflow-hidden rounded-lg transition-opacity">
            <img v-if="resultUrl" :src="resultUrl" alt="Compressed" class="max-h-full max-w-full object-contain" />
          </div>
        </AppPanel>
      </div>
    </template>
  </ToolPage>
</template>
