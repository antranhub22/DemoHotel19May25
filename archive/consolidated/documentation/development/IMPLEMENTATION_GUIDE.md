# Implementation Guide

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [Backend Implementation](#backend-implementation)
6. [Frontend Implementation](#frontend-implementation)
7. [Integration Steps](#integration-steps)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

## Overview

This guide provides step-by-step instructions for implementing the Hotel Assistant system. The
implementation follows a modular approach with clear separation of concerns.

### Implementation Phases

1. **Phase 1**: Environment and Database Setup
2. **Phase 2**: Backend Core Implementation
3. **Phase 3**: Frontend Core Implementation
4. **Phase 4**: Integration and Testing
5. **Phase 5**: Deployment and Monitoring

## Prerequisites

### Required Software

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **PostgreSQL** (production) or **SQLite** (development)
- **Docker** (optional, for containerized deployment)

### Required Accounts

- **Vapi.ai** account for voice assistant
- **OpenAI** API key for AI processing
- **Email service** (Gmail, SendGrid, or SMTP)

### System Requirements

- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 10GB minimum
- **Network**: Stable internet connection
- **OS**: Linux, macOS, or Windows

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/hotel-assistant.git
cd hotel-assistant
```

### 2. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Environment Configuration

Create `.env` file in the root directory:

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/hotel_assistant
DATABASE_TYPE=postgresql

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# External Services
VAPI_PUBLIC_KEY=your-vapi-public-key
VAPI_ASSISTANT_ID=your-vapi-assistant-id
OPENAI_API_KEY=your-openai-api-key

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Application Settings
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173

# Frontend Environment
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

### 4. Development Environment

Create `.env.development` for development-specific settings:

```bash
# Development Database
DATABASE_URL=file:./dev.db
DATABASE_TYPE=sqlite

# Development Settings
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_SWAGGER=true
```

## Database Setup

### 1. Database Schema

The application uses Drizzle ORM with automatic migrations.

#### Run Migrations

```bash
# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database with initial data
npm run db:seed
```

#### Manual Database Setup (if needed)

```sql
-- Create database
CREATE DATABASE hotel_assistant;

-- Create user (PostgreSQL)
CREATE USER hotel_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE hotel_assistant TO hotel_user;
```

### 2. Database Configuration

Update `config/database.config.ts`:

```typescript
import { z } from "zod";

const DatabaseSchema = z.object({
  url: z.string().optional(),
  type: z.enum(["postgresql", "sqlite"]).default("sqlite"),
  host: z.string().optional(),
  port: z.number().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  database: z.string().optional(),
});

export const databaseConfig = {
  url: process.env.DATABASE_URL,
  type: process.env.DATABASE_URL ? "postgresql" : "sqlite",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};
```

### 3. Seed Data

Create seed data for development:

```typescript
// scripts/seed.ts
import { db } from "../src/db";
import { tenants, staff, hotelProfiles } from "../src/db/schema";

export async function seedDatabase() {
  // Create default tenant
  const tenant = await db.insert(tenants).values({
    id: "default-tenant-id",
    hotelName: "Mi Nhon Hotel",
    subdomain: "minhon",
    subscriptionPlan: "premium",
    subscriptionStatus: "active",
  });

  // Create default staff user
  await db.insert(staff).values({
    username: "admin",
    password: await bcrypt.hash("admin123", 10),
    role: "admin",
    tenantId: tenant.id,
  });

  // Create hotel profile
  await db.insert(hotelProfiles).values({
    tenantId: tenant.id,
    researchData: {
      /* hotel data */
    },
    assistantConfig: {
      /* assistant config */
    },
    vapiAssistantId: "your-vapi-assistant-id",
  });
}
```

## Backend Implementation

### 1. Project Structure

```
server/
├── index.ts                 # Application entry point
├── routes/                  # API route handlers
│   ├── auth.ts             # Authentication routes
│   ├── calls.ts            # Call management routes
│   ├── orders.ts           # Order management routes
│   ├── analytics.ts        # Analytics routes
│   └── health.ts           # Health check routes
├── services/               # Business logic services
│   ├── authService.ts      # Authentication service
│   ├── callService.ts      # Call management service
│   ├── orderService.ts     # Order processing service
│   ├── hotelService.ts     # Hotel research service
│   ├── analyticsService.ts # Analytics service
│   └── emailService.ts     # Email service
├── middleware/             # Express middleware
│   ├── auth.ts            # Authentication middleware
│   ├── tenant.ts          # Multi-tenancy middleware
│   └── validation.ts      # Request validation
├── models/                 # Database models
├── utils/                  # Utility functions
└── config/                 # Configuration files
```

### 2. Core Services Implementation

#### Authentication Service

```typescript
// services/authService.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { staff } from "../db/schema";

export class AuthService {
  async login(username: string, password: string, tenantId?: string) {
    const user = await db.query.staff.findFirst({
      where: (staff, { eq, and }) =>
        and(
          eq(staff.username, username),
          tenantId ? eq(staff.tenantId, tenantId) : undefined,
        ),
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, tenantId: user.tenantId },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    return { token, user };
  }

  async verifyToken(token: string) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
}
```

#### Call Service

```typescript
// services/callService.ts
import { db } from "../db";
import { call, transcript } from "../db/schema";
import { VapiClient } from "../utils/vapiClient";

export class CallService {
  private vapiClient = new VapiClient();

  async startCall(data: {
    roomNumber: string;
    language: string;
    serviceType?: string;
    tenantId: string;
  }) {
    // Start Vapi call
    const vapiCall = await this.vapiClient.startCall({
      assistantId: await this.getAssistantId(data.tenantId),
      language: data.language,
    });

    // Save call to database
    const callRecord = await db.insert(call).values({
      callIdVapi: vapiCall.callId,
      roomNumber: data.roomNumber,
      language: data.language,
      serviceType: data.serviceType,
      startTime: new Date(),
      tenantId: data.tenantId,
    });

    return { callId: callRecord.id, vapiCallId: vapiCall.callId };
  }

  async endCall(callId: string, duration: number, tenantId: string) {
    await db
      .update(call)
      .set({
        endTime: new Date(),
        duration,
      })
      .where(eq(call.id, callId));
  }

  async saveTranscript(data: {
    callId: string;
    role: "user" | "assistant";
    content: string;
    tenantId: string;
  }) {
    return await db.insert(transcript).values({
      callId: data.callId,
      role: data.role,
      content: data.content,
      tenantId: data.tenantId,
    });
  }
}
```

#### Order Service

```typescript
// services/orderService.ts
import { db } from "../db";
import { request, message } from "../db/schema";
import { EmailService } from "./emailService";

export class OrderService {
  private emailService = new EmailService();

  async createOrder(data: {
    roomNumber: string;
    orderId: string;
    requestContent: string;
    tenantId: string;
  }) {
    const order = await db.insert(request).values({
      roomNumber: data.roomNumber,
      orderId: data.orderId,
      requestContent: data.requestContent,
      status: "pending",
      tenantId: data.tenantId,
    });

    // Send notification email
    await this.emailService.sendOrderNotification(order);

    return order;
  }

  async updateOrderStatus(orderId: string, status: string, tenantId: string) {
    return await db
      .update(request)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(and(eq(request.orderId, orderId), eq(request.tenantId, tenantId)));
  }
}
```

### 3. API Routes Implementation

#### Authentication Routes

```typescript
// routes/auth.ts
import { Router } from "express";
import { AuthService } from "../services/authService";
import { validateLoginRequest } from "../middleware/validation";

const router = Router();
const authService = new AuthService();

router.post("/login", validateLoginRequest, async (req, res) => {
  try {
    const { username, password, tenantId } = req.body;
    const result = await authService.login(username, password, tenantId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = await authService.verifyToken(token);

    const newToken = jwt.sign(
      {
        userId: decoded.userId,
        role: decoded.role,
        tenantId: decoded.tenantId,
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    res.json({
      success: true,
      data: { token: newToken, expiresIn: 3600 },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
});

export default router;
```

#### Call Routes

```typescript
// routes/calls.ts
import { Router } from "express";
import { CallService } from "../services/callService";
import { authenticateToken } from "../middleware/auth";
import { validateCallRequest } from "../middleware/validation";

const router = Router();
const callService = new CallService();

router.post(
  "/start",
  authenticateToken,
  validateCallRequest,
  async (req, res) => {
    try {
      const result = await callService.startCall({
        ...req.body,
        tenantId: req.user.tenantId,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
);

router.post("/end", authenticateToken, async (req, res) => {
  try {
    const { callId, duration } = req.body;
    await callService.endCall(callId, duration, req.user.tenantId);

    res.json({
      success: true,
      data: { callId, endTime: new Date(), duration },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
```

### 4. Middleware Implementation

#### Authentication Middleware

```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthService } from "../services/authService";

const authService = new AuthService();

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
    tenantId: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Access token required",
    });
  }

  try {
    const decoded = await authService.verifyToken(token);
    req.user = decoded as any;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: "Invalid token",
    });
  }
};
```

#### Multi-tenancy Middleware

```typescript
// middleware/tenant.ts
import { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { tenants } from "../db/schema";

export const injectTenant = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const subdomain = req.headers.host?.split(".")[0];

  if (subdomain) {
    const tenant = await db.query.tenants.findFirst({
      where: (tenants, { eq }) => eq(tenants.subdomain, subdomain),
    });

    if (tenant) {
      req.tenant = tenant;
    }
  }

  next();
};
```

## Frontend Implementation

### 1. Project Structure

```
client/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── dashboard/      # Dashboard components
│   │   └── forms/          # Form components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services
│   ├── context/            # React context providers
│   ├── types/              # TypeScript types
│   ├── utils/              # Utility functions
│   ├── assets/             # Static assets
│   └── styles/             # Global styles
├── public/                 # Public assets
└── index.html              # HTML template
```

### 2. Core Components Implementation

#### API Client

```typescript
// lib/apiClient.ts
import { ApiClient } from "./apiClient";

export const apiClient = new ApiClient({
  baseUrl: import.meta.env.VITE_API_URL || "http://localhost:3000",
  timeout: 30000,
  withCredentials: true,
});

// Set up auth interceptor
apiClient.setToken(localStorage.getItem("token") || "");

// Auto-refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const response = await apiClient.refreshToken(refreshToken);
          localStorage.setItem("token", response.data.token);
          apiClient.setToken(response.data.token);
          return apiClient.request(error.config);
        } catch (refreshError) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
        }
      }
    }
    throw error;
  },
);
```

#### Authentication Context

```typescript
// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../lib/apiClient';

interface AuthContextType {
  user: any;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and set user
      verifyToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await apiClient.login({ username, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      apiClient.setToken(token);
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    apiClient.clearToken();
    setUser(null);
  };

  const verifyToken = async () => {
    try {
      // Verify token with backend
      const response = await apiClient.get('/auth/verify');
      setUser(response.data.user);
    } catch (error) {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

#### Dashboard Component

```typescript
// components/dashboard/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/apiClient';
import { MetricCard } from './MetricCard';
import { AnalyticsChart } from './AnalyticsChart';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await apiClient.getAnalytics(user.tenantId);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <div className="metrics-grid">
        <MetricCard
          title="Total Calls"
          value={analytics?.overview?.totalCalls || 0}
          change={10}
          changeType="increase"
        />
        <MetricCard
          title="Average Duration"
          value={`${analytics?.overview?.averageDuration || 0}s`}
          change={-5}
          changeType="decrease"
        />
        <MetricCard
          title="Total Orders"
          value={analytics?.overview?.totalOrders || 0}
          change={15}
          changeType="increase"
        />
      </div>

      <div className="charts-grid">
        <AnalyticsChart
          title="Service Distribution"
          data={analytics?.serviceTypeDistribution || []}
          type="pie"
        />
        <AnalyticsChart
          title="Hourly Activity"
          data={analytics?.hourlyActivity || []}
          type="line"
        />
      </div>
    </div>
  );
};
```

### 3. WebSocket Integration

```typescript
// hooks/useWebSocket.ts
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

export const useWebSocket = () => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (user) {
      socketRef.current = io(
        import.meta.env.VITE_WS_URL || "ws://localhost:3000",
        {
          auth: {
            token: localStorage.getItem("token"),
          },
        },
      );

      socketRef.current.emit("init", {
        tenantId: user.tenantId,
      });

      socketRef.current.on("transcript", (data) => {
        console.log("Transcript received:", data);
        // Handle transcript updates
      });

      socketRef.current.on("order_status_update", (data) => {
        console.log("Order update received:", data);
        // Handle order status updates
      });

      socketRef.current.on("error", (data) => {
        console.error("WebSocket error:", data);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  const sendTranscript = (content: string, role: "user" | "assistant") => {
    if (socketRef.current) {
      socketRef.current.emit("transcript", { content, role });
    }
  };

  const endCall = (callId: string, duration: number) => {
    if (socketRef.current) {
      socketRef.current.emit("call_end", { callId, duration });
    }
  };

  return { sendTranscript, endCall };
};
```

## Integration Steps

### 1. Backend-Frontend Integration

#### CORS Configuration

```typescript
// server/index.ts
import cors from "cors";

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);
```

#### API Route Integration

```typescript
// server/index.ts
import authRoutes from "./routes/auth";
import callRoutes from "./routes/calls";
import orderRoutes from "./routes/orders";
import analyticsRoutes from "./routes/analytics";

app.use("/auth", authRoutes);
app.use("/calls", callRoutes);
app.use("/orders", orderRoutes);
app.use("/analytics", analyticsRoutes);
```

### 2. External Service Integration

#### Vapi.ai Integration

```typescript
// utils/vapiClient.ts
import { Vapi } from "@vapi-ai/web";

export class VapiClient {
  private vapi: Vapi;

  constructor() {
    this.vapi = new Vapi({
      apiKey: process.env.VAPI_PUBLIC_KEY!,
    });
  }

  async startCall(params: { assistantId: string; language: string }) {
    const call = await this.vapi.start({
      assistantId: params.assistantId,
      language: params.language,
    });

    return {
      callId: call.id,
      status: call.status,
    };
  }

  async endCall(callId: string) {
    await this.vapi.stop(callId);
  }
}
```

#### OpenAI Integration

```typescript
// utils/openaiClient.ts
import OpenAI from "openai";

export class OpenAIClient {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }

  async generateResponse(messages: any[]) {
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  }
}
```

### 3. Database Integration

#### Connection Setup

```typescript
// db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { drizzle as drizzleSQLite } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

const databaseConfig = {
  url: process.env.DATABASE_URL,
  type: process.env.DATABASE_URL ? "postgresql" : "sqlite",
};

let db: any;

if (databaseConfig.type === "postgresql") {
  const client = postgres(databaseConfig.url!);
  db = drizzle(client);
} else {
  const sqlite = new Database("dev.db");
  db = drizzleSQLite(sqlite);
}

export { db };
```

## Testing

### 1. Unit Testing

#### Backend Tests

```typescript
// tests/unit/services/authService.test.ts
import { AuthService } from "../../services/authService";
import { db } from "../../db";

describe("AuthService", () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe("login", () => {
    it("should authenticate valid credentials", async () => {
      const result = await authService.login("admin", "admin123");
      expect(result.token).toBeDefined();
      expect(result.user.username).toBe("admin");
    });

    it("should reject invalid credentials", async () => {
      await expect(authService.login("admin", "wrongpassword")).rejects.toThrow(
        "Invalid credentials",
      );
    });
  });
});
```

#### Frontend Tests

```typescript
// tests/unit/components/Dashboard.test.tsx
import { render, screen } from '@testing-library/react';
import { Dashboard } from '../../components/dashboard/Dashboard';
import { AuthProvider } from '../../context/AuthContext';

describe('Dashboard', () => {
  it('should render dashboard with metrics', () => {
    render(
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Total Calls')).toBeInTheDocument();
  });
});
```

### 2. Integration Testing

```typescript
// tests/integration/api.test.ts
import request from "supertest";
import { app } from "../../server";

describe("API Integration Tests", () => {
  let authToken: string;

  beforeAll(async () => {
    const loginResponse = await request(app).post("/auth/login").send({
      username: "admin",
      password: "admin123",
    });

    authToken = loginResponse.body.data.token;
  });

  describe("Calls API", () => {
    it("should start a call", async () => {
      const response = await request(app)
        .post("/calls/start")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          roomNumber: "101",
          language: "en",
          serviceType: "room-service",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.callId).toBeDefined();
    });
  });
});
```

### 3. E2E Testing

```typescript
// tests/e2e/user-flow.test.ts
import { test, expect } from "@playwright/test";

test("Complete user flow", async ({ page }) => {
  // Login
  await page.goto("/login");
  await page.fill('[data-testid="username"]', "admin");
  await page.fill('[data-testid="password"]', "admin123");
  await page.click('[data-testid="login-button"]');

  // Navigate to dashboard
  await expect(page).toHaveURL("/dashboard");
  await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();

  // Start a call
  await page.click('[data-testid="start-call-button"]');
  await expect(page.locator('[data-testid="call-interface"]')).toBeVisible();

  // End call
  await page.click('[data-testid="end-call-button"]');
  await expect(page.locator('[data-testid="call-summary"]')).toBeVisible();
});
```

## Deployment

### 1. Production Environment

#### Environment Variables

```bash
# Production .env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/hotel_assistant
JWT_SECRET=your-production-jwt-secret
VAPI_PUBLIC_KEY=your-production-vapi-key
OPENAI_API_KEY=your-production-openai-key
EMAIL_SERVICE=sendgrid
EMAIL_USER=your-production-email
EMAIL_PASS=your-production-email-password
CORS_ORIGIN=https://your-domain.com
```

#### Build Process

```bash
# Build frontend
cd client
npm run build

# Build backend
npm run build

# Start production server
npm start
```

### 2. Docker Deployment

#### Dockerfile

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

#### Docker Compose

```yaml
# docker-compose.yml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db:5432/hotel_assistant
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=hotel_assistant
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 3. Monitoring and Logging

#### Application Monitoring

```typescript
// utils/monitoring.ts
import winston from "winston";

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}
```

## Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Check database connection
npm run db:check

# Reset database
npm run db:reset

# Run migrations
npm run db:migrate
```

#### Authentication Issues

```bash
# Check JWT secret
echo $JWT_SECRET

# Verify token
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/auth/verify
```

#### External Service Issues

```bash
# Test Vapi connection
npm run test:vapi

# Test OpenAI connection
npm run test:openai

# Test email service
npm run test:email
```

### Debug Mode

```bash
# Enable debug logging
LOG_LEVEL=debug npm start

# Enable detailed error messages
NODE_ENV=development DEBUG=* npm start
```

### Performance Optimization

#### Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_calls_tenant_id ON calls(tenant_id);
CREATE INDEX idx_transcripts_call_id ON transcripts(call_id);
CREATE INDEX idx_requests_tenant_id ON requests(tenant_id);
```

#### Caching

```typescript
// utils/cache.ts
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

export const cache = {
  async get(key: string) {
    return await redis.get(key);
  },

  async set(key: string, value: string, ttl?: number) {
    if (ttl) {
      await redis.setex(key, ttl, value);
    } else {
      await redis.set(key, value);
    }
  },
};
```

This implementation guide provides a comprehensive roadmap for building and deploying the Hotel
Assistant system. Follow the steps sequentially and test each component thoroughly before moving to
the next phase.
