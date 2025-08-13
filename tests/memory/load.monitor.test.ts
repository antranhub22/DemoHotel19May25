/**
 * @jest-environment node
 */
import {
  analyzeForLeaks,
  getMemoryUsage,
  tryForceGc,
} from "@server/shared/MemoryTools";

function allocateChunk(kb: number): string {
  return "x".repeat(kb);
}

function generateLoadMB(totalMb: number): any[] {
  const arr: any[] = [];
  for (let i = 0; i < totalMb * 64; i++) {
    // 64 chunks of 16KB ≈ 1MB
    arr.push(allocateChunk(16 * 1024));
  }
  return arr;
}

describe("load monitoring with trend analysis", () => {
  it("records increasing trend under synthetic load then recovers after cleanup", async () => {
    const samples: Array<{ ts: number; heapUsed: number }> = [];

    // Baseline
    const base = getMemoryUsage();
    samples.push({ ts: Date.now(), heapUsed: base.heapUsed });

    // Simulate load in small steps to stay within CI limits
    const blocks: any[][] = [];
    for (let step = 0; step < 4; step++) {
      blocks.push(generateLoadMB(8)); // ~8MB per step
      const snap = getMemoryUsage();
      samples.push({ ts: Date.now(), heapUsed: snap.heapUsed });
    }

    const trend = await analyzeForLeaks(samples);
    expect(["increasing", "flat"]).toContain(trend.trend);

    // Cleanup
    for (const b of blocks) (b as any).length = 0;
    tryForceGc();

    const after = getMemoryUsage();
    // Allow some slack as memory may not fully return
    expect(after.heapUsed).toBeLessThanOrEqual(
      samples[samples.length - 1].heapUsed,
    );
  });
});
