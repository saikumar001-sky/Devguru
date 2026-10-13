<script setup lang="ts">
import { computed, ref, shallowRef } from "vue";
import { Ban, Eraser, Play, RotateCcw, Square } from "lucide-vue-next";
import ToolPage from "@/components/layout/ToolPage.vue";
import AppPanel from "@/components/ui/AppPanel.vue";
import AppButton from "@/components/ui/AppButton.vue";
import CopyButton from "@/components/ui/CopyButton.vue";
import CodeEditor from "@/components/ui/CodeEditor.vue";
import { useLocalStorage } from "@/composables/useLocalStorage";
import { modKey } from "@/lib/platform";
import { runJavaScript, type LogEntry, type LogLevel, type RunHandle } from "@/lib/jsRunner";

const SAMPLE = `// Press Run or Ctrl/⌘ + Enter. Top-level await works,
// and a top-level \`return\` value is printed at the end.
const users = [
  { name: "Ada", role: "dev" },
  { name: "Grace", role: "tester" },
];

console.log("Hello from DevEase 👋");
console.table(users);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
await sleep(300);
console.warn("Async done after 300ms");

return users.map((u) => u.name.toUpperCase());
`;

const code = useLocalStorage("js-playground", SAMPLE);
const logs = ref<LogEntry[]>([]);
const running = shallowRef<RunHandle | null>(null);
const lastRun = ref<{ durationMs: number; timedOut: boolean } | null>(null);

async function run() {
  running.value?.stop();
  logs.value = [];
  lastRun.value = null;
  const handle = runJavaScript(code.value, (entry) => logs.value.push(entry));
  running.value = handle;
  const result = await handle.done;
  if (running.value === handle) {
    running.value = null;
    lastRun.value = result;
  }
}

const levelStyles: Record<LogLevel, string> = {
  log: "text-fg",
  debug: "text-muted",
  info: "text-sky-600 dark:text-sky-400",
  warn: "bg-warning-soft text-warning",
  error: "bg-danger-soft text-danger",
  result: "text-muted",
};

const errorCount = computed(() => logs.value.filter((l) => l.level === "error").length);
</script>

<template>
  <ToolPage>
    <template #actions>
      <AppButton :icon="RotateCcw" variant="ghost" @click="code = SAMPLE">Reset</AppButton>
      <CopyButton :text="code" label="Copy code" size="md" />
      <AppButton v-if="running" :icon="Square" variant="danger" @click="running.stop()">Stop</AppButton>
      <AppButton v-else :icon="Play" variant="primary" @click="run">
        Run <kbd class="font-mono text-[11px] opacity-70">{{ modKey }} ↵</kbd>
      </AppButton>
    </template>

    <div class="grid gap-4 lg:h-[calc(100dvh-14rem)] lg:min-h-[520px] lg:grid-cols-[1.35fr_1fr]">
      <AppPanel flush class="h-[60vh] lg:h-auto">
        <CodeEditor v-model="code" language="javascript" @run="run" />
      </AppPanel>

      <AppPanel title="Console" flush class="h-[50vh] lg:h-auto">
        <template #actions>
          <span v-if="errorCount" class="rounded-full bg-danger-soft px-2 py-0.5 text-xs font-medium text-danger">
            {{ errorCount }} error{{ errorCount > 1 ? "s" : "" }}
          </span>
          <AppButton size="sm" variant="ghost" :icon="Eraser" @click="logs = []">Clear</AppButton>
        </template>
        <div class="flex h-full flex-col">
          <ol class="flex-1 overflow-y-auto font-mono text-[13px] scrollbar-thin">
            <li
              v-for="(entry, index) in logs"
              :key="index"
              :class="levelStyles[entry.level]"
              class="border-b border-border px-4 py-1.5 break-words whitespace-pre-wrap"
            >
              <span v-if="entry.level === 'result'" class="mr-1 select-none">←</span>{{ entry.text }}
            </li>
            <li v-if="!logs.length" class="flex h-full flex-col items-center justify-center gap-2 py-12 font-sans text-sm text-muted">
              <Ban v-if="lastRun" class="size-5" />
              <Play v-else class="size-5" />
              {{ lastRun ? "No output" : "Run your code to see output here" }}
            </li>
          </ol>
          <p v-if="running || lastRun" class="border-t border-border px-4 py-2 text-xs text-muted">
            <template v-if="running">Running…</template>
            <template v-else-if="lastRun">
              {{ lastRun.timedOut ? "Stopped" : "Finished" }} in {{ lastRun.durationMs.toFixed(1) }} ms
            </template>
          </p>
        </div>
      </AppPanel>
    </div>
  </ToolPage>
</template>
