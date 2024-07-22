<template>
  <div class="main-wrapper w-100 dark:bg-gray-700">
    <navbar />
    <main
      class=" main-section p-2 md:px-10 m-auto md:flex flex-row gap-6"
    >
      <sidebar />
      <div class="m-auto h-5/6 w-full main-content-section">
        <div class="w-full h-full rounded-lg">
          <router-view></router-view>
        </div>
      </div>
    </main>
  </div>
</template>
<script setup lang="js">
import navbar from "./components/HeroSection/navbar.vue";
import sidebar from "./components/HeroSection/sidebar.vue";
</script>
<style></style>
