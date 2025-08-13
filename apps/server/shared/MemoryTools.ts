import { logger } from "@shared/utils/logger";
import * as path from "path";
import * as v8 from "v8";

export function writeHeapSnapshot(reason = "manual"): string | null {
  try {
    const filename = `heap-${new Date().toISOString().replace(/[:.]/g, "-")}-${reason}.heapsnapshot`;
    const outPath = path.join(process.cwd(), filename);
    v8.writeHeapSnapshot(outPath);
    logger.info("🧠 Heap snapshot written", "MemoryTools", {
      file: outPath,
      reason,
    });
    return outPath;
  } catch (error) {
    logger.debug("Heap snapshot failed", "MemoryTools", error);
    return null;
  }
}

export function getMemoryUsage() {
  const m = process.memoryUsage();
  return {
    rss: Math.round(m.rss / 1024 / 1024),
    heapTotal: Math.round(m.heapTotal / 1024 / 1024),
    heapUsed: Math.round(m.heapUsed / 1024 / 1024),
    external: Math.round(m.external / 1024 / 1024),
    arrayBuffers: Math.round(m.arrayBuffers / 1024 / 1024),
    percentUsed: Number(((m.heapUsed / m.heapTotal) * 100).toFixed(2)),
  };
}

export function tryForceGc(): boolean {
  try {
    if (global.gc) {
      const gc = global.gc;
      gc();
      return true;
    }
  } catch {}
  return false;
}

export async function analyzeForLeaks(
  samples: Array<{ heapUsed: number; ts: number }>,
) {
  if (samples.length < 5) return { trend: "insufficient-data" } as const;
  const first = samples[0];
  const last = samples[samples.length - 1];
  const delta = last.heapUsed - first.heapUsed;
  const durationMin = (last.ts - first.ts) / 60000;
  const slope = delta / Math.max(durationMin, 1);
  return {
    trend: slope > 5 ? "increasing" : slope < -5 ? "decreasing" : "flat",
    deltaMB: delta,
    slopeMBPerMin: Number(slope.toFixed(2)),
    durationMin: Number(durationMin.toFixed(2)),
  } as const;
}
