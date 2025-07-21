import { z } from 'zod';

// ============================================================================
// AUTHENTICATION SCHEMAS
// ============================================================================

export const LoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  tenantId: z.string().uuid().optional(),
});

export const RegisterSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  email: z.string().email('Invalid email format'),
  role: z.enum(['admin', 'staff', 'manager']).default('staff'),
  tenantId: z.string().uuid(),
});

export const RefreshTokenSchema = z.object({
  token: z.string().min(1, 'Refresh token is required'),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// ============================================================================
// CALL MANAGEMENT SCHEMAS
// ============================================================================

export const StartCallSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required'),
  language: z.enum(['en', 'fr', 'zh', 'ru', 'ko', 'vi'], {
    errorMap: () => ({ message: 'Invalid language code' }),
  }),
  serviceType: z.string().optional(),
  tenantId: z.string().uuid(),
});

export const EndCallSchema = z.object({
  callId: z.string().uuid('Invalid call ID'),
  duration: z.number().min(0, 'Duration must be positive'),
  tenantId: z.string().uuid(),
});

export const CallQuerySchema = z.object({
  page: z.number().min(1, 'Page must be at least 1').default(1),
  limit: z
    .number()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(20),
  sortBy: z
    .enum(['startTime', 'endTime', 'duration', 'roomNumber'])
    .default('startTime'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  roomNumber: z.string().optional(),
  language: z.enum(['en', 'fr', 'zh', 'ru', 'ko', 'vi']).optional(),
  serviceType: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const CallIdSchema = z.object({
  id: z.string().uuid('Invalid call ID'),
});

// ============================================================================
// TRANSCRIPT SCHEMAS
// ============================================================================

export const TranscriptSchema = z.object({
  callId: z.string().min(1, 'Call ID is required'),
  role: z.enum(['user', 'assistant'], {
    errorMap: () => ({ message: 'Role must be user or assistant' }),
  }),
  content: z.string().min(1, 'Content is required'),
  tenantId: z.string().uuid(),
});

export const TranscriptQuerySchema = z.object({
  callId: z.string().min(1, 'Call ID is required'),
});

// ============================================================================
// ORDER/REQUEST SCHEMAS
// ============================================================================

export const CreateOrderSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required'),
  orderId: z.string().min(1, 'Order ID is required'),
  requestContent: z.string().min(1, 'Request content is required'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  estimatedTime: z.number().min(0).optional(),
  tenantId: z.string().uuid(),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'in-progress', 'completed', 'cancelled'], {
    errorMap: () => ({ message: 'Invalid order status' }),
  }),
  notes: z.string().optional(),
  completedAt: z.string().datetime().optional(),
  tenantId: z.string().uuid(),
});

export const OrderQuerySchema = z.object({
  page: z.number().min(1, 'Page must be at least 1').default(1),
  limit: z
    .number()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(20),
  status: z
    .enum(['pending', 'in-progress', 'completed', 'cancelled'])
    .optional(),
  roomNumber: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const OrderIdSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
});

// ============================================================================
// MESSAGE SCHEMAS
// ============================================================================

export const CreateMessageSchema = z.object({
  requestId: z.number().min(1, 'Request ID is required'),
  sender: z.string().min(1, 'Sender is required'),
  content: z.string().min(1, 'Content is required'),
  messageType: z.enum(['text', 'image', 'file']).default('text'),
  tenantId: z.string().uuid(),
});

export const MessageQuerySchema = z.object({
  requestId: z.number().min(1, 'Request ID is required'),
});

// ============================================================================
// HOTEL MANAGEMENT SCHEMAS
// ============================================================================

export const HotelResearchSchema = z.object({
  hotelName: z.string().min(1, 'Hotel name is required'),
  location: z.string().min(1, 'Location is required'),
  researchDepth: z
    .enum(['basic', 'detailed', 'comprehensive'])
    .default('basic'),
});

export const GenerateAssistantSchema = z.object({
  hotelData: z.object({
    name: z.string().min(1, 'Hotel name is required'),
    address: z.string().min(1, 'Address is required'),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
    description: z.string().optional(),
    amenities: z.array(z.string()).optional(),
    roomTypes: z
      .array(
        z.object({
          name: z.string(),
          description: z.string(),
          price: z.number(),
          capacity: z.number(),
          amenities: z.array(z.string()),
        })
      )
      .optional(),
    services: z
      .array(
        z.object({
          name: z.string(),
          description: z.string(),
          category: z.string(),
          price: z.number(),
          availability: z.string(),
        })
      )
      .optional(),
    policies: z
      .object({
        checkIn: z.string(),
        checkOut: z.string(),
        cancellation: z.string(),
        pets: z.boolean(),
        smoking: z.boolean(),
      })
      .optional(),
  }),
  customization: z.object({
    voice: z
      .object({
        gender: z.enum(['male', 'female']),
        accent: z.string().optional(),
        speed: z.number().min(0.5).max(2.0).default(1.0),
      })
      .optional(),
    personality: z
      .object({
        tone: z
          .enum(['professional', 'friendly', 'formal', 'casual'])
          .default('professional'),
        style: z.string().optional(),
        language: z.string().default('en'),
      })
      .optional(),
    capabilities: z.object({
      languages: z
        .array(z.string())
        .min(1, 'At least one language is required'),
      services: z.array(z.string()).optional(),
      features: z.array(z.string()).optional(),
    }),
  }),
});

export const UpdateHotelConfigSchema = z.object({
  assistantConfig: z
    .object({
      personality: z
        .enum(['friendly', 'professional', 'formal', 'casual'])
        .optional(),
      voiceId: z.string().optional(),
      languages: z.array(z.string()).optional(),
      customPrompt: z.string().optional(),
    })
    .optional(),
  servicesConfig: z
    .object({
      roomService: z.boolean().default(true),
      housekeeping: z.boolean().default(true),
      concierge: z.boolean().default(true),
      spa: z.boolean().default(false),
      restaurant: z.boolean().default(false),
      transportation: z.boolean().default(false),
    })
    .optional(),
  knowledgeBase: z.string().optional(),
  systemPrompt: z.string().optional(),
});

export const HotelProfileSchema = z.object({
  tenantId: z.string().uuid(),
});

// ============================================================================
// ANALYTICS SCHEMAS
// ============================================================================

export const AnalyticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  granularity: z
    .enum(['hourly', 'daily', 'weekly', 'monthly'])
    .default('daily'),
  tenantId: z.string().uuid(),
});

export const ServiceDistributionSchema = z.object({
  tenantId: z.string().uuid(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const HourlyActivitySchema = z.object({
  tenantId: z.string().uuid(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// ============================================================================
// TENANT MANAGEMENT SCHEMAS
// ============================================================================

export const CreateTenantSchema = z.object({
  hotelName: z.string().min(1, 'Hotel name is required'),
  subdomain: z
    .string()
    .min(1, 'Subdomain is required')
    .regex(
      /^[a-z0-9-]+$/,
      'Subdomain can only contain lowercase letters, numbers, and hyphens'
    ),
  customDomain: z.string().url().optional(),
  subscriptionPlan: z
    .enum(['trial', 'basic', 'premium', 'enterprise'])
    .default('trial'),
  maxVoices: z.number().min(1).default(1),
  maxLanguages: z.number().min(1).default(1),
  voiceCloning: z.boolean().default(false),
  multiLocation: z.boolean().default(false),
  whiteLabel: z.boolean().default(false),
  dataRetentionDays: z.number().min(1).max(365).default(30),
  monthlyCallLimit: z.number().min(100).default(1000),
});

export const UpdateTenantSchema = z.object({
  hotelName: z.string().min(1, 'Hotel name is required').optional(),
  customDomain: z.string().url().optional(),
  subscriptionPlan: z
    .enum(['trial', 'basic', 'premium', 'enterprise'])
    .optional(),
  maxVoices: z.number().min(1).optional(),
  maxLanguages: z.number().min(1).optional(),
  voiceCloning: z.boolean().optional(),
  multiLocation: z.boolean().optional(),
  whiteLabel: z.boolean().optional(),
  dataRetentionDays: z.number().min(1).max(365).optional(),
  monthlyCallLimit: z.number().min(100).optional(),
});

export const TenantIdSchema = z.object({
  tenantId: z.string().uuid('Invalid tenant ID'),
});

// ============================================================================
// STAFF MANAGEMENT SCHEMAS
// ============================================================================

export const CreateStaffSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  email: z.string().email('Invalid email format'),
  role: z.enum(['admin', 'staff', 'manager']).default('staff'),
  tenantId: z.string().uuid(),
});

export const UpdateStaffSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .optional(),
  email: z.string().email('Invalid email format').optional(),
  role: z.enum(['admin', 'staff', 'manager']).optional(),
  isActive: z.boolean().optional(),
});

export const StaffIdSchema = z.object({
  staffId: z.number().min(1, 'Staff ID is required'),
});

// ============================================================================
// PAGINATION SCHEMAS
// ============================================================================

export const PaginationSchema = z.object({
  page: z.number().min(1, 'Page must be at least 1').default(1),
  limit: z
    .number()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================================================
// FILE UPLOAD SCHEMAS
// ============================================================================

export const FileUploadSchema = z.object({
  file: z
    .object({
      name: z.string(),
      size: z.number(),
      type: z.string(),
    })
    .refine(
      file => {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'application/pdf',
          'text/plain',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        return file.size <= maxSize && allowedTypes.includes(file.type);
      },
      {
        message: 'File must be an image, PDF, or document under 10MB',
      }
    ),
  category: z.enum(['menu', 'policy', 'amenity', 'service']),
  tenantId: z.string().uuid(),
});

// ============================================================================
// WEBHOOK SCHEMAS
// ============================================================================

export const WebhookSchema = z.object({
  url: z.string().url('Invalid webhook URL'),
  events: z.array(
    z.enum([
      'call.started',
      'call.ended',
      'order.created',
      'order.updated',
      'transcript.created',
      'error.occurred',
    ])
  ),
  secret: z.string().min(16, 'Webhook secret must be at least 16 characters'),
  isActive: z.boolean().default(true),
  tenantId: z.string().uuid(),
});

// ============================================================================
// EXPORT ALL SCHEMAS
// ============================================================================

export const schemas = {
  // Authentication
  login: LoginSchema,
  register: RegisterSchema,
  refreshToken: RefreshTokenSchema,
  changePassword: ChangePasswordSchema,

  // Calls
  startCall: StartCallSchema,
  endCall: EndCallSchema,
  callQuery: CallQuerySchema,
  callId: CallIdSchema,

  // Transcripts
  transcript: TranscriptSchema,
  transcriptQuery: TranscriptQuerySchema,

  // Orders
  createOrder: CreateOrderSchema,
  updateOrderStatus: UpdateOrderStatusSchema,
  orderQuery: OrderQuerySchema,
  orderId: OrderIdSchema,

  // Messages
  createMessage: CreateMessageSchema,
  messageQuery: MessageQuerySchema,

  // Hotel Management
  hotelResearch: HotelResearchSchema,
  generateAssistant: GenerateAssistantSchema,
  updateHotelConfig: UpdateHotelConfigSchema,
  hotelProfile: HotelProfileSchema,

  // Analytics
  analyticsQuery: AnalyticsQuerySchema,
  serviceDistribution: ServiceDistributionSchema,
  hourlyActivity: HourlyActivitySchema,

  // Tenant Management
  createTenant: CreateTenantSchema,
  updateTenant: UpdateTenantSchema,
  tenantId: TenantIdSchema,

  // Staff Management
  createStaff: CreateStaffSchema,
  updateStaff: UpdateStaffSchema,
  staffId: StaffIdSchema,

  // Pagination
  pagination: PaginationSchema,

  // File Upload
  fileUpload: FileUploadSchema,

  // Webhooks
  webhook: WebhookSchema,
};

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type StartCallInput = z.infer<typeof StartCallSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type HotelResearchInput = z.infer<typeof HotelResearchSchema>;
export type AnalyticsQueryInput = z.infer<typeof AnalyticsQuerySchema>;
