<script setup lang="ts">
import { ArrowUpRight, Github, Mail, Package, ShieldCheck, Wrench } from "lucide-vue-next";
import CopyButton from "@/components/ui/CopyButton.vue";

const profile = {
  name: "Andhili Saikumar",
  initials: "AS",
  role: "Frontend Developer",
  email: "andili.saikumar@gmail.com",
  github: "https://github.com/saikumar001-sky",
  githubHandle: "saikumar001-sky",
  npm: "https://www.npmjs.com/~saikumar001",
  npmHandle: "saikumar001",
};

const links = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}`, icon: Mail },
  { label: "GitHub", value: profile.githubHandle, href: profile.github, icon: Github },
  { label: "npm", value: `~${profile.npmHandle}`, href: profile.npm, icon: Package },
];

const projects = [
  {
    name: "DevEase",
    description:
      "This app — a private, in-browser toolbox for developers and testers: playgrounds, decoders, generators, formatters and design utilities.",
    icon: Wrench,
    tags: ["Vue 3", "TypeScript", "Vite", "Tailwind CSS"],
    links: [{ label: "Source", href: "https://github.com/saikumar001-sky/Devguru" }],
    to: "/",
  },
  {
    name: "SecretHawk",
    description:
      "A modular secret scanner that catches API keys, tokens and private keys in code, Git history and pre-commit hooks. Published as 9 npm packages.",
    icon: ShieldCheck,
    tags: ["Node.js", "ESM", "CLI", "Git hooks"],
    links: [
      { label: "npm", href: "https://www.npmjs.com/package/secrethawk" },
      { label: "Source", href: "https://github.com/saikumar001-sky/secrethawk" },
    ],
    to: "/secrethawk",
  },
];

const packages = [
  { name: "secrethawk", note: "Secret detection CLI & library (+ 8 @secrethawk/* packages)" },
  { name: "jwt-decoder-lib", note: "Framework-agnostic JWT decoder" },
  { name: "uuidx4-generator", note: "UUID v4 generator" },
  { name: "countryflags-vue", note: "Country flag components for Vue 3" },
  { name: "soft-chat", note: "" },
  { name: "softdev-icons", note: "" },
];

const stack = ["Vue 3", "TypeScript", "JavaScript", "Tailwind CSS", "Vite", "Node.js", "npm packages"];
</script>

<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-8">
    <section class="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-xs sm:p-10">
      <div class="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-brand/15 blur-3xl" aria-hidden="true" />
      <div class="relative flex flex-col gap-6 sm:flex-row sm:items-center">
        <span
          class="grid size-24 shrink-0 place-items-center rounded-2xl bg-brand text-3xl font-bold tracking-tight text-brand-fg shadow-md"
          aria-hidden="true"
        >
          {{ profile.initials }}
        </span>
        <div class="min-w-0">
          <p class="text-sm font-medium text-brand">Hi, I'm</p>
          <h1 class="mt-0.5 text-3xl font-bold tracking-tight sm:text-4xl">{{ profile.name }}</h1>
          <p class="mt-1 text-lg text-muted">{{ profile.role }}</p>
        </div>
      </div>
      <p class="relative mt-6 max-w-2xl text-pretty text-muted">
        I build fast, accessible web interfaces and the developer tools I wish I'd had — like DevEase, the toolbox you're
        using right now, and SecretHawk, a scanner that keeps secrets out of Git.
      </p>

      <ul class="relative mt-6 grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <li v-for="link in links" :key="link.label" class="flex items-center gap-2 rounded-xl border border-border bg-surface-2/60 p-2 pl-3">
          <component :is="link.icon" class="size-4 shrink-0 text-brand" />
          <a
            :href="link.href"
            :target="link.label === 'Email' ? undefined : '_blank'"
            rel="noopener"
            class="min-w-0 flex-1 hover:text-brand"
          >
            <span class="block text-[11px] font-medium tracking-wide text-muted uppercase">{{ link.label }}</span>
            <span class="block truncate text-sm font-medium">{{ link.value }}</span>
          </a>
          <CopyButton v-if="link.label === 'Email'" :text="profile.email" label="" variant="ghost" />
        </li>
      </ul>
    </section>

    <section>
      <h2 class="mb-3 text-xs font-semibold tracking-wider text-muted uppercase">Projects</h2>
      <div class="grid gap-4 md:grid-cols-2">
        <article v-for="p in projects" :key="p.name" class="flex flex-col rounded-xl border border-border bg-surface p-5 shadow-xs">
          <div class="flex items-center gap-3">
            <span class="grid size-10 place-items-center rounded-lg bg-brand-soft text-brand"><component :is="p.icon" class="size-5" /></span>
            <RouterLink :to="p.to" class="text-lg font-semibold hover:text-brand">{{ p.name }}</RouterLink>
          </div>
          <p class="mt-3 flex-1 text-sm text-muted">{{ p.description }}</p>
          <div class="mt-4 flex flex-wrap gap-1.5">
            <span v-for="tag in p.tags" :key="tag" class="rounded-full bg-surface-2 px-2 py-0.5 text-xs">{{ tag }}</span>
          </div>
          <div class="mt-4 flex flex-wrap gap-4 border-t border-border pt-3 text-sm font-medium">
            <RouterLink :to="p.to" class="text-brand hover:underline">{{ p.to === "/" ? "Open" : "Read the docs" }}</RouterLink>
            <a v-for="l in p.links" :key="l.label" :href="l.href" target="_blank" rel="noopener" class="inline-flex items-center gap-0.5 text-muted hover:text-fg">
              {{ l.label }} <ArrowUpRight class="size-3.5" />
            </a>
          </div>
        </article>
      </div>
    </section>

    <section>
      <div class="mb-3 flex items-baseline justify-between">
        <h2 class="text-xs font-semibold tracking-wider text-muted uppercase">Open-source packages</h2>
        <a :href="profile.npm" target="_blank" rel="noopener" class="inline-flex items-center gap-0.5 text-xs font-medium text-brand hover:underline">
          All on npm <ArrowUpRight class="size-3.5" />
        </a>
      </div>
      <ul class="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2">
        <li v-for="pkg in packages" :key="pkg.name">
          <a
            :href="`https://www.npmjs.com/package/${pkg.name}`"
            target="_blank"
            rel="noopener"
            class="group flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-brand/40"
          >
            <Package class="size-4 shrink-0 text-muted group-hover:text-brand" />
            <span class="min-w-0 flex-1">
              <span class="block font-mono text-sm font-medium">{{ pkg.name }}</span>
              <span v-if="pkg.note" class="block truncate text-xs text-muted">{{ pkg.note }}</span>
            </span>
            <ArrowUpRight class="size-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
        </li>
      </ul>
    </section>

    <section>
      <h2 class="mb-3 text-xs font-semibold tracking-wider text-muted uppercase">What I work with</h2>
      <div class="flex flex-wrap gap-2">
        <span v-for="s in stack" :key="s" class="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm shadow-xs">{{ s }}</span>
      </div>
    </section>

    <section class="flex flex-col items-start gap-4 rounded-2xl border border-border bg-surface p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-lg font-semibold">Let's talk</h2>
        <p class="text-sm text-muted">Feedback on DevEase, a bug, or a frontend role — my inbox is open.</p>
      </div>
      <a :href="`mailto:${profile.email}`" class="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-medium text-brand-fg shadow-sm hover:bg-brand-hover">
        <Mail class="size-4" /> Email me
      </a>
    </section>
  </div>
</template>
