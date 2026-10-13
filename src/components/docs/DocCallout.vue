<script setup lang="ts">
import { Info, Lightbulb, OctagonAlert, TriangleAlert } from "lucide-vue-next";

const { tone = "info", title } = defineProps<{ tone?: "info" | "tip" | "warning" | "danger"; title?: string }>();
const styles = {
  info: ["border-sky-500/30 bg-sky-500/5", "text-sky-600 dark:text-sky-400", Info],
  tip: ["border-success/30 bg-success-soft", "text-success", Lightbulb],
  warning: ["border-warning/30 bg-warning-soft", "text-warning", TriangleAlert],
  danger: ["border-danger/30 bg-danger-soft", "text-danger", OctagonAlert],
} as const;
</script>

<template>
  <aside :class="styles[tone][0]" class="not-prose my-4 flex gap-3 rounded-xl border px-4 py-3 text-sm">
    <component :is="styles[tone][2]" :class="styles[tone][1]" class="mt-0.5 size-4 shrink-0" />
    <div class="min-w-0 leading-relaxed [&_code]:rounded [&_code]:bg-surface-3 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[12px]">
      <p v-if="title" class="mb-0.5 font-semibold">{{ title }}</p>
      <slot />
    </div>
  </aside>
</template>
