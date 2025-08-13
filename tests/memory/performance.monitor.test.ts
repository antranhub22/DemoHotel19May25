import { analyzeForLeaks } from "@server/shared/MemoryTools";

describe("performance monitoring", () => {
  it("detects increasing heap trend", async () => {
    const now = Date.now();
    const samples = [
      { ts: now, heapUsed: 100 },
      { ts: now + 60_000, heapUsed: 110 },
      { ts: now + 120_000, heapUsed: 130 },
      { ts: now + 180_000, heapUsed: 160 },
      { ts: now + 240_000, heapUsed: 190 },
    ];
    const result = await analyzeForLeaks(samples);
    expect(result.trend).toBe("increasing");
  });
});
