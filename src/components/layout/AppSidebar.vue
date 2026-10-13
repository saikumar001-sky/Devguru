<script setup lang="ts">
import { House, ShieldCheck, X } from "lucide-vue-next";
import { categories, tools } from "@/tools";
import AppLogo from "./AppLogo.vue";

defineProps<{ open: boolean }>();
defineEmits<{ close: [] }>();

const groups = categories.map((category) => ({
  category,
  items: tools.filter((tool) => tool.category === category),
}));

const linkClass =
  "group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg";
const activeClass = "!bg-brand-soft !text-brand";
</script>

<template>
  <Transition
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
    enter-active-class="transition-opacity"
    leave-active-class="transition-opacity"
  >
    <div v-if="open" class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" @click="$emit('close')" />
  </Transition>

  <aside
    :class="open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface transition-transform duration-300 ease-out"
  >
    <div class="flex h-16 items-center justify-between px-5">
      <AppLogo />
      <button
        class="grid size-8 cursor-pointer place-items-center rounded-lg text-muted hover:bg-surface-2 lg:hidden"
        aria-label="Close menu"
        @click="$emit('close')"
      >
        <X class="size-4" />
      </button>
    </div>

    <nav class="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin" aria-label="Tools">
      <RouterLink to="/" :class="linkClass" :exact-active-class="activeClass">
        <House class="size-4" /> Overview
      </RouterLink>

      <div v-for="group in groups" :key="group.category" class="mt-5">
        <p class="px-2.5 pb-1.5 text-[11px] font-semibold tracking-wider text-muted/80 uppercase">
          {{ group.category }}
        </p>
        <RouterLink
          v-for="tool in group.items"
          :key="tool.id"
          :to="`/${tool.id}`"
          :class="linkClass"
          :active-class="activeClass"
        >
          <component :is="tool.icon" class="size-4" />
          {{ tool.title }}
        </RouterLink>
      </div>
    </nav>

    <div class="m-3 flex items-start gap-2.5 rounded-xl bg-surface-2 p-3 text-xs text-muted">
      <ShieldCheck class="mt-0.5 size-4 shrink-0 text-success" />
      <p>Everything runs locally in your browser. Nothing is uploaded.</p>
    </div>
  </aside>
</template>
