<template>
  <div class="w-100 bg-transparent">
    <header class="dark:bg-gray-800 dark:text-white p-2 flex px-4 shadow-sm">
      <img src="../../assets/icons/color-icon.svg" class="w-12" />
      <p class="ms-4 mt-4 font-bold text-xl">Colors</p>
    </header>
    <main class="dark:bg-gray-700 bg-slate-50 p-4">
      <button class="p-3 m-3 bg-green-200" @click="save()">save in local</button>
      <button class="p-3 m-3 bg-red-200" @click="get()">get from local</button>
      {{ getData&&getData.designation }}
    </main>
  </div>
</template>
<script setup lang="js">
import { ref } from 'vue';
const userdata=ref({
  name:"sai",
  designation:"developer"
})
const getData=ref(null)
const save=()=>{
  localStorage.setItem("userData",JSON.stringify(userdata.value))
}
const get=()=>{
  getData.value=JSON.parse(localStorage.getItem("userData"))
}
</script>
<style></style>
