<script setup lang="ts">
defineProps<{ label: string }>();
const model = defineModel<boolean>({ required: true });
</script>

<template>
  <label class="inline-flex cursor-pointer items-center gap-2 text-sm text-muted select-none">
    <button
      type="button"
      role="switch"
      :aria-checked="model"
      :class="model ? 'bg-brand' : 'bg-surface-3'"
      class="relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors"
      @click="model = !model"
    >
      <span
        :class="model ? 'translate-x-4' : 'translate-x-0'"
        class="absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-sm transition-transform"
      />
    </button>
    <span @click="model = !model">{{ label }}</span>
  </label>
</template>
