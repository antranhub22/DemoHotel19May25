#!/bin/bash

# ============================================================================
# REQUEST CONTROLLER REFACTOR MONITORING SCRIPT
# ============================================================================
# This script monitors the RequestController refactor process and provides
# real-time feedback on the status of the refactor.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
CONTROLLER_FILE="apps/server/controllers/requestController.ts"
BACKUP_FILE="backup-files/requestController.backup-1753372754389.ts"
TEST_FILES=(
    "tests/unit/requestController.test.ts"
    "tests/integration/requestController.integration.test.ts"
)
FEATURE_FLAGS_FILE="apps/server/shared/FeatureFlags.ts"

# Function to check file status
check_file_status() {
    local file="$1"
    local description="$2"
    
    if [ -f "$file" ]; then
        local size=$(wc -c < "$file")
        local lines=$(wc -l < "$file")
        echo -e "${GREEN}✅ $description${NC}"
        echo -e "   📁 File: $file"
        echo -e "   📏 Size: ${size} bytes"
        echo -e "   📄 Lines: ${lines}"
    else
        echo -e "${RED}❌ $description${NC}"
        echo -e "   📁 File: $file (missing)"
    fi
}

# Function to check feature flags
check_feature_flags() {
    echo -e "${BLUE}🔧 FEATURE FLAGS STATUS${NC}"
    echo "========================"
    
    if [ -f "$FEATURE_FLAGS_FILE" ]; then
        # Check for request-related feature flags
        local flags=(
            "request-controller-v2"
            "request-validation-v2"
            "request-service-layer"
            "request-response-standardization"
        )
        
        for flag in "${flags[@]}"; do
            if grep -q "$flag" "$FEATURE_FLAGS_FILE"; then
                echo -e "${GREEN}✅ $flag${NC}"
            else
                echo -e "${RED}❌ $flag${NC}"
            fi
        done
    else
        echo -e "${RED}❌ Feature flags file not found${NC}"
    fi
}

# Function to check test coverage
check_test_coverage() {
    echo -e "${BLUE}🧪 TEST COVERAGE${NC}"
    echo "=================="
    
    local total_tests=0
    local existing_tests=0
    
    for test_file in "${TEST_FILES[@]}"; do
        if [ -f "$test_file" ]; then
            local test_count=$(grep -c "it(" "$test_file" 2>/dev/null || echo "0")
            local describe_count=$(grep -c "describe(" "$test_file" 2>/dev/null || echo "0")
            echo -e "${GREEN}✅ $(basename "$test_file")${NC}"
            echo -e "   🧪 Tests: $test_count"
            echo -e "   📋 Suites: $describe_count"
            existing_tests=$((existing_tests + test_count))
        else
            echo -e "${RED}❌ $(basename "$test_file") (missing)${NC}"
        fi
        total_tests=$((total_tests + 1))
    done
    
    echo -e "${CYAN}📊 Test Summary:${NC}"
    echo -e "   📁 Total test files: $total_tests"
    echo -e "   🧪 Total test cases: $existing_tests"
}

# Function to check API endpoints
check_api_endpoints() {
    echo -e "${BLUE}🌐 API ENDPOINTS${NC}"
    echo "=================="
    
    local endpoints=(
        "POST /api/request"
        "GET /api/request"
        "GET /api/request/:id"
        "PATCH /api/request/:id/status"
    )
    
    for endpoint in "${endpoints[@]}"; do
        if grep -q "$endpoint" "$CONTROLLER_FILE"; then
            echo -e "${GREEN}✅ $endpoint${NC}"
        else
            echo -e "${RED}❌ $endpoint${NC}"
        fi
    done
}

# Function to check code quality
check_code_quality() {
    echo -e "${BLUE}🔍 CODE QUALITY${NC}"
    echo "=================="
    
    if [ -f "$CONTROLLER_FILE" ]; then
        # Check for validation
        if grep -q "validation\|ValidationError\|zod" "$CONTROLLER_FILE"; then
            echo -e "${GREEN}✅ Input validation${NC}"
        else
            echo -e "${YELLOW}⚠️  Input validation (not implemented)${NC}"
        fi
        
        # Check for error handling
        if grep -q "try\|catch\|error" "$CONTROLLER_FILE"; then
            echo -e "${GREEN}✅ Error handling${NC}"
        else
            echo -e "${RED}❌ Error handling${NC}"
        fi
        
        # Check for logging
        if grep -q "logger\|log" "$CONTROLLER_FILE"; then
            echo -e "${GREEN}✅ Logging${NC}"
        else
            echo -e "${RED}❌ Logging${NC}"
        fi
        
        # Check for type safety
        if grep -q "interface\|type\|any" "$CONTROLLER_FILE"; then
            echo -e "${GREEN}✅ Type definitions${NC}"
        else
            echo -e "${YELLOW}⚠️  Type definitions (limited)${NC}"
        fi
    fi
}

# Function to check database operations
check_database_operations() {
    echo -e "${BLUE}🗄️  DATABASE OPERATIONS${NC}"
    echo "========================"
    
    if [ -f "$CONTROLLER_FILE" ]; then
        local operations=(
            "insert"
            "select"
            "update"
            "where"
            "orderBy"
            "limit"
        )
        
        for op in "${operations[@]}"; do
            if grep -q "$op" "$CONTROLLER_FILE"; then
                echo -e "${GREEN}✅ $op${NC}"
            else
                echo -e "${RED}❌ $op${NC}"
            fi
        done
    fi
}

# Function to check refactor progress
check_refactor_progress() {
    echo -e "${BLUE}📈 REFACTOR PROGRESS${NC}"
    echo "====================="
    
    local total_phases=5
    local completed_phases=0
    
    # Phase 0: Preparation (completed)
    if [ -f "$BACKUP_FILE" ] && [ -f "$CONTROLLER_FILE" ]; then
        echo -e "${GREEN}✅ Phase 0: Preparation & Safety Checks${NC}"
        completed_phases=$((completed_phases + 1))
    else
        echo -e "${RED}❌ Phase 0: Preparation & Safety Checks${NC}"
    fi
    
    # Phase 1: Non-breaking enhancements
    if grep -q "validation\|ValidationError" "$CONTROLLER_FILE" 2>/dev/null; then
        echo -e "${GREEN}✅ Phase 1: Input Validation${NC}"
        completed_phases=$((completed_phases + 1))
    else
        echo -e "${YELLOW}🔄 Phase 1: Input Validation (in progress)${NC}"
    fi
    
    # Phase 2: Service layer
    if grep -q "RequestService\|service layer" "$CONTROLLER_FILE" 2>/dev/null; then
        echo -e "${GREEN}✅ Phase 2: Service Layer${NC}"
        completed_phases=$((completed_phases + 1))
    else
        echo -e "${YELLOW}🔄 Phase 2: Service Layer (not started)${NC}"
    fi
    
    # Phase 3: Advanced features
    if grep -q "pagination\|filtering\|cache" "$CONTROLLER_FILE" 2>/dev/null; then
        echo -e "${GREEN}✅ Phase 3: Advanced Features${NC}"
        completed_phases=$((completed_phases + 1))
    else
        echo -e "${YELLOW}🔄 Phase 3: Advanced Features (not started)${NC}"
    fi
    
    # Phase 4: Deployment
    if grep -q "feature.*flag\|rollout" "$CONTROLLER_FILE" 2>/dev/null; then
        echo -e "${GREEN}✅ Phase 4: Deployment & Monitoring${NC}"
        completed_phases=$((completed_phases + 1))
    else
        echo -e "${YELLOW}🔄 Phase 4: Deployment & Monitoring (not started)${NC}"
    fi
    
    # Calculate progress percentage
    local progress=$((completed_phases * 100 / total_phases))
    echo -e "${CYAN}📊 Overall Progress: $progress% ($completed_phases/$total_phases phases)${NC}"
    
    # Progress bar
    local filled=$((progress / 10))
    local empty=$((10 - filled))
    printf "${GREEN}["
    for ((i=0; i<filled; i++)); do printf "█"; done
    for ((i=0; i<empty; i++)); do printf "░"; done
    printf "]${NC} $progress%%\n"
}

# Function to check system health
check_system_health() {
    echo -e "${BLUE}🏥 SYSTEM HEALTH${NC}"
    echo "=================="
    
    # Check if server is running
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server is running${NC}"
    else
        echo -e "${RED}❌ Server is not responding${NC}"
    fi
    
    # Check database connection
    if [ -f "database-files/dev.db" ]; then
        echo -e "${GREEN}✅ Database file exists${NC}"
    else
        echo -e "${YELLOW}⚠️  Database file not found (may be using PostgreSQL)${NC}"
    fi
    
    # Check for errors in logs
    if [ -f "logs/error.log" ]; then
        local error_count=$(grep -c "ERROR" logs/error.log 2>/dev/null || echo "0")
        if [ "$error_count" -eq 0 ]; then
            echo -e "${GREEN}✅ No recent errors${NC}"
        else
            echo -e "${YELLOW}⚠️  $error_count recent errors${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Error log not found${NC}"
    fi
}

# Function to show recommendations
show_recommendations() {
    echo -e "${BLUE}💡 RECOMMENDATIONS${NC}"
    echo "==================="
    
    if ! grep -q "validation\|ValidationError" "$CONTROLLER_FILE" 2>/dev/null; then
        echo -e "${YELLOW}🔧 Add input validation using Zod schemas${NC}"
    fi
    
    if ! grep -q "RequestService\|service layer" "$CONTROLLER_FILE" 2>/dev/null; then
        echo -e "${YELLOW}🔧 Implement service layer for business logic${NC}"
    fi
    
    if ! grep -q "interface\|type" "$CONTROLLER_FILE" 2>/dev/null; then
        echo -e "${YELLOW}🔧 Add TypeScript interfaces for better type safety${NC}"
    fi
    
    if ! grep -q "pagination\|limit\|offset" "$CONTROLLER_FILE" 2>/dev/null; then
        echo -e "${YELLOW}🔧 Implement pagination for large datasets${NC}"
    fi
    
    echo -e "${CYAN}📚 Next steps:${NC}"
    echo -e "   1. Start with Phase 1 (Input Validation)"
    echo -e "   2. Enable feature flags gradually"
    echo -e "   3. Run tests after each phase"
    echo -e "   4. Monitor performance and errors"
}

# Main monitoring function
main() {
    echo -e "${PURPLE}🔍 REQUEST CONTROLLER REFACTOR MONITOR${NC}"
    echo "==============================================="
    echo -e "Timestamp: $(date)"
    echo ""
    
    # Check file status
    echo -e "${BLUE}📁 FILE STATUS${NC}"
    echo "=============="
    check_file_status "$CONTROLLER_FILE" "RequestController"
    check_file_status "$BACKUP_FILE" "Backup file"
    check_file_status "$FEATURE_FLAGS_FILE" "Feature flags"
    
    echo ""
    
    # Check feature flags
    check_feature_flags
    
    echo ""
    
    # Check test coverage
    check_test_coverage
    
    echo ""
    
    # Check API endpoints
    check_api_endpoints
    
    echo ""
    
    # Check code quality
    check_code_quality
    
    echo ""
    
    # Check database operations
    check_database_operations
    
    echo ""
    
    # Check refactor progress
    check_refactor_progress
    
    echo ""
    
    # Check system health
    check_system_health
    
    echo ""
    
    # Show recommendations
    show_recommendations
    
    echo ""
    echo -e "${GREEN}✅ Monitoring complete!${NC}"
}

# Check if script is run with --help
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "Usage: $0 [--help]"
    echo ""
    echo "This script monitors the RequestController refactor process and provides"
    echo "real-time feedback on the status of the refactor."
    echo ""
    echo "The script checks:"
    echo "  - File status and existence"
    echo "  - Feature flags configuration"
    echo "  - Test coverage"
    echo "  - API endpoints"
    echo "  - Code quality metrics"
    echo "  - Database operations"
    echo "  - Refactor progress"
    echo "  - System health"
    echo "  - Provides recommendations"
    echo ""
    echo "Options:"
    echo "  --help, -h    Show this help message"
    exit 0
fi

# Run main function
main "$@" 