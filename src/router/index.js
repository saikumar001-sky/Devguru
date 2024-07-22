import { createWebHashHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/",
    redirect:"/js-compiler"
  },
  {
    path: "/uuid-generator",
    name:"uuid-generator",
    component: () => import("../views/UUID/UuidGen.vue"),
  },
  {
    path: "/text-diff-checker",
    name:"text-diff-checker",
    component: () => import("../views/TextCompare/TextCompare.vue"),
  },
  {
    path: "/jwt-decoder",
    name:"jwt-decoder",
    component: () => import("../views/JWT/index.vue"),
  },
  {
    path: "/js-compiler",
    name:"js-compiler",
    component: () => import("../views/JsCompiler/JsCompiler.vue"),
  },
  {
    path: "/html-compiler",
    name:"html-compiler",
    component: () => import("../views/HtmlCompiler/htmlCompiler.vue"),
  },
  {
    path: "/image-compressor",
    name:"image-compressor",
    component: () => import("../views/ImageCompressor/index.vue"),
  },
  {
    path: "/color-picker",
    name:"color-picker",
    component: () => import("../views/ColorPicker/colorPicker.vue"),
  },
  {
    path: "/base64-generator",
    name:"base64-generator",
    component: () => import("../views/Base64/base64.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
