#!/usr/bin/env node

/**
 * SSOT Runtime Validation Script
 * Validates live system data against JSON schemas
 * Provides real-time monitoring and validation reports
 */

const fs = require('fs').promises;
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const chalk = require('chalk');
const { z } = require('zod');

// Configuration schema
const RuntimeConfigSchema = z.object({
  validation: z.object({
    enabled: z.boolean().default(true),
    strict: z.boolean().default(false),
    failFast: z.boolean().default(false),
    timeout: z.number().default(30000),
  }),
  monitoring: z.object({
    enabled: z.boolean().default(true),
    interval: z.number().default(60000),
    alertThreshold: z.number().default(10),
    logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  }),
  reporting: z.object({
    enabled: z.boolean().default(true),
    format: z.enum(['json', 'html', 'text']).default('json'),
    outputDir: z.string().default('./validation-reports'),
    includeDetails: z.boolean().default(true),
  }),
  database: z.object({
    enabled: z.boolean().default(true),
    connectionString: z.string().optional(),
    timeout: z.number().default(10000),
  }),
  api: z.object({
    enabled: z.boolean().default(true),
    baseUrl: z.string().optional(),
    endpoints: z.array(z.string()).default([]),
    timeout: z.number().default(5000),
  }),
});

class RuntimeValidator {
  constructor(options = {}) {
    this.config = this.loadConfig();
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.continuous = options.continuous || false;

    // Initialize AJV with formats
    this.ajv = new Ajv({
      allErrors: true,
      strict: this.config.validation.strict,
      removeAdditional: false,
    });
    addFormats(this.ajv);

    this.schemas = new Map();
    this.validationErrors = [];
    this.lastValidation = null;

    this.logFile = path.join(process.cwd(), 'runtime-validation.log');
    this.reportDir = this.config.reporting.outputDir;
  }

  loadConfig() {
    try {
      const configPath = path.join(
        process.cwd(),
        'runtime-validation.config.json'
      );
      const configData = require(configPath);
      return RuntimeConfigSchema.parse(configData);
    } catch (error) {
      // Return default configuration
      return RuntimeConfigSchema.parse({});
    }
  }

  async log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;

    if (this.verbose || level === 'error' || level === 'warn') {
      console.log(this.colorizeLog(logEntry, level));
    }

    if (
      this.config.monitoring.logLevel === 'debug' ||
      ['error', 'warn', 'info'].includes(level)
    ) {
      await fs.appendFile(this.logFile, logEntry).catch(() => { });
    }
  }

  colorizeLog(message, level) {
    switch (level) {
      case 'error':
        return chalk.red(message);
      case 'warn':
        return chalk.yellow(message);
      case 'success':
        return chalk.green(message);
      case 'info':
        return chalk.blue(message);
      case 'debug':
        return chalk.gray(message);
      default:
        return message;
    }
  }

  async loadSchemas() {
    await this.log('Loading validation schemas...');

    const schemaFiles = [
      { name: 'dashboard', path: 'schemas/dashboard-schema.json' },
      { name: 'api', path: 'schemas/api-schema.json' },
    ];

    for (const { name, path: schemaPath } of schemaFiles) {
      try {
        const fullPath = path.join(process.cwd(), schemaPath);
        const schemaContent = await fs.readFile(fullPath, 'utf8');
        const schema = JSON.parse(schemaContent);

        this.ajv.addSchema(schema, name);
        this.schemas.set(name, schema);

        await this.log(`✓ Loaded schema: ${name}`, 'success');
      } catch (error) {
        await this.log(
          `✗ Failed to load schema ${name}: ${error.message}`,
          'error'
        );
        throw error;
      }
    }
  }

  async connectDatabase() {
    if (!this.config.database.enabled) {
      return null;
    }

    await this.log('Connecting to database...');

    try {
      // Dynamic import for database connection
      const { db } = await import('../apps/server/db.ts');
      await this.log('✓ Database connected', 'success');
      return db;
    } catch (error) {
      await this.log(`✗ Database connection failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async validateDatabaseData(db) {
    await this.log('Validating database data...');

    const results = {
      tenants: { valid: 0, invalid: 0, errors: [] },
      staff: { valid: 0, invalid: 0, errors: [] },
      calls: { valid: 0, invalid: 0, errors: [] },
    };

    try {
      // Validate tenants
      const tenants = await db.select().from('tenants').limit(100);
      for (const tenant of tenants) {
        const isValid = this.validateData('dashboard', { tenant }, 'tenant');
        if (isValid) {
          results.tenants.valid++;
        } else {
          results.tenants.invalid++;
          results.tenants.errors.push({
            id: tenant.id,
            errors: this.ajv.errors || [],
          });
        }
      }

      // Validate staff
      const staff = await db.select().from('staff').limit(100);
      for (const member of staff) {
        const isValid = this.validateData('dashboard', member, 'staffMember');
        if (isValid) {
          results.staff.valid++;
        } else {
          results.staff.invalid++;
          results.staff.errors.push({
            id: member.id,
            errors: this.ajv.errors || [],
          });
        }
      }

      // Validate calls
      const calls = await db.select().from('calls').limit(100);
      for (const call of calls) {
        const isValid = this.validateData('dashboard', call, 'callRecord');
        if (isValid) {
          results.calls.valid++;
        } else {
          results.calls.invalid++;
          results.calls.errors.push({
            id: call.id,
            errors: this.ajv.errors || [],
          });
        }
      }
    } catch (error) {
      await this.log(`Database validation error: ${error.message}`, 'error');
      throw error;
    }

    return results;
  }

  async validateApiEndpoints() {
    if (!this.config.api.enabled) {
      return {};
    }

    await this.log('Validating API endpoints...');

    const results = {
      endpoints: {},
      summary: { total: 0, passed: 0, failed: 0 },
    };

    const testEndpoints = [
      { path: '/api/health', method: 'GET', expectSchema: 'api.response' },
      {
        path: '/api/saas-dashboard/analytics',
        method: 'GET',
        expectSchema: 'api.analytics.dashboard.response',
      },
      {
        path: '/api/calls',
        method: 'GET',
        expectSchema: 'api.calls.list.response',
      },
    ];

    for (const endpoint of testEndpoints) {
      results.summary.total++;

      try {
        const response = await this.makeApiRequest(endpoint);
        const isValid = this.validateApiResponse(
          response,
          endpoint.expectSchema
        );

        results.endpoints[endpoint.path] = {
          method: endpoint.method,
          status: response.status,
          valid: isValid,
          errors: isValid ? [] : this.ajv.errors || [],
        };

        if (isValid) {
          results.summary.passed++;
        } else {
          results.summary.failed++;
        }
      } catch (error) {
        results.endpoints[endpoint.path] = {
          method: endpoint.method,
          status: 'error',
          valid: false,
          errors: [{ message: error.message }],
        };
        results.summary.failed++;
      }
    }

    return results;
  }

  async makeApiRequest(endpoint) {
    const baseUrl = this.config.api.baseUrl || 'http://localhost:3000';
    const url = `${baseUrl}${endpoint.path}`;

    try {
      const response = await fetch(url, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token', // For testing
        },
        timeout: this.config.api.timeout,
      });

      const data = await response.json();
      return {
        status: response.status,
        data: data,
      };
    } catch (error) {
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  async validateData(schemaName, data, definition = null) {
    try {
      const schema = this.schemas.get(schemaName);
      if (!schema) {
        throw new Error(`Schema ${schemaName} not found`);
      }

      let validateFn;
      if (definition) {
        // Validate against a specific definition within the schema
        const defSchema = schema.definitions[definition];
        if (!defSchema) {
          throw new Error(
            `Definition ${definition} not found in schema ${schemaName}`
          );
        }
        validateFn = this.ajv.compile(defSchema);
      } else {
        validateFn = this.ajv.getSchema(schemaName);
      }

      if (!validateFn) {
        throw new Error(
          `Cannot create validator for ${schemaName}${definition ? `.${definition}` : ''}`
        );
      }

      return validateFn(data);
    } catch (error) {
      await this.log(`Validation error: ${error.message}`, 'error');
      return false;
    }
  }

  async validateApiResponse(response, schemaPath) {
    try {
      // Navigate to the correct schema definition
      const pathParts = schemaPath.split('.');
      let currentSchema = this.schemas.get('api');

      for (const part of pathParts) {
        if (currentSchema.properties && currentSchema.properties[part]) {
          currentSchema = currentSchema.properties[part];
        } else if (
          currentSchema.definitions &&
          currentSchema.definitions[part]
        ) {
          currentSchema = currentSchema.definitions[part];
        } else {
          throw new Error(`Schema path ${schemaPath} not found`);
        }
      }

      const validateFn = this.ajv.compile(currentSchema);
      return validateFn(response);
    } catch (error) {
      await this.log(`API validation error: ${error.message}`, 'error');
      return false;
    }
  }

  async generateReport(results) {
    await this.log('Generating validation report...');

    if (!this.config.reporting.enabled) {
      return;
    }

    try {
      await fs.mkdir(this.reportDir, { recursive: true });
    } catch {
      // Directory already exists
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportData = {
      timestamp: new Date().toISOString(),
      config: this.config,
      results: results,
      summary: this.generateSummary(results),
    };

    // Generate JSON report
    if (
      this.config.reporting.format === 'json' ||
      this.config.reporting.format === 'all'
    ) {
      const jsonPath = path.join(
        this.reportDir,
        `validation-${timestamp}.json`
      );
      await fs.writeFile(jsonPath, JSON.stringify(reportData, null, 2));
      await this.log(`✓ JSON report saved: ${jsonPath}`, 'success');
    }

    // Generate HTML report
    if (
      this.config.reporting.format === 'html' ||
      this.config.reporting.format === 'all'
    ) {
      const htmlPath = path.join(
        this.reportDir,
        `validation-${timestamp}.html`
      );
      const htmlContent = this.generateHtmlReport(reportData);
      await fs.writeFile(htmlPath, htmlContent);
      await this.log(`✓ HTML report saved: ${htmlPath}`, 'success');
    }

    // Generate text report
    if (
      this.config.reporting.format === 'text' ||
      this.config.reporting.format === 'all'
    ) {
      const textPath = path.join(this.reportDir, `validation-${timestamp}.txt`);
      const textContent = this.generateTextReport(reportData);
      await fs.writeFile(textPath, textContent);
      await this.log(`✓ Text report saved: ${textPath}`, 'success');
    }

    return reportData;
  }

  generateSummary(results) {
    const summary = {
      totalValidations: 0,
      totalErrors: 0,
      successRate: 0,
      categories: {},
    };

    // Database results
    if (results.database) {
      Object.keys(results.database).forEach(category => {
        const data = results.database[category];
        summary.totalValidations += data.valid + data.invalid;
        summary.totalErrors += data.invalid;
        summary.categories[category] = {
          total: data.valid + data.invalid,
          valid: data.valid,
          invalid: data.invalid,
          errorRate: (
            (data.invalid / (data.valid + data.invalid)) *
            100
          ).toFixed(2),
        };
      });
    }

    // API results
    if (results.api) {
      summary.totalValidations += results.api.summary.total;
      summary.totalErrors += results.api.summary.failed;
      summary.categories.api = {
        total: results.api.summary.total,
        valid: results.api.summary.passed,
        invalid: results.api.summary.failed,
        errorRate: (
          (results.api.summary.failed / results.api.summary.total) *
          100
        ).toFixed(2),
      };
    }

    summary.successRate =
      summary.totalValidations > 0
        ? (
          ((summary.totalValidations - summary.totalErrors) /
            summary.totalValidations) *
          100
        ).toFixed(2)
        : 100;

    return summary;
  }

  generateHtmlReport(reportData) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Runtime Validation Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .summary { display: flex; gap: 20px; margin-bottom: 20px; }
        .metric { background: #e7f3ff; padding: 15px; border-radius: 5px; flex: 1; text-align: center; }
        .metric.error { background: #ffe7e7; }
        .metric.success { background: #e7ffe7; }
        .section { margin-bottom: 30px; }
        .error { background: #ffe7e7; padding: 10px; border-radius: 3px; margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Runtime Validation Report</h1>
        <p>Generated: ${reportData.timestamp}</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <h3>Total Validations</h3>
            <div style="font-size: 24px;">${reportData.summary.totalValidations}</div>
        </div>
        <div class="metric ${reportData.summary.totalErrors > 0 ? 'error' : 'success'}">
            <h3>Total Errors</h3>
            <div style="font-size: 24px;">${reportData.summary.totalErrors}</div>
        </div>
        <div class="metric ${reportData.summary.successRate >= 95 ? 'success' : 'error'}">
            <h3>Success Rate</h3>
            <div style="font-size: 24px;">${reportData.summary.successRate}%</div>
        </div>
    </div>
    
    <div class="section">
        <h2>Category Breakdown</h2>
        <table>
            <tr>
                <th>Category</th>
                <th>Total</th>
                <th>Valid</th>
                <th>Invalid</th>
                <th>Error Rate</th>
            </tr>
            ${Object.entries(reportData.summary.categories)
        .map(
          ([category, data]) => `
            <tr>
                <td>${category}</td>
                <td>${data.total}</td>
                <td>${data.valid}</td>
                <td>${data.invalid}</td>
                <td>${data.errorRate}%</td>
            </tr>
            `
        )
        .join('')}
        </table>
    </div>
    
    <div class="section">
        <h2>Detailed Results</h2>
        <pre>${JSON.stringify(reportData.results, null, 2)}</pre>
    </div>
</body>
</html>
    `;
  }

  generateTextReport(reportData) {
    let report = '';
    report += `Runtime Validation Report\n`;
    report += `Generated: ${reportData.timestamp}\n`;
    report += `${'='.repeat(50)}\n\n`;

    report += `SUMMARY\n`;
    report += `Total Validations: ${reportData.summary.totalValidations}\n`;
    report += `Total Errors: ${reportData.summary.totalErrors}\n`;
    report += `Success Rate: ${reportData.summary.successRate}%\n\n`;

    report += `CATEGORY BREAKDOWN\n`;
    Object.entries(reportData.summary.categories).forEach(
      ([category, data]) => {
        report += `${category.toUpperCase()}:\n`;
        report += `  Total: ${data.total}\n`;
        report += `  Valid: ${data.valid}\n`;
        report += `  Invalid: ${data.invalid}\n`;
        report += `  Error Rate: ${data.errorRate}%\n\n`;
      }
    );

    if (this.config.reporting.includeDetails) {
      report += `DETAILED RESULTS\n`;
      report += `${'-'.repeat(30)}\n`;
      report += JSON.stringify(reportData.results, null, 2);
    }

    return report;
  }

  async runValidation() {
    await this.log('Starting runtime validation...');

    try {
      await this.loadSchemas();

      const results = {};

      // Database validation
      if (this.config.database.enabled) {
        const db = await this.connectDatabase();
        if (db) {
          results.database = await this.validateDatabaseData(db);
        }
      }

      // API validation
      if (this.config.api.enabled) {
        results.api = await this.validateApiEndpoints();
      }

      // Generate report
      const report = await this.generateReport(results);

      this.lastValidation = new Date();

      await this.log('✓ Runtime validation completed', 'success');
      return report;
    } catch (error) {
      await this.log(`✗ Runtime validation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async startMonitoring() {
    if (!this.config.monitoring.enabled) {
      await this.log('Monitoring is disabled', 'info');
      return;
    }

    await this.log(
      `Starting continuous monitoring (interval: ${this.config.monitoring.interval}ms)...`
    );

    const interval = setInterval(async () => {
      try {
        await this.runValidation();
      } catch (error) {
        await this.log(
          `Monitoring validation failed: ${error.message}`,
          'error'
        );
      }
    }, this.config.monitoring.interval);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      clearInterval(interval);
      this.log('Monitoring stopped', 'info');
      process.exit(0);
    });
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    continuous: args.includes('--continuous') || args.includes('-c'),
    help: args.includes('--help') || args.includes('-h'),
  };

  if (options.help) {
    console.log(`
Runtime Validation Script

Usage: node validate-runtime.js [options]

Options:
  --dry-run         Show what would be validated without running
  --verbose, -v     Show detailed output
  --continuous, -c  Run in continuous monitoring mode
  --help, -h        Show this help message

Examples:
  node validate-runtime.js                    # Run one-time validation
  node validate-runtime.js --continuous       # Start monitoring mode
  node validate-runtime.js --verbose          # Show detailed output
    `);
    return;
  }

  try {
    const validator = new RuntimeValidator(options);

    if (options.continuous) {
      await validator.startMonitoring();
    } else {
      const report = await validator.runValidation();

      console.log(chalk.green('\n✓ Runtime validation completed!'));
      console.log(`\nSummary:`);
      console.log(`  Total Validations: ${report.summary.totalValidations}`);
      console.log(`  Total Errors: ${report.summary.totalErrors}`);
      console.log(`  Success Rate: ${report.summary.successRate}%`);

      if (report.summary.totalErrors > 0) {
        console.log(
          chalk.yellow(
            '\n⚠ Validation errors detected. Check the generated report for details.'
          )
        );
      }
    }
  } catch (error) {
    console.error(chalk.red(`\n✗ Runtime validation failed: ${error.message}`));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

module.exports = { RuntimeValidator };
