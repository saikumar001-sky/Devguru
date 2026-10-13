<script setup lang="ts">
import { computed, ref } from "vue";
import { ArrowLeftRight, Download, FileText, Image as ImageIcon, X } from "lucide-vue-next";
import ToolPage from "@/components/layout/ToolPage.vue";
import AppPanel from "@/components/ui/AppPanel.vue";
import AppButton from "@/components/ui/AppButton.vue";
import CopyButton from "@/components/ui/CopyButton.vue";
import SegmentedControl from "@/components/ui/SegmentedControl.vue";
import ToggleSwitch from "@/components/ui/ToggleSwitch.vue";
import FileDropzone from "@/components/ui/FileDropzone.vue";
import InlineAlert from "@/components/ui/InlineAlert.vue";
import { decodeBase64, encodeBase64, toImageDataUrl } from "@/lib/base64";
import { errorMessage, formatBytes, readFileAsDataUrl } from "@/lib/format";
import { toast } from "@/composables/useToast";

const tab = ref<"text" | "image">("text");
const tabs = [
  { value: "text" as const, label: "Text", icon: FileText },
  { value: "image" as const, label: "Image", icon: ImageIcon },
];

// ---- Text ----
const direction = ref<"encode" | "decode">("encode");
const urlSafe = ref(false);
const input = ref("How many developers does it take to screw in a lightbulb? None — it's a hardware problem. 💡");

const textResult = computed(() => {
  if (!input.value) return { output: "", error: "" };
  try {
    const output = direction.value === "encode" ? encodeBase64(input.value, urlSafe.value) : decodeBase64(input.value);
    return { output, error: "" };
  } catch (error) {
    return { output: "", error: errorMessage(error) };
  }
});

function swapDirection() {
  if (textResult.value.output) input.value = textResult.value.output;
  direction.value = direction.value === "encode" ? "decode" : "encode";
}

// ---- Image → Base64 ----
const imageFile = ref<File | null>(null);
const imageDataUrl = ref("");
const includePrefix = ref(true);
const encodedImage = computed(() =>
  includePrefix.value ? imageDataUrl.value : imageDataUrl.value.slice(imageDataUrl.value.indexOf(",") + 1),
);

async function onImage(file: File) {
  if (!file.type.startsWith("image/")) return toast.error("Please choose an image file");
  imageFile.value = file;
  imageDataUrl.value = await readFileAsDataUrl(file);
}

// ---- Base64 → Image ----
const base64Image = ref("");
const decodedImage = computed(() => {
  if (!base64Image.value.trim()) return { src: "", error: "" };
  try {
    return { src: toImageDataUrl(base64Image.value), error: "" };
  } catch (error) {
    return { src: "", error: errorMessage(error) };
  }
});
const imageLoadError = ref(false);

function downloadDecoded() {
  const src = decodedImage.value.src;
  const ext = src.slice(11, src.indexOf(";")).replace("svg+xml", "svg").replace("x-icon", "ico");
  const anchor = document.createElement("a");
  anchor.href = src;
  anchor.download = `decoded.${ext}`;
  anchor.click();
}
</script>

<template>
  <ToolPage>
    <template #actions>
      <SegmentedControl v-model="tab" :options="tabs" aria-label="Mode" />
    </template>

    <template v-if="tab === 'text'">
      <div class="flex flex-wrap items-center gap-3">
        <SegmentedControl
          v-model="direction"
          :options="[
            { value: 'encode', label: 'Encode' },
            { value: 'decode', label: 'Decode' },
          ]"
          aria-label="Direction"
        />
        <ToggleSwitch v-if="direction === 'encode'" v-model="urlSafe" label="URL-safe (Base64URL)" />
      </div>
      <div class="grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <AppPanel :title="direction === 'encode' ? 'Plain text' : 'Base64'">
          <template #actions><span class="text-xs text-muted">{{ input.length }} chars</span></template>
          <textarea v-model="input" rows="12" spellcheck="false" class="field-mono resize-y" placeholder="Type or paste here…" />
        </AppPanel>
        <div class="flex items-center justify-center">
          <AppButton :icon="ArrowLeftRight" variant="ghost" aria-label="Swap input and output" title="Use output as input" @click="swapDirection" />
        </div>
        <AppPanel :title="direction === 'encode' ? 'Base64' : 'Plain text'">
          <template #actions><CopyButton :text="textResult.output" /></template>
          <InlineAlert v-if="textResult.error">{{ textResult.error }}</InlineAlert>
          <textarea v-else :value="textResult.output" readonly rows="12" class="field-mono resize-y bg-surface-2" />
        </AppPanel>
      </div>
    </template>

    <div v-else class="grid gap-4 lg:grid-cols-2">
      <AppPanel title="Image → Base64">
        <template #actions>
          <ToggleSwitch v-if="imageFile" v-model="includePrefix" label="data: prefix" />
          <CopyButton v-if="imageFile" :text="encodedImage" />
        </template>
        <FileDropzone v-if="!imageFile" hint="PNG, JPG, GIF, WebP, SVG…" @file="onImage" />
        <div v-else class="flex flex-col gap-3">
          <div class="flex items-center gap-3 rounded-lg bg-surface-2 p-3">
            <img :src="imageDataUrl" alt="" class="size-14 rounded-md bg-white object-contain" />
            <div class="min-w-0 flex-1 text-sm">
              <p class="truncate font-medium">{{ imageFile.name }}</p>
              <p class="text-xs text-muted">
                {{ imageFile.type }} · {{ formatBytes(imageFile.size) }} → {{ formatBytes(encodedImage.length) }} encoded
              </p>
            </div>
            <AppButton size="sm" variant="ghost" :icon="X" aria-label="Remove image" @click="imageFile = null" />
          </div>
          <textarea :value="encodedImage" readonly rows="9" class="field-mono resize-y bg-surface-2 break-all" />
        </div>
      </AppPanel>

      <AppPanel title="Base64 → Image">
        <template #actions>
          <AppButton v-if="decodedImage.src && !imageLoadError" size="sm" :icon="Download" @click="downloadDecoded">
            Download
          </AppButton>
        </template>
        <textarea
          v-model="base64Image"
          rows="5"
          spellcheck="false"
          class="field-mono resize-y break-all"
          placeholder="Paste a data:image/… URL or raw Base64"
          @input="imageLoadError = false"
        />
        <InlineAlert v-if="decodedImage.error || imageLoadError" class="mt-3">
          {{ decodedImage.error || "The browser could not render this image data" }}
        </InlineAlert>
        <div
          v-else-if="decodedImage.src"
          class="mt-3 grid min-h-48 place-items-center rounded-lg bg-[repeating-conic-gradient(#e5e5e5_0_25%,#fff_0_50%)] bg-[length:16px_16px] p-3"
        >
          <img :src="decodedImage.src" alt="Decoded image" class="max-h-72 object-contain" @error="imageLoadError = true" />
        </div>
      </AppPanel>
    </div>
  </ToolPage>
</template>
