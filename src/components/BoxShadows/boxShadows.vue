<template>
  <div class="grid grid-cols-3 p-10 gap-10 h-[70vh] border justify-center overflow-y-auto">
    <div v-for="(shadow, index) in shadows" :key="index" title="Click to copy" @click="copyShadow(shadow)"
      class="size-60 cursor-pointer rounded-lg flex justify-center items-center" :style="returnStyle(shadow)">
      <div class="text-center p-2">
        <p class="font-bold">{{ shadow.title }}</p>
        <p class="font-bold">{{ shadow.source }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import { shadows } from './boxshadow';
const returnStyle = (shadow) => {
  return `box-shadow:${shadow.value}`
}
const copyShadow = (shadow) => {
  try {
    const copyShadow = `box-shadow: ${shadow.value};`
    navigator.clipboard.writeText(copyShadow)
    alert("Copied Successfully")
  } catch (err) {
    console.log(err)
    alert("Failed to copy Box Shadow")
  }
}
</script>
