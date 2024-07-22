<template>
  <div class="w-100">
    <div class="flex gap-3">
      <div class="basis-3/5">
        <button
          @click="EncodeData"
          class="bg-primary-500 h-10 text-center px-3 my-3 rounded-md hover:bg-primary-800 hover:shadow-md text-white"
        >
          Decode Data
        </button>
        <p class="font-medium">Enter Encoded text to Decode:</p>
        <textarea
          type="text"
          class="h-40 w-full text-secondary p-4 rounded-sm"
          placeholder="Enter UUID"
          v-model="baseValue"
        ></textarea>
      </div>
      <div class="w-full">
        <div>
          <button
            @click="copyText(encodedResult)"
            class="bg-slate-300 h-10 text-center px-3 rounded-md hover:bg-slate-400 hover:shadow-md"
          >
            Copy
          </button>
        </div>
        <p class="font-medium">Result:</p>
        <textarea
          disabled
          class="h-40 w-full flex p-4 text-green-700 font-medium"
          v-model="encodedResult"
        ></textarea>
      </div>
    </div>

    <div class="flex">
      <div class="w-full">
        <button
          @click="previewFiles"
          class="bg-primary-500 h-10 text-center px-3 my-3 rounded-md hover:bg-primary-800 hover:shadow-md text-white"
        >
          Decode and Download Image
        </button>
        <p class="font-medium">Upload Image to encode:</p>
        <textarea
          class="h-52 w-full flex p-4 text-green-700 font-medium"
          v-model="uploadedImage"
        ></textarea>
      </div>
      <div class="w-100 h-52 my-5 basis-3/5">
        <!-- <div class="w-full">
          <label
            for="imgId"
            class="p-4 text-center rounded-md font-medium cursor-pointer text-white bg-primary-500"
            >Upload Image to Encode</label
          >
          <input
            @change="previewFiles"
            id="imgId"
            type="file"
            class="w-full"
            accept="image/*"
          />
        </div> -->
        <div>
          <a
            id="donwloadImage"
            download
            class="bg-primary-500 h-11 p-3 text-center px-3 rounded-md hover:bg-primary-800 hover:shadow-md text-white"
            >Download</a
          >
          <div class="p-3 mt-3 h-full bg-white me-2">
            <img id="originalImage" src="" class="pa-3 h-56 w-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
const uploadedImage = ref(null);
const baseValue = ref(
  "SG93IG1hbnkgZGV2ZWxvcGVycyBkb2VzIGl0IHRha2UgdG8gc2NyZXcgaW4gYSBsaWdodGJ1bGI/IEFOU1dFUjogTm9uZS4gSXTigJlzIGEgaGFyZHdhcmUgcHJvYmxlbS4="
);
const encodedResult = ref(null);
onMounted(() => {
  EncodeData();
});
const EncodeData = () => {
  encodedResult.value = atob(unescape(encodeURIComponent(baseValue.value)));
};
const previewFiles = () => {
  const donwloadimageAnchor = document.getElementById("donwloadImage");
  var originalImagedata = document.getElementById("originalImage");
  originalImagedata.setAttribute("src", uploadedImage.value);
  donwloadimageAnchor.href = uploadedImage.value;
};
const copyText = (textToCopy) => {
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
