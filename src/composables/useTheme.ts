import { computed, ref, watchEffect } from "vue";
import { useLocalStorage } from "./useLocalStorage";

export type ThemePreference = "light" | "dark" | "system";

const preference = useLocalStorage<ThemePreference>("theme", "system");
const media = window.matchMedia("(prefers-color-scheme: dark)");
const systemDark = ref(media.matches);

const isDark = computed(() =>
  preference.value === "system" ? systemDark.value : preference.value === "dark",
);

function apply() {
  document.documentElement.classList.toggle("dark", isDark.value);
}

media.addEventListener("change", (event) => {
  systemDark.value = event.matches;
});
watchEffect(apply);

export function useTheme() {
  const cycle = () => {
    const order: ThemePreference[] = ["light", "dark", "system"];
    preference.value = order[(order.indexOf(preference.value) + 1) % order.length]!;
  };
  return { preference, isDark, cycle };
}
