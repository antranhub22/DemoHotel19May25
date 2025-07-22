import { logger } from '@shared/utils/logger';
import { apiRequest } from '@/lib/queryClient';

// ============================================
// Types & Interfaces
// ============================================

export interface HotelData {
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  location?: {
    lat: number;
    lng: number;
  };
  services: Array<{
    type: string;
    name: string;
    description: string;
    category: string;
  }>;
  amenities: string[];
  policies: {
    checkIn: string;
    checkOut: string;
    cancellation: string;
  };
  roomTypes: Array<{
    name: string;
    price: number;
    description: string;
  }>;
  localAttractions: Array<{
    name: string;
    description: string;
    distance?: string;
    category: string;
  }>;
}

export interface AssistantCustomization {
  personality:
    | 'professional'
    | 'friendly'
    | 'luxurious'
    | 'casual'
    | 'enthusiastic';
  tone: 'formal' | 'friendly' | 'warm' | 'energetic' | 'calm';
  languages: string[];
  voiceId?: string;
  silenceTimeout?: number;
  maxDuration?: number;
  backgroundSound: 'office' | 'off' | 'hotel-lobby';
}

export interface HotelProfile {
  id: string;
  tenantId: string;
  researchData: HotelData;
  assistantConfig: AssistantCustomization;
  vapiAssistantId?: string;
  knowledgeBase: string;
  systemPrompt: string;
  createdAt: string;
  updatedAt: string;
}

export interface HotelResearchRequest {
  hotelName: string;
  location?: string;
  researchTier?: 'basic' | 'advanced';
}

export interface HotelResearchResponse {
  success: boolean;
  hotelData: HotelData;
  knowledgeBase: string;
  researchTier: 'basic' | 'advanced';
  timestamp: string;
}

export interface GenerateAssistantRequest {
  hotelData: HotelData;
  customization: AssistantCustomization;
}

export interface GenerateAssistantResponse {
  success: boolean;
  assistantId: string;
  customization: AssistantCustomization;
  systemPrompt: string;
  timestamp: string;
}

export interface HotelProfileResponse {
  success: boolean;
  profile: HotelProfile;
  usage: {
    totalCalls: number;
    currentMonth: number;
    limit: number;
    remainingCalls: number;
  };
  limits: {
    maxCalls: number;
    maxAssistants: number;
    maxLanguages: number;
  };
  features: {
    voiceCloning: boolean;
    multiLocation: boolean;
    whiteLabel: boolean;
    advancedAnalytics: boolean;
  };
  assistantStatus: 'not_created' | 'active' | 'error' | 'updating';
}

export interface UpdateAssistantConfigRequest {
  personality?: string;
  tone?: string;
  languages?: string[];
  voiceId?: string;
  silenceTimeout?: number;
  maxDuration?: number;
  backgroundSound?: string;
  systemPrompt?: string;
}

export interface AnalyticsResponse {
  totalCalls: number;
  totalCallsGrowth: number;
  averageCallDuration: number;
  callDurationGrowth: number;
  activeUsers: number;
  activeUsersGrowth: number;
  satisfactionScore: number;
  satisfactionGrowth: number;
  languageDistribution: Array<{
    language: string;
    count: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    time: string;
    action: string;
    type: string;
  }>;
}

export interface ServiceHealthResponse {
  services: {
    database: 'operational' | 'degraded' | 'down';
    vapi: 'operational' | 'degraded' | 'down';
    googlePlaces: 'operational' | 'degraded' | 'down';
    openai: 'operational' | 'degraded' | 'down';
  };
  uptime: string;
  lastChecked: string;
  issues: string[];
}

export interface ApiError {
  error: string;
  details?: any;
  feature?: string;
  currentPlan?: string;
  upgradeRequired?: boolean;
  setupRequired?: boolean;
  assistantRequired?: boolean;
  requiresResearch?: boolean;
}

// ============================================
// Dashboard API Service
// ============================================

export class DashboardApi {
  private baseUrl = '/api/dashboard';

  // ============================================
  // Hotel Research & Setup
  // ============================================

  /**
   * Research hotel information automatically
   */
  async researchHotel(
    request: HotelResearchRequest
  ): Promise<HotelResearchResponse> {
    try {
      const response = await apiRequest({
        url: `${this.baseUrl}/research-hotel`,
        method: 'POST',
        body: request,
      });
      return response;
    } catch (error) {
      logger.error('Hotel research failed:', 'Component', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Generate Vapi AI assistant
   */
  async generateAssistant(
    request: GenerateAssistantRequest
  ): Promise<GenerateAssistantResponse> {
    try {
      const response = await apiRequest({
        url: `${this.baseUrl}/generate-assistant`,
        method: 'POST',
        body: request,
      });
      return response;
    } catch (error) {
      logger.error('Assistant generation failed:', 'Component', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get hotel profile and assistant information
   */
  async getHotelProfile(): Promise<HotelProfileResponse> {
    try {
      const response = await apiRequest({
        url: `${this.baseUrl}/hotel-profile`,
        method: 'GET',
      });
      return response;
    } catch (error) {
      logger.error('Failed to fetch hotel profile:', 'Component', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Update assistant configuration
   */
  async updateAssistantConfig(
    request: UpdateAssistantConfigRequest
  ): Promise<{ success: boolean }> {
    try {
      const response = await apiRequest({
        url: `${this.baseUrl}/assistant-config`,
        method: 'PUT',
        body: request,
      });
      return response;
    } catch (error) {
      logger.error('Failed to update assistant config:', 'Component', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get analytics data
   */
  async getAnalytics(): Promise<AnalyticsResponse> {
    try {
      const response = await apiRequest({
        url: `${this.baseUrl}/analytics`,
        method: 'GET',
      });
      return response;
    } catch (error) {
      logger.error('Failed to fetch analytics:', 'Component', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Get service health status
   */
  async getServiceHealth(): Promise<ServiceHealthResponse> {
    try {
      const response = await apiRequest({
        url: `${this.baseUrl}/service-health`,
        method: 'GET',
      });
      return response;
    } catch (error) {
      logger.error('Failed to fetch service health:', 'Component', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Reset assistant (delete and recreate)
   */
  async resetAssistant(): Promise<{ success: boolean }> {
    try {
      const response = await apiRequest({
        url: `${this.baseUrl}/reset-assistant`,
        method: 'POST',
      });
      return response;
    } catch (error) {
      logger.error('Failed to reset assistant:', 'Component', error);
      throw this.handleApiError(error);
    }
  }

  // ============================================
  // Error Handling
  // ============================================

  private handleApiError(error: any): ApiError {
    // If it's already a structured error
    if (error.error) {
      return error as ApiError;
    }

    // Parse error message
    const errorMessage = error.message || 'An unexpected error occurred';
    const statusMatch = errorMessage.match(/^(\d+):\s*(.+)$/);

    if (statusMatch) {
      const [, status, message] = statusMatch;
      const statusCode = parseInt(status);

      // Try to parse JSON error details
      try {
        const errorData = JSON.parse(message);
        return {
          error: errorData.error || message,
          details: errorData.details,
          feature: errorData.feature,
          currentPlan: errorData.currentPlan,
          upgradeRequired: errorData.upgradeRequired,
          setupRequired: errorData.setupRequired,
          assistantRequired: errorData.assistantRequired,
          requiresResearch: errorData.requiresResearch,
        };
      } catch {
        return {
          error: message,
          details: { statusCode },
        };
      }
    }

    return {
      error: errorMessage,
      details: { originalError: error },
    };
  }
}

// ============================================
// Singleton Instance
// ============================================

export const dashboardApi = new DashboardApi();

// ============================================
// Validation Helpers
// ============================================

export const validateHotelData = (data: any): data is HotelData => {
  return (
    data &&
    typeof data.name === 'string' &&
    typeof data.address === 'string' &&
    Array.isArray(data.services) &&
    Array.isArray(data.amenities) &&
    data.policies &&
    Array.isArray(data.roomTypes)
  );
};

export const validateAssistantCustomization = (
  data: any
): data is AssistantCustomization => {
  return (
    data &&
    [
      'professional',
      'friendly',
      'luxurious',
      'casual',
      'enthusiastic',
    ].includes(data.personality) &&
    ['formal', 'friendly', 'warm', 'energetic', 'calm'].includes(data.tone) &&
    Array.isArray(data.languages) &&
    data.languages.length > 0 &&
    ['office', 'off', 'hotel-lobby'].includes(data.backgroundSound)
  );
};

// ============================================
// Constants
// ============================================

export const PERSONALITY_OPTIONS = [
  {
    value: 'professional',
    label: 'Chuyên nghiệp',
    description: 'Lịch sự, trang trọng và đáng tin cậy',
  },
  {
    value: 'friendly',
    label: 'Thân thiện',
    description: 'Ấm áp, dễ gần và hữu ích',
  },
  {
    value: 'luxurious',
    label: 'Sang trọng',
    description: 'Tinh tế, đẳng cấp và chuyên nghiệp',
  },
  {
    value: 'casual',
    label: 'Thoải mái',
    description: 'Tự nhiên, gần gũi và dễ chịu',
  },
  {
    value: 'enthusiastic',
    label: 'Nhiệt tình',
    description: 'Tích cực, năng động và sôi nổi',
  },
] as const;

export const TONE_OPTIONS = [
  {
    value: 'formal',
    label: 'Trang trọng',
    description: 'Lịch sự và chuyên nghiệp',
  },
  { value: 'friendly', label: 'Thân thiện', description: 'Ấm áp và dễ gần' },
  { value: 'warm', label: 'Ấm áp', description: 'Gần gũi và chăm sóc' },
  {
    value: 'energetic',
    label: 'Năng động',
    description: 'Tích cực và sôi nổi',
  },
  { value: 'calm', label: 'Điềm tĩnh', description: 'Bình tĩnh và thư thái' },
] as const;

export const LANGUAGE_OPTIONS = [
  { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'ko', label: '한국어', flag: '🇰🇷' },
  { value: 'zh', label: '中文', flag: '🇨🇳' },
  { value: 'ru', label: 'Русский', flag: '🇷🇺' },
] as const;

export const BACKGROUND_SOUND_OPTIONS = [
  {
    value: 'hotel-lobby',
    label: 'Sảnh khách sạn',
    description: 'Nhạc nền nhẹ nhàng',
  },
  { value: 'office', label: 'Văn phòng', description: 'Âm thanh văn phòng' },
  { value: 'off', label: 'Tắt âm thanh', description: 'Không có âm thanh nền' },
] as const;

export default dashboardApi;
