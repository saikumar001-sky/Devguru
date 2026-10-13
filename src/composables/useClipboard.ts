import { ref } from "vue";
import { toast } from "./useToast";

/** Copies text to the clipboard, with a toast and a short-lived `copied` flag for button feedback. */
export function useClipboard(resetAfter = 1500) {
  const copied = ref(false);
  let timer: number | undefined;

  async function copy(text: string | null | undefined, label = "Copied to clipboard") {
    if (!text) {
      toast.info("Nothing to copy yet");
      return false;
    }
    try {
      await navigator.clipboard.writeText(text);
      copied.value = true;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => (copied.value = false), resetAfter);
      toast.success(label);
      return true;
    } catch {
      toast.error("Clipboard access was denied by the browser");
      return false;
    }
  }

  return { copy, copied };
}
