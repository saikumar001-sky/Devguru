<script setup lang="ts">
defineProps<{ title?: string; description?: string; flush?: boolean }>();
</script>

<template>
  <section class="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-xs">
    <header
      v-if="title || $slots.actions"
      class="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3"
    >
      <div class="min-w-0">
        <h2 v-if="title" class="text-sm font-semibold">{{ title }}</h2>
        <p v-if="description" class="mt-0.5 text-xs text-muted">{{ description }}</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <slot name="actions" />
      </div>
    </header>
    <div :class="flush ? '' : 'p-4'" class="min-h-0 flex-1">
      <slot />
    </div>
  </section>
</template>
