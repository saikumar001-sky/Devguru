<template>
  <div class="main-wrapper w-100">
    <header
      class="h-20 dark:bg-gray-800 dark:text-white p-2 px-4 bg-secondary shadow-sm"
    >
      <p class="text-3xl text-white font-bold">
        <span>Dev</span><span class="text-primary-500">Ease</span>
      </p>
      <small class="text-lg text-white"
        >Tools to Code, Tools to Validate.</small
      >
    </header>
    <main
      class="dark:bg-gray-700 main-section px-10 m-auto flex flex-row gap-6"
    >
      <div class="w-1/4 h-5/6 m-auto">
        <!-- <div> <input type="text" class="border w-full p-3 focus:border-primary"></div> -->
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="(tool, index) in tools"
            :keys="index"
            :class="{ 'bg-red-100': tool.isActive }"
            class="hover-main-card dark:bg-white"
            @click="navigateTool(tool)"
          >
            <div>
              <img :src="tool.icon" class="w-12 m-auto" />{{ tool.title }}
            </div>
          </button>
        </div>
      </div>
      <div class="m-auto h-5/6 w-full main-content-section">
        <div class="w-full h-full rounded-lg">
          <router-view></router-view>
        </div>
      </div>
    </main>
  </div>
</template>
<script setup lang="js">
import { ref } from "vue";
import {useRouter} from "vue-router"
import idIcon from "../../assets/icons/id-icon.svg"
import imageIcon from "../../assets/icons/image-icon.svg"
import baseIcon from "../../assets/icons/base-icon.svg"
import jwtIcon from "../../assets/icons/jwt-icon.png"
import colorIcon from "../../assets/icons/color-icon.svg"
import textIcon from "../../assets/icons/text.svg"
import jsIcon from "../../assets/icons/jslogo.svg"
const router=useRouter()
const tools = ref([
{
    title: "JS Compiler",
    icon: jsIcon,
    route: "/js-compiler",
    isActive: false
  },
  {
    title: "Image Compressor",
    icon: imageIcon,
    route: "/image-compressor",
    isActive: false
  },
  {
    title: "UUID Generator",
    icon: idIcon,
    route: "/uuid-generator",
    isActive: true
  },
  {
    title: "Base64 Generator",
    icon: baseIcon,
    route: "/base64-generator",
    isActive: false
  },
  {
    title: "JWT Decoder",
    icon: jwtIcon,
    route: "/jwt-decoder",
    isActive: false
  },
  {
    title: "Color Picker and Converter",
    icon: colorIcon,
    route: "/color-picker",
    isActive: false
  },
  {
    title: "Text Compare",
    icon:textIcon ,
    route: "/text-diff-checker",
    isActive: false
  }
]
);
const navigateTool = (tool) => {
  tools.value.forEach((ele) => {
    ele.isActive = ele.title === tool.title ? true : false;
  });
  router.push(tool.route)
};
</script>
<style></style>
