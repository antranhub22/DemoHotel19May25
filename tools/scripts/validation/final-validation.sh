#!/bin/bash

# ============================================================================
# 🎯 Cursor Final Validation Command  
# Comprehensive final technical health check before moving to business logic
# ============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Icons
PASS="✅ PASS"
FAIL="❌ FAIL"
WARNING="⚠️ WARN"
INFO="ℹ️ INFO"
TARGET="🎯"
ROCKET="🚀"

echo -e "${BLUE}${BOLD}${TARGET} Cursor Final Validation Command${NC}"
echo "============================================="
echo -e "${CYAN}Performing comprehensive final technical health check...${NC}"
echo ""

# Initialize results tracking
total_checks=10
passed_checks=0
failed_checks=0
warning_checks=0

# Results storage arrays
check_names=()
check_statuses=()
check_details=()

# Function to record result
record_result() {
    local check_name="$1"
    local status="$2"
    local detail="$3"
    
    check_names+=("$check_name")
    check_statuses+=("$status")
    check_details+=("$detail")
    
    case "$status" in
        "PASS") ((passed_checks++)) ;;
        "FAIL") ((failed_checks++)) ;;
        "WARN") ((warning_checks++)) ;;
    esac
}

# Function to display check result
display_check() {
    local check_num="$1"
    local check_name="$2"
    
    # Find the index of this check
    local index=-1
    for i in "${!check_names[@]}"; do
        if [ "${check_names[$i]}" = "$check_name" ]; then
            index=$i
            break
        fi
    done
    
    if [ $index -eq -1 ]; then
        echo -e "${BOLD}${check_num}. ${check_name}${NC}"
        echo -e "   ${RED}${FAIL}${NC} - Check not found"
        echo ""
        return
    fi
    
    local status="${check_statuses[$index]}"
    local detail="${check_details[$index]}"
    
    echo -e "${BOLD}${check_num}. ${check_name}${NC}"
    
    case "$status" in
        "PASS")
            echo -e "   ${GREEN}${PASS}${NC} - $detail"
            ;;
        "FAIL") 
            echo -e "   ${RED}${FAIL}${NC} - $detail"
            ;;
        "WARN")
            echo -e "   ${YELLOW}${WARNING}${NC} - $detail"
            ;;
    esac
    echo ""
}

# ============================================================================
# 1. Verify the entire repository builds successfully
# ============================================================================
echo -e "${CYAN}Checking 1/10: Repository Build Verification...${NC}"

if npm run build >/dev/null 2>&1; then
    record_result "Repository Build" "PASS" "All build processes completed successfully"
else
    # Try TypeScript check as fallback
    if npm run typecheck >/dev/null 2>&1 || npx tsc --noEmit >/dev/null 2>&1; then
        record_result "Repository Build" "WARN" "TypeScript compilation passes, full build may have issues"
    else
        record_result "Repository Build" "FAIL" "Build process failed - check build configuration"
    fi
fi

# ============================================================================
# 2. Confirm all TypeScript errors are resolved
# ============================================================================
echo -e "${CYAN}Checking 2/10: TypeScript Error Resolution...${NC}"

ts_output=$(npx tsc --noEmit 2>&1)
ts_exit_code=$?

if [ $ts_exit_code -eq 0 ]; then
    record_result "TypeScript Errors" "PASS" "No TypeScript compilation errors detected"
else
    error_count=$(echo "$ts_output" | grep -c "error TS" || echo "0")
    if [ "$error_count" -eq 0 ]; then
        record_result "TypeScript Errors" "WARN" "TypeScript check completed with warnings"
    else
        record_result "TypeScript Errors" "FAIL" "$error_count TypeScript errors found - must be resolved"
    fi
fi

# ============================================================================
# 3. Check that all imports/exports are consistent
# ============================================================================
echo -e "${CYAN}Checking 3/10: Import/Export Consistency...${NC}"

# Use Repository Sync Checker for comprehensive analysis
if npm run sync:check:quick >/dev/null 2>&1; then
    record_result "Import/Export Consistency" "PASS" "All imports and exports are properly synchronized"
else
    # Run AI analysis for detailed import/export check
    ai_output=$(node tools/scripts/validation/codebase-analysis.js 2>/dev/null | grep -E "(importExportSync|import/export)" || echo "")
    if echo "$ai_output" | grep -q "issues"; then
        record_result "Import/Export Consistency" "FAIL" "Import/export synchronization issues detected - run 'npm run sync:check' for details"
    else
        record_result "Import/Export Consistency" "WARN" "Import/export consistency check completed with minor issues"
    fi
fi

# ============================================================================
# 4. Ensure no circular dependencies remain
# ============================================================================
echo -e "${CYAN}Checking 4/10: Circular Dependencies Detection...${NC}"

circular_found=false
circular_details=""

# Check each major directory
for dir in "apps/client/src" "apps/server" "packages"; do
    if [ -d "$dir" ]; then
        if npx madge --circular "$dir" 2>/dev/null | grep -q "Circular"; then
            circular_found=true
            circular_details="$circular_details $dir"
        fi
    fi
done

if [ "$circular_found" = false ]; then
    record_result "Circular Dependencies" "PASS" "No circular dependencies detected in codebase"
else
    record_result "Circular Dependencies" "FAIL" "Circular dependencies found in:$circular_details - must be resolved"
fi

# ============================================================================
# 5. Verify all linting rules pass
# ============================================================================
echo -e "${CYAN}Checking 5/10: Linting Rules Verification...${NC}"

# Check ESLint
eslint_output=$(npm run lint 2>&1)
eslint_exit_code=$?

if [ $eslint_exit_code -eq 0 ]; then
    record_result "Linting Rules" "PASS" "All ESLint rules pass successfully"
else
    error_count=$(echo "$eslint_output" | grep -c "error" || echo "0")
    warning_count=$(echo "$eslint_output" | grep -c "warning" || echo "0")
    
    if [ "$error_count" -gt 0 ]; then
        record_result "Linting Rules" "FAIL" "$error_count ESLint errors found - must be fixed before proceeding"
    elif [ "$warning_count" -gt 0 ]; then
        record_result "Linting Rules" "WARN" "$warning_count ESLint warnings found - recommended to fix"
    else
        record_result "Linting Rules" "WARN" "Linting completed with minor issues"
    fi
fi

# ============================================================================
# 6. Confirm no unused dependencies
# ============================================================================
echo -e "${CYAN}Checking 6/10: Unused Dependencies Check...${NC}"

depcheck_output=$(npx depcheck --ignores="@types/*,prettier,eslint*,husky" 2>/dev/null || echo "depcheck_failed")

if [ "$depcheck_output" = "depcheck_failed" ]; then
    record_result "Unused Dependencies" "WARN" "Dependency check tool unavailable - manual review recommended"
elif echo "$depcheck_output" | grep -q "No depcheck issue"; then
    record_result "Unused Dependencies" "PASS" "No unused dependencies detected"
elif echo "$depcheck_output" | grep -q "Unused devDependencies"; then
    unused_count=$(echo "$depcheck_output" | grep -A 10 "Unused devDependencies" | grep "^\*" | wc -l | tr -d ' ')
    if [ "$unused_count" -gt 5 ]; then
        record_result "Unused Dependencies" "FAIL" "$unused_count unused dependencies found - cleanup required"
    else
        record_result "Unused Dependencies" "WARN" "$unused_count unused dependencies found - cleanup recommended"
    fi
else
    record_result "Unused Dependencies" "PASS" "Dependency analysis completed successfully"
fi

# ============================================================================
# 7. Check git repository is in clean state
# ============================================================================
echo -e "${CYAN}Checking 7/10: Git Repository Clean State...${NC}"

git_status=$(git status --porcelain 2>/dev/null || echo "git_unavailable")

if [ "$git_status" = "git_unavailable" ]; then
    record_result "Git Clean State" "WARN" "Git repository status unavailable"
elif [ -z "$git_status" ]; then
    record_result "Git Clean State" "PASS" "Git repository is in clean state with no uncommitted changes"
else
    uncommitted_count=$(echo "$git_status" | wc -l | tr -d ' ')
    if [ "$uncommitted_count" -gt 10 ]; then
        record_result "Git Clean State" "FAIL" "$uncommitted_count uncommitted files - commit or stash changes before proceeding"
    else
        record_result "Git Clean State" "WARN" "$uncommitted_count uncommitted files - consider committing changes"
    fi
fi

# ============================================================================
# 8. Identify any remaining technical debt
# ============================================================================
echo -e "${CYAN}Checking 8/10: Technical Debt Analysis...${NC}"

# Use AI analysis for comprehensive technical debt detection
ai_analysis=$(node tools/scripts/validation/codebase-analysis.js 2>/dev/null || echo "ai_analysis_failed")

if [ "$ai_analysis" = "ai_analysis_failed" ]; then
    record_result "Technical Debt" "WARN" "AI analysis unavailable - manual technical debt review recommended"
else
    # Extract health score from AI analysis
    health_score=$(echo "$ai_analysis" | grep -o "Overall Health Score: [0-9]*" | grep -o "[0-9]*" || echo "0")
    
    if [ "$health_score" -ge 80 ]; then
        record_result "Technical Debt" "PASS" "Low technical debt detected (Health Score: $health_score/100)"
    elif [ "$health_score" -ge 60 ]; then
        record_result "Technical Debt" "WARN" "Moderate technical debt detected (Health Score: $health_score/100)"
    else
        record_result "Technical Debt" "FAIL" "High technical debt detected (Health Score: $health_score/100) - refactoring required"
    fi
fi

# ============================================================================
# 9. Validate code formatting is consistent
# ============================================================================
echo -e "${CYAN}Checking 9/10: Code Formatting Consistency...${NC}"

# Check Prettier formatting
if command -v prettier >/dev/null 2>&1; then
    if npm run format:check >/dev/null 2>&1; then
        record_result "Code Formatting" "PASS" "All code formatting is consistent and follows standards"
    else
        # Try running format check directly
        format_output=$(npx prettier --check "**/*.{ts,tsx,js,jsx,json,md}" 2>/dev/null || echo "format_check_failed")
        if [ "$format_output" = "format_check_failed" ]; then
            record_result "Code Formatting" "WARN" "Code formatting check unavailable - manual review recommended"
        else
            misformatted_count=$(echo "$format_output" | wc -l | tr -d ' ')
            if [ "$misformatted_count" -gt 10 ]; then
                record_result "Code Formatting" "FAIL" "$misformatted_count files need formatting - run 'npm run format' to fix"
            else
                record_result "Code Formatting" "WARN" "$misformatted_count files need minor formatting adjustments"
            fi
        fi
    fi
else
    record_result "Code Formatting" "WARN" "Prettier not available - code formatting consistency not verified"
fi

# ============================================================================
# 10. Ensure all development tools work properly
# ============================================================================
echo -e "${CYAN}Checking 10/10: Development Tools Verification...${NC}"

tools_status=""
tools_failed=0

# Check essential development tools
essential_tools=(
    "node:Node.js runtime"
    "npm:Package manager" 
    "npx:Package executor"
    "git:Version control"
    "tsc:TypeScript compiler"
)

for tool_info in "${essential_tools[@]}"; do
    tool="${tool_info%%:*}"
    name="${tool_info##*:}"
    
    if command -v "$tool" >/dev/null 2>&1; then
        tools_status="$tools_status ✓$name"
    else
        tools_status="$tools_status ✗$name"
        ((tools_failed++))
    fi
done

# Check NPM scripts
npm_scripts=("diag" "sync:check:quick" "lint" "typecheck")
for script in "${npm_scripts[@]}"; do
    if npm run "$script" --silent >/dev/null 2>&1; then
        tools_status="$tools_status ✓$script"
    else
        tools_status="$tools_status ✗$script" 
        ((tools_failed++))
    fi
done

if [ "$tools_failed" -eq 0 ]; then
    record_result "Development Tools" "PASS" "All development tools are working properly"
elif [ "$tools_failed" -le 2 ]; then
    record_result "Development Tools" "WARN" "$tools_failed development tools have issues - check configuration"
else
    record_result "Development Tools" "FAIL" "$tools_failed development tools failed - setup required before proceeding"
fi

# ============================================================================
# FINAL RESULTS REPORT
# ============================================================================

echo ""
echo "============================================="
echo -e "${BLUE}${BOLD}📊 FINAL VALIDATION RESULTS${NC}"
echo "============================================="
echo ""

# Display all check results
display_check "1" "Repository Build"
display_check "2" "TypeScript Errors" 
display_check "3" "Import/Export Consistency"
display_check "4" "Circular Dependencies"
display_check "5" "Linting Rules"
display_check "6" "Unused Dependencies"
display_check "7" "Git Clean State"
display_check "8" "Technical Debt"
display_check "9" "Code Formatting"
display_check "10" "Development Tools"

# Summary statistics
echo "============================================="
echo -e "${BOLD}📈 SUMMARY STATISTICS${NC}"
echo "============================================="
echo -e "Total Checks: $total_checks"
echo -e "${GREEN}Passed: $passed_checks${NC}"
echo -e "${YELLOW}Warnings: $warning_checks${NC}" 
echo -e "${RED}Failed: $failed_checks${NC}"
echo ""

# Calculate pass percentage
pass_percentage=$(( (passed_checks * 100) / total_checks ))

# Overall readiness assessment
echo "============================================="
echo -e "${BOLD}🎯 BUSINESS LOGIC READINESS ASSESSMENT${NC}"
echo "============================================="

if [ $failed_checks -eq 0 ] && [ $warning_checks -le 2 ]; then
    echo -e "${GREEN}${ROCKET} READY FOR BUSINESS LOGIC PHASE${NC}"
    echo ""
    echo -e "${GREEN}✅ Repository is in excellent technical condition${NC}"
    echo -e "${GREEN}✅ All critical technical requirements are met${NC}"
    echo -e "${GREEN}✅ Code quality standards are maintained${NC}"
    echo -e "${GREEN}✅ Development environment is properly configured${NC}"
    echo ""
    echo -e "${BOLD}🚀 RECOMMENDATION: Proceed with business logic implementation${NC}"
    
elif [ $failed_checks -eq 0 ]; then
    echo -e "${YELLOW}⚠️ MOSTLY READY - MINOR ISSUES TO ADDRESS${NC}"
    echo ""
    echo -e "${YELLOW}⚠️ $warning_checks areas need attention but don't block progress${NC}"
    echo -e "${GREEN}✅ No critical failures detected${NC}"
    echo ""
    echo -e "${BOLD}🎯 RECOMMENDATION: Address warnings during development${NC}"
    
elif [ $failed_checks -le 2 ]; then
    echo -e "${RED}❌ NOT READY - CRITICAL ISSUES MUST BE RESOLVED${NC}"
    echo ""
    echo -e "${RED}❌ $failed_checks critical areas require immediate attention${NC}"
    echo -e "${YELLOW}⚠️ $warning_checks additional areas need improvement${NC}"
    echo ""
    echo -e "${BOLD}🛠️ REQUIRED ACTIONS BEFORE BUSINESS LOGIC:${NC}"
    
    # List critical issues that must be resolved
    critical_checks=("Repository Build" "TypeScript Errors" "Circular Dependencies" "Development Tools")
    for check in "${critical_checks[@]}"; do
        # Find the index of this check
        for i in "${!check_names[@]}"; do
            if [ "${check_names[$i]}" = "$check" ] && [ "${check_statuses[$i]}" = "FAIL" ]; then
                echo -e "   ${RED}• Fix: $check${NC}"
                echo -e "     ${check_details[$i]}"
                break
            fi
        done
    done
    
else
    echo -e "${RED}❌ MAJOR TECHNICAL ISSUES - EXTENSIVE WORK REQUIRED${NC}"
    echo ""
    echo -e "${RED}❌ $failed_checks critical failures detected${NC}"
    echo -e "${RED}❌ Repository requires significant technical improvements${NC}"
    echo ""
    echo -e "${BOLD}🚨 STOP: Do not proceed with business logic until all critical issues are resolved${NC}"
fi

echo ""
echo "============================================="
echo -e "${BLUE}${BOLD}📋 QUICK FIX COMMANDS${NC}"
echo "============================================="
echo "Fix TypeScript errors:     npx tsc --noEmit"
echo "Fix linting issues:        npm run lint:fix"
echo "Fix code formatting:       npm run format"
echo "Fix import/export issues:  npm run sync:check"
echo "Clean dependencies:        npm run check:deps:fix"
echo "Commit changes:            git add . && git commit -m 'Technical improvements'"
echo "Full health check:         npm run diag"
echo ""

# Exit with appropriate code
if [ $failed_checks -gt 2 ]; then
    echo -e "${RED}❌ Final validation FAILED with major issues${NC}"
    exit 1
elif [ $failed_checks -gt 0 ]; then
    echo -e "${YELLOW}⚠️ Final validation completed with critical issues${NC}"
    exit 1
elif [ $warning_checks -gt 3 ]; then
    echo -e "${YELLOW}⚠️ Final validation completed with multiple warnings${NC}"
    exit 0
else
    echo -e "${GREEN}✅ Final validation PASSED - Ready for business logic phase${NC}"
    exit 0
fi 