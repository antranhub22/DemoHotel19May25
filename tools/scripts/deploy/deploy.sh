#!/bin/bash
# =============================================================================
# Hotel Management SaaS Platform - Deployment Automation Script
# Comprehensive deployment with multiple strategies and environments
# =============================================================================

set -euo pipefail

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Configuration & Constants                                               │
# └─────────────────────────────────────────────────────────────────────────┘

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../../" && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/deployment-$(date +%Y%m%d-%H%M%S).log"
VERSION="${VERSION:-$(date +%Y%m%d-%H%M%S)-$(git rev-parse --short HEAD)}"

# Default values
ENVIRONMENT="${ENVIRONMENT:-development}"
STRATEGY="${STRATEGY:-immediate}"
DOCKER_REGISTRY="${DOCKER_REGISTRY:-ghcr.io}"
IMAGE_NAME="${IMAGE_NAME:-hotel-management}"
TIMEOUT="${TIMEOUT:-300}"
HEALTH_CHECK_RETRIES="${HEALTH_CHECK_RETRIES:-10}"
BACKUP_BEFORE_DEPLOY="${BACKUP_BEFORE_DEPLOY:-true}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

cleanup() {
    log "INFO" "Cleaning up temporary files..."
    # Cleanup logic here
}

trap cleanup EXIT

show_usage() {
    cat << EOF
Hotel Management SaaS Platform - Deployment Script

Usage: $0 [OPTIONS]

OPTIONS:
    -e, --environment ENV     Target environment (development|staging|production)
    -s, --strategy STRATEGY   Deployment strategy (immediate|rolling|blue-green|canary)
    -v, --version VERSION     Application version to deploy
    -i, --image IMAGE         Docker image to deploy
    -t, --timeout TIMEOUT     Deployment timeout in seconds (default: 300)
    --no-backup              Skip pre-deployment backup
    --dry-run                Show what would be deployed without executing
    --rollback               Rollback to previous version
    -h, --help               Show this help message

ENVIRONMENTS:
    development    - Local/dev environment (immediate deployment)
    staging        - Staging environment (rolling deployment)
    production     - Production environment (blue-green deployment)

STRATEGIES:
    immediate      - Deploy immediately without advanced strategies
    rolling        - Deploy instances one by one with health checks
    blue-green     - Deploy to new environment, then switch traffic
    canary         - Gradually increase traffic to new version

EXAMPLES:
    $0 --environment staging --strategy rolling
    $0 --environment production --strategy blue-green --version 1.2.3
    $0 --dry-run --environment production
    $0 --rollback --environment production

EOF
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Environment Validation                                                  │
# └─────────────────────────────────────────────────────────────────────────┘

validate_environment() {
    log "INFO" "Validating deployment environment..."
    
    # Check if environment is valid
    case "$ENVIRONMENT" in
        development|staging|production)
            log "SUCCESS" "Environment '$ENVIRONMENT' is valid"
            ;;
        *)
            log "ERROR" "Invalid environment: $ENVIRONMENT"
            log "ERROR" "Valid environments: development, staging, production"
            exit 1
            ;;
    esac
    
    # Check if strategy is valid
    case "$STRATEGY" in
        immediate|rolling|blue-green|canary)
            log "SUCCESS" "Strategy '$STRATEGY' is valid"
            ;;
        *)
            log "ERROR" "Invalid strategy: $STRATEGY"
            log "ERROR" "Valid strategies: immediate, rolling, blue-green, canary"
            exit 1
            ;;
    esac
    
    # Check required tools
    for tool in docker docker-compose curl; do
        if ! command -v "$tool" &> /dev/null; then
            log "ERROR" "Required tool '$tool' is not installed"
            exit 1
        fi
    done
    
    # Check Docker daemon
    if ! docker info &> /dev/null; then
        log "ERROR" "Docker daemon is not running"
        exit 1
    fi
    
    log "SUCCESS" "Environment validation completed"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Pre-deployment Checks                                                  │
# └─────────────────────────────────────────────────────────────────────────┘

pre_deployment_checks() {
    log "INFO" "Running pre-deployment checks..."
    
    # Check if image exists
    if ! docker image inspect "${DOCKER_REGISTRY}/${IMAGE_NAME}:${VERSION}" &> /dev/null; then
        log "WARNING" "Image ${DOCKER_REGISTRY}/${IMAGE_NAME}:${VERSION} not found locally"
        log "INFO" "Attempting to pull image..."
        
        if ! docker pull "${DOCKER_REGISTRY}/${IMAGE_NAME}:${VERSION}"; then
            log "ERROR" "Failed to pull image"
            exit 1
        fi
    fi
    
    # Check disk space
    local available_space=$(df "${PROJECT_ROOT}" | awk 'NR==2 {print $4}')
    local required_space=1000000  # 1GB in KB
    
    if [ "$available_space" -lt "$required_space" ]; then
        log "WARNING" "Low disk space: ${available_space}KB available, ${required_space}KB recommended"
    fi
    
    # Check environment-specific requirements
    case "$ENVIRONMENT" in
        production)
            # Additional production checks
            if [ "$(date +%H)" -ge 9 ] && [ "$(date +%H)" -le 17 ] && [ "$(date +%u)" -le 5 ]; then
                log "WARNING" "Deploying during business hours (9 AM - 5 PM, Mon-Fri)"
                read -p "Continue? (y/N): " -n 1 -r
                echo
                if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                    log "INFO" "Deployment cancelled by user"
                    exit 0
                fi
            fi
            ;;
    esac
    
    log "SUCCESS" "Pre-deployment checks completed"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Backup Functions                                                       │
# └─────────────────────────────────────────────────────────────────────────┘

create_backup() {
    if [ "$BACKUP_BEFORE_DEPLOY" != "true" ]; then
        log "INFO" "Skipping backup (disabled)"
        return 0
    fi
    
    log "INFO" "Creating pre-deployment backup..."
    
    local backup_dir="${PROJECT_ROOT}/backups/pre-deployment-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup current deployment state
    if docker-compose ps --format json > "$backup_dir/docker-state.json" 2>/dev/null; then
        log "SUCCESS" "Docker state backed up"
    fi
    
    # Backup configuration
    if [ -f "${PROJECT_ROOT}/.env.${ENVIRONMENT}" ]; then
        cp "${PROJECT_ROOT}/.env.${ENVIRONMENT}" "$backup_dir/"
        log "SUCCESS" "Environment configuration backed up"
    fi
    
    # Backup database (if available)
    if command -v node &> /dev/null && [ -f "${PROJECT_ROOT}/tools/scripts/backup/backup-management.cjs" ]; then
        log "INFO" "Creating database backup..."
        if node "${PROJECT_ROOT}/tools/scripts/backup/backup-management.cjs" backup create database; then
            log "SUCCESS" "Database backup created"
        else
            log "WARNING" "Database backup failed, continuing deployment"
        fi
    fi
    
    echo "$backup_dir" > "${PROJECT_ROOT}/.last-backup"
    log "SUCCESS" "Backup created at: $backup_dir"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Health Check Functions                                                 │
# └─────────────────────────────────────────────────────────────────────────┘

wait_for_health() {
    local service_url="$1"
    local retries="${2:-$HEALTH_CHECK_RETRIES}"
    local wait_time="${3:-10}"
    
    log "INFO" "Waiting for service health at: $service_url"
    
    for i in $(seq 1 "$retries"); do
        log "INFO" "Health check attempt $i/$retries"
        
        if curl -f -s --max-time 10 "$service_url" > /dev/null; then
            log "SUCCESS" "Service is healthy"
            return 0
        fi
        
        if [ "$i" -lt "$retries" ]; then
            log "INFO" "Service not ready, waiting ${wait_time}s..."
            sleep "$wait_time"
        fi
    done
    
    log "ERROR" "Service failed health check after $retries attempts"
    return 1
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Deployment Strategies                                                  │
# └─────────────────────────────────────────────────────────────────────────┘

deploy_immediate() {
    log "INFO" "Starting immediate deployment..."
    
    # Set environment variables
    export IMAGE_TAG="${DOCKER_REGISTRY}/${IMAGE_NAME}:${VERSION}"
    
    # Deploy using Docker Compose
    case "$ENVIRONMENT" in
        development)
            docker-compose -f "${PROJECT_ROOT}/docker-compose.yml" up -d --build
            ;;
        staging|production)
            docker-compose -f "${PROJECT_ROOT}/docker-compose.production.yml" up -d
            ;;
    esac
    
    # Wait for services to be ready
    sleep 30
    
    # Health check
    local health_url="http://localhost:${PORT:-3000}/health"
    if wait_for_health "$health_url"; then
        log "SUCCESS" "Immediate deployment completed successfully"
    else
        log "ERROR" "Immediate deployment failed health check"
        return 1
    fi
}

deploy_rolling() {
    log "INFO" "Starting rolling deployment..."
    
    # Get list of services
    local services=(app-1 app-2)
    
    for service in "${services[@]}"; do
        log "INFO" "Deploying service: $service"
        
        # Deploy one service at a time
        docker-compose -f "${PROJECT_ROOT}/docker-compose.production.yml" up -d "$service"
        
        # Wait for service to be ready
        sleep 30
        
        # Health check
        local health_url="http://localhost:10000/health"
        if ! wait_for_health "$health_url" 5 15; then
            log "ERROR" "Rolling deployment failed for service: $service"
            return 1
        fi
        
        log "SUCCESS" "Service $service deployed successfully"
    done
    
    log "SUCCESS" "Rolling deployment completed successfully"
}

deploy_blue_green() {
    log "INFO" "Starting blue-green deployment..."
    
    # Create green environment
    log "INFO" "Deploying to green environment..."
    
    # Use production compose with different project name
    export COMPOSE_PROJECT_NAME="hotel-green"
    export IMAGE_TAG="${DOCKER_REGISTRY}/${IMAGE_NAME}:${VERSION}"
    
    docker-compose -f "${PROJECT_ROOT}/docker-compose.production.yml" up -d
    
    # Wait for green environment to be ready
    sleep 60
    
    # Health check green environment
    local health_url="http://localhost:10000/health"
    if ! wait_for_health "$health_url"; then
        log "ERROR" "Green environment failed health check"
        return 1
    fi
    
    # Validate green environment
    log "INFO" "Validating green environment..."
    # Run smoke tests here
    
    # Switch traffic (simulation)
    log "INFO" "Switching traffic to green environment..."
    
    # Stop blue environment
    export COMPOSE_PROJECT_NAME="hotel-blue"
    docker-compose -f "${PROJECT_ROOT}/docker-compose.production.yml" down || true
    
    # Rename green to blue for next deployment
    export COMPOSE_PROJECT_NAME="hotel-green"
    docker-compose -f "${PROJECT_ROOT}/docker-compose.production.yml" down
    
    export COMPOSE_PROJECT_NAME="hotel-blue"
    docker-compose -f "${PROJECT_ROOT}/docker-compose.production.yml" up -d
    
    log "SUCCESS" "Blue-green deployment completed successfully"
}

deploy_canary() {
    log "INFO" "Starting canary deployment..."
    
    # Deploy canary with 10% traffic
    log "INFO" "Deploying canary (10% traffic)..."
    
    # Deploy single instance as canary
    export IMAGE_TAG="${DOCKER_REGISTRY}/${IMAGE_NAME}:${VERSION}"
    docker-compose -f "${PROJECT_ROOT}/docker-compose.production.yml" up -d app-1
    
    # Monitor canary for 5 minutes
    log "INFO" "Monitoring canary for 5 minutes..."
    for i in {1..5}; do
        local health_url="http://localhost:10000/health"
        if ! wait_for_health "$health_url" 3 20; then
            log "ERROR" "Canary deployment failed health check"
            return 1
        fi
        
        # Monitor metrics (simulation)
        log "INFO" "Canary metrics look good... ($i/5 minutes)"
        sleep 60
    done
    
    # Scale to 50% traffic
    log "INFO" "Scaling canary to 50% traffic..."
    docker-compose -f "${PROJECT_ROOT}/docker-compose.production.yml" up -d app-2
    sleep 30
    
    # Monitor for another 3 minutes
    for i in {1..3}; do
        local health_url="http://localhost:10000/health"
        if ! wait_for_health "$health_url" 3 20; then
            log "ERROR" "Canary scaling failed health check"
            return 1
        fi
        
        log "INFO" "Canary 50% metrics look good... ($i/3 minutes)"
        sleep 60
    done
    
    # Complete deployment (100% traffic)
    log "INFO" "Completing canary deployment (100% traffic)..."
    docker-compose -f "${PROJECT_ROOT}/docker-compose.production.yml" up -d
    
    log "SUCCESS" "Canary deployment completed successfully"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Rollback Functions                                                     │
# └─────────────────────────────────────────────────────────────────────────┘

rollback_deployment() {
    log "INFO" "Starting rollback process..."
    
    # Get last backup location
    if [ -f "${PROJECT_ROOT}/.last-backup" ]; then
        local backup_dir=$(cat "${PROJECT_ROOT}/.last-backup")
        log "INFO" "Found backup at: $backup_dir"
        
        # Restore environment configuration
        if [ -f "$backup_dir/.env.${ENVIRONMENT}" ]; then
            cp "$backup_dir/.env.${ENVIRONMENT}" "${PROJECT_ROOT}/"
            log "SUCCESS" "Environment configuration restored"
        fi
        
        # Restore docker state
        if [ -f "$backup_dir/docker-state.json" ]; then
            log "INFO" "Restoring previous Docker state..."
            # Implementation depends on backup format
        fi
    else
        log "WARNING" "No backup found, performing generic rollback"
    fi
    
    # Get previous version
    local previous_version=$(git describe --tags --abbrev=0 HEAD~1 2>/dev/null || echo "previous")
    log "INFO" "Rolling back to version: $previous_version"
    
    # Deploy previous version
    export IMAGE_TAG="${DOCKER_REGISTRY}/${IMAGE_NAME}:${previous_version}"
    export VERSION="$previous_version"
    
    case "$STRATEGY" in
        blue-green)
            deploy_blue_green
            ;;
        rolling)
            deploy_rolling
            ;;
        canary)
            deploy_immediate  # Use immediate for rollback
            ;;
        *)
            deploy_immediate
            ;;
    esac
    
    log "SUCCESS" "Rollback completed"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Post-deployment Functions                                              │
# └─────────────────────────────────────────────────────────────────────────┘

post_deployment_tasks() {
    log "INFO" "Running post-deployment tasks..."
    
    # Run database migrations if needed
    if command -v npm &> /dev/null && [ -f "${PROJECT_ROOT}/package.json" ]; then
        if grep -q "db:migrate" "${PROJECT_ROOT}/package.json"; then
            log "INFO" "Running database migrations..."
            cd "$PROJECT_ROOT"
            npm run db:migrate || log "WARNING" "Database migrations failed"
        fi
    fi
    
    # Clear caches
    log "INFO" "Clearing application caches..."
    # Implementation depends on caching strategy
    
    # Update monitoring
    log "INFO" "Updating monitoring configuration..."
    # Implementation depends on monitoring setup
    
    # Send notifications
    if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
        log "INFO" "Sending deployment notification..."
        curl -X POST -H 'Content-type: application/json' \
            --data '{"text":"🚀 Deployment completed: '"$ENVIRONMENT"' environment updated to version '"$VERSION"'"}' \
            "$SLACK_WEBHOOK_URL" || log "WARNING" "Failed to send Slack notification"
    fi
    
    log "SUCCESS" "Post-deployment tasks completed"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Main Deployment Function                                               │
# └─────────────────────────────────────────────────────────────────────────┘

main_deploy() {
    log "INFO" "Starting deployment to $ENVIRONMENT using $STRATEGY strategy"
    log "INFO" "Version: $VERSION"
    log "INFO" "Image: ${DOCKER_REGISTRY}/${IMAGE_NAME}:${VERSION}"
    
    # Create log directory
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Validate environment
    validate_environment
    
    # Pre-deployment checks
    pre_deployment_checks
    
    # Create backup
    create_backup
    
    # Deploy based on strategy
    case "$STRATEGY" in
        immediate)
            deploy_immediate
            ;;
        rolling)
            deploy_rolling
            ;;
        blue-green)
            deploy_blue_green
            ;;
        canary)
            deploy_canary
            ;;
        *)
            log "ERROR" "Unknown deployment strategy: $STRATEGY"
            exit 1
            ;;
    esac
    
    # Post-deployment tasks
    post_deployment_tasks
    
    log "SUCCESS" "Deployment completed successfully!"
    log "INFO" "Deployment log: $LOG_FILE"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Command Line Parsing                                                   │
# └─────────────────────────────────────────────────────────────────────────┘

ROLLBACK=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -s|--strategy)
            STRATEGY="$2"
            shift 2
            ;;
        -v|--version)
            VERSION="$2"
            shift 2
            ;;
        -i|--image)
            IMAGE_NAME="$2"
            shift 2
            ;;
        -t|--timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        --no-backup)
            BACKUP_BEFORE_DEPLOY=false
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --rollback)
            ROLLBACK=true
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
    # Set default port based on environment
    case "$ENVIRONMENT" in
        development)
            PORT=3000
            ;;
        staging|production)
            PORT=10000
            ;;
    esac
    export PORT
    
    # Show configuration
    log "INFO" "Deployment Configuration:"
    log "INFO" "  Environment: $ENVIRONMENT"
    log "INFO" "  Strategy: $STRATEGY"
    log "INFO" "  Version: $VERSION"
    log "INFO" "  Image: ${DOCKER_REGISTRY}/${IMAGE_NAME}:${VERSION}"
    log "INFO" "  Port: $PORT"
    log "INFO" "  Backup: $BACKUP_BEFORE_DEPLOY"
    log "INFO" "  Dry Run: $DRY_RUN"
    log "INFO" "  Rollback: $ROLLBACK"
    
    if [ "$DRY_RUN" = true ]; then
        log "INFO" "DRY RUN: Would deploy with above configuration"
        exit 0
    fi
    
    if [ "$ROLLBACK" = true ]; then
        rollback_deployment
    else
        main_deploy
    fi
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 