<script setup lang="ts">
import { useRoute } from "vue-router";
import { findTool } from "@/tools";

// Resolved once on purpose: kept-alive pages must not re-render with another route's metadata.
const tool = findTool(useRoute().name);
</script>

<template>
  <div class="flex flex-col gap-6">
    <header v-if="tool" class="flex flex-wrap items-start justify-between gap-4">
      <div class="flex items-start gap-4">
        <span class="grid size-12 shrink-0 place-items-center rounded-xl border border-border bg-surface text-brand shadow-xs">
          <component :is="tool.icon" class="size-6" />
        </span>
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">{{ tool.title }}</h1>
          <p class="mt-1 text-sm text-muted">{{ tool.description }}</p>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <slot name="actions" />
      </div>
    </header>
    <slot />
  </div>
</template>
