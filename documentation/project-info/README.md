# DemoHotel19May - Monorepo Architecture

> **🏨 AI-powered voice assistant platform for hotels**  
> Restructured to modern monorepo architecture for scalability and maintainability

## 📁 Project Structure

```
DemoHotel19May/
├── 📁 apps/                          # Applications
│   ├── 📁 client/                    # Frontend React app
│   │   ├── index.html                # Entry point
│   │   ├── public/                   # Static assets
│   │   └── src/                      # Source code
│   │       ├── components/           # React components
│   │       ├── pages/                # Page components
│   │       ├── services/             # API & business services
│   │       ├── hooks/                # Custom React hooks
│   │       ├── context/              # React contexts
│   │       ├── utils/                # Client utilities
│   │       └── types/                # Client types
│   └── 📁 server/                    # Backend Node.js app
│       ├── index.ts                  # Server entry point
│       ├── routes/                   # API routes
│       ├── services/                 # Business logic
│       ├── middleware/               # Express middleware
│       └── models/                   # Data models
├── 📁 packages/                      # Shared packages
│   ├── 📁 shared/                    # Shared utilities & types
│   │   ├── db/                       # Database layer
│   │   ├── utils/                    # Utility functions
│   │   ├── validation/               # Validation schemas
│   │   └── types/                    # Shared types
│   ├── 📁 types/                     # Type definitions
│   └── 📁 config/                    # Shared configurations
├── 📁 tools/                         # Development tools
│   ├── 📁 scripts/                   # Build & utility scripts
│   └── 📁 migrations/                # Database migrations
├── 📁 tests/                         # Test suites
├── 📁 docs/                          # Documentation
├── 📁 assets/                        # Static assets
└── 📄 Configuration files            # Root config files
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+
- **npm** v8+
- **PostgreSQL** (production) or **SQLite** (development)

### Development Setup

```bash
# Clone repository
git clone <repository-url>
cd DemoHotel19May

# Install dependencies
npm install

# Start development server
npm run dev

# Start client development server (optional)
npm run dev:client
```

### Production Deployment

```bash
# Clean build for production
./clean-build.sh

# Or manually:
npm run build:production
npm run start:production
```

## 🛠️ Available Scripts

### Build Commands

```bash
npm run build              # Build both client and server
npm run build:production   # Optimized production build
npm run build:client       # Build frontend only
npm run build:server       # Validate server TypeScript
npm run build:analyze      # Analyze bundle size
```

### Development Commands

```bash
npm run dev                # Start backend server (port 10000)
npm run dev:client         # Start frontend dev server (port 3000)
npm run dev:server         # Start backend only
npm run preview            # Preview production build
```

### Database Commands

```bash
npm run db:setup           # Setup database schema
npm run db:seed            # Seed development data
npm run db:migrate         # Run migrations
npm run db:studio          # Open database studio
```

### Testing & Quality

```bash
npm run test               # Run API connectivity tests
npm run test:db            # Test database functionality
npm run test:build         # Build and test
npm run typecheck          # TypeScript validation
npm run lint:check         # Code linting
```

### Maintenance

```bash
npm run clean              # Clean build artifacts
npm run clean:install      # Clean install dependencies
./clean-build.sh           # Full clean rebuild
```

## 🔧 Configuration

### Environment Variables

Create `.env` file in the root directory:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/hotel_assistant

# API Keys
VITE_OPENAI_API_KEY=sk-your-openai-key
VITE_OPENAI_PROJECT_ID=proj-your-project-id
VITE_VAPI_PUBLIC_KEY=pk-your-vapi-key
VITE_VAPI_ASSISTANT_ID=asst-your-assistant-id

# Server Configuration
PORT=10000
NODE_ENV=development
LOG_LEVEL=DEBUG

# Email (Optional)
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
```

### Path Aliases

The project uses TypeScript path aliases for clean imports:

```typescript
import { Component } from '@/components'; // apps/client/src/components
import { utils } from '@shared/utils'; // packages/shared/utils
import { service } from '@server/services'; // apps/server/services
import { Config } from '@config/app.config'; // packages/config/app.config
import { ApiResponse } from '@types/api'; // packages/types/api
import { script } from '@tools/scripts'; // tools/scripts
import { test } from '@tests/utils'; // tests/utils
```

## 🗄️ Database Setup

### PostgreSQL-Only Architecture

This project now uses **PostgreSQL exclusively** for both development and production to ensure
consistency and eliminate schema drift issues.

### Local Development Setup (Docker)

```bash
# 1. Start PostgreSQL with Docker
docker run -d --name hotel-postgres \
  -e POSTGRES_DB=hotel_dev \
  -e POSTGRES_USER=hotel_user \
  -e POSTGRES_PASSWORD=dev_password \
  -p 5432:5432 \
  postgres:15

# 2. Set environment variable
export DATABASE_URL="postgresql://hotel_user:dev_password@localhost:5432/hotel_dev"

# 3. Run migrations
npm run db:generate
npm run db:migrate

# 4. Start development server
npm run dev
```

### Alternative: Use existing PostgreSQL

If you already have PostgreSQL installed:

```bash
# Create database and user
createdb hotel_dev
createuser hotel_user

# Set environment variable
export DATABASE_URL="postgresql://hotel_user:your_password@localhost:5432/hotel_dev"
```

### Production (Render.com)

The application automatically uses the `DATABASE_URL` environment variable provided by Render's
PostgreSQL service.

### ⚠️ Important Notes

- **SQLite is no longer supported** - this eliminates dual database complexity
- **Always use DATABASE_URL** - the application will error if not provided
- **Migrations are PostgreSQL-specific** - optimized for production consistency

## 🏗️ Architecture

### Frontend (React + TypeScript)

- **React 18** with TypeScript
- **Vite** for build tooling
- **TailwindCSS** for styling
- **Radix UI** for components
- **React Router** for navigation
- **React Query** for data fetching

### Backend (Node.js + Express)

- **Express.js** server
- **TypeScript** for type safety
- **Drizzle ORM** for database
- **JWT** authentication
- **Socket.io** for real-time features
- **OpenAI API** integration
- **Vapi.ai** for voice features

### Database

- **PostgreSQL** (production)
- **SQLite** (development)
- **Drizzle ORM** for migrations
- **Multi-tenant** architecture

### Build & Deployment

- **Optimized Vite build** (26% faster)
- **Code splitting** for better caching
- **TypeScript compilation**
- **Production-ready** Docker setup

## 📊 Performance Metrics

### Build Performance

- **Build Time**: 13.11s (26% improvement from 17.69s)
- **Bundle Splitting**: Optimized vendor chunks
- **Tree Shaking**: Enabled for smaller bundles

### Bundle Analysis

| Chunk          | Size      | Gzipped   |
| -------------- | --------- | --------- |
| React vendor   | 150.92 kB | 48.93 kB  |
| UI vendor      | 94.04 kB  | 31.30 kB  |
| Chart vendor   | 409.59 kB | 110.23 kB |
| Utility vendor | 21.18 kB  | 7.26 kB   |
| Voice vendor   | 263.23 kB | 71.68 kB  |

## 🧪 Testing

### API Testing

```bash
npm run test               # API connectivity tests (6/6 passing)
npm run test:db            # Database health checks
```

### Manual Testing

- All major features verified post-restructure
- Voice assistant functionality intact
- Dashboard and analytics working
- Database operations functional
- Real-time features operational

## 📚 Documentation

| Document                                          | Description                  |
| ------------------------------------------------- | ---------------------------- |
| [Architecture Guide](docs/ARCHITECTURE.md)        | Detailed system architecture |
| [API Documentation](docs/API_DOCUMENTATION.md)    | Complete API reference       |
| [Deployment Guide](docs/DEPLOYMENT_QUICKSTART.md) | Production deployment        |
| [Code Review Guide](docs/CODE_REVIEW_GUIDE.md)    | Development standards        |
| [Contributing Guide](docs/CONTRIBUTING.md)        | Contribution guidelines      |

## 🔄 Migration from Legacy Structure

This project has been restructured from a traditional folder structure to a modern monorepo
architecture. Key improvements:

### ✅ Improvements Achieved

- **26% faster builds** through optimization
- **Cleaner imports** with absolute paths
- **Better code organization** with monorepo structure
- **Enhanced type safety** with strict TypeScript
- **Optimized bundles** with smart chunking
- **Production-ready** deployment setup

### 📈 Before vs After

| Metric       | Before   | After    | Improvement       |
| ------------ | -------- | -------- | ----------------- |
| Build Time   | 17.69s   | 13.11s   | 26% faster        |
| Import Paths | Relative | Absolute | 28+ files updated |
| Structure    | Mixed    | Monorepo | Clean separation  |
| Type Safety  | Partial  | Strict   | Enhanced          |

## 🤝 Contributing

Please read our [Contributing Guidelines](docs/CONTRIBUTING.md) for details on:

- Code standards and style
- Development workflow
- Pull request process
- Testing requirements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Next Steps

- [ ] Implement voice tracking features
- [ ] Add dynamic tenant settings
- [ ] Enhance multi-language support
- [ ] Optimize database queries
- [ ] Add comprehensive test coverage

---

**🏨 Mi Nhon Hotel Voice Assistant** - Powered by AI, built for scalability.
