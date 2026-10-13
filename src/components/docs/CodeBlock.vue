<script setup lang="ts">
import { computed } from "vue";
import CopyButton from "@/components/ui/CopyButton.vue";
import { tokenize, type CodeLanguage } from "@/lib/highlight";

const { code, lang = "js", title } = defineProps<{ code: string; lang?: CodeLanguage; title?: string }>();

const LABELS: Record<CodeLanguage, string> = { js: "JavaScript", json: "JSON", bash: "Terminal", yaml: "YAML", text: "Text" };
const trimmed = computed(() => code.replace(/^\n+|\s+$/g, ""));
const tokens = computed(() => tokenize(trimmed.value, lang));
</script>

<template>
  <figure class="code-block not-prose my-4 overflow-hidden rounded-xl border border-border bg-surface-2">
    <figcaption class="flex items-center justify-between gap-3 border-b border-border px-3 py-1.5">
      <span class="truncate font-mono text-xs text-muted">{{ title ?? LABELS[lang] }}</span>
      <CopyButton :text="trimmed" label="" variant="ghost" />
    </figcaption>
    <pre class="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed scrollbar-thin"><code><span
      v-for="(t, i) in tokens" :key="i" :class="t.cls">{{ t.text }}</span></code></pre>
  </figure>
</template>
