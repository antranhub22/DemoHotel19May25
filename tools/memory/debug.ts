import {
  analyzeForLeaks,
  getMemoryUsage,
  writeHeapSnapshot,
} from "@server/shared/MemoryTools";
import { logger } from "@shared/utils/logger";

export async function dumpHeap(
  reason = "manual-debug",
): Promise<string | null> {
  const file = writeHeapSnapshot(reason);
  logger.info("Heap snapshot triggered", "MemoryDebug", { file, reason });
  return file;
}

export function reportMemory(): ReturnType<typeof getMemoryUsage> {
  const mem = getMemoryUsage();
  logger.info("Memory report", "MemoryDebug", mem);
  return mem;
}

export async function analyzeSamples(
  samples: Array<{ ts: number; heapUsed: number }>,
) {
  const result = await analyzeForLeaks(samples);
  logger.info("Leak analysis", "MemoryDebug", result);
  return result;
}
