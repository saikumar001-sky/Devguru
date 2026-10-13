<script setup lang="ts">
import { ref, useId } from "vue";
import { Upload } from "lucide-vue-next";

const { accept = "image/*" } = defineProps<{ accept?: string; title?: string; hint?: string }>();
const emit = defineEmits<{ file: [file: File] }>();

const id = useId();
const dragging = ref(false);

function onDrop(event: DragEvent) {
  dragging.value = false;
  const file = event.dataTransfer?.files[0];
  if (file) emit("file", file);
}

function onChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) emit("file", file);
  input.value = "";
}
</script>

<template>
  <label
    :for="id"
    :class="dragging ? 'border-brand bg-brand-soft' : 'border-border-strong hover:border-brand hover:bg-surface-2'"
    class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors"
    @dragover.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop.prevent="onDrop"
  >
    <span class="grid size-11 place-items-center rounded-full bg-brand-soft text-brand">
      <Upload class="size-5" />
    </span>
    <span class="text-sm font-medium">{{ title ?? "Drop a file here or click to browse" }}</span>
    <span v-if="hint" class="text-xs text-muted">{{ hint }}</span>
    <input :id="id" type="file" :accept="accept" class="sr-only" @change="onChange" />
  </label>
</template>
