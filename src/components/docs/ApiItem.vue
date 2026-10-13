<script setup lang="ts">
defineProps<{ signature: string; returns?: string }>();
</script>

<template>
  <section class="not-prose my-4 overflow-hidden rounded-xl border border-border bg-surface">
    <header class="border-b border-border bg-surface-2 px-4 py-2.5 font-mono text-[13px] break-words">
      {{ signature }}
      <span v-if="returns" class="text-muted"> → {{ returns }}</span>
    </header>
    <div class="px-4 py-3 text-sm leading-relaxed text-fg/90 [&_code]:rounded [&_code]:bg-surface-2 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[12px] [&_table]:mt-2 [&_table]:w-full [&_td]:border-t [&_td]:border-border [&_td]:py-1.5 [&_td]:pr-3 [&_td]:align-top [&_th]:pb-1 [&_th]:pr-3 [&_th]:text-left [&_th]:text-xs [&_th]:font-medium [&_th]:text-muted">
      <slot />
    </div>
  </section>
</template>
