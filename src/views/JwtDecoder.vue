<script setup lang="ts">
import { computed, ref } from "vue";
import { Eraser } from "lucide-vue-next";
import ToolPage from "@/components/layout/ToolPage.vue";
import AppPanel from "@/components/ui/AppPanel.vue";
import AppButton from "@/components/ui/AppButton.vue";
import CopyButton from "@/components/ui/CopyButton.vue";
import CodeEditor from "@/components/ui/CodeEditor.vue";
import InlineAlert from "@/components/ui/InlineAlert.vue";
import { decodeJwt, type DecodedJwt } from "@/lib/jwt";
import { errorMessage, formatDateTime, formatRelative } from "@/lib/format";

const token = ref(
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
);

const result = computed<{ ok: true; jwt: DecodedJwt } | { ok: false; error: string } | null>(() => {
  if (!token.value.trim()) return null;
  try {
    return { ok: true, jwt: decodeJwt(token.value) };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
});

const jwt = computed(() => (result.value?.ok ? result.value.jwt : null));
const headerJson = computed(() => (jwt.value ? JSON.stringify(jwt.value.header, null, 2) : ""));
const payloadJson = computed(() => (jwt.value ? JSON.stringify(jwt.value.payload, null, 2) : ""));

/** Splits the raw token so each part can be colour-coded like the JWT spec diagrams. */
const segments = computed(() => token.value.trim().split("."));
const segmentColors = ["text-rose-600 dark:text-rose-400", "text-violet-600 dark:text-violet-400", "text-sky-600 dark:text-sky-400"];
</script>

<template>
  <ToolPage>
    <div class="grid gap-4 lg:grid-cols-2">
      <div class="flex flex-col gap-4">
        <AppPanel title="Encoded token" description="Paste a JWT — it's decoded instantly, never sent anywhere.">
          <template #actions>
            <AppButton size="sm" variant="ghost" :icon="Eraser" @click="token = ''">Clear</AppButton>
          </template>
          <textarea
            v-model="token"
            rows="7"
            spellcheck="false"
            class="field-mono resize-y break-all"
            placeholder="eyJhbGciOi…"
          />
          <p v-if="jwt" class="mt-3 rounded-lg bg-surface-2 p-3 font-mono text-[12px] leading-relaxed break-all">
            <template v-for="(segment, i) in segments" :key="i">
              <span :class="segmentColors[i]">{{ segment }}</span><span v-if="i < 2" class="text-muted">.</span>
            </template>
          </p>
          <InlineAlert v-if="result && !result.ok" class="mt-3">{{ result.error }}</InlineAlert>
        </AppPanel>

        <AppPanel v-if="jwt" title="Status">
          <div class="flex flex-wrap gap-2 text-xs font-medium">
            <span class="rounded-full bg-surface-2 px-2.5 py-1">alg: {{ jwt.header.alg ?? "—" }}</span>
            <span class="rounded-full bg-surface-2 px-2.5 py-1">typ: {{ jwt.header.typ ?? "—" }}</span>
            <span v-if="jwt.expired" class="rounded-full bg-danger-soft px-2.5 py-1 text-danger">Expired</span>
            <span v-else-if="jwt.notYetValid" class="rounded-full bg-warning-soft px-2.5 py-1 text-warning">Not yet valid</span>
            <span v-else class="rounded-full bg-success-soft px-2.5 py-1 text-success">
              {{ jwt.payload.exp ? "Active" : "No expiry" }}
            </span>
          </div>

          <dl v-if="jwt.timeClaims.length" class="mt-4 divide-y divide-border text-sm">
            <div v-for="claim in jwt.timeClaims" :key="claim.key" class="flex flex-wrap justify-between gap-2 py-2">
              <dt class="text-muted">{{ claim.label }} <code class="font-mono text-xs">({{ claim.key }})</code></dt>
              <dd class="text-right">
                {{ formatDateTime(claim.date) }}
                <span class="block text-xs text-muted">{{ formatRelative(claim.date) }}</span>
              </dd>
            </div>
          </dl>
          <p class="mt-4 text-xs text-muted">The signature is not verified — this tool only decodes.</p>
        </AppPanel>
      </div>

      <div class="flex flex-col gap-4">
        <AppPanel title="Header" flush>
          <template #actions><CopyButton :text="headerJson" /></template>
          <div class="h-40"><CodeEditor :model-value="headerJson" language="json" readonly /></div>
        </AppPanel>
        <AppPanel title="Payload" flush>
          <template #actions><CopyButton :text="payloadJson" /></template>
          <div class="h-80"><CodeEditor :model-value="payloadJson" language="json" readonly /></div>
        </AppPanel>
      </div>
    </div>
  </ToolPage>
</template>
