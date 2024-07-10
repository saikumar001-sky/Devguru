import { createMemoryHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("../components/HeroSection/HeroSec.vue"),
    children: [
      {
        path: "/uuid-generator",
        component: () => import("../views/UUID/UuidGen.vue"),
      },
      {
        path: "/text-diff-checker",
        component: () => import("../views/TextCompare/TextCompare.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

export default router;
