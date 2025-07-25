#!/bin/bash
# =============================================================================
# Hotel Management SaaS Platform - Docker Build Script
# Comprehensive container build with optimization and multi-stage support
# =============================================================================

set -euo pipefail

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Configuration & Constants                                               │
# └─────────────────────────────────────────────────────────────────────────┘

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../../" && pwd)"
BUILD_LOG="${PROJECT_ROOT}/logs/docker-build-$(date +%Y%m%d-%H%M%S).log"

# Default configuration
REGISTRY="${REGISTRY:-ghcr.io}"
ORGANIZATION="${ORGANIZATION:-hotel-management}"
IMAGE_NAME="${IMAGE_NAME:-hotel-saas}"
VERSION="${VERSION:-$(date +%Y%m%d-%H%M%S)-$(git rev-parse --short HEAD 2>/dev/null || echo 'local')}"
BUILD_TARGET="${BUILD_TARGET:-production}"
PLATFORM="${PLATFORM:-linux/amd64,linux/arm64}"
DOCKERFILE="${DOCKERFILE:-Dockerfile}"
BUILD_CONTEXT="${BUILD_CONTEXT:-$PROJECT_ROOT}"

# Build options
PUSH="${PUSH:-false}"
CACHE="${CACHE:-true}"
SQUASH="${SQUASH:-false}"
COMPRESS="${COMPRESS:-true}"
SECURITY_SCAN="${SECURITY_SCAN:-true}"
OPTIMIZE="${OPTIMIZE:-true}"
MULTI_ARCH="${MULTI_ARCH:-false}"

# Build args
BUILD_DATE="${BUILD_DATE:-$(date -u +'%Y-%m-%dT%H:%M:%SZ')}"
VCS_REF="${VCS_REF:-$(git rev-parse HEAD 2>/dev/null || echo 'unknown')}"
BUILD_VERSION="${BUILD_VERSION:-$VERSION}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Utility Functions                                                       │
# └─────────────────────────────────────────────────────────────────────────┘

log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case "$level" in
        INFO)
            echo -e "${BLUE}[INFO]${NC} $message"
            ;;
        SUCCESS)
            echo -e "${GREEN}[SUCCESS]${NC} $message"
            ;;
        WARNING)
            echo -e "${YELLOW}[WARNING]${NC} $message"
            ;;
        ERROR)
            echo -e "${RED}[ERROR]${NC} $message"
            ;;
    esac
    
    echo "[$timestamp] [$level] $message" >> "$BUILD_LOG"
}

show_usage() {
    cat << EOF
Hotel Management SaaS Platform - Docker Build Script

Usage: $0 [OPTIONS]

OPTIONS:
    -r, --registry REGISTRY      Docker registry (default: ghcr.io)
    -o, --organization ORG       Organization name (default: hotel-management)
    -n, --name NAME             Image name (default: hotel-saas)
    -v, --version VERSION       Image version/tag (default: auto-generated)
    -t, --target TARGET         Build target (production|development|testing)
    -p, --platform PLATFORM    Target platform(s) (default: linux/amd64,linux/arm64)
    -f, --dockerfile FILE       Dockerfile path (default: Dockerfile)
    -c, --context DIR           Build context directory (default: project root)
    --push                      Push image to registry after build
    --no-cache                  Disable build cache
    --squash                    Squash image layers
    --no-compress               Disable compression
    --no-security-scan          Skip security scanning
    --no-optimize               Skip build optimization
    --multi-arch                Enable multi-architecture build
    --build-arg KEY=VALUE       Add build argument
    --tag TAG                   Additional tag for the image
    --latest                    Also tag as 'latest'
    --prune                     Prune build cache after build
    --stats                     Show build statistics
    -h, --help                  Show this help message

BUILD TARGETS:
    production     - Optimized production build
    development    - Development build with dev tools
    testing        - Testing build with test frameworks
    security-scan  - Security scanning build

EXAMPLES:
    $0 --target production --push --latest
    $0 --registry myregistry.com --organization myorg --name myapp
    $0 --multi-arch --platform linux/amd64,linux/arm64
    $0 --build-arg NODE_ENV=production --version 1.2.3
    $0 --no-cache --security-scan --stats

EOF
}

cleanup() {
    log "INFO" "Cleaning up temporary files..."
    # Cleanup logic here
}

trap cleanup EXIT

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Environment Validation                                                 │
# └─────────────────────────────────────────────────────────────────────────┘

validate_environment() {
    log "INFO" "Validating build environment..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        log "ERROR" "Docker is not installed"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log "ERROR" "Docker daemon is not running"
        exit 1
    fi
    
    # Check Docker version
    local docker_version=$(docker version --format '{{.Server.Version}}')
    log "INFO" "Docker version: $docker_version"
    
    # Check if Dockerfile exists
    if [ ! -f "$DOCKERFILE" ]; then
        log "ERROR" "Dockerfile not found: $DOCKERFILE"
        exit 1
    fi
    
    # Check if build context exists
    if [ ! -d "$BUILD_CONTEXT" ]; then
        log "ERROR" "Build context directory not found: $BUILD_CONTEXT"
        exit 1
    fi
    
    # Check for multi-architecture support
    if [ "$MULTI_ARCH" = "true" ]; then
        if ! docker buildx version &> /dev/null; then
            log "ERROR" "Docker Buildx is required for multi-architecture builds"
            exit 1
        fi
        
        # Ensure buildx builder instance exists
        if ! docker buildx inspect hotel-builder &> /dev/null; then
            log "INFO" "Creating buildx builder instance..."
            docker buildx create --name hotel-builder --use --bootstrap
        fi
    fi
    
    log "SUCCESS" "Environment validation completed"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Build Optimization                                                     │
# └─────────────────────────────────────────────────────────────────────────┘

optimize_build() {
    if [ "$OPTIMIZE" = "false" ]; then
        log "INFO" "Build optimization disabled"
        return 0
    fi
    
    log "INFO" "Optimizing build environment..."
    
    # Clean up old images and containers
    log "INFO" "Cleaning up old Docker resources..."
    docker system prune -f || true
    
    # Remove dangling images
    docker image prune -f || true
    
    # Optimize Dockerfile if possible
    if [ -f "$PROJECT_ROOT/.dockerignore" ]; then
        log "INFO" "Using .dockerignore for build optimization"
    else
        log "WARNING" "No .dockerignore found, creating minimal one..."
        cat > "$PROJECT_ROOT/.dockerignore" << EOF
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.git
.gitignore
README.md
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
logs
*.log
test-results
coverage
.nyc_output
.cache
dist
build
EOF
    fi
    
    log "SUCCESS" "Build optimization completed"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Build Arguments Preparation                                            │
# └─────────────────────────────────────────────────────────────────────────┘

prepare_build_args() {
    log "INFO" "Preparing build arguments..."
    
    BUILD_ARGS=(
        "--build-arg" "BUILD_DATE=$BUILD_DATE"
        "--build-arg" "VCS_REF=$VCS_REF"
        "--build-arg" "BUILD_VERSION=$BUILD_VERSION"
        "--build-arg" "NODE_VERSION=${NODE_VERSION:-18}"
    )
    
    # Add custom build args
    for arg in "${CUSTOM_BUILD_ARGS[@]}"; do
        BUILD_ARGS+=("--build-arg" "$arg")
    done
    
    # Add target-specific build args
    case "$BUILD_TARGET" in
        production)
            BUILD_ARGS+=("--build-arg" "NODE_ENV=production")
            ;;
        development)
            BUILD_ARGS+=("--build-arg" "NODE_ENV=development")
            ;;
        testing)
            BUILD_ARGS+=("--build-arg" "NODE_ENV=test")
            ;;
    esac
    
    log "SUCCESS" "Build arguments prepared"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Image Tagging                                                          │
# └─────────────────────────────────────────────────────────────────────────┘

prepare_tags() {
    log "INFO" "Preparing image tags..."
    
    local base_tag="${REGISTRY}/${ORGANIZATION}/${IMAGE_NAME}"
    
    TAGS=(
        "${base_tag}:${VERSION}"
        "${base_tag}:${BUILD_TARGET}-${VERSION}"
    )
    
    # Add additional tags
    for tag in "${ADDITIONAL_TAGS[@]}"; do
        TAGS+=("${base_tag}:${tag}")
    done
    
    # Add latest tag if requested
    if [ "$TAG_LATEST" = "true" ]; then
        TAGS+=("${base_tag}:latest")
        TAGS+=("${base_tag}:${BUILD_TARGET}-latest")
    fi
    
    # Add branch-based tags
    if command -v git &> /dev/null && git rev-parse --is-inside-work-tree &> /dev/null; then
        local branch=$(git rev-parse --abbrev-ref HEAD)
        if [ "$branch" != "HEAD" ]; then
            TAGS+=("${base_tag}:${branch}")
        fi
    fi
    
    log "INFO" "Tags to be applied:"
    for tag in "${TAGS[@]}"; do
        log "INFO" "  - $tag"
    done
    
    log "SUCCESS" "Image tags prepared"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Build Execution                                                        │
# └─────────────────────────────────────────────────────────────────────────┘

execute_build() {
    log "INFO" "Starting Docker build..."
    
    local build_cmd="docker"
    local build_options=()
    
    # Use buildx for multi-architecture builds
    if [ "$MULTI_ARCH" = "true" ]; then
        build_cmd="docker buildx build"
        build_options+=("--platform" "$PLATFORM")
        
        if [ "$PUSH" = "true" ]; then
            build_options+=("--push")
        else
            build_options+=("--load")
        fi
    else
        build_cmd="docker build"
    fi
    
    # Add build options
    build_options+=("--target" "$BUILD_TARGET")
    build_options+=("--file" "$DOCKERFILE")
    
    # Add tags
    for tag in "${TAGS[@]}"; do
        build_options+=("--tag" "$tag")
    done
    
    # Add build arguments
    build_options+=("${BUILD_ARGS[@]}")
    
    # Cache options
    if [ "$CACHE" = "true" ]; then
        if [ "$MULTI_ARCH" = "true" ]; then
            build_options+=("--cache-from" "type=gha")
            build_options+=("--cache-to" "type=gha,mode=max")
        fi
    else
        build_options+=("--no-cache")
    fi
    
    # Compression and squashing
    if [ "$COMPRESS" = "true" ]; then
        build_options+=("--compress")
    fi
    
    if [ "$SQUASH" = "true" ]; then
        build_options+=("--squash")
    fi
    
    # Add build context
    build_options+=("$BUILD_CONTEXT")
    
    # Execute build
    local full_command="$build_cmd ${build_options[*]}"
    log "INFO" "Executing: $full_command"
    
    local start_time=$(date +%s)
    
    if eval "$full_command" 2>&1 | tee -a "$BUILD_LOG"; then
        local end_time=$(date +%s)
        local build_duration=$((end_time - start_time))
        log "SUCCESS" "Build completed successfully in ${build_duration} seconds"
        return 0
    else
        log "ERROR" "Build failed"
        return 1
    fi
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Push to Registry                                                       │
# └─────────────────────────────────────────────────────────────────────────┘

push_images() {
    if [ "$PUSH" = "false" ] || [ "$MULTI_ARCH" = "true" ]; then
        log "INFO" "Skipping image push (disabled or already pushed via buildx)"
        return 0
    fi
    
    log "INFO" "Pushing images to registry..."
    
    for tag in "${TAGS[@]}"; do
        log "INFO" "Pushing $tag..."
        
        if docker push "$tag"; then
            log "SUCCESS" "Successfully pushed $tag"
        else
            log "ERROR" "Failed to push $tag"
            return 1
        fi
    done
    
    log "SUCCESS" "All images pushed successfully"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Security Scanning                                                      │
# └─────────────────────────────────────────────────────────────────────────┘

security_scan() {
    if [ "$SECURITY_SCAN" = "false" ]; then
        log "INFO" "Security scanning disabled"
        return 0
    fi
    
    log "INFO" "Starting security scan..."
    
    local main_tag="${TAGS[0]}"
    
    # Try different security scanners
    if command -v trivy &> /dev/null; then
        log "INFO" "Running Trivy security scan..."
        
        if trivy image --exit-code 0 --severity HIGH,CRITICAL "$main_tag"; then
            log "SUCCESS" "Trivy scan completed"
        else
            log "WARNING" "Trivy found security issues"
        fi
    elif command -v docker &> /dev/null && docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image --exit-code 0 "$main_tag" &> /dev/null; then
        log "INFO" "Running Trivy via Docker..."
        
        if docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image --exit-code 0 --severity HIGH,CRITICAL "$main_tag"; then
            log "SUCCESS" "Trivy scan completed"
        else
            log "WARNING" "Trivy found security issues"
        fi
    else
        log "WARNING" "No security scanner available, skipping scan"
    fi
    
    log "SUCCESS" "Security scanning completed"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Build Statistics                                                       │
# └─────────────────────────────────────────────────────────────────────────┘

show_build_stats() {
    if [ "$SHOW_STATS" = "false" ]; then
        return 0
    fi
    
    log "INFO" "Generating build statistics..."
    
    local main_tag="${TAGS[0]}"
    
    if docker image inspect "$main_tag" &> /dev/null; then
        local image_size=$(docker image inspect "$main_tag" --format='{{.Size}}')
        local image_size_mb=$((image_size / 1024 / 1024))
        local created=$(docker image inspect "$main_tag" --format='{{.Created}}')
        local layers=$(docker image inspect "$main_tag" --format='{{len .RootFS.Layers}}')
        
        log "INFO" "Build Statistics:"
        log "INFO" "  Image: $main_tag"
        log "INFO" "  Size: ${image_size_mb} MB"
        log "INFO" "  Layers: $layers"
        log "INFO" "  Created: $created"
        log "INFO" "  Target: $BUILD_TARGET"
        log "INFO" "  Platform: $PLATFORM"
        
        # Show layer information
        log "INFO" "Layer breakdown:"
        docker history --no-trunc --format "table {{.CreatedBy}}\t{{.Size}}" "$main_tag" | head -10
        
        # Show security scan summary if available
        if [ -f "${PROJECT_ROOT}/security-scan-results.json" ]; then
            log "INFO" "Security scan results available"
        fi
    else
        log "WARNING" "Cannot retrieve image statistics"
    fi
    
    log "SUCCESS" "Build statistics generated"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Cleanup and Pruning                                                   │
# └─────────────────────────────────────────────────────────────────────────┘

prune_build_cache() {
    if [ "$PRUNE_CACHE" = "false" ]; then
        return 0
    fi
    
    log "INFO" "Pruning build cache..."
    
    # Prune build cache
    if [ "$MULTI_ARCH" = "true" ]; then
        docker buildx prune -f || true
    fi
    
    # Prune unused images
    docker image prune -f || true
    
    # Show disk usage
    log "INFO" "Docker disk usage after cleanup:"
    docker system df
    
    log "SUCCESS" "Build cache pruned"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Command Line Parsing                                                   │
# └─────────────────────────────────────────────────────────────────────────┘

CUSTOM_BUILD_ARGS=()
ADDITIONAL_TAGS=()
TAG_LATEST=false
SHOW_STATS=false
PRUNE_CACHE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -r|--registry)
            REGISTRY="$2"
            shift 2
            ;;
        -o|--organization)
            ORGANIZATION="$2"
            shift 2
            ;;
        -n|--name)
            IMAGE_NAME="$2"
            shift 2
            ;;
        -v|--version)
            VERSION="$2"
            shift 2
            ;;
        -t|--target)
            BUILD_TARGET="$2"
            shift 2
            ;;
        -p|--platform)
            PLATFORM="$2"
            shift 2
            ;;
        -f|--dockerfile)
            DOCKERFILE="$2"
            shift 2
            ;;
        -c|--context)
            BUILD_CONTEXT="$2"
            shift 2
            ;;
        --push)
            PUSH=true
            shift
            ;;
        --no-cache)
            CACHE=false
            shift
            ;;
        --squash)
            SQUASH=true
            shift
            ;;
        --no-compress)
            COMPRESS=false
            shift
            ;;
        --no-security-scan)
            SECURITY_SCAN=false
            shift
            ;;
        --no-optimize)
            OPTIMIZE=false
            shift
            ;;
        --multi-arch)
            MULTI_ARCH=true
            shift
            ;;
        --build-arg)
            CUSTOM_BUILD_ARGS+=("$2")
            shift 2
            ;;
        --tag)
            ADDITIONAL_TAGS+=("$2")
            shift 2
            ;;
        --latest)
            TAG_LATEST=true
            shift
            ;;
        --prune)
            PRUNE_CACHE=true
            shift
            ;;
        --stats)
            SHOW_STATS=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            log "ERROR" "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Main Execution                                                         │
# └─────────────────────────────────────────────────────────────────────────┘

main() {
    # Create logs directory
    mkdir -p "$(dirname "$BUILD_LOG")"
    
    log "INFO" "Starting Docker build process..."
    log "INFO" "Build Configuration:"
    log "INFO" "  Registry: $REGISTRY"
    log "INFO" "  Organization: $ORGANIZATION"
    log "INFO" "  Image Name: $IMAGE_NAME"
    log "INFO" "  Version: $VERSION"
    log "INFO" "  Target: $BUILD_TARGET"
    log "INFO" "  Platform: $PLATFORM"
    log "INFO" "  Dockerfile: $DOCKERFILE"
    log "INFO" "  Context: $BUILD_CONTEXT"
    log "INFO" "  Multi-arch: $MULTI_ARCH"
    log "INFO" "  Push: $PUSH"
    log "INFO" "  Cache: $CACHE"
    log "INFO" "  Security Scan: $SECURITY_SCAN"
    log "INFO" "  Optimize: $OPTIMIZE"
    
    # Execute build process
    validate_environment
    optimize_build
    prepare_build_args
    prepare_tags
    
    if execute_build; then
        push_images
        security_scan
        show_build_stats
        prune_build_cache
        
        log "SUCCESS" "Docker build process completed successfully!"
        log "INFO" "Build log: $BUILD_LOG"
        
        # Show final image information
        log "INFO" "Built images:"
        for tag in "${TAGS[@]}"; do
            if docker image inspect "$tag" &> /dev/null; then
                local size=$(docker image inspect "$tag" --format='{{.Size}}' | numfmt --to=iec-i)
                log "INFO" "  - $tag ($size)"
            fi
        done
        
        exit 0
    else
        log "ERROR" "Docker build process failed"
        log "INFO" "Build log: $BUILD_LOG"
        exit 1
    fi
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 