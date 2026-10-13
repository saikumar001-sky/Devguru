<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";
import { ExternalLink, Play, RotateCcw } from "lucide-vue-next";
import ToolPage from "@/components/layout/ToolPage.vue";
import AppPanel from "@/components/ui/AppPanel.vue";
import AppButton from "@/components/ui/AppButton.vue";
import CopyButton from "@/components/ui/CopyButton.vue";
import CodeEditor from "@/components/ui/CodeEditor.vue";
import ToggleSwitch from "@/components/ui/ToggleSwitch.vue";
import { useLocalStorage } from "@/composables/useLocalStorage";

const SAMPLE = `<!doctype html>
<html>
  <head>
    <style>
      body { font-family: system-ui, sans-serif; display: grid; place-items: center; min-height: 90vh; margin: 0; background: #fafafa; }
      .card { padding: 2rem 2.5rem; border-radius: 16px; background: white; box-shadow: 0 10px 30px rgb(0 0 0 / 0.08); text-align: center; }
      button { margin-top: 1rem; padding: .6rem 1.2rem; border: 0; border-radius: 10px; background: #ea5a3f; color: white; font-weight: 600; cursor: pointer; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Hello, DevEase 👋</h1>
      <p>Edit the HTML on the left — the preview updates live.</p>
      <button onclick="this.textContent = 'Clicked ' + (++window.n || (window.n = 1)) + '×'">Click me</button>
    </div>
  </body>
</html>
`;

const code = useLocalStorage("html-playground", SAMPLE);
const autoRun = useLocalStorage("html-playground:auto", true);
const preview = ref(code.value);

let timer: number | undefined;
watch(code, (value) => {
  if (!autoRun.value) return;
  window.clearTimeout(timer);
  timer = window.setTimeout(() => (preview.value = value), 400);
});
onBeforeUnmount(() => window.clearTimeout(timer));

function run() {
  // Re-assigning the same string wouldn't reload the iframe, so force a fresh document.
  preview.value = "";
  requestAnimationFrame(() => (preview.value = code.value));
}

function openInNewTab() {
  const url = URL.createObjectURL(new Blob([code.value], { type: "text/html" }));
  window.open(url, "_blank", "noopener");
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
</script>

<template>
  <ToolPage>
    <template #actions>
      <ToggleSwitch v-model="autoRun" label="Live preview" class="mr-2" />
      <AppButton :icon="RotateCcw" variant="ghost" @click="code = SAMPLE">Reset</AppButton>
      <CopyButton :text="code" label="Copy code" size="md" />
      <AppButton :icon="Play" variant="primary" @click="run">Run</AppButton>
    </template>

    <div class="grid gap-4 lg:h-[calc(100dvh-14rem)] lg:min-h-[520px] lg:grid-cols-2">
      <AppPanel flush class="h-[60vh] lg:h-auto">
        <CodeEditor v-model="code" language="html" @run="run" />
      </AppPanel>

      <AppPanel title="Preview" flush class="h-[60vh] overflow-hidden lg:h-auto">
        <template #actions>
          <AppButton size="sm" variant="ghost" :icon="ExternalLink" @click="openInNewTab">Open in tab</AppButton>
        </template>
        <iframe
          title="HTML preview"
          class="h-full w-full rounded-b-xl bg-white"
          sandbox="allow-scripts allow-modals allow-forms allow-popups"
          :srcdoc="preview"
        />
      </AppPanel>
    </div>
  </ToolPage>
</template>
