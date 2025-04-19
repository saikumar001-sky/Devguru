<template>
  <div class="grid grid-cols-3 p-10 gap-10 h-[70vh] border justify-center overflow-y-auto">
    <div
      v-for="(shadow, index) in shadows"
      :key="index"
      class="size-60 rounded-lg flex justify-center items-center"
      :style="returnStyle(shadow)"
    >
      <div class="text-center p-2">
        <p># {{ index }}</p>
        <p class="font-bold">{{ shadow.title }}</p>
        <p class="font-bold">{{ shadow.source }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import { shadows } from './boxshadow';
const returnStyle=(shadow)=>{
    return `box-shadow:${shadow.value}`
}
</script>
