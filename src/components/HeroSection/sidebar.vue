<template>
  <div
    class="bg-slate-50 dark:bg-slate-600 md:dark:bg-transparent md:bg-transparent p-3 w-full md:w-1/4 md:h-5/6 m-auto"
  >
    <!-- <div> <input type="text" class="border w-full p-3 focus:border-primary"></div> -->

    <div class="grid grid-cols-3 md:grid-cols-2 gap-3">
      <button
        v-for="(tool, index) in tools"
        :key="index"
        :class="{ 'bg-red-100': tool.route == route.name }"
        class="hover-main-card bg-white dark:bg-slate-400 md:bg-inherit md:dark:bg-white"
        @click="navigateTool(tool)"
      >
        <div class="text-xs md:text-base">
          <img :src="tool.icon" class="w-6 md:w-12 m-auto" />{{ tool.title }}
        </div>
        <div class="text-xs md:text-base">
          <img :src="tool.icon" class="w-6 md:w-12 m-auto" />{{ tool.title }}
        </div>
      </button>
    </div>
  </div>
</template>
<script setup lang="js">
import { ref } from "vue";
import {useRouter,useRoute} from "vue-router"
import idIcon from "../../assets/icons/id-icon.svg"
import imageIcon from "../../assets/icons/image-icon.svg"
import baseIcon from "../../assets/icons/base-icon.svg"
import jwtIcon from "../../assets/icons/jwt-icon.png"
import colorIcon from "../../assets/icons/color-icon.svg"
import textIcon from "../../assets/icons/text.svg"
import jsIcon from "../../assets/icons/jslogo.svg"
import HtmlIcon from "../../assets/icons/htmlicon.svg"
const router=useRouter()
const route=useRoute()
const tools = ref([
{
    title: "JS Compiler",
    icon: jsIcon,
    route: "js-compiler",
    isActive: false
  },
  {
    title: "HTML Compiler",
    icon: HtmlIcon,
    route: "html-compiler",
    isActive: false
  },
  {
    title: "JWT Decoder",
    icon: jwtIcon,
    route: "jwt-decoder",
    isActive: false
  },
  {
    title: "Image Compressor",
    icon: imageIcon,
    route: "image-compressor",
    isActive: false
  },
  {
    title: "UUID Generator",
    icon: idIcon,
    route: "uuid-generator",
    isActive: false
  },
  {
    title: "Base64 Generator",
    icon: baseIcon,
    route: "base64-generator",
    isActive: false
  },

  // {
  //   title: "Color Picker and Converter",
  //   icon: colorIcon,
  //   route: "color-picker",
  //   isActive: false
  // },
  // {
  //   title: "Text Compare",
  //   icon:textIcon ,
  //   route: "text-diff-checker",
  //   isActive: false
  // }
]
);
const navigateTool = (tool) => {
  tools.value.forEach((ele) => {
    ele.isActive = ele.title === tool.title ? true : false;
  });
  router.push({name:tool.route})
};
</script>
<style></style>
