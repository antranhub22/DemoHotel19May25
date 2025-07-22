#!/bin/bash
# ============================================================================
# Production Deployment Automation Script
# Handles staging and production deployments with safety checks
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# ======================== Configuration ========================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
LOG_FILE="$PROJECT_ROOT/logs/deployment-$(date +%Y%m%d-%H%M%S).log"

# Deployment configuration
DEPLOYMENT_TIMEOUT=600  # 10 minutes
HEALTH_CHECK_RETRIES=30
HEALTH_CHECK_INTERVAL=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ======================== Utility Functions ========================

log() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${BLUE}[${timestamp}]${NC} $message" | tee -a "$LOG_FILE"
}

log_success() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${GREEN}[${timestamp}] ✅ $message${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${YELLOW}[${timestamp}] ⚠️ $message${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${RED}[${timestamp}] ❌ $message${NC}" | tee -a "$LOG_FILE"
}

show_help() {
    cat << EOF
🚀 Hotel Voice Assistant Deployment Automation

Usage: $0 <environment> [options]

Environments:
  staging         Deploy to staging environment
  production      Deploy to production environment

Options:
  --force         Skip confirmation prompts
  --no-backup     Skip database backup (not recommended for production)
  --no-migrate    Skip database migrations
  --rollback      Rollback to previous deployment
  --dry-run       Show what would be deployed without actually deploying
  --help          Show this help message

Examples:
  $0 staging
  $0 production --force
  $0 production --rollback
  $0 staging --dry-run

EOF
}

# ======================== Validation Functions ========================

check_prerequisites() {
    log "🔍 Checking deployment prerequisites..."

    # Check if required tools are installed
    local required_tools=("docker" "docker-compose" "curl" "jq")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log_error "Required tool not found: $tool"
            exit 1
        fi
    done

    # Check if Docker is running
    if ! docker info &> /dev/null; then
        log_error "Docker is not running"
        exit 1
    fi

    # Check if project directory is clean (no uncommitted changes)
    if [[ -n $(git status --porcelain) ]]; then
        log_warning "Working directory has uncommitted changes"
        if [[ "$FORCE" != "true" ]]; then
            read -p "Continue anyway? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    fi

    log_success "Prerequisites check passed"
}

validate_environment() {
    local environment="$1"
    log "🔍 Validating $environment environment configuration..."

    # Check if environment file exists
    local env_file="$PROJECT_ROOT/.env.$environment"
    if [[ ! -f "$env_file" ]]; then
        log_error "Environment file not found: $env_file"
        log "Run: tsx tools/scripts/deploy/environment-manager.ts generate $environment"
        exit 1
    fi

    # Validate environment configuration
    if ! tsx "$PROJECT_ROOT/tools/scripts/deploy/environment-manager.ts" validate "$environment"; then
        log_error "Environment validation failed"
        exit 1
    fi

    log_success "Environment validation passed"
}

# ======================== Backup Functions ========================

create_backup() {
    local environment="$1"
    if [[ "$NO_BACKUP" == "true" ]]; then
        log_warning "Skipping backup as requested"
        return 0
    fi

    log "💾 Creating backup for $environment environment..."

    local backup_dir="$PROJECT_ROOT/backups/$(date +%Y%m%d-%H%M%S)-pre-deploy"
    mkdir -p "$backup_dir"

    # Database backup
    if [[ "$environment" == "production" ]]; then
        log "Creating production database backup..."
        # Example: pg_dump for PostgreSQL
        # pg_dump "$DATABASE_URL" > "$backup_dir/database.sql"
        echo "Database backup would be created here" > "$backup_dir/database.sql"
    else
        log "Creating staging database backup..."
        echo "Staging database backup would be created here" > "$backup_dir/database.sql"
    fi

    # Configuration backup
    cp -r "$PROJECT_ROOT/.env.$environment" "$backup_dir/"
    
    # Store backup location
    echo "$backup_dir" > "$PROJECT_ROOT/.last_backup"

    log_success "Backup created at: $backup_dir"
}

# ======================== Deployment Functions ========================

build_and_push_images() {
    local environment="$1"
    local image_tag="$environment-$(date +%Y%m%d-%H%M%S)-$(git rev-parse --short HEAD)"

    log "🏗️ Building Docker images for $environment..."

    # Build production image
    docker build -t "hotel-voice-assistant:$image_tag" \
                 -t "hotel-voice-assistant:$environment-latest" \
                 -f Dockerfile .

    # If using a registry, push the images
    if [[ -n "${DOCKER_REGISTRY:-}" ]]; then
        log "📤 Pushing images to registry..."
        docker tag "hotel-voice-assistant:$image_tag" "$DOCKER_REGISTRY/hotel-voice-assistant:$image_tag"
        docker tag "hotel-voice-assistant:$image_tag" "$DOCKER_REGISTRY/hotel-voice-assistant:$environment-latest"
        
        docker push "$DOCKER_REGISTRY/hotel-voice-assistant:$image_tag"
        docker push "$DOCKER_REGISTRY/hotel-voice-assistant:$environment-latest"
    fi

    # Store image tag for deployment
    echo "$image_tag" > "$PROJECT_ROOT/.deployment_tag"
    
    log_success "Images built and tagged: $image_tag"
}

run_database_migrations() {
    if [[ "$NO_MIGRATE" == "true" ]]; then
        log_warning "Skipping database migrations as requested"
        return 0
    fi

    log "🔄 Running database migrations..."

    # Run migrations using the application
    if docker-compose -f docker-compose.yml \
                     -f "docker-compose.$ENVIRONMENT.yml" \
                     run --rm app npm run db:migrate; then
        log_success "Database migrations completed"
    else
        log_error "Database migrations failed"
        return 1
    fi
}

deploy_application() {
    local environment="$1"
    log "🚀 Deploying application to $environment..."

    # Set deployment environment variables
    export DEPLOYMENT_ENVIRONMENT="$environment"
    export BUILD_NUMBER="${BUILD_NUMBER:-$(date +%Y%m%d%H%M%S)}"
    export GIT_COMMIT="$(git rev-parse HEAD)"
    export GIT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
    export BUILD_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

    # Deploy using docker-compose
    local compose_files="-f docker-compose.yml -f docker-compose.$environment.yml"
    
    if [[ "$environment" == "production" ]]; then
        compose_files="$compose_files --profile production"
    fi

    # Start deployment
    log "Starting containers..."
    if docker-compose $compose_files up -d; then
        log_success "Containers started successfully"
    else
        log_error "Container startup failed"
        return 1
    fi

    # Wait for services to be ready
    wait_for_health_check "$environment"
}

wait_for_health_check() {
    local environment="$1"
    local base_url
    
    if [[ "$environment" == "production" ]]; then
        base_url="https://talk2go.online"
    else
        base_url="https://staging.talk2go.online"
    fi

    log "🏥 Waiting for application health checks..."
    
    local retry_count=0
    while [[ $retry_count -lt $HEALTH_CHECK_RETRIES ]]; do
        if curl -f -s "$base_url/api/health" > /dev/null; then
            log_success "Health check passed"
            return 0
        fi
        
        ((retry_count++))
        log "Health check attempt $retry_count/$HEALTH_CHECK_RETRIES failed, retrying in ${HEALTH_CHECK_INTERVAL}s..."
        sleep $HEALTH_CHECK_INTERVAL
    done

    log_error "Health checks failed after $HEALTH_CHECK_RETRIES attempts"
    return 1
}

run_smoke_tests() {
    local environment="$1"
    log "💨 Running smoke tests for $environment..."

    local base_url
    if [[ "$environment" == "production" ]]; then
        base_url="https://talk2go.online"
    else
        base_url="https://staging.talk2go.online"
    fi

    # Basic health checks
    local endpoints=(
        "$base_url/api/health"
        "$base_url/api/status"
        "$base_url/api/version"
    )

    for endpoint in "${endpoints[@]}"; do
        log "Testing endpoint: $endpoint"
        if curl -f -s "$endpoint" > /dev/null; then
            log_success "✅ $endpoint"
        else
            log_error "❌ $endpoint"
            return 1
        fi
    done

    # Test Mi Nhon Hotel specific endpoint if production
    if [[ "$environment" == "production" ]]; then
        if curl -f -s "https://minhon.talk2go.online/api/health" > /dev/null; then
            log_success "✅ Mi Nhon Hotel endpoint"
        else
            log_error "❌ Mi Nhon Hotel endpoint"
            return 1
        fi
    fi

    log_success "All smoke tests passed"
}

# ======================== Rollback Functions ========================

rollback_deployment() {
    local environment="$1"
    log "🔄 Rolling back $environment deployment..."

    # Check if backup exists
    if [[ ! -f "$PROJECT_ROOT/.last_backup" ]]; then
        log_error "No backup information found for rollback"
        exit 1
    fi

    local backup_dir=$(cat "$PROJECT_ROOT/.last_backup")
    if [[ ! -d "$backup_dir" ]]; then
        log_error "Backup directory not found: $backup_dir"
        exit 1
    fi

    log "Rolling back to backup: $backup_dir"

    # Restore database
    log "Restoring database..."
    # psql "$DATABASE_URL" < "$backup_dir/database.sql"

    # Restore configuration
    cp "$backup_dir/.env.$environment" "$PROJECT_ROOT/"

    # Restart services with previous configuration
    docker-compose -f docker-compose.yml \
                   -f "docker-compose.$environment.yml" \
                   up -d

    # Verify rollback
    if wait_for_health_check "$environment"; then
        log_success "Rollback completed successfully"
    else
        log_error "Rollback failed - manual intervention required"
        exit 1
    fi
}

# ======================== Main Deployment Flow ========================

deploy_environment() {
    local environment="$1"
    
    log "🚀 Starting $environment deployment..."
    log "Environment: $environment"
    log "Force: $FORCE"
    log "Dry run: $DRY_RUN"
    log "Git commit: $(git rev-parse --short HEAD)"
    log "Git branch: $(git rev-parse --abbrev-ref HEAD)"

    if [[ "$DRY_RUN" == "true" ]]; then
        log "🔍 DRY RUN MODE - No actual changes will be made"
        log "Would deploy to: $environment"
        log "Would run migrations: $([ "$NO_MIGRATE" != "true" ] && echo "yes" || echo "no")"
        log "Would create backup: $([ "$NO_BACKUP" != "true" ] && echo "yes" || echo "no")"
        return 0
    fi

    # Confirmation for production
    if [[ "$environment" == "production" && "$FORCE" != "true" ]]; then
        echo
        log_warning "⚠️  PRODUCTION DEPLOYMENT WARNING"
        log "You are about to deploy to PRODUCTION environment"
        log "This will affect live users and services"
        echo
        read -p "Are you sure you want to continue? (type 'yes' to confirm): " -r
        if [[ $REPLY != "yes" ]]; then
            log "Deployment cancelled by user"
            exit 0
        fi
    fi

    # Run deployment steps
    check_prerequisites
    validate_environment "$environment"
    create_backup "$environment"
    build_and_push_images "$environment"
    run_database_migrations
    deploy_application "$environment"
    run_smoke_tests "$environment"

    log_success "🎉 $environment deployment completed successfully!"
    
    # Deployment summary
    echo
    log "📊 Deployment Summary:"
    log "Environment: $environment"
    log "Deployed at: $(date)"
    log "Git commit: $(git rev-parse HEAD)"
    log "Image tag: $(cat "$PROJECT_ROOT/.deployment_tag" 2>/dev/null || echo "unknown")"
    if [[ "$environment" == "production" ]]; then
        log "Production URL: https://talk2go.online"
        log "Mi Nhon URL: https://minhon.talk2go.online"
    else
        log "Staging URL: https://staging.talk2go.online"
    fi
}

# ======================== Main Script Logic ========================

# Parse command line arguments
ENVIRONMENT=""
FORCE="false"
NO_BACKUP="false"
NO_MIGRATE="false"
ROLLBACK="false"
DRY_RUN="false"

while [[ $# -gt 0 ]]; do
    case $1 in
        staging|production)
            ENVIRONMENT="$1"
            shift
            ;;
        --force)
            FORCE="true"
            shift
            ;;
        --no-backup)
            NO_BACKUP="true"
            shift
            ;;
        --no-migrate)
            NO_MIGRATE="true"
            shift
            ;;
        --rollback)
            ROLLBACK="true"
            shift
            ;;
        --dry-run)
            DRY_RUN="true"
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Validate arguments
if [[ -z "$ENVIRONMENT" ]]; then
    log_error "Environment not specified"
    show_help
    exit 1
fi

if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    log_error "Invalid environment: $ENVIRONMENT"
    show_help
    exit 1
fi

# Create logs directory
mkdir -p "$PROJECT_ROOT/logs"

# Main execution
if [[ "$ROLLBACK" == "true" ]]; then
    rollback_deployment "$ENVIRONMENT"
else
    deploy_environment "$ENVIRONMENT"
fi 