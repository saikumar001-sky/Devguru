import { evaluateRegex, type RegexRequest } from "./regex";

self.onmessage = (event: MessageEvent<{ id: number; request: RegexRequest }>) => {
  self.postMessage({ id: event.data.id, result: evaluateRegex(event.data.request) });
};
