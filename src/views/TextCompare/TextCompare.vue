<template>
  <div class="w-100 bg-transparent">
    <header class="dark:bg-gray-800 dark:text-white p-2 flex px-4 shadow-sm">
      <img src="../../assets/icons/text.svg" class="w-12" />
      <p class="ms-4 mt-4 font-bold text-xl">Text Compare</p>
    </header>
    <main class="dark:bg-gray-700 bg-slate-50 p-4">
      <textCompare />
    </main>
  </div>
</template>
<script setup lang="js">
import textCompare from "@/components/TextCompare/textCompare.vue";
</script>
<style></style>
