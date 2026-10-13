<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import { useRouter } from "vue-router";
import { CornerDownLeft, Search } from "lucide-vue-next";
import { tools, type Tool } from "@/tools";

const open = defineModel<boolean>("open", { required: true });
const router = useRouter();
const dialog = useTemplateRef<HTMLDialogElement>("dialog");
const input = useTemplateRef<HTMLInputElement>("input");
const query = ref("");
const activeIndex = ref(0);

const results = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return tools;
  return tools.filter((tool) =>
    [tool.title, tool.description, tool.category, ...tool.keywords].some((s) => s.toLowerCase().includes(q)),
  );
});

watch(results, () => (activeIndex.value = 0));

watch(open, async (isOpen) => {
  if (isOpen) {
    query.value = "";
    dialog.value?.showModal();
    await nextTick();
    input.value?.focus();
  } else {
    dialog.value?.close();
  }
});

function select(tool: Tool | undefined) {
  if (!tool) return;
  open.value = false;
  router.push(`/${tool.id}`);
}

function move(delta: number) {
  const count = results.value.length;
  if (count) activeIndex.value = (activeIndex.value + delta + count) % count;
}
</script>

<template>
  <dialog
    ref="dialog"
    class="m-0 mx-auto mt-[12vh] w-[min(560px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-surface p-0 text-fg shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
    @close="open = false"
    @click.self="open = false"
  >
    <div class="flex items-center gap-3 border-b border-border px-4">
      <Search class="size-4 text-muted" />
      <input
        ref="input"
        v-model="query"
        class="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted"
        placeholder="Search tools…"
        aria-label="Search tools"
        @keydown.down.prevent="move(1)"
        @keydown.up.prevent="move(-1)"
        @keydown.enter.prevent="select(results[activeIndex])"
      />
      <kbd class="rounded border border-border bg-surface-2 px-1.5 font-mono text-[11px] text-muted">Esc</kbd>
    </div>
    <ul class="max-h-[50vh] overflow-y-auto p-2 scrollbar-thin" role="listbox">
      <li v-for="(tool, index) in results" :key="tool.id" role="option" :aria-selected="index === activeIndex">
        <button
          :class="index === activeIndex ? 'bg-surface-2' : ''"
          class="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left"
          @mouseenter="activeIndex = index"
          @click="select(tool)"
        >
          <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
            <component :is="tool.icon" class="size-4" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block text-sm font-medium">{{ tool.title }}</span>
            <span class="block truncate text-xs text-muted">{{ tool.description }}</span>
          </span>
          <CornerDownLeft v-if="index === activeIndex" class="size-4 text-muted" />
        </button>
      </li>
      <li v-if="!results.length" class="px-3 py-10 text-center text-sm text-muted">
        No tools match “{{ query }}”
      </li>
    </ul>
  </dialog>
</template>
