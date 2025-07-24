#!/bin/bash

# 📦 Package Dependency Analyzer Runner
# 
# Convenient wrapper for running dependency analysis
# Usage: ./tools/scripts/validation/run-dependency-check.sh [options]

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
MODE="basic"
DETAILED=false
OUTPUT_FILE=""
FIX=false
CHECK_SECURITY=false
SUGGEST_UPDATES=false

# Show help
show_help() {
    echo -e "${BLUE}📦 Package Dependency Analyzer${NC}"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -m, --mode MODE       Analysis mode: basic, full, security, updates (default: basic)"
    echo "  -d, --detailed        Show detailed analysis"
    echo "  -o, --output FILE     Save report to file"
    echo "  -f, --fix             Attempt to auto-fix issues"
    echo "  -s, --security        Check for security vulnerabilities"
    echo "  -u, --updates         Check for package updates"
    echo "  -h, --help            Show this help"
    echo ""
    echo "Modes:"
    echo "  basic     - Check unused/missing dependencies only"
    echo "  full      - Include version mismatches and duplicates"
    echo "  security  - Add security vulnerability scanning"
    echo "  updates   - Add outdated package checking"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Basic dependency check"
    echo "  $0 -m full -d                        # Full analysis with details"
    echo "  $0 -m security -o security-report.json  # Security scan with report"
    echo "  $0 --fix                              # Auto-fix unused/missing packages"
    echo ""
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -m|--mode)
            MODE="$2"
            shift 2
            ;;
        -d|--detailed)
            DETAILED=true
            shift
            ;;
        -o|--output)
            OUTPUT_FILE="$2"
            shift 2
            ;;
        -f|--fix)
            FIX=true
            shift
            ;;
        -s|--security)
            CHECK_SECURITY=true
            shift
            ;;
        -u|--updates)
            SUGGEST_UPDATES=true
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
if [[ ! "$MODE" =~ ^(basic|full|security|updates)$ ]]; then
    echo -e "${RED}Error: Invalid mode '$MODE'. Must be: basic, full, security, or updates${NC}"
    exit 1
fi

# Set mode-specific options
case $MODE in
    "full")
        DETAILED=true
        ;;
    "security")
        CHECK_SECURITY=true
        DETAILED=true
        ;;
    "updates")
        SUGGEST_UPDATES=true
        DETAILED=true
        ;;
esac

# Change to root directory
cd "$ROOT_DIR"

echo -e "${BLUE}📦 Package Dependency Analyzer${NC}"
echo -e "${BLUE}==============================${NC}"
echo ""
echo -e "Mode: ${YELLOW}$MODE${NC}"
echo -e "Root: ${YELLOW}$ROOT_DIR${NC}"
echo ""

# Prepare command arguments
ARGS=""

if [[ "$DETAILED" == "true" ]]; then
    ARGS="$ARGS --detailed"
fi

if [[ -n "$OUTPUT_FILE" ]]; then
    ARGS="$ARGS --output=$OUTPUT_FILE"
fi

if [[ "$FIX" == "true" ]]; then
    ARGS="$ARGS --fix"
fi

if [[ "$CHECK_SECURITY" == "true" ]]; then
    ARGS="$ARGS --check-security"
fi

if [[ "$SUGGEST_UPDATES" == "true" ]]; then
    ARGS="$ARGS --suggest-updates"
fi

# Check dependencies
check_dependencies() {
    echo -e "${YELLOW}📦 Checking dependencies...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm is not installed${NC}"
        exit 1
    fi
    
    if ! npm list glob &> /dev/null; then
        echo -e "${YELLOW}Installing required dependencies...${NC}"
        npm install glob
    fi
    
    echo -e "${GREEN}✅ Dependencies ready${NC}"
    echo ""
}

# Performance tracking
start_time=$(date +%s)

# Main execution
main() {
    check_dependencies
    
    echo -e "${YELLOW}🔍 Running dependency analysis...${NC}"
    echo ""
    
    # Run the analyzer
    node "$SCRIPT_DIR/package-dependency-analyzer.js" $ARGS
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo ""
    echo -e "${GREEN}🎉 Analysis completed in ${duration}s${NC}"
    
    if [[ -n "$OUTPUT_FILE" && -f "$OUTPUT_FILE" ]]; then
        echo -e "${GREEN}📄 Report saved to: $OUTPUT_FILE${NC}"
    fi
    
    # Show quick fix suggestions
    if [[ "$FIX" != "true" ]]; then
        echo ""
        echo -e "${BLUE}💡 Quick Fix Commands:${NC}"
        echo -e "   Remove unused packages: ${YELLOW}$0 --fix${NC}"
        echo -e "   Security audit: ${YELLOW}$0 -m security${NC}"
        echo -e "   Check for updates: ${YELLOW}$0 -m updates${NC}"
    fi
}

# Error handling
trap 'echo -e "\n${RED}❌ Analysis interrupted${NC}"; exit 1' INT TERM

# Run main function
main

echo ""
echo -e "${BLUE}Done! 🚀${NC}" 