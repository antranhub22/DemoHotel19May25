#!/bin/bash
# ============================================================================
# Build Optimization Script
# Optimizes build process for faster deployments and smaller images
# ============================================================================

set -e

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BUILD_DIR="$PROJECT_ROOT/build-optimized"
LOG_FILE="$PROJECT_ROOT/logs/build-optimization.log"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $1${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ $1${NC}" | tee -a "$LOG_FILE"
}

# ======================== Optimization Functions ========================

optimize_dependencies() {
    log "📦 Optimizing dependencies..."
    
    cd "$PROJECT_ROOT"
    
    # Clean install for production
    log "Cleaning node_modules..."
    rm -rf node_modules package-lock.json
    
    # Install only production dependencies
    log "Installing production dependencies..."
    npm ci --omit=dev --omit=optional
    
    # Remove unnecessary files from node_modules
    log "Removing unnecessary files from node_modules..."
    find node_modules -name "*.md" -delete
    find node_modules -name "*.txt" -delete
    find node_modules -name "test" -type d -exec rm -rf {} + 2>/dev/null || true
    find node_modules -name "tests" -type d -exec rm -rf {} + 2>/dev/null || true
    find node_modules -name "docs" -type d -exec rm -rf {} + 2>/dev/null || true
    find node_modules -name "examples" -type d -exec rm -rf {} + 2>/dev/null || true
    find node_modules -name "*.spec.js" -delete
    find node_modules -name "*.test.js" -delete
    
    log_success "Dependencies optimized"
}

optimize_client_build() {
    log "🎨 Optimizing client build..."
    
    cd "$PROJECT_ROOT/apps/client"
    
    # Build with production optimizations
    log "Building client with production optimizations..."
    VITE_BUILD_ANALYZE=false \
    VITE_BUILD_MINIFY=true \
    VITE_BUILD_SOURCEMAP=false \
    npm run build --mode=production
    
    # Compress static assets
    log "Compressing static assets..."
    if command -v gzip &> /dev/null; then
        find dist -name "*.js" -exec gzip -k {} \;
        find dist -name "*.css" -exec gzip -k {} \;
        find dist -name "*.html" -exec gzip -k {} \;
    fi
    
    # Generate asset manifest
    log "Generating asset manifest..."
    find dist -type f -name "*.js" -o -name "*.css" -o -name "*.html" | \
        sort > dist/asset-manifest.txt
    
    log_success "Client build optimized"
}

optimize_docker_context() {
    log "🐳 Optimizing Docker build context..."
    
    # Create optimized build directory
    mkdir -p "$BUILD_DIR"
    
    # Copy only necessary files
    log "Copying necessary files..."
    rsync -av --exclude-from="$PROJECT_ROOT/.dockerignore" \
          "$PROJECT_ROOT/" "$BUILD_DIR/" \
          --exclude="node_modules" \
          --exclude=".git" \
          --exclude="dist" \
          --exclude="build" \
          --exclude="coverage" \
          --exclude="logs" \
          --exclude="backups"
    
    # Copy optimized node_modules
    if [[ -d "$PROJECT_ROOT/node_modules" ]]; then
        log "Copying optimized node_modules..."
        cp -r "$PROJECT_ROOT/node_modules" "$BUILD_DIR/"
    fi
    
    # Create optimized Dockerfile
    log "Creating optimized Dockerfile..."
    cat > "$BUILD_DIR/Dockerfile.optimized" << 'EOF'
# Production-optimized Dockerfile
FROM node:18-alpine AS production

# Install runtime dependencies only
RUN apk add --no-cache dumb-init curl

# Create app user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy pre-built node_modules (already optimized)
COPY node_modules ./node_modules

# Copy application code
COPY apps ./apps
COPY packages ./packages

# Copy built client assets
COPY apps/client/dist ./apps/client/dist

# Set environment
ENV NODE_ENV=production
ENV PORT=10000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/health || exit 1

# Expose port
EXPOSE ${PORT}

# Switch to app user
USER nodejs

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
EOF
    
    log_success "Docker context optimized"
}

analyze_bundle_size() {
    log "📊 Analyzing bundle size..."
    
    cd "$PROJECT_ROOT/apps/client"
    
    # Generate bundle analysis
    if [[ -d "dist" ]]; then
        log "Calculating bundle sizes..."
        
        local js_size=$(find dist -name "*.js" -exec du -ch {} + | tail -1 | cut -f1)
        local css_size=$(find dist -name "*.css" -exec du -ch {} + | tail -1 | cut -f1)
        local total_size=$(du -ch dist | tail -1 | cut -f1)
        
        log "Bundle Analysis:"
        log "  JavaScript: $js_size"
        log "  CSS: $css_size"
        log "  Total: $total_size"
        
        # Create size report
        cat > "$PROJECT_ROOT/build-report.txt" << EOF
Build Optimization Report
========================
Generated: $(date)
Git Commit: $(git rev-parse --short HEAD)

Bundle Sizes:
- JavaScript: $js_size
- CSS: $css_size
- Total: $total_size

Optimization Status: ✅ Complete
EOF
    fi
    
    log_success "Bundle analysis complete"
}

optimize_database_queries() {
    log "🗄️ Optimizing database preparation..."
    
    # Prepare optimized schema
    if [[ -f "$PROJECT_ROOT/prisma/schema.prisma" ]]; then
        log "Validating database schema..."
        
        # Run schema validation
        cd "$PROJECT_ROOT"
        npx prisma validate || log_warning "Schema validation warnings found"
    fi
    
    log_success "Database optimization complete"
}

create_deployment_package() {
    log "📦 Creating deployment package..."
    
    local package_name="hotel-voice-assistant-$(date +%Y%m%d-%H%M%S).tar.gz"
    local package_path="$PROJECT_ROOT/deployments/$package_name"
    
    mkdir -p "$PROJECT_ROOT/deployments"
    
    # Create compressed package
    tar -czf "$package_path" \
        -C "$BUILD_DIR" \
        --exclude="*.log" \
        --exclude="*.tmp" \
        --exclude=".cache" \
        .
    
    local package_size=$(du -h "$package_path" | cut -f1)
    log "Deployment package created: $package_name ($package_size)"
    
    # Create package manifest
    cat > "$PROJECT_ROOT/deployments/manifest.json" << EOF
{
  "package": "$package_name",
  "size": "$package_size",
  "created": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "git_commit": "$(git rev-parse HEAD)",
  "git_branch": "$(git rev-parse --abbrev-ref HEAD)",
  "build_type": "optimized"
}
EOF
    
    log_success "Deployment package ready: $package_path"
}

# ======================== Cache Management ========================

manage_build_cache() {
    log "🗃️ Managing build cache..."
    
    local cache_dir="$PROJECT_ROOT/.build-cache"
    mkdir -p "$cache_dir"
    
    # Cache npm dependencies hash
    local deps_hash=$(sha256sum package-lock.json | cut -d' ' -f1)
    echo "$deps_hash" > "$cache_dir/deps-hash"
    
    # Cache built assets hash
    if [[ -d "$PROJECT_ROOT/apps/client/dist" ]]; then
        local assets_hash=$(find "$PROJECT_ROOT/apps/client/dist" -type f -exec sha256sum {} \; | sha256sum | cut -d' ' -f1)
        echo "$assets_hash" > "$cache_dir/assets-hash"
    fi
    
    log_success "Build cache updated"
}

# ======================== Main Optimization Flow ========================

show_help() {
    cat << EOF
🚀 Build Optimization Script

Usage: $0 [options]

Options:
  --full              Run full optimization (all steps)
  --deps-only         Optimize dependencies only
  --client-only       Optimize client build only
  --docker-only       Optimize Docker context only
  --analyze           Analyze bundle size only
  --package           Create deployment package
  --clean             Clean build artifacts
  --help              Show this help

Examples:
  $0 --full           # Full optimization
  $0 --client-only    # Build client only
  $0 --analyze        # Analyze current build
  $0 --package        # Create deployment package

EOF
}

run_full_optimization() {
    log "🚀 Starting full build optimization..."
    
    mkdir -p "$PROJECT_ROOT/logs"
    
    # Run optimization steps
    optimize_dependencies
    optimize_client_build
    optimize_docker_context
    analyze_bundle_size
    optimize_database_queries
    manage_build_cache
    create_deployment_package
    
    log_success "🎉 Full optimization complete!"
    
    # Show summary
    echo
    log "📊 Optimization Summary:"
    if [[ -f "$PROJECT_ROOT/build-report.txt" ]]; then
        cat "$PROJECT_ROOT/build-report.txt"
    fi
}

# ======================== CLI Handling ========================

case "${1:-}" in
    --full)
        run_full_optimization
        ;;
    --deps-only)
        optimize_dependencies
        ;;
    --client-only)
        optimize_client_build
        analyze_bundle_size
        ;;
    --docker-only)
        optimize_docker_context
        ;;
    --analyze)
        analyze_bundle_size
        ;;
    --package)
        create_deployment_package
        ;;
    --clean)
        log "🧹 Cleaning build artifacts..."
        rm -rf "$BUILD_DIR"
        rm -rf "$PROJECT_ROOT/apps/client/dist"
        rm -rf "$PROJECT_ROOT/.build-cache"
        rm -rf "$PROJECT_ROOT/deployments"
        log_success "Build artifacts cleaned"
        ;;
    --help|"")
        show_help
        ;;
    *)
        echo "Unknown option: $1"
        show_help
        exit 1
        ;;
esac 