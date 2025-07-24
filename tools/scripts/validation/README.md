# 🔍 **Quick Diagnosis Commands**

## 📋 **Overview**

Quick Diagnosis Commands provide **instant repository health checking** with prioritized issue
detection and actionable recommendations. This is the **4th layer** of our comprehensive validation
ecosystem.

## 🏗️ **Validation Ecosystem Architecture**

```bash
1. 🔄 Real-time        → VS Code monitoring (.vscode/)
2. 📊 Comprehensive    → Repository Sync Checker (9 categories)
3. 🤖 Automated        → GitHub Actions CI/CD
4. ⚡ Quick Diagnosis  → Instant bash commands + AI analysis ← NEW
```

## 🚀 **Quick Commands**

### **All-in-One Health Check**

```bash
# Run complete diagnosis
npm run diag
# or
./tools/scripts/validation/quick-diagnosis.sh
```

**What it checks:**

- ✅ TypeScript compilation (`npx tsc --noEmit`)
- ✅ Dependency validation (`npx depcheck`)
- ✅ Circular dependencies (`npx madge --circular`)
- ✅ ESLint validation (`npm run lint`)
- ✅ Git repository status (`git status --porcelain`)
- ✅ Repository Sync Check integration
- ✅ Performance metrics & health score

### **Individual Diagnostic Commands**

```bash
# TypeScript check only
npm run diag:ts
echo "=== TypeScript Check ===" && npx tsc --noEmit

# Dependency check only
npm run diag:deps
echo "=== Dependency Check ===" && npx depcheck

# Circular dependencies only
npm run diag:circular
echo "=== Circular Dependencies ===" && npx madge --circular src/

# ESLint check only
npm run diag:lint
echo "=== ESLint Check ===" && npm run lint

# Git status only
npm run diag:git
echo "=== Git Status ===" && git status --porcelain
```

## 🤖 **AI-Powered Comprehensive Analysis**

### **Codebase Analysis with Intelligence**

```bash
# AI-powered comprehensive analysis
node tools/scripts/validation/codebase-analysis.js

# Save analysis report
node tools/scripts/validation/codebase-analysis.js --save
```

**What it analyzes:**

1. 🔍 **Type consistency** across all files
2. 🔗 **Import/export synchronization**
3. 💀 **Dead code detection**
4. 🔄 **Circular dependency detection**
5. 📝 **Naming convention consistency**
6. 📁 **File structure compliance**

**Output:**

- 📊 Health score (0-100)
- 🎯 Prioritized action list
- 🔧 Quick fix suggestions
- 📋 Detailed issue breakdown

## 📊 **Example Output**

### **Quick Diagnosis Output**

```bash
🔍 Quick Diagnosis Commands
==================================

📋 Running All-in-One Health Check...

=== TypeScript Check ===
✅ TypeScript Check passed

=== Dependency Check ===
⚠️ Dependency Check completed with warnings
Unused devDependencies: autoprefixer, babel-jest
Missing dependencies: @shared/db

=== Circular Dependencies ===
✅ No circular dependencies

=== ESLint Check ===
⚠️ ESLint issues found (check with: npm run lint)

=== Git Status ===
⚠️ Uncommitted changes detected:
M  tools/scripts/validation/quick-diagnosis.sh
?? codebase-analysis-report.json

=== Repository Sync Check ===
✅ Repository sync validation passed

=== Performance Metrics ===
Repository size: 45M
Node modules size: 180M
TypeScript files: 127
JavaScript files: 89

==================================
📊 DIAGNOSIS SUMMARY
==================================
Total checks: 6
Passed: 3
Warnings: 3
Failed: 0

🎯 PRIORITIZED ACTIONS
==================================
⚠️ WARNINGS (Address when possible):
  • Fix ESLint issues
    Command: npm run lint:fix
  • Commit or stash uncommitted changes
    Command: git add . && git commit -m '...' or git stash

🔧 QUICK FIX COMMANDS
==================================
Fix TypeScript issues:  npx tsc --noEmit
Fix ESLint issues:      npm run lint:fix
Fix dependencies:       npm run check:deps:fix
Fix imports:            npm run check:imports:fix
Comprehensive check:    npm run sync:check
Git status:             git status

⚠️ Diagnosis completed with warnings
```

### **AI Analysis Output**

```bash
🤖 CODEBASE ANALYSIS REPORT
================================================================================

🟡 Overall Health Score: 75/100

📊 CATEGORY SCORES:
   🟢 typeConsistency: 85/100 (12 issues)
   🟡 importExportSync: 70/100 (8 issues)
   🟢 deadCode: 90/100 (5 issues)
   🟢 circularDependencies: 100/100 (0 issues)
   🟡 namingConventions: 65/100 (15 issues)
   🟢 fileStructure: 95/100 (2 issues)

🎯 PRIORITIZED ACTIONS:
   1. 🚨 Import/Export (8 issues)
      Address import/export synchronization issues
   2. ⚠️ Naming Conventions (15 issues)
      Address naming convention consistency issues
   3. ℹ️ Type Safety (12 issues)
      Address type consistency issues

🔧 QUICK FIXES:
   1. npm run check:imports:fix
      Fix 8 import/export synchronization issues
   2. Find and replace "any" types
      Fix 12 instances of "any" type usage

================================================================================
✅ Analysis completed!
================================================================================
```

## 🛠️ **Integration with Existing Tools**

### **Seamless Workflow Integration**

```bash
# Quick check before commit
npm run diag

# If issues found, use existing tools
npm run lint:fix                 # Fix ESLint issues
npm run check:imports:fix        # Fix imports
npm run sync:check              # Comprehensive analysis

# For detailed analysis
node tools/scripts/validation/codebase-analysis.js --save
```

### **VS Code Integration**

Quick diagnosis commands work perfectly with existing VS Code tasks:

```json
// .vscode/tasks.json
{
  "label": "🔍 Quick Diagnosis",
  "type": "shell",
  "command": "npm run diag",
  "group": "build"
}
```

### **CI/CD Integration**

Quick diagnosis commands are already integrated in GitHub Actions workflow:

```yaml
# .github/workflows/repository-sync-check.yml
- name: 🔍 Quick Health Check
  run: npm run diag || echo "Issues detected but continuing..."
```

## 📈 **Performance & Benefits**

### **Speed Comparison**

- **Quick Diagnosis**: ⚡ ~10-30 seconds
- **Repository Sync Check**: 📊 ~1-3 minutes
- **CI/CD Pipeline**: 🤖 ~5-15 minutes
- **AI Analysis**: 🧠 ~30-60 seconds

### **When to Use Each Tool**

| Scenario            | Recommended Tool     | Speed      | Coverage         |
| ------------------- | -------------------- | ---------- | ---------------- |
| **Before commit**   | `npm run diag`       | ⚡ Fast    | Essential checks |
| **Development**     | VS Code real-time    | ⚡ Instant | Live validation  |
| **Troubleshooting** | `npm run sync:check` | 📊 Medium  | Comprehensive    |
| **Deep analysis**   | AI Codebase Analysis | 🧠 Medium  | Intelligence     |
| **CI/CD**           | GitHub Actions       | 🤖 Slow    | Complete         |

## 🎯 **Best Practices**

### **Daily Development Workflow**

```bash
# 1. Start development
npm run diag                     # Quick health check

# 2. During development
# → VS Code real-time validation active

# 3. Before commit
npm run diag                     # Final check
git add . && git commit -m "..."

# 4. Before push
npm run sync:check:quick        # Comprehensive quick check
```

### **Troubleshooting Workflow**

```bash
# 1. Quick diagnosis
npm run diag

# 2. If warnings/errors found
npm run diag:ts                 # Check specific issues
npm run diag:deps
npm run diag:lint

# 3. Fix issues
npm run lint:fix               # Auto-fix what's possible
npm run check:imports:fix

# 4. Comprehensive verification
npm run sync:check            # Full validation
```

### **Advanced Analysis Workflow**

```bash
# 1. AI-powered analysis
node tools/scripts/validation/codebase-analysis.js --save

# 2. Review prioritized actions in report
cat codebase-analysis-report.json

# 3. Apply quick fixes
npm run lint:fix
npm run check:imports:fix

# 4. Manual fixes based on AI recommendations
# → Fix naming conventions
# → Remove dead code
# → Improve type safety

# 5. Verify improvements
npm run diag                   # Quick check
npm run sync:check            # Full verification
```

## 🔧 **Customization**

### **Modify Quick Diagnosis Script**

```bash
# Edit the script
vim tools/scripts/validation/quick-diagnosis.sh

# Add custom checks
echo "=== Custom Check ===" && your-custom-command
```

### **Add Custom NPM Scripts**

```json
// package.json
{
  "scripts": {
    "diag:custom": "echo '=== Custom Check ===' && your-command",
    "diag:security": "npm audit --audit-level=moderate",
    "diag:performance": "npm run build && ls -la dist/"
  }
}
```

### **Configure AI Analysis**

```javascript
// tools/scripts/validation/codebase-analysis.js
// Modify patterns, thresholds, and scoring logic
const CONFIG = {
  patterns: ['**/*.ts', '**/*.tsx'],
  excludePatterns: ['node_modules', 'dist'],
  healthScoreWeights: {
    typeConsistency: 0.2,
    importExportSync: 0.3,
    // ...
  },
};
```

## 🆘 **Troubleshooting**

### **Common Issues**

#### **Script not executable**

```bash
chmod +x tools/scripts/validation/quick-diagnosis.sh
```

#### **NPM script not found**

```bash
# Check package.json
grep -A 5 -B 5 "diag" package.json
```

#### **Dependencies missing**

```bash
npm install -g depcheck madge typescript
```

#### **Permission errors**

```bash
# Run without sudo
npx tsc --noEmit
npx depcheck
```

### **Performance Issues**

```bash
# Limit file scanning for large repos
export DIAG_MAX_FILES=100
npm run diag
```

## 🎉 **Summary**

**Quick Diagnosis Commands provide:**

✅ **Instant health checks** (10-30 seconds)  
✅ **Prioritized issue lists** with actionable recommendations  
✅ **Perfect integration** with existing validation ecosystem  
✅ **AI-powered insights** for intelligent analysis  
✅ **Multiple interfaces** (bash, NPM scripts, individual commands)  
✅ **Professional output** with colored, structured reports

**🚀 Quick Diagnosis Commands complete your repository's validation ecosystem with instant,
intelligent health checking!**
