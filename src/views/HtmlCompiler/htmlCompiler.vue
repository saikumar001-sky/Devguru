<template>
  <div class="w-100 bg-transparent">
    <header class="dark:bg-gray-800 dark:text-white p-2 flex px-4 shadow-sm">
      <img src="../../assets/icons/htmlicon.svg" class="w-12" />
      <p class="ms-4 mt-4 font-bold text-xl">Html Compiler</p>
    </header>
    <main class="dark:bg-gray-700 bg-slate-50 p-4">
      <div class="w-100 flex">
        <div class="pe-4 w-full">
          <div class="text-right mb-2">
            <button
              @click="compileJsCode()"
              class="bg-primary-500 h-10 mt-4 text-center px-3 rounded-md hover:bg-primary-800 hover:shadow-md text-white"
            >
              Run
            </button>
            <button
              @click="copyCode"
              class="bg-slate-300 ms-2 h-10 text-center px-3 rounded-md hover:bg-slate-400 hover:shadow-md"
            >
              Copy Code
            </button>
          </div>
          <div class="">
            <textarea v-model="compilerResult" id="editor"></textarea>
          </div>
        </div>
        <div class="p-1 logger-height bg-white basis-4/6 overflow-y-scroll">
          <iframe
            class="w-full h-full"
            id="code_result"
            :srcdoc="compilerResult"
          >
          </iframe>
        </div>
      </div>
    </main>
  </div>
</template>
<script setup lang="js">
import { ref, onMounted } from "vue";
import * as CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/htmlmixed/htmlmixed.js";
import "codemirror/addon/hint/css-hint.js"
import "codemirror/addon/hint/javascript-hint.js"
import "codemirror/addon/hint/html-hint.js"
import "codemirror/addon/hint/show-hint.css"
import "codemirror/addon/hint/show-hint.js"
import "codemirror/addon/edit/closetag.js";
const initialisedCodeEditor = ref();
const jsCode = ref(null);
const compilerResult = ref('');
onMounted(async () => {
  initCodeEditor();
  console.log("editor initialising HTML....");
});
const initCodeEditor = () => {
  initialisedCodeEditor.value = CodeMirror.fromTextArea(
    document.getElementById("editor"),
    {
      lineNumbers: true,
      theme: "dracula",
      mode: "htmlmixed",
      autoCloseTags:true,
      extraKeys: { "Ctrl-Space": "autocomplete" },
    }
  );
  initialisedCodeEditor.value.setSize("100%", "60vh");
};
const compileJsCode = async () => {
  try {
    console.log(initialisedCodeEditor.value);
    compilerResult.value = initialisedCodeEditor.value.getValue();
  } catch (err) {
    alert(err);
  }
};
const copyCode = () => {
  const getdata = initialisedCodeEditor.value.getValue();
  if (getdata) {
    const textArea = document.createElement("textarea");
    textArea.value = getdata;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    alert("Text copied to clipboard!");
  }
};
</script>
<style></style>
