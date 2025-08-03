# =============================================================================
# Hotel Management SaaS Platform - Production Dockerfile
# Multi-stage build for optimal performance, security, and size
# =============================================================================

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Stage 1: Base Dependencies & Security Setup                            │
# └─────────────────────────────────────────────────────────────────────────┘

FROM node:18-alpine AS base

# Install security updates and essential tools
RUN apk update && apk upgrade && \
    apk add --no-cache \
    dumb-init \
    tzdata \
    curl \
    && rm -rf /var/cache/apk/*

# Create app user for security (non-root)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S hotel-app -u 1001 -G nodejs

# Set timezone
ENV TZ=UTC

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Stage 2: Dependencies Installation                                     │
# └─────────────────────────────────────────────────────────────────────────┘

FROM base AS deps

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/*/package*.json ./packages/*/
COPY apps/*/package*.json ./apps/*/

# Install dependencies with production optimizations
RUN npm ci --only=production --no-audit --no-fund && \
    npm cache clean --force

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Stage 3: Development Dependencies & Build Tools                        │
# └─────────────────────────────────────────────────────────────────────────┘

FROM base AS dev-deps

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/*/package*.json ./packages/*/
COPY apps/*/package*.json ./apps/*/

# Install all dependencies (including dev dependencies)
RUN npm ci --no-audit --no-fund

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Stage 4: Build Application                                             │
# └─────────────────────────────────────────────────────────────────────────┘

FROM dev-deps AS builder

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Stage 5: Security Scanning (Optional - for CI/CD)                     │
# └─────────────────────────────────────────────────────────────────────────┘

FROM builder AS security-scan

# Install security scanning tools
RUN npm install -g npm-audit-resolver snyk

# Run security audits
RUN npm audit --audit-level moderate || true
RUN npm run security:scan || true

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Stage 6: Production Runtime                                            │
# └─────────────────────────────────────────────────────────────────────────┘

FROM base AS production

# Set production environment
ENV NODE_ENV=production
ENV PORT=10000
ENV HOSTNAME=0.0.0.0

# Install production runtime dependencies
RUN apk add --no-cache \
    postgresql-client \
    sqlite \
    && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy production dependencies
COPY --from=deps --chown=hotel-app:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=hotel-app:nodejs /app/dist ./dist
COPY --from=builder --chown=hotel-app:nodejs /app/package*.json ./

# Copy essential configuration files
COPY --chown=hotel-app:nodejs .env.example .env.production ./
COPY --chown=hotel-app:nodejs scripts/docker/ ./scripts/docker/

# Create necessary directories with proper permissions
RUN mkdir -p /app/logs /app/uploads /app/backups /app/temp && \
    chown -R hotel-app:nodejs /app && \
    chmod -R 755 /app

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Switch to non-root user
USER hotel-app:nodejs

# Expose port
EXPOSE ${PORT}

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/apps/server/index.js"]

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Stage 7: Development Environment                                       │
# └─────────────────────────────────────────────────────────────────────────┘

FROM dev-deps AS development

# Set development environment
ENV NODE_ENV=development
ENV PORT=3000

# Install development tools
RUN npm install -g nodemon concurrently

WORKDIR /app

# Copy source code
COPY --chown=hotel-app:nodejs . .

# Create development directories
RUN mkdir -p /app/logs /app/uploads /app/backups /app/temp && \
    chown -R hotel-app:nodejs /app

# Switch to non-root user
USER hotel-app:nodejs

# Expose development ports
EXPOSE 3000 3001 5173

# Development command with hot reload
CMD ["npm", "run", "dev"]

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Stage 8: Testing Environment                                           │
# └─────────────────────────────────────────────────────────────────────────┘

FROM dev-deps AS testing

# Set testing environment
ENV NODE_ENV=test
ENV PORT=3002

# Install testing tools
RUN npm install -g jest playwright @playwright/test

WORKDIR /app

# Copy source code and tests
COPY --chown=hotel-app:nodejs . .

# Install Playwright browsers
RUN npx playwright install --with-deps

# Create testing directories
RUN mkdir -p /app/test-results /app/coverage && \
    chown -R hotel-app:nodejs /app

# Switch to non-root user
USER hotel-app:nodejs

# Testing command
CMD ["npm", "run", "test"]

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Metadata & Labels                                                      │
# └─────────────────────────────────────────────────────────────────────────┘

LABEL maintainer="Hotel Management Team <team@hotel.com>"
LABEL version="1.0.0"
LABEL description="Hotel Management SaaS Platform - Production Container"
LABEL org.opencontainers.image.title="DemoHotel19May"
LABEL org.opencontainers.image.description="Multi-tenant Hotel Management SaaS Platform with AI Voice Assistant"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="Hotel Management Corp"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/hotel-management/DemoHotel19May"
LABEL org.opencontainers.image.documentation="https://docs.hotel-management.com"

# Security labels
LABEL security.scan.enabled="true"
LABEL security.audit.level="moderate"
LABEL security.non-root-user="hotel-app"

# Build info (will be populated by CI/CD)
ARG BUILD_DATE
ARG VCS_REF
ARG BUILD_VERSION
LABEL org.opencontainers.image.created=${BUILD_DATE}
LABEL org.opencontainers.image.revision=${VCS_REF}
LABEL org.opencontainers.image.version=${BUILD_VERSION}

# =============================================================================
# Usage Instructions:
# 
# Production Build:
#   docker build --target production -t hotel-management:latest .
#
# Development Build:
#   docker build --target development -t hotel-management:dev .
#
# Testing Build:
#   docker build --target testing -t hotel-management:test .
#
# Security Scan:
#   docker build --target security-scan -t hotel-management:scan .
#
# Build with Args:
#   docker build \
#     --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
#     --build-arg VCS_REF=$(git rev-parse HEAD) \
#     --build-arg BUILD_VERSION=1.0.0 \
#     --target production \
#     -t hotel-management:1.0.0 .
# ============================================================================= 