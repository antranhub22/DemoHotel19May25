/**
 * Shared Package - Public API
 * Core utilities and services for DemoHotel application
 */

// ========================================
// Database Exports
// ========================================
export * from "./db";
export * from "./db/transformers";

// ========================================
// Utility Exports
// ========================================
export { getCurrentTimestamp } from "./db";
export { dateToString, deleteAllRequests } from "./utils";
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
