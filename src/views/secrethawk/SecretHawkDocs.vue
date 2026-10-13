<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { ArrowLeft, ArrowRight, ExternalLink, Github, Package } from "lucide-vue-next";
import { NPM_URL, REPO_URL, SECRETHAWK_VERSION, sectionGroups, sections } from "./sections";

const route = useRoute();
const current = computed(() => {
  const id = typeof route.params.section === "string" ? route.params.section : "overview";
  return sections.find((s) => s.id === id) ?? sections[0]!;
});
const index = computed(() => sections.indexOf(current.value));
const prev = computed(() => sections[index.value - 1]);
const next = computed(() => sections[index.value + 1]);

const linkTo = (id: string) => (id === "overview" ? "/secrethawk" : `/secrethawk/${id}`);

watch(current, (section) => {
  if (route.name === "secrethawk") document.title = `${section.title} · SecretHawk Docs · DevEase`;
}, { immediate: true });
</script>

<template>
  <div class="flex flex-col gap-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <span class="grid size-12 place-items-center rounded-xl border border-border bg-surface text-2xl shadow-xs" aria-hidden="true">🦅</span>
        <div>
          <h1 class="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            SecretHawk
            <span class="rounded-full bg-brand-soft px-2 py-0.5 font-mono text-xs font-medium text-brand">v{{ SECRETHAWK_VERSION }}</span>
          </h1>
          <p class="mt-0.5 text-sm text-muted">Catch API keys, tokens and private keys before they reach Git history.</p>
        </div>
      </div>
      <div class="flex gap-2">
        <a :href="NPM_URL" target="_blank" rel="noopener" class="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-medium shadow-xs hover:bg-surface-2">
          <Package class="size-4" /> npm <ExternalLink class="size-3 text-muted" />
        </a>
        <a :href="REPO_URL" target="_blank" rel="noopener" class="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-medium shadow-xs hover:bg-surface-2">
          <Github class="size-4" /> GitHub <ExternalLink class="size-3 text-muted" />
        </a>
      </div>
    </header>

    <div class="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[210px_minmax(0,1fr)]">
      <!-- Section navigation: chips on small screens, sticky list on large ones -->
      <nav aria-label="Documentation" class="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <div class="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin lg:hidden">
          <RouterLink
            v-for="s in sections"
            :key="s.id"
            :to="linkTo(s.id)"
            :class="s.id === current.id ? 'border-brand bg-brand-soft text-brand' : 'border-border text-muted'"
            class="shrink-0 rounded-full border px-3 py-1 text-xs font-medium"
          >
            {{ s.title }}
          </RouterLink>
        </div>
        <div class="hidden lg:block">
          <div v-for="g in sectionGroups" :key="g.group" class="mb-5">
            <p class="mb-1.5 px-2.5 text-[11px] font-semibold tracking-wider text-muted/80 uppercase">{{ g.group }}</p>
            <RouterLink
              v-for="s in g.items"
              :key="s.id"
              :to="linkTo(s.id)"
              :class="s.id === current.id ? 'bg-brand-soft text-brand' : 'text-muted hover:bg-surface-2 hover:text-fg'"
              class="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors"
            >
              <component :is="s.icon" class="size-4" />
              {{ s.title }}
            </RouterLink>
          </div>
        </div>
      </nav>

      <article class="min-w-0 rounded-2xl border border-border bg-surface px-5 py-7 shadow-xs sm:px-10 sm:py-9">
        <p v-if="current.pkg" class="mb-1 font-mono text-xs text-brand">{{ current.pkg }}</p>
        <h1 class="mb-6 text-3xl font-bold tracking-tight">{{ current.title }}</h1>
        <div class="prose-doc">
          <component :is="current.component" :key="current.id" />
        </div>

        <footer class="mt-12 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
          <RouterLink v-if="prev" :to="linkTo(prev.id)" class="group rounded-xl border border-border p-4 hover:border-brand/40">
            <span class="flex items-center gap-1 text-xs text-muted"><ArrowLeft class="size-3.5" /> Previous</span>
            <span class="mt-1 block font-semibold group-hover:text-brand">{{ prev.title }}</span>
          </RouterLink>
          <span v-else />
          <RouterLink v-if="next" :to="linkTo(next.id)" class="group rounded-xl border border-border p-4 text-right hover:border-brand/40">
            <span class="flex items-center justify-end gap-1 text-xs text-muted">Next <ArrowRight class="size-3.5" /></span>
            <span class="mt-1 block font-semibold group-hover:text-brand">{{ next.title }}</span>
          </RouterLink>
        </footer>
      </article>
    </div>
  </div>
</template>
