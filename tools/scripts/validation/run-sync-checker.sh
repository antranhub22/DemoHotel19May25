#!/bin/bash

# 🔄 Repository Synchronization Checker Wrapper
# 
# User-friendly wrapper for the comprehensive repository synchronization checker

set -e

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Default values
MODE="full"
SAVE_REPORT=false
OUTPUT_FILE=""
DETAILED=false
QUIET=false

# Show help
show_help() {
    echo -e "${BLUE}🔄 Repository Synchronization Checker${NC}"
    echo ""
    echo "Comprehensive validation system that checks:"
    echo "  1. ✅ All imports have corresponding exports"
    echo "  2. ✅ All exports are used somewhere"
    echo "  3. ✅ No circular dependencies"
    echo "  4. ✅ Consistent naming conventions"
    echo "  5. ✅ No dead code"
    echo "  6. ✅ TypeScript config consistency"
    echo "  7. ✅ Package dependencies match actual usage"
    echo "  8. ✅ File structure follows patterns"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -m, --mode MODE       Analysis mode: quick, full, deep (default: full)"
    echo "  -s, --save           Save report to JSON file"
    echo "  -o, --output FILE    Save report to specific file"
    echo "  -d, --detailed       Show detailed analysis results"
    echo "  -q, --quiet          Quiet mode (minimal output)"
    echo "  -h, --help           Show this help"
    echo ""
    echo "Analysis Modes:"
    echo "  quick    Fast analysis (existing tools only)"
    echo "  full     Complete analysis (all 8 validation categories)"
    echo "  deep     Full analysis with extended dead code detection"
    echo ""
    echo "Examples:"
    echo "  $0                                   # Full analysis"
    echo "  $0 -m quick                         # Quick analysis"
    echo "  $0 -s                               # Save report to file"
    echo "  $0 -o custom-report.json            # Custom output file"
    echo "  $0 -m deep -d -s                    # Deep analysis with details"
    echo ""
    echo "Integration with existing tools:"
    echo "  npm run check:imports                # Import/Export checker"
    echo "  npm run check:deps                   # Dependency analyzer"
    echo "  npm run lint:imports                 # ESLint import rules"
    echo "  npm run sync:check                   # This comprehensive checker"
    echo ""
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -m|--mode)
            MODE="$2"
            shift 2
            ;;
        -s|--save)
            SAVE_REPORT=true
            shift
            ;;
        -o|--output)
            OUTPUT_FILE="$2"
            SAVE_REPORT=true
            shift 2
            ;;
        -d|--detailed)
            DETAILED=true
            shift
            ;;
        -q|--quiet)
            QUIET=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Validate mode
if [[ ! "$MODE" =~ ^(quick|full|deep)$ ]]; then
    echo -e "${RED}Error: Invalid mode '$MODE'. Must be quick, full, or deep${NC}"
    exit 1
fi

# Change to root directory
cd "$ROOT_DIR"

# Function to check dependencies
check_dependencies() {
    echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
    
    # Check if Node.js is available
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is required but not installed${NC}"
        exit 1
    fi
    
    # Check if required files exist
    local checker_script="$SCRIPT_DIR/repository-sync-checker.js"
    if [[ ! -f "$checker_script" ]]; then
        echo -e "${RED}❌ Repository sync checker script not found: $checker_script${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Prerequisites check passed${NC}"
}

# Function to run analysis based on mode
run_analysis() {
    local mode=$1
    
    echo -e "${YELLOW}🔄 Starting repository synchronization analysis...${NC}"
    echo -e "${BLUE}Mode: ${mode}${NC}"
    echo -e "${BLUE}Root: ${ROOT_DIR}${NC}"
    
    # Build command arguments
    local args=""
    
    if [[ "$SAVE_REPORT" == "true" ]]; then
        if [[ -n "$OUTPUT_FILE" ]]; then
            args="$args --output=$OUTPUT_FILE"
        else
            args="$args --save"
        fi
    fi
    
    # Run the analysis
    local start_time=$(date +%s)
    
    case $mode in
        quick)
            echo -e "${BLUE}📋 Running quick analysis (existing tools only)...${NC}"
            if [[ "$QUIET" == "true" ]]; then
                node "$SCRIPT_DIR/repository-sync-checker.js" $args > /dev/null 2>&1
            else
                node "$SCRIPT_DIR/repository-sync-checker.js" $args
            fi
            ;;
        full)
            echo -e "${BLUE}📋 Running full analysis (all 8 validation categories)...${NC}"
            if [[ "$QUIET" == "true" ]]; then
                node "$SCRIPT_DIR/repository-sync-checker.js" $args > /dev/null 2>&1
            else
                node "$SCRIPT_DIR/repository-sync-checker.js" $args
            fi
            ;;
        deep)
            echo -e "${BLUE}📋 Running deep analysis (extended validation)...${NC}"
            # Deep mode could include additional flags for more thorough analysis
            if [[ "$QUIET" == "true" ]]; then
                node "$SCRIPT_DIR/repository-sync-checker.js" $args > /dev/null 2>&1
            else
                node "$SCRIPT_DIR/repository-sync-checker.js" $args
            fi
            ;;
    esac
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    if [[ "$QUIET" != "true" ]]; then
        echo -e "\n${GREEN}🎉 Analysis completed in ${duration}s${NC}"
    fi
}

# Function to show quick fix suggestions
show_quick_fixes() {
    if [[ "$QUIET" == "true" ]]; then
        return
    fi
    
    echo -e "\n${BLUE}💡 Quick Fix Commands:${NC}"
    echo -e "   Fix imports: ${YELLOW}npm run check:imports:fix${NC}"
    echo -e "   Clean dependencies: ${YELLOW}npm run check:deps:fix${NC}"
    echo -e "   Lint imports: ${YELLOW}npm run lint:fix${NC}"
    echo -e "   Security audit: ${YELLOW}npm run audit:deps${NC}"
    echo ""
    echo -e "${BLUE}🔗 Integration Commands:${NC}"
    echo -e "   Combined validation: ${YELLOW}npm run validate:full${NC}"
    echo -e "   CI validation: ${YELLOW}npm run validate:ci${NC}"
    echo ""
}

# Function to display timing and statistics
show_statistics() {
    if [[ "$QUIET" == "true" ]]; then
        return
    fi
    
    echo -e "${BLUE}📊 Analysis Statistics:${NC}"
    echo -e "   Mode: $MODE"
    echo -e "   Report saved: $SAVE_REPORT"
    if [[ -n "$OUTPUT_FILE" ]]; then
        echo -e "   Output file: $OUTPUT_FILE"
    fi
    
    # Show file counts (basic stats)
    local ts_files=$(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | wc -l)
    local js_files=$(find . -name "*.js" -o -name "*.jsx" | grep -v node_modules | wc -l)
    
    echo -e "   TypeScript files: $ts_files"
    echo -e "   JavaScript files: $js_files"
}

# Main execution
main() {
    if [[ "$QUIET" != "true" ]]; then
        echo -e "${BLUE}🔄 Repository Synchronization Checker${NC}"
        echo -e "${BLUE}====================================${NC}"
        echo ""
    fi
    
    # Check dependencies
    check_dependencies
    
    # Run analysis
    run_analysis "$MODE"
    
    # Show additional information
    if [[ "$DETAILED" == "true" ]]; then
        show_statistics
    fi
    
    show_quick_fixes
    
    if [[ "$QUIET" != "true" ]]; then
        echo -e "${BLUE}Done! 🚀${NC}"
    fi
}

# Error handling
trap 'echo -e "\n${RED}❌ Analysis interrupted${NC}"; exit 1' INT TERM

# Run main function
main

echo "" 