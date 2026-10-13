<script setup lang="ts">
import { Check, Copy } from "lucide-vue-next";
import { useClipboard } from "@/composables/useClipboard";
import AppButton from "./AppButton.vue";

const { text, label = "Copy", size = "sm", variant = "secondary" } = defineProps<{
  text: string | null | undefined;
  label?: string;
  size?: "sm" | "md";
  variant?: "primary" | "secondary" | "ghost";
}>();

const { copy, copied } = useClipboard();
</script>

<template>
  <AppButton
    :size="size"
    :variant="variant"
    :icon="copied ? Check : Copy"
    :aria-label="label || 'Copy'"
    @click="copy(text)"
  >
    <template v-if="label">{{ copied ? "Copied" : label }}</template>
  </AppButton>
</template>
