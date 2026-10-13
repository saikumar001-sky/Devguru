export interface RegexRequest {
  pattern: string;
  flags: string;
  text: string;
  replacement: string;
}

export interface RegexMatch {
  index: number;
  text: string;
  groups: { name: string; value: string | undefined }[];
}

export type RegexResult =
  | { ok: true; matches: RegexMatch[]; truncated: boolean; replaced: string }
  | { ok: false; error: string };

export const MAX_MATCHES = 1000;

/** Executes a regex against text. Pure — runs inside the worker. */
export function evaluateRegex({ pattern, flags, text, replacement }: RegexRequest): RegexResult {
  let regex: RegExp;
  try {
    regex = new RegExp(pattern, flags);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
  const global = new RegExp(pattern, flags.includes("g") ? flags : `${flags}g`);
  const matches: RegexMatch[] = [];
  for (const m of text.matchAll(global)) {
    if (matches.length === MAX_MATCHES) break;
    const named = Object.entries(m.groups ?? {});
    matches.push({
      index: m.index,
      text: m[0],
      groups: [
        ...m.slice(1).map((value, i) => ({ name: `$${i + 1}`, value })),
        ...named.map(([name, value]) => ({ name, value })),
      ],
    });
  }
  return {
    ok: true,
    matches,
    truncated: matches.length === MAX_MATCHES,
    replaced: text.replace(regex, replacement),
  };
}

/**
 * Keeps a worker around for regex evaluation. A pathological pattern (catastrophic
 * backtracking) only blocks the worker, which is killed and replaced after `timeoutMs`.
 */
export function createRegexRunner(timeoutMs = 1000) {
  let worker: Worker | null = null;
  let seq = 0;

  const spawn = () =>
    new Worker(new URL("./regex.worker.ts", import.meta.url), { type: "module" });

  function run(request: RegexRequest): Promise<RegexResult> {
    worker ??= spawn();
    const id = ++seq;
    const current = worker;
    return new Promise((resolve) => {
      const timer = window.setTimeout(() => {
        current.terminate();
        if (worker === current) worker = null;
        resolve({ ok: false, error: `Timed out after ${timeoutMs} ms — the pattern may backtrack catastrophically` });
      }, timeoutMs);
      const onMessage = (event: MessageEvent<{ id: number; result: RegexResult }>) => {
        if (event.data.id !== id) return;
        window.clearTimeout(timer);
        current.removeEventListener("message", onMessage);
        resolve(event.data.result);
      };
      current.addEventListener("message", onMessage);
      current.postMessage({ id, request });
    });
  }

  return { run, dispose: () => worker?.terminate() };
}
