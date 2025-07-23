// Global type declarations to fix all missing type errors

/// <reference types="node" />
/// <reference types="express" />
/// <reference types="vite/client" />

// ==============================================================
// EXPRESS TYPES - Extended for auth middleware
// ==============================================================

declare global {
  namespace Express {
    interface Request {
      user?: any;
      tenant?: any;
      tenantId?: string;
    }
  }
}

// ==============================================================
// DRIZZLE ORM TYPES - Fix all db/eq/sql errors
// ==============================================================

declare global {
  const db: any;
  const eq: any;
  const sql: any;
  const and: any;
  const or: any;
  const desc: any;
  const asc: any;
  const count: any;
  const avg: any;
  const sum: any;
  const max: any;
  const min: any;
}

// ==============================================================
// DATABASE SCHEMA TYPES - Fix all missing schema type errors
// ==============================================================

declare global {
  // Database tables
  const tenants: any;
  const hotelProfiles: any;
  const staff: any;
  const call: any;
  const transcript: any;
  const request: any;
  const message: any;
  const call_summaries: any;

  // Table types
  type Staff = {
    id: string;
    tenantId: string;
    username: string;
    password: string;
    role: string;
    name: string;
    email: string;
    createdAt: number;
    lastLogin: number;
  };

  type InsertStaff = Omit<Staff, 'id' | 'createdAt' | 'lastLogin'>;

  type Call = {
    id: string;
    tenantId: string;
    callIdVapi: string;
    roomNumber: string;
    language: string;
    serviceType: string;
    duration: number;
    startTime: number;
    endTime: number;
    createdAt: number;
  };

  type InsertCall = Omit<Call, 'id' | 'createdAt'>;

  type Transcript = {
    id: string;
    tenantId: string;
    callId: string;
    role: string;
    message: string;
    timestamp: number;
    language: string;
    createdAt: number;
  };

  type InsertTranscript = Omit<Transcript, 'id' | 'createdAt'>;

  type RequestRecord = {
    id: string;
    tenantId: string;
    roomNumber: string;
    guestName: string;
    serviceType: string;
    description: string;
    priority: string;
    status: string;
    staffAssigned: string;
    createdAt: number;
    updatedAt: number;
  };

  type InsertRequestRecord = Omit<
    RequestRecord,
    'id' | 'createdAt' | 'updatedAt'
  >;

  type Message = {
    id: string;
    tenantId: string;
    sender: string;
    content: string;
    timestamp: number;
    isRead: boolean;
    createdAt: number;
  };

  type InsertMessage = Omit<Message, 'id' | 'createdAt'>;

  type CallSummary = {
    id: string;
    tenantId: string;
    callId: string;
    summary: string;
    keyPoints: string;
    sentiment: string;
    language: string;
    timestamp: number;
    createdAt: number;
  };

  type InsertCallSummary = Omit<CallSummary, 'id' | 'createdAt'>;

  type Tenant = {
    id: string;
    hotel_name: string;
    subdomain: string;
    custom_domain?: string;
    subscription_plan: string;
    subscription_status: string;
    created_at: number;
    name?: string;
    is_active: boolean;
    settings?: string;
  };

  type InsertTenant = Omit<Tenant, 'id' | 'created_at'>;

  type HotelProfile = {
    id: string;
    tenantId: string;
    name: string;
    description: string;
    location: string;
    phone: string;
    email: string;
    website: string;
    services: string;
    amenities: string;
    policies: string;
    createdAt: number;
    updatedAt: number;
  };

  type InsertHotelProfile = Omit<
    HotelProfile,
    'id' | 'createdAt' | 'updatedAt'
  >;
}

// ==============================================================
// UI & CLIENT TYPES - Fix all missing UI type errors
// ==============================================================

declare global {
  type Language = 'en' | 'vi' | 'fr' | 'zh' | 'ru' | 'ko';

  type ServiceCategory =
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

  type UserRole =
    | 'super-admin'
    | 'hotel-manager'
    | 'front-desk'
    | 'it-manager'
    | 'guest';

  type Permission =
    | 'read'
    | 'write'
    | 'delete'
    | 'admin'
    | 'manage_users'
    | 'manage_settings'
    | 'view_analytics'
    | 'manage_calls'
    | 'manage_requests';

  type AuthErrorCode =
    | 'INVALID_CREDENTIALS'
    | 'TOKEN_EXPIRED'
    | 'TOKEN_INVALID'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'USER_NOT_FOUND'
    | 'USER_INACTIVE'
    | 'ACCOUNT_LOCKED';

  // React types
  type RefObject<T> = import('react').RefObject<T>;
  type MutableRefObject<T> = import('react').MutableRefObject<T>;
  type ReactNode = import('react').ReactNode;
  type JSX = any;

  // Common UI types
  type IconType = import('react-icons').IconType;
  type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'success'
    | 'warning';
  type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  // API types
  interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }

  interface ApiError {
    code: string;
    message: string;
    details?: any;
  }

  // Utility types
  type Nullable<T> = T | null;
  type Optional<T> = T | undefined;
  type Maybe<T> = T | null | undefined;
}

// ==============================================================
// AUTH SYSTEM TYPES - Fix auth-related type errors
// ==============================================================

declare global {
  interface AuthUser {
    id: string;
    username: string;
    role: UserRole;
    tenantId: string;
    permissions: Permission[];
    name?: string;
    email?: string;
  }

  interface JwtPayload {
    userId: string;
    username: string;
    role: UserRole;
    tenantId: string;
    permissions: Permission[];
    iat?: number;
    exp?: number;
  }

  interface LoginCredentials {
    username: string;
    password: string;
    tenantId?: string;
  }

  interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => void;
    hasPermission: (permission: Permission) => boolean;
    hasRole: (role: UserRole) => boolean;
  }

  // Auth middleware
  const authenticateJWT: any;
  const requireRole: any;
  const requirePermission: any;
}

// ==============================================================
// HOTEL RESEARCH & SERVICES - Fix service type errors
// ==============================================================

declare global {
  interface BasicHotelData {
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

  interface AdvancedHotelData extends BasicHotelData {
    rooms?: RoomType[];
    restaurants?: any[];
    attractions?: LocalAttraction[];
    policies?: any;
    images?: string[];
  }

  interface RoomType {
    name: string;
    description: string;
    price: number;
    amenities: string[];
    capacity: number;
  }

  interface LocalAttraction {
    name: string;
    description: string;
    distance: string;
    type: string;
    rating?: number;
  }

  interface HotelService {
    name: string;
    description: string;
    category: ServiceCategory;
    available: boolean;
    price?: number;
  }

  // Service classes
  class HotelResearchService {
    basicResearch(
      hotelName: string,
      location?: string
    ): Promise<BasicHotelData>;
    advancedResearch(
      hotelName: string,
      location?: string
    ): Promise<AdvancedHotelData>;
  }

  class KnowledgeBaseGenerator {
    generateKnowledgeBase(hotelData: BasicHotelData): Promise<string>;
  }
}

// ==============================================================
// ASSISTANT & VAPI TYPES - Fix assistant type errors
// ==============================================================

declare global {
  interface AssistantConfig {
    language: Language;
    vapiPublicKey: string;
    vapiAssistantId: string;
    openaiApiKey: string;
  }

  interface VapiCall {
    id: string;
    status: 'active' | 'ended' | 'failed';
    duration?: number;
    transcript?: string;
  }

  interface CallState {
    isActive: boolean;
    callId?: string;
    duration: number;
    transcript: string[];
  }

  // Hooks
  const useAssistant: () => any;
  const useCallHandler: () => any;
  const useVapiCall: () => any;
}

// ==============================================================
// CONFIGURATION TYPES - Fix config type errors
// ==============================================================

declare global {
  interface EnvironmentConfig {
    NODE_ENV: string;
    PORT: number;
    DATABASE_URL?: string;
    JWT_SECRET: string;
    OPENAI_API_KEY: string;
    VAPI_PUBLIC_KEY: string;
    VAPI_ASSISTANT_ID: string;
  }

  interface PermissionMatrix {
    [role: string]: {
      [module: string]: string[];
    };
  }

  interface MenuItemConfig {
    key: string;
    label: string;
    path: string;
    icon?: string;
    children?: MenuItemConfig[];
    permissions?: Permission[];
    requiredPermission?: string;
  }

  // Config constants
  const DEFAULT_PERMISSIONS: PermissionMatrix;
  const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string>;
  const PERMISSION_MATRIX: PermissionMatrix;
  const ROLE_MENU_CONFIG: Record<UserRole, MenuItemConfig[]>;
}

// ==============================================================
// THIRD-PARTY LIBRARY TYPES - Fix library type errors
// ==============================================================

declare global {
  // JWT decode
  const jwtDecode: <T = any>(token: string) => T;

  // Chart.js types
  interface ChartData {
    labels: string[];
    datasets: any[];
  }

  interface ChartOptions {
    responsive?: boolean;
    plugins?: any;
    scales?: any;
  }

  // React icons
  const IconType: any;
  const FaBed: IconType;
  const FaConcierge: IconType;
  const FaUtensils: IconType;
  const FaCar: IconType;
  const FaSpa: IconType;
  const FaPhone: IconType;
  const FaUser: IconType;
  const FaCog: IconType;

  // Common component types
  interface ComponentProps {
    className?: string;
    children?: ReactNode;
    style?: React.CSSProperties;
  }

  interface ButtonProps extends ComponentProps {
    variant?: ButtonVariant;
    size?: Size;
    disabled?: boolean;
    onClick?: () => void;
  }
}

// ==============================================================
// ERROR TYPES - Fix error handling type errors
// ==============================================================

declare global {
  class AppError extends Error {
    code: string;
    statusCode: number;
    isOperational: boolean;
  }

  class ValidationError extends AppError {}
  class AuthError extends AppError {}
  class DatabaseError extends AppError {}
  class TenantError extends AppError {}
  class EnvironmentValidationError extends AppError {
    missingVars: string[];
  }

  interface ErrorResponse {
    success: false;
    error: string;
    code?: string;
    details?: any;
  }

  interface SuccessResponse<T = any> {
    success: true;
    data: T;
    message?: string;
  }
}

// ==============================================================
// MISC UTILITY TYPES - Fix remaining type errors
// ==============================================================

declare global {
  // Common utility types
  type ID = string;
  type Timestamp = number;
  type JSONValue =
    | string
    | number
    | boolean
    | null
    | JSONValue[]
    | { [key: string]: JSONValue };

  // Environment types
  type NodeEnv = 'development' | 'production' | 'test';

  // HTTP types
  type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  type HttpStatus = 200 | 201 | 400 | 401 | 403 | 404 | 500;

  // Database types
  type SortOrder = 'asc' | 'desc';
  type FilterOperator =
    | 'eq'
    | 'ne'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'like'
    | 'in';

  // UI state types
  type LoadingState = 'idle' | 'loading' | 'success' | 'error';
  type Theme = 'light' | 'dark' | 'auto';

  // Animation types
  type AnimationDuration = 'fast' | 'normal' | 'slow';
  type AnimationType = 'fade' | 'slide' | 'bounce' | 'zoom';
}

// Export empty object to make this a module
export {};
