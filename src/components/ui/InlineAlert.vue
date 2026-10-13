<script setup lang="ts">
import { CircleAlert, CircleCheck, TriangleAlert } from "lucide-vue-next";

const { tone = "danger" } = defineProps<{ tone?: "danger" | "success" | "warning" }>();
const styles = {
  danger: ["bg-danger-soft text-danger", CircleAlert],
  success: ["bg-success-soft text-success", CircleCheck],
  warning: ["bg-warning-soft text-warning", TriangleAlert],
} as const;
</script>

<template>
  <div :class="styles[tone][0]" class="flex items-start gap-2 rounded-lg px-3 py-2 text-sm font-medium">
    <component :is="styles[tone][1]" class="mt-0.5 size-4 shrink-0" />
    <div class="min-w-0 break-words"><slot /></div>
  </div>
</template>
