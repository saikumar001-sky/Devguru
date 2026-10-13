export type LogLevel = "log" | "info" | "warn" | "error" | "debug" | "result";

export interface LogEntry {
  level: LogLevel;
  text: string;
}

export type RunnerMessage =
  | { type: "log"; level: LogLevel; text: string }
  | { type: "done"; durationMs: number };

export interface RunHandle {
  done: Promise<{ durationMs: number; timedOut: boolean }>;
  stop: () => void;
}

/**
 * Runs code in a fresh, isolated Web Worker so it can't freeze or tamper with the page.
 * Top-level `await` is supported. The worker is killed after `timeoutMs`.
 */
export function runJavaScript(code: string, onLog: (entry: LogEntry) => void, timeoutMs = 5000): RunHandle {
  const worker = new Worker(new URL("./jsRunner.worker.ts", import.meta.url), { type: "module" });
  const started = performance.now();
  let settle!: (value: { durationMs: number; timedOut: boolean }) => void;
  const done = new Promise<{ durationMs: number; timedOut: boolean }>((resolve) => (settle = resolve));

  const finish = (timedOut: boolean, durationMs = performance.now() - started) => {
    window.clearTimeout(timer);
    worker.terminate();
    settle({ durationMs, timedOut });
  };

  const timer = window.setTimeout(() => {
    onLog({ level: "error", text: `Execution stopped after ${timeoutMs / 1000}s (possible infinite loop)` });
    finish(true);
  }, timeoutMs);

  worker.onmessage = (event: MessageEvent<RunnerMessage>) => {
    const message = event.data;
    if (message.type === "log") onLog({ level: message.level, text: message.text });
    else finish(false, message.durationMs);
  };
  worker.onerror = (event) => {
    event.preventDefault();
    onLog({ level: "error", text: event.message || "Worker failed to start" });
    finish(false);
  };

  worker.postMessage(code);
  return { done, stop: () => finish(true) };
}
