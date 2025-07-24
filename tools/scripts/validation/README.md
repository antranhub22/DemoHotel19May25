# 🔍 Import/Export Consistency Checker

A comprehensive tool for analyzing import/export consistency across the entire TypeScript/JavaScript
codebase. This tool helps maintain code quality by detecting common issues like missing exports,
unused exports, circular dependencies, and path mismatches.

## 🎯 Features

### Core Analysis

- ✅ **Missing Exports Detection** - Find imports that reference non-existent exports
- ✅ **Unused Exports Analysis** - Identify exports that are never imported
- ✅ **Circular Dependency Detection** - Find circular import chains
- ✅ **Path Resolution Validation** - Verify import paths resolve correctly
- ✅ **Alias Path Support** - Full support for TypeScript path aliases

### Advanced Features

- 🔧 **Multiple Analysis Modes** - Quick, full, and CI-optimized analysis
- 📊 **Detailed Reporting** - Comprehensive reports with statistics
- 🎛️ **Configurable Rules** - Customizable analysis settings
- 🔄 **Auto-fixing Capabilities** - Automatic resolution of some issues
- 📁 **Selective Analysis** - Focus on specific directories or issue types

## 🚀 Quick Start

### Basic Usage

```bash
# Quick check (fast, basic issues only)
npm run check:imports:quick

# Full analysis (comprehensive)
npm run check:imports:full

# CI mode (JSON output, exit codes)
npm run check:imports:ci
```

### Using the Bash Wrapper

```bash
# Full analysis with all options
./tools/scripts/validation/run-import-check.sh

# Quick check of frontend only
./tools/scripts/validation/run-import-check.sh -m quick -t apps/client

# Detailed analysis with report
./tools/scripts/validation/run-import-check.sh -d -o import-report.json

# Focus on circular dependencies
./tools/scripts/validation/run-import-check.sh --focus circular

# CI mode for automation
./tools/scripts/validation/run-import-check.sh -m ci
```

### Direct Node.js Usage

```bash
# Comprehensive analysis
node tools/scripts/validation/import-export-checker.js

# Quick check with options
node tools/scripts/validation/quick-import-check.js apps/client

# With specific focus
node tools/scripts/validation/import-export-checker.js --focus=circular --detailed
```

## 📋 Command Options

### Bash Wrapper Options

| Option       | Short | Description                          | Example            |
| ------------ | ----- | ------------------------------------ | ------------------ |
| `--mode`     | `-m`  | Analysis mode: `full`, `quick`, `ci` | `-m quick`         |
| `--target`   | `-t`  | Target path to analyze               | `-t apps/client`   |
| `--detailed` | `-d`  | Show detailed analysis               | `-d`               |
| `--output`   | `-o`  | Save report to file                  | `-o report.json`   |
| `--fix`      | `-f`  | Attempt auto-fix                     | `-f`               |
| `--focus`    |       | Focus on issue type                  | `--focus circular` |
| `--help`     | `-h`  | Show help                            | `-h`               |

### Node.js Script Options

| Option              | Description              | Example                |
| ------------------- | ------------------------ | ---------------------- |
| `--detailed`        | Detailed analysis output | `--detailed`           |
| `--output=file`     | Save JSON report         | `--output=report.json` |
| `--focus=type`      | Focus analysis type      | `--focus=imports`      |
| `--exclude=pattern` | Exclude file pattern     | `--exclude=test`       |

## 🔧 Configuration

The checker uses `tools/scripts/validation/import-check-config.json` for configuration:

### Path Aliases

```json
{
  "pathAliases": {
    "@/": "apps/client/src/",
    "@shared/": "packages/shared/",
    "@server/": "apps/server/",
    "@types/": "packages/types/"
  }
}
```

### Analysis Settings

```json
{
  "analysis": {
    "checkMissingExports": true,
    "checkUnusedExports": true,
    "checkCircularDependencies": true,
    "checkPathMismatches": true,
    "warnOnDeepImports": true
  }
}
```

### Ignore Rules

```json
{
  "ignoreRules": {
    "ignoreUnusedExports": ["index.ts", "*.config.*"],
    "ignoreMissingExports": ["react", "@types/*"],
    "allowedExternalModules": ["react", "lodash", "axios"]
  }
}
```

## 📊 Understanding the Output

### Missing Exports

```
❌ MISSING EXPORTS (3):
   apps/client/src/components/Header.tsx:5
      Importing 'UserProfile' from './UserProfile'
      Target file: apps/client/src/components/UserProfile.tsx
```

**Meaning**: The file tries to import `UserProfile`, but the target file doesn't export it.

**Fix**: Add `export { UserProfile }` or `export default UserProfile` to the target file.

### Unused Exports

```
⚠️  UNUSED EXPORTS (5):
   apps/client/src/utils/helpers.ts:10 - 'formatDate' (function)
   packages/shared/constants.ts:5 - 'DEBUG_MODE' (variable)
```

**Meaning**: These exports exist but are never imported anywhere.

**Fix**: Remove the unused exports or add imports where needed.

### Circular Dependencies

```
🔄 CIRCULAR DEPENDENCIES (1):
   Cycle 1 (length: 3):
      1. apps/client/src/components/A.tsx
      2. apps/client/src/components/B.tsx
      3. apps/client/src/components/C.tsx
```

**Meaning**: Components A → B → C → A form a circular dependency chain.

**Fix**: Refactor to break the cycle, often by extracting shared code to a separate module.

### Path Mismatches

```
🚫 PATH MISMATCHES (2):
   apps/client/src/pages/Dashboard.tsx:8
      Import: './components/Widget'
      Resolved to: apps/client/src/pages/components/Widget.tsx
      Issue: path_not_found
```

**Meaning**: The import path doesn't resolve to an existing file.

**Fix**: Correct the import path or create the missing file.

## 🛠️ Integration

### NPM Scripts (package.json)

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "check:imports": "./tools/scripts/validation/run-import-check.sh",
    "check:imports:quick": "./tools/scripts/validation/run-import-check.sh -m quick",
    "check:imports:full": "./tools/scripts/validation/run-import-check.sh -m full -d",
    "check:imports:ci": "./tools/scripts/validation/run-import-check.sh -m ci",
    "check:imports:frontend": "./tools/scripts/validation/run-import-check.sh -t apps/client",
    "check:imports:backend": "./tools/scripts/validation/run-import-check.sh -t apps/server",
    "fix:imports": "./tools/scripts/validation/run-import-check.sh --fix"
  }
}
```

### Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run quick import check
npm run check:imports:quick
```

### GitHub Actions

Add to `.github/workflows/quality.yml`:

```yaml
name: Code Quality

on: [push, pull_request]

jobs:
  import-analysis:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - name: Check import/export consistency
        run: npm run check:imports:ci
      - name: Upload analysis report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: import-analysis-report
          path: import-export-report.json
```

### VS Code Integration

Add to `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Check Imports (Quick)",
      "type": "shell",
      "command": "./tools/scripts/validation/run-import-check.sh",
      "args": ["-m", "quick"],
      "group": "test",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    }
  ]
}
```

## 🔍 Analysis Modes

### Quick Mode (`-m quick`)

- ⚡ **Fast execution** (< 5 seconds)
- 🎯 **Basic checks** only
- 📁 **File existence** validation
- 🚀 **Perfect for development**

**Use when**: Making quick changes, development workflow

### Full Mode (`-m full`)

- 🔍 **Comprehensive analysis**
- 📊 **All issue types** detected
- 📈 **Detailed statistics**
- 📄 **Rich reporting**

**Use when**: Code reviews, major refactoring, quality audits

### CI Mode (`-m ci`)

- 🤖 **Automated execution**
- 📊 **JSON output** format
- ❌ **Exit codes** for failure
- 📁 **Report artifacts**

**Use when**: Continuous integration, automated testing

## 🎯 Focus Analysis

Use `--focus` to analyze specific issue types:

| Focus Type | Description             | Use Case                 |
| ---------- | ----------------------- | ------------------------ |
| `imports`  | Missing imports/exports | After adding new exports |
| `exports`  | Unused exports          | Code cleanup             |
| `circular` | Circular dependencies   | Architecture review      |
| `paths`    | Path resolution issues  | After file moves         |

```bash
# Focus examples
./tools/scripts/validation/run-import-check.sh --focus imports
./tools/scripts/validation/run-import-check.sh --focus circular -d
```

## 🔧 Troubleshooting

### Common Issues

#### "Command not found: glob"

```bash
# Install missing dependency
npm install glob
```

#### "Permission denied"

```bash
# Make script executable
chmod +x tools/scripts/validation/run-import-check.sh
```

#### "Too many files"

```bash
# Use target to limit scope
./tools/scripts/validation/run-import-check.sh -t apps/client
```

#### "Out of memory"

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run check:imports:full
```

### Performance Tips

1. **Use Quick Mode** for frequent checks
2. **Target Specific Directories** for large codebases
3. **Enable Caching** in config for repeated analysis
4. **Exclude Test Files** to improve performance

### Configuration Issues

#### Path Aliases Not Working

1. Check `tsconfig.json` paths match config
2. Verify `baseUrl` is set correctly
3. Ensure alias patterns are correct

#### False Positives

1. Add patterns to `ignoreRules`
2. Use `allowedExternalModules` for libraries
3. Configure `severity` levels

## 📈 Best Practices

### Development Workflow

1. **Quick check** before commits
2. **Full analysis** weekly
3. **CI integration** for all PRs
4. **Focus analysis** for specific changes

### Code Organization

1. **Prefer absolute imports** over deep relative paths
2. **Use index files** for clean module interfaces
3. **Avoid circular dependencies** through proper architecture
4. **Export only what's needed** to reduce unused exports

### Maintenance

1. **Regular cleanup** of unused exports
2. **Refactor circular dependencies** proactively
3. **Update path aliases** when restructuring
4. **Review analysis reports** for trends

## 🎯 Examples

### Example 1: Frontend Component Check

```bash
# Check React components for issues
./tools/scripts/validation/run-import-check.sh -t apps/client/src/components -d
```

### Example 2: Backend API Analysis

```bash
# Analyze server routes and services
./tools/scripts/validation/run-import-check.sh -t apps/server --focus imports
```

### Example 3: Full Project Audit

```bash
# Comprehensive analysis with report
./tools/scripts/validation/run-import-check.sh -m full -d -o audit-report.json
```

### Example 4: CI Integration

```bash
# Automated check for CI/CD
./tools/scripts/validation/run-import-check.sh -m ci
```

---

## 🚀 Getting Started

1. **Install dependencies**:

   ```bash
   npm install glob
   ```

2. **Make scripts executable**:

   ```bash
   chmod +x tools/scripts/validation/run-import-check.sh
   ```

3. **Run your first check**:

   ```bash
   npm run check:imports:quick
   ```

4. **Review the output** and fix any issues

5. **Integrate into your workflow** with npm scripts and git hooks

For more advanced usage and configuration options, see the configuration file at
`tools/scripts/validation/import-check-config.json`.

---

**Happy coding! 🎉**
