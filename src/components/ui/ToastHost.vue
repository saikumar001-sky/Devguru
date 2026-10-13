<script setup lang="ts">
import { CircleAlert, CircleCheck, Info, X } from "lucide-vue-next";
import { useToasts } from "@/composables/useToast";

const { toasts, dismiss } = useToasts();
const icons = { success: CircleCheck, error: CircleAlert, info: Info };
const tones = { success: "text-success", error: "text-danger", info: "text-brand" };
</script>

<template>
  <div
    aria-live="polite"
    class="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2"
  >
    <TransitionGroup
      enter-from-class="opacity-0 translate-y-2 scale-95"
      leave-to-class="opacity-0 translate-x-4"
      enter-active-class="transition duration-200 ease-out"
      leave-active-class="transition duration-150 ease-in"
    >
      <div
        v-for="item in toasts"
        :key="item.id"
        class="pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm shadow-lg"
      >
        <component :is="icons[item.kind]" :class="tones[item.kind]" class="mt-0.5 size-4 shrink-0" />
        <p class="flex-1 break-words">{{ item.message }}</p>
        <button
          class="cursor-pointer text-muted hover:text-fg"
          aria-label="Dismiss"
          @click="dismiss(item.id)"
        >
          <X class="size-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
