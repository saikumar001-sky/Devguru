import { createRouter, createWebHashHistory } from "vue-router";
import { tools } from "@/tools";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "home", component: () => import("@/views/HomeView.vue") },
    ...tools.map((tool) => ({ path: tool.path ?? `/${tool.id}`, name: tool.id, component: tool.component })),
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
  scrollBehavior: () => ({ top: 0 }),
});

const baseTitle = "DevEase";
router.afterEach((to) => {
  const tool = tools.find((t) => t.id === to.name);
  document.title = tool ? `${tool.title} · ${baseTitle}` : `${baseTitle} — Developer Toolbox`;
});

export default router;
