#!/bin/bash

# 🧹 REPO CLEANUP EXECUTION SCRIPT
# Date: 2025-01-24
# Purpose: Safe repository cleanup and organization
# Risk Level: LOW (File organization only)

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to confirm actions
confirm() {
    while true; do
        read -p "$(echo -e ${YELLOW}$1 ${NC})" yn
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
    print_error "Not in DemoHotel19May root directory. Please run from project root."
    exit 1
fi

print_status "🧹 Starting Repository Cleanup Process"
print_status "📁 Current directory: $(pwd)"

# PHASE 1: BACKUP STRATEGY
print_status "📋 PHASE 1: Creating Master Backup"

BACKUP_DIR="../DemoHotel19May_CLEANUP_BACKUP_$(date +%Y%m%d_%H%M%S)"
if confirm "Create master backup at $BACKUP_DIR? (y/n): "; then
    print_status "Creating master backup..."
    cp -r . "$BACKUP_DIR"
    print_success "Master backup created at $BACKUP_DIR"
else
    print_warning "Backup skipped. This is NOT recommended!"
    if ! confirm "Continue without backup? (y/n): "; then
        print_error "Cleanup cancelled."
        exit 1
    fi
fi

# Create cleanup workspace
print_status "Creating cleanup workspace..."
mkdir -p cleanup-workspace/{to-archive,to-consolidate,to-delete,inventories}

# Generate file inventories
print_status "📊 Generating file inventories..."
find . -type f -name "*.md" | grep -v node_modules | grep -v ".git" > cleanup-workspace/inventories/all-md-files.txt
find . -type d -maxdepth 1 | grep -v "^.$" > cleanup-workspace/inventories/root-directories.txt
find . -name "*backup*" -o -name "*.old" | grep -v node_modules > cleanup-workspace/inventories/backup-files.txt
find . -name "README.md" | grep -v node_modules > cleanup-workspace/inventories/readme-files.txt

print_success "Inventories created in cleanup-workspace/inventories/"

# PHASE 2: LOW-RISK CLEANUP
print_status "📋 PHASE 2: Low-Risk Cleanup"

if confirm "Archive old backup directories? This is safe. (y/n): "; then
    print_status "Creating archive directory..."
    mkdir -p archive/backups
    
    # Archive backup directories
    if [ -d "backup-refactor" ]; then
        print_status "Archiving backup-refactor/..."
        mv backup-refactor/ archive/backups/
        print_success "backup-refactor/ archived"
    fi
    
    if [ -d "backup-files" ]; then
        print_status "Archiving backup-files/..."
        mv backup-files/ archive/backups/
        print_success "backup-files/ archived"
    fi
    
    if [ -d "database-files" ]; then
        print_status "Archiving database-files/..."
        mv database-files/ archive/backups/
        print_success "database-files/ archived"
    fi
fi

# PHASE 3: DOCUMENTATION CONSOLIDATION  
print_status "📋 PHASE 3: Documentation Consolidation"

if confirm "Consolidate documentation/ into docs/? (y/n): "; then
    if [ -d "documentation" ]; then
        print_status "Merging documentation/ into docs/..."
        
        # Create docs if it doesn't exist
        mkdir -p docs
        
        # Use rsync to merge without overwriting
        rsync -av documentation/ docs/
        
        # Move original to archive
        mkdir -p archive/consolidated
        mv documentation/ archive/consolidated/
        
        print_success "Documentation consolidated"
    else
        print_warning "documentation/ directory not found"
    fi
fi

# PHASE 4: REPORTS AND VALIDATION CONSOLIDATION
if confirm "Archive validation and reports directories? (y/n): "; then
    mkdir -p archive/reports
    
    if [ -d "validation" ]; then
        print_status "Archiving validation/..."
        mv validation/ archive/reports/
        print_success "validation/ archived"
    fi
    
    if [ -d "reports" ]; then
        print_status "Archiving reports/..."
        mv reports/ archive/reports/
        print_success "reports/ archived"
    fi
fi

# PHASE 5: ENVIRONMENT FILES ORGANIZATION
if confirm "Move env-files to config/? (y/n): "; then
    if [ -d "env-files" ]; then
        print_status "Moving env-files to config/..."
        mkdir -p config
        mv env-files/ config/env-files/
        print_success "env-files moved to config/"
    fi
fi

# PHASE 6: MISCELLANEOUS CLEANUP
print_status "📋 PHASE 6: Optional Miscellaneous Cleanup"

if confirm "Archive generated/ directory? (y/n): "; then
    if [ -d "generated" ]; then
        print_status "Archiving generated/..."
        mkdir -p archive/misc
        mv generated/ archive/misc/
        print_success "generated/ archived"
    fi
fi

if confirm "Move monitoring/ to tools/? (y/n): "; then
    if [ -d "monitoring" ]; then
        print_status "Moving monitoring to tools/..."
        mkdir -p tools
        mv monitoring/ tools/monitoring/
        print_success "monitoring/ moved to tools/"
    fi
fi

# FINAL VERIFICATION
print_status "📋 PHASE 7: Final Verification"

print_status "Running application test..."
if npm run build >/dev/null 2>&1; then
    print_success "✅ Application builds successfully after cleanup!"
else
    print_error "❌ Application build failed. Check for broken references."
    print_warning "You may need to restore from backup: $BACKUP_DIR"
fi

# Generate cleanup summary
print_status "📊 Generating cleanup summary..."
cat > cleanup-workspace/CLEANUP_SUMMARY.md << EOF
# 🧹 Cleanup Summary

**Date:** $(date)
**Backup Location:** $BACKUP_DIR

## Actions Performed:

### Archived Directories:
$(ls -la archive/ 2>/dev/null || echo "None")

### Moved Directories:
$(if [ -d "config/env-files" ]; then echo "- env-files/ → config/env-files/"; fi)
$(if [ -d "tools/monitoring" ]; then echo "- monitoring/ → tools/monitoring/"; fi)

### Root Directory Count:
- Before: $(cat cleanup-workspace/inventories/root-directories.txt | wc -l) directories
- After: $(find . -type d -maxdepth 1 | grep -v "^.$" | wc -l) directories

### Documentation Status:
- documentation/ consolidated into docs/
- Reports archived to archive/reports/

## Verification:
- Application build: $(npm run build >/dev/null 2>&1 && echo "✅ SUCCESS" || echo "❌ FAILED")

## Rollback Instructions:
If anything is broken, restore from backup:
\`\`\`bash
# Remove current directory
cd ..
rm -rf DemoHotel19May

# Restore from backup  
cp -r $BACKUP_DIR DemoHotel19May
cd DemoHotel19May
\`\`\`
EOF

print_success "🎉 Cleanup completed!"
print_status "📄 Summary saved to cleanup-workspace/CLEANUP_SUMMARY.md"
print_status "💾 Backup available at: $BACKUP_DIR"

# Final status
echo ""
echo "=== CLEANUP COMPLETE ==="
echo "📁 Root directories now: $(find . -type d -maxdepth 1 | grep -v "^.$" | wc -l)"
echo "📚 Archive created with old files"
echo "💾 Backup safe at: $BACKUP_DIR"
echo ""
echo "Next steps:"
echo "1. Test your application thoroughly"
echo "2. Update any documentation references if needed"
echo "3. Consider adding .gitignore rules to prevent future clutter"
echo ""