# 📦 Package Dependency Analyzer

A comprehensive tool for analyzing package.json dependencies to detect unused packages, version
mismatches, missing dependencies, and security vulnerabilities. This tool helps maintain a clean and
secure dependency tree.

## 🎯 Features

### Core Analysis

- ✅ **Unused Package Detection** - Find packages that are installed but never imported
- ✅ **Missing Dependency Detection** - Identify packages used in code but not declared in
  package.json
- ✅ **Version Mismatch Analysis** - Compare declared vs installed package versions
- ✅ **Duplicate Package Detection** - Find packages in both dependencies and devDependencies
- ✅ **Security Vulnerability Scanning** - Check for known security issues
- ✅ **Outdated Package Detection** - Identify packages with available updates

### Advanced Features

- 🔧 **Multiple Analysis Modes** - Basic, full, security, and updates modes
- 📊 **Detailed Reporting** - Comprehensive reports with statistics and recommendations
- 🎛️ **Configurable Rules** - Customizable analysis settings and ignore patterns
- 🔄 **Auto-fixing Capabilities** - Automatic removal/installation of packages
- 📁 **Smart Package Detection** - Handles indirect dependencies and build tools

## 🚀 Quick Start

### Basic Usage

```bash
# Basic dependency check
npm run check:deps

# Full analysis with details
npm run check:deps:full

# Security audit
npm run check:deps:security

# Check for updates
npm run check:deps:updates

# Auto-fix issues
npm run check:deps:fix
```

### Using the Bash Wrapper

```bash
# Basic analysis
./tools/scripts/validation/run-dependency-check.sh

# Full analysis with detailed output
./tools/scripts/validation/run-dependency-check.sh -m full -d

# Security scan with report
./tools/scripts/validation/run-dependency-check.sh -m security -o security-report.json

# Check for updates
./tools/scripts/validation/run-dependency-check.sh -m updates

# Auto-fix unused/missing packages
./tools/scripts/validation/run-dependency-check.sh --fix
```

### Direct Node.js Usage

```bash
# Basic analysis
node tools/scripts/validation/package-dependency-analyzer.js

# Detailed analysis with security check
node tools/scripts/validation/package-dependency-analyzer.js --detailed --check-security

# Generate report
node tools/scripts/validation/package-dependency-analyzer.js --output=deps-report.json
```

## 📋 Command Options

### Bash Wrapper Options

| Option       | Short | Description                                   | Example               |
| ------------ | ----- | --------------------------------------------- | --------------------- |
| `--mode`     | `-m`  | Analysis mode: basic, full, security, updates | `-m security`         |
| `--detailed` | `-d`  | Show detailed analysis                        | `-d`                  |
| `--output`   | `-o`  | Save report to file                           | `-o deps-report.json` |
| `--fix`      | `-f`  | Attempt auto-fix                              | `-f`                  |
| `--security` | `-s`  | Check security vulnerabilities                | `-s`                  |
| `--updates`  | `-u`  | Check for package updates                     | `-u`                  |
| `--help`     | `-h`  | Show help                                     | `-h`                  |

### Node.js Script Options

| Option              | Description                    | Example                |
| ------------------- | ------------------------------ | ---------------------- |
| `--detailed`        | Detailed analysis output       | `--detailed`           |
| `--output=file`     | Save JSON report               | `--output=report.json` |
| `--fix`             | Auto-fix issues                | `--fix`                |
| `--check-security`  | Check security vulnerabilities | `--check-security`     |
| `--suggest-updates` | Check for package updates      | `--suggest-updates`    |

## 🔧 Configuration

The analyzer uses `tools/scripts/validation/dependency-config.json` for configuration:

### Analysis Settings

```json
{
  "analysis": {
    "checkUnusedPackages": true,
    "checkMissingDependencies": true,
    "checkVersionMismatches": true,
    "checkDuplicatePackages": true,
    "checkSecurityVulnerabilities": false,
    "checkOutdatedPackages": false
  }
}
```

### Ignore Rules

```json
{
  "ignoreRules": {
    "ignoreUnusedPackages": ["@types/*", "typescript", "eslint*"],
    "ignoreMissingDependencies": ["react", "react-dom", "node:*"],
    "allowedPeerDependencies": ["react", "react-dom", "typescript"]
  }
}
```

### Built-in Modules

```json
{
  "builtinModules": ["fs", "path", "http", "https", "crypto", "buffer", "events"]
}
```

## 📊 Understanding the Output

### Unused Packages

```
📦 UNUSED PACKAGES (3):
   lodash@4.17.21 (prod)
   @types/lodash@4.14.191 (dev)
   moment@2.29.4 (prod)
```

**Meaning**: These packages are installed but never imported in your code.

**Fix**: Remove them with `npm uninstall package-name` or use `--fix` flag.

### Missing Dependencies

```
❌ MISSING DEPENDENCIES (2):
   axios - used in code but not in package.json
   react-router-dom - used in code but not in package.json
```

**Meaning**: Your code imports these packages but they're not declared in package.json.

**Fix**: Add them with `npm install package-name` or use `--fix` flag.

### Version Mismatches

```
⚠️  VERSION MISMATCHES (1):
   react: declared ^18.0.0 but installed 18.2.0
```

**Meaning**: The installed version doesn't match the declared version range.

**Fix**: Update package.json or run `npm update`.

### Duplicate Packages

```
🔄 DUPLICATE PACKAGES (1):
   typescript: prod(^4.9.5) + dev(^5.0.0)
```

**Meaning**: Package appears in both dependencies and devDependencies.

**Fix**: Keep only one (usually in devDependencies for build tools).

### Security Vulnerabilities

```
🔒 SECURITY VULNERABILITIES (2):
   lodash: high - Prototype Pollution in lodash
   axios: moderate - Server-Side Request Forgery
```

**Meaning**: Known security vulnerabilities in your dependencies.

**Fix**: Update to patched versions or find alternatives.

### Outdated Packages

```
📅 OUTDATED PACKAGES (5):
   react: 18.0.0 → 18.2.0 (latest: 18.2.0)
   express: 4.17.1 → 4.18.2 (latest: 4.18.2)
```

**Meaning**: Newer versions are available.

**Fix**: Update with `npm update` or manually upgrade.

## 🎛️ Analysis Modes

### Basic Mode (`-m basic`)

- ⚡ **Fast execution**
- 🎯 **Essential checks** only
- 📦 **Unused/missing packages**
- 💡 **Use**: Daily development workflow

### Full Mode (`-m full`)

- 🔍 **Comprehensive analysis**
- 📊 **All issue types**
- 📈 **Detailed statistics**
- 💡 **Use**: Code reviews, weekly maintenance

### Security Mode (`-m security`)

- 🔒 **Security vulnerability scanning**
- 📊 **Full dependency analysis**
- 📄 **Detailed security report**
- 💡 **Use**: Security audits, production deployment

### Updates Mode (`-m updates`)

- 📅 **Outdated package checking**
- 🔍 **Version comparison**
- 📊 **Update recommendations**
- 💡 **Use**: Monthly maintenance, dependency updates

## 🛠️ Integration Options

### NPM Scripts (package.json)

```json
{
  "scripts": {
    "check:deps": "./tools/scripts/validation/run-dependency-check.sh",
    "check:deps:full": "./tools/scripts/validation/run-dependency-check.sh -m full -d",
    "check:deps:security": "./tools/scripts/validation/run-dependency-check.sh -m security",
    "check:deps:updates": "./tools/scripts/validation/run-dependency-check.sh -m updates",
    "check:deps:fix": "./tools/scripts/validation/run-dependency-check.sh --fix",
    "audit:deps": "./tools/scripts/validation/run-dependency-check.sh -m security -o security-report.json"
  }
}
```

### Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Check dependencies
npm run check:deps:basic
```

### GitHub Actions

Add to `.github/workflows/security.yml`:

```yaml
name: Security Audit

on: [push, pull_request]

jobs:
  dependency-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - name: Security audit
        run: npm run check:deps:security
      - name: Upload security report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: security-audit-report
          path: security-report.json
```

### VS Code Tasks

Add to `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Check Dependencies",
      "type": "shell",
      "command": "npm run check:deps",
      "group": "test",
      "presentation": {
        "echo": true,
        "reveal": "always"
      }
    }
  ]
}
```

## 🔧 Troubleshooting

### Common Issues

#### "npm audit command not found"

```bash
# Update npm to latest version
npm install -g npm@latest
```

#### "Permission denied"

```bash
# Make script executable
chmod +x tools/scripts/validation/run-dependency-check.sh
```

#### "False positives for unused packages"

1. Add packages to `ignoreUnusedPackages` in config
2. Check if package is used indirectly (build tools, etc.)
3. Verify package is actually imported in code

#### "Missing built-in modules"

1. Add to `builtinModules` in config
2. Use `node:` prefix for Node.js built-ins
3. Check if it's a TypeScript type package

### Performance Tips

1. **Use Basic Mode** for frequent checks
2. **Cache Results** for large projects
3. **Exclude Test Files** to improve accuracy
4. **Run Security Checks** weekly, not daily

### Configuration Issues

#### Package Not Detected as Used

1. Check if import uses alias or subdirectory
2. Add to `indirectPackages` if it's a build tool
3. Verify file is included in `analyzePatterns`

#### Too Many False Positives

1. Customize `ignoreRules` in config
2. Add project-specific patterns
3. Use `--detailed` to understand detection logic

## 📈 Best Practices

### Development Workflow

1. **Basic check** before commits
2. **Full analysis** weekly
3. **Security audit** monthly
4. **Update check** quarterly

### Dependency Management

1. **Regular cleanup** of unused packages
2. **Pin versions** for critical dependencies
3. **Use exact versions** for production
4. **Monitor security** advisories

### Package Selection

1. **Prefer popular** and maintained packages
2. **Check bundle size** impact
3. **Avoid deep** dependency trees
4. **Use TypeScript types** when available

### Maintenance

1. **Review dependencies** during code reviews
2. **Update gradually** to avoid breaking changes
3. **Test thoroughly** after updates
4. **Document** dependency choices

## 🎯 Examples

### Example 1: Daily Development Check

```bash
# Quick check before committing
npm run check:deps
```

### Example 2: Weekly Maintenance

```bash
# Full analysis with cleanup
npm run check:deps:full
npm run check:deps:fix
```

### Example 3: Security Audit

```bash
# Generate security report
npm run audit:deps
```

### Example 4: Dependency Updates

```bash
# Check for updates and review
npm run check:deps:updates
```

## 🚀 Auto-fixing

The analyzer can automatically fix some issues:

### What Gets Fixed

- ✅ **Remove unused packages** (if not in ignore list)
- ✅ **Install missing packages** (latest versions)
- ⚠️ **Version mismatches** (manual review recommended)
- ⚠️ **Security issues** (manual review recommended)

### What Requires Manual Review

- 🔍 **Duplicate packages** (choose prod vs dev)
- 🔍 **Major version updates** (breaking changes)
- 🔍 **Security patches** (test compatibility)
- 🔍 **Peer dependencies** (version compatibility)

### Using Auto-fix Safely

```bash
# Dry run first (see what would be changed)
npm run check:deps:full

# Review changes, then auto-fix
npm run check:deps:fix

# Verify everything still works
npm run test
npm run build
```

## 📋 File Structure

```
tools/scripts/validation/
├── package-dependency-analyzer.js   # Main analysis engine
├── run-dependency-check.sh         # Bash wrapper
├── dependency-config.json          # Configuration
└── DEPENDENCY_ANALYZER_README.md   # This documentation
```

## ✅ Getting Started

1. **Make scripts executable**:

   ```bash
   chmod +x tools/scripts/validation/run-dependency-check.sh
   ```

2. **Run your first check**:

   ```bash
   npm run check:deps
   ```

3. **Review the output** and understand the issues

4. **Customize configuration** if needed

5. **Integrate into your workflow** with npm scripts and git hooks

For advanced configuration options, see the configuration file at
`tools/scripts/validation/dependency-config.json`.

---

**Happy dependency management! 📦**
