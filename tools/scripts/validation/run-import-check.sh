#!/bin/bash

# 🔍 Import/Export Consistency Checker Runner
# 
# Convenient wrapper for running import/export analysis
# Usage: ./tools/scripts/validation/run-import-check.sh [options]

set -e

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
MODE="full"
TARGET="."
DETAILED=false
OUTPUT_FILE=""
FIX=false
FOCUS=""

# Show help
show_help() {
    echo -e "${BLUE}🔍 Import/Export Consistency Checker${NC}"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -m, --mode MODE       Analysis mode: full, quick, ci (default: full)"
    echo "  -t, --target PATH     Target path to analyze (default: .)"
    echo "  -d, --detailed        Show detailed analysis"
    echo "  -o, --output FILE     Save report to file"
    echo "  -f, --fix             Attempt to auto-fix issues"
    echo "  --focus TYPE          Focus on specific issue type: imports|exports|circular|paths"
    echo "  -h, --help            Show this help"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Full analysis"
    echo "  $0 -m quick                          # Quick check"
    echo "  $0 -t apps/client                    # Check only frontend"
    echo "  $0 -d -o report.json                 # Detailed report to file"
    echo "  $0 --focus circular                  # Check only circular dependencies"
    echo ""
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -m|--mode)
            MODE="$2"
            shift 2
            ;;
        -t|--target)
            TARGET="$2"
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
        --focus)
            FOCUS="$2"
            shift 2
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
if [[ ! "$MODE" =~ ^(full|quick|ci)$ ]]; then
    echo -e "${RED}Error: Invalid mode '$MODE'. Must be: full, quick, or ci${NC}"
    exit 1
fi

# Change to root directory
cd "$ROOT_DIR"

echo -e "${BLUE}🔍 Import/Export Consistency Checker${NC}"
echo -e "${BLUE}====================================${NC}"
echo ""
echo -e "Mode: ${YELLOW}$MODE${NC}"
echo -e "Target: ${YELLOW}$TARGET${NC}"
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

if [[ -n "$FOCUS" ]]; then
    ARGS="$ARGS --focus=$FOCUS"
fi

# Install dependencies if needed
check_dependencies() {
    echo -e "${YELLOW}📦 Checking dependencies...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        exit 1
    fi
    
    if ! npm list glob &> /dev/null; then
        echo -e "${YELLOW}Installing required dependencies...${NC}"
        npm install glob
    fi
    
    echo -e "${GREEN}✅ Dependencies ready${NC}"
    echo ""
}

# Run analysis based on mode
run_analysis() {
    case $MODE in
        "quick")
            echo -e "${YELLOW}🚀 Running quick check...${NC}"
            echo ""
            node "$SCRIPT_DIR/quick-import-check.js" "$TARGET"
            ;;
        "full")
            echo -e "${YELLOW}🔍 Running comprehensive analysis...${NC}"
            echo ""
            node "$SCRIPT_DIR/import-export-checker.js" $ARGS
            ;;
        "ci")
            echo -e "${YELLOW}🤖 Running CI analysis...${NC}"
            echo ""
            ARGS="$ARGS --output=import-export-report.json"
            node "$SCRIPT_DIR/import-export-checker.js" $ARGS
            
            # Show summary for CI
            if [[ -f "import-export-report.json" ]]; then
                echo ""
                echo -e "${BLUE}📊 CI Summary:${NC}"
                node -e "
                    const report = JSON.parse(require('fs').readFileSync('import-export-report.json'));
                    const issues = Object.values(report.issues).reduce((sum, arr) => sum + arr.length, 0);
                    console.log(\`   Files analyzed: \${report.stats.totalFiles}\`);
                    console.log(\`   Total issues: \${issues}\`);
                    if (issues > 0) {
                        console.log(\`   ❌ Build should fail\`);
                        process.exit(1);
                    } else {
                        console.log(\`   ✅ All checks passed\`);
                    }
                "
            fi
            ;;
    esac
}

# Performance tracking
start_time=$(date +%s)

# Main execution
main() {
    check_dependencies
    run_analysis
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo ""
    echo -e "${GREEN}🎉 Analysis completed in ${duration}s${NC}"
    
    if [[ -n "$OUTPUT_FILE" && -f "$OUTPUT_FILE" ]]; then
        echo -e "${GREEN}📄 Report saved to: $OUTPUT_FILE${NC}"
    fi
}

# Error handling
trap 'echo -e "\n${RED}❌ Analysis interrupted${NC}"; exit 1' INT TERM

# Run main function
main

echo ""
echo -e "${BLUE}Done! 🚀${NC}" 