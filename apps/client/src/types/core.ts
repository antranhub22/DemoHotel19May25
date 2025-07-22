/* ========================================
   CORE TYPES - CENTRALIZED TYPE DEFINITIONS
   ======================================== */

// ========================================
// LANGUAGE & INTERNATIONALIZATION
// ========================================

export type Language = 'en' | 'fr' | 'zh' | 'ru' | 'ko' | 'vi';

export type SupportedLanguage = {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
};

// ========================================
// HOTEL & TENANT TYPES
// ========================================

export interface HotelConfig {
  name: string;
  location: string;
  phone: string;
  email: string;
  website: string;
  timezone: string;
  languages: Language[];
  defaultLanguage: Language;
  branding: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    fonts: {
      primary: string;
      secondary: string;
    };
    logo: string;
  };
}

export interface Tenant {
  id: string;
  hotelName: string;
  subdomain: string;
  customDomain?: string;
  subscriptionPlan: 'trial' | 'basic' | 'premium' | 'enterprise';
  subscriptionStatus: 'active' | 'inactive' | 'expired' | 'cancelled';
  trialEndsAt?: Date;
  maxVoices: number;
  maxLanguages: number;
  voiceCloning: boolean;
  multiLocation: boolean;
  whiteLabel: boolean;
  dataRetentionDays: number;
  monthlyCallLimit: number;
}

// ========================================
// CALL & TRANSCRIPT TYPES
// ========================================

export interface Call {
  id: string;
  callIdVapi: string;
  roomNumber?: string;
  language: Language;
  serviceType?: string;
  duration?: number;
  startTime: Date;
  endTime?: Date;
  tenantId: string;
}

export interface Transcript {
  id?: number;
  callId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isModelOutput?: boolean;
  tenantId: string;
}

export interface CallSummary {
  id?: number;
  callId: string;
  content: string;
  timestamp: Date;
  roomNumber?: string;
  duration?: string;
  tenantId: string;
}

export interface CallDetails {
  id: string;
  roomNumber: string;
  duration: string;
  category: string;
  language: Language;
}

// ========================================
// ORDER & REQUEST TYPES
// ========================================

export interface OrderItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  serviceType?: string;
}

export interface OrderSummary {
  orderType: string;
  deliveryTime: 'asap' | '30min' | '1hour' | 'specific';
  roomNumber: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialInstructions: string;
  items: OrderItem[];
  totalAmount: number;
}

export interface ServiceRequest {
  serviceType: string;
  requestText: string;
  details: {
    date?: string;
    time?: string;
    location?: string;
    people?: number;
    amount?: string;
    roomNumber?: string;
    otherDetails?: string;
  };
}

export interface Order {
  reference: string;
  estimatedTime: string;
  summary: OrderSummary;
}

export interface Request {
  id: number;
  roomNumber: string;
  orderId: string;
  requestContent: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
}

export interface ActiveOrder {
  reference: string;
  requestedAt: Date;
  estimatedTime: string;
  status?: string;
}

// ========================================
// MESSAGE & COMMUNICATION TYPES
// ========================================

export interface Message {
  id: number;
  requestId: number;
  sender: string;
  content: string;
  timestamp: Date;
  tenantId: string;
}

export interface Staff {
  id: number;
  username: string;
  password: string;
  role: 'admin' | 'staff' | 'manager';
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// INTERFACE & UI TYPES
// ========================================

export interface InterfaceLayer {
  id: string;
  name: string;
  isActive: boolean;
}

// ✅ DEPRECATED: Use RefactoredAssistantContextType instead
export interface AssistantContextType {
  transcripts: Transcript[];
  callDetails: CallDetails | null;
  callDuration: number;
  language: Language;
  activeOrders: ActiveOrder[];
  setActiveOrders: (orders: ActiveOrder[]) => void;
  addTranscript: (transcript: Transcript) => void;
  setCallDetails: (details: CallDetails) => void;
  setCallDuration: (duration: number) => void;
  setLanguage: (lang: Language) => void;
}

// ========================================
// ANALYTICS TYPES
// ========================================

export interface AnalyticsOverview {
  totalCalls: number;
  averageDuration: number;
  totalOrders: number;
  averageOrderValue: number;
  languageDistribution: Record<Language, number>;
  serviceTypeDistribution: Record<string, number>;
}

export interface ServiceDistribution {
  serviceType: string;
  count: number;
  percentage: number;
}

export interface HourlyActivity {
  hour: number;
  calls: number;
  orders: number;
}

// ========================================
// REFERENCE & ASSET TYPES
// ========================================

export interface ReferenceItem {
  url: string;
  title: string;
  description: string;
  type: 'image' | 'document' | 'link';
}

export interface DictionaryEntry {
  keyword: string;
  fragments: string[];
  type: 'word' | 'phrase' | 'name';
}

// ========================================
// UTILITY TYPES
// ========================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type Nullable<T> = T | null;

export type NonNullable<T> = T extends null | undefined ? never : T;

// ========================================
// CONFIGURATION TYPES
// ========================================

export interface VapiConfig {
  publicKey: string;
  assistantId: string;
}

export interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface EmailConfig {
  service: 'gmail' | 'sendgrid' | 'smtp';
  user: string;
  pass: string;
  from: string;
  to: string;
}
