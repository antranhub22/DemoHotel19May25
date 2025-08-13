import { logger } from "@shared/utils/logger";
import { EventEmitter } from "events";

export type TrackedTimer = {
  id: NodeJS.Timeout;
  name: string;
  type: "interval" | "timeout";
  createdAt: number;
};

export type TrackedListener = {
  emitter: EventEmitter;
  event: string;
  handler: (...args: any[]) => void;
  name: string;
  createdAt: number;
};

export type TrackedConnection = {
  name: string;
  close: () => Promise<void> | void;
  createdAt: number;
};

export interface CleanupReport {
  timersCleared: number;
  listenersRemoved: number;
  connectionsClosed: number;
  details: {
    timers: string[];
    listeners: string[];
    connections: string[];
  };
}

/**
 * ResourceTracker is a singleton utility responsible for tracking runtime resources
 * (timers, event listeners, connections) and releasing them during shutdown
 * or when explicitly requested. It helps avoid memory leaks during hot-reloads
 * and long-running processes.
 */
export class ResourceTracker {
  private static instance: ResourceTracker | undefined;

  private timers: Map<string, TrackedTimer> = new Map();
  private listeners: Map<string, TrackedListener> = new Map();
  private connections: Map<string, TrackedConnection> = new Map();
  private isShutdownHandlersRegistered = false;

  static getInstance(): ResourceTracker {
    if (!this.instance) {
      this.instance = new ResourceTracker();
    }
    return this.instance;
  }

  private constructor() {
    // Intentionally empty – use getInstance()
  }

  // Timers
  registerInterval(id: NodeJS.Timeout, name: string): void {
    this.timers.set(name, {
      id,
      name,
      type: "interval",
      createdAt: Date.now(),
    });
  }

  registerTimeout(id: NodeJS.Timeout, name: string): void {
    this.timers.set(name, {
      id,
      name,
      type: "timeout",
      createdAt: Date.now(),
    });
  }

  clearTimer(name: string): void {
    const tracked = this.timers.get(name);
    if (!tracked) return;
    if (tracked.type === "interval") clearInterval(tracked.id);
    else clearTimeout(tracked.id);
    this.timers.delete(name);
  }

  // Event listeners
  registerListener(
    emitter: EventEmitter,
    event: string,
    handler: (...args: any[]) => void,
    name: string,
  ): void {
    emitter.on(event, handler);
    this.listeners.set(name, {
      emitter,
      event,
      handler,
      name,
      createdAt: Date.now(),
    });
  }

  removeListener(name: string): void {
    const tracked = this.listeners.get(name);
    if (!tracked) return;
    try {
      tracked.emitter.removeListener(tracked.event, tracked.handler);
    } finally {
      this.listeners.delete(name);
    }
  }

  // Connections (DB, sockets, etc.)
  registerConnection(name: string, close: () => Promise<void> | void): void {
    this.connections.set(name, { name, close, createdAt: Date.now() });
  }

  removeConnection(name: string): void {
    this.connections.delete(name);
  }

  getDiagnostics() {
    return {
      timers: Array.from(this.timers.values()).map((t) => ({
        name: t.name,
        type: t.type,
        ageMs: Date.now() - t.createdAt,
      })),
      listeners: Array.from(this.listeners.values()).map((l) => ({
        name: l.name,
        event: l.event,
        ageMs: Date.now() - l.createdAt,
      })),
      connections: Array.from(this.connections.values()).map((c) => ({
        name: c.name,
        ageMs: Date.now() - c.createdAt,
      })),
    };
  }

  async cleanupAll(): Promise<CleanupReport> {
    let timersCleared = 0;
    let listenersRemoved = 0;
    let connectionsClosed = 0;
    const timerNames: string[] = [];
    const listenerNames: string[] = [];
    const connectionNames: string[] = [];

    // Timers
    for (const [name, tracked] of this.timers) {
      try {
        if (tracked.type === "interval") clearInterval(tracked.id);
        else clearTimeout(tracked.id);
        timersCleared++;
        timerNames.push(name);
      } catch (error) {
        logger.warn("Failed clearing timer", "ResourceTracker", {
          name,
          error,
        });
      }
    }
    this.timers.clear();

    // Listeners
    for (const [name, tracked] of this.listeners) {
      try {
        tracked.emitter.removeListener(tracked.event, tracked.handler);
        listenersRemoved++;
        listenerNames.push(name);
      } catch (error) {
        logger.warn("Failed removing listener", "ResourceTracker", {
          name,
          error,
        });
      }
    }
    this.listeners.clear();

    // Connections
    for (const [name, tracked] of this.connections) {
      try {
        await Promise.resolve(tracked.close());
        connectionsClosed++;
        connectionNames.push(name);
      } catch (error) {
        logger.warn("Failed closing connection", "ResourceTracker", {
          name,
          error,
        });
      }
    }
    this.connections.clear();

    const report: CleanupReport = {
      timersCleared,
      listenersRemoved,
      connectionsClosed,
      details: {
        timers: timerNames,
        listeners: listenerNames,
        connections: connectionNames,
      },
    };

    logger.info("🧹 Resources cleaned", "ResourceTracker", report);
    return report;
  }

  registerProcessShutdownHandlers(): void {
    if (this.isShutdownHandlersRegistered) return;
    const handler = async (signal: NodeJS.Signals) => {
      logger.warn("🚦 Shutdown received", "ResourceTracker", { signal });
      await this.cleanupAll();
      process.exit(0);
    };
    ("SIGINT,SIGTERM,SIGHUP" as const).split(",").forEach((sig) => {
      if (process.listenerCount(sig as NodeJS.Signals) < 10) {
        process.on(sig as NodeJS.Signals, handler);
      }
    });
    this.isShutdownHandlersRegistered = true;
  }
}

export const resourceTracker = ResourceTracker.getInstance();
