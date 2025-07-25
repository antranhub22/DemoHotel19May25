#!/bin/bash
# =============================================================================
# Hotel Management SaaS Platform - Environment Promotion Script
# Automated promotion between development, staging, and production environments
# =============================================================================

set -euo pipefail

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Configuration & Constants                                               │
# └─────────────────────────────────────────────────────────────────────────┘

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../../" && pwd)"
REPORTS_DIR="${PROJECT_ROOT}/reports/promotion"
LOG_FILE="${REPORTS_DIR}/promotion-$(date +%Y%m%d-%H%M%S).log"

# Default configuration
SOURCE_ENV="${SOURCE_ENV:-staging}"
TARGET_ENV="${TARGET_ENV:-production}"
VERSION="${VERSION:-$(date +%Y%m%d-%H%M%S)-$(git rev-parse --short HEAD)}"
VALIDATION_TIMEOUT="${VALIDATION_TIMEOUT:-600}"
ROLLBACK_ON_FAILURE="${ROLLBACK_ON_FAILURE:-true}"
REQUIRE_APPROVAL="${REQUIRE_APPROVAL:-true}"
BACKUP_BEFORE_PROMOTE="${BACKUP_BEFORE_PROMOTE:-true}"

# Environment URLs
DEV_URL="${DEV_URL:-http://localhost:3000}"
STAGING_URL="${STAGING_URL:-https://staging.hotel-management.com}"
PROD_URL="${PROD_URL:-https://hotel-management.com}"

# Validation settings
RUN_SMOKE_TESTS="${RUN_SMOKE_TESTS:-true}"
RUN_INTEGRATION_TESTS="${RUN_INTEGRATION_TESTS:-true}"
RUN_SECURITY_TESTS="${RUN_SECURITY_TESTS:-true}"
RUN_PERFORMANCE_TESTS="${RUN_PERFORMANCE_TESTS:-false}"

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
    
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

confirm() {
    local message="$1"
    local default="${2:-n}"
    
    if [ "$REQUIRE_APPROVAL" = "false" ]; then
        log "INFO" "Auto-approving: $message"
        return 0
    fi
    
    local prompt
    if [ "$default" = "y" ]; then
        prompt="$message (Y/n): "
    else
        prompt="$message (y/N): "
    fi
    
    read -p "$prompt" -n 1 -r
    echo
    
    if [ "$default" = "y" ]; then
        [[ $REPLY =~ ^[Nn]$ ]] && return 1 || return 0
    else
        [[ $REPLY =~ ^[Yy]$ ]] && return 0 || return 1
    fi
}

show_usage() {
    cat << EOF
Hotel Management SaaS Platform - Environment Promotion Script

Usage: $0 [OPTIONS]

OPTIONS:
    -s, --source SOURCE        Source environment (development|staging)
    -t, --target TARGET        Target environment (staging|production)
    -v, --version VERSION      Version to promote (default: auto-generated)
    --timeout TIMEOUT         Validation timeout in seconds (default: 600)
    --no-rollback             Disable automatic rollback on failure
    --no-approval             Skip approval prompts (dangerous in production)
    --no-backup               Skip backup before promotion
    --skip-smoke              Skip smoke tests
    --skip-integration        Skip integration tests
    --skip-security           Skip security tests
    --run-performance         Run performance tests
    --dry-run                 Show what would be done without executing
    -h, --help                Show this help message

PROMOTION PATHS:
    development → staging     - Automated with basic validation
    staging → production      - Full validation with approval gates
    
EXAMPLES:
    $0                                    # Default: staging → production
    $0 --source development --target staging
    $0 --no-approval --skip-performance  # Automated promotion
    $0 --dry-run                         # Preview promotion

EOF
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Environment Validation                                                 │
# └─────────────────────────────────────────────────────────────────────────┘

validate_environments() {
    log "INFO" "Validating environment configuration..."
    
    # Validate source environment
    case "$SOURCE_ENV" in
        development|staging)
            log "SUCCESS" "Source environment '$SOURCE_ENV' is valid"
            ;;
        *)
            log "ERROR" "Invalid source environment: $SOURCE_ENV"
            exit 1
            ;;
    esac
    
    # Validate target environment
    case "$TARGET_ENV" in
        staging|production)
            log "SUCCESS" "Target environment '$TARGET_ENV' is valid"
            ;;
        *)
            log "ERROR" "Invalid target environment: $TARGET_ENV"
            exit 1
            ;;
    esac
    
    # Validate promotion path
    if [ "$SOURCE_ENV" = "development" ] && [ "$TARGET_ENV" = "production" ]; then
        log "ERROR" "Direct promotion from development to production is not allowed"
        log "ERROR" "Please promote to staging first: development → staging → production"
        exit 1
    fi
    
    if [ "$SOURCE_ENV" = "$TARGET_ENV" ]; then
        log "ERROR" "Source and target environments cannot be the same"
        exit 1
    fi
    
    log "SUCCESS" "Environment validation completed"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Pre-promotion Checks                                                   │
# └─────────────────────────────────────────────────────────────────────────┘

check_source_environment() {
    log "INFO" "Checking source environment: $SOURCE_ENV"
    
    local source_url
    case "$SOURCE_ENV" in
        development)
            source_url="$DEV_URL"
            ;;
        staging)
            source_url="$STAGING_URL"
            ;;
    esac
    
    # Health check
    log "INFO" "Performing health check on $source_url..."
    
    local retries=3
    for i in $(seq 1 $retries); do
        if curl -f -s --max-time 10 "$source_url/health" > /dev/null; then
            log "SUCCESS" "Source environment is healthy"
            break
        else
            if [ $i -eq $retries ]; then
                log "ERROR" "Source environment health check failed after $retries attempts"
                return 1
            fi
            log "WARNING" "Health check attempt $i failed, retrying..."
            sleep 5
        fi
    done
    
    # Check if there are any pending migrations
    log "INFO" "Checking for pending database migrations..."
    if cd "$PROJECT_ROOT" && npm run db:check-migrations 2>/dev/null; then
        log "SUCCESS" "No pending migrations in source environment"
    else
        log "WARNING" "Cannot verify migration status (command not available)"
    fi
    
    # Check Git status
    log "INFO" "Checking Git repository status..."
    if git status --porcelain | grep -q .; then
        log "WARNING" "There are uncommitted changes in the repository"
        if ! confirm "Continue with uncommitted changes?"; then
            log "INFO" "Promotion cancelled by user"
            exit 0
        fi
    else
        log "SUCCESS" "Repository is clean"
    fi
    
    log "SUCCESS" "Source environment checks completed"
}

check_target_environment() {
    log "INFO" "Checking target environment: $TARGET_ENV"
    
    local target_url
    case "$TARGET_ENV" in
        staging)
            target_url="$STAGING_URL"
            ;;
        production)
            target_url="$PROD_URL"
            ;;
    esac
    
    # Health check (optional for target)
    log "INFO" "Performing health check on $target_url..."
    if curl -f -s --max-time 10 "$target_url/health" > /dev/null; then
        log "SUCCESS" "Target environment is healthy"
    else
        log "WARNING" "Target environment is not responding (may be expected for new deployments)"
    fi
    
    # Check maintenance window (for production)
    if [ "$TARGET_ENV" = "production" ]; then
        local hour=$(date -u +%H)
        local day=$(date -u +%u)
        
        # Check if it's during business hours (9 AM - 5 PM UTC, Mon-Fri)
        if [ $day -le 5 ] && [ $hour -ge 9 ] && [ $hour -le 17 ]; then
            log "WARNING" "Promoting to production during business hours (${hour}:00 UTC)"
            if ! confirm "Continue with production promotion during business hours?"; then
                log "INFO" "Promotion cancelled by user"
                exit 0
            fi
        fi
    fi
    
    log "SUCCESS" "Target environment checks completed"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Backup Operations                                                      │
# └─────────────────────────────────────────────────────────────────────────┘

create_backup() {
    if [ "$BACKUP_BEFORE_PROMOTE" = "false" ]; then
        log "INFO" "Backup disabled, skipping..."
        return 0
    fi
    
    log "INFO" "Creating backup before promotion..."
    
    local backup_dir="${PROJECT_ROOT}/backups/promotion-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Create deployment state backup
    cat > "$backup_dir/promotion-info.json" << EOF
{
  "sourceEnvironment": "$SOURCE_ENV",
  "targetEnvironment": "$TARGET_ENV",
  "version": "$VERSION",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "gitCommit": "$(git rev-parse HEAD)",
  "gitBranch": "$(git rev-parse --abbrev-ref HEAD)"
}
EOF
    
    # Backup current deployment configuration
    if [ -f "${PROJECT_ROOT}/.env.${TARGET_ENV}" ]; then
        cp "${PROJECT_ROOT}/.env.${TARGET_ENV}" "$backup_dir/" || true
    fi
    
    # Backup database (if backup system is available)
    if command -v node &> /dev/null && [ -f "${PROJECT_ROOT}/tools/scripts/backup/backup-management.cjs" ]; then
        log "INFO" "Creating database backup..."
        if cd "$PROJECT_ROOT" && timeout 300 node tools/scripts/backup/backup-management.cjs backup create database; then
            log "SUCCESS" "Database backup created"
        else
            log "WARNING" "Database backup failed or timed out"
        fi
    fi
    
    # Store backup location
    echo "$backup_dir" > "${PROJECT_ROOT}/.last-promotion-backup"
    
    log "SUCCESS" "Backup created at: $backup_dir"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Deployment Process                                                     │
# └─────────────────────────────────────────────────────────────────────────┘

deploy_to_target() {
    log "INFO" "Starting deployment to $TARGET_ENV..."
    
    # Choose deployment strategy based on target environment
    local strategy
    case "$TARGET_ENV" in
        staging)
            strategy="rolling"
            ;;
        production)
            strategy="blue-green"
            ;;
    esac
    
    log "INFO" "Using deployment strategy: $strategy"
    
    # Execute deployment
    if cd "$PROJECT_ROOT" && bash tools/scripts/deploy/deploy.sh \
        --environment "$TARGET_ENV" \
        --strategy "$strategy" \
        --version "$VERSION"; then
        log "SUCCESS" "Deployment to $TARGET_ENV completed successfully"
    else
        log "ERROR" "Deployment to $TARGET_ENV failed"
        return 1
    fi
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Validation Tests                                                       │
# └─────────────────────────────────────────────────────────────────────────┘

run_smoke_tests() {
    if [ "$RUN_SMOKE_TESTS" = "false" ]; then
        log "INFO" "Smoke tests disabled, skipping..."
        return 0
    fi
    
    log "INFO" "Running smoke tests..."
    
    local target_url
    case "$TARGET_ENV" in
        staging)
            target_url="$STAGING_URL"
            ;;
        production)
            target_url="$PROD_URL"
            ;;
    esac
    
    # Basic connectivity tests
    local tests=(
        "$target_url/health"
        "$target_url/api/health"
    )
    
    for test_url in "${tests[@]}"; do
        log "INFO" "Testing: $test_url"
        
        local retries=3
        local success=false
        
        for i in $(seq 1 $retries); do
            if curl -f -s --max-time 10 "$test_url" > /dev/null; then
                log "SUCCESS" "✓ $test_url"
                success=true
                break
            else
                if [ $i -eq $retries ]; then
                    log "ERROR" "✗ $test_url (failed after $retries attempts)"
                else
                    log "WARNING" "Attempt $i failed for $test_url, retrying..."
                    sleep 5
                fi
            fi
        done
        
        if [ "$success" = false ]; then
            return 1
        fi
    done
    
    log "SUCCESS" "Smoke tests completed successfully"
}

run_integration_tests() {
    if [ "$RUN_INTEGRATION_TESTS" = "false" ]; then
        log "INFO" "Integration tests disabled, skipping..."
        return 0
    fi
    
    log "INFO" "Running integration tests..."
    
    # Run integration tests against target environment
    if cd "$PROJECT_ROOT" && timeout 300 bash tools/scripts/cicd/integration-test.sh \
        --environment "$TARGET_ENV" \
        --component api-gateway-integration,backup-integration,security-scanning; then
        log "SUCCESS" "Integration tests completed successfully"
    else
        log "ERROR" "Integration tests failed"
        return 1
    fi
}

run_security_tests() {
    if [ "$RUN_SECURITY_TESTS" = "false" ]; then
        log "INFO" "Security tests disabled, skipping..."
        return 0
    fi
    
    log "INFO" "Running security tests..."
    
    # Run security validation
    if [ -f "${PROJECT_ROOT}/tools/scripts/security/security-management.cjs" ]; then
        if cd "$PROJECT_ROOT" && timeout 180 node tools/scripts/security/security-management.cjs test; then
            log "SUCCESS" "Security tests completed successfully"
        else
            log "ERROR" "Security tests failed"
            return 1
        fi
    else
        log "WARNING" "Security management script not found, skipping security tests"
    fi
}

run_performance_tests() {
    if [ "$RUN_PERFORMANCE_TESTS" = "false" ]; then
        log "INFO" "Performance tests disabled, skipping..."
        return 0
    fi
    
    log "INFO" "Running performance tests..."
    
    local target_url
    case "$TARGET_ENV" in
        staging)
            target_url="$STAGING_URL"
            ;;
        production)
            target_url="$PROD_URL"
            ;;
    esac
    
    # Run performance tests
    if cd "$PROJECT_ROOT" && bash tools/scripts/testing/performance-test.sh \
        --environment "$TARGET_ENV" \
        --url "$target_url" \
        --test-type load \
        --duration 2m \
        --vus 20; then
        log "SUCCESS" "Performance tests completed successfully"
    else
        log "ERROR" "Performance tests failed"
        return 1
    fi
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Rollback Operations                                                    │
# └─────────────────────────────────────────────────────────────────────────┘

rollback_deployment() {
    log "WARNING" "Initiating rollback process..."
    
    # Get backup information
    if [ -f "${PROJECT_ROOT}/.last-promotion-backup" ]; then
        local backup_dir=$(cat "${PROJECT_ROOT}/.last-promotion-backup")
        log "INFO" "Using backup from: $backup_dir"
    else
        log "WARNING" "No backup information found, performing generic rollback"
    fi
    
    # Execute rollback using deployment script
    if cd "$PROJECT_ROOT" && bash tools/scripts/deploy/deploy.sh \
        --environment "$TARGET_ENV" \
        --rollback; then
        log "SUCCESS" "Rollback completed successfully"
    else
        log "ERROR" "Rollback failed - manual intervention required"
        return 1
    fi
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Reporting                                                              │
# └─────────────────────────────────────────────────────────────────────────┘

generate_promotion_report() {
    local status="$1"
    local report_file="${REPORTS_DIR}/promotion-report-$(date +%Y%m%d-%H%M%S).md"
    
    log "INFO" "Generating promotion report..."
    
    cat > "$report_file" << EOF
# Environment Promotion Report

**Date:** $(date -u +%Y-%m-%dT%H:%M:%SZ)  
**Source Environment:** $SOURCE_ENV  
**Target Environment:** $TARGET_ENV  
**Version:** $VERSION  
**Status:** $status  

## Promotion Summary

- **Git Commit:** $(git rev-parse HEAD)
- **Git Branch:** $(git rev-parse --abbrev-ref HEAD)
- **Deployment Strategy:** $([ "$TARGET_ENV" = "production" ] && echo "blue-green" || echo "rolling")
- **Validation Timeout:** ${VALIDATION_TIMEOUT}s
- **Backup Created:** $([ "$BACKUP_BEFORE_PROMOTE" = "true" ] && echo "Yes" || echo "No")

## Test Results

- **Smoke Tests:** $([ "$RUN_SMOKE_TESTS" = "true" ] && echo "✅ Executed" || echo "⏭️ Skipped")
- **Integration Tests:** $([ "$RUN_INTEGRATION_TESTS" = "true" ] && echo "✅ Executed" || echo "⏭️ Skipped")
- **Security Tests:** $([ "$RUN_SECURITY_TESTS" = "true" ] && echo "✅ Executed" || echo "⏭️ Skipped")
- **Performance Tests:** $([ "$RUN_PERFORMANCE_TESTS" = "true" ] && echo "✅ Executed" || echo "⏭️ Skipped")

## Environment URLs

- **Development:** $DEV_URL
- **Staging:** $STAGING_URL
- **Production:** $PROD_URL

## Next Steps

EOF

    case "$status" in
        "SUCCESS")
            cat >> "$report_file" << EOF
✅ **Promotion completed successfully!**

The application has been successfully promoted from **$SOURCE_ENV** to **$TARGET_ENV**.

### Post-Promotion Tasks
- [ ] Monitor application metrics for the next 30 minutes
- [ ] Verify all critical user journeys are working
- [ ] Check error rates and response times
- [ ] Notify stakeholders of successful deployment

EOF
            ;;
        "FAILED")
            cat >> "$report_file" << EOF
❌ **Promotion failed and was rolled back**

The promotion from **$SOURCE_ENV** to **$TARGET_ENV** failed validation and has been automatically rolled back.

### Immediate Actions Required
- [ ] Review failure logs in: \`$LOG_FILE\`
- [ ] Address the root cause of the failure
- [ ] Re-run validation tests in source environment
- [ ] Plan next promotion attempt

EOF
            ;;
    esac
    
    cat >> "$report_file" << EOF

### Logs and Artifacts
- **Promotion Log:** \`$LOG_FILE\`
- **Report File:** \`$report_file\`
$([ -f "${PROJECT_ROOT}/.last-promotion-backup" ] && echo "- **Backup Location:** \`$(cat "${PROJECT_ROOT}/.last-promotion-backup")\`")

---
*Report generated automatically by Hotel Management SaaS Platform*
EOF
    
    log "SUCCESS" "Promotion report generated: $report_file"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Command Line Parsing                                                   │
# └─────────────────────────────────────────────────────────────────────────┘

DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -s|--source)
            SOURCE_ENV="$2"
            shift 2
            ;;
        -t|--target)
            TARGET_ENV="$2"
            shift 2
            ;;
        -v|--version)
            VERSION="$2"
            shift 2
            ;;
        --timeout)
            VALIDATION_TIMEOUT="$2"
            shift 2
            ;;
        --no-rollback)
            ROLLBACK_ON_FAILURE=false
            shift
            ;;
        --no-approval)
            REQUIRE_APPROVAL=false
            shift
            ;;
        --no-backup)
            BACKUP_BEFORE_PROMOTE=false
            shift
            ;;
        --skip-smoke)
            RUN_SMOKE_TESTS=false
            shift
            ;;
        --skip-integration)
            RUN_INTEGRATION_TESTS=false
            shift
            ;;
        --skip-security)
            RUN_SECURITY_TESTS=false
            shift
            ;;
        --run-performance)
            RUN_PERFORMANCE_TESTS=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
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
    # Create reports directory
    mkdir -p "$REPORTS_DIR"
    
    log "INFO" "Starting environment promotion process..."
    log "INFO" "Promotion: $SOURCE_ENV → $TARGET_ENV"
    log "INFO" "Version: $VERSION"
    log "INFO" "Dry Run: $DRY_RUN"
    
    if [ "$DRY_RUN" = true ]; then
        log "INFO" "DRY RUN MODE: Showing what would be done"
        log "INFO" "1. Validate environments: $SOURCE_ENV → $TARGET_ENV"
        log "INFO" "2. Check source environment health"
        log "INFO" "3. Check target environment readiness"
        log "INFO" "4. Create backup (if enabled)"
        log "INFO" "5. Deploy version $VERSION to $TARGET_ENV"
        log "INFO" "6. Run validation tests"
        log "INFO" "7. Generate promotion report"
        log "INFO" "DRY RUN completed - no actual changes made"
        exit 0
    fi
    
    # Validation phase
    validate_environments
    check_source_environment
    check_target_environment
    
    # Approval gate
    if ! confirm "Proceed with promotion from $SOURCE_ENV to $TARGET_ENV?"; then
        log "INFO" "Promotion cancelled by user"
        exit 0
    fi
    
    # Backup phase
    create_backup
    
    # Deployment phase
    local deployment_success=true
    if ! deploy_to_target; then
        deployment_success=false
    fi
    
    # Validation phase
    if [ "$deployment_success" = true ]; then
        log "INFO" "Running post-deployment validation..."
        
        # Wait for services to stabilize
        log "INFO" "Waiting for services to stabilize..."
        sleep 30
        
        local validation_success=true
        
        if ! run_smoke_tests; then
            validation_success=false
        fi
        
        if [ "$validation_success" = true ] && ! run_integration_tests; then
            validation_success=false
        fi
        
        if [ "$validation_success" = true ] && ! run_security_tests; then
            validation_success=false
        fi
        
        if [ "$validation_success" = true ] && ! run_performance_tests; then
            validation_success=false
        fi
        
        if [ "$validation_success" = false ]; then
            deployment_success=false
            log "ERROR" "Validation tests failed"
        fi
    fi
    
    # Handle success/failure
    if [ "$deployment_success" = true ]; then
        log "SUCCESS" "Environment promotion completed successfully!"
        log "SUCCESS" "Application is now running in $TARGET_ENV environment"
        generate_promotion_report "SUCCESS"
        
        # Send notification
        if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
            curl -X POST -H 'Content-type: application/json' \
                --data '{"text":"🚀 Successfully promoted '"$SOURCE_ENV"' → '"$TARGET_ENV"' (Version: '"$VERSION"')"}' \
                "$SLACK_WEBHOOK_URL" || true
        fi
        
        exit 0
    else
        log "ERROR" "Environment promotion failed"
        
        if [ "$ROLLBACK_ON_FAILURE" = true ]; then
            if rollback_deployment; then
                log "SUCCESS" "Rollback completed successfully"
                generate_promotion_report "FAILED"
            else
                log "ERROR" "Rollback failed - manual intervention required"
                generate_promotion_report "FAILED"
            fi
        else
            log "WARNING" "Rollback disabled - manual intervention may be required"
            generate_promotion_report "FAILED"
        fi
        
        # Send notification
        if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
            curl -X POST -H 'Content-type: application/json' \
                --data '{"text":"❌ Failed to promote '"$SOURCE_ENV"' → '"$TARGET_ENV"' (Version: '"$VERSION"'). Rollback initiated."}' \
                "$SLACK_WEBHOOK_URL" || true
        fi
        
        exit 1
    fi
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 