/**
 * Shared Package - Public API
 * Core utilities and services for DemoHotel application
 */

// ========================================
// Database Exports
// ========================================
export * from "./db/schema";
export * from "./db/connectionManager";
export * from "./db/transformers";

// ========================================
// Utility Exports
// ========================================
export * from "./utils";
export * from "./utils/logger";

// ========================================
// Performance Exports
// ========================================
export * from "./performance/optimization";

// ========================================
// Error Handling Exports
// ========================================
export * from "./errors/AppError";

// ========================================
// Validation Exports
// ========================================
export * from "./validation/schemas";
