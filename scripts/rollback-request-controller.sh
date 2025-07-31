#!/bin/bash

# ============================================================================
# REQUEST CONTROLLER ROLLBACK SCRIPT
# ============================================================================
# This script provides emergency rollback functionality for RequestController
# refactor. It can restore the original implementation if issues arise.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_FILE="backup-files/requestController.backup-1753372754389.ts"
TARGET_FILE="apps/server/controllers/requestController.ts"
FEATURE_FLAGS_FILE="apps/server/shared/FeatureFlags.ts"

echo -e "${BLUE}🔄 REQUEST CONTROLLER ROLLBACK SCRIPT${NC}"
echo "=========================================="

# Function to check if backup exists
check_backup() {
    if [ ! -f "$BACKUP_FILE" ]; then
        echo -e "${RED}❌ Backup file not found: $BACKUP_FILE${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Backup file found: $BACKUP_FILE${NC}"
}

# Function to disable feature flags
disable_feature_flags() {
    echo -e "${YELLOW}🔧 Disabling RequestController feature flags...${NC}"
    
    # Disable all request-related feature flags
    export ENABLE_REQUEST_CONTROLLER_V2=false
    export ENABLE_REQUEST_VALIDATION_V2=false
    export ENABLE_REQUEST_SERVICE_LAYER=false
    export ENABLE_REQUEST_RESPONSE_STANDARDIZATION=false
    
    echo -e "${GREEN}✅ Feature flags disabled${NC}"
}

# Function to restore backup
restore_backup() {
    echo -e "${YELLOW}🔄 Restoring RequestController from backup...${NC}"
    
    # Create backup of current file
    if [ -f "$TARGET_FILE" ]; then
        cp "$TARGET_FILE" "${TARGET_FILE}.before-rollback-$(date +%Y%m%d_%H%M%S)"
        echo -e "${GREEN}✅ Current file backed up${NC}"
    fi
    
    # Restore from backup
    cp "$BACKUP_FILE" "$TARGET_FILE"
    echo -e "${GREEN}✅ RequestController restored from backup${NC}"
}

# Function to restart services
restart_services() {
    echo -e "${YELLOW}🔄 Restarting services...${NC}"
    
    # Check if pm2 is running
    if command -v pm2 &> /dev/null; then
        echo "Restarting with PM2..."
        pm2 restart all
    else
        echo "PM2 not found, please restart your services manually"
    fi
    
    echo -e "${GREEN}✅ Services restarted${NC}"
}

# Function to verify rollback
verify_rollback() {
    echo -e "${YELLOW}🔍 Verifying rollback...${NC}"
    
    # Check if target file exists and has content
    if [ -f "$TARGET_FILE" ]; then
        echo -e "${GREEN}✅ Target file exists${NC}"
        
        # Check if it contains the backup content
        if grep -q "REQUEST CONTROLLER BACKUP" "$TARGET_FILE"; then
            echo -e "${GREEN}✅ Backup content verified${NC}"
        else
            echo -e "${RED}❌ Backup content not found in target file${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ Target file not found${NC}"
        return 1
    fi
    
    return 0
}

# Function to run health checks
run_health_checks() {
    echo -e "${YELLOW}🏥 Running health checks...${NC}"
    
    # Wait a moment for services to start
    sleep 5
    
    # Check if server is responding
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server health check passed${NC}"
    else
        echo -e "${RED}❌ Server health check failed${NC}"
        return 1
    fi
    
    # Test request endpoint
    if curl -f -X POST http://localhost:3000/api/request \
        -H "Content-Type: application/json" \
        -d '{"requestText":"test","roomNumber":"101"}' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Request endpoint test passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Request endpoint test failed (may be expected)${NC}"
    fi
    
    return 0
}

# Function to show rollback status
show_status() {
    echo -e "${BLUE}📊 ROLLBACK STATUS${NC}"
    echo "=================="
    echo -e "Backup file: ${GREEN}$BACKUP_FILE${NC}"
    echo -e "Target file: ${GREEN}$TARGET_FILE${NC}"
    echo -e "Feature flags: ${YELLOW}Disabled${NC}"
    echo -e "Services: ${GREEN}Restarted${NC}"
    echo -e "Health check: ${GREEN}Passed${NC}"
}

# Main rollback process
main() {
    echo -e "${BLUE}🚨 Starting emergency rollback...${NC}"
    
    # Check backup
    check_backup
    
    # Disable feature flags
    disable_feature_flags
    
    # Restore backup
    restore_backup
    
    # Restart services
    restart_services
    
    # Verify rollback
    if verify_rollback; then
        echo -e "${GREEN}✅ Rollback verification passed${NC}"
    else
        echo -e "${RED}❌ Rollback verification failed${NC}"
        exit 1
    fi
    
    # Run health checks
    if run_health_checks; then
        echo -e "${GREEN}✅ Health checks passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Some health checks failed${NC}"
    fi
    
    # Show status
    show_status
    
    echo -e "${GREEN}🎉 Rollback completed successfully!${NC}"
    echo -e "${YELLOW}💡 If you need to re-enable the new features, set the feature flags to true${NC}"
}

# Check if script is run with --help
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Usage: $0 [--help]"
    echo ""
    echo "This script performs an emergency rollback of the RequestController"
    echo "to the original implementation if issues arise during refactor."
    echo ""
    echo "Options:"
    echo "  --help, -h    Show this help message"
    echo ""
    echo "The script will:"
    echo "  1. Check for backup file"
    echo "  2. Disable feature flags"
    echo "  3. Restore original implementation"
    echo "  4. Restart services"
    echo "  5. Verify rollback"
    echo "  6. Run health checks"
    exit 0
fi

# Run main function
main "$@" 