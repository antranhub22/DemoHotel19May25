import fetch from 'node-fetch';
import { z } from 'zod';
import {} from './hotelResearch';
import { logger } from '@shared/utils/logger';
import { KnowledgeBaseGenerator } from './knowledgeBaseGenerator';

// ============================================
// Types & Interfaces for Vapi Integration
// ============================================

export interface VapiAssistantConfig {
  name: string;
  hotelName: string;
  systemPrompt: string;
  voiceId?: string;
  model?: {
    provider: 'openai' | 'anthropic';
    model: string;
    temperature?: number;
  };
  functions: VapiFunction[];
  firstMessage?: string;
  silenceTimeoutSeconds?: number;
  maxDurationSeconds?: number;
  backgroundSound?: 'office' | 'off' | 'hotel-lobby';
}

export interface VapiFunction {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<
      string,
      {
        type: string;
        enum?: string[];
        description?: string;
        items?: any;
      }
    >;
    required?: string[];
  };
  async?: boolean;
}

export interface AssistantCustomization {
  personality: 'professional' | 'friendly' | 'luxurious' | 'casual';
  tone: 'formal' | 'friendly' | 'enthusiastic' | 'calm';
  languages: string[];
  voiceId?: string;
  specialInstructions?: string;
  backgroundSound?: 'office' | 'off' | 'hotel-lobby';
  silenceTimeout?: number;
  maxDuration?: number;
}

export interface VapiResponse {
  id: string;
  name: string;
  model: any;
  voice: any;
  functions: VapiFunction[];
  firstMessage?: string;
  createdAt: string;
}

export interface VapiError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

// ============================================
// Error Handling
// ============================================

export class VapiIntegrationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'VapiIntegrationError';
  }
}

// ============================================
// Vapi Integration Service
// ============================================

export class VapiIntegrationService {
  private baseURL = 'https://api.vapi.ai';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.VAPI_API_KEY || '';

    if (!this.apiKey) {
      logger.warn(
        'Vapi API key not found. Assistant creation will fail.',
        'Component'
      );
    }
  }

  // ============================================
  // Core API Methods
  // ============================================

  /**
   * Create a new Vapi assistant
   */
  async createAssistant(config: VapiAssistantConfig): Promise<string> {
    if (!this.apiKey) {
      throw new VapiIntegrationError(
        'Vapi API key not configured',
        'API_KEY_MISSING',
        500
      );
    }

    try {
      logger.debug('🤖 Creating Vapi assistant: ${config.name}', 'Component');

      const response = await fetch(`${this.baseURL}/assistant`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: config.name,
          model: config.model || {
            provider: 'openai',
            model: 'gpt-4',
            temperature: 0.7,
          },
          voice: {
            provider: 'playht',
            voiceId: config.voiceId || 'jennifer',
          },
          systemMessage: config.systemPrompt,
          firstMessage:
            config.firstMessage ||
            `Hello! Welcome to ${config.hotelName}. How may I assist you today?`,
          functions: config.functions,
          silenceTimeoutSeconds: config.silenceTimeoutSeconds || 30,
          maxDurationSeconds: config.maxDurationSeconds || 1800, // 30 minutes
          backgroundSound: config.backgroundSound || 'hotel-lobby',
        }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        const errorData: VapiError = JSON.parse(responseText) as VapiError;
        throw new VapiIntegrationError(
          `Vapi API error: ${errorData.error.message}`,
          errorData.error.type || 'API_ERROR',
          response.status,
          errorData
        );
      }

      const assistant: VapiResponse = JSON.parse(responseText);
      logger.debug(
        '✅ Vapi assistant created successfully: ${assistant.id}',
        'Component'
      );

      return assistant.id;
    } catch (error: any) {
      if (error instanceof VapiIntegrationError) {
        throw error;
      }

      logger.error('Failed to create Vapi assistant:', 'Component', error);
      throw new VapiIntegrationError(
        `Failed to create assistant: ${(error as any)?.message || String(error) || 'Unknown error'}`,
        'CREATION_FAILED',
        500
      );
    }
  }

  /**
   * Update an existing Vapi assistant
   */
  async updateAssistant(
    assistantId: string,
    config: Partial<VapiAssistantConfig>
  ): Promise<void> {
    if (!this.apiKey) {
      throw new VapiIntegrationError(
        'Vapi API key not configured',
        'API_KEY_MISSING',
        500
      );
    }

    try {
      logger.debug('🔄 Updating Vapi assistant: ${assistantId}', 'Component');

      const updateData: any = {};

      if (config.name) {
        updateData.name = config.name;
      }
      if (config.systemPrompt) {
        updateData.systemMessage = config.systemPrompt;
      }
      if (config.functions) {
        updateData.functions = config.functions;
      }
      if (config.firstMessage) {
        updateData.firstMessage = config.firstMessage;
      }
      if (config.voiceId) {
        updateData.voice = { provider: 'playht', voiceId: config.voiceId };
      }
      if (config.model) {
        updateData.model = config.model;
      }
      if (config.silenceTimeoutSeconds) {
        updateData.silenceTimeoutSeconds = config.silenceTimeoutSeconds;
      }
      if (config.maxDurationSeconds) {
        updateData.maxDurationSeconds = config.maxDurationSeconds;
      }
      if (config.backgroundSound) {
        updateData.backgroundSound = config.backgroundSound;
      }

      const response = await fetch(`${this.baseURL}/assistant/${assistantId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData: VapiError = (await response.json()) as any;
        throw new VapiIntegrationError(
          `Vapi API error: ${errorData.error.message}`,
          errorData.error.type || 'API_ERROR',
          response.status
        );
      }

      logger.debug(
        '✅ Vapi assistant updated successfully: ${assistantId}',
        'Component'
      );
    } catch (error) {
      if (error instanceof VapiIntegrationError) {
        throw error;
      }

      logger.error('Failed to update Vapi assistant:', 'Component', error);
      throw new VapiIntegrationError(
        `Failed to update assistant: ${(error as any)?.message || String(error) || 'Unknown error'}`,
        'UPDATE_FAILED',
        500
      );
    }
  }

  /**
   * Delete a Vapi assistant
   */
  async deleteAssistant(assistantId: string): Promise<void> {
    if (!this.apiKey) {
      throw new VapiIntegrationError(
        'Vapi API key not configured',
        'API_KEY_MISSING',
        500
      );
    }

    try {
      logger.debug('🗑️ Deleting Vapi assistant: ${assistantId}', 'Component');

      const response = await fetch(`${this.baseURL}/assistant/${assistantId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        const errorData: VapiError = (await response.json()) as any;
        throw new VapiIntegrationError(
          `Vapi API error: ${errorData.error.message}`,
          errorData.error.type || 'API_ERROR',
          response.status
        );
      }

      logger.debug(
        '✅ Vapi assistant deleted successfully: ${assistantId}',
        'Component'
      );
    } catch (error) {
      if (error instanceof VapiIntegrationError) {
        throw error;
      }

      logger.error('Failed to delete Vapi assistant:', 'Component', error);
      throw new VapiIntegrationError(
        `Failed to delete assistant: ${(error as any)?.message || String(error) || 'Unknown error'}`,
        'DELETION_FAILED',
        500
      );
    }
  }

  /**
   * Get assistant details
   */
  async getAssistant(assistantId: string): Promise<VapiResponse> {
    if (!this.apiKey) {
      throw new VapiIntegrationError(
        'Vapi API key not configured',
        'API_KEY_MISSING',
        500
      );
    }

    try {
      const response = await fetch(`${this.baseURL}/assistant/${assistantId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        const errorData: VapiError = (await response.json()) as any;
        throw new VapiIntegrationError(
          `Vapi API error: ${errorData.error.message}`,
          errorData.error.type || 'API_ERROR',
          response.status
        );
      }

      return (await response.json()) as VapiResponse;
    } catch (error) {
      if (error instanceof VapiIntegrationError) {
        throw error;
      }

      throw new VapiIntegrationError(
        `Failed to get assistant: ${(error as any)?.message || String(error) || 'Unknown error'}`,
        'GET_FAILED',
        500
      );
    }
  }

  /**
   * List all assistants
   */
  async listAssistants(): Promise<VapiResponse[]> {
    if (!this.apiKey) {
      throw new VapiIntegrationError(
        'Vapi API key not configured',
        'API_KEY_MISSING',
        500
      );
    }

    try {
      const response = await fetch(`${this.baseURL}/assistant`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        const errorData: VapiError = (await response.json()) as any;
        throw new VapiIntegrationError(
          `Vapi API error: ${errorData.error.message}`,
          errorData.error.type || 'API_ERROR',
          response.status
        );
      }

      return (await response.json()) as VapiResponse[];
    } catch (error) {
      if (error instanceof VapiIntegrationError) {
        throw error;
      }

      throw new VapiIntegrationError(
        `Failed to list assistants: ${(error as any)?.message || String(error) || 'Unknown error'}`,
        'LIST_FAILED',
        500
      );
    }
  }

  // ============================================
  // Helper Methods
  // ============================================

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.listAssistants();
      return true;
    } catch (error) {
      logger.error('Vapi API connection test failed:', 'Component', error);
      return false;
    }
  }

  /**
   * Get service health status
   */
  async getServiceHealth(): Promise<{
    status: string;
    apiKey: boolean;
    connection: boolean;
  }> {
    const hasApiKey = !!this.apiKey;
    let connectionStatus = false;

    if (hasApiKey) {
      connectionStatus = await this.testConnection();
    }

    return {
      status: hasApiKey && connectionStatus ? 'healthy' : 'degraded',
      apiKey: hasApiKey,
      connection: connectionStatus,
    };
  }
}

// ============================================
// Assistant Generator Service
// ============================================

export class AssistantGeneratorService {
  private vapiService: VapiIntegrationService;
  private knowledgeGenerator: KnowledgeBaseGenerator;

  constructor() {
    this.vapiService = new VapiIntegrationService();
    this.knowledgeGenerator = new KnowledgeBaseGenerator();
  }

  /**
   * Generate a complete Vapi assistant for a hotel
   */
  async generateAssistant(
    hotelData: BasicHotelData | AdvancedHotelData,
    customization: AssistantCustomization
  ): Promise<string> {
    try {
      logger.debug(
        '🏨 Generating assistant for: ${hotelData.name}',
        'Component'
      );

      // 1. Generate knowledge base
      // const _knowledgeBase =
      //   this.knowledgeGenerator.generateKnowledgeBase(hotelData);

      // 2. Build system prompt
      const systemPrompt = this.knowledgeGenerator.generateSystemPrompt(
        hotelData,
        customization
      );

      // 3. Generate functions based on hotel services
      const functions = this.generateFunctions(hotelData.services);

      // 4. Build assistant configuration
      const assistantConfig: VapiAssistantConfig = {
        name: `${hotelData.name} AI Concierge`,
        hotelName: hotelData.name,
        systemPrompt,
        voiceId: customization.voiceId || 'jennifer',
        model: {
          provider: 'openai',
          model: 'gpt-4',
          temperature: customization.personality === 'friendly' ? 0.8 : 0.7,
        },
        functions,
        firstMessage: this.generateFirstMessage(hotelData, customization),
        silenceTimeoutSeconds: customization.silenceTimeout || 30,
        maxDurationSeconds: customization.maxDuration || 1800,
        backgroundSound: customization.backgroundSound || 'hotel-lobby',
      };

      // 5. Create assistant via Vapi API
      const assistantId =
        await this.vapiService.createAssistant(assistantConfig);

      logger.debug(
        '✅ Assistant generated successfully for ${hotelData.name}: ${assistantId}',
        'Component'
      );
      return assistantId;
    } catch (error) {
      logger.error(
        'Failed to generate assistant for ${hotelData.name}:',
        'Component',
        error
      );
      throw new VapiIntegrationError(
        `Failed to generate assistant: ${(error as any)?.message || String(error) || 'Unknown error'}`,
        'GENERATION_FAILED',
        500
      );
    }
  }

  /**
   * Update existing assistant with new data
   */
  async updateAssistant(
    assistantId: string,
    hotelData: BasicHotelData | AdvancedHotelData,
    customization: AssistantCustomization
  ): Promise<void> {
    try {
      logger.debug(
        '🔄 Updating assistant ${assistantId} for: ${hotelData.name}',
        'Component'
      );

      // const _knowledgeBase =
      //   this.knowledgeGenerator.generateKnowledgeBase(hotelData);
      const systemPrompt = this.knowledgeGenerator.generateSystemPrompt(
        hotelData,
        customization
      );
      const functions = this.generateFunctions(hotelData.services);

      const updateConfig: Partial<VapiAssistantConfig> = {
        systemPrompt,
        functions,
        firstMessage: this.generateFirstMessage(hotelData, customization),
        voiceId: customization.voiceId,
        silenceTimeoutSeconds: customization.silenceTimeout,
        maxDurationSeconds: customization.maxDuration,
        backgroundSound: customization.backgroundSound,
      };

      await this.vapiService.updateAssistant(assistantId, updateConfig);
      logger.debug(
        '✅ Assistant updated successfully: ${assistantId}',
        'Component'
      );
    } catch (error) {
      logger.error(
        'Failed to update assistant ${assistantId}:',
        'Component',
        error
      );
      throw new VapiIntegrationError(
        `Failed to update assistant: ${(error as any)?.message || String(error) || 'Unknown error'}`,
        'UPDATE_FAILED',
        500
      );
    }
  }

  // ============================================
  // Dynamic Function Generation
  // ============================================

  /**
   * Generate Vapi functions based on hotel services
   */
  private generateFunctions(services: HotelService[]): VapiFunction[] {
    const functions: VapiFunction[] = [];

    // Core function always included
    functions.push({
      name: 'get_hotel_info',
      description:
        'Get basic hotel information such as hours, contact details, location, and amenities',
      parameters: {
        type: 'object',
        properties: {
          info_type: {
            type: 'string',
            enum: ['hours', 'contact', 'location', 'amenities', 'policies'],
            description: 'Type of information requested',
          },
        },
        required: ['info_type'],
      },
      async: false,
    });

    // Dynamic functions based on available services
    const serviceTypes = services.map(s => s.type);

    // Room Service Function
    if (serviceTypes.includes('room_service')) {
      functions.push({
        name: 'order_room_service',
        description:
          'Order room service for hotel guests including food, drinks, and amenities',
        parameters: {
          type: 'object',
          properties: {
            room_number: { type: 'string', description: 'Guest room number' },
            guest_name: {
              type: 'string',
              description: 'Guest name for the order',
            },
            items: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of items to order',
            },
            delivery_time: {
              type: 'string',
              enum: ['asap', '30min', '1hour', 'specific'],
              description: 'Preferred delivery time',
            },
            specific_time: {
              type: 'string',
              description: 'Specific delivery time if selected',
            },
            special_instructions: {
              type: 'string',
              description: 'Any special instructions',
            },
          },
          required: ['room_number', 'guest_name', 'items', 'delivery_time'],
        },
        async: true,
      });
    }

    // Housekeeping Function
    if (serviceTypes.includes('housekeeping')) {
      functions.push({
        name: 'request_housekeeping',
        description:
          'Request housekeeping services including cleaning, towels, amenities',
        parameters: {
          type: 'object',
          properties: {
            room_number: { type: 'string', description: 'Guest room number' },
            service_type: {
              type: 'string',
              enum: ['cleaning', 'towels', 'amenities', 'maintenance', 'other'],
              description: 'Type of housekeeping service',
            },
            priority: {
              type: 'string',
              enum: ['normal', 'urgent'],
              description: 'Service priority level',
            },
            description: {
              type: 'string',
              description: 'Detailed description of the request',
            },
          },
          required: ['room_number', 'service_type'],
        },
        async: true,
      });
    }

    // Transportation Function
    if (serviceTypes.includes('transportation')) {
      functions.push({
        name: 'book_transportation',
        description:
          'Book transportation services including taxi, shuttle, airport transfer',
        parameters: {
          type: 'object',
          properties: {
            room_number: { type: 'string', description: 'Guest room number' },
            guest_name: {
              type: 'string',
              description: 'Guest name for booking',
            },
            transport_type: {
              type: 'string',
              enum: ['taxi', 'shuttle', 'airport_transfer', 'private_car'],
              description: 'Type of transportation',
            },
            pickup_time: { type: 'string', description: 'Pickup time' },
            destination: { type: 'string', description: 'Destination address' },
            passengers: { type: 'string', description: 'Number of passengers' },
            special_requests: {
              type: 'string',
              description: 'Any special requests',
            },
          },
          required: [
            'room_number',
            'guest_name',
            'transport_type',
            'pickup_time',
            'destination',
          ],
        },
        async: true,
      });
    }

    // Spa/Wellness Function
    if (serviceTypes.includes('spa')) {
      functions.push({
        name: 'book_spa_service',
        description:
          'Book spa and wellness services including massage, treatments',
        parameters: {
          type: 'object',
          properties: {
            room_number: { type: 'string', description: 'Guest room number' },
            guest_name: {
              type: 'string',
              description: 'Guest name for booking',
            },
            service_type: {
              type: 'string',
              enum: ['massage', 'facial', 'wellness', 'fitness', 'other'],
              description: 'Type of spa service',
            },
            preferred_time: {
              type: 'string',
              description: 'Preferred appointment time',
            },
            duration: { type: 'string', description: 'Service duration' },
            special_requests: {
              type: 'string',
              description: 'Any special requests or preferences',
            },
          },
          required: [
            'room_number',
            'guest_name',
            'service_type',
            'preferred_time',
          ],
        },
        async: true,
      });
    }

    // Concierge Function
    if (serviceTypes.includes('concierge')) {
      functions.push({
        name: 'concierge_request',
        description:
          'General concierge services including reservations, recommendations, bookings',
        parameters: {
          type: 'object',
          properties: {
            room_number: { type: 'string', description: 'Guest room number' },
            request_type: {
              type: 'string',
              enum: [
                'restaurant_reservation',
                'attraction_booking',
                'recommendation',
                'tickets',
                'other',
              ],
              description: 'Type of concierge request',
            },
            details: {
              type: 'string',
              description: 'Detailed description of the request',
            },
            preferred_time: {
              type: 'string',
              description: 'Preferred time if applicable',
            },
            budget_range: {
              type: 'string',
              description: 'Budget range if applicable',
            },
          },
          required: ['room_number', 'request_type', 'details'],
        },
        async: true,
      });
    }

    // Connect to Staff Function (always available)
    functions.push({
      name: 'connect_to_staff',
      description:
        'Connect guest to human staff for complex requests or when AI cannot help',
      parameters: {
        type: 'object',
        properties: {
          room_number: { type: 'string', description: 'Guest room number' },
          urgency: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'emergency'],
            description: 'Urgency level of the request',
          },
          reason: {
            type: 'string',
            description: 'Reason for connecting to staff',
          },
          department: {
            type: 'string',
            enum: [
              'front_desk',
              'housekeeping',
              'maintenance',
              'concierge',
              'management',
            ],
            description: 'Preferred department to connect with',
          },
        },
        required: ['room_number', 'reason'],
      },
      async: false,
    });

    return functions;
  }

  /**
   * Generate personalized first message
   */
  private generateFirstMessage(
    hotelData: BasicHotelData,
    customization: AssistantCustomization
  ): string {
    const timeGreeting = this.getTimeBasedGreeting();
    const personalityTouch = this.getPersonalityTouch(
      customization.personality
    );

    return `${timeGreeting} Welcome to ${hotelData.name}! ${personalityTouch} How may I assist you today?`;
  }

  /**
   * Get time-based greeting
   */
  private getTimeBasedGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good morning!';
    }
    if (hour < 18) {
      return 'Good afternoon!';
    }
    return 'Good evening!';
  }

  /**
   * Get personality-specific touch
   */
  private getPersonalityTouch(personality: string): string {
    switch (personality) {
      case 'luxurious':
        return 'It would be my absolute pleasure to provide you with exceptional service.';
      case 'friendly':
        return "I'm here to make your stay wonderful!";
      case 'professional':
        return 'I am here to assist you with any inquiries or requests.';
      case 'casual':
        return "I'm here to help make your stay awesome!";
      default:
        return 'I am here to assist you with any inquiries or requests.';
    }
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Validate assistant configuration
   */
  static validateAssistantConfig(config: VapiAssistantConfig): void {
    const schema = z.object({
      name: z.string().min(1),
      hotelName: z.string().min(1),
      systemPrompt: z.string().min(10),
      functions: z.array(z.any()).min(1),
    });

    schema.parse(config);
  }

  /**
   * Get service health
   */
  async getServiceHealth(): Promise<{
    status: string;
    vapiConnection: boolean;
    assistantGeneration: boolean;
  }> {
    const vapiHealth = await this.vapiService.getServiceHealth();

    return {
      status: vapiHealth.status,
      vapiConnection: vapiHealth.connection,
      assistantGeneration: vapiHealth.connection && vapiHealth.apiKey,
    };
  }
}

// ============================================
// Export Services & Types
// ============================================

export default {
  VapiIntegrationService,
  AssistantGeneratorService,
  VapiIntegrationError,
};
