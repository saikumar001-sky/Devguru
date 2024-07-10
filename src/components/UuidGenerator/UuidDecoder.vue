<template>
  <div class="w-100">
    <div class="flex gap-3 items-center">
      <input
        type="text"
        class="h-11 w-2/4 p-4 rounded-sm"
        placeholder="Enter UUID"
        v-model="uuid"
      />
      <button
        @click="decodeUUID"
        class="bg-primary-500 h-10 text-center px-3 rounded-md hover:bg-primary-800 hover:shadow-md text-white"
      >
        Decode UUID
      </button>
    </div>
    <div>
      <p class="font-medium">Result:</p>
      <table class="border bg-white my-4" v-if="decodedUUID">
        <tr class="border">
          <td class="p-3">Standard String Format</td>
          <td class="p-3">{{ decodedUUID.encode.STR }}</td>
        </tr>
        <tr class="border">
          <td class="p-3">Single Integer Value</td>
          <td class="p-3">{{ decodedUUID.encode.SIV }}</td>
        </tr>
        <tr class="border">
          <td class="p-3">Version</td>
          <td class="p-3">{{ decodedUUID.decode.version }}</td>
        </tr>
        <tr class="border">
          <td class="p-3">Variant</td>
          <td class="p-3">{{ decodedUUID.decode.variant }}</td>
        </tr>
        <tr class="border">
          <td class="p-3">Contents</td>
          <td class="p-3">{{ decodedUUID.decode.contents }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";

const uuid = ref("5a9bb58b-ded3-4de1-bb12-0ba907bbc829");
const decodedUUID = ref(null);
onMounted(() => {
  decodeUUID();
});
const decodeUUID = async () => {
  try {
    const response = await fetch(
      `https://www.uuidtools.com/api/decode/${uuid.value}`
    );
    if (!response.ok) {
      return alert("invalid UUID");
    }
    var data = await response.json();
    decodedUUID.value = data;
  } catch (err) {
    alert(err);
  }
};
</script>
<style></style>
