// ========================================
// COMMON TYPE DEFINITIONS
// ========================================

import type { ComponentType, ReactNode, RefObject } from "react";

// ========================================
// CORE TYPES
// ========================================

export type Language = "en" | "vi" | "fr" | "zh" | "ru";

export type UserRole =
  | "super_admin"
  | "hotel-manager"
  | "front-desk"
  | "it-manager"
  | "manager"
  | "staff"
  | "guest";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

// ========================================
// REACT TYPES
// ========================================

export type { ComponentType, ReactNode, RefObject };

// ========================================
// COMPONENT PROPS INTERFACES
// ========================================

export interface BaseComponentProps {
  children?: ReactNode;
  className?: string;
  id?: string;
}

export interface LoadingProps {
  loading?: boolean;
  error?: string;
}

export interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
}

// ========================================
// FORM TYPES
// ========================================

export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "number" | "select" | "textarea";
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

export interface FormData {
  [key: string]: any;
}

// ========================================
// API TYPES
// ========================================

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface ApiSuccess<T = any> {
  data: T;
  message?: string;
}

// ========================================
// UTILITY TYPES
// ========================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ========================================
// EVENT TYPES
// ========================================

export interface EventHandler<T = any> {
  (event: T): void;
}

export interface AsyncEventHandler<T = any> {
  (event: T): Promise<void>;
}

// ========================================
// STATE TYPES
// ========================================

export interface LoadingState {
  loading: boolean;
  error?: string;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// ========================================
// EXPORT ALL TYPES
// ========================================

export * from "./auth.types";
export * from "./hotel.types";
export * from "./voice.types";
