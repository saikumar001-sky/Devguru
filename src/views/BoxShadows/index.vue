<template>
  <div class="w-100 bg-transparent">
    <header
      class="dark:bg-gray-800 bg-primary-100 dark:text-white p-2 flex px-4 shadow-sm"
    >
      <img src="../../assets/icons/square-shadow.png" class="w-12" />
      <p class="ms-4 mt-4 font-bold text-xl">Box Shadows</p>
    </header>
    <main class="dark:bg-gray-700 bg-slate-50 p-2 md:p-4">
      <BoxShadows />
    </main>
  </div>
</template>
<script setup lang="js">
import BoxShadows from '../../components/BoxShadows/boxShadows.vue';
</script>
<style></style>
