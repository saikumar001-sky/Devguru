<script setup lang="ts">
import { onActivated, onDeactivated, onMounted, onBeforeUnmount, ref, shallowRef } from "vue";
import { Keyboard } from "lucide-vue-next";
import ToolPage from "@/components/layout/ToolPage.vue";
import AppPanel from "@/components/ui/AppPanel.vue";
import AppButton from "@/components/ui/AppButton.vue";
import CopyButton from "@/components/ui/CopyButton.vue";
import ToggleSwitch from "@/components/ui/ToggleSwitch.vue";
import { useLocalStorage } from "@/composables/useLocalStorage";

interface KeyInfo {
  key: string;
  code: string;
  keyCode: number;
  which: number;
  location: string;
  modifiers: string[];
  repeat: boolean;
  time: string;
}

const LOCATIONS = ["Standard", "Left", "Right", "Numpad"];
const MODIFIERS = ["Control", "Shift", "Alt", "Meta"] as const;

const preventDefault = useLocalStorage("keycode:prevent", true);
const current = shallowRef<KeyInfo | null>(null);
const history = ref<KeyInfo[]>([]);

const displayKey = (key: string) => ({ " ": "Space", Meta: "⌘ Meta", Control: "Ctrl", Escape: "Esc" })[key] ?? key;

function onKeydown(event: KeyboardEvent) {
  // Leave the command palette and other dialogs alone.
  if ((event.target as Element | null)?.closest?.("dialog")) return;
  if (preventDefault.value && !((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k")) {
    event.preventDefault();
  }
  const info: KeyInfo = {
    key: event.key,
    code: event.code,
    keyCode: event.keyCode,
    which: event.which,
    location: LOCATIONS[event.location] ?? String(event.location),
    modifiers: MODIFIERS.filter((m) => event.getModifierState(m)),
    repeat: event.repeat,
    time: new Date().toLocaleTimeString(),
  };
  current.value = info;
  if (!event.repeat) history.value = [info, ...history.value].slice(0, 15);
}

// Kept-alive pages stay mounted in the background, so listen only while visible.
let listening = false;
const listen = (on: boolean) => {
  if (on === listening) return;
  listening = on;
  if (on) window.addEventListener("keydown", onKeydown);
  else window.removeEventListener("keydown", onKeydown);
};
onMounted(() => listen(true));
onActivated(() => listen(true));
onDeactivated(() => listen(false));
onBeforeUnmount(() => listen(false));

const fields = (k: KeyInfo) => [
  { label: "event.key", value: JSON.stringify(k.key), snippet: `event.key === ${JSON.stringify(k.key)}` },
  { label: "event.code", value: JSON.stringify(k.code), snippet: `event.code === ${JSON.stringify(k.code)}` },
  { label: "event.keyCode", value: String(k.keyCode), snippet: `event.keyCode === ${k.keyCode}`, note: "deprecated" },
  { label: "event.which", value: String(k.which), snippet: `event.which === ${k.which}`, note: "deprecated" },
  { label: "event.location", value: k.location, snippet: "" },
  { label: "event.repeat", value: String(k.repeat), snippet: "" },
];
</script>

<template>
  <ToolPage>
    <template #actions>
      <ToggleSwitch v-model="preventDefault" label="Block browser shortcuts" />
      <AppButton variant="ghost" :disabled="!history.length" @click="(history = []), (current = null)">Clear</AppButton>
    </template>

    <AppPanel>
      <div class="flex flex-col items-center justify-center gap-3 py-8 text-center">
        <template v-if="current">
          <kbd
            class="min-w-28 rounded-2xl border border-b-4 border-border-strong bg-surface-2 px-8 py-5 font-mono text-5xl font-semibold shadow-sm sm:text-6xl"
          >
            {{ displayKey(current.key) }}
          </kbd>
          <p class="text-sm text-muted">
            keyCode <span class="font-mono font-semibold text-fg">{{ current.keyCode }}</span> ·
            code <span class="font-mono font-semibold text-fg">{{ current.code || "—" }}</span>
          </p>
          <div class="flex gap-1.5">
            <span
              v-for="m in MODIFIERS"
              :key="m"
              :class="current.modifiers.includes(m) ? 'border-brand bg-brand-soft text-brand' : 'border-border text-muted/60'"
              class="rounded-md border px-2 py-0.5 text-xs font-medium"
            >
              {{ m === "Control" ? "Ctrl" : m }}
            </span>
          </div>
        </template>
        <template v-else>
          <span class="grid size-16 place-items-center rounded-2xl bg-brand-soft text-brand"><Keyboard class="size-8" /></span>
          <p class="text-lg font-semibold">Press any key</p>
          <p class="text-sm text-muted">Key details appear here instantly.</p>
        </template>
      </div>
    </AppPanel>

    <div v-if="current" class="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
      <AppPanel title="Event properties" flush>
        <ul class="divide-y divide-border">
          <li v-for="f in fields(current)" :key="f.label" class="flex items-center gap-3 px-4 py-2.5">
            <code class="w-32 shrink-0 font-mono text-xs text-muted">{{ f.label }}</code>
            <code class="flex-1 font-mono text-sm break-all">{{ f.value }}</code>
            <span v-if="f.note" class="text-[11px] text-warning">{{ f.note }}</span>
            <CopyButton v-if="f.snippet" :text="f.snippet" label="" variant="ghost" :title="`Copy: ${f.snippet}`" />
          </li>
        </ul>
      </AppPanel>

      <AppPanel title="History" flush>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="text-xs text-muted">
              <tr class="border-b border-border">
                <th class="px-4 py-2 font-medium">key</th>
                <th class="px-4 py-2 font-medium">code</th>
                <th class="px-4 py-2 font-medium">keyCode</th>
                <th class="px-4 py-2 font-medium">modifiers</th>
                <th class="px-4 py-2 font-medium">time</th>
              </tr>
            </thead>
            <tbody class="font-mono text-[13px]">
              <tr v-for="(h, i) in history" :key="i" class="border-b border-border last:border-0">
                <td class="px-4 py-1.5">{{ displayKey(h.key) }}</td>
                <td class="px-4 py-1.5">{{ h.code }}</td>
                <td class="px-4 py-1.5">{{ h.keyCode }}</td>
                <td class="px-4 py-1.5 text-muted">{{ h.modifiers.join("+") || "—" }}</td>
                <td class="px-4 py-1.5 text-muted">{{ h.time }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </AppPanel>
    </div>
  </ToolPage>
</template>
