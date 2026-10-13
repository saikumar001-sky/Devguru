import { ref, watch, type Ref } from "vue";

const PREFIX = "devease:";

/** A ref that is persisted to localStorage. Falls back to the default when storage is unavailable. */
export function useLocalStorage<T>(key: string, defaultValue: T): Ref<T> {
  const storageKey = PREFIX + key;
  const state = ref(read()) as Ref<T>;

  function read(): T {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw === null ? defaultValue : (JSON.parse(raw) as T);
    } catch {
      return defaultValue;
    }
  }

  watch(
    state,
    (value) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(value));
      } catch {
        // Storage may be full or blocked (private mode) — persistence is best-effort.
      }
    },
    { deep: true },
  );

  return state;
}
