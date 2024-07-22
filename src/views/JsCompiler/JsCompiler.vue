<template>
  <div class="w-100 bg-transparent">
    <header class="dark:bg-gray-800 bg-primary-100 dark:text-white p-2 flex px-4 shadow-sm">
      <img src="../../assets/icons/jslogo.svg" class="w-12" />
      <p class="ms-4 mt-4 font-bold text-xl">JS Compiler</p>
    </header>
    <main class="dark:bg-gray-700 bg-slate-50 md:p-4">
      <div class="w-100 md:flex">
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
            <button
              class="bg-slate-300 ms-2 h-10 text-center px-3 rounded-md hover:bg-slate-400 hover:shadow-md"
            >
              Log Messages :{{ compilerResult && compilerResult.length }}
            </button>
          </div>
          <div class="">
            <textarea id="editor"></textarea>
          </div>
        </div>
        <div class="p-4 logger-height bg-white basis-4/6 overflow-y-scroll">
          <div>
            <ul v-for="(result, index) in compilerResult" :key="index">
              <li class="flex justify-center items-center">
                {{ index }}.
                <p
                  :class="
                    result.search('Compile Error') ? 'bg-green-50' : 'bg-red-50'
                  "
                  class="m-2 p-2 w-full"
                >
                  {{ result }}
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import * as CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript";
const initialisedCodeEditor = ref();
const jsCode = ref(null);
const compilerResult = ref(null);
onMounted(async () => {
  initCodeEditor();
  console.log("hiiii");
});
const initCodeEditor = () => {
  initialisedCodeEditor.value = CodeMirror.fromTextArea(
    document.getElementById("editor"),
    {
      lineNumbers: true,
      theme: "dracula",
      mode: "javascript",
    }
  )
  initialisedCodeEditor.value.setSize("100%", "60vh");
};
const runCode = (code) => {
  let result = "";
  const logOutput = [];

  // Override console.log to capture logs
  const originalConsoleLog = console.log;
  console.log("whole.log", originalConsoleLog);
  console.log = (...args) => {
    logOutput.push(args.join(" "));
    originalConsoleLog.apply(console, args);
  };

  try {
    const func = new Function(code);
    result = func();
  } catch (error) {
    result = "Compile Error: " + error.message;
  } finally {
    // Restore console.log
    console.log = originalConsoleLog;
  }
  logOutput.push(result !== undefined ? result : "");
  return logOutput;
  //   return logOutput.join("\n") + (result !== undefined ? "\n" + result : "");
};
const compileJsCode = async () => {
  try {
    console.log(initialisedCodeEditor.value);
    const getdata = initialisedCodeEditor.value.getValue();
    compilerResult.value = runCode(getdata);
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
