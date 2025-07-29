# 🚀 Developer Onboarding Guide

Welcome to the **DemoHotel19May** project! This guide will help you get up and running quickly with
our restructured monorepo architecture.

## 🎯 Project Overview

**DemoHotel19May** is an AI-powered voice assistant platform designed specifically for hotels. The
system enables guests to interact with hotel services through natural voice commands, powered by
OpenAI and Vapi.ai integrations.

### 🏗️ Architecture Highlights

- **Monorepo structure** for better code organization
- **TypeScript-first** development
- **React frontend** with modern tooling
- **Node.js backend** with Express
- **Multi-tenant** SaaS architecture
- **Real-time** voice and chat features

## 📋 Prerequisites

Before you begin, ensure you have:

### Required Software

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **npm** v8+ (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **VS Code** (recommended) with extensions:
  - TypeScript and JavaScript Language Features
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - Auto Rename Tag
  - Prettier - Code formatter

### Development Database

- **PostgreSQL** for production-like development
- **SQLite** (included) for quick local development

### API Keys (for full functionality)

- **OpenAI API Key** - For AI features
- **Vapi.ai Keys** - For voice integration
- **Gmail App Password** - For email features (optional)

## 🚀 Quick Setup (5 minutes)

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd DemoHotel19May

# Install all dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration
```

### 2. Environment Configuration

Edit `.env` file with your settings:

```bash
# Minimal setup for local development
DATABASE_URL=                          # Leave empty for SQLite
NODE_ENV=development
PORT=10000
LOG_LEVEL=DEBUG

# Add these for full functionality:
VITE_OPENAI_API_KEY=sk-your-key
VITE_VAPI_PUBLIC_KEY=pk-your-key
VITE_VAPI_ASSISTANT_ID=asst-your-id
```

### 3. Start Development

```bash
# Start the full stack
npm run dev

# In a new terminal, start frontend dev server (optional)
npm run dev:client

# Your app is now running at:
# Backend: http://localhost:10000
# Frontend: http://localhost:3000 (if using dev:client)
```

## 📁 Understanding the Structure

### High-Level Overview

```
DemoHotel19May/
├── apps/                    # 🚀 Applications
├── packages/                # 📦 Shared code
├── tools/                   # 🛠️ Development tools
├── tests/                   # 🧪 Test suites
├── docs/                    # 📚 Documentation
└── assets/                  # 🖼️ Static assets
```

### Detailed Structure

#### `apps/` - Applications

```
apps/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/          # Route components
│   │   ├── services/       # API calls
│   │   ├── hooks/          # Custom hooks
│   │   ├── context/        # React context
│   │   └── utils/          # Client utilities
│   └── public/             # Static assets
└── server/                  # Node.js backend
    ├── routes/             # API endpoints
    ├── services/           # Business logic
    ├── middleware/         # Express middleware
    └── models/             # Data models
```

#### `packages/` - Shared Code

```
packages/
├── shared/                  # Shared utilities
│   ├── db/                 # Database layer
│   ├── utils/              # Common utilities
│   ├── validation/         # Zod schemas
│   └── types/              # Shared types
├── types/                   # Type definitions
└── config/                  # Configuration
```

## 🔧 Development Workflow

### 1. Working with Features

#### Adding a New Component

```bash
# Navigate to components
cd apps/client/src/components/

# Create your component
mkdir MyFeature
cd MyFeature
touch MyFeature.tsx index.ts
```

Example component structure:

```typescript
// MyFeature.tsx
import React from 'react';
import { logger } from '@shared/utils/logger';

interface MyFeatureProps {
  title: string;
}

export default function MyFeature({ title }: MyFeatureProps) {
  const handleClick = () => {
    logger.info('Feature clicked', 'MyFeature', { title });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <button onClick={handleClick}>Click me</button>
    </div>
  );
}

// index.ts
export { default } from './MyFeature';
```

#### Adding a New API Route

```bash
# Navigate to routes
cd apps/server/routes/

# Create your route file
touch myFeature.ts
```

Example route structure:

```typescript
// myFeature.ts
import { Router, Request, Response } from 'express';
import { logger } from '@shared/utils/logger';

const router = Router();

router.get('/my-feature', async (req: Request, res: Response) => {
  try {
    logger.api('My feature endpoint called');

    // Your logic here
    const data = { message: 'Hello from my feature!' };

    res.json(data);
  } catch (error) {
    logger.error('My feature error', 'api', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

### 2. Import Best Practices

#### Use Absolute Imports

```typescript
// ✅ Good
import { Button } from '@/components/ui/button';
import { logger } from '@shared/utils/logger';
import { ApiResponse } from '@types/api';

// ❌ Avoid
import { Button } from '../../../components/ui/button';
import { logger } from '../../../../packages/shared/utils/logger';
```

#### Import Order

```typescript
// 1. External packages
import React from 'react';
import axios from 'axios';

// 2. Internal imports (by hierarchy)
import { Component } from '@/components';
import { utils } from '@shared/utils';
import { service } from '@server/services';

// 3. Type imports
import type { ApiResponse } from '@types/api';
```

### 3. Database Development

#### Schema Changes

```bash
# Make changes to packages/shared/db/schema.ts
# Then generate migration
npm run db:migrate

# Apply to development database
npm run db:setup
```

#### Adding New Tables

```typescript
// packages/shared/db/schema.ts
export const myNewTable = pgTable('my_new_table', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

## 🧪 Testing Your Changes

### Run Tests

```bash
# API tests
npm run test

# Database tests
npm run test:db

# Build test
npm run test:build

# TypeScript validation
npm run typecheck
```

### Manual Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend loads correctly
- [ ] API endpoints respond
- [ ] Database connections work
- [ ] No TypeScript errors
- [ ] Console shows no critical errors

## 🎨 UI Development

### Using TailwindCSS

```typescript
// Component styling
<div className="flex items-center space-x-4 p-6 bg-white rounded-lg shadow-md">
  <div className="text-lg font-semibold text-gray-900">
    Hotel Assistant
  </div>
</div>
```

### Using Radix UI Components

```typescript
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

// Use pre-built components
<Button variant="default" size="lg">
  Book Room
</Button>
```

## 🛠️ Development Tools

### Available Scripts

```bash
# Development
npm run dev                  # Start backend
npm run dev:client          # Start frontend
npm run dev:server          # Backend only

# Building
npm run build               # Build all
npm run build:production    # Optimized build
npm run preview             # Preview build

# Database
npm run db:setup            # Setup schema
npm run db:seed             # Add test data
npm run db:studio           # Visual editor

# Quality
npm run typecheck           # TypeScript check
npm run lint:check          # Code linting
npm run clean               # Clean build
```

### Useful Commands

```bash
# Clean everything and reinstall
./clean-build.sh

# Quick database reset
npm run db:setup && npm run db:seed

# Check bundle size
npm run build:analyze
```

## 🔍 Debugging

### Backend Debugging

```typescript
import { logger } from '@shared/utils/logger';

// Use proper logging
logger.debug('Debug info', 'context', { data });
logger.info('General info', 'context');
logger.warn('Warning', 'context');
logger.error('Error occurred', 'context', error);

// Semantic logging
logger.database('Database operation');
logger.api('API call');
logger.email('Email sent');
```

### Frontend Debugging

```typescript
// React DevTools recommended
// Use browser developer tools
// Check network tab for API calls
```

### Common Issues & Solutions

#### Port Already in Use

```bash
# Kill process on port 10000
lsof -ti:10000 | xargs kill -9

# Or use different port
PORT=10001 npm run dev
```

#### TypeScript Errors

```bash
# Check for errors
npm run typecheck

# Common fixes:
# - Check import paths
# - Verify types are exported
# - Check tsconfig.json paths
```

#### Database Connection Issues

```bash
# Reset database
npm run db:setup

# Check environment variables
echo $DATABASE_URL

# Use SQLite for development
# (leave DATABASE_URL empty)
```

## 📚 Learning Resources

### Project Documentation

- [Architecture Guide](./ARCHITECTURE.md) - System overview
- [API Documentation](./API_DOCUMENTATION.md) - API reference
- [Code Review Guide](./CODE_REVIEW_GUIDE.md) - Coding standards

### External Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Vite Guide](https://vitejs.dev/guide/)

## 🤝 Getting Help

### When You're Stuck

1. **Check logs** - Look for error messages
2. **Read documentation** - Check relevant docs
3. **Search codebase** - Look for similar patterns
4. **Ask team** - Reach out for help

### Communication Channels

- **Code Reviews** - Submit PRs for feedback
- **Documentation** - Update docs when you learn
- **Issues** - Report bugs and suggest improvements

## 🎯 Next Steps

Now that you're set up:

1. **Explore the codebase** - Navigate through different modules
2. **Run the application** - See it in action
3. **Make a small change** - Try adding a simple feature
4. **Read the architecture docs** - Understand the bigger picture
5. **Join team discussions** - Participate in planning

## ✅ Onboarding Checklist

- [ ] Development environment setup
- [ ] Project running locally
- [ ] API tests passing
- [ ] Understanding project structure
- [ ] Created first component/route
- [ ] Familiar with development workflow
- [ ] Read architecture documentation
- [ ] Made first code contribution

Welcome to the team! 🎉

---

**Need help?** Check our [Contributing Guidelines](./CONTRIBUTING.md) or reach out to the
development team.
