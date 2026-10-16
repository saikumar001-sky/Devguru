<script setup lang="ts">
import { ArrowUpRight, ShieldCheck, Zap } from "lucide-vue-next";
import { categories, tools } from "@/tools";

// The SecretHawk docs live in the registry too, but they aren't a tool.
const toolCount = tools.filter((tool) => tool.category !== "Docs").length;

const groups = categories.map((category) => ({
  category,
  items: tools.filter((tool) => tool.category === category),
}));
</script>

<template>
  <div class="flex flex-col gap-10">
    <section
      class="relative overflow-hidden rounded-2xl border border-border bg-surface px-6 py-10 shadow-xs sm:px-10 sm:py-14"
    >
      <div
        class="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-brand/20 blur-3xl"
        aria-hidden="true"
      />
      <div class="relative max-w-2xl">
        <p
          class="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-medium text-muted"
        >
          <Zap class="size-3.5 text-brand" /> {{ toolCount }} tools · zero sign-up
        </p>
        <h1 class="mt-5 text-3xl font-bold tracking-tight text-balance sm:text-5xl">
          The everyday toolbox for <span class="text-brand">developers & testers</span>
        </h1>
        <p class="mt-4 text-base text-pretty text-muted sm:text-lg">
          Run snippets, decode tokens, generate IDs, compress images and more — fast, keyboard
          friendly, and entirely in your browser.
        </p>
        <p class="mt-6 inline-flex items-center gap-2 text-sm text-muted">
          <ShieldCheck class="size-4 text-success" /> Your data never leaves this tab.
        </p>
      </div>
    </section>

    <section v-for="group in groups" :key="group.category">
      <h2 class="mb-3 text-xs font-semibold tracking-wider text-muted uppercase">
        {{ group.category }}
      </h2>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <RouterLink
          v-for="tool in group.items"
          :key="tool.id"
          :to="`/${tool.id}`"
          class="group relative flex gap-4 rounded-xl border border-border bg-surface p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
        >
          <span
            class="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand transition-transform group-hover:scale-105"
          >
            <component :is="tool.icon" class="size-5" />
          </span>
          <span class="min-w-0">
            <span class="flex items-center gap-1 font-semibold">
              {{ tool.title }}
              <ArrowUpRight
                class="size-4 text-muted opacity-0 transition-opacity group-hover:opacity-100"
              />
            </span>
            <span class="mt-1 block text-sm text-muted">{{ tool.description }}</span>
          </span>
        </RouterLink>
      </div>
    </section>

    <footer class="border-t border-border pt-6 text-center text-sm text-muted">
      Built by
      <RouterLink to="/about" class="font-medium text-fg hover:text-brand">Andhili Saikumar</RouterLink>
      · Frontend Developer
    </footer>
  </div>
</template>
