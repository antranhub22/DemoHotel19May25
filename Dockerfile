# ============================================================================
# Multi-Stage Production Dockerfile for Hotel Voice Assistant SaaS Platform
# Optimized for Node 18, TSX runtime, and monorepo architecture
# ============================================================================

# ======================== Build Stage ========================
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
  python3 \
  make \
  g++ \
  linux-headers \
  && npm install -g tsx

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --include=dev

# Copy source code
COPY apps/ ./apps/
COPY packages/ ./packages/
COPY tools/ ./tools/

# Build the application
RUN npm run build:production

# Install only production dependencies
RUN npm ci --omit=dev --omit=optional

# ======================== Production Stage ========================
FROM node:18-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache \
  dumb-init \
  curl \
  && npm install -g tsx

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy production files from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/apps ./apps
COPY --from=builder --chown=nodejs:nodejs /app/packages ./packages
COPY --from=builder --chown=nodejs:nodejs /app/tools ./tools
COPY --from=builder --chown=nodejs:nodejs /app/tsconfig.json ./

# Copy built client assets if they exist
COPY --from=builder --chown=nodejs:nodejs /app/apps/client/dist ./apps/client/dist 2>/dev/null || true

# Set up environment
ENV NODE_ENV=production
ENV PORT=10000
ENV PATH="/app/node_modules/.bin:$PATH"

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/health || exit 1

# Expose port
EXPOSE ${PORT}

# Switch to non-root user
USER nodejs

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["tsx", "apps/server/index.ts"] 