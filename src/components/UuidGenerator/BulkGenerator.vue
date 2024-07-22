<template>
  <div class="w-100">
    <h2 class="text-base font-medium">Bulk UUID Generator (v4):</h2>
    <p class="py-3 rounded-sm">
      Our bulk UUID generator allows you to effortlessly generate up to
      <strong class="text-primary-500">100 unique identifiers in one go </strong>
      . Ideal for applications requiring large-scale UUID creation, this tool
      streamlines the process, ensuring efficiency and consistency across your
      projects. Simply input your requirements, and our generator swiftly
      produces batches of 100 UUIDs, saving time and enhancing productivity in
      your development workflow.
    </p>
    <div class="mb-2">
      <input
        type="number"
        class="h-11 p-4 rounded-sm"
        placeholder="Enter No of UUID's"
        v-model="no_of_uuids"
      />
      <button
        @click="generateBulkUUID(no_of_uuids)"
        class="bg-primary-500 mt-4 md:mt-0  h-10 text-center  px-3 rounded-md hover:bg-primary-800 hover:shadow-md text-white ms-2"
      >
        Generate
      </button>
      <button
        @click="copyUUid(bulkUUIDs)"
        class="bg-slate-300 ms-2 h-10 text-center px-3 rounded-md hover:bg-slate-400 hover:shadow-md"
      >
        Copy
      </button>
      <!-- <button
        @click="download(bulkUUIDs)"
        class="bg-slate-300 ms-2 h-10 text-center px-3 rounded-md hover:bg-slate-400 hover:shadow-md"
      >
        Download
      </button> -->
    </div>
    <div class="flex gap-3 items-center">
      <div
        class="text-center w-full grid grid-cols-1 md:grid-cols-2 bg-slate-100 p-3 rounded-lg"
      >
        <p v-for="uuid in bulkUUIDs" :key="uuid">{{ uuid }}</p>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";

const bulkUUIDs = ref([]);
const no_of_uuids = ref(6);
onMounted(() => {
  generateBulkUUID(no_of_uuids.value);
});
const generateBulkUUID = (data) => {
  if (data && data > 0) {
    bulkUUIDs.value = [];
    for (let i = 0; i < data; i++) {
      bulkUUIDs.value.push(generateUUID());
    }
  } else {
    alert("Please add valid number");
  }
};
const generateUUID = () => {
  let d = new Date().getTime();
  let d2 = (performance && performance.now && performance.now() * 1000) || 0;
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
};
const copyUUid = (textToCopy) => {
  const textArea = document.createElement("textarea");
  textArea.value = textToCopy;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
  alert("Text copied to clipboard!");
};
</script>
<style></style>
