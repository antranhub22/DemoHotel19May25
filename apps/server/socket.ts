import { dashboardWebSocket } from "@server/services/DashboardWebSocket";
import { logger } from "@shared/utils/logger";
import { Server as HTTPServer } from "http";
import { Socket, Server as SocketIOServer } from "socket.io";

export function setupSocket(server: HTTPServer) {
  // ✅ SECURITY FIX: Proper CORS configuration
  const allowedOrigins = [
    "https://minhonmuine.talk2go.online",
    "https://localhost:3000",
    "https://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5173",
    // ✅ FIX: Add production domains
    "https://demohotel19may25.onrender.com",
    "https://minhnhotelben.onrender.com",
    // ✅ ENHANCEMENT: Add more production domains
    "https://*.onrender.com",
    "https://*.talk2go.online",
  ];

  const io = new SocketIOServer(server, {
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g., mobile apps, Postman)
        if (!origin) return callback(null, true);

        // ✅ FIX: Allow all origins in development
        if (process.env.NODE_ENV === "development") {
          return callback(null, true);
        }

        // ✅ FIX: Allow production domains with wildcard support
        const isAllowed =
          allowedOrigins.includes(origin) ||
          origin.includes("talk2go.online") ||
          origin.includes("onrender.com") ||
          origin.includes("localhost") ||
          origin.includes("127.0.0.1");

        if (isAllowed) {
          return callback(null, true);
        }

        logger.warn(`CORS blocked origin: ${origin}`, "WebSocket");
        return callback(new Error("Not allowed by CORS"), false);
      },
      methods: ["GET", "POST"],
      credentials: true,
      // ✅ FIX: Add additional CORS headers
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    },
    // ✅ MEMORY FIX: Optimize buffer sizes and timeouts for memory efficiency
    maxHttpBufferSize: 256 * 1024, // ✅ Reduced from 1MB to 256KB (saves significant memory per connection)
    pingTimeout: 30000, // ✅ Reduced from 60s to 30s
    pingInterval: 15000, // ✅ Reduced from 25s to 15s
    // ✅ FIX: Add additional options to prevent conflicts
    allowEIO3: true,
    transports: ["websocket", "polling"],
    // ✅ FIX: Add path to avoid conflicts
    path: "/socket.io/",
    // ✅ FIX: Add namespace to avoid conflicts
    namespace: "/",
  });

  // ✅ FIX: Share Socket.IO instance with Dashboard WebSocket service
  // Instead of creating separate WebSocket server, pass the io instance
  try {
    // Pass the io instance to dashboard service instead of creating new server
    dashboardWebSocket.setSocketIO(io);
    logger.info(
      "✅ [Socket] Dashboard WebSocket service connected to main Socket.IO",
      "WebSocket",
    );
  } catch (error) {
    logger.error(
      "❌ [Socket] Dashboard WebSocket connection failed",
      "WebSocket",
      error,
    );
    // Continue with order WebSocket setup - dashboard will use polling fallback
    logger.info(
      "🔄 [Socket] Dashboard will use polling fallback mode",
      "WebSocket",
    );
  }

  // ✅ RATE LIMITING: Track connections per IP
  const connectionCounts = new Map<string, number>();
  const MAX_CONNECTIONS_PER_IP = 10;

  // ✅ MEMORY FIX: More aggressive periodic cleanup of connection tracking
  setInterval(
    () => {
      // Clean up connection counts for IPs with 0 connections
      for (const [ip, count] of connectionCounts.entries()) {
        if (count <= 0) {
          connectionCounts.delete(ip);
        }
      }

      // ✅ MEMORY FIX: Force cleanup if too many tracked IPs (prevents unbounded growth)
      if (connectionCounts.size > 1000) {
        logger.warn(
          `WebSocket connection tracking too large (${connectionCounts.size} IPs), forcing cleanup`,
          "WebSocket",
        );
        connectionCounts.clear();
      }

      // ✅ MEMORY FIX: Force garbage collection if available and connections are high
      if (global.gc && connectionCounts.size > 500) {
        global.gc();
      }

      // Log memory status
      logger.debug(
        `WebSocket connection tracking: ${connectionCounts.size} IPs`,
        "WebSocket",
      );
    },
    2 * 60 * 1000,
  ); // ✅ MEMORY FIX: Every 2 minutes (more frequent cleanup)

  io.on("connection", (socket: Socket) => {
    const clientIP = socket.handshake.address;

    // ✅ RATE LIMITING: Check connection limit
    const currentConnections = connectionCounts.get(clientIP) || 0;
    if (currentConnections >= MAX_CONNECTIONS_PER_IP) {
      logger.warn(`Connection limit exceeded for IP: ${clientIP}`, "WebSocket");
      socket.disconnect(true);
      return;
    }

    // Update connection count
    connectionCounts.set(clientIP, currentConnections + 1);

    // ✅ LOGGING FIX: Proper template literals
    logger.debug(
      `Socket connected: ${socket.id} from ${clientIP}`,
      "WebSocket",
    );

    // ✅ ERROR HANDLING: Wrap all event handlers in try-catch
    socket.on("join_room", (orderId: string) => {
      try {
        if (!orderId || typeof orderId !== "string") {
          logger.warn(
            `Invalid orderId from ${socket.id}: ${orderId}`,
            "WebSocket",
          );
          return;
        }

        socket.join(orderId);
        logger.debug(`Socket ${socket.id} joined room ${orderId}`, "WebSocket");
      } catch (error) {
        logger.error(
          `Error in join_room for ${socket.id}:`,
          "WebSocket",
          error,
        );
      }
    });

    // ✅ ENHANCED: Add rate limiting for order updates
    let lastUpdateTime = 0;
    const UPDATE_RATE_LIMIT = 1000; // 1 second between updates

    socket.on(
      "update_order_status",
      (data: { orderId: string; status: string }) => {
        try {
          const now = Date.now();
          if (now - lastUpdateTime < UPDATE_RATE_LIMIT) {
            logger.warn(
              `Rate limit exceeded for order updates from ${socket.id}`,
              "WebSocket",
            );
            return;
          }
          lastUpdateTime = now;

          const { orderId, status } = data;

          // ✅ VALIDATION: Check required fields
          if (
            !orderId ||
            !status ||
            typeof orderId !== "string" ||
            typeof status !== "string"
          ) {
            logger.warn(
              `Invalid order update data from ${socket.id}:`,
              "WebSocket",
              data,
            );
            return;
          }

          logger.debug(
            `Received status update for order ${orderId}: ${status} from ${socket.id}`,
            "WebSocket",
          );

          // Broadcast to clients in that room
          io.to(orderId).emit("order_status_update", { orderId, status });
        } catch (error) {
          logger.error(
            `Error in update_order_status for ${socket.id}:`,
            "WebSocket",
            error,
          );
        }
      },
    );

    // ✅ ENHANCED: Better disconnect handling with cleanup
    socket.on("disconnect", (reason) => {
      try {
        // ✅ CLEANUP: Reduce connection count
        const currentCount = connectionCounts.get(clientIP) || 0;
        if (currentCount <= 1) {
          connectionCounts.delete(clientIP);
        } else {
          connectionCounts.set(clientIP, currentCount - 1);
        }

        logger.debug(
          `Socket disconnected: ${socket.id} from ${clientIP}, reason: ${reason}`,
          "WebSocket",
        );
      } catch (error) {
        logger.error(
          `Error in disconnect handler for ${socket.id}:`,
          "WebSocket",
          error,
        );
      }
    });

    // ✅ NEW: Handle connection errors
    socket.on("error", (error) => {
      logger.error(`Socket error for ${socket.id}:`, "WebSocket", error);
    });

    // ✅ NEW: Add init message handler for better debugging
    socket.on("init", (data) => {
      try {
        logger.debug(`Init message from ${socket.id}:`, "WebSocket", data);
      } catch (error) {
        logger.error(
          `Error in init handler for ${socket.id}:`,
          "WebSocket",
          error,
        );
      }
    });
  });

  // ✅ MONITORING: Log server metrics periodically
  setInterval(() => {
    const totalConnections = Array.from(connectionCounts.values()).reduce(
      (sum, count) => sum + count,
      0,
    );
    logger.debug(
      `WebSocket connections: ${totalConnections}, unique IPs: ${connectionCounts.size}`,
      "WebSocket",
    );
  }, 30000); // Log every 30 seconds

  return io;
}
