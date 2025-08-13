/**
 * @jest-environment node
 */
import { getMemoryUsage, tryForceGc } from "@server/shared/MemoryTools";

async function heavyTask(iterations: number): Promise<void> {
  for (let i = 0; i < iterations; i++) {
    const tmp = new Array(10000).fill({ i, data: "x".repeat(256) });
    // Work the event loop a bit
    await new Promise((r) => setTimeout(r, 5));
    (tmp as any).length = 0;
  }
}

describe("stress stability", () => {
  it("remains under soft memory ceiling during heavy tasks", async () => {
    const softCeil = (mb: number) => mb + 128; // generous slack for CI

    const before = getMemoryUsage();
    await heavyTask(20);
    tryForceGc();
    const after = getMemoryUsage();

    expect(after.heapUsed).toBeLessThanOrEqual(softCeil(before.heapUsed));
  });
});
