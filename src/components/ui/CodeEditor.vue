<script setup lang="ts">
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from "vue";
import { basicSetup } from "codemirror";
import { Compartment, EditorState, type Extension } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import { linter, lintGutter, type Diagnostic } from "@codemirror/lint";
import { useTheme } from "@/composables/useTheme";

export type EditorLanguage = "javascript" | "html" | "json" | "text";

export interface EditorProblem {
  /** Character offset into the document. */
  offset: number;
  message: string;
}

const { language = "text", readonly = false, lint } = defineProps<{
  language?: EditorLanguage;
  readonly?: boolean;
  /** Returns syntax problems to underline in the editor. */
  lint?: (text: string) => EditorProblem[];
}>();
const model = defineModel<string>({ default: "" });
const emit = defineEmits<{ run: [] }>();

const host = useTemplateRef<HTMLDivElement>("host");
const { isDark } = useTheme();
const themeSlot = new Compartment();
let view: EditorView | undefined;

const languages: Record<EditorLanguage, () => Extension> = {
  javascript: () => javascript(),
  html: () => html(),
  json: () => json(),
  text: () => [],
};

const baseTheme = EditorView.theme({
  "&": { height: "100%", fontSize: "13px" },
  "&.cm-editor": { backgroundColor: "transparent" },
  ".cm-scroller": { fontFamily: "var(--font-mono)", lineHeight: "1.6" },
  "&.cm-editor .cm-gutters": { backgroundColor: "transparent", border: "none", color: "var(--muted)" },
  ".cm-activeLineGutter, .cm-activeLine": { backgroundColor: "color-mix(in oklab, var(--fg) 5%, transparent)" },
  "&.cm-focused": { outline: "none" },
});

const themeFor = (dark: boolean): Extension => (dark ? [oneDark, baseTheme] : baseTheme);

function lintDiagnostics(editor: EditorView): Diagnostic[] {
  const length = editor.state.doc.length;
  return (lint?.(editor.state.doc.toString()) ?? []).map(({ offset, message }) => {
    const from = Math.min(offset, length);
    return { from, to: Math.min(from + 1, length), severity: "error", message };
  });
}

onMounted(() => {
  view = new EditorView({
    parent: host.value!,
    state: EditorState.create({
      doc: model.value,
      extensions: [
        basicSetup,
        keymap.of([
          indentWithTab,
          { key: "Mod-Enter", run: () => (emit("run"), true) },
        ]),
        languages[language](),
        lint ? [lintGutter(), linter(lintDiagnostics, { delay: 300 })] : [],
        themeSlot.of(themeFor(isDark.value)),
        EditorState.readOnly.of(readonly),
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) model.value = update.state.doc.toString();
        }),
      ],
    }),
  });
});

watch(isDark, (dark) => view?.dispatch({ effects: themeSlot.reconfigure(themeFor(dark)) }));

watch(model, (value) => {
  if (view && value !== view.state.doc.toString()) {
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } });
  }
});

onBeforeUnmount(() => view?.destroy());
</script>

<template>
  <div ref="host" class="h-full min-h-0 overflow-hidden" />
</template>
