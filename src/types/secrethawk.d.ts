// Minimal typings for the browser-safe SecretHawk packages (they ship plain ESM without .d.ts).

declare module "@secrethawk/core" {
  export type Severity = "critical" | "high" | "medium" | "low";

  export interface SecretRule {
    id: string;
    name: string;
    pattern: RegExp;
    severity?: Severity;
    confidence?: number;
    category?: string;
    description?: string;
    minEntropy?: number;
    entropy?: boolean;
  }

  export type AllowlistEntry = string | RegExp | { rule?: string; file?: string; pattern?: string | RegExp };

  export interface Finding {
    id: string;
    ruleId: string;
    ruleName: string;
    description: string;
    severity: Severity;
    confidence: number;
    file: string;
    line: number;
    column: number;
    match: string;
    rawMatch: string;
    entropy: number;
    snippet: { lineNumber: number; text: string; isTarget: boolean }[];
  }

  export function scanText(
    content: string,
    options?: {
      rules?: SecretRule[];
      file?: string;
      allowlist?: AllowlistEntry[];
      entropyThreshold?: number | null;
      checkEntropy?: boolean;
    },
  ): Finding[];
  export function calculateShannonEntropy(value: string): number;
  export function maskSecret(value: string, visibleCount?: number): string;
}

declare module "@secrethawk/rules" {
  import type { SecretRule, Severity } from "@secrethawk/core";
  export const allRules: SecretRule[];
  export const defaultRules: SecretRule[];
  export function getRuleById(id: string): SecretRule | undefined;
  export function filterRules(options?: {
    enabled?: string[];
    disabled?: string[];
    minSeverity?: Severity;
  }): SecretRule[];
}
