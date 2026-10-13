<script setup lang="ts">
import { computed } from "vue";
import { Pipette } from "lucide-vue-next";
import ToolPage from "@/components/layout/ToolPage.vue";
import AppPanel from "@/components/ui/AppPanel.vue";
import AppButton from "@/components/ui/AppButton.vue";
import CopyButton from "@/components/ui/CopyButton.vue";
import InlineAlert from "@/components/ui/InlineAlert.vue";
import { contrastRatio, parseColor, toHex, toHsl, toOklch, toRgb, wcagRating, type Rgba } from "@/lib/color";
import { useLocalStorage } from "@/composables/useLocalStorage";

const input = useLocalStorage("color", "#ea5a3f");
const color = computed(() => parseColor(input.value));

const formats = computed(() => {
  const c = color.value;
  if (!c) return [];
  return [
    { label: "HEX", value: toHex(c) },
    { label: "RGB", value: toRgb(c) },
    { label: "HSL", value: toHsl(c) },
    { label: "OKLCH", value: toOklch(c) },
  ];
});

const WHITE: Rgba = { r: 255, g: 255, b: 255, a: 1 };
const BLACK: Rgba = { r: 0, g: 0, b: 0, a: 1 };
const contrast = computed(() => {
  const c = color.value;
  if (!c) return [];
  return [
    { label: "Against white", bg: "#ffffff", fg: toHex({ ...c, a: 1 }), ratio: contrastRatio(c, WHITE) },
    { label: "Against black", bg: "#000000", fg: toHex({ ...c, a: 1 }), ratio: contrastRatio(c, BLACK) },
  ].map((row) => ({ ...row, rating: wcagRating(row.ratio) }));
});

const pickerValue = computed({
  get: () => (color.value ? toHex({ ...color.value, a: 1 }) : "#000000"),
  set: (value: string) => (input.value = value),
});

interface EyeDropperCtor {
  new (): { open: () => Promise<{ sRGBHex: string }> };
}
const EyeDropper = (window as unknown as { EyeDropper?: EyeDropperCtor }).EyeDropper;

async function pickFromScreen() {
  if (!EyeDropper) return;
  try {
    input.value = (await new EyeDropper().open()).sRGBHex;
  } catch {
    // User cancelled the picker.
  }
}

const ratingStyle = (rating: string) =>
  rating === "Fail" ? "bg-danger-soft text-danger" : rating === "AA Large" ? "bg-warning-soft text-warning" : "bg-success-soft text-success";
</script>

<template>
  <ToolPage>
    <div class="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
      <AppPanel title="Color">
        <div
          class="relative h-48 overflow-hidden rounded-xl border border-border bg-[repeating-conic-gradient(#e5e5e5_0_25%,#fff_0_50%)] bg-[length:16px_16px]"
        >
          <div class="absolute inset-0 transition-colors" :style="{ background: color ? input : 'transparent' }" />
        </div>
        <div class="mt-4 flex gap-2">
          <label class="relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-border shadow-xs" title="Open color picker">
            <span class="absolute inset-0" :style="{ background: pickerValue }" />
            <input v-model="pickerValue" type="color" class="absolute inset-0 cursor-pointer opacity-0" aria-label="Color picker" />
          </label>
          <input v-model="input" class="field-mono" spellcheck="false" placeholder="#ff8800, rgb(…), hsl(…), oklch(…), rebeccapurple" />
          <AppButton v-if="EyeDropper" :icon="Pipette" title="Pick a color from the screen" aria-label="Pick from screen" @click="pickFromScreen" />
        </div>
        <InlineAlert v-if="!color" class="mt-3">Enter any valid CSS color.</InlineAlert>
      </AppPanel>

      <div class="flex flex-col gap-4">
        <AppPanel title="Formats" flush>
          <ul class="divide-y divide-border">
            <li v-for="item in formats" :key="item.label" class="flex items-center gap-3 px-4 py-2.5">
              <span class="w-14 text-xs font-semibold text-muted">{{ item.label }}</span>
              <code class="flex-1 font-mono text-sm break-all">{{ item.value }}</code>
              <CopyButton :text="item.value" label="" variant="ghost" />
            </li>
            <li v-if="!formats.length" class="px-4 py-6 text-center text-sm text-muted">—</li>
          </ul>
        </AppPanel>

        <AppPanel title="Contrast (WCAG 2.1)">
          <div class="grid gap-3 sm:grid-cols-2">
            <div v-for="row in contrast" :key="row.label" class="flex items-center gap-3 rounded-lg border border-border p-2.5">
              <span
                class="grid size-11 shrink-0 place-items-center rounded-md border border-border text-lg font-bold"
                :style="{ background: row.bg, color: row.fg }"
              >Aa</span>
              <div class="min-w-0 flex-1">
                <p class="text-xs text-muted">{{ row.label }}</p>
                <p class="font-mono text-sm font-semibold">{{ row.ratio.toFixed(2) }}:1</p>
              </div>
              <span :class="ratingStyle(row.rating)" class="rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap">{{ row.rating }}</span>
            </div>
          </div>
        </AppPanel>
      </div>
    </div>
  </ToolPage>
</template>
