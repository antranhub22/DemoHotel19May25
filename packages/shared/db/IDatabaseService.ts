/**
 * 🔄 DATABASE ABSTRACTION LAYER INTERFACE
 *
 * Interface này định nghĩa các phương thức cần thiết cho database service
 * giúp tách biệt business logic khỏi database implementation
 */

export interface IDatabaseService {
  // 📋 REQUEST OPERATIONS
  createRequest(requestData: CreateRequestInput): Promise<RequestEntity>;
  getRequestById(id: number): Promise<RequestEntity | null>;
  getAllRequests(filters?: RequestFilters): Promise<RequestEntity[]>;
  updateRequest(id: number, data: UpdateRequestInput): Promise<RequestEntity>;
  deleteRequest(id: number): Promise<boolean>;

  // 🏨 TENANT OPERATIONS
  getTenantById(id: string): Promise<TenantEntity | null>;
  getAllTenants(): Promise<TenantEntity[]>;
  createTenant(tenantData: CreateTenantInput): Promise<TenantEntity>;
  updateTenant(id: string, data: UpdateTenantInput): Promise<TenantEntity>;

  // 👥 USER OPERATIONS
  getUserById(id: string): Promise<UserEntity | null>;
  getUserByEmail(email: string): Promise<UserEntity | null>;
  createUser(userData: CreateUserInput): Promise<UserEntity>;
  updateUser(id: string, data: UpdateUserInput): Promise<UserEntity>;

  // 📞 CALL OPERATIONS
  createCall(callData: CreateCallInput): Promise<CallEntity>;
  getCallById(id: string): Promise<CallEntity | null>;
  getCallsByTenant(tenantId: string): Promise<CallEntity[]>;
  updateCall(id: string, data: UpdateCallInput): Promise<CallEntity>;

  // 📊 ANALYTICS OPERATIONS
  getRequestStats(
    tenantId: string,
    dateRange?: DateRange,
  ): Promise<RequestStats>;
  getCallStats(tenantId: string, dateRange?: DateRange): Promise<CallStats>;
  getTenantMetrics(tenantId: string): Promise<TenantMetrics>;

  // 🔧 CONNECTION MANAGEMENT
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  healthCheck(): Promise<boolean>;
  beginTransaction(): Promise<DatabaseTransaction>;
}

// 📋 REQUEST TYPES
export interface RequestEntity {
  id: number;
  room_number?: string;
  guest_name?: string;
  request_content?: string;
  status?: string;
  created_at?: Date;
  updated_at: Date;
  tenant_id?: string;
  description?: string;
  priority?: string;
  assigned_to?: string;
  completed_at?: Date;
  metadata?: any;
  type?: string;
  total_amount?: number;
  items?: any;
  delivery_time?: Date;
  special_instructions?: string;
  order_type?: string;
  call_id?: string;
  service_id?: string;
  phone_number?: string;
  currency?: string;
  urgency?: string;
}

export interface CreateRequestInput {
  room_number?: string;
  guest_name?: string;
  request_content?: string;
  tenant_id?: string;
  description?: string;
  priority?: string;
  type?: string;
  total_amount?: number;
  items?: any;
  delivery_time?: Date;
  special_instructions?: string;
  order_type?: string;
  call_id?: string;
  phone_number?: string;
  currency?: string;
  urgency?: string;
}

export interface UpdateRequestInput extends Partial<CreateRequestInput> {
  status?: string;
  assigned_to?: string;
  completed_at?: Date;
  metadata?: any;
}

export interface RequestFilters {
  tenantId?: string;
  status?: string;
  priority?: string;
  type?: string;
  dateFrom?: Date;
  dateTo?: Date;
  roomNumber?: string;
  assignedTo?: string;
  limit?: number;
  offset?: number;
}

// 🏨 TENANT TYPES
export interface TenantEntity {
  id: string;
  hotel_name: string;
  domain?: string;
  subdomain?: string;
  email?: string;
  phone?: string;
  address?: string;
  subscription_plan?: string;
  subscription_status?: string;
  created_at?: Date;
  updated_at?: Date;
  custom_domain?: string;
  trial_ends_at?: Date;
  max_voices?: number;
  max_languages?: number;
  voice_cloning?: boolean;
  multi_location?: boolean;
  white_label?: boolean;
  data_retention_days?: number;
  monthly_call_limit?: number;
}

export interface CreateTenantInput {
  id: string;
  hotel_name: string;
  domain?: string;
  subdomain?: string;
  email?: string;
  phone?: string;
  address?: string;
  subscription_plan?: string;
}

export interface UpdateTenantInput extends Partial<CreateTenantInput> {
  subscription_status?: string;
  trial_ends_at?: Date;
  max_voices?: number;
  max_languages?: number;
  voice_cloning?: boolean;
  multi_location?: boolean;
  white_label?: boolean;
  data_retention_days?: number;
  monthly_call_limit?: number;
}

// 👥 USER TYPES
export interface UserEntity {
  id: string;
  email: string;
  password_hash: string;
  full_name?: string;
  role?: string;
  tenant_id?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
  last_login?: Date;
}

export interface CreateUserInput {
  email: string;
  password_hash: string;
  full_name?: string;
  role?: string;
  tenant_id?: string;
}

export interface UpdateUserInput extends Partial<CreateUserInput> {
  is_active?: boolean;
  last_login?: Date;
}

// 📞 CALL TYPES
export interface CallEntity {
  id: string;
  tenant_id: string;
  phone_number?: string;
  room_number?: string;
  guest_name?: string;
  call_status: string;
  call_duration?: number;
  started_at?: Date;
  ended_at?: Date;
  transcript?: string;
  summary?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateCallInput {
  id: string;
  tenant_id: string;
  phone_number?: string;
  room_number?: string;
  guest_name?: string;
  call_status: string;
}

export interface UpdateCallInput extends Partial<CreateCallInput> {
  call_duration?: number;
  ended_at?: Date;
  transcript?: string;
  summary?: string;
}

// 📊 ANALYTICS TYPES
export interface RequestStats {
  total_requests: number;
  pending_requests: number;
  completed_requests: number;
  cancelled_requests: number;
  avg_completion_time: number;
  requests_by_priority: Record<string, number>;
  requests_by_type: Record<string, number>;
}

export interface CallStats {
  total_calls: number;
  successful_calls: number;
  failed_calls: number;
  avg_call_duration: number;
  calls_by_status: Record<string, number>;
  hourly_distribution: Record<string, number>;
}

export interface TenantMetrics {
  requests: RequestStats;
  calls: CallStats;
  active_users: number;
  storage_used: number;
  last_activity: Date;
}

// 🔧 UTILITY TYPES
export interface DateRange {
  from: Date;
  to: Date;
}

export interface DatabaseTransaction {
  commit(): Promise<void>;
  rollback(): Promise<void>;
  isCompleted(): boolean;
}

// 🎯 DATABASE PROVIDER ENUM
export enum DatabaseProvider {
  PRISMA = "prisma",
}
