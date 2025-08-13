import { getMemoryUsage, tryForceGc } from "@server/shared/MemoryTools";

function allocate(sizeMb: number): any[] {
  const arr: any[] = [];
  const count = sizeMb * 1024; // approx MB using 1KB chunks
  for (let i = 0; i < count; i++) arr.push("x".repeat(1024));
  return arr;
}

describe("memory leak simulation", () => {
  it("should free memory after cleanup", async () => {
    const before = getMemoryUsage();
    const hog = allocate(50);
    expect(hog.length).toBeGreaterThan(0);
    // release
    (hog as any).length = 0;
    tryForceGc();
    const after = getMemoryUsage();
    expect(after.heapUsed).toBeLessThanOrEqual(before.heapUsed + 25);
  });
});
