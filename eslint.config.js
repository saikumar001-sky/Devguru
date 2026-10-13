import pluginVue from "eslint-plugin-vue";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import skipFormatting from "eslint-config-prettier";

export default defineConfigWithVueTs(
  { ignores: ["dist/**", "node_modules/**"] },
  pluginVue.configs["flat/recommended"],
  vueTsConfigs.recommended,
  {
    rules: {
      // Optional props are typed as `T | undefined`; a default adds nothing.
      "vue/require-default-prop": "off",
    },
  },
  skipFormatting,
);
