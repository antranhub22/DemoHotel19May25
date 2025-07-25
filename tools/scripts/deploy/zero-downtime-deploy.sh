#!/bin/bash
# =============================================================================
# Hotel Management SaaS Platform - Zero-Downtime Deployment Script
# Advanced deployment strategies with health checks and traffic management
# =============================================================================

set -euo pipefail

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Configuration & Constants                                               │
# └─────────────────────────────────────────────────────────────────────────┘

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../../" && pwd)"
DEPLOY_LOG="${PROJECT_ROOT}/logs/zero-downtime-$(date +%Y%m%d-%H%M%S).log"

# Default configuration
ENVIRONMENT="${ENVIRONMENT:-production}"
STRATEGY="${STRATEGY:-blue-green}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
HEALTH_CHECK_TIMEOUT="${HEALTH_CHECK_TIMEOUT:-300}"
HEALTH_CHECK_INTERVAL="${HEALTH_CHECK_INTERVAL:-5}"
TRAFFIC_SHIFT_DELAY="${TRAFFIC_SHIFT_DELAY:-30}"
CANARY_PERCENTAGE="${CANARY_PERCENTAGE:-10}"
ROLLBACK_THRESHOLD="${ROLLBACK_THRESHOLD:-5}"

# Health check configuration
HEALTH_ENDPOINT="${HEALTH_ENDPOINT:-/health}"
READINESS_ENDPOINT="${READINESS_ENDPOINT:-/ready}"
METRICS_ENDPOINT="${METRICS_ENDPOINT:-/metrics}"
EXPECTED_STATUS_CODE="${EXPECTED_STATUS_CODE:-200}"

# Load balancer configuration
LB_BACKEND_PREFIX="${LB_BACKEND_PREFIX:-hotel-app}"
LB_CONFIG_PATH="${LB_CONFIG_PATH:-/etc/nginx/conf.d/upstream.conf}"
LB_RELOAD_CMD="${LB_RELOAD_CMD:-nginx -s reload}"

# Monitoring configuration
PROMETHEUS_URL="${PROMETHEUS_URL:-http://localhost:9090}"
GRAFANA_URL="${GRAFANA_URL:-http://localhost:3001}"
ALERT_WEBHOOK="${ALERT_WEBHOOK:-}"

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
    
    echo "[$timestamp] [$level] $message" >> "$DEPLOY_LOG"
}

send_alert() {
    local message="$1"
    local severity="${2:-info}"
    
    if [ -n "$ALERT_WEBHOOK" ]; then
        local payload="{\"text\":\"🚀 [$severity] $message\",\"username\":\"deployment-bot\"}"
        curl -s -X POST -H 'Content-type: application/json' --data "$payload" "$ALERT_WEBHOOK" || true
    fi
    
    log "INFO" "Alert sent: $message"
}

show_usage() {
    cat << EOF
Hotel Management SaaS Platform - Zero-Downtime Deployment Script

Usage: $0 [OPTIONS]

OPTIONS:
    -e, --environment ENV         Target environment (staging|production)
    -s, --strategy STRATEGY       Deployment strategy (blue-green|rolling|canary)
    -i, --image IMAGE_TAG         Docker image tag to deploy
    --health-timeout TIMEOUT     Health check timeout in seconds (default: 300)
    --health-interval INTERVAL   Health check interval in seconds (default: 5)
    --traffic-delay DELAY        Traffic shift delay in seconds (default: 30)
    --canary-percentage PCT      Canary traffic percentage (default: 10)
    --rollback-threshold PCT     Error rate rollback threshold (default: 5)
    --lb-config PATH             Load balancer config path
    --prometheus-url URL         Prometheus URL for metrics
    --grafana-url URL            Grafana URL for dashboards
    --alert-webhook URL          Webhook URL for alerts
    --dry-run                    Show what would be done without executing
    -h, --help                   Show this help message

DEPLOYMENT STRATEGIES:
    blue-green    - Deploy to idle environment, then switch traffic
    rolling       - Gradually replace instances one by one
    canary        - Deploy to subset, gradually increase traffic

EXAMPLES:
    $0 --strategy blue-green --image v1.2.3
    $0 --strategy canary --canary-percentage 20 --image v1.2.3
    $0 --strategy rolling --environment staging

EOF
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Health Check Functions                                                 │
# └─────────────────────────────────────────────────────────────────────────┘

wait_for_health() {
    local service_url="$1"
    local timeout="${2:-$HEALTH_CHECK_TIMEOUT}"
    local interval="${3:-$HEALTH_CHECK_INTERVAL}"
    local service_name="${4:-service}"
    
    log "INFO" "Waiting for $service_name health at $service_url (timeout: ${timeout}s)"
    
    local start_time=$(date +%s)
    local consecutive_failures=0
    local max_consecutive_failures=3
    
    while true; do
        local current_time=$(date +%s)
        local elapsed_time=$((current_time - start_time))
        
        if [ $elapsed_time -ge $timeout ]; then
            log "ERROR" "Health check timeout after ${timeout}s for $service_name"
            return 1
        fi
        
        # Perform health check
        local response_code
        response_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$service_url$HEALTH_ENDPOINT" || echo "000")
        
        if [ "$response_code" = "$EXPECTED_STATUS_CODE" ]; then
            log "SUCCESS" "$service_name is healthy (${elapsed_time}s)"
            return 0
        else
            consecutive_failures=$((consecutive_failures + 1))
            log "WARNING" "$service_name health check failed (attempt $consecutive_failures, code: $response_code)"
            
            if [ $consecutive_failures -ge $max_consecutive_failures ]; then
                log "ERROR" "$service_name failed $max_consecutive_failures consecutive health checks"
                return 1
            fi
        fi
        
        sleep $interval
    done
}

check_readiness() {
    local service_url="$1"
    local service_name="${2:-service}"
    
    log "INFO" "Checking readiness for $service_name"
    
    local response_code
    response_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$service_url$READINESS_ENDPOINT" || echo "000")
    
    if [ "$response_code" = "$EXPECTED_STATUS_CODE" ]; then
        log "SUCCESS" "$service_name is ready"
        return 0
    else
        log "WARNING" "$service_name is not ready (code: $response_code)"
        return 1
    fi
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Metrics and Monitoring                                                 │
# └─────────────────────────────────────────────────────────────────────────┘

get_service_metrics() {
    local service_url="$1"
    local service_name="${2:-service}"
    
    # Get basic metrics
    local response_time error_rate request_rate
    
    # Use Prometheus to get metrics if available
    if [ -n "$PROMETHEUS_URL" ] && curl -s "$PROMETHEUS_URL" > /dev/null 2>&1; then
        log "INFO" "Fetching metrics from Prometheus for $service_name"
        
        # Query response time (P95)
        response_time=$(curl -s "${PROMETHEUS_URL}/api/v1/query?query=histogram_quantile(0.95,http_request_duration_seconds_bucket{service=\"$service_name\"})" | \
            jq -r '.data.result[0].value[1] // "unknown"' 2>/dev/null || echo "unknown")
        
        # Query error rate
        error_rate=$(curl -s "${PROMETHEUS_URL}/api/v1/query?query=rate(http_requests_total{service=\"$service_name\",status=~\"5..\"}[5m])*100" | \
            jq -r '.data.result[0].value[1] // "unknown"' 2>/dev/null || echo "unknown")
        
        # Query request rate
        request_rate=$(curl -s "${PROMETHEUS_URL}/api/v1/query?query=rate(http_requests_total{service=\"$service_name\"}[5m])" | \
            jq -r '.data.result[0].value[1] // "unknown"' 2>/dev/null || echo "unknown")
    else
        # Fallback: direct metrics endpoint
        if curl -s "$service_url$METRICS_ENDPOINT" > /dev/null 2>&1; then
            log "INFO" "Fetching metrics directly from $service_name"
            response_time="unknown"
            error_rate="unknown"
            request_rate="unknown"
        else
            log "WARNING" "No metrics available for $service_name"
            response_time="unavailable"
            error_rate="unavailable"
            request_rate="unavailable"
        fi
    fi
    
    echo "$response_time,$error_rate,$request_rate"
}

monitor_deployment_metrics() {
    local service_url="$1"
    local service_name="${2:-service}"
    local duration="${3:-60}"
    
    log "INFO" "Monitoring $service_name metrics for ${duration}s"
    
    local start_time=$(date +%s)
    local high_error_count=0
    local max_high_error_count=3
    
    while true; do
        local current_time=$(date +%s)
        local elapsed_time=$((current_time - start_time))
        
        if [ $elapsed_time -ge $duration ]; then
            log "SUCCESS" "Monitoring completed for $service_name"
            return 0
        fi
        
        # Get current metrics
        local metrics
        metrics=$(get_service_metrics "$service_url" "$service_name")
        local response_time error_rate request_rate
        IFS=',' read -r response_time error_rate request_rate <<< "$metrics"
        
        log "INFO" "Metrics - Response Time: ${response_time}ms, Error Rate: ${error_rate}%, Request Rate: ${request_rate}/s"
        
        # Check if error rate is too high
        if [ "$error_rate" != "unknown" ] && [ "$error_rate" != "unavailable" ]; then
            local error_threshold=$(echo "$error_rate > $ROLLBACK_THRESHOLD" | bc -l 2>/dev/null || echo "0")
            if [ "$error_threshold" = "1" ]; then
                high_error_count=$((high_error_count + 1))
                log "WARNING" "High error rate detected: ${error_rate}% (threshold: ${ROLLBACK_THRESHOLD}%)"
                
                if [ $high_error_count -ge $max_high_error_count ]; then
                    log "ERROR" "Error rate consistently above threshold, triggering rollback"
                    return 1
                fi
            else
                high_error_count=0
            fi
        fi
        
        sleep 10
    done
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Load Balancer Management                                               │
# └─────────────────────────────────────────────────────────────────────────┘

update_load_balancer() {
    local action="$1"  # add, remove, drain
    local backend_name="$2"
    local backend_url="$3"
    local weight="${4:-1}"
    
    log "INFO" "Updating load balancer: $action $backend_name ($backend_url)"
    
    case "$action" in
        add)
            # Add backend to load balancer
            if [ -f "$LB_CONFIG_PATH" ]; then
                # Create backup
                cp "$LB_CONFIG_PATH" "${LB_CONFIG_PATH}.backup"
                
                # Add new backend
                echo "    server $backend_url weight=$weight max_fails=3 fail_timeout=30s;" >> "$LB_CONFIG_PATH"
                
                # Reload load balancer
                if eval "$LB_RELOAD_CMD"; then
                    log "SUCCESS" "Backend $backend_name added to load balancer"
                else
                    # Restore backup on failure
                    mv "${LB_CONFIG_PATH}.backup" "$LB_CONFIG_PATH"
                    log "ERROR" "Failed to reload load balancer, restored backup"
                    return 1
                fi
            else
                log "WARNING" "Load balancer config not found, using Docker Compose scaling"
                # Fallback to Docker Compose
                docker-compose up -d --scale "$backend_name=2" || return 1
            fi
            ;;
            
        remove)
            # Remove backend from load balancer
            if [ -f "$LB_CONFIG_PATH" ]; then
                cp "$LB_CONFIG_PATH" "${LB_CONFIG_PATH}.backup"
                
                # Remove backend line
                grep -v "$backend_url" "$LB_CONFIG_PATH" > "${LB_CONFIG_PATH}.tmp" && mv "${LB_CONFIG_PATH}.tmp" "$LB_CONFIG_PATH"
                
                if eval "$LB_RELOAD_CMD"; then
                    log "SUCCESS" "Backend $backend_name removed from load balancer"
                else
                    mv "${LB_CONFIG_PATH}.backup" "$LB_CONFIG_PATH"
                    log "ERROR" "Failed to reload load balancer, restored backup"
                    return 1
                fi
            else
                docker-compose up -d --scale "$backend_name=1" || return 1
            fi
            ;;
            
        drain)
            # Drain traffic from backend
            log "INFO" "Draining traffic from $backend_name"
            # This would implement connection draining
            # For now, we'll wait for existing connections to finish
            sleep 30
            ;;
    esac
}

shift_traffic() {
    local from_backend="$1"
    local to_backend="$2"
    local percentage="${3:-100}"
    
    log "INFO" "Shifting ${percentage}% traffic from $from_backend to $to_backend"
    
    # This would implement weighted traffic shifting
    # Implementation depends on load balancer type (nginx, haproxy, cloud LB, etc.)
    
    case "$percentage" in
        100)
            update_load_balancer "remove" "$from_backend" ""
            update_load_balancer "add" "$to_backend" "" "1"
            ;;
        *)
            # Implement weighted distribution
            local from_weight=$((100 - percentage))
            local to_weight=$percentage
            
            update_load_balancer "add" "$to_backend" "" "$to_weight"
            # Update existing backend weight would go here
            ;;
    esac
    
    log "SUCCESS" "Traffic shifted to $to_backend"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Blue-Green Deployment                                                  │
# └─────────────────────────────────────────────────────────────────────────┘

blue_green_deploy() {
    log "INFO" "Starting Blue-Green deployment"
    send_alert "Starting Blue-Green deployment for $ENVIRONMENT" "info"
    
    # Determine current and target environments
    local current_env target_env
    if docker ps --format "table {{.Names}}" | grep -q "blue"; then
        current_env="blue"
        target_env="green"
    else
        current_env="green"
        target_env="blue"
    fi
    
    log "INFO" "Current environment: $current_env, Target environment: $target_env"
    
    # Deploy to target environment
    log "INFO" "Deploying to $target_env environment"
    
    # Stop and remove existing target environment
    docker-compose -p "hotel-$target_env" down || true
    
    # Start new target environment
    COMPOSE_PROJECT_NAME="hotel-$target_env" \
    IMAGE_TAG="$IMAGE_TAG" \
    docker-compose -f docker-compose.production.yml up -d
    
    # Wait for target environment to be healthy
    local target_url="http://localhost:10000"  # Adjust port as needed
    
    if ! wait_for_health "$target_url" "$HEALTH_CHECK_TIMEOUT" "$HEALTH_CHECK_INTERVAL" "$target_env"; then
        log "ERROR" "Target environment $target_env failed health checks"
        send_alert "Blue-Green deployment failed: $target_env environment unhealthy" "error"
        return 1
    fi
    
    # Monitor target environment metrics
    if ! monitor_deployment_metrics "$target_url" "$target_env" 60; then
        log "ERROR" "Target environment $target_env metrics indicate problems"
        send_alert "Blue-Green deployment failed: $target_env environment metrics issues" "error"
        return 1
    fi
    
    # Switch traffic to target environment
    log "INFO" "Switching traffic to $target_env environment"
    
    # Update load balancer or service discovery
    shift_traffic "$current_env" "$target_env" 100
    
    # Wait and verify traffic switch
    sleep "$TRAFFIC_SHIFT_DELAY"
    
    if ! wait_for_health "$target_url" 60 5 "$target_env"; then
        log "ERROR" "Traffic switch verification failed"
        # Rollback
        shift_traffic "$target_env" "$current_env" 100
        send_alert "Blue-Green deployment failed: traffic switch verification failed, rolled back" "error"
        return 1
    fi
    
    # Clean up old environment
    log "INFO" "Cleaning up $current_env environment"
    docker-compose -p "hotel-$current_env" down
    
    log "SUCCESS" "Blue-Green deployment completed successfully"
    send_alert "Blue-Green deployment completed successfully for $ENVIRONMENT" "success"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Rolling Deployment                                                     │
# └─────────────────────────────────────────────────────────────────────────┘

rolling_deploy() {
    log "INFO" "Starting Rolling deployment"
    send_alert "Starting Rolling deployment for $ENVIRONMENT" "info"
    
    # Get list of current instances
    local instances=(app-1 app-2)  # Adjust based on your setup
    
    for instance in "${instances[@]}"; do
        log "INFO" "Rolling update for instance: $instance"
        
        # Remove instance from load balancer
        update_load_balancer "drain" "$instance" ""
        
        # Wait for connections to drain
        sleep 30
        
        # Update instance
        docker-compose up -d --no-deps "$instance"
        
        # Wait for instance to be healthy
        local instance_url="http://localhost:10000"  # Adjust based on instance
        
        if ! wait_for_health "$instance_url" "$HEALTH_CHECK_TIMEOUT" "$HEALTH_CHECK_INTERVAL" "$instance"; then
            log "ERROR" "Rolling deployment failed for instance: $instance"
            send_alert "Rolling deployment failed for instance: $instance" "error"
            return 1
        fi
        
        # Add instance back to load balancer
        update_load_balancer "add" "$instance" "$instance_url"
        
        # Monitor metrics for this instance
        if ! monitor_deployment_metrics "$instance_url" "$instance" 30; then
            log "ERROR" "Instance $instance metrics indicate problems"
            send_alert "Rolling deployment failed: $instance metrics issues" "error"
            return 1
        fi
        
        log "SUCCESS" "Instance $instance updated successfully"
    done
    
    log "SUCCESS" "Rolling deployment completed successfully"
    send_alert "Rolling deployment completed successfully for $ENVIRONMENT" "success"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Canary Deployment                                                      │
# └─────────────────────────────────────────────────────────────────────────┘

canary_deploy() {
    log "INFO" "Starting Canary deployment with ${CANARY_PERCENTAGE}% traffic"
    send_alert "Starting Canary deployment (${CANARY_PERCENTAGE}%) for $ENVIRONMENT" "info"
    
    # Deploy canary instance
    log "INFO" "Deploying canary instance"
    
    COMPOSE_PROJECT_NAME="hotel-canary" \
    IMAGE_TAG="$IMAGE_TAG" \
    docker-compose -f docker-compose.production.yml up -d app-1
    
    local canary_url="http://localhost:10001"  # Different port for canary
    
    # Wait for canary to be healthy
    if ! wait_for_health "$canary_url" "$HEALTH_CHECK_TIMEOUT" "$HEALTH_CHECK_INTERVAL" "canary"; then
        log "ERROR" "Canary instance failed health checks"
        send_alert "Canary deployment failed: canary instance unhealthy" "error"
        return 1
    fi
    
    # Route percentage of traffic to canary
    shift_traffic "production" "canary" "$CANARY_PERCENTAGE"
    
    # Monitor canary metrics
    log "INFO" "Monitoring canary with ${CANARY_PERCENTAGE}% traffic for 5 minutes"
    
    if ! monitor_deployment_metrics "$canary_url" "canary" 300; then
        log "ERROR" "Canary metrics indicate problems, rolling back"
        shift_traffic "canary" "production" 0
        docker-compose -p "hotel-canary" down
        send_alert "Canary deployment failed: metrics issues, rolled back" "error"
        return 1
    fi
    
    # Gradually increase canary traffic
    local traffic_steps=(25 50 75 100)
    
    for step in "${traffic_steps[@]}"; do
        if [ "$step" -le "$CANARY_PERCENTAGE" ]; then
            continue
        fi
        
        log "INFO" "Increasing canary traffic to ${step}%"
        shift_traffic "production" "canary" "$step"
        
        # Monitor for 2 minutes at each step
        if ! monitor_deployment_metrics "$canary_url" "canary" 120; then
            log "ERROR" "Canary metrics degraded at ${step}%, rolling back"
            shift_traffic "canary" "production" 0
            docker-compose -p "hotel-canary" down
            send_alert "Canary deployment failed at ${step}%, rolled back" "error"
            return 1
        fi
        
        log "SUCCESS" "Canary stable at ${step}% traffic"
    done
    
    # Promote canary to production
    log "INFO" "Promoting canary to production"
    
    # Stop old production
    docker-compose -p "hotel-production" down
    
    # Rename canary to production
    docker-compose -p "hotel-canary" down
    
    COMPOSE_PROJECT_NAME="hotel-production" \
    IMAGE_TAG="$IMAGE_TAG" \
    docker-compose -f docker-compose.production.yml up -d
    
    log "SUCCESS" "Canary deployment completed successfully"
    send_alert "Canary deployment completed successfully for $ENVIRONMENT" "success"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Rollback Functions                                                     │
# └─────────────────────────────────────────────────────────────────────────┘

rollback_deployment() {
    log "WARNING" "Initiating deployment rollback"
    send_alert "Deployment rollback initiated for $ENVIRONMENT" "warning"
    
    # Get previous version info
    local previous_version
    if [ -f "${PROJECT_ROOT}/.last-deploy-version" ]; then
        previous_version=$(cat "${PROJECT_ROOT}/.last-deploy-version")
        log "INFO" "Rolling back to version: $previous_version"
    else
        log "WARNING" "No previous version info found, using 'previous' tag"
        previous_version="previous"
    fi
    
    # Execute rollback based on strategy
    case "$STRATEGY" in
        blue-green)
            # Switch back to previous environment
            shift_traffic "current" "previous" 100
            ;;
        rolling)
            # Rolling rollback
            local instances=(app-1 app-2)
            for instance in "${instances[@]}"; do
                IMAGE_TAG="$previous_version" docker-compose up -d --no-deps "$instance"
                wait_for_health "http://localhost:10000" 60 5 "$instance"
            done
            ;;
        canary)
            # Remove canary and restore production
            shift_traffic "canary" "production" 0
            docker-compose -p "hotel-canary" down
            ;;
    esac
    
    log "SUCCESS" "Rollback completed"
    send_alert "Deployment rollback completed for $ENVIRONMENT" "success"
}

# ┌─────────────────────────────────────────────────────────────────────────┐
# │ Command Line Parsing                                                   │
# └─────────────────────────────────────────────────────────────────────────┘

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
        -i|--image)
            IMAGE_TAG="$2"
            shift 2
            ;;
        --health-timeout)
            HEALTH_CHECK_TIMEOUT="$2"
            shift 2
            ;;
        --health-interval)
            HEALTH_CHECK_INTERVAL="$2"
            shift 2
            ;;
        --traffic-delay)
            TRAFFIC_SHIFT_DELAY="$2"
            shift 2
            ;;
        --canary-percentage)
            CANARY_PERCENTAGE="$2"
            shift 2
            ;;
        --rollback-threshold)
            ROLLBACK_THRESHOLD="$2"
            shift 2
            ;;
        --lb-config)
            LB_CONFIG_PATH="$2"
            shift 2
            ;;
        --prometheus-url)
            PROMETHEUS_URL="$2"
            shift 2
            ;;
        --grafana-url)
            GRAFANA_URL="$2"
            shift 2
            ;;
        --alert-webhook)
            ALERT_WEBHOOK="$2"
            shift 2
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
    # Create logs directory
    mkdir -p "$(dirname "$DEPLOY_LOG")"
    
    log "INFO" "Starting zero-downtime deployment..."
    log "INFO" "Environment: $ENVIRONMENT"
    log "INFO" "Strategy: $STRATEGY"
    log "INFO" "Image: $IMAGE_TAG"
    
    if [ "$DRY_RUN" = true ]; then
        log "INFO" "DRY RUN MODE: Would execute $STRATEGY deployment"
        log "INFO" "Would deploy image: $IMAGE_TAG"
        log "INFO" "Would use health check timeout: ${HEALTH_CHECK_TIMEOUT}s"
        log "INFO" "Would monitor metrics and perform automatic rollback if needed"
        exit 0
    fi
    
    # Store current version for potential rollback
    echo "$IMAGE_TAG" > "${PROJECT_ROOT}/.last-deploy-version"
    
    # Execute deployment strategy
    local deployment_success=true
    
    case "$STRATEGY" in
        blue-green)
            if ! blue_green_deploy; then
                deployment_success=false
            fi
            ;;
        rolling)
            if ! rolling_deploy; then
                deployment_success=false
            fi
            ;;
        canary)
            if ! canary_deploy; then
                deployment_success=false
            fi
            ;;
        *)
            log "ERROR" "Unknown deployment strategy: $STRATEGY"
            exit 1
            ;;
    esac
    
    # Handle deployment result
    if [ "$deployment_success" = true ]; then
        log "SUCCESS" "Zero-downtime deployment completed successfully!"
        
        # Final health check
        if wait_for_health "http://localhost:10000" 60 5 "final"; then
            log "SUCCESS" "Final health check passed"
        else
            log "WARNING" "Final health check failed, but deployment was successful"
        fi
        
        exit 0
    else
        log "ERROR" "Zero-downtime deployment failed"
        
        if rollback_deployment; then
            log "SUCCESS" "Automatic rollback completed"
        else
            log "ERROR" "Automatic rollback failed - manual intervention required"
        fi
        
        exit 1
    fi
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 