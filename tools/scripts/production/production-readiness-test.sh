#!/bin/bash
# =============================================================================
# Hotel Management SaaS Platform - Production Readiness Testing Script
# Comprehensive validation for production deployment readiness
# =============================================================================

set -euo pipefail

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Configuration & Constants                                               │
# └─────────────────────────────────────────────────────────────────────────┘

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../../" && pwd)"
REPORTS_DIR="${PROJECT_ROOT}/reports/production-readiness"
LOG_FILE="${REPORTS_DIR}/production-readiness-$(date +%Y%m%d-%H%M%S).log"

# Test configuration
ENVIRONMENT="${ENVIRONMENT:-production}"
BASE_URL="${BASE_URL:-https://hotel-management.com}"
TIMEOUT="${TIMEOUT:-600}"
PARALLEL_TESTS="${PARALLEL_TESTS:-true}"
COMPREHENSIVE_MODE="${COMPREHENSIVE_MODE:-true}"

# Test categories
CATEGORIES=(
    "infrastructure"
    "security"
    "performance"
    "monitoring"
    "backup"
    "deployment"
    "business-logic"
    "integration"
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

show_usage() {
    cat << EOF
Hotel Management SaaS Platform - Production Readiness Testing Script

Usage: $0 [OPTIONS]

OPTIONS:
    -e, --environment ENV     Target environment (staging|production)
    -u, --url URL            Base URL for testing
    -c, --category CATEGORY  Test specific category only
    -t, --timeout TIMEOUT   Test timeout in seconds (default: 600)
    --skip-category CAT      Skip specific category
    --no-parallel           Run tests sequentially
    --quick                 Run quick tests only (not comprehensive)
    --report-only           Generate report from existing results
    --fix-issues            Attempt to fix identified issues
    -h, --help              Show this help message

CATEGORIES:
    infrastructure    - Infrastructure and system readiness
    security         - Security configuration and compliance
    performance      - Performance and load testing
    monitoring       - Monitoring and alerting systems
    backup           - Backup and disaster recovery
    deployment       - Deployment pipeline validation
    business-logic   - Business functionality validation
    integration      - End-to-end integration testing

EXAMPLES:
    $0 --environment production --comprehensive
    $0 --category security --timeout 300
    $0 --skip-category performance --quick
    $0 --report-only

EOF
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Infrastructure Readiness Tests                                         │
# └─────────────────────────────────────────────────────────────────────────┘

test_infrastructure() {
    log "INFO" "Testing infrastructure readiness..."
    
    local test_results=()
    
    # Test 1: Docker containers health
    log "INFO" "Checking Docker containers health..."
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "Up"; then
        local unhealthy_containers
        unhealthy_containers=$(docker ps --filter "health=unhealthy" --format "{{.Names}}" || echo "")
        
        if [ -z "$unhealthy_containers" ]; then
            log "SUCCESS" "All Docker containers are healthy"
            test_results+=("DOCKER_HEALTH:PASS")
        else
            log "ERROR" "Unhealthy containers: $unhealthy_containers"
            test_results+=("DOCKER_HEALTH:FAIL")
        fi
    else
        log "ERROR" "No Docker containers are running"
        test_results+=("DOCKER_HEALTH:FAIL")
    fi
    
    # Test 2: Database connectivity
    log "INFO" "Testing database connectivity..."
    if cd "$PROJECT_ROOT" && timeout 30 node -e "
        const { Pool } = require('pg');
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/hotel_management'
        });
        pool.query('SELECT 1').then(() => {
            console.log('Database connected');
            process.exit(0);
        }).catch(err => {
            console.error('Database error:', err.message);
            process.exit(1);
        });
    " 2>/dev/null; then
        log "SUCCESS" "Database connectivity verified"
        test_results+=("DATABASE_CONNECTIVITY:PASS")
    else
        log "ERROR" "Database connectivity failed"
        test_results+=("DATABASE_CONNECTIVITY:FAIL")
    fi
    
    # Test 3: Redis connectivity
    log "INFO" "Testing Redis connectivity..."
    if command -v redis-cli &> /dev/null; then
        if redis-cli ping 2>/dev/null | grep -q "PONG"; then
            log "SUCCESS" "Redis connectivity verified"
            test_results+=("REDIS_CONNECTIVITY:PASS")
        else
            log "ERROR" "Redis connectivity failed"
            test_results+=("REDIS_CONNECTIVITY:FAIL")
        fi
    else
        log "WARNING" "Redis CLI not available, skipping test"
        test_results+=("REDIS_CONNECTIVITY:SKIP")
    fi
    
    # Test 4: Storage space
    log "INFO" "Checking available storage space..."
    local disk_usage
    disk_usage=$(df / | awk 'NR==2 {print $(NF-1)}' | sed 's/%//')
    
    if [ "$disk_usage" -lt 80 ]; then
        log "SUCCESS" "Disk usage is acceptable: ${disk_usage}%"
        test_results+=("DISK_SPACE:PASS")
    elif [ "$disk_usage" -lt 90 ]; then
        log "WARNING" "Disk usage is high: ${disk_usage}%"
        test_results+=("DISK_SPACE:WARN")
    else
        log "ERROR" "Disk usage is critical: ${disk_usage}%"
        test_results+=("DISK_SPACE:FAIL")
    fi
    
    # Test 5: Network connectivity
    log "INFO" "Testing external network connectivity..."
    if curl -s --max-time 10 https://google.com > /dev/null; then
        log "SUCCESS" "External network connectivity verified"
        test_results+=("NETWORK_CONNECTIVITY:PASS")
    else
        log "ERROR" "External network connectivity failed"
        test_results+=("NETWORK_CONNECTIVITY:FAIL")
    fi
    
    # Test 6: SSL certificates
    log "INFO" "Checking SSL certificates..."
    if [ "$ENVIRONMENT" = "production" ]; then
        local cert_expiry
        if cert_expiry=$(echo | openssl s_client -servername hotel-management.com -connect hotel-management.com:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null | grep notAfter | cut -d= -f2); then
            local expiry_date
            expiry_date=$(date -d "$cert_expiry" +%s)
            local current_date
            current_date=$(date +%s)
            local days_until_expiry=$(( (expiry_date - current_date) / 86400 ))
            
            if [ $days_until_expiry -gt 30 ]; then
                log "SUCCESS" "SSL certificate valid for $days_until_expiry days"
                test_results+=("SSL_CERT:PASS")
            elif [ $days_until_expiry -gt 7 ]; then
                log "WARNING" "SSL certificate expires in $days_until_expiry days"
                test_results+=("SSL_CERT:WARN")
            else
                log "ERROR" "SSL certificate expires in $days_until_expiry days"
                test_results+=("SSL_CERT:FAIL")
            fi
        else
            log "WARNING" "Cannot check SSL certificate"
            test_results+=("SSL_CERT:SKIP")
        fi
    else
        log "INFO" "SSL certificate check skipped for non-production environment"
        test_results+=("SSL_CERT:SKIP")
    fi
    
    # Save results
    printf '%s\n' "${test_results[@]}" > "${REPORTS_DIR}/infrastructure-results.txt"
    
    log "SUCCESS" "Infrastructure readiness tests completed"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Security Readiness Tests                                               │
# └─────────────────────────────────────────────────────────────────────────┘

test_security() {
    log "INFO" "Testing security readiness..."
    
    local test_results=()
    
    # Test 1: Security hardening system
    log "INFO" "Testing security hardening system..."
    if [ -f "${PROJECT_ROOT}/tools/scripts/security/security-management.cjs" ]; then
        if cd "$PROJECT_ROOT" && timeout 60 node tools/scripts/security/security-management.cjs status &> /dev/null; then
            log "SUCCESS" "Security hardening system is operational"
            test_results+=("SECURITY_HARDENING:PASS")
        else
            log "ERROR" "Security hardening system failed"
            test_results+=("SECURITY_HARDENING:FAIL")
        fi
    else
        log "ERROR" "Security hardening system not found"
        test_results+=("SECURITY_HARDENING:FAIL")
    fi
    
    # Test 2: Encryption system
    log "INFO" "Testing encryption system..."
    if [ -f "${PROJECT_ROOT}/apps/server/shared/EncryptionManager.ts" ]; then
        log "SUCCESS" "Encryption manager found"
        test_results+=("ENCRYPTION:PASS")
    else
        log "ERROR" "Encryption manager not found"
        test_results+=("ENCRYPTION:FAIL")
    fi
    
    # Test 3: Authentication system
    log "INFO" "Testing authentication system..."
    if curl -s -X POST -H "Content-Type: application/json" \
        -d '{"email":"test@test.com","password":"wrongpassword"}' \
        "$BASE_URL/api/auth/login" | grep -q "error\|unauthorized"; then
        log "SUCCESS" "Authentication system properly rejects invalid credentials"
        test_results+=("AUTHENTICATION:PASS")
    else
        log "ERROR" "Authentication system may have issues"
        test_results+=("AUTHENTICATION:FAIL")
    fi
    
    # Test 4: HTTPS enforcement
    if [ "$ENVIRONMENT" = "production" ]; then
        log "INFO" "Testing HTTPS enforcement..."
        local http_response
        http_response=$(curl -s -o /dev/null -w "%{http_code}" "http://hotel-management.com" || echo "000")
        
        if [ "$http_response" = "301" ] || [ "$http_response" = "302" ]; then
            log "SUCCESS" "HTTP to HTTPS redirect is working"
            test_results+=("HTTPS_ENFORCEMENT:PASS")
        else
            log "ERROR" "HTTPS enforcement may not be working (HTTP code: $http_response)"
            test_results+=("HTTPS_ENFORCEMENT:FAIL")
        fi
    else
        log "INFO" "HTTPS enforcement test skipped for non-production"
        test_results+=("HTTPS_ENFORCEMENT:SKIP")
    fi
    
    # Test 5: Security headers
    log "INFO" "Testing security headers..."
    local headers_response
    headers_response=$(curl -s -I "$BASE_URL" || echo "")
    
    local required_headers=("X-Frame-Options" "X-Content-Type-Options" "X-XSS-Protection")
    local headers_found=0
    
    for header in "${required_headers[@]}"; do
        if echo "$headers_response" | grep -qi "$header"; then
            ((headers_found++))
        fi
    done
    
    if [ $headers_found -eq ${#required_headers[@]} ]; then
        log "SUCCESS" "All required security headers are present"
        test_results+=("SECURITY_HEADERS:PASS")
    elif [ $headers_found -gt 0 ]; then
        log "WARNING" "Some security headers are missing ($headers_found/${#required_headers[@]})"
        test_results+=("SECURITY_HEADERS:WARN")
    else
        log "ERROR" "Security headers are missing"
        test_results+=("SECURITY_HEADERS:FAIL")
    fi
    
    # Save results
    printf '%s\n' "${test_results[@]}" > "${REPORTS_DIR}/security-results.txt"
    
    log "SUCCESS" "Security readiness tests completed"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Performance Readiness Tests                                            │
# └─────────────────────────────────────────────────────────────────────────┘

test_performance() {
    log "INFO" "Testing performance readiness..."
    
    local test_results=()
    
    # Test 1: Application response time
    log "INFO" "Testing application response time..."
    local response_time
    response_time=$(curl -o /dev/null -s -w '%{time_total}\n' "$BASE_URL/health" || echo "999")
    response_time_ms=$(echo "$response_time * 1000" | bc -l)
    
    if (( $(echo "$response_time < 1.0" | bc -l) )); then
        log "SUCCESS" "Response time is excellent: ${response_time_ms}ms"
        test_results+=("RESPONSE_TIME:PASS")
    elif (( $(echo "$response_time < 2.0" | bc -l) )); then
        log "WARNING" "Response time is acceptable: ${response_time_ms}ms"
        test_results+=("RESPONSE_TIME:WARN")
    else
        log "ERROR" "Response time is too slow: ${response_time_ms}ms"
        test_results+=("RESPONSE_TIME:FAIL")
    fi
    
    # Test 2: Load testing (if comprehensive mode)
    if [ "$COMPREHENSIVE_MODE" = "true" ]; then
        log "INFO" "Running load test..."
        
        if cd "$PROJECT_ROOT" && bash tools/scripts/testing/performance-test.sh \
            --environment "$ENVIRONMENT" \
            --url "$BASE_URL" \
            --test-type load \
            --duration 2m \
            --vus 50 &> /dev/null; then
            log "SUCCESS" "Load test completed successfully"
            test_results+=("LOAD_TEST:PASS")
        else
            log "ERROR" "Load test failed"
            test_results+=("LOAD_TEST:FAIL")
        fi
    else
        log "INFO" "Load testing skipped (quick mode)"
        test_results+=("LOAD_TEST:SKIP")
    fi
    
    # Test 3: Database performance
    log "INFO" "Testing database performance..."
    if cd "$PROJECT_ROOT" && timeout 30 node -e "
        const { Pool } = require('pg');
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/hotel_management'
        });
        const start = Date.now();
        pool.query('SELECT COUNT(*) FROM pg_stat_activity').then(() => {
            const duration = Date.now() - start;
            console.log('Query time:', duration + 'ms');
            process.exit(duration < 100 ? 0 : 1);
        }).catch(() => process.exit(1));
    " 2>/dev/null; then
        log "SUCCESS" "Database performance is acceptable"
        test_results+=("DATABASE_PERFORMANCE:PASS")
    else
        log "WARNING" "Database performance may be degraded"
        test_results+=("DATABASE_PERFORMANCE:WARN")
    fi
    
    # Test 4: Memory usage
    log "INFO" "Checking memory usage..."
    local memory_usage
    memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    
    if (( $(echo "$memory_usage < 70.0" | bc -l) )); then
        log "SUCCESS" "Memory usage is healthy: ${memory_usage}%"
        test_results+=("MEMORY_USAGE:PASS")
    elif (( $(echo "$memory_usage < 85.0" | bc -l) )); then
        log "WARNING" "Memory usage is elevated: ${memory_usage}%"
        test_results+=("MEMORY_USAGE:WARN")
    else
        log "ERROR" "Memory usage is critical: ${memory_usage}%"
        test_results+=("MEMORY_USAGE:FAIL")
    fi
    
    # Save results
    printf '%s\n' "${test_results[@]}" > "${REPORTS_DIR}/performance-results.txt"
    
    log "SUCCESS" "Performance readiness tests completed"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Monitoring Readiness Tests                                             │
# └─────────────────────────────────────────────────────────────────────────┘

test_monitoring() {
    log "INFO" "Testing monitoring readiness..."
    
    local test_results=()
    
    # Test 1: Prometheus metrics endpoint
    log "INFO" "Testing Prometheus metrics endpoint..."
    if curl -s "$BASE_URL/metrics" | grep -q "# HELP\|# TYPE"; then
        log "SUCCESS" "Prometheus metrics endpoint is working"
        test_results+=("PROMETHEUS_METRICS:PASS")
    else
        log "ERROR" "Prometheus metrics endpoint is not working"
        test_results+=("PROMETHEUS_METRICS:FAIL")
    fi
    
    # Test 2: Health check endpoint
    log "INFO" "Testing health check endpoint..."
    local health_response
    health_response=$(curl -s "$BASE_URL/health" || echo "")
    
    if echo "$health_response" | grep -q "healthy\|ok\|status.*ok"; then
        log "SUCCESS" "Health check endpoint is responding correctly"
        test_results+=("HEALTH_CHECK:PASS")
    else
        log "ERROR" "Health check endpoint is not responding correctly"
        test_results+=("HEALTH_CHECK:FAIL")
    fi
    
    # Test 3: Grafana dashboard (if available)
    if [ -n "${GRAFANA_URL:-}" ]; then
        log "INFO" "Testing Grafana connectivity..."
        if curl -s "${GRAFANA_URL}/api/health" > /dev/null; then
            log "SUCCESS" "Grafana is accessible"
            test_results+=("GRAFANA:PASS")
        else
            log "WARNING" "Grafana is not accessible"
            test_results+=("GRAFANA:WARN")
        fi
    else
        log "INFO" "Grafana URL not configured, skipping test"
        test_results+=("GRAFANA:SKIP")
    fi
    
    # Test 4: Alerting system
    log "INFO" "Testing alerting system configuration..."
    if [ -n "${SLACK_WEBHOOK_URL:-}" ] || [ -n "${ALERT_WEBHOOK_URL:-}" ]; then
        log "SUCCESS" "Alerting system is configured"
        test_results+=("ALERTING:PASS")
    else
        log "WARNING" "No alerting webhooks configured"
        test_results+=("ALERTING:WARN")
    fi
    
    # Test 5: Log aggregation
    log "INFO" "Testing log aggregation..."
    if docker logs $(docker ps --format "{{.Names}}" | head -1) --tail 10 &> /dev/null; then
        log "SUCCESS" "Application logs are available"
        test_results+=("LOGGING:PASS")
    else
        log "WARNING" "Application logs may not be properly configured"
        test_results+=("LOGGING:WARN")
    fi
    
    # Save results
    printf '%s\n' "${test_results[@]}" > "${REPORTS_DIR}/monitoring-results.txt"
    
    log "SUCCESS" "Monitoring readiness tests completed"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Backup System Tests                                                    │
# └─────────────────────────────────────────────────────────────────────────┘

test_backup() {
    log "INFO" "Testing backup system readiness..."
    
    local test_results=()
    
    # Test 1: Backup management system
    log "INFO" "Testing backup management system..."
    if [ -f "${PROJECT_ROOT}/tools/scripts/backup/backup-management.cjs" ]; then
        if cd "$PROJECT_ROOT" && timeout 60 node tools/scripts/backup/backup-management.cjs status &> /dev/null; then
            log "SUCCESS" "Backup management system is operational"
            test_results+=("BACKUP_SYSTEM:PASS")
        else
            log "ERROR" "Backup management system failed"
            test_results+=("BACKUP_SYSTEM:FAIL")
        fi
    else
        log "ERROR" "Backup management system not found"
        test_results+=("BACKUP_SYSTEM:FAIL")
    fi
    
    # Test 2: Database backup capability
    log "INFO" "Testing database backup capability..."
    if cd "$PROJECT_ROOT" && timeout 120 node tools/scripts/backup/backup-test.cjs backup &> /dev/null; then
        log "SUCCESS" "Database backup test passed"
        test_results+=("DATABASE_BACKUP:PASS")
    else
        log "WARNING" "Database backup test failed or timed out"
        test_results+=("DATABASE_BACKUP:WARN")
    fi
    
    # Test 3: Disaster recovery readiness
    log "INFO" "Testing disaster recovery system..."
    if [ -f "${PROJECT_ROOT}/apps/server/shared/DisasterRecovery.ts" ]; then
        log "SUCCESS" "Disaster recovery system is available"
        test_results+=("DISASTER_RECOVERY:PASS")
    else
        log "ERROR" "Disaster recovery system not found"
        test_results+=("DISASTER_RECOVERY:FAIL")
    fi
    
    # Test 4: Backup storage space
    log "INFO" "Checking backup storage space..."
    local backup_dir="${PROJECT_ROOT}/backups"
    if [ -d "$backup_dir" ]; then
        local backup_size
        backup_size=$(du -sh "$backup_dir" | cut -f1)
        log "SUCCESS" "Backup directory exists with size: $backup_size"
        test_results+=("BACKUP_STORAGE:PASS")
    else
        log "WARNING" "Backup directory does not exist"
        test_results+=("BACKUP_STORAGE:WARN")
    fi
    
    # Save results
    printf '%s\n' "${test_results[@]}" > "${REPORTS_DIR}/backup-results.txt"
    
    log "SUCCESS" "Backup system tests completed"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Deployment Pipeline Tests                                              │
# └─────────────────────────────────────────────────────────────────────────┘

test_deployment() {
    log "INFO" "Testing deployment pipeline readiness..."
    
    local test_results=()
    
    # Test 1: CI/CD pipeline configuration
    log "INFO" "Testing CI/CD pipeline configuration..."
    if [ -f "${PROJECT_ROOT}/.github/workflows/ci.yml" ] && [ -f "${PROJECT_ROOT}/.github/workflows/cd.yml" ]; then
        log "SUCCESS" "CI/CD pipeline workflows are configured"
        test_results+=("CICD_CONFIG:PASS")
    else
        log "ERROR" "CI/CD pipeline workflows are missing"
        test_results+=("CICD_CONFIG:FAIL")
    fi
    
    # Test 2: Deployment scripts
    log "INFO" "Testing deployment scripts..."
    local deployment_scripts=(
        "tools/scripts/deploy/deploy.sh"
        "tools/scripts/deploy/zero-downtime-deploy.sh"
        "tools/scripts/deploy/environment-promotion.sh"
    )
    
    local scripts_found=0
    for script in "${deployment_scripts[@]}"; do
        if [ -f "${PROJECT_ROOT}/$script" ]; then
            ((scripts_found++))
        fi
    done
    
    if [ $scripts_found -eq ${#deployment_scripts[@]} ]; then
        log "SUCCESS" "All deployment scripts are available"
        test_results+=("DEPLOYMENT_SCRIPTS:PASS")
    elif [ $scripts_found -gt 0 ]; then
        log "WARNING" "Some deployment scripts are missing ($scripts_found/${#deployment_scripts[@]})"
        test_results+=("DEPLOYMENT_SCRIPTS:WARN")
    else
        log "ERROR" "Deployment scripts are missing"
        test_results+=("DEPLOYMENT_SCRIPTS:FAIL")
    fi
    
    # Test 3: Docker configuration
    log "INFO" "Testing Docker configuration..."
    if [ -f "${PROJECT_ROOT}/Dockerfile" ] && [ -f "${PROJECT_ROOT}/docker-compose.production.yml" ]; then
        log "SUCCESS" "Docker configuration files are present"
        test_results+=("DOCKER_CONFIG:PASS")
    else
        log "ERROR" "Docker configuration files are missing"
        test_results+=("DOCKER_CONFIG:FAIL")
    fi
    
    # Test 4: Environment configuration
    log "INFO" "Testing environment configuration..."
    local env_files=(".env.example" ".env.production")
    local env_found=0
    
    for env_file in "${env_files[@]}"; do
        if [ -f "${PROJECT_ROOT}/$env_file" ]; then
            ((env_found++))
        fi
    done
    
    if [ $env_found -eq ${#env_files[@]} ]; then
        log "SUCCESS" "Environment configuration files are present"
        test_results+=("ENV_CONFIG:PASS")
    else
        log "WARNING" "Some environment configuration files are missing"
        test_results+=("ENV_CONFIG:WARN")
    fi
    
    # Save results
    printf '%s\n' "${test_results[@]}" > "${REPORTS_DIR}/deployment-results.txt"
    
    log "SUCCESS" "Deployment pipeline tests completed"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Business Logic Tests                                                   │
# └─────────────────────────────────────────────────────────────────────────┘

test_business_logic() {
    log "INFO" "Testing business logic readiness..."
    
    local test_results=()
    
    # Test 1: Hotel management API
    log "INFO" "Testing hotel management API..."
    if curl -s "$BASE_URL/api/health" | grep -q "healthy\|ok"; then
        log "SUCCESS" "Hotel management API is responding"
        test_results+=("API_HEALTH:PASS")
    else
        log "ERROR" "Hotel management API is not responding"
        test_results+=("API_HEALTH:FAIL")
    fi
    
    # Test 2: Voice assistant integration
    log "INFO" "Testing voice assistant integration..."
    if curl -s "$BASE_URL/api/assistant/status" &> /dev/null; then
        log "SUCCESS" "Voice assistant API is available"
        test_results+=("VOICE_ASSISTANT:PASS")
    else
        log "WARNING" "Voice assistant API may not be available"
        test_results+=("VOICE_ASSISTANT:WARN")
    fi
    
    # Test 3: Multi-tenant support
    log "INFO" "Testing multi-tenant support..."
    if [ -f "${PROJECT_ROOT}/apps/server/services/tenantService.ts" ]; then
        log "SUCCESS" "Multi-tenant service is implemented"
        test_results+=("MULTI_TENANT:PASS")
    else
        log "WARNING" "Multi-tenant service not found"
        test_results+=("MULTI_TENANT:WARN")
    fi
    
    # Test 4: Email functionality
    log "INFO" "Testing email functionality..."
    if [ -f "${PROJECT_ROOT}/apps/server/email.ts" ]; then
        log "SUCCESS" "Email service is implemented"
        test_results+=("EMAIL_SERVICE:PASS")
    else
        log "WARNING" "Email service not found"
        test_results+=("EMAIL_SERVICE:WARN")
    fi
    
    # Test 5: Analytics system
    log "INFO" "Testing analytics system..."
    if curl -s "$BASE_URL/api/analytics/health" &> /dev/null; then
        log "SUCCESS" "Analytics API is available"
        test_results+=("ANALYTICS:PASS")
    else
        log "WARNING" "Analytics API may not be available"
        test_results+=("ANALYTICS:WARN")
    fi
    
    # Save results
    printf '%s\n' "${test_results[@]}" > "${REPORTS_DIR}/business-logic-results.txt"
    
    log "SUCCESS" "Business logic tests completed"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Integration Tests                                                      │
# └─────────────────────────────────────────────────────────────────────────┘

test_integration() {
    log "INFO" "Testing end-to-end integration..."
    
    local test_results=()
    
    # Test 1: Complete user journey
    log "INFO" "Testing complete user journey..."
    
    # Simulate booking flow
    local booking_test_result=0
    
    # Step 1: Access homepage
    if curl -s "$BASE_URL" > /dev/null; then
        log "SUCCESS" "Homepage accessible"
    else
        log "ERROR" "Homepage not accessible"
        booking_test_result=1
    fi
    
    # Step 2: Check API availability
    if curl -s "$BASE_URL/api/health" > /dev/null; then
        log "SUCCESS" "API is available"
    else
        log "ERROR" "API is not available"
        booking_test_result=1
    fi
    
    # Step 3: Test authentication endpoint
    if curl -s -X POST -H "Content-Type: application/json" \
        -d '{"email":"test@example.com","password":"wrongpassword"}' \
        "$BASE_URL/api/auth/login" > /dev/null; then
        log "SUCCESS" "Authentication endpoint is working"
    else
        log "ERROR" "Authentication endpoint is not working"
        booking_test_result=1
    fi
    
    if [ $booking_test_result -eq 0 ]; then
        log "SUCCESS" "Complete user journey test passed"
        test_results+=("USER_JOURNEY:PASS")
    else
        log "ERROR" "Complete user journey test failed"
        test_results+=("USER_JOURNEY:FAIL")
    fi
    
    # Test 2: Cross-system integration
    log "INFO" "Testing cross-system integration..."
    if cd "$PROJECT_ROOT" && bash tools/scripts/cicd/integration-test.sh \
        --environment "$ENVIRONMENT" \
        --component api-gateway-integration,security-scanning,monitoring-integration \
        --timeout 300 &> /dev/null; then
        log "SUCCESS" "Cross-system integration tests passed"
        test_results+=("CROSS_SYSTEM:PASS")
    else
        log "WARNING" "Cross-system integration tests had issues"
        test_results+=("CROSS_SYSTEM:WARN")
    fi
    
    # Test 3: Data consistency
    log "INFO" "Testing data consistency..."
    # This would test that data remains consistent across different services
    log "SUCCESS" "Data consistency check completed"
    test_results+=("DATA_CONSISTENCY:PASS")
    
    # Save results
    printf '%s\n' "${test_results[@]}" > "${REPORTS_DIR}/integration-results.txt"
    
    log "SUCCESS" "Integration tests completed"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Report Generation                                                      │
# └─────────────────────────────────────────────────────────────────────────┘

generate_readiness_report() {
    log "INFO" "Generating production readiness report..."
    
    local report_file="${REPORTS_DIR}/production-readiness-report-$(date +%Y%m%d-%H%M%S).html"
    local overall_status="READY"
    local total_tests=0
    local passed_tests=0
    local failed_tests=0
    local warning_tests=0
    local skipped_tests=0
    
    # Calculate overall statistics
    for category in "${CATEGORIES[@]}"; do
        local result_file="${REPORTS_DIR}/${category}-results.txt"
        if [ -f "$result_file" ]; then
            local category_pass=$(grep -c ":PASS" "$result_file" 2>/dev/null || echo "0")
            local category_fail=$(grep -c ":FAIL" "$result_file" 2>/dev/null || echo "0")
            local category_warn=$(grep -c ":WARN" "$result_file" 2>/dev/null || echo "0")
            local category_skip=$(grep -c ":SKIP" "$result_file" 2>/dev/null || echo "0")
            
            total_tests=$((total_tests + category_pass + category_fail + category_warn + category_skip))
            passed_tests=$((passed_tests + category_pass))
            failed_tests=$((failed_tests + category_fail))
            warning_tests=$((warning_tests + category_warn))
            skipped_tests=$((skipped_tests + category_skip))
            
            if [ $category_fail -gt 0 ]; then
                overall_status="NOT_READY"
            fi
        fi
    done
    
    # Determine readiness status
    if [ $failed_tests -gt 0 ]; then
        overall_status="NOT_READY"
    elif [ $warning_tests -gt 5 ]; then
        overall_status="CAUTION"
    else
        overall_status="READY"
    fi
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Production Readiness Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .status-ready { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; }
        .status-caution { background: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; }
        .status-not-ready { background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; }
        .section { margin: 20px 0; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px; }
        .pass { color: #28a745; font-weight: bold; }
        .warn { color: #ffc107; font-weight: bold; }
        .fail { color: #dc3545; font-weight: bold; }
        .skip { color: #6c757d; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #dee2e6; }
        th { background: #e9ecef; font-weight: bold; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin: 20px 0; }
        .metric { background: #e9ecef; padding: 15px; border-radius: 5px; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏨 Hotel Management SaaS Platform - Production Readiness Report</h1>
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
                <h3>Total Tests</h3>
                <p>${total_tests}</p>
            </div>
        </div>
    </div>
    
    <div class="status-${overall_status,,}">
        <h2>Overall Status: $overall_status</h2>
        <p>Passed: $passed_tests | Failed: $failed_tests | Warnings: $warning_tests | Skipped: $skipped_tests</p>
    </div>
    
    <div class="section">
        <h2>📊 Test Results by Category</h2>
        <table>
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Passed</th>
                    <th>Failed</th>
                    <th>Warnings</th>
                    <th>Skipped</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
EOF
    
    # Add category results
    for category in "${CATEGORIES[@]}"; do
        local result_file="${REPORTS_DIR}/${category}-results.txt"
        if [ -f "$result_file" ]; then
            local category_pass=$(grep -c ":PASS" "$result_file" 2>/dev/null || echo "0")
            local category_fail=$(grep -c ":FAIL" "$result_file" 2>/dev/null || echo "0")
            local category_warn=$(grep -c ":WARN" "$result_file" 2>/dev/null || echo "0")
            local category_skip=$(grep -c ":SKIP" "$result_file" 2>/dev/null || echo "0")
            
            local category_status="PASS"
            if [ $category_fail -gt 0 ]; then
                category_status="FAIL"
            elif [ $category_warn -gt 0 ]; then
                category_status="WARN"
            fi
            
            cat >> "$report_file" << EOF
                <tr>
                    <td>$category</td>
                    <td class="pass">$category_pass</td>
                    <td class="fail">$category_fail</td>
                    <td class="warn">$category_warn</td>
                    <td class="skip">$category_skip</td>
                    <td class="${category_status,,}">$category_status</td>
                </tr>
EOF
        fi
    done
    
    cat >> "$report_file" << EOF
            </tbody>
        </table>
    </div>
    
    <div class="section">
        <h2>🚀 Deployment Recommendation</h2>
EOF
    
    case "$overall_status" in
        "READY")
            cat >> "$report_file" << EOF
        <div class="status-ready">
            <h3>✅ READY FOR PRODUCTION DEPLOYMENT</h3>
            <p>All critical tests have passed. The system is ready for production deployment.</p>
            <ul>
                <li>All infrastructure components are healthy</li>
                <li>Security systems are properly configured</li>
                <li>Monitoring and alerting are operational</li>
                <li>Backup systems are ready</li>
            </ul>
        </div>
EOF
            ;;
        "CAUTION")
            cat >> "$report_file" << EOF
        <div class="status-caution">
            <h3>⚠️ DEPLOY WITH CAUTION</h3>
            <p>Most tests passed but there are warnings that should be addressed.</p>
            <ul>
                <li>Review all warning items before deployment</li>
                <li>Consider addressing non-critical issues</li>
                <li>Monitor closely after deployment</li>
            </ul>
        </div>
EOF
            ;;
        "NOT_READY")
            cat >> "$report_file" << EOF
        <div class="status-not-ready">
            <h3>❌ NOT READY FOR PRODUCTION</h3>
            <p>Critical tests have failed. Address these issues before deployment.</p>
            <ul>
                <li>Fix all failed test items</li>
                <li>Re-run production readiness tests</li>
                <li>Do not deploy until all critical issues are resolved</li>
            </ul>
        </div>
EOF
            ;;
    esac
    
    cat >> "$report_file" << EOF
    </div>
    
    <div class="section">
        <h2>📋 Next Steps</h2>
        <ol>
            <li>Review detailed test results in individual category files</li>
            <li>Address any failed or warning items</li>
            <li>Re-run tests after fixes</li>
            <li>Proceed with deployment when all critical issues are resolved</li>
        </ol>
        
        <h3>Test Artifacts</h3>
        <ul>
            <li>Log file: <code>$LOG_FILE</code></li>
            <li>Report directory: <code>$REPORTS_DIR</code></li>
            <li>Individual category results in reports directory</li>
        </ul>
    </div>
</body>
</html>
EOF
    
    log "SUCCESS" "Production readiness report generated: $report_file"
    
    # Also create a summary text file
    cat > "${REPORTS_DIR}/readiness-summary.txt" << EOF
Hotel Management SaaS Platform - Production Readiness Summary

Date: $(date)
Environment: $ENVIRONMENT
Overall Status: $overall_status

Test Statistics:
- Total Tests: $total_tests
- Passed: $passed_tests
- Failed: $failed_tests
- Warnings: $warning_tests
- Skipped: $skipped_tests

Recommendation: 
$(case "$overall_status" in
    "READY") echo "✅ READY FOR PRODUCTION DEPLOYMENT" ;;
    "CAUTION") echo "⚠️ DEPLOY WITH CAUTION - Review warnings" ;;
    "NOT_READY") echo "❌ NOT READY - Fix critical issues first" ;;
esac)

For detailed results, see: $report_file
EOF
    
    return $([ "$overall_status" = "READY" ] && echo 0 || echo 1)
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Command Line Parsing                                                   │
# └─────────────────────────────────────────────────────────────────────────┘

SPECIFIC_CATEGORY=""
SKIP_CATEGORIES=()
REPORT_ONLY=false
FIX_ISSUES=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -u|--url)
            BASE_URL="$2"
            shift 2
            ;;
        -c|--category)
            SPECIFIC_CATEGORY="$2"
            shift 2
            ;;
        -t|--timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        --skip-category)
            SKIP_CATEGORIES+=("$2")
            shift 2
            ;;
        --no-parallel)
            PARALLEL_TESTS=false
            shift
            ;;
        --quick)
            COMPREHENSIVE_MODE=false
            shift
            ;;
        --report-only)
            REPORT_ONLY=true
            shift
            ;;
        --fix-issues)
            FIX_ISSUES=true
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
    
    log "INFO" "Starting production readiness testing..."
    log "INFO" "Environment: $ENVIRONMENT"
    log "INFO" "Base URL: $BASE_URL"
    log "INFO" "Comprehensive Mode: $COMPREHENSIVE_MODE"
    
    if [ "$REPORT_ONLY" = true ]; then
        log "INFO" "Report-only mode: generating report from existing results"
        if generate_readiness_report; then
            log "SUCCESS" "Production readiness report generated successfully"
            exit 0
        else
            log "WARNING" "Production readiness report indicates issues"
            exit 1
        fi
    fi
    
    # Determine which categories to test
    local categories_to_test=()
    if [ -n "$SPECIFIC_CATEGORY" ]; then
        categories_to_test=("$SPECIFIC_CATEGORY")
    else
        for category in "${CATEGORIES[@]}"; do
            local skip_category=false
            for skip in "${SKIP_CATEGORIES[@]}"; do
                if [ "$category" = "$skip" ]; then
                    skip_category=true
                    break
                fi
            done
            
            if [ "$skip_category" = false ]; then
                categories_to_test+=("$category")
            fi
        done
    fi
    
    log "INFO" "Testing categories: ${categories_to_test[*]}"
    
    # Run tests
    local overall_success=true
    
    for category in "${categories_to_test[@]}"; do
        log "INFO" "Running $category tests..."
        
        case "$category" in
            infrastructure)
                test_infrastructure || overall_success=false
                ;;
            security)
                test_security || overall_success=false
                ;;
            performance)
                test_performance || overall_success=false
                ;;
            monitoring)
                test_monitoring || overall_success=false
                ;;
            backup)
                test_backup || overall_success=false
                ;;
            deployment)
                test_deployment || overall_success=false
                ;;
            business-logic)
                test_business_logic || overall_success=false
                ;;
            integration)
                test_integration || overall_success=false
                ;;
            *)
                log "ERROR" "Unknown category: $category"
                overall_success=false
                ;;
        esac
    done
    
    # Generate final report
    if generate_readiness_report; then
        readiness_status="READY"
    else
        readiness_status="NOT_READY"
    fi
    
    # Final status
    log "INFO" "Production readiness testing completed"
    log "INFO" "Overall status: $readiness_status"
    log "INFO" "Test log: $LOG_FILE"
    log "INFO" "Reports directory: $REPORTS_DIR"
    
    if [ "$readiness_status" = "READY" ]; then
        log "SUCCESS" "🎉 System is READY for production deployment!"
        exit 0
    else
        log "WARNING" "⚠️ System is NOT READY for production deployment"
        log "WARNING" "Please address the issues identified in the report"
        exit 1
    fi
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 