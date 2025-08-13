import { resourceTracker } from "@server/shared/ResourceTracker";
import { EventEmitter } from "events";

describe("ResourceTracker", () => {
  it("cleans up timers and listeners", async () => {
    const emitter = new EventEmitter();
    const handler = () => void 0;

    const interval = setInterval(() => void 0, 1000);
    resourceTracker.registerInterval(interval, "test-interval");
    resourceTracker.registerListener(emitter, "tick", handler, "test-listener");

    const report = await resourceTracker.cleanupAll();
    expect(report.timersCleared).toBeGreaterThanOrEqual(1);
    expect(report.listenersRemoved).toBeGreaterThanOrEqual(1);
  });
});
