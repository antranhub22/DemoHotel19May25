// Core type definitions for the hotel management system

export type Language = 'en' | 'vi' | 'fr' | 'zh' | 'ru' | 'ko';

export type ServiceCategory =
  | 'room_service'
  | 'housekeeping'
  | 'maintenance'
  | 'concierge'
  | 'spa_wellness'
  | 'dining'
  | 'transportation'
  | 'business_center'
  | 'laundry'
  | 'wake_up_call'
  | 'other';

export type UserRole =
  | 'super-admin'
  | 'hotel-manager'
  | 'front-desk'
  | 'it-manager'
  | 'guest';

export type Permission =
  | 'read'
  | 'write'
  | 'delete'
  | 'admin'
  | 'manage_users'
  | 'manage_settings'
  | 'view_analytics'
  | 'manage_calls'
  | 'manage_requests';

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'USER_NOT_FOUND'
  | 'USER_INACTIVE'
  | 'ACCOUNT_LOCKED';

// Database types - re-export from schema
export type {
  Staff,
  InsertStaff,
  Call,
  InsertCall,
  Transcript,
  InsertTranscript,
  RequestRecord,
  InsertRequestRecord,
  Message,
  InsertMessage,
  CallSummary,
  InsertCallSummary,
} from '@shared/db/schema';

// UI types
export interface BasicHotelData {
  name: string;
  location: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  rating?: number;
  priceRange?: string;
  amenities?: string[];
  services?: string[];
}

export interface AdvancedHotelData extends BasicHotelData {
  rooms?: RoomType[];
  restaurants?: any[];
  attractions?: LocalAttraction[];
  policies?: any;
  images?: string[];
}

export interface RoomType {
  name: string;
  description: string;
  price: number;
  amenities: string[];
  capacity: number;
}

export interface LocalAttraction {
  name: string;
  description: string;
  distance: string;
  type: string;
  rating?: number;
}

export interface HotelService {
  name: string;
  description: string;
  category: ServiceCategory;
  available: boolean;
  price?: number;
}

// Auth types
export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
  tenantId: string;
  permissions: Permission[];
  name?: string;
  email?: string;
}

export interface JwtPayload {
  userId: string;
  username: string;
  role: UserRole;
  tenantId: string;
  permissions: Permission[];
  iat?: number;
  exp?: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
  tenantId?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
}

// Assistant types
export interface AssistantConfig {
  language: Language;
  vapiPublicKey: string;
  vapiAssistantId: string;
  openaiApiKey: string;
}

export interface VapiCall {
  id: string;
  status: 'active' | 'ended' | 'failed';
  duration?: number;
  transcript?: string;
}

export interface CallState {
  isActive: boolean;
  callId?: string;
  duration: number;
  transcript: string[];
}

// API types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Configuration types
export interface EnvironmentConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL?: string;
  JWT_SECRET: string;
  OPENAI_API_KEY: string;
  VAPI_PUBLIC_KEY: string;
  VAPI_ASSISTANT_ID: string;
}

export interface PermissionMatrix {
  [role: string]: {
    [permission: string]: boolean;
  };
}

export interface MenuItemConfig {
  label: string;
  path: string;
  icon?: string;
  children?: MenuItemConfig[];
  permissions?: Permission[];
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;
export type ID = string;
export type Timestamp = number;
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

// Environment types
export type NodeEnv = 'development' | 'production' | 'test';

// HTTP types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type HttpStatus = 200 | 201 | 400 | 401 | 403 | 404 | 500;

// Database types
export type SortOrder = 'asc' | 'desc';
export type FilterOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'like'
  | 'in';

// UI state types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type Theme = 'light' | 'dark' | 'auto';
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success'
  | 'warning';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Animation types
export type AnimationDuration = 'fast' | 'normal' | 'slow';
export type AnimationType = 'fade' | 'slide' | 'bounce' | 'zoom';

// Error types
export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}
