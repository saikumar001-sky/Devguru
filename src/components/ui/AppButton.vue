<script setup lang="ts">
import type { Component } from "vue";
import { LoaderCircle } from "lucide-vue-next";

const { variant = "secondary", size = "md", type = "button" } = defineProps<{
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  icon?: Component;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
}>();

const variants = {
  primary: "bg-brand text-brand-fg hover:bg-brand-hover shadow-sm",
  secondary: "bg-surface text-fg border border-border hover:bg-surface-2 hover:border-border-strong shadow-xs",
  ghost: "text-muted hover:text-fg hover:bg-surface-2",
  danger: "bg-danger-soft text-danger hover:brightness-95",
};
const sizes = { sm: "h-8 px-2.5 text-xs gap-1.5", md: "h-9 px-3.5 text-sm gap-2" };
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[variants[variant], sizes[size]]"
    class="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg font-medium whitespace-nowrap transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
  >
    <LoaderCircle v-if="loading" class="size-4 animate-spin" />
    <component :is="icon" v-else-if="icon" class="size-4" />
    <slot />
  </button>
</template>
