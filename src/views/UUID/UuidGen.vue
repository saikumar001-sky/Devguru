<template>
  <div class=" w-100 bg-transparent">
    <header class="dark:bg-gray-800 dark:text-white p-2 flex px-4 shadow-sm">
      <img src="../../assets/icons/id-icon.svg" class="w-12" />
      <p class="ms-4 mt-4 font-bold text-xl">UUID Generator</p>
    </header>
    <main class="dark:bg-gray-700">
      <div class="bg-gray-200">
        <button
          v-for="(tab, index) in tabs"
          :key="index"
          @click="activateTab(tab)"
          :class="{ 'bg-primary-500 text-white': tab.isActive }"
          class="p-3 hover:shadow-md hover:bg-primary-500"
        >
          {{ tab.title }}
        </button>
      </div>
      <div class="p-4 bg-slate-50">
        <keep-alive>
          <component :is="activeTab" />
        </keep-alive>
      </div>
    </main>
  </div>
</template>
<script setup lang="js">
import { ref, shallowRef } from "vue";
import RandomGen from "@/components/UuidGenerator/RandomGen.vue";
import BulkGenerator from "@/components/UuidGenerator/BulkGenerator.vue";
import UuidDecoder from "@/components/UuidGenerator/UuidDecoder.vue";
const activeTab = shallowRef(RandomGen);
const tabs = ref([
  {
    id: RandomGen,
    title: "Random UUID Generator",
    isActive: true,
  },
  {
    id: BulkGenerator,
    title: "Bulk UUID Generator",
    isActive: false,
  },
  { id: UuidDecoder, title: "UUID Decoder", isActive: false },
]);
const activateTab = (tab) => {
  tabs.value.forEach((ele) => {
    ele.isActive = ele.title === tab.title ? true : false;
  });
  activeTab.value = tab.id;
};
</script>
<style></style>
