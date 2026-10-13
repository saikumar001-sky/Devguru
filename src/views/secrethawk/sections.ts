import type { Component } from "vue";
import {
  BookOpen,
  Code2,
  FileOutput,
  FlaskConical,
  FolderSearch,
  GitBranch,
  ListChecks,
  Settings2,
  Terminal,
  Webhook,
} from "lucide-vue-next";
import OverviewPage from "./OverviewPage.vue";
import CliPage from "./CliPage.vue";
import CodePage from "./CodePage.vue";
import GitPage from "./GitPage.vue";
import HooksPage from "./HooksPage.vue";
import ConfigPage from "./ConfigPage.vue";
import RulesPage from "./RulesPage.vue";
import ReportersPage from "./ReportersPage.vue";
import ApiPage from "./ApiPage.vue";
import PlaygroundPage from "./PlaygroundPage.vue";

export interface DocSection {
  id: string;
  title: string;
  /** npm package the page documents, shown under the title. */
  pkg?: string;
  group: "Get started" | "Packages" | "Try it";
  icon: Component;
  component: Component;
}

export const SECRETHAWK_VERSION = "0.1.1";
export const NPM_URL = "https://www.npmjs.com/package/secrethawk";
export const REPO_URL = "https://github.com/saikumar001-sky/secrethawk";

export const sections: DocSection[] = [
  { id: "overview", title: "Overview", group: "Get started", icon: BookOpen, component: OverviewPage },
  { id: "cli", title: "CLI", pkg: "@secrethawk/cli", group: "Get started", icon: Terminal, component: CliPage },
  { id: "code", title: "Code scanning", pkg: "@secrethawk/code", group: "Packages", icon: FolderSearch, component: CodePage },
  { id: "git", title: "Git", pkg: "@secrethawk/git", group: "Packages", icon: GitBranch, component: GitPage },
  { id: "hooks", title: "Git hooks", pkg: "@secrethawk/hooks", group: "Packages", icon: Webhook, component: HooksPage },
  { id: "config", title: "Configuration", pkg: "@secrethawk/config", group: "Packages", icon: Settings2, component: ConfigPage },
  { id: "rules", title: "Rules", pkg: "@secrethawk/rules", group: "Packages", icon: ListChecks, component: RulesPage },
  { id: "reporters", title: "Reporters & CI", pkg: "@secrethawk/reporters", group: "Packages", icon: FileOutput, component: ReportersPage },
  { id: "api", title: "Core API", pkg: "@secrethawk/core", group: "Packages", icon: Code2, component: ApiPage },
  { id: "playground", title: "Playground", group: "Try it", icon: FlaskConical, component: PlaygroundPage },
];

export const sectionGroups = (["Get started", "Packages", "Try it"] as const).map((group) => ({
  group,
  items: sections.filter((s) => s.group === group),
}));
