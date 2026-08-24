// LunaScript-style import registry.
// Each module gets a handle to the live engine and can:
//   - spawn parts
//   - subscribe to gameplay events (coin, checkpoint, win, death)
//   - draw UI overlays
//   - expose log lines for the "Imports" panel
//
// This mirrors the way the LunaScript runtime treats `import Lua`, `import 1C`,
// `import Python`, etc. — modules drop into the running engine without rebuilding.

import type { RobloxEngine } from "../RobloxEngine";

export type ImportLanguage = "Lua" | "1C" | "Python" | "JS";

export interface ImportLogLine {
  t: number;       // elapsed seconds
  msg: string;
  level?: "info" | "warn" | "ok";
}

export interface ImportInstance {
  id: string;
  language: ImportLanguage;
  name: string;
  description: string;
  version: string;
  color: string;       // accent
  logs: ImportLogLine[];
  detach: () => void;
  data: Record<string, unknown>;   // module-local state
}

export interface ImportFactory {
  language: ImportLanguage;
  name: string;
  description: string;
  version: string;
  color: string;
  install: (engine: RobloxEngine) => ImportInstance;
}

// Global registry — every module registered with `registerImport` is shown
// in the Imports panel and can be loaded at runtime.
const registry: ImportFactory[] = [];
export function registerImport(f: ImportFactory) {
  registry.push(f);
}
export function listImports(): ImportFactory[] {
  return registry.slice();
}

// Live imports (loaded ones).
const loaded: ImportInstance[] = [];
export function getLoaded(): ImportInstance[] {
  return loaded.slice();
}
export function loadImport(language: ImportLanguage, engine: RobloxEngine): ImportInstance | null {
  const f = registry.find((r) => r.language === language);
  if (!f) return null;
  if (loaded.some((l) => l.language === language)) return loaded.find((l) => l.language === language)!;
  const inst = f.install(engine);
  loaded.push(inst);
  notify();
  return inst;
}
export function unloadImport(language: ImportLanguage) {
  const idx = loaded.findIndex((l) => l.language === language);
  if (idx < 0) return;
  loaded[idx].detach();
  loaded.splice(idx, 1);
  notify();
}

// Tiny pub/sub so the UI panel can refresh.
const subs = new Set<() => void>();
export function subscribe(fn: () => void) {
  subs.add(fn);
  return () => subs.delete(fn);
}
function notify() {
  subs.forEach((fn) => fn());
}

export function pushLog(inst: ImportInstance, msg: string, level: ImportLogLine["level"] = "info") {
  inst.logs.push({ t: performance.now() / 1000, msg, level });
  // keep only the last 30 log lines
  if (inst.logs.length > 30) inst.logs.splice(0, inst.logs.length - 30);
  notify();
}
