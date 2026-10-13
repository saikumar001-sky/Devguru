<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { ChevronRight, Menu, Monitor, Moon, Search, Sun } from "lucide-vue-next";
import { useTheme } from "@/composables/useTheme";
import { findTool } from "@/tools";
import { modKey } from "@/lib/platform";
import AppLogo from "./AppLogo.vue";

defineEmits<{ menu: []; search: [] }>();

const route = useRoute();
const tool = computed(() => findTool(route.name));
const { preference, cycle } = useTheme();
const themeIcon = computed(() => ({ light: Sun, dark: Moon, system: Monitor })[preference.value]);
</script>

<template>
  <header
    class="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-bg/80 px-4 backdrop-blur-lg sm:px-6 lg:px-10"
  >
    <button
      class="grid size-9 cursor-pointer place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg lg:hidden"
      aria-label="Open menu"
      @click="$emit('menu')"
    >
      <Menu class="size-5" />
    </button>
    <div class="lg:hidden"><AppLogo /></div>

    <nav class="hidden items-center gap-1.5 text-sm lg:flex" aria-label="Breadcrumb">
      <RouterLink to="/" class="text-muted hover:text-fg">Tools</RouterLink>
      <template v-if="tool">
        <ChevronRight class="size-3.5 text-muted" />
        <span class="text-muted">{{ tool.category }}</span>
        <ChevronRight class="size-3.5 text-muted" />
        <span class="font-medium">{{ tool.title }}</span>
      </template>
    </nav>

    <div class="ml-auto flex items-center gap-2">
      <button
        class="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-muted shadow-xs transition-colors hover:border-border-strong hover:text-fg sm:w-64"
        @click="$emit('search')"
      >
        <Search class="size-4" />
        <span class="hidden sm:inline">Search tools…</span>
        <kbd class="ml-auto hidden rounded border border-border bg-surface-2 px-1.5 font-mono text-[11px] sm:inline">
          {{ modKey }} K
        </kbd>
      </button>
      <button
        class="grid size-9 cursor-pointer place-items-center rounded-lg border border-border bg-surface text-muted shadow-xs transition-colors hover:border-border-strong hover:text-fg"
        :title="`Theme: ${preference}`"
        :aria-label="`Theme: ${preference}. Click to change`"
        @click="cycle"
      >
        <component :is="themeIcon" class="size-4" />
      </button>
    </div>
  </header>
</template>
