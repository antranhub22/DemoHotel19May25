# Multi-stage Dockerfile optimized for memory
FROM node:20-alpine AS base
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Build server if needed (ts->js) - assuming build script exists
RUN npm run -w apps/server build || true

FROM node:20-alpine AS runtime
WORKDIR /app

# Create non-root user
RUN addgroup -S app && adduser -S app -G app
USER app

ENV NODE_ENV=production \
    PORT=10000 \
    NODE_OPTIONS="--max-old-space-size=768 --expose-gc"

COPY --from=base /app /app

EXPOSE 10000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost:10000/api/health || exit 1

CMD ["node", "apps/server/index.js"]


