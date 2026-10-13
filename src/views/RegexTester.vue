<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, watch } from "vue";
import ToolPage from "@/components/layout/ToolPage.vue";
import AppPanel from "@/components/ui/AppPanel.vue";
import CopyButton from "@/components/ui/CopyButton.vue";
import InlineAlert from "@/components/ui/InlineAlert.vue";
import { useLocalStorage } from "@/composables/useLocalStorage";
import { createRegexRunner, type RegexResult } from "@/lib/regex";

const FLAGS = [
  { flag: "g", title: "Global — find all matches" },
  { flag: "i", title: "Ignore case" },
  { flag: "m", title: "Multiline — ^ and $ match at line breaks" },
  { flag: "s", title: "Dot-all — . matches newlines" },
  { flag: "u", title: "Unicode" },
  { flag: "y", title: "Sticky — match only at lastIndex" },
];

const PRESETS = [
  { label: "Email", pattern: String.raw`[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}` },
  { label: "URL", pattern: String.raw`https?:\/\/[^\s/$.?#].[^\s]*` },
  { label: "IPv4", pattern: String.raw`\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b` },
  { label: "ISO date", pattern: String.raw`(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})` },
  { label: "UUID", pattern: String.raw`[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}` },
  { label: "Indian mobile", pattern: String.raw`(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}` },
  { label: "Hex color", pattern: String.raw`#(?:[0-9a-fA-F]{3}){1,2}\b` },
];

const CHEATSHEET = [
  ["\\d \\w \\s", "digit, word char, whitespace"],
  ["\\D \\W \\S", "the opposites"],
  [".", "any char except newline"],
  ["[abc] [^abc]", "any of / none of"],
  ["^ $ \\b", "start, end, word boundary"],
  ["* + ? {2,5}", "quantifiers"],
  ["*? +?", "lazy quantifiers"],
  ["(…) (?:…)", "capture / non-capture group"],
  ["(?<name>…)", "named group"],
  ["(?=…) (?!…)", "lookahead / negative"],
  ["(?<=…) (?<!…)", "lookbehind / negative"],
  ["$1 $<name> $&", "in replacement"],
];

const state = useLocalStorage("regex-tester", {
  pattern: String.raw`(?<user>[\w.+-]+)@(?<domain>[\w-]+\.[\w.]+)`,
  flags: "gi",
  text: "Contact ada@example.com or grace.hopper@navy.mil for access.\nInvalid: bob@, @nowhere.com",
  replacement: "$<user> [at] $<domain>",
});

const runner = createRegexRunner();
onBeforeUnmount(runner.dispose);

const result = shallowRef<(RegexResult & { text: string }) | null>(null);
const pending = ref(false);
let seq = 0;
let timer: number | undefined;

watch(
  state,
  () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(async () => {
      const ticket = ++seq;
      const { pattern, flags, text, replacement } = state.value;
      if (!pattern) {
        pending.value = false;
        result.value = null;
        return;
      }
      pending.value = true;
      const res = await runner.run({ pattern, flags, text, replacement });
      if (ticket !== seq) return;
      pending.value = false;
      result.value = { ...res, text };
    }, 120);
  },
  { deep: true, immediate: true },
);

function toggleFlag(flag: string) {
  const flags = state.value.flags;
  state.value.flags = flags.includes(flag) ? flags.replace(flag, "") : [...flags + flag].sort().join("");
}

/** Text split into plain and matched runs for highlighting. */
const segments = computed(() => {
  const res = result.value;
  if (!res?.ok) return [];
  const out: { text: string; match?: number }[] = [];
  let cursor = 0;
  res.matches.forEach((m, i) => {
    if (m.index > cursor) out.push({ text: res.text.slice(cursor, m.index) });
    if (m.text) out.push({ text: m.text, match: i });
    cursor = m.index + m.text.length;
  });
  out.push({ text: res.text.slice(cursor) });
  return out;
});
</script>

<template>
  <ToolPage>
    <AppPanel>
      <div class="flex flex-col gap-3">
        <div
          class="flex items-center rounded-lg border border-border bg-surface font-mono text-sm shadow-xs focus-within:border-brand focus-within:ring-3 focus-within:ring-brand/15"
        >
          <span class="pl-3 text-muted select-none">/</span>
          <input
            v-model="state.pattern"
            class="min-w-0 flex-1 bg-transparent px-1 py-2.5 outline-none"
            spellcheck="false"
            placeholder="pattern"
            aria-label="Regular expression"
          />
          <span class="pr-3 text-muted select-none">/{{ state.flags }}</span>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="f in FLAGS"
            :key="f.flag"
            :title="f.title"
            :aria-pressed="state.flags.includes(f.flag)"
            :class="state.flags.includes(f.flag) ? 'border-brand bg-brand-soft text-brand' : 'border-border text-muted hover:text-fg'"
            class="size-8 cursor-pointer rounded-md border font-mono text-sm transition-colors"
            @click="toggleFlag(f.flag)"
          >
            {{ f.flag }}
          </button>
          <span class="mx-1 h-5 w-px bg-border" />
          <button
            v-for="p in PRESETS"
            :key="p.label"
            class="cursor-pointer rounded-full border border-border px-2.5 py-1 text-xs text-muted transition-colors hover:border-brand hover:text-brand"
            @click="state.pattern = p.pattern"
          >
            {{ p.label }}
          </button>
        </div>
        <InlineAlert v-if="result && !result.ok">{{ result.error }}</InlineAlert>
      </div>
    </AppPanel>

    <div class="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div class="flex min-w-0 flex-col gap-4">
        <AppPanel title="Test string">
          <textarea v-model="state.text" rows="7" spellcheck="false" class="field-mono resize-y" placeholder="Text to test against…" />
        </AppPanel>

        <AppPanel title="Highlighted">
          <template #actions>
            <span v-if="result?.ok" class="text-xs font-medium" :class="result.matches.length ? 'text-success' : 'text-muted'">
              {{ result.matches.length }}{{ result.truncated ? "+" : "" }} match{{ result.matches.length === 1 ? "" : "es" }}
            </span>
          </template>
          <p class="max-h-72 overflow-auto font-mono text-[13px] leading-relaxed break-words whitespace-pre-wrap scrollbar-thin" :class="{ 'opacity-60': pending }">
            <template v-for="(seg, i) in segments" :key="i">
              <mark
                v-if="seg.match !== undefined"
                :class="seg.match % 2 ? 'bg-sky-200/70 dark:bg-sky-500/30' : 'bg-brand/25'"
                class="rounded-sm text-fg"
                :title="`Match ${seg.match + 1}`"
              >{{ seg.text }}</mark>
              <template v-else>{{ seg.text }}</template>
            </template>
          </p>
        </AppPanel>

        <AppPanel title="Replace">
          <template #actions><CopyButton :text="result?.ok ? result.replaced : ''" /></template>
          <input v-model="state.replacement" class="field-mono" spellcheck="false" placeholder="Replacement, e.g. $1 or $<name>" />
          <p
            v-if="result?.ok"
            class="mt-3 max-h-56 overflow-auto rounded-lg bg-surface-2 p-3 font-mono text-[13px] break-words whitespace-pre-wrap scrollbar-thin"
          >{{ result.replaced }}</p>
        </AppPanel>
      </div>

      <div class="flex min-w-0 flex-col gap-4">
        <AppPanel title="Matches" flush>
          <ol v-if="result?.ok && result.matches.length" class="max-h-[420px] divide-y divide-border overflow-y-auto scrollbar-thin">
            <li v-for="(m, i) in result.matches" :key="i" class="px-4 py-2.5 text-sm">
              <div class="flex items-baseline justify-between gap-3">
                <code class="font-mono break-all">{{ m.text || "(empty)" }}</code>
                <span class="shrink-0 text-xs text-muted">#{{ i + 1 }} · index {{ m.index }}</span>
              </div>
              <dl v-if="m.groups.length" class="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
                <template v-for="g in m.groups" :key="g.name">
                  <dt class="font-mono text-muted">{{ g.name }}</dt>
                  <dd class="font-mono break-all">{{ g.value ?? "undefined" }}</dd>
                </template>
              </dl>
            </li>
          </ol>
          <p v-else class="px-4 py-8 text-center text-sm text-muted">No matches</p>
        </AppPanel>

        <AppPanel title="Quick reference">
          <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
            <template v-for="[token, meaning] in CHEATSHEET" :key="token">
              <dt class="font-mono text-brand">{{ token }}</dt>
              <dd class="text-muted">{{ meaning }}</dd>
            </template>
          </dl>
        </AppPanel>
      </div>
    </div>
  </ToolPage>
</template>
