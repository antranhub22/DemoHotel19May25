/// <reference types="vite/client" />

// Type declaration for import.meta


/* ========================================
   TYPE-SAFE API CLIENT
   ======================================== */


import { ApiResponse, PaginatedResponse, LoginResponse, StartCallResponse, EndCallResponse, SaveTranscriptResponse, CreateOrderResponse, UpdateOrderStatusResponse, SendMessageResponse, HotelResearchResponse, GenerateAssistantResponse, HotelProfileResponse, UpdateAssistantConfigResponse, AnalyticsResponse, ServiceHealthResponse,  } from '@/types/api';
// ========================================
// API CLIENT CONFIGURATION
// ========================================

export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
}

export interface ApiRequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
}

// ========================================
// API CLIENT CLASS
// ========================================

export class ApiClient {
  private config: ApiClientConfig;
  private token?: string;

  constructor(config: ApiClientConfig) {
    this.config = config;
  }

  // ========================================
  // AUTHENTICATION
  // ========================================

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = undefined;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.config.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // ========================================
  // REQUEST METHODS
  // ========================================

  private async request<T>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const { method, url, data, params, headers, timeout } = config;

    try {
      const requestUrl = new (window as any).URL(url, this.config.baseUrl);

      // Add query parameters
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            requestUrl.searchParams.append(key, String(value));
          }
        });
      }

      const response = await fetch(requestUrl.toString(), {
        method,
        headers: {
          ...this.getHeaders(),
          ...headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        credentials: this.config.withCredentials ? 'include' : 'omit',
        signal: timeout ? (window as any).AbortSignal?.timeout(timeout) : undefined,
      });

      const responseData = await response.json();

      if (!response.ok) {
        const error: ApiError = {
          status: response.status,
          message: responseData.error || response.statusText,
          details: responseData.details,
          timestamp: new Date(),
        };
        throw error;
      }

      return responseData;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw {
          status: 408,
          message: 'Request timeout',
          timestamp: new Date(),
        } as ApiError;
      }

      if (error && typeof error === 'object' && 'status' in error) {
        throw error as ApiError;
      }

      throw {
        status: 500,
        message: error instanceof Error ? (error as Error).message : 'Unknown error',
        timestamp: new Date(),
      } as ApiError;
    }
  }

  // ========================================
  // HTTP METHODS
  // ========================================

  async get<T>(
    url: string,
    params?: Record<string, any>,
    config?: Partial<ApiRequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'GET',
      url,
      params,
      ...config,
    });
  }

  async post<T>(
    url: string,
    data?: any,
    config?: Partial<ApiRequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url,
      data,
      ...config,
    });
  }

  async put<T>(
    url: string,
    data?: any,
    config?: Partial<ApiRequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      url,
      data,
      ...config,
    });
  }

  async delete<T>(
    url: string,
    config?: Partial<ApiRequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      url,
      ...config,
    });
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: Partial<ApiRequestConfig>
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: 'PATCH',
      url,
      data,
      ...config,
    });
  }

  // ========================================
  // AUTHENTICATION ENDPOINTS
  // ========================================

  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await this.post<LoginResponse['data']>(
      '/auth/login',
      request
    );
    return response as LoginResponse;
  }

  async refreshToken(
    token: string
  ): Promise<ApiResponse<{ token: string; expiresIn: number }>> {
    return this.post<{ token: string; expiresIn: number }>('/auth/refresh', {
      token,
    });
  }

  // ========================================
  // CALL ENDPOINTS
  // ========================================

  async startCall(request: StartCallRequest): Promise<StartCallResponse> {
    const response = await this.post<StartCallResponse['data']>(
      '/calls/start',
      request
    );
    return response as StartCallResponse;
  }

  async endCall(request: EndCallRequest): Promise<EndCallResponse> {
    const response = await this.post<EndCallResponse['data']>(
      '/calls/end',
      request
    );
    return response as EndCallResponse;
  }

  async saveTranscript(
    request: SaveTranscriptRequest
  ): Promise<SaveTranscriptResponse> {
    const response = await this.post<SaveTranscriptResponse['data']>(
      '/transcripts',
      request
    );
    return response as SaveTranscriptResponse;
  }

  // ========================================
  // ORDER ENDPOINTS
  // ========================================

  async createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    const response = await this.post<CreateOrderResponse['data']>(
      '/orders',
      request
    );
    return response as CreateOrderResponse;
  }

  async updateOrderStatus(
    request: UpdateOrderStatusRequest
  ): Promise<UpdateOrderStatusResponse> {
    const response = await this.patch<UpdateOrderStatusResponse['data']>(
      `/orders/${request.orderId}/status`,
      request
    );
    return response as UpdateOrderStatusResponse;
  }

  // ========================================
  // MESSAGE ENDPOINTS
  // ========================================

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await this.post<SendMessageResponse['data']>(
      '/messages',
      request
    );
    return response as SendMessageResponse;
  }

  // ========================================
  // HOTEL ENDPOINTS
  // ========================================

  async researchHotel(
    request: HotelResearchRequest
  ): Promise<HotelResearchResponse> {
    const response = await this.post<HotelResearchResponse['data']>(
      '/hotel/research',
      request
    );
    return response as HotelResearchResponse;
  }

  async generateAssistant(
    request: GenerateAssistantRequest
  ): Promise<GenerateAssistantResponse> {
    const response = await this.post<GenerateAssistantResponse['data']>(
      '/hotel/generate-assistant',
      request
    );
    return response as GenerateAssistantResponse;
  }

  async getHotelProfile(tenantId: string): Promise<HotelProfileResponse> {
    const response = await this.get<HotelProfileResponse['data']>(
      `/hotel/profile/${tenantId}`
    );
    return response as HotelProfileResponse;
  }

  async updateAssistantConfig(
    request: UpdateAssistantConfigRequest
  ): Promise<UpdateAssistantConfigResponse> {
    const response = await this.put<UpdateAssistantConfigResponse['data']>(
      `/hotel/config/${request.tenantId}`,
      request
    );
    return response as UpdateAssistantConfigResponse;
  }

  // ========================================
  // ANALYTICS ENDPOINTS
  // ========================================

  async getAnalytics(
    tenantId: string,
    params?: PaginationParams
  ): Promise<AnalyticsResponse> {
    const response = await this.get<AnalyticsResponse['data']>(
      `/analytics/${tenantId}`,
      params
    );
    return response as AnalyticsResponse;
  }

  async getServiceDistribution(
    tenantId: string
  ): Promise<
    ApiResponse<Array<{ type: string; count: number; percentage: number }>>
  > {
    return this.get<Array<{ type: string; count: number; percentage: number }>>(
      `/analytics/${tenantId}/service-distribution`
    );
  }

  async getHourlyActivity(
    tenantId: string
  ): Promise<
    ApiResponse<Array<{ hour: number; calls: number; orders: number }>>
  > {
    return this.get<Array<{ hour: number; calls: number; orders: number }>>(
      `/analytics/${tenantId}/hourly-activity`
    );
  }

  // ========================================
  // HEALTH ENDPOINTS
  // ========================================

  async getServiceHealth(): Promise<ServiceHealthResponse> {
    const response = await this.get<ServiceHealthResponse['data']>('/health');
    return response as ServiceHealthResponse;
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  async getPaginated<T>(
    url: string,
    params?: PaginationParams,
    config?: Partial<ApiRequestConfig>
  ): Promise<PaginatedResponse<T>> {
    const response = await this.get<PaginatedResponse<T>>(url, params, config);
    return response.data!;
  }

  async uploadFile<T>(
    url: string,
    file: any, // File
    config?: Partial<ApiRequestConfig>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<T>({
      method: 'POST',
      url,
      data: formData,
      headers: {
        // Don't set Content-Type for FormData
        ...this.getHeaders(),
        ...config?.headers,
      },
      ...config,
    });
  }
}

// ========================================
// DEFAULT API CLIENT INSTANCE
// ========================================

export const apiClient = new ApiClient({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 30000,
  withCredentials: true,
});

// ========================================
// HOOKS FOR REACT COMPONENTS
// ========================================

export const useApiClient = () => {
  return apiClient;
};

// ========================================
// TYPE-SAFE API HOOKS
// ========================================

export const useAuth = () => {
  return {
    login: (request: LoginRequest) => apiClient.login(request),
    refreshToken: (token: string) => apiClient.refreshToken(token),
  };
};

export const useCalls = () => {
  return {
    startCall: (request: StartCallRequest) => apiClient.startCall(request),
    endCall: (request: EndCallRequest) => apiClient.endCall(request),
    saveTranscript: (request: SaveTranscriptRequest) =>
      apiClient.saveTranscript(request),
  };
};

export const useOrders = () => {
  return {
    createOrder: (request: CreateOrderRequest) =>
      apiClient.createOrder(request),
    updateOrderStatus: (request: UpdateOrderStatusRequest) =>
      apiClient.updateOrderStatus(request),
  };
};

export const useHotel = () => {
  return {
    researchHotel: (request: HotelResearchRequest) =>
      apiClient.researchHotel(request),
    generateAssistant: (request: GenerateAssistantRequest) =>
      apiClient.generateAssistant(request),
    getHotelProfile: (tenantId: string) => apiClient.getHotelProfile(tenantId),
    updateAssistantConfig: (request: UpdateAssistantConfigRequest) =>
      apiClient.updateAssistantConfig(request),
  };
};

export const useAnalytics = () => {
  return {
    getAnalytics: (tenantId: string, params?: PaginationParams) =>
      apiClient.getAnalytics(tenantId, params),
    getServiceDistribution: (tenantId: string) =>
      apiClient.getServiceDistribution(tenantId),
    getHourlyActivity: (tenantId: string) =>
      apiClient.getHourlyActivity(tenantId),
  };
};
