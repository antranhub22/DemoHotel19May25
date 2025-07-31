/**
 * Database Transformation Utilities
 * Handles camelCase ↔ snake_case conversion at API boundary
 */

// ✅ POSTGRESQL FIELD MAPPING UTILITIES
// Handles conversion between PostgreSQL snake_case and JavaScript camelCase

import type {
  Tenant,
  InsertTenant,
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
} from './schema';

// ============================================
// CORE TRANSFORMATION FUNCTIONS
// ============================================

export const toCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

export const toSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

// ============================================
// HOTEL PROFILES MAPPER
// ============================================

export interface HotelProfileCamelCase {
  id: string;
  tenantId: string;
  researchData: string | null;
  assistantConfig: string | null;
  vapiAssistantId: string | null;
  servicesConfig: string | null;
  knowledgeBase: string | null;
  systemPrompt: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertHotelProfileCamelCase {
  id?: string;
  tenantId: string;
  researchData?: string;
  assistantConfig?: string;
  vapiAssistantId?: string;
  servicesConfig?: string;
  knowledgeBase?: string;
  systemPrompt?: string;
}

// Raw PostgreSQL type (from schema)
export interface HotelProfileDB {
  id: string;
  tenant_id: string;
  research_data: string | null;
  assistant_config: string | null;
  vapi_assistant_id: string | null;
  services_config: string | null;
  knowledge_base: string | null;
  system_prompt: string | null;
  created_at: Date;
  updated_at: Date;
}

export const hotelProfileMapper = {
  // Convert database result to camelCase for frontend
  toFrontend: (profile: HotelProfileDB): HotelProfileCamelCase => ({
    id: profile.id,
    tenantId: profile.tenant_id,
    researchData: profile.research_data,
    assistantConfig: profile.assistant_config,
    vapiAssistantId: profile.vapi_assistant_id,
    servicesConfig: profile.services_config,
    knowledgeBase: profile.knowledge_base,
    systemPrompt: profile.system_prompt,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  }),

  // Convert camelCase input to snake_case for database
  toDatabase: (profile: InsertHotelProfileCamelCase): any => ({
    id: profile.id,
    tenant_id: profile.tenantId,
    research_data: profile.researchData,
    assistant_config: profile.assistantConfig,
    vapi_assistant_id: profile.vapiAssistantId,
    services_config: profile.servicesConfig,
    knowledge_base: profile.knowledgeBase,
    system_prompt: profile.systemPrompt,
  }),

  // Update fields mapping
  toUpdateFields: (updates: Partial<InsertHotelProfileCamelCase>): any => {
    const mapped: any = {};

    if (updates.researchData !== undefined) {
      mapped.research_data = updates.researchData;
    }
    if (updates.assistantConfig !== undefined) {
      mapped.assistant_config = updates.assistantConfig;
    }
    if (updates.vapiAssistantId !== undefined) {
      mapped.vapi_assistant_id = updates.vapiAssistantId;
    }
    if (updates.servicesConfig !== undefined) {
      mapped.services_config = updates.servicesConfig;
    }
    if (updates.knowledgeBase !== undefined) {
      mapped.knowledge_base = updates.knowledgeBase;
    }
    if (updates.systemPrompt !== undefined) {
      mapped.system_prompt = updates.systemPrompt;
    }

    return mapped;
  },
};

// ============================================
// TENANT MAPPER
// ============================================

export interface TenantCamelCase {
  id: string;
  hotelName: string;
  subdomain: string;
  customDomain?: string | null;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  trialEndsAt?: Date | null;
  createdAt?: Date;
  maxVoices?: number;
  maxLanguages?: number;
  voiceCloning?: boolean;
  multiLocation?: boolean;
  whiteLabel?: boolean;
  dataRetentionDays?: number;
  monthlyCallLimit?: number;
  name?: string | null;
  updatedAt?: Date;
  isActive?: boolean;
  settings?: string | null;
  tier?: string;
  maxCalls?: number;
  maxUsers?: number;
  features?: string | null;
}

export const tenantMapper = {
  toFrontend: (tenant: Tenant): TenantCamelCase => ({
    id: tenant.id,
    hotelName: tenant.hotel_name,
    subdomain: tenant.subdomain,
    customDomain: tenant.custom_domain,
    subscriptionPlan: tenant.subscription_plan,
    subscriptionStatus: tenant.subscription_status,
    trialEndsAt: tenant.trial_ends_at,
    createdAt: tenant.created_at,
    maxVoices: tenant.max_voices,
    maxLanguages: tenant.max_languages,
    voiceCloning: tenant.voice_cloning,
    multiLocation: tenant.multi_location,
    whiteLabel: tenant.white_label,
    dataRetentionDays: tenant.data_retention_days,
    monthlyCallLimit: tenant.monthly_call_limit,
    name: tenant.name,
    updatedAt: tenant.updated_at,
    isActive: tenant.is_active,
    settings: tenant.settings,
    tier: tenant.tier,
    maxCalls: tenant.max_calls,
    maxUsers: tenant.max_users,
    features: tenant.features,
  }),

  toDatabase: (tenant: Partial<TenantCamelCase>): any => ({
    id: tenant.id,
    hotel_name: tenant.hotelName,
    subdomain: tenant.subdomain,
    custom_domain: tenant.customDomain,
    subscription_plan: tenant.subscriptionPlan,
    subscription_status: tenant.subscriptionStatus,
    trial_ends_at: tenant.trialEndsAt,
    created_at: tenant.createdAt,
    max_voices: tenant.maxVoices,
    max_languages: tenant.maxLanguages,
    voice_cloning: tenant.voiceCloning,
    multi_location: tenant.multiLocation,
    white_label: tenant.whiteLabel,
    data_retention_days: tenant.dataRetentionDays,
    monthly_call_limit: tenant.monthlyCallLimit,
    name: tenant.name,
    updated_at: tenant.updatedAt,
    is_active: tenant.isActive,
    settings: tenant.settings,
    tier: tenant.tier,
    max_calls: tenant.maxCalls,
    max_users: tenant.maxUsers,
    features: tenant.features,
  }),
};

// ============================================
// AUTH USER MAPPER
// ============================================

export interface AuthUserCamelCase {
  id: string;
  tenantId: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: string;
  permissions?: string[];
  displayName?: string | null;
  avatarUrl?: string | null;
  lastLogin?: string | null; // ISO string for API consistency
  isActive?: boolean;
  createdAt?: string; // ISO string
  updatedAt?: string; // ISO string
}

export const authUserMapper = {
  toFrontend: (user: Staff): AuthUserCamelCase => ({
    id: user.id,
    tenantId: user.tenant_id,
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    permissions: user.permissions ? JSON.parse(user.permissions) : [],
    displayName: user.display_name,
    avatarUrl: user.avatar_url,
    lastLogin: user.last_login?.toISOString() || null,
    isActive: user.is_active,
    createdAt: user.created_at?.toISOString(),
    updatedAt: user.updated_at?.toISOString(),
  }),

  toDatabase: (user: Partial<AuthUserCamelCase>): any => ({
    id: user.id,
    tenant_id: user.tenantId,
    username: user.username,
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    permissions: user.permissions
      ? JSON.stringify(user.permissions)
      : undefined,
    display_name: user.displayName,
    avatar_url: user.avatarUrl,
    last_login: user.lastLogin ? new Date(user.lastLogin) : undefined,
    is_active: user.isActive,
    created_at: user.createdAt ? new Date(user.createdAt) : undefined,
    updated_at: user.updatedAt ? new Date(user.updatedAt) : undefined,
  }),
};

// ============================================
// REQUEST MAPPER
// ============================================

export interface RequestCamelCase {
  id: number;
  tenantId: string;
  callId?: string | null;
  roomNumber?: string | null;
  orderId?: string | null;
  requestContent?: string | null;
  status?: string;
  createdAt?: Date;
  updatedAt?: Date;
  description?: string | null;
  priority?: string;
  assignedTo?: string | null;
  // ✅ NEW: Add missing fields from database schema
  guestName?: string | null;
  phoneNumber?: string | null;
  totalAmount?: number | null;
  currency?: string;
  estimatedCompletion?: Date | null;
  actualCompletion?: Date | null;
  specialInstructions?: string | null;
  urgency?: string;
  orderType?: string | null;
  deliveryTime?: string | null;
  items?: string | null; // JSON stored as text
}

export const requestMapper = {
  toFrontend: (request: RequestRecord): RequestCamelCase => ({
    id: request.id,
    tenantId: request.tenant_id,
    callId: request.call_id,
    roomNumber: request.room_number,
    orderId: request.order_id,
    requestContent: request.request_content,
    status: request.status,
    createdAt: request.created_at,
    updatedAt: request.updated_at,
    description: request.description,
    priority: request.priority,
    assignedTo: request.assigned_to,
    // ✅ NEW: Map additional fields
    guestName: request.guest_name,
    phoneNumber: request.phone_number,
    totalAmount: request.total_amount,
    currency: request.currency,
    estimatedCompletion: request.estimated_completion,
    actualCompletion: request.actual_completion,
    specialInstructions: request.special_instructions,
    urgency: request.urgency,
    orderType: request.order_type,
    deliveryTime: request.delivery_time,
    items: request.items,
  }),

  toDatabase: (request: Partial<RequestCamelCase>): any => {
    const mapped: any = {};
    
    // ✅ Only include defined fields to avoid overwriting with undefined
    if (request.id !== undefined) mapped.id = request.id;
    if (request.tenantId !== undefined) mapped.tenant_id = request.tenantId;
    if (request.callId !== undefined) mapped.call_id = request.callId;
    if (request.roomNumber !== undefined) mapped.room_number = request.roomNumber;
    if (request.orderId !== undefined) mapped.order_id = request.orderId;
    if (request.requestContent !== undefined) mapped.request_content = request.requestContent;
    if (request.status !== undefined) mapped.status = request.status;
    if (request.createdAt !== undefined) mapped.created_at = request.createdAt;
    if (request.updatedAt !== undefined) mapped.updated_at = request.updatedAt;
    if (request.description !== undefined) mapped.description = request.description;
    if (request.priority !== undefined) mapped.priority = request.priority;
    if (request.assignedTo !== undefined) mapped.assigned_to = request.assignedTo;
    // ✅ NEW: Map additional fields
    if (request.guestName !== undefined) mapped.guest_name = request.guestName;
    if (request.phoneNumber !== undefined) mapped.phone_number = request.phoneNumber;
    if (request.totalAmount !== undefined) mapped.total_amount = request.totalAmount;
    if (request.currency !== undefined) mapped.currency = request.currency;
    if (request.estimatedCompletion !== undefined) mapped.estimated_completion = request.estimatedCompletion;
    if (request.actualCompletion !== undefined) mapped.actual_completion = request.actualCompletion;
    if (request.specialInstructions !== undefined) mapped.special_instructions = request.specialInstructions;
    if (request.urgency !== undefined) mapped.urgency = request.urgency;
    if (request.orderType !== undefined) mapped.order_type = request.orderType;
    if (request.deliveryTime !== undefined) mapped.delivery_time = request.deliveryTime;
    if (request.items !== undefined) mapped.items = request.items;

    return mapped;
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const convertToISOString = (
  date: Date | string | null | undefined
): string | null => {
  if (!date) {
    return null;
  }
  if (typeof date === 'string') {
    return date;
  }
  return date.toISOString();
};

export const convertToDate = (
  dateString: string | Date | null | undefined
): Date | null => {
  if (!dateString) {
    return null;
  }
  if (dateString instanceof Date) {
    return dateString;
  }
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

// ============================================
// POSTGRESQL QUERY RESULT HANDLER
// ============================================

export const handlePostgreSQLResult = (result: any) => {
  // PostgreSQL returns rowCount instead of changes
  return {
    success: true,
    deletedCount: result.rowCount || 0,
    affectedRows: result.rowCount || 0,
  };
};
