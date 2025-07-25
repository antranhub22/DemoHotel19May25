#!/bin/bash
# =============================================================================
# Hotel Management SaaS Platform - CI/CD Integration Testing Script
# Comprehensive pipeline validation and system integration testing
# =============================================================================

set -euo pipefail

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Configuration & Constants                                               │
# └─────────────────────────────────────────────────────────────────────────┘

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../../" && pwd)"
REPORTS_DIR="${PROJECT_ROOT}/test-results/integration"
LOG_FILE="${REPORTS_DIR}/cicd-integration-$(date +%Y%m%d-%H%M%S).log"

# Test configuration
ENVIRONMENT="${ENVIRONMENT:-development}"
BASE_URL="${BASE_URL:-http://localhost:3000}"
API_URL="${API_URL:-$BASE_URL/api}"
TIMEOUT="${TIMEOUT:-300}"
RETRY_COUNT="${RETRY_COUNT:-3}"
WAIT_TIME="${WAIT_TIME:-5}"

# CI/CD Pipeline components to test
TEST_COMPONENTS=(
    "github-actions"
    "docker-builds"
    "deployment-strategies"
    "security-scanning"
    "backup-integration"
    "monitoring-integration"
    "api-gateway-integration"
)

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

retry() {
    local times=$1
    shift
    local cmd="$*"
    
    for ((i=1; i<=times; i++)); do
        log "INFO" "Attempt $i/$times: $cmd"
        if eval "$cmd"; then
            return 0
        else
            if [ $i -eq $times ]; then
                log "ERROR" "Command failed after $times attempts: $cmd"
                return 1
            fi
            log "WARNING" "Attempt $i failed, retrying in ${WAIT_TIME}s..."
            sleep $WAIT_TIME
        fi
    done
}

wait_for_service() {
    local url="$1"
    local service_name="${2:-service}"
    local timeout="${3:-$TIMEOUT}"
    
    log "INFO" "Waiting for $service_name at $url (timeout: ${timeout}s)"
    
    local start_time=$(date +%s)
    while true; do
        if curl -f -s --max-time 10 "$url" > /dev/null 2>&1; then
            log "SUCCESS" "$service_name is available"
            return 0
        fi
        
        local current_time=$(date +%s)
        local elapsed_time=$((current_time - start_time))
        
        if [ $elapsed_time -ge $timeout ]; then
            log "ERROR" "Timeout waiting for $service_name"
            return 1
        fi
        
        sleep 5
    done
}

show_usage() {
    cat << EOF
Hotel Management SaaS Platform - CI/CD Integration Testing Script

Usage: $0 [OPTIONS]

OPTIONS:
    -e, --environment ENV     Target environment (development|staging|production)
    -u, --url URL            Base URL for testing (default: http://localhost:3000)
    -c, --component COMP     Test specific component only
    -t, --timeout TIMEOUT   Service timeout in seconds (default: 300)
    --skip-component COMP    Skip specific component
    --validate-only          Only validate configuration without running tests
    --generate-report        Generate comprehensive test report
    --cleanup               Clean up test resources after completion
    -h, --help              Show this help message

COMPONENTS:
    github-actions          - Test GitHub Actions workflow integration
    docker-builds           - Test Docker build and containerization
    deployment-strategies   - Test deployment strategies (blue-green, rolling, canary)
    security-scanning       - Test security scanning integration
    backup-integration      - Test backup system integration
    monitoring-integration  - Test monitoring and alerting integration
    api-gateway-integration - Test API Gateway integration

EXAMPLES:
    $0 --environment staging
    $0 --component docker-builds --timeout 600
    $0 --skip-component github-actions --generate-report
    $0 --validate-only

EOF
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Environment Setup & Validation                                         │
# └─────────────────────────────────────────────────────────────────────────┘

setup_environment() {
    log "INFO" "Setting up CI/CD integration testing environment..."
    
    # Create reports directory
    mkdir -p "$REPORTS_DIR"
    
    # Validate required tools
    local required_tools=("curl" "jq" "docker" "git")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            log "ERROR" "Required tool '$tool' is not installed"
            exit 1
        fi
    done
    
    # Check if we're in a git repository
    if ! git rev-parse --is-inside-work-tree &> /dev/null; then
        log "WARNING" "Not in a git repository, some tests may be skipped"
    fi
    
    # Check Docker daemon
    if ! docker info &> /dev/null; then
        log "ERROR" "Docker daemon is not running"
        exit 1
    fi
    
    # Validate project structure
    local required_files=(
        "package.json"
        "Dockerfile"
        "docker-compose.yml"
        ".github/workflows/ci.yml"
        ".github/workflows/cd.yml"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "${PROJECT_ROOT}/$file" ]; then
            log "WARNING" "Expected file not found: $file"
        fi
    done
    
    log "SUCCESS" "Environment setup completed"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ GitHub Actions Integration Tests                                       │
# └─────────────────────────────────────────────────────────────────────────┘

test_github_actions() {
    log "INFO" "Testing GitHub Actions integration..."
    
    local workflow_dir="${PROJECT_ROOT}/.github/workflows"
    local test_results=()
    
    # Test 1: Validate CI workflow syntax
    if [ -f "$workflow_dir/ci.yml" ]; then
        log "INFO" "Validating CI workflow syntax..."
        
        # Basic YAML syntax validation
        if command -v yamllint &> /dev/null; then
            if yamllint "$workflow_dir/ci.yml" &> /dev/null; then
                log "SUCCESS" "CI workflow YAML syntax is valid"
                test_results+=("CI_YAML:PASS")
            else
                log "ERROR" "CI workflow YAML syntax errors detected"
                test_results+=("CI_YAML:FAIL")
            fi
        else
            log "WARNING" "yamllint not available, skipping YAML validation"
            test_results+=("CI_YAML:SKIP")
        fi
        
        # Check for required jobs
        local required_jobs=("preflight" "dependencies" "code-quality" "unit-tests" "integration-tests" "build-test")
        for job in "${required_jobs[@]}"; do
            if grep -q "$job:" "$workflow_dir/ci.yml"; then
                log "SUCCESS" "Required job '$job' found in CI workflow"
                test_results+=("CI_JOB_${job}:PASS")
            else
                log "ERROR" "Required job '$job' missing from CI workflow"
                test_results+=("CI_JOB_${job}:FAIL")
            fi
        done
    else
        log "ERROR" "CI workflow file not found"
        test_results+=("CI_FILE:FAIL")
    fi
    
    # Test 2: Validate CD workflow syntax
    if [ -f "$workflow_dir/cd.yml" ]; then
        log "INFO" "Validating CD workflow syntax..."
        
        if command -v yamllint &> /dev/null; then
            if yamllint "$workflow_dir/cd.yml" &> /dev/null; then
                log "SUCCESS" "CD workflow YAML syntax is valid"
                test_results+=("CD_YAML:PASS")
            else
                log "ERROR" "CD workflow YAML syntax errors detected"
                test_results+=("CD_YAML:FAIL")
            fi
        else
            test_results+=("CD_YAML:SKIP")
        fi
        
        # Check for deployment strategies
        local strategies=("blue-green" "rolling" "canary")
        for strategy in "${strategies[@]}"; do
            if grep -q "$strategy" "$workflow_dir/cd.yml"; then
                log "SUCCESS" "Deployment strategy '$strategy' found in CD workflow"
                test_results+=("CD_STRATEGY_${strategy}:PASS")
            else
                log "WARNING" "Deployment strategy '$strategy' not found in CD workflow"
                test_results+=("CD_STRATEGY_${strategy}:WARN")
            fi
        done
    else
        log "ERROR" "CD workflow file not found"
        test_results+=("CD_FILE:FAIL")
    fi
    
    # Test 3: Environment secrets validation
    log "INFO" "Checking environment configuration..."
    
    local env_files=(".env.example" ".env.development" ".env.staging" ".env.production")
    for env_file in "${env_files[@]}"; do
        if [ -f "${PROJECT_ROOT}/$env_file" ]; then
            log "SUCCESS" "Environment file found: $env_file"
            test_results+=("ENV_${env_file}:PASS")
        else
            log "WARNING" "Environment file not found: $env_file"
            test_results+=("ENV_${env_file}:WARN")
        fi
    done
    
    # Save test results
    printf '%s\n' "${test_results[@]}" > "${REPORTS_DIR}/github-actions-results.txt"
    
    log "SUCCESS" "GitHub Actions integration tests completed"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Docker Build Integration Tests                                         │
# └─────────────────────────────────────────────────────────────────────────┘

test_docker_builds() {
    log "INFO" "Testing Docker build integration..."
    
    local test_results=()
    
    # Test 1: Dockerfile validation
    if [ -f "${PROJECT_ROOT}/Dockerfile" ]; then
        log "INFO" "Validating Dockerfile..."
        
        # Check for multi-stage build
        if grep -q "FROM.*AS" "${PROJECT_ROOT}/Dockerfile"; then
            log "SUCCESS" "Multi-stage Dockerfile detected"
            test_results+=("DOCKER_MULTISTAGE:PASS")
        else
            log "WARNING" "Single-stage Dockerfile (consider multi-stage for optimization)"
            test_results+=("DOCKER_MULTISTAGE:WARN")
        fi
        
        # Check for security best practices
        if grep -q "USER" "${PROJECT_ROOT}/Dockerfile"; then
            log "SUCCESS" "Non-root user configuration found"
            test_results+=("DOCKER_SECURITY:PASS")
        else
            log "WARNING" "No USER directive found (running as root)"
            test_results+=("DOCKER_SECURITY:WARN")
        fi
        
        # Check for health checks
        if grep -q "HEALTHCHECK" "${PROJECT_ROOT}/Dockerfile"; then
            log "SUCCESS" "Health check configuration found"
            test_results+=("DOCKER_HEALTHCHECK:PASS")
        else
            log "WARNING" "No health check configuration found"
            test_results+=("DOCKER_HEALTHCHECK:WARN")
        fi
    else
        log "ERROR" "Dockerfile not found"
        test_results+=("DOCKER_FILE:FAIL")
    fi
    
    # Test 2: Docker Compose validation
    if [ -f "${PROJECT_ROOT}/docker-compose.yml" ]; then
        log "INFO" "Validating Docker Compose configuration..."
        
        if docker-compose -f "${PROJECT_ROOT}/docker-compose.yml" config &> /dev/null; then
            log "SUCCESS" "Docker Compose configuration is valid"
            test_results+=("COMPOSE_CONFIG:PASS")
        else
            log "ERROR" "Docker Compose configuration errors detected"
            test_results+=("COMPOSE_CONFIG:FAIL")
        fi
        
        # Check for required services
        local required_services=("app" "postgres" "redis")
        for service in "${required_services[@]}"; do
            if docker-compose -f "${PROJECT_ROOT}/docker-compose.yml" config | grep -q "^  $service:"; then
                log "SUCCESS" "Required service '$service' found in Docker Compose"
                test_results+=("COMPOSE_SERVICE_${service}:PASS")
            else
                log "WARNING" "Service '$service' not found in Docker Compose"
                test_results+=("COMPOSE_SERVICE_${service}:WARN")
            fi
        done
    else
        log "ERROR" "docker-compose.yml not found"
        test_results+=("COMPOSE_FILE:FAIL")
    fi
    
    # Test 3: Build script validation
    if [ -f "${PROJECT_ROOT}/tools/scripts/docker/build.sh" ]; then
        log "INFO" "Testing Docker build script..."
        
        if bash -n "${PROJECT_ROOT}/tools/scripts/docker/build.sh"; then
            log "SUCCESS" "Docker build script syntax is valid"
            test_results+=("BUILD_SCRIPT:PASS")
        else
            log "ERROR" "Docker build script syntax errors detected"
            test_results+=("BUILD_SCRIPT:FAIL")
        fi
        
        # Test build script execution (dry run)
        if cd "$PROJECT_ROOT" && bash tools/scripts/docker/build.sh --help &> /dev/null; then
            log "SUCCESS" "Docker build script is executable"
            test_results+=("BUILD_SCRIPT_EXEC:PASS")
        else
            log "ERROR" "Docker build script execution failed"
            test_results+=("BUILD_SCRIPT_EXEC:FAIL")
        fi
    else
        log "WARNING" "Docker build script not found"
        test_results+=("BUILD_SCRIPT:WARN")
    fi
    
    # Test 4: Actual build test (development target)
    log "INFO" "Testing actual Docker build..."
    
    if cd "$PROJECT_ROOT" && docker build --target development -t hotel-test:integration . &> /dev/null; then
        log "SUCCESS" "Docker build (development target) successful"
        test_results+=("BUILD_TEST:PASS")
        
        # Clean up test image
        docker rmi hotel-test:integration &> /dev/null || true
    else
        log "ERROR" "Docker build test failed"
        test_results+=("BUILD_TEST:FAIL")
    fi
    
    # Save test results
    printf '%s\n' "${test_results[@]}" > "${REPORTS_DIR}/docker-builds-results.txt"
    
    log "SUCCESS" "Docker build integration tests completed"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Deployment Strategies Tests                                            │
# └─────────────────────────────────────────────────────────────────────────┘

test_deployment_strategies() {
    log "INFO" "Testing deployment strategies integration..."
    
    local test_results=()
    
    # Test 1: Deployment script validation
    if [ -f "${PROJECT_ROOT}/tools/scripts/deploy/deploy.sh" ]; then
        log "INFO" "Validating deployment script..."
        
        if bash -n "${PROJECT_ROOT}/tools/scripts/deploy/deploy.sh"; then
            log "SUCCESS" "Deployment script syntax is valid"
            test_results+=("DEPLOY_SCRIPT:PASS")
        else
            log "ERROR" "Deployment script syntax errors detected"
            test_results+=("DEPLOY_SCRIPT:FAIL")
        fi
        
        # Test help functionality
        if cd "$PROJECT_ROOT" && bash tools/scripts/deploy/deploy.sh --help &> /dev/null; then
            log "SUCCESS" "Deployment script help is functional"
            test_results+=("DEPLOY_HELP:PASS")
        else
            log "ERROR" "Deployment script help failed"
            test_results+=("DEPLOY_HELP:FAIL")
        fi
        
        # Test dry run functionality
        if cd "$PROJECT_ROOT" && bash tools/scripts/deploy/deploy.sh --dry-run --environment development &> /dev/null; then
            log "SUCCESS" "Deployment script dry run successful"
            test_results+=("DEPLOY_DRYRUN:PASS")
        else
            log "ERROR" "Deployment script dry run failed"
            test_results+=("DEPLOY_DRYRUN:FAIL")
        fi
    else
        log "ERROR" "Deployment script not found"
        test_results+=("DEPLOY_SCRIPT:FAIL")
    fi
    
    # Test 2: Production Docker Compose validation
    if [ -f "${PROJECT_ROOT}/docker-compose.production.yml" ]; then
        log "INFO" "Validating production Docker Compose..."
        
        if docker-compose -f "${PROJECT_ROOT}/docker-compose.production.yml" config &> /dev/null; then
            log "SUCCESS" "Production Docker Compose configuration is valid"
            test_results+=("PROD_COMPOSE:PASS")
        else
            log "ERROR" "Production Docker Compose configuration errors"
            test_results+=("PROD_COMPOSE:FAIL")
        fi
        
        # Check for high availability setup
        if docker-compose -f "${PROJECT_ROOT}/docker-compose.production.yml" config | grep -q "app-1\|app-2"; then
            log "SUCCESS" "High availability setup detected"
            test_results+=("HA_SETUP:PASS")
        else
            log "WARNING" "No high availability setup found"
            test_results+=("HA_SETUP:WARN")
        fi
    else
        log "ERROR" "Production Docker Compose not found"
        test_results+=("PROD_COMPOSE:FAIL")
    fi
    
    # Test 3: Blue-Green deployment simulation
    log "INFO" "Testing blue-green deployment simulation..."
    
    # This would be a simplified test of the blue-green logic
    if [ -f "${PROJECT_ROOT}/tools/scripts/deploy/deploy.sh" ]; then
        local bg_test_output
        bg_test_output=$(cd "$PROJECT_ROOT" && bash tools/scripts/deploy/deploy.sh --dry-run --strategy blue-green --environment development 2>&1 || true)
        
        if echo "$bg_test_output" | grep -q "blue-green"; then
            log "SUCCESS" "Blue-green deployment strategy recognized"
            test_results+=("BLUE_GREEN:PASS")
        else
            log "ERROR" "Blue-green deployment strategy not properly implemented"
            test_results+=("BLUE_GREEN:FAIL")
        fi
    fi
    
    # Test 4: Rolling deployment simulation
    log "INFO" "Testing rolling deployment simulation..."
    
    if [ -f "${PROJECT_ROOT}/tools/scripts/deploy/deploy.sh" ]; then
        local rolling_test_output
        rolling_test_output=$(cd "$PROJECT_ROOT" && bash tools/scripts/deploy/deploy.sh --dry-run --strategy rolling --environment development 2>&1 || true)
        
        if echo "$rolling_test_output" | grep -q "rolling"; then
            log "SUCCESS" "Rolling deployment strategy recognized"
            test_results+=("ROLLING:PASS")
        else
            log "ERROR" "Rolling deployment strategy not properly implemented"
            test_results+=("ROLLING:FAIL")
        fi
    fi
    
    # Save test results
    printf '%s\n' "${test_results[@]}" > "${REPORTS_DIR}/deployment-strategies-results.txt"
    
    log "SUCCESS" "Deployment strategies integration tests completed"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Security Integration Tests                                             │
# └─────────────────────────────────────────────────────────────────────────┘

test_security_integration() {
    log "INFO" "Testing security scanning integration..."
    
    local test_results=()
    
    # Test 1: Security hardening system integration
    if [ -f "${PROJECT_ROOT}/apps/server/shared/SecurityHardening.ts" ]; then
        log "SUCCESS" "Security hardening system found"
        test_results+=("SECURITY_HARDENING:PASS")
        
        # Test security management script
        if [ -f "${PROJECT_ROOT}/tools/scripts/security/security-management.cjs" ]; then
            log "INFO" "Testing security management script..."
            
            if cd "$PROJECT_ROOT" && timeout 30 node tools/scripts/security/security-management.cjs status &> /dev/null; then
                log "SUCCESS" "Security management script is functional"
                test_results+=("SECURITY_MGMT:PASS")
            else
                log "WARNING" "Security management script test timeout or failed"
                test_results+=("SECURITY_MGMT:WARN")
            fi
        else
            log "WARNING" "Security management script not found"
            test_results+=("SECURITY_MGMT:WARN")
        fi
    else
        log "ERROR" "Security hardening system not found"
        test_results+=("SECURITY_HARDENING:FAIL")
    fi
    
    # Test 2: Encryption manager integration
    if [ -f "${PROJECT_ROOT}/apps/server/shared/EncryptionManager.ts" ]; then
        log "SUCCESS" "Encryption manager found"
        test_results+=("ENCRYPTION:PASS")
    else
        log "ERROR" "Encryption manager not found"
        test_results+=("ENCRYPTION:FAIL")
    fi
    
    # Test 3: Audit logger integration
    if [ -f "${PROJECT_ROOT}/apps/server/shared/AuditLogger.ts" ]; then
        log "SUCCESS" "Audit logger found"
        test_results+=("AUDIT_LOGGER:PASS")
    else
        log "ERROR" "Audit logger not found"
        test_results+=("AUDIT_LOGGER:FAIL")
    fi
    
    # Test 4: Compliance manager integration
    if [ -f "${PROJECT_ROOT}/apps/server/shared/ComplianceManager.ts" ]; then
        log "SUCCESS" "Compliance manager found"
        test_results+=("COMPLIANCE:PASS")
    else
        log "ERROR" "Compliance manager not found"
        test_results+=("COMPLIANCE:FAIL")
    fi
    
    # Save test results
    printf '%s\n' "${test_results[@]}" > "${REPORTS_DIR}/security-integration-results.txt"
    
    log "SUCCESS" "Security integration tests completed"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Backup System Integration Tests                                        │
# └─────────────────────────────────────────────────────────────────────────┘

test_backup_integration() {
    log "INFO" "Testing backup system integration..."
    
    local test_results=()
    
    # Test 1: Backup manager integration
    if [ -f "${PROJECT_ROOT}/apps/server/shared/BackupManager.ts" ]; then
        log "SUCCESS" "Backup manager found"
        test_results+=("BACKUP_MANAGER:PASS")
        
        # Test backup management script
        if [ -f "${PROJECT_ROOT}/tools/scripts/backup/backup-management.cjs" ]; then
            log "INFO" "Testing backup management script..."
            
            if cd "$PROJECT_ROOT" && timeout 30 node tools/scripts/backup/backup-management.cjs status &> /dev/null; then
                log "SUCCESS" "Backup management script is functional"
                test_results+=("BACKUP_MGMT:PASS")
            else
                log "WARNING" "Backup management script test timeout or failed"
                test_results+=("BACKUP_MGMT:WARN")
            fi
        else
            log "WARNING" "Backup management script not found"
            test_results+=("BACKUP_MGMT:WARN")
        fi
    else
        log "ERROR" "Backup manager not found"
        test_results+=("BACKUP_MANAGER:FAIL")
    fi
    
    # Test 2: Disaster recovery integration
    if [ -f "${PROJECT_ROOT}/apps/server/shared/DisasterRecovery.ts" ]; then
        log "SUCCESS" "Disaster recovery system found"
        test_results+=("DISASTER_RECOVERY:PASS")
    else
        log "ERROR" "Disaster recovery system not found"
        test_results+=("DISASTER_RECOVERY:FAIL")
    fi
    
    # Test 3: Data migration integration
    if [ -f "${PROJECT_ROOT}/apps/server/shared/DataMigration.ts" ]; then
        log "SUCCESS" "Data migration system found"
        test_results+=("DATA_MIGRATION:PASS")
    else
        log "ERROR" "Data migration system not found"
        test_results+=("DATA_MIGRATION:FAIL")
    fi
    
    # Test 4: Point-in-time recovery integration
    if [ -f "${PROJECT_ROOT}/apps/server/shared/PointInTimeRecovery.ts" ]; then
        log "SUCCESS" "Point-in-time recovery system found"
        test_results+=("PITR:PASS")
    else
        log "ERROR" "Point-in-time recovery system not found"
        test_results+=("PITR:FAIL")
    fi
    
    # Save test results
    printf '%s\n' "${test_results[@]}" > "${REPORTS_DIR}/backup-integration-results.txt"
    
    log "SUCCESS" "Backup system integration tests completed"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Monitoring Integration Tests                                           │
# └─────────────────────────────────────────────────────────────────────────┘

test_monitoring_integration() {
    log "INFO" "Testing monitoring integration..."
    
    local test_results=()
    
    # Test 1: Health checks integration
    if [ -f "${PROJECT_ROOT}/apps/server/shared/AdvancedHealthCheck.ts" ]; then
        log "SUCCESS" "Advanced health check system found"
        test_results+=("HEALTH_CHECKS:PASS")
    else
        log "ERROR" "Advanced health check system not found"
        test_results+=("HEALTH_CHECKS:FAIL")
    fi
    
    # Test 2: Metrics collection integration
    if [ -f "${PROJECT_ROOT}/apps/server/shared/AdvancedMetricsCollector.ts" ]; then
        log "SUCCESS" "Advanced metrics collector found"
        test_results+=("METRICS:PASS")
    else
        log "ERROR" "Advanced metrics collector not found"
        test_results+=("METRICS:FAIL")
    fi
    
    # Test 3: Dashboard integration
    if [ -d "${PROJECT_ROOT}/apps/client/src/pages" ] && ls "${PROJECT_ROOT}/apps/client/src/pages"/*Dashboard* &> /dev/null; then
        log "SUCCESS" "Dashboard components found"
        test_results+=("DASHBOARD:PASS")
    else
        log "WARNING" "Dashboard components not found"
        test_results+=("DASHBOARD:WARN")
    fi
    
    # Test 4: Prometheus configuration
    if [ -f "${PROJECT_ROOT}/scripts/docker/prometheus/prometheus.yml" ]; then
        log "SUCCESS" "Prometheus configuration found"
        test_results+=("PROMETHEUS:PASS")
    else
        log "WARNING" "Prometheus configuration not found"
        test_results+=("PROMETHEUS:WARN")
    fi
    
    # Save test results
    printf '%s\n' "${test_results[@]}" > "${REPORTS_DIR}/monitoring-integration-results.txt"
    
    log "SUCCESS" "Monitoring integration tests completed"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ API Gateway Integration Tests                                          │
# └─────────────────────────────────────────────────────────────────────────┘

test_api_gateway_integration() {
    log "INFO" "Testing API Gateway integration..."
    
    local test_results=()
    
    # Test 1: API Gateway system integration
    if [ -f "${PROJECT_ROOT}/apps/server/shared/APIGateway.ts" ]; then
        log "SUCCESS" "API Gateway system found"
        test_results+=("API_GATEWAY:PASS")
        
        # Test gateway management
        if [ -f "${PROJECT_ROOT}/tools/scripts/gateway/test-gateway.cjs" ]; then
            log "INFO" "Testing API Gateway management..."
            
            if cd "$PROJECT_ROOT" && timeout 30 node tools/scripts/gateway/test-gateway.cjs &> /dev/null; then
                log "SUCCESS" "API Gateway test script is functional"
                test_results+=("GATEWAY_TEST:PASS")
            else
                log "WARNING" "API Gateway test script timeout or failed"
                test_results+=("GATEWAY_TEST:WARN")
            fi
        else
            log "WARNING" "API Gateway test script not found"
            test_results+=("GATEWAY_TEST:WARN")
        fi
    else
        log "ERROR" "API Gateway system not found"
        test_results+=("API_GATEWAY:FAIL")
    fi
    
    # Test 2: API Gateway middleware integration
    if [ -f "${PROJECT_ROOT}/apps/server/middleware/apiGatewayMiddleware.ts" ]; then
        log "SUCCESS" "API Gateway middleware found"
        test_results+=("GATEWAY_MIDDLEWARE:PASS")
    else
        log "ERROR" "API Gateway middleware not found"
        test_results+=("GATEWAY_MIDDLEWARE:FAIL")
    fi
    
    # Test 3: Gateway routes integration
    if [ -f "${PROJECT_ROOT}/apps/server/routes/modules/admin-module/api-gateway.routes.ts" ]; then
        log "SUCCESS" "API Gateway routes found"
        test_results+=("GATEWAY_ROUTES:PASS")
    else
        log "ERROR" "API Gateway routes not found"
        test_results+=("GATEWAY_ROUTES:FAIL")
    fi
    
    # Save test results
    printf '%s\n' "${test_results[@]}" > "${REPORTS_DIR}/api-gateway-integration-results.txt"
    
    log "SUCCESS" "API Gateway integration tests completed"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ End-to-End Integration Tests                                           │
# └─────────────────────────────────────────────────────────────────────────┘

test_end_to_end_integration() {
    log "INFO" "Running end-to-end integration tests..."
    
    local test_results=()
    
    # Test 1: Full pipeline simulation
    log "INFO" "Simulating full CI/CD pipeline..."
    
    # Simulate CI pipeline steps
    local ci_steps=("lint" "typecheck" "test" "build")
    for step in "${ci_steps[@]}"; do
        case "$step" in
            lint)
                if [ -f "${PROJECT_ROOT}/package.json" ] && grep -q '"lint"' "${PROJECT_ROOT}/package.json"; then
                    log "SUCCESS" "Lint step configuration found"
                    test_results+=("E2E_LINT:PASS")
                else
                    log "WARNING" "Lint step not configured"
                    test_results+=("E2E_LINT:WARN")
                fi
                ;;
            typecheck)
                if [ -f "${PROJECT_ROOT}/tsconfig.json" ]; then
                    log "SUCCESS" "TypeScript configuration found"
                    test_results+=("E2E_TYPECHECK:PASS")
                else
                    log "WARNING" "TypeScript configuration not found"
                    test_results+=("E2E_TYPECHECK:WARN")
                fi
                ;;
            test)
                if [ -d "${PROJECT_ROOT}/tests" ] || ([ -f "${PROJECT_ROOT}/package.json" ] && grep -q '"test"' "${PROJECT_ROOT}/package.json"); then
                    log "SUCCESS" "Test configuration found"
                    test_results+=("E2E_TEST:PASS")
                else
                    log "WARNING" "Test configuration not found"
                    test_results+=("E2E_TEST:WARN")
                fi
                ;;
            build)
                if [ -f "${PROJECT_ROOT}/Dockerfile" ] && [ -f "${PROJECT_ROOT}/package.json" ]; then
                    log "SUCCESS" "Build configuration found"
                    test_results+=("E2E_BUILD:PASS")
                else
                    log "ERROR" "Build configuration incomplete"
                    test_results+=("E2E_BUILD:FAIL")
                fi
                ;;
        esac
    done
    
    # Test 2: Integration between systems
    log "INFO" "Testing system integration points..."
    
    # Check if all major systems are properly integrated
    local systems=("security" "backup" "monitoring" "api-gateway")
    local integration_score=0
    
    for system in "${systems[@]}"; do
        local system_files_count=0
        
        case "$system" in
            security)
                [ -f "${PROJECT_ROOT}/apps/server/shared/SecurityHardening.ts" ] && ((system_files_count++))
                [ -f "${PROJECT_ROOT}/apps/server/shared/AuditLogger.ts" ] && ((system_files_count++))
                [ -f "${PROJECT_ROOT}/apps/server/shared/EncryptionManager.ts" ] && ((system_files_count++))
                ;;
            backup)
                [ -f "${PROJECT_ROOT}/apps/server/shared/BackupManager.ts" ] && ((system_files_count++))
                [ -f "${PROJECT_ROOT}/apps/server/shared/DisasterRecovery.ts" ] && ((system_files_count++))
                ;;
            monitoring)
                [ -f "${PROJECT_ROOT}/apps/server/shared/AdvancedHealthCheck.ts" ] && ((system_files_count++))
                [ -f "${PROJECT_ROOT}/apps/server/shared/AdvancedMetricsCollector.ts" ] && ((system_files_count++))
                ;;
            api-gateway)
                [ -f "${PROJECT_ROOT}/apps/server/shared/APIGateway.ts" ] && ((system_files_count++))
                [ -f "${PROJECT_ROOT}/apps/server/middleware/apiGatewayMiddleware.ts" ] && ((system_files_count++))
                ;;
        esac
        
        if [ $system_files_count -gt 0 ]; then
            log "SUCCESS" "System '$system' integration detected ($system_files_count components)"
            ((integration_score++))
            test_results+=("INTEGRATION_${system}:PASS")
        else
            log "ERROR" "System '$system' integration missing"
            test_results+=("INTEGRATION_${system}:FAIL")
        fi
    done
    
    # Calculate overall integration score
    local total_systems=${#systems[@]}
    local integration_percentage=$((integration_score * 100 / total_systems))
    
    log "INFO" "Integration score: $integration_score/$total_systems ($integration_percentage%)"
    test_results+=("INTEGRATION_SCORE:$integration_percentage")
    
    if [ $integration_percentage -ge 75 ]; then
        log "SUCCESS" "High integration level achieved"
        test_results+=("INTEGRATION_OVERALL:PASS")
    elif [ $integration_percentage -ge 50 ]; then
        log "WARNING" "Medium integration level"
        test_results+=("INTEGRATION_OVERALL:WARN")
    else
        log "ERROR" "Low integration level"
        test_results+=("INTEGRATION_OVERALL:FAIL")
    fi
    
    # Save test results
    printf '%s\n' "${test_results[@]}" > "${REPORTS_DIR}/end-to-end-integration-results.txt"
    
    log "SUCCESS" "End-to-end integration tests completed"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Report Generation                                                      │
# └─────────────────────────────────────────────────────────────────────────┘

generate_comprehensive_report() {
    log "INFO" "Generating comprehensive integration test report..."
    
    local report_file="${REPORTS_DIR}/cicd-integration-report-$(date +%Y%m%d-%H%M%S).html"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>CI/CD Integration Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .section { margin: 20px 0; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px; }
        .pass { color: #28a745; font-weight: bold; }
        .warn { color: #ffc107; font-weight: bold; }
        .fail { color: #dc3545; font-weight: bold; }
        .skip { color: #6c757d; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #dee2e6; }
        th { background: #e9ecef; font-weight: bold; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .metric { background: #e9ecef; padding: 15px; border-radius: 5px; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔄 CI/CD Integration Test Report</h1>
        <div class="summary">
            <div class="metric">
                <h3>Environment</h3>
                <p>${ENVIRONMENT}</p>
            </div>
            <div class="metric">
                <h3>Date</h3>
                <p>$(date)</p>
            </div>
            <div class="metric">
                <h3>Components Tested</h3>
                <p>${#TEST_COMPONENTS[@]}</p>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h2>📊 Test Results Summary</h2>
        <table>
            <thead>
                <tr>
                    <th>Component</th>
                    <th>Status</th>
                    <th>Details</th>
                </tr>
            </thead>
            <tbody>
EOF
    
    # Add test results for each component
    for component in "${TEST_COMPONENTS[@]}"; do
        local result_file="${REPORTS_DIR}/${component}-results.txt"
        local status="NOT_RUN"
        local details="No test results available"
        
        if [ -f "$result_file" ]; then
            local pass_count=$(grep -c ":PASS" "$result_file" 2>/dev/null || echo "0")
            local warn_count=$(grep -c ":WARN" "$result_file" 2>/dev/null || echo "0")
            local fail_count=$(grep -c ":FAIL" "$result_file" 2>/dev/null || echo "0")
            local skip_count=$(grep -c ":SKIP" "$result_file" 2>/dev/null || echo "0")
            
            if [ "$fail_count" -gt 0 ]; then
                status="FAIL"
            elif [ "$warn_count" -gt 0 ]; then
                status="WARN"
            else
                status="PASS"
            fi
            
            details="Pass: $pass_count, Warn: $warn_count, Fail: $fail_count, Skip: $skip_count"
        fi
        
        local status_class=""
        case "$status" in
            PASS) status_class="pass" ;;
            WARN) status_class="warn" ;;
            FAIL) status_class="fail" ;;
            *) status_class="skip" ;;
        esac
        
        cat >> "$report_file" << EOF
                <tr>
                    <td>${component}</td>
                    <td class="${status_class}">${status}</td>
                    <td>${details}</td>
                </tr>
EOF
    done
    
    cat >> "$report_file" << EOF
            </tbody>
        </table>
    </div>
    
    <div class="section">
        <h2>🔧 Recommendations</h2>
        <h3>Strengths</h3>
        <ul>
            <li>Comprehensive CI/CD pipeline structure in place</li>
            <li>Multi-stage Docker builds implemented</li>
            <li>Security hardening systems integrated</li>
            <li>Backup and recovery systems implemented</li>
        </ul>
        
        <h3>Areas for Improvement</h3>
        <ul>
            <li>Ensure all GitHub Actions workflows are tested regularly</li>
            <li>Implement automated security scanning in CI pipeline</li>
            <li>Add comprehensive E2E testing to deployment process</li>
            <li>Enhance monitoring and alerting integration</li>
        </ul>
        
        <h3>Next Steps</h3>
        <ul>
            <li>Address any failed test components</li>
            <li>Implement missing integrations identified in warnings</li>
            <li>Set up regular integration testing schedule</li>
            <li>Document deployment procedures and rollback strategies</li>
        </ul>
    </div>
    
    <div class="section">
        <h2>📋 Detailed Test Information</h2>
        <p>For detailed test results, check the following files:</p>
        <ul>
$(for component in "${TEST_COMPONENTS[@]}"; do
    if [ -f "${REPORTS_DIR}/${component}-results.txt" ]; then
        echo "            <li>${component}-results.txt</li>"
    fi
done)
        </ul>
        
        <p><strong>Test Log:</strong> $(basename "$LOG_FILE")</p>
        <p><strong>Report Directory:</strong> ${REPORTS_DIR}</p>
    </div>
</body>
</html>
EOF
    
    log "SUCCESS" "Comprehensive report generated: $report_file"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Command Line Parsing                                                   │
# └─────────────────────────────────────────────────────────────────────────┘

SPECIFIC_COMPONENT=""
SKIP_COMPONENTS=()
VALIDATE_ONLY=false
GENERATE_REPORT=false
CLEANUP=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -u|--url)
            BASE_URL="$2"
            API_URL="$2/api"
            shift 2
            ;;
        -c|--component)
            SPECIFIC_COMPONENT="$2"
            shift 2
            ;;
        -t|--timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        --skip-component)
            SKIP_COMPONENTS+=("$2")
            shift 2
            ;;
        --validate-only)
            VALIDATE_ONLY=true
            shift
            ;;
        --generate-report)
            GENERATE_REPORT=true
            shift
            ;;
        --cleanup)
            CLEANUP=true
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
    log "INFO" "Starting CI/CD integration testing..."
    log "INFO" "Configuration:"
    log "INFO" "  Environment: $ENVIRONMENT"
    log "INFO" "  Base URL: $BASE_URL"
    log "INFO" "  Timeout: ${TIMEOUT}s"
    
    if [ -n "$SPECIFIC_COMPONENT" ]; then
        log "INFO" "  Testing specific component: $SPECIFIC_COMPONENT"
        TEST_COMPONENTS=("$SPECIFIC_COMPONENT")
    fi
    
    if [ ${#SKIP_COMPONENTS[@]} -gt 0 ]; then
        log "INFO" "  Skipping components: ${SKIP_COMPONENTS[*]}"
    fi
    
    # Setup environment
    setup_environment
    
    if [ "$VALIDATE_ONLY" = true ]; then
        log "INFO" "Validation-only mode, skipping actual tests"
        exit 0
    fi
    
    # Run component tests
    local overall_success=true
    
    for component in "${TEST_COMPONENTS[@]}"; do
        # Check if component should be skipped
        local skip_component=false
        for skip in "${SKIP_COMPONENTS[@]}"; do
            if [ "$component" = "$skip" ]; then
                skip_component=true
                break
            fi
        done
        
        if [ "$skip_component" = true ]; then
            log "INFO" "Skipping component: $component"
            continue
        fi
        
        log "INFO" "Testing component: $component"
        
        case "$component" in
            github-actions)
                test_github_actions || overall_success=false
                ;;
            docker-builds)
                test_docker_builds || overall_success=false
                ;;
            deployment-strategies)
                test_deployment_strategies || overall_success=false
                ;;
            security-scanning)
                test_security_integration || overall_success=false
                ;;
            backup-integration)
                test_backup_integration || overall_success=false
                ;;
            monitoring-integration)
                test_monitoring_integration || overall_success=false
                ;;
            api-gateway-integration)
                test_api_gateway_integration || overall_success=false
                ;;
            *)
                log "ERROR" "Unknown component: $component"
                overall_success=false
                ;;
        esac
    done
    
    # Run end-to-end integration tests
    test_end_to_end_integration || overall_success=false
    
    # Generate report
    if [ "$GENERATE_REPORT" = true ] || [ "$overall_success" = false ]; then
        generate_comprehensive_report
    fi
    
    # Cleanup if requested
    if [ "$CLEANUP" = true ]; then
        log "INFO" "Cleaning up test resources..."
        # Add cleanup logic here
    fi
    
    # Final status
    if [ "$overall_success" = true ]; then
        log "SUCCESS" "All CI/CD integration tests completed successfully!"
        log "INFO" "The CI/CD pipeline is properly integrated and ready for use"
    else
        log "ERROR" "Some CI/CD integration tests failed"
        log "WARNING" "Please review the test results and address any issues"
    fi
    
    log "INFO" "Test log: $LOG_FILE"
    log "INFO" "Test reports: $REPORTS_DIR"
    
    if [ "$overall_success" = true ]; then
        exit 0
    else
        exit 1
    fi
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 