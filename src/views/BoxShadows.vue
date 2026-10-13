<script setup lang="ts">
import { computed, ref } from "vue";
import { Search } from "lucide-vue-next";
import ToolPage from "@/components/layout/ToolPage.vue";
import { shadows, type BoxShadow } from "@/data/boxShadows";
import { useClipboard } from "@/composables/useClipboard";

const query = ref("");
const { copy } = useClipboard();

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q ? shadows.filter((s) => `${s.title} ${s.source} ${s.value}`.toLowerCase().includes(q)) : shadows;
});

/** Tailwind arbitrary value: spaces become underscores, commas stay. */
const toTailwind = (value: string) => `shadow-[${value.replace(/,\s+/g, ",").replace(/\s+/g, "_")}]`;

const copyCss = (shadow: BoxShadow) => copy(`box-shadow: ${shadow.value};`, `Copied CSS for ${shadow.title}`);
const copyTailwind = (shadow: BoxShadow) => copy(toTailwind(shadow.value), `Copied Tailwind class for ${shadow.title}`);
</script>

<template>
  <ToolPage>
    <template #actions>
      <label class="relative w-full sm:w-64">
        <Search class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
        <input v-model="query" class="field pl-9" placeholder="Filter by source, e.g. Stripe" aria-label="Filter shadows" />
      </label>
    </template>

    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      <article
        v-for="shadow in filtered"
        :key="shadow.title"
        class="group relative grid aspect-[4/3] place-items-center rounded-xl border border-border bg-[#f4f4f6] dark:bg-zinc-300"
      >
        <button
          class="grid h-1/2 w-3/5 cursor-pointer place-items-center rounded-lg bg-white text-zinc-900 transition-transform group-hover:scale-[1.04]"
          :style="{ boxShadow: shadow.value }"
          :title="`Copy CSS for ${shadow.title}`"
          @click="copyCss(shadow)"
        >
          <span class="text-center">
            <span class="block text-sm font-semibold">{{ shadow.title }}</span>
            <span v-if="shadow.source" class="block text-xs text-zinc-500">{{ shadow.source }}</span>
          </span>
        </button>
        <div class="absolute inset-x-2 bottom-2 flex justify-center gap-1.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <button class="cursor-pointer rounded-md bg-zinc-900 px-2 py-1 text-[11px] font-medium text-white" @click="copyCss(shadow)">CSS</button>
          <button class="cursor-pointer rounded-md bg-zinc-900 px-2 py-1 text-[11px] font-medium text-white" @click="copyTailwind(shadow)">Tailwind</button>
        </div>
      </article>
    </div>
    <p v-if="!filtered.length" class="py-16 text-center text-sm text-muted">No shadows match “{{ query }}”.</p>
  </ToolPage>
</template>
