<template>
  <div class="w-100 flex">
    <div class="basis-3/4">
      <label for="token">Enter Your JWT Token</label>
      <div class="flex gap-3 items-center">
        <textarea
          type="text"
          id="token"
          class="h-48 w-full p-4 rounded-sm"
          placeholder="Enter JWT Token"
          v-model="JWT"
        ></textarea>
      </div>
      <div class="flex justify-end">
        <button
          @click="decodeJWT"
          class="bg-primary-500 h-10 mt-4 text-center px-3 rounded-md hover:bg-primary-800 hover:shadow-md text-white"
        >
          Decode JWT Token
        </button>
      </div>
    </div>
    <div class="basis-2/4 p-4">
      <div class="mb-2">
        <p class="font-normal">HEADER: Algorithm & Token type</p>
        <textarea v-model="decodedHeader" id="editor"></textarea>
      </div>
      <p>PAYLOAD:Data</p>
      <div>
        <textarea v-model="decodedJWT" id="editor1"></textarea>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import * as CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript";

const JWT = ref(
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
);
const decodedJWT = ref(null);
const decodedHeader = ref(null);
const content = ref(null);
onMounted(async () => {
  await decodeJWT();
  initCodeEditor();
});
const initCodeEditor = () => {
  CodeMirror.fromTextArea(document.getElementById("editor"), {
    lineNumbers: true,
    theme: "dracula",
    mode: "javascript",
    readOnly: true,
  }).setSize("100%", 110);
  CodeMirror.fromTextArea(document.getElementById("editor1"), {
    lineNumbers: true,
    theme: "dracula",
    mode: "javascript",
  }).setSize("100%", 110);
};
const decodeJWT = async () => {
  try {
    const parts = JWT.value.split(".");
    if (parts.length != 3) {
      alert("Invalid JWT format");
      throw new Error("Invalid JWT format");
    }
    decodedHeader.value = null;
    decodedJWT.value = null;
    const payload = parts[1];
    const header = parts[0];
    const decodeHeader = JSON.parse(atob(header));
    decodedHeader.value = JSON.stringify(decodeHeader, null, 2);
    const decodedPayload = JSON.parse(atob(payload));
    decodedJWT.value = JSON.stringify(decodedPayload, null, 2);
    console.log(decodedJWT.value, decodedHeader.value);
  } catch (err) {
    alert(err);
  }
};
</script>
<style></style>
