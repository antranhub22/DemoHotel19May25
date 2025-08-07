/* ========================================
   API TYPES - API-RELATED TYPE DEFINITIONS
   ======================================== */

import type { ApiResponse } from '../types/common.types';
import { Language } from '@/types/core';

// ========================================
// HOTEL DATA TYPES
// ========================================

export interface HotelData {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  amenities: string[];
  roomTypes: Array<{
    name: string;
    description: string;
    price: number;
    capacity: number;
    amenities: string[];
  }>;
  services: Array<{
    name: string;
    description: string;
    category: string;
    price?: number;
    availability: '24/7' | 'business-hours' | 'on-demand';
  }>;
  policies: {
    checkIn: string;
    checkOut: string;
    cancellation: string;
    pets: boolean;
    smoking: boolean;
  };
}

export interface HotelProfile {
  id: string;
  tenantId: string;
  researchData: HotelData;
  assistantConfig: AssistantCustomization;
  servicesConfig: Record<string, any>;
  knowledgeBase: string;
  systemPrompt: string;
  vapiAssistantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssistantCustomization {
  voice: {
    gender: 'male' | 'female';
    accent: string;
    speed: number;
  };
  personality: {
    tone: 'professional' | 'friendly' | 'formal' | 'casual';
    style: string;
    language: Language;
  };
  capabilities: {
    languages: Language[];
    services: string[];
    features: string[];
  };
}

// ========================================
// API REQUEST TYPES
// ========================================

export interface HotelResearchRequest {
  hotelName: string;
  location: string;
}

export interface HotelResearchResponse {
  success: boolean;
  data: HotelData;
  error?: string;
}

export interface GenerateAssistantRequest {
  hotelData: HotelData;
  customization: AssistantCustomization;
}

export interface GenerateAssistantResponse {
  success: boolean;
  data: {
    assistantId: string;
    config: AssistantCustomization;
    knowledgeBase: string;
    systemPrompt: string;
  };
  error?: string;
}

export interface HotelProfileResponse {
  success: boolean;
  data: HotelProfile;
  error?: string;
}

export interface UpdateAssistantConfigRequest {
  tenantId: string;
  assistantConfig: AssistantCustomization;
  servicesConfig: Record<string, any>;
  knowledgeBase?: string;
  systemPrompt?: string;
}

export interface UpdateAssistantConfigResponse {
  success: boolean;
  data: HotelProfile;
  error?: string;
}

// ========================================
// ANALYTICS API TYPES
// ========================================

export interface AnalyticsResponse {
  success: boolean;
  data: {
    overview: {
      totalCalls: number;
      averageDuration: number;
      totalOrders: number;
      averageOrderValue: number;
    };
    languageDistribution: Record<Language, number>;
    serviceTypeDistribution: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
    hourlyActivity: Array<{
      hour: number;
      calls: number;
      orders: number;
    }>;
  };
  error?: string;
}

// ========================================
// HEALTH & STATUS API TYPES
// ========================================

export interface ServiceHealthResponse {
  success: boolean;
  data: {
    database: {
      status: 'healthy' | 'degraded' | 'down';
      responseTime: number;
      lastCheck: Date;
    };
    vapi: {
      status: 'healthy' | 'degraded' | 'down';
      responseTime: number;
      lastCheck: Date;
    };
    openai: {
      status: 'healthy' | 'degraded' | 'down';
      responseTime: number;
      lastCheck: Date;
    };
    email: {
      status: 'healthy' | 'degraded' | 'down';
      responseTime: number;
      lastCheck: Date;
    };
  };
  error?: string;
}

// ========================================
// AUTHENTICATION API TYPES
// ========================================

export interface LoginRequest {
  username: string;
  password: string;
  tenantId?: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: number;
      username: string;
      role: 'admin' | 'staff' | 'manager';
      tenantId: string;
    };
    tenant: {
      id: string;
      hotelName: string;
      subscriptionPlan: string;
      subscriptionStatus: string;
    };
  };
  error?: string;
}

export interface RefreshTokenRequest {
  token: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  data: {
    token: string;
    expiresIn: number;
  };
  error?: string;
}

// ========================================
// CALL API TYPES
// ========================================

export interface StartCallRequest {
  roomNumber: string;
  language: Language;
  serviceType?: string;
  tenantId: string;
}

export interface StartCallResponse {
  success: boolean;
  data: {
    callId: string;
    vapiCallId: string;
    roomNumber: string;
    language: Language;
    startTime: Date;
  };
  error?: string;
}

export interface EndCallRequest {
  callId: string;
  duration: number;
  tenantId: string;
}

export interface EndCallResponse {
  success: boolean;
  data: {
    callId: string;
    endTime: Date;
    duration: number;
  };
  error?: string;
}

export interface SaveTranscriptRequest {
  callId: string;
  role: 'user' | 'assistant';
  content: string;
  tenantId: string;
}

export interface SaveTranscriptResponse {
  success: boolean;
  data: {
    id: number;
    callId: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  };
  error?: string;
}

// ========================================
// ORDER API TYPES
// ========================================

export interface CreateOrderRequest {
  roomNumber: string;
  orderId: string;
  requestContent: string;
  tenantId: string;
}

export interface CreateOrderResponse {
  success: boolean;
  data: {
    id: number;
    roomNumber: string;
    orderId: string;
    requestContent: string;
    status: string;
    createdAt: Date;
  };
  error?: string;
}

export interface UpdateOrderStatusRequest {
  orderId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  tenantId: string;
}

export interface UpdateOrderStatusResponse {
  success: boolean;
  data: {
    id: number;
    orderId: string;
    status: string;
    updatedAt: Date;
  };
  error?: string;
}

// ========================================
// MESSAGE API TYPES
// ========================================

export interface SendMessageRequest {
  requestId: number;
  sender: string;
  content: string;
  tenantId: string;
}

export interface SendMessageResponse {
  success: boolean;
  data: {
    id: number;
    requestId: number;
    sender: string;
    content: string;
    timestamp: Date;
  };
  error?: string;
}

// ========================================
// GENERIC API TYPES
// ========================================

export interface ApiError {
  status: number;
  message: string;
  details?: any;
  timestamp: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ========================================
// WEBSOCKET API TYPES
// ========================================

export interface WebSocketMessage {
  type: 'transcript' | 'order_status_update' | 'call_end' | 'init' | 'error';
  data: any;
  timestamp: Date;
  tenantId?: string;
}

export interface TranscriptMessage {
  type: 'transcript';
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  callId: string;
}

export interface OrderStatusMessage {
  type: 'order_status_update';
  orderId?: string;
  reference?: string;
  status: string;
  timestamp: Date;
  roomNumber?: string;
}

export interface CallEndMessage {
  type: 'call_end';
  callId: string;
  duration: number;
  timestamp: Date;
}

export interface InitMessage {
  type: 'init';
  tenantId: string;
  roomNumber?: string;
  language?: Language;
}

export interface ErrorMessage {
  type: 'error';
  message: string;
  code?: string;
  timestamp: Date;
}
