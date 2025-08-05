# Hotel Assistant Architecture Documentation

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Database Design](#database-design)
5. [API Design](#api-design)
6. [Frontend Architecture](#frontend-architecture)
7. [Backend Architecture](#backend-architecture)
8. [Multi-tenancy](#multi-tenancy)
9. [Security](#security)
10. [Deployment](#deployment)

## Overview

The Hotel Assistant is a comprehensive voice-enabled hotel management system that provides:

- Multi-language voice assistant integration via Vapi.ai
- Real-time call management and transcript processing
- Order and service request management
- Staff dashboard with analytics
- Multi-tenant architecture for multiple hotels

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   Services      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WebSocket     │    │   Database      │    │   Vapi.ai       │
│   Connection    │    │   (SQLite/PG)   │    │   OpenAI        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                          │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Components    │   Services      │   Context & Hooks          │
│   - UI          │   - API Client  │   - State Management       │
│   - Forms       │   - WebSocket   │   - Authentication         │
│   - Charts      │   - Utils       │   - Internationalization   │
└─────────────────┴─────────────────┴─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend Layer                           │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Routes        │   Services      │   Middleware               │
│   - API         │   - Business    │   - Authentication         │
│   - WebSocket   │   - External    │   - Validation             │
│   - Health      │   - Database    │   - Multi-tenancy          │
└─────────────────┴─────────────────┴─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Database Layer                            │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Schema        │   Migrations    │   Seed Data                │
│   - Tables      │   - Versioning  │   - Test Data              │
│   - Relations   │   - Rollbacks   │   - Production Data        │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

## Technology Stack

### Frontend

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **React Query** - Data fetching
- **Zustand** - State management
- **Recharts** - Data visualization

### Backend

- **Node.js** - Runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Drizzle ORM** - Database ORM
- **SQLite/PostgreSQL** - Database
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcrypt** - Password hashing

### External Services

- **Vapi.ai** - Voice assistant platform
- **OpenAI** - AI language model
- **Gmail/SendGrid** - Email service

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing
- **Docker** - Containerization

## Database Design

### Core Tables

#### Tenants

```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  hotel_name VARCHAR NOT NULL,
  subdomain VARCHAR UNIQUE NOT NULL,
  custom_domain VARCHAR,
  subscription_plan ENUM('trial', 'basic', 'premium', 'enterprise'),
  subscription_status ENUM('active', 'inactive', 'expired', 'cancelled'),
  trial_ends_at TIMESTAMP,
  max_voices INTEGER DEFAULT 1,
  max_languages INTEGER DEFAULT 1,
  voice_cloning BOOLEAN DEFAULT FALSE,
  multi_location BOOLEAN DEFAULT FALSE,
  white_label BOOLEAN DEFAULT FALSE,
  data_retention_days INTEGER DEFAULT 30,
  monthly_call_limit INTEGER DEFAULT 1000,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Hotel Profiles

```sql
CREATE TABLE hotel_profiles (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  research_data JSONB,
  assistant_config JSONB,
  vapi_assistant_id VARCHAR,
  services_config JSONB,
  knowledge_base TEXT,
  system_prompt TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Calls

```sql
CREATE TABLE calls (
  id UUID PRIMARY KEY,
  call_id_vapi VARCHAR NOT NULL,
  room_number VARCHAR,
  language VARCHAR NOT NULL,
  service_type VARCHAR,
  duration INTEGER,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  tenant_id UUID REFERENCES tenants(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Transcripts

```sql
CREATE TABLE transcripts (
  id SERIAL PRIMARY KEY,
  call_id VARCHAR NOT NULL,
  role ENUM('user', 'assistant') NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_model_output BOOLEAN DEFAULT FALSE,
  tenant_id UUID REFERENCES tenants(id)
);
```

#### Requests (Orders)

```sql
CREATE TABLE requests (
  id SERIAL PRIMARY KEY,
  room_number VARCHAR NOT NULL,
  order_id VARCHAR UNIQUE NOT NULL,
  request_content TEXT NOT NULL,
  status ENUM('pending', 'in-progress', 'completed', 'cancelled'),
  tenant_id UUID REFERENCES tenants(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Messages

```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  request_id INTEGER REFERENCES requests(id),
  sender VARCHAR NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tenant_id UUID REFERENCES tenants(id)
);
```

#### Staff

```sql
CREATE TABLE staff (
  id SERIAL PRIMARY KEY,
  username VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  role ENUM('admin', 'staff', 'manager') DEFAULT 'staff',
  tenant_id UUID REFERENCES tenants(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Database Relationships

```
tenants (1) ──── (1) hotel_profiles
tenants (1) ──── (N) calls
tenants (1) ──── (N) transcripts
tenants (1) ──── (N) requests
tenants (1) ──── (N) messages
tenants (1) ──── (N) staff
calls (1) ──── (N) transcripts
requests (1) ──── (N) messages
```

## API Design

### RESTful Endpoints

#### Authentication

```
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
```

#### Calls

```
POST   /calls/start
POST   /calls/end
GET    /calls/:id
GET    /calls
```

#### Transcripts

```
POST   /transcripts
GET    /transcripts/:callId
GET    /transcripts
```

#### Orders/Requests

```
POST   /orders
GET    /orders
GET    /orders/:id
PATCH  /orders/:id/status
```

#### Messages

```
POST   /messages
GET    /messages/:requestId
```

#### Hotel Management

```
POST   /hotel/research
POST   /hotel/generate-assistant
GET    /hotel/profile/:tenantId
PUT    /hotel/config/:tenantId
```

#### Analytics

```
GET    /analytics/:tenantId
GET    /analytics/:tenantId/service-distribution
GET    /analytics/:tenantId/hourly-activity
```

#### Health

```
GET    /health
GET    /health/detailed
```

### WebSocket Events

#### Client to Server

```typescript
interface ClientEvents {
  init: (data: {
    tenantId: string;
    roomNumber?: string;
    language?: string;
  }) => void;
  transcript: (data: { content: string; role: "user" | "assistant" }) => void;
  call_end: (data: { callId: string; duration: number }) => void;
}
```

#### Server to Client

```typescript
interface ServerEvents {
  transcript: (data: {
    content: string;
    role: "user" | "assistant";
    timestamp: Date;
  }) => void;
  order_status_update: (data: {
    orderId: string;
    status: string;
    roomNumber?: string;
  }) => void;
  call_end: (data: { callId: string; duration: number }) => void;
  error: (data: { message: string; code?: string }) => void;
}
```

## Frontend Architecture

### Component Structure

```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   ├── dashboard/             # Dashboard components
│   ├── forms/                 # Form components
│   └── charts/                # Chart components
├── pages/                     # Page components
├── hooks/                     # Custom React hooks
├── services/                  # API services
├── context/                   # React context providers
├── types/                     # TypeScript type definitions
├── utils/                     # Utility functions
├── assets/                    # Static assets
└── styles/                    # Global styles
```

### State Management

- **React Context** - Global state (authentication, theme, language)
- **React Query** - Server state management
- **Local State** - Component-specific state
- **URL State** - Navigation and routing state

### Data Flow

```
User Action → Component → Hook → Service → API → Database
     ↑                                                      ↓
     └─── WebSocket ←─── Real-time Updates ←─── Backend ←──┘
```

## Backend Architecture

### Service Layer

```
src/
├── routes/                    # API route handlers
├── services/                  # Business logic services
│   ├── authService.ts        # Authentication logic
│   ├── callService.ts        # Call management
│   ├── orderService.ts       # Order processing
│   ├── hotelService.ts       # Hotel research
│   ├── analyticsService.ts   # Analytics processing
│   └── emailService.ts       # Email notifications
├── middleware/                # Express middleware
├── models/                    # Database models
├── utils/                     # Utility functions
└── config/                    # Configuration files
```

### Middleware Stack

1. **CORS** - Cross-origin resource sharing
2. **Helmet** - Security headers
3. **Compression** - Response compression
4. **Body Parser** - Request body parsing
5. **Authentication** - JWT token validation
6. **Multi-tenancy** - Tenant context injection
7. **Validation** - Request data validation
8. **Error Handling** - Global error handling

### Service Communication

```
Route Handler → Service → External API → Database
     ↑              ↓
     └─── Response ←─── Processed Data
```

## Multi-tenancy

### Tenant Isolation

- **Database Level**: All tables include `tenant_id` foreign key
- **Application Level**: Middleware injects tenant context
- **API Level**: All endpoints filter by tenant
- **Frontend Level**: Tenant context in authentication

### Tenant Configuration

```typescript
interface Tenant {
  id: string;
  hotelName: string;
  subdomain: string;
  subscriptionPlan: "trial" | "basic" | "premium" | "enterprise";
  subscriptionStatus: "active" | "inactive" | "expired" | "cancelled";
  maxVoices: number;
  maxLanguages: number;
  voiceCloning: boolean;
  multiLocation: boolean;
  whiteLabel: boolean;
  dataRetentionDays: number;
  monthlyCallLimit: number;
}
```

### Tenant Routing

- **Subdomain-based**: `hotel1.app.com`, `hotel2.app.com`
- **Custom Domain**: `hotel1.com`, `hotel2.com`
- **Path-based**: `app.com/hotel1`, `app.com/hotel2`

## Security

### Authentication

- **JWT Tokens** - Stateless authentication
- **bcrypt** - Password hashing
- **Refresh Tokens** - Token rotation
- **Session Management** - Secure session handling

### Authorization

- **Role-based Access Control (RBAC)**
  - Admin: Full system access
  - Manager: Hotel management access
  - Staff: Limited operational access

### Data Protection

- **Input Validation** - Zod schema validation
- **SQL Injection Prevention** - Parameterized queries
- **XSS Prevention** - Content sanitization
- **CSRF Protection** - Token-based protection

### API Security

- **Rate Limiting** - Request throttling
- **CORS Configuration** - Cross-origin policies
- **Security Headers** - Helmet middleware
- **HTTPS Enforcement** - SSL/TLS encryption

## Deployment

### Environment Configuration

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/db
DATABASE_TYPE=postgresql|sqlite

# Authentication
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h

# External Services
VAPI_PUBLIC_KEY=your-vapi-key
VAPI_ASSISTANT_ID=your-assistant-id
OPENAI_API_KEY=your-openai-key

# Email
EMAIL_SERVICE=gmail|sendgrid|smtp
EMAIL_USER=your-email
EMAIL_PASS=your-password

# Application
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-domain.com
```

### Docker Deployment

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Production Considerations

- **Load Balancing** - Multiple server instances
- **Database Scaling** - Read replicas, connection pooling
- **Caching** - Redis for session storage
- **Monitoring** - Application performance monitoring
- **Logging** - Structured logging with rotation
- **Backup** - Automated database backups
- **SSL/TLS** - HTTPS enforcement
- **CDN** - Static asset delivery

## Performance Optimization

### Frontend

- **Code Splitting** - Lazy loading of components
- **Bundle Optimization** - Tree shaking, minification
- **Caching** - Service worker, browser caching
- **Image Optimization** - WebP format, lazy loading

### Backend

- **Database Indexing** - Optimized query performance
- **Connection Pooling** - Database connection management
- **Caching** - Redis for frequently accessed data
- **Compression** - Gzip response compression

### Monitoring

- **Application Metrics** - Response times, error rates
- **Database Metrics** - Query performance, connection usage
- **Infrastructure Metrics** - CPU, memory, disk usage
- **Business Metrics** - Call volume, order processing

## Development Workflow

### Local Development

1. **Environment Setup** - Install dependencies
2. **Database Setup** - Run migrations, seed data
3. **Service Configuration** - Configure external services
4. **Development Server** - Start frontend and backend
5. **Testing** - Run unit and integration tests

### Code Quality

- **TypeScript** - Static type checking
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Jest** - Unit and integration testing
- **Git Hooks** - Pre-commit validation

### Deployment Pipeline

1. **Code Review** - Pull request validation
2. **Automated Testing** - CI/CD pipeline
3. **Security Scanning** - Vulnerability assessment
4. **Staging Deployment** - Pre-production testing
5. **Production Deployment** - Blue-green deployment
