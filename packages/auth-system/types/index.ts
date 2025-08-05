// ============================================
// AUTH TYPES - BARREL EXPORT
// ============================================

// Core auth types and interfaces
export * from "./auth";

// Permission and RBAC types
export * from "./permissions";

// Re-export config types to avoid circular imports
export type { AuthErrorCode, UserRole } from "@auth/config";
