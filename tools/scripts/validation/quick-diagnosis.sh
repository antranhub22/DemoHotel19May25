#!/bin/bash

# ============================================================================
# Quick Diagnosis Commands
# Fast repository health check with prioritized issue detection
# ============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Icons
CHECK="✅"
WARNING="⚠️"
ERROR="❌"
INFO="ℹ️"
ROCKET="🚀"

echo -e "${BLUE}🔍 Quick Diagnosis Commands${NC}"
echo "=================================="
echo ""

# Function to run command with error handling
run_check() {
    local name="$1"
    local command="$2"
    local icon="$3"
    
    echo -e "${CYAN}=== $name ===${NC}"
    if eval "$command"; then
        echo -e "${GREEN}$icon $name passed${NC}"
        return 0
    else
        echo -e "${RED}$ERROR $name failed${NC}"
        return 1
    fi
    echo ""
}

# Function to run command and capture output
run_check_with_output() {
    local name="$1"
    local command="$2"
    local icon="$3"
    
    echo -e "${CYAN}=== $name ===${NC}"
    local output
    local exit_code=0
    
    if output=$(eval "$command" 2>&1); then
        echo -e "${GREEN}$icon $name passed${NC}"
        if [ -n "$output" ]; then
            echo "$output" | head -10
        fi
        return 0
    else
        exit_code=$?
        echo -e "${RED}$ERROR $name failed${NC}"
        if [ -n "$output" ]; then
            echo "$output" | head -10
        fi
        return $exit_code
    fi
    echo ""
}

# Initialize counters
total_checks=0
passed_checks=0
failed_checks=0
warnings=0

# Check 1: TypeScript Compilation
echo -e "${BLUE}📋 Running All-in-One Health Check...${NC}"
echo ""

((total_checks++))
if run_check "TypeScript Check" "npx tsc --noEmit --project tsconfig.json" "$CHECK"; then
    ((passed_checks++))
else
    ((failed_checks++))
fi

# Check 2: Dependency Validation
((total_checks++))
if run_check_with_output "Dependency Check" "npx depcheck --ignores='@types/*,prettier,eslint*'" "$CHECK"; then
    ((passed_checks++))
else
    ((warnings++))  # Dependencies are warnings, not failures
fi

# Check 3: Circular Dependencies
((total_checks++))
echo -e "${CYAN}=== Circular Dependencies ===${NC}"
circular_found=false

# Check client
if npx madge --circular apps/client/src/ 2>/dev/null | grep -q "Circular"; then
    echo -e "${WARNING} Client circular dependencies detected"
    circular_found=true
fi

# Check server  
if npx madge --circular apps/server/ 2>/dev/null | grep -q "Circular"; then
    echo -e "${WARNING} Server circular dependencies detected"
    circular_found=true
fi

# Check packages
if npx madge --circular packages/ 2>/dev/null | grep -q "Circular"; then
    echo -e "${WARNING} Packages circular dependencies detected"
    circular_found=true
fi

if [ "$circular_found" = true ]; then
    echo -e "${YELLOW}$WARNING Circular dependencies found${NC}"
    ((warnings++))
else
    echo -e "${GREEN}$CHECK No circular dependencies${NC}"
    ((passed_checks++))
fi
echo ""

# Check 4: ESLint Validation
((total_checks++))
echo -e "${CYAN}=== ESLint Check ===${NC}"
if npm run lint >/dev/null 2>&1; then
    echo -e "${GREEN}$CHECK ESLint validation passed${NC}"
    ((passed_checks++))
else
    echo -e "${YELLOW}$WARNING ESLint issues found (check with: npm run lint)${NC}"
    ((warnings++))
fi
echo ""

# Check 5: Git Status
((total_checks++))
echo -e "${CYAN}=== Git Status ===${NC}"
git_status=$(git status --porcelain)
if [ -z "$git_status" ]; then
    echo -e "${GREEN}$CHECK Working directory clean${NC}"
    ((passed_checks++))
else
    echo -e "${YELLOW}$WARNING Uncommitted changes detected:${NC}"
    echo "$git_status" | head -5
    if [ $(echo "$git_status" | wc -l) -gt 5 ]; then
        echo "... and $(($(echo "$git_status" | wc -l) - 5)) more files"
    fi
    ((warnings++))
fi
echo ""

# Check 6: Repository Sync Quick Check
((total_checks++))
echo -e "${CYAN}=== Repository Sync Check ===${NC}"
if npm run sync:check:quick >/dev/null 2>&1; then
    echo -e "${GREEN}$CHECK Repository sync validation passed${NC}"
    ((passed_checks++))
else
    echo -e "${YELLOW}$WARNING Repository sync issues detected${NC}"
    echo "Run 'npm run sync:check' for detailed analysis"
    ((warnings++))
fi
echo ""

# Performance Metrics
echo -e "${PURPLE}=== Performance Metrics ===${NC}"
echo "Repository size: $(du -sh . 2>/dev/null | cut -f1)"
echo "Node modules size: $(du -sh node_modules 2>/dev/null | cut -f1 || echo 'N/A')"
echo "TypeScript files: $(find . -name '*.ts' -o -name '*.tsx' 2>/dev/null | wc -l | tr -d ' ')"
echo "JavaScript files: $(find . -name '*.js' -o -name '*.jsx' 2>/dev/null | wc -l | tr -d ' ')"
echo ""

# Summary
echo "=================================="
echo -e "${BLUE}📊 DIAGNOSIS SUMMARY${NC}"
echo "=================================="
echo -e "Total checks: $total_checks"
echo -e "${GREEN}Passed: $passed_checks${NC}"
echo -e "${YELLOW}Warnings: $warnings${NC}"
echo -e "${RED}Failed: $failed_checks${NC}"
echo ""

# Prioritized recommendations
echo -e "${PURPLE}🎯 PRIORITIZED ACTIONS${NC}"
echo "=================================="

if [ $failed_checks -gt 0 ]; then
    echo -e "${RED}🚨 CRITICAL (Fix immediately):${NC}"
    if ! npx tsc --noEmit --project tsconfig.json >/dev/null 2>&1; then
        echo "  1. Fix TypeScript compilation errors"
        echo "     Command: npx tsc --noEmit"
    fi
    echo ""
fi

if [ $warnings -gt 0 ]; then
    echo -e "${YELLOW}⚠️ WARNINGS (Address when possible):${NC}"
    
    if [ "$circular_found" = true ]; then
        echo "  • Resolve circular dependencies"
        echo "    Command: npx madge --circular src/"
    fi
    
    if ! npm run lint >/dev/null 2>&1; then
        echo "  • Fix ESLint issues"
        echo "    Command: npm run lint:fix"
    fi
    
    if [ -n "$git_status" ]; then
        echo "  • Commit or stash uncommitted changes"
        echo "    Command: git add . && git commit -m '...' or git stash"
    fi
    
    if ! npm run sync:check:quick >/dev/null 2>&1; then
        echo "  • Run comprehensive repository sync check"
        echo "    Command: npm run sync:check"
    fi
    echo ""
fi

if [ $failed_checks -eq 0 ] && [ $warnings -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Repository is healthy.${NC}"
    echo ""
fi

# Quick fix suggestions
echo -e "${CYAN}🔧 QUICK FIX COMMANDS${NC}"
echo "=================================="
echo "Fix TypeScript issues:  npx tsc --noEmit"
echo "Fix ESLint issues:      npm run lint:fix"
echo "Fix dependencies:       npm run check:deps:fix"
echo "Fix imports:            npm run check:imports:fix"
echo "Comprehensive check:    npm run sync:check"
echo "Git status:             git status"
echo ""

# Exit with appropriate code
if [ $failed_checks -gt 0 ]; then
    echo -e "${RED}❌ Diagnosis completed with failures${NC}"
    exit 1
elif [ $warnings -gt 0 ]; then
    echo -e "${YELLOW}⚠️ Diagnosis completed with warnings${NC}"
    exit 0
else
    echo -e "${GREEN}✅ Diagnosis completed successfully${NC}"
    exit 0
fi 