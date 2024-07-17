<template>
  <div class="w-100 bg-transparent">
    <header class="dark:bg-gray-800 dark:text-white p-2 flex px-4 shadow-sm">
      <img src="../../assets/icons/image-icon.svg" class="w-12" />
      <p class="ms-4 mt-4 font-bold text-xl">JS Compiler</p>
    </header>
    <main class="dark:bg-gray-700 bg-slate-50 p-4">
      <div class="w-100 flex">
        <label
          for="imgId"
          class="p-4 w-full text-center rounded-md font-medium cursor-pointer bg-white"
          >Upload Image</label
        >
        <input @change="previewFiles" id="imgId" type="file" cept="image/*" />
      </div>
      <div
        class="w-100 bg-primary-50 flex p-3 m-3 gap-6 items-center"
        v-if="imageData && imageData[0].name"
      >
        <div class="bg-white p-3">
          <p class="text-xl text-secondary font-medium">
            ORIGINAL UPLOADED IMAGE:
          </p>
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
          <img id="originalImage" src="" class="pa-3" />
        </div>
        <div class="bg-white p-3 my-3">
          <p class="text-xl text-secondary font-medium">COMPRESSED IMAGE:</p>
          <div class="flex">
            <div class="bg-primary-50 flex p-1 my-2 rounded-md">
              <div>
                <p class="font-medium">Quality</p>
                <input type="range" id="Quality" v-model="qualitySlider" />
              </div>
              <p class="bg-primary-50 p-2 ms-3 rounded-md">
                <span class="font-medium"> {{ qualitySlider }} %</span>
              </p>
            </div>
            <div class="bg-primary-50 flex p-1 my-2 ms-3 rounded-md">
              <div>
                <p class="font-medium">Resizing</p>
                <input
                  type="range"
                  id="Resizing"
                  v-model="resizingFactorSlider"
                />
              </div>
              <p class="bg-primary-50 p-2 ms-3 rounded-md">
                <span class="font-medium"> {{ resizingFactorSlider }} %</span>
              </p>
            </div>
            <a
              id="donwloadImage"
              download
              class="bg-primary-500 h-10 mt-4 pt-2 ms-3 text-center px-3 rounded-md hover:bg-primary-800 hover:shadow-md text-white"
              >Download</a
            >
          </div>

          <img id="compressedImage" />
          {{ compressedSize }}
        </div>
      </div>
    </main>
  </div>
</template>
<script setup>
import { ref, watch } from "vue";
const uploadedImage = ref(null);
const imageData = ref(null);
const compressedImageBlob = ref(null);
const compressedSize = ref(null);
const resizingFactor = ref(0.8);
const quality = ref(0.8);
const resizingFactorSlider = ref(80);
const qualitySlider = ref(80);

watch(resizingFactorSlider, (val) => {
  if (val) {
    resizingFactor.value = parseInt(val) / 100;
    compressImage();
  }
});
watch(qualitySlider, (val) => {
  if (val) {
    quality.value = parseInt(val) / 100;
    compressImage();
  }
});

const previewFiles = async (event) => {
  console.log(event);
  imageData.value = event.target.files;
  uploadedImage.value = await fileToDataUri(imageData.value[0]);
  var originalImagedata = document.getElementById("originalImage");
  originalImagedata.setAttribute("src", uploadedImage.value);
  compressImage();
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
function bytesToSize(bytes) {
  var sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  if (bytes === 0) {
    return "0 Byte";
  }

  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));

  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
}
const compressImage = () => {
  //1. create an canvas
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  // 2. create canvas size
  var originalImagedata = document.getElementById("originalImage");
  const originalWidth = originalImagedata.width;
  const originalHeight = originalImagedata.height;

  const canvasWidth = originalWidth * resizingFactor.value;
  const canvasHeight = originalHeight * resizingFactor.value;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // 3.Draw contest (image) on canvas

  context.drawImage(
    originalImagedata,
    0,
    0,
    originalWidth * resizingFactor.value,
    originalHeight * resizingFactor.value
  );
  // reducing the quality of the image
  canvas.toBlob(
    (blob) => {
      if (blob) {
        compressedImageBlob.value = blob;
        const compressedImage = document.getElementById("compressedImage");
        const donwloadimageAnchor = document.getElementById("donwloadImage");
        compressedImage.src = URL.createObjectURL(compressedImageBlob.value);
        donwloadimageAnchor.href = URL.createObjectURL(
          compressedImageBlob.value
        );
        compressedSize.value = bytesToSize(blob.size);
      }
    },
    imageData && imageData.value[0].type ? imageData.value[0].type : "image/jpeg",
    quality.value
  );
  // const download=()=>{

  // }
};
</script>
<style></style>
