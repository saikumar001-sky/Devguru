<template>
  <div class="w-100">
    <div class="md:flex gap-3">
      <div class="basis-3/5">
        <button
          @click="EncodeData"
          class="bg-primary-500 h-10 text-center px-3 my-3 rounded-md hover:bg-primary-800 hover:shadow-md text-white"
        >
          Encode Data
        </button>
        <p class="font-medium">Enter text to encode:</p>
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
          <!-- <button
            @click="EncodeData"
            class="bg-primary-500 ms-3 h-10 text-center px-3 my-3 rounded-md hover:bg-primary-800 hover:shadow-md text-white"
          >
            Download
          </button> -->
        </div>
        <p class="font-medium">Result:</p>
        <textarea
          disabled
          class="h-40 w-full flex p-4 text-green-700 font-medium"
          v-model="encodedResult"
        ></textarea>
      </div>
    </div>

    <div class="md:flex">
      <div class="w-100 h-52 my-5 basis-3/5">
        <div class="w-full">
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
        </div>
        <div class="my-4">
          <p class="font-medium">Upload Image to encode:</p>
          <div
            class="p-3 h-full bg-white me-2"
            v-if="imageData && imageData[0].name"
          >
            <img
              v-if="imageData && imageData[0].name"
              id="originalImage"
              src=""
              class="pa-3 h-28"
            />
            <p>
              Name:
              <span class="font-medium">{{
                imageData && imageData[0].name
              }}</span>
            </p>

            <p>
              Type:
              <span class="font-medium">{{
                imageData && imageData[0].type
              }}</span>
            </p>
            <p class="font-medium rounded-lg">
              <span>SIZE: </span
              >{{
                imageData && imageData[0].size
                  ? parseInt(imageData[0].size) / 1024
                  : null
              }}
              KB
            </p>
          </div>
        </div>
      </div>
      <div class="w-full">
        <div>
          <button
            @click="copyText(uploadedImage)"
            class="bg-slate-300 h-10 text-center px-3 rounded-md hover:bg-slate-400 hover:shadow-md"
          >
            Copy
          </button>
          <!-- <button
            @click="EncodeData"
            class="bg-primary-500 ms-3 h-10 text-center px-3 my-3 rounded-md hover:bg-primary-800 hover:shadow-md text-white"
          >
            Download
          </button> -->
        </div>
        <p class="font-medium">Result:</p>
        <textarea
          disabled
          class="h-52 w-full flex p-4 text-green-700 font-medium"
          v-model="uploadedImage"
        ></textarea>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
const uploadedImage = ref(null);
const imageData = ref(null);
const baseValue = ref(
  "How many developers does it take to screw in a lightbulb? ANSWER: None. It’s a hardware problem."
);
const encodedResult = ref(null);
onMounted(() => {
  EncodeData();
});
const EncodeData = () => {
  encodedResult.value = btoa(unescape(encodeURIComponent(baseValue.value)));
};
const previewFiles = async (event) => {
  console.log(event);
  imageData.value = event.target.files;
  uploadedImage.value = await fileToDataUri(event.target.files[0]);
  var originalImagedata = document.getElementById("originalImage");
  originalImagedata.setAttribute("src", uploadedImage.value);
};
function fileToDataUri(field) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      resolve(reader.result);
    });
    reader.readAsDataURL(field);
  });
}
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
