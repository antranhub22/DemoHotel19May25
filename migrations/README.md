# 🧪 Database Migration Testing System

## Overview

This comprehensive migration testing system ensures safe transition from the single-tenant Mi Nhon Hotel system to a multi-tenant SaaS platform. The test suite validates data preservation, functionality integrity, and new tenant capabilities.

## 🎯 What This Tests

### ✅ Data Preservation
- **Backup Creation**: Automatic backup of all existing data
- **Data Integrity**: Checksums and record counts before/after migration
- **Mi Nhon Data**: Ensures all existing Mi Nhon Hotel data is preserved
- **Referential Integrity**: Validates foreign key relationships

### ✅ Migration Safety
- **Rollback Procedures**: Automatic rollback on failure
- **Dry Run Mode**: Test migrations without making changes
- **Performance Verification**: Ensures queries remain fast
- **Error Handling**: Comprehensive error detection and reporting

### ✅ Multi-Tenant Functionality
- **Tenant Isolation**: Verifies tenants cannot access each other's data
- **Mi Nhon Compatibility**: Ensures Mi Nhon Hotel works exactly as before
- **New Tenant Creation**: Tests creating and managing new tenants
- **Data Association**: Validates data is correctly linked to tenants

## 🚀 Quick Start

### Run All Tests
```bash
# Run comprehensive test suite
npm run migration:test:all

# Quick dry run (safe preview)
npm run migration:test:dry-run

# Production-ready test
npm run migration:test:production
```

### Pre-Deployment Check
```bash
# Recommended before production deployment
npm run migration:test:pre-deploy
```

## 📋 Test Scenarios

### 1. Dry Run Test (`dryRun`)
- **Purpose**: Safe preview of migration without making changes
- **Safety**: 100% safe - no data modifications
- **Use case**: Initial testing and development
```bash
npm run migration:test:dry-run
```

### 2. Development Test (`development`)
- **Purpose**: Full migration test using SQLite
- **Safety**: Medium - uses test database
- **Use case**: Local development and CI/CD
```bash
npm run migration:test:development
```

### 3. Production Test (`production`)
- **Purpose**: Full migration test using PostgreSQL
- **Safety**: High risk - uses actual database (with backup)
- **Use case**: Final validation before deployment
```bash
npm run migration:test:production
```

### 4. Smoke Test (`smoke`)
- **Purpose**: Quick verification of basic functionality
- **Safety**: 100% safe - dry run only
- **Use case**: CI/CD and quick checks
```bash
npm run migration:verify
```

## 🔍 Test Steps Explained

### Step 1: Initialize Database Connection
- Connects to PostgreSQL or SQLite based on configuration
- Tests database connectivity
- Prepares testing environment

### Step 2: Backup Existing Data
- Creates timestamped backup directory
- Exports all table data to JSON files
- Generates restoration script
- **⚠️ Critical**: Always verify backup before proceeding

### Step 3: Capture Pre-Migration State
- Counts records in each table
- Creates data checksum for integrity verification
- Documents current database structure

### Step 4: Run Multi-Tenant Migration
- Executes Drizzle migrations
- Creates new tables: `tenants`, `hotel_profiles`
- Adds `tenant_id` columns to existing tables

### Step 5: Create Mi Nhon Tenant
- Creates Mi Nhon Hotel as first tenant
- Sets up premium subscription with full features
- Creates hotel profile with existing data structure

### Step 6: Migrate Existing Data
- Associates all existing data with Mi Nhon tenant
- Updates `tenant_id` fields across all tables
- Maintains data relationships

### Step 7: Verify Data Preservation
- Compares record counts before/after migration
- Validates data checksums match
- Ensures no data loss occurred

### Step 8: Test Mi Nhon Functionality
- Verifies Mi Nhon data is accessible
- Tests tenant-specific queries
- Ensures existing functionality works

### Step 9: Test New Tenant Functionality
- Creates test tenant
- Verifies data isolation between tenants
- Tests multi-tenant queries

### Step 10: Data Integrity Checks
- Validates referential integrity
- Checks for orphaned records
- Verifies tenant isolation
- Tests data consistency

### Step 11: Performance Verification
- Measures query performance with tenant filtering
- Ensures acceptable response times
- Identifies potential performance issues

## 🛠️ Configuration Options

### Environment Variables
```bash
# Database connection
DATABASE_URL=postgresql://user:password@host:port/database

# Test configuration
MIGRATION_TEST_BACKUP_PATH=./backups
MIGRATION_TEST_VERBOSE=true
```

### Test Configuration
```typescript
{
  databaseUrl: string,           // Database connection string
  backupPath: string,            // Backup directory location
  testDbPath: string,            // SQLite test database path
  isDryRun: boolean,             // Run without making changes
  skipBackup: boolean,           // Skip backup creation
  verbose: boolean               // Detailed logging
}
```

## 📊 Understanding Results

### Success Indicators
- ✅ All test steps completed
- ✅ Data preservation verified
- ✅ Mi Nhon functionality working
- ✅ New tenant isolation working
- ✅ Performance acceptable

### Failure Indicators
- ❌ Migration step failed
- ❌ Data integrity issues
- ❌ Tenant isolation problems
- ❌ Performance degradation

### Sample Report
```
# Database Migration Test Report

## Summary
- Status: ✅ SUCCESS
- Duration: 2,450.23ms
- Success Rate: 100.0%

## Data Integrity
- Pre-Migration Data Count: {"transcripts": 150, "requests": 45}
- Post-Migration Data Count: {"transcripts": 150, "requests": 45}
- Checksum Match: ✅

## Mi Nhon Hotel Data
- Data Preserved: ✅
- Tenant ID: tenant-abc123
- Associated Correctly: ✅

## New Tenant Functionality
- Working: ✅
- Test Tenant ID: tenant-test456
```

## 🚨 Rollback Procedures

### Automatic Rollback
The test system automatically attempts rollback on failure:
1. Removes test tenant data
2. Clears `tenant_id` from existing tables
3. Drops multi-tenant tables
4. Restores original state

### Manual Rollback
If automatic rollback fails:

```bash
# 1. Stop application
npm run stop

# 2. Restore from backup
psql $DATABASE_URL < backups/backup-TIMESTAMP/restore.sql

# 3. Load backup data manually
# (See generated restore.sql for specific commands)

# 4. Restart application
npm run start
```

## 🏥 Health Checks

### Pre-Migration Health Check
```bash
# Verify system is ready for migration
npm run migration:test:dry-run
```

### Post-Migration Health Check
```bash
# Verify migration succeeded
npm run migration:verify
```

## 🔧 Troubleshooting

### Common Issues

#### Test Fails: "Database connection failed"
```bash
# Check database is running
pg_isready -h localhost -p 5432

# Verify connection string
echo $DATABASE_URL
```

#### Test Fails: "Data integrity mismatch"
- Review backup files in `./backups/backup-TIMESTAMP/`
- Check for concurrent database modifications
- Verify no external processes are modifying data

#### Test Fails: "Tenant isolation breach"
- Indicates serious multi-tenancy bug
- **DO NOT PROCEED** with deployment
- Review tenant filtering logic in queries

#### Performance Warning
- Monitor query execution times
- Consider adding database indexes
- Review tenant filtering efficiency

### Getting Help

1. **Check Logs**: Review detailed test output for specific errors
2. **Review Backups**: Examine backup files for data comparison
3. **Test Reports**: Analyze generated test reports in `./test-results/`
4. **Database State**: Manually inspect database structure and data

## 📁 File Structure

```
migrations/
├── test-migration.ts           # Main test implementation
├── README.md                  # This documentation
└── 0000_*.sql                 # Migration files

scripts/
└── run-migration-test.ts      # Test runner and CLI

test-results/
├── migration/                 # Test results and reports
├── production-TIMESTAMP.json  # Detailed test results
├── production-TIMESTAMP.md    # Human-readable report
└── deployment-checklist.md    # Production deployment guide

backups/
└── backup-TIMESTAMP/          # Data backups
    ├── transcripts.json       # Table data exports
    ├── requests.json
    └── restore.sql            # Restoration script
```

## 🚀 Production Deployment Workflow

### 1. Pre-Deployment Testing
```bash
# Run comprehensive test
npm run migration:test:pre-deploy
```

### 2. Deployment Day
```bash
# Final verification
npm run migration:test:dry-run

# Production migration
npm run migration:run

# Post-deployment verification
npm run migration:verify
```

### 3. Monitoring
- Monitor application logs
- Check database performance
- Verify Mi Nhon Hotel functionality
- Test new tenant creation

## ⚠️ Safety Guidelines

### DO's
- ✅ Always run dry run tests first
- ✅ Create database backups before production migration
- ✅ Test in staging environment
- ✅ Have rollback plan ready
- ✅ Monitor migration progress

### DON'Ts
- ❌ Never run production tests on live data without backup
- ❌ Don't skip pre-deployment verification
- ❌ Don't ignore test failures
- ❌ Don't proceed if data integrity fails
- ❌ Don't migrate during peak usage hours

---

**💡 Remember**: This migration transforms the application from single-tenant to multi-tenant. Take time to thoroughly test and understand the implications before production deployment. 