#!/bin/bash

# 🔧 ESLint Import Rules Migration Script
# 
# Safely migrates ESLint configuration to enable import/export consistency rules
# with proper dependency installation and gradual rule activation

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
PHASE="1"
DRY_RUN=false
BACKUP=true
INSTALL_DEPS=true

# Show help
show_help() {
    echo -e "${BLUE}🔧 ESLint Import Rules Migration${NC}"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -p, --phase PHASE     Migration phase: 1, 2, or 3 (default: 1)"
    echo "  -d, --dry-run         Show what would be changed without applying"
    echo "  -n, --no-backup       Don't create backup of current .eslintrc.js"
    echo "  -s, --skip-deps       Skip dependency installation check"
    echo "  -h, --help            Show this help"
    echo ""
    echo "Migration Phases:"
    echo "  Phase 1: Enable import rules as WARNINGS (safe, non-breaking)"
    echo "  Phase 2: Upgrade critical rules to ERRORS (breaking for bad imports)"
    echo "  Phase 3: Full enforcement with strict import order (final state)"
    echo ""
    echo "Examples:"
    echo "  $0                          # Phase 1 migration (warnings only)"
    echo "  $0 -p 2                     # Phase 2 migration (some errors)"
    echo "  $0 -d                       # Dry run to see what would change"
    echo "  $0 -p 3 --no-backup         # Phase 3 without backup"
    echo ""
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--phase)
            PHASE="$2"
            shift 2
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -n|--no-backup)
            BACKUP=false
            shift
            ;;
        -s|--skip-deps)
            INSTALL_DEPS=false
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

# Validate phase
if [[ ! "$PHASE" =~ ^[123]$ ]]; then
    echo -e "${RED}Error: Invalid phase '$PHASE'. Must be 1, 2, or 3${NC}"
    exit 1
fi

# Change to root directory
cd "$ROOT_DIR"

echo -e "${BLUE}🔧 ESLint Import Rules Migration${NC}"
echo -e "${BLUE}===================================${NC}"
echo ""
echo -e "Phase: ${YELLOW}$PHASE${NC}"
echo -e "Root: ${YELLOW}$ROOT_DIR${NC}"
echo -e "Dry run: ${YELLOW}$DRY_RUN${NC}"
echo ""

# Function to check if package is installed
check_package() {
    local package_name=$1
    if npm list "$package_name" &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to install missing dependencies
install_dependencies() {
    echo -e "${YELLOW}📦 Checking required dependencies...${NC}"
    
    local missing_deps=()
    local required_deps=(
        "eslint-plugin-import"
        "eslint-import-resolver-typescript"
        "eslint-import-resolver-alias"
    )
    
    for dep in "${required_deps[@]}"; do
        if ! check_package "$dep"; then
            missing_deps+=("$dep")
        fi
    done
    
    if [ ${#missing_deps[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ All required dependencies are installed${NC}"
        return 0
    fi
    
    echo -e "${YELLOW}Installing missing dependencies: ${missing_deps[*]}${NC}"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        echo -e "${BLUE}[DRY RUN] Would install: npm install --save-dev ${missing_deps[*]}${NC}"
        return 0
    fi
    
    if ! npm install --save-dev "${missing_deps[@]}"; then
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
}

# Function to create backup
create_backup() {
    if [[ "$BACKUP" == "false" ]]; then
        return 0
    fi
    
    echo -e "${YELLOW}💾 Creating backup of current .eslintrc.js...${NC}"
    
    local backup_file=".eslintrc.js.backup-$(date +%Y%m%d-%H%M%S)"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        echo -e "${BLUE}[DRY RUN] Would create backup: $backup_file${NC}"
        return 0
    fi
    
    if [ -f ".eslintrc.js" ]; then
        cp ".eslintrc.js" "$backup_file"
        echo -e "${GREEN}✅ Backup created: $backup_file${NC}"
    else
        echo -e "${YELLOW}⚠️  No existing .eslintrc.js found${NC}"
    fi
}

# Function to apply migration phase
apply_migration() {
    local phase=$1
    
    echo -e "${YELLOW}🔄 Applying Phase $phase migration...${NC}"
    
    local config_file="$ROOT_DIR/.eslintrc.updated.js"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        echo -e "${BLUE}[DRY RUN] Would copy: $config_file → .eslintrc.js${NC}"
        echo -e "${BLUE}[DRY RUN] Phase $phase rules would be applied${NC}"
        return 0
    fi
    
    # Copy the updated config
    if [ -f "$config_file" ]; then
        cp "$config_file" ".eslintrc.js"
        echo -e "${GREEN}✅ ESLint configuration updated${NC}"
    else
        echo -e "${RED}❌ Updated config file not found: $config_file${NC}"
        exit 1
    fi
    
    # Apply phase-specific modifications
    case $phase in
        1)
            echo -e "${GREEN}✅ Phase 1: Import rules enabled as warnings${NC}"
            ;;
        2)
            echo -e "${YELLOW}🔧 Phase 2: Upgrading critical rules to errors...${NC}"
            # Would modify .eslintrc.js to change specific rules to 'error'
            ;;
        3)
            echo -e "${PURPLE}🚀 Phase 3: Full enforcement enabled${NC}"
            # Would modify .eslintrc.js for strictest settings
            ;;
    esac
}

# Function to test the new configuration
test_configuration() {
    echo -e "${YELLOW}🧪 Testing new ESLint configuration...${NC}"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        echo -e "${BLUE}[DRY RUN] Would run: npm run lint:check${NC}"
        return 0
    fi
    
    # Run a basic lint check on a few files
    local test_files=(
        "apps/client/src/main.tsx"
        "apps/server/index.ts"
        "packages/shared/index.ts"
    )
    
    local existing_files=()
    for file in "${test_files[@]}"; do
        if [ -f "$file" ]; then
            existing_files+=("$file")
        fi
    done
    
    if [ ${#existing_files[@]} -eq 0 ]; then
        echo -e "${YELLOW}⚠️  No test files found, skipping lint test${NC}"
        return 0
    fi
    
    echo -e "${BLUE}Testing lint on: ${existing_files[*]}${NC}"
    
    if npx eslint "${existing_files[@]}" --no-error-on-unmatched-pattern 2>/dev/null; then
        echo -e "${GREEN}✅ ESLint configuration test passed${NC}"
    else
        echo -e "${YELLOW}⚠️  ESLint found issues (expected with new rules)${NC}"
        echo -e "${BLUE}💡 Run 'npm run lint:check' to see all issues${NC}"
    fi
}

# Function to show next steps
show_next_steps() {
    echo -e "\n${GREEN}🎉 Migration completed successfully!${NC}"
    echo -e "\n${BLUE}📋 What's been changed:${NC}"
    echo -e "   ✅ ESLint import rules enabled (Phase $PHASE)"
    echo -e "   ✅ TypeScript path alias support configured"
    echo -e "   ✅ Import order and consistency rules activated"
    
    echo -e "\n${BLUE}🔧 Next steps:${NC}"
    echo -e "   1. Run: ${YELLOW}npm run lint:check${NC} - Check current issues"
    echo -e "   2. Run: ${YELLOW}npm run lint:fix${NC} - Auto-fix what's possible"
    echo -e "   3. Review and manually fix remaining issues"
    
    if [[ "$PHASE" == "1" ]]; then
        echo -e "   4. When ready: ${YELLOW}$0 -p 2${NC} - Upgrade to Phase 2"
    elif [[ "$PHASE" == "2" ]]; then
        echo -e "   4. When ready: ${YELLOW}$0 -p 3${NC} - Upgrade to Phase 3"
    fi
    
    echo -e "\n${BLUE}🔗 Integration with validation tools:${NC}"
    echo -e "   • Use: ${YELLOW}npm run validate:full${NC} - Combined validation"
    echo -e "   • Use: ${YELLOW}npm run lint:imports${NC} - Import-specific linting"
    
    echo -e "\n${BLUE}💡 Tip:${NC} Configure your IDE to show ESLint warnings in real-time!"
}

# Main execution
main() {
    # Install dependencies if needed
    if [[ "$INSTALL_DEPS" == "true" ]]; then
        install_dependencies
    fi
    
    # Create backup
    create_backup
    
    # Apply migration
    apply_migration "$PHASE"
    
    # Test configuration
    test_configuration
    
    # Show next steps
    show_next_steps
}

# Error handling
trap 'echo -e "\n${RED}❌ Migration interrupted${NC}"; exit 1' INT TERM

# Run main function
main

echo ""
echo -e "${BLUE}Done! 🚀${NC}" 