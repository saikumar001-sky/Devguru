<script setup lang="ts">
import { computed, onActivated, onBeforeUnmount, onDeactivated, onMounted, ref } from "vue";
import { Clock, Plus, X } from "lucide-vue-next";
import ToolPage from "@/components/layout/ToolPage.vue";
import AppPanel from "@/components/ui/AppPanel.vue";
import AppButton from "@/components/ui/AppButton.vue";
import CopyButton from "@/components/ui/CopyButton.vue";
import InlineAlert from "@/components/ui/InlineAlert.vue";
import { useLocalStorage } from "@/composables/useLocalStorage";
import { toast } from "@/composables/useToast";
import { formatRelative } from "@/lib/format";
import {
  allTimeZones,
  formatInZone,
  formatOffset,
  localTimeZone,
  parseTimeInput,
  timeZoneOffset,
  toWallTime,
  wallTimeToDate,
} from "@/lib/timestamp";

// ---- Live clock (paused while the page is hidden by KeepAlive) ----
const now = ref(new Date());
let clock: number | undefined;
const startClock = () => {
  window.clearInterval(clock);
  now.value = new Date();
  clock = window.setInterval(() => (now.value = new Date()), 1000);
};
const stopClock = () => window.clearInterval(clock);
onMounted(startClock);
onActivated(startClock);
onDeactivated(stopClock);
onBeforeUnmount(stopClock);

const live = computed(() => [
  { label: "Unix seconds", value: String(Math.floor(now.value.getTime() / 1000)) },
  { label: "Unix milliseconds", value: String(now.value.getTime()) },
  { label: "ISO 8601 (UTC)", value: now.value.toISOString().replace(/\.\d{3}Z$/, "Z") },
]);

// ---- Converter ----
const input = ref(String(Math.floor(Date.now() / 1000)));
const parsed = computed(() => parseTimeInput(input.value));

const conversions = computed(() => {
  const d = parsed.value?.date;
  if (!d) return [];
  const ms = d.getTime();
  return [
    { label: "Unix seconds", value: String(Math.floor(ms / 1000)) },
    { label: "Unix milliseconds", value: String(ms) },
    { label: "ISO 8601 (UTC)", value: d.toISOString() },
    { label: `Local (${localTimeZone})`, value: formatInZone(d, localTimeZone) },
    { label: "RFC 7231 / HTTP date", value: d.toUTCString() },
    { label: "Relative", value: formatRelative(d, now.value.getTime()) },
  ];
});

// ---- Time zones ----
const zoneList = allTimeZones();
const zones = useLocalStorage("timestamp:zones", [
  ...new Set(["UTC", localTimeZone, "Asia/Kolkata", "America/New_York", "Europe/London", "Asia/Tokyo"]),
]);
const newZone = ref("");

function addZone() {
  const match = zoneList.find((z) => z.toLowerCase() === newZone.value.trim().toLowerCase()) ?? (newZone.value.trim().toUpperCase() === "UTC" ? "UTC" : undefined);
  if (!match) return toast.error("Unknown time zone — pick one from the list");
  if (!zones.value.includes(match)) zones.value.push(match);
  newZone.value = "";
}

const zoneRows = computed(() => {
  const d = parsed.value?.date;
  if (!d) return [];
  return zones.value.map((zone) => ({
    zone,
    offset: formatOffset(timeZoneOffset(d, zone)),
    time: formatInZone(d, zone),
    local: zone === localTimeZone,
  }));
});

// ---- Wall time in a zone → instant ----
const wallZone = ref(localTimeZone);
const wallTime = ref(toWallTime(new Date(), localTimeZone));

function applyWallTime() {
  const date = wallTimeToDate(wallTime.value, wallZone.value);
  if (!date) return toast.error("Enter a valid date and time");
  input.value = date.toISOString();
}
</script>

<template>
  <ToolPage>
    <div class="grid gap-4 sm:grid-cols-3">
      <div v-for="item in live" :key="item.label" class="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-xs">
        <div class="min-w-0 flex-1">
          <p class="flex items-center gap-1.5 text-xs text-muted"><Clock class="size-3.5" /> Now · {{ item.label }}</p>
          <p class="mt-1 truncate font-mono text-lg font-semibold tabular-nums">{{ item.value }}</p>
        </div>
        <CopyButton :text="item.value" label="" variant="ghost" />
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div class="flex min-w-0 flex-col gap-4">
        <AppPanel title="Convert" description="Unix seconds / ms / µs / ns, ISO 8601, or any date string. Unit is detected automatically.">
          <div class="flex gap-2">
            <input v-model="input" class="field-mono" spellcheck="false" placeholder="1760347800, 2026-10-13T09:30:00Z, now…" aria-label="Timestamp or date" />
            <AppButton @click="input = String(Date.now())">Now</AppButton>
          </div>
          <p v-if="parsed" class="mt-2 text-xs text-muted">Detected: <span class="font-medium text-fg">{{ parsed.source }}</span></p>
          <InlineAlert v-else-if="input.trim()" class="mt-3">Couldn't understand this as a timestamp or date.</InlineAlert>
        </AppPanel>

        <AppPanel v-if="conversions.length" title="Results" flush>
          <ul class="divide-y divide-border">
            <li v-for="row in conversions" :key="row.label" class="flex items-center gap-3 px-4 py-2.5">
              <span class="w-40 shrink-0 text-xs text-muted">{{ row.label }}</span>
              <code class="min-w-0 flex-1 font-mono text-sm break-all">{{ row.value }}</code>
              <CopyButton :text="row.value" label="" variant="ghost" />
            </li>
          </ul>
        </AppPanel>

        <AppPanel title="From a time in a specific zone" description="“What's 9:30 AM in New York as a timestamp?”">
          <div class="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input v-model="wallTime" type="datetime-local" step="1" class="field" aria-label="Date and time" />
            <select v-model="wallZone" class="field" aria-label="Time zone">
              <option v-for="z in zoneList" :key="z" :value="z">{{ z }}</option>
            </select>
            <AppButton variant="primary" @click="applyWallTime">Convert</AppButton>
          </div>
        </AppPanel>
      </div>

      <AppPanel title="Time zones" flush class="self-start">
        <template #actions>
          <form class="flex gap-2" @submit.prevent="addZone">
            <input v-model="newZone" list="tz-list" class="field h-8 w-48 py-1 text-xs" placeholder="Add zone, e.g. Europe/Berlin" aria-label="Add time zone" />
            <datalist id="tz-list"><option v-for="z in zoneList" :key="z" :value="z" /></datalist>
            <AppButton type="submit" size="sm" :icon="Plus" aria-label="Add time zone" />
          </form>
        </template>
        <ul class="divide-y divide-border">
          <li v-for="row in zoneRows" :key="row.zone" class="group flex items-center gap-3 px-4 py-3">
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium">
                {{ row.zone.replaceAll("_", " ") }}
                <span v-if="row.local" class="ml-1 rounded-full bg-brand-soft px-1.5 py-0.5 text-[10px] font-semibold text-brand">YOU</span>
              </p>
              <p class="font-mono text-xs text-muted">{{ row.offset }}</p>
            </div>
            <p class="text-right font-mono text-sm tabular-nums">{{ row.time }}</p>
            <button
              class="cursor-pointer text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-danger focus:opacity-100"
              :aria-label="`Remove ${row.zone}`"
              @click="zones = zones.filter((z) => z !== row.zone)"
            >
              <X class="size-4" />
            </button>
          </li>
          <li v-if="!zoneRows.length" class="px-4 py-8 text-center text-sm text-muted">Enter a valid time to see it across zones.</li>
        </ul>
      </AppPanel>
    </div>
  </ToolPage>
</template>
