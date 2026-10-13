<script setup lang="ts" generic="T extends string | number">
import type { Component } from "vue";

defineProps<{ options: { value: T; label: string; icon?: Component }[]; ariaLabel?: string }>();
const model = defineModel<T>({ required: true });
</script>

<template>
  <div
    role="radiogroup"
    :aria-label="ariaLabel"
    class="inline-flex max-w-full overflow-x-auto rounded-lg border border-border bg-surface-2 p-0.5 scrollbar-thin"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="radio"
      :aria-checked="model === option.value"
      :class="
        model === option.value
          ? 'bg-surface text-fg shadow-sm ring-1 ring-border'
          : 'text-muted hover:text-fg'
      "
      class="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all"
      @click="model = option.value"
    >
      <component :is="option.icon" v-if="option.icon" class="size-3.5" />
      {{ option.label }}
    </button>
  </div>
</template>
