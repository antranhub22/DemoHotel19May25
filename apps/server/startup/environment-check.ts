/**
 * ===============================================
 * 🚀 Environment Validation Startup Script
 * ===============================================
 *
 * This script validates the environment configuration
 * when the server starts up and provides warnings
 * for missing or misconfigured variables.
 */

import { logger } from '@shared/utils/logger';
import {
  validateEnvironment,
  getEnvironmentStatus,
  loadEnvironmentConfig,
  EnvironmentValidationError,
} from '../../../packages/config/environment';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function colorize(text: string, color: keyof typeof colors): string {
  return `${colors[color]}${text}${colors.reset}`;
}

function printStartupBanner(): void {
  logger.debug('', 'Component');
  console.log(colorize('🏨 Hotel Voice Assistant SaaS Platform', 'bright'));
  console.log(
    colorize('===============================================', 'cyan')
  );
  logger.debug('', 'Component');
}

function printEnvironmentSummary(): void {
  const config = loadEnvironmentConfig();
  const status = getEnvironmentStatus();

  console.log(colorize('📋 Environment Summary:', 'blue'));
  console.log(colorize('-'.repeat(30), 'blue'));
  console.log(`Environment: ${colorize(config.NODE_ENV, 'yellow')}`);
  console.log(`Port: ${colorize(config.PORT.toString(), 'yellow')}`);
  console.log(
    `Database: ${colorize(config.DATABASE_URL.includes('postgres') ? 'PostgreSQL' : 'SQLite', 'yellow')}`
  );
  console.log(`Domain: ${colorize(config.TALK2GO_DOMAIN, 'yellow')}`);
  logger.debug('', 'Component');

  // Feature status
  console.log(colorize('🎯 Feature Status:', 'blue'));
  console.log(
    `Basic Setup: ${status.basicSetup ? colorize('✅ Ready', 'green') : colorize('❌ Missing', 'red')}`
  );
  console.log(
    `SaaS Features: ${status.saasFeatures ? colorize('✅ Ready', 'green') : colorize('❌ Missing', 'red')}`
  );
  console.log(
    `Multi-language: ${status.multiLanguage ? colorize('✅ Enabled', 'green') : colorize('⚪ Disabled', 'yellow')}`
  );
  console.log(
    `Email Services: ${status.emailServices ? colorize('✅ Ready', 'green') : colorize('⚪ Not configured', 'yellow')}`
  );
  console.log(
    `Storage: ${status.storage ? colorize('✅ Ready', 'green') : colorize('⚪ Not configured', 'yellow')}`
  );
  console.log(
    `Monitoring: ${status.monitoring ? colorize('✅ Ready', 'green') : colorize('⚪ Not configured', 'yellow')}`
  );
  logger.debug('', 'Component');
}

function printMissingVariables(missing: string[]): void {
  if (missing.length === 0) return;

  console.log(colorize('❌ Missing Environment Variables:', 'red'));
  console.log(colorize('-'.repeat(35), 'red'));

  missing.forEach(varName => {
    console.log(`  • ${colorize(varName, 'red')}`);
  });

  logger.debug('', 'Component');
  console.log(colorize('💡 To fix these issues:', 'yellow'));
  logger.debug('  1. Run: npm run env:generate', 'Component');
  logger.debug('  2. Copy the generated template to your .env file', 'Component');
  logger.debug('  3. Fill in your actual API keys and values', 'Component');
  logger.debug('  4. Restart the server', 'Component');
  logger.debug('', 'Component');
}

function printWarnings(warnings: string[]): void {
  if (warnings.length === 0) return;

  console.log(colorize('⚠️  Warnings:', 'yellow'));
  console.log(colorize('-'.repeat(15), 'yellow'));

  warnings.forEach(warning => {
    console.log(`  • ${colorize(warning, 'yellow')}`);
  });

  logger.debug('', 'Component');
}

function printQuickCommands(): void {
  console.log(colorize('🔧 Quick Commands:', 'cyan'));
  console.log(colorize('-'.repeat(20), 'cyan'));
  logger.debug('  npm run env:status          - Check environment status', 'Component');
  logger.debug('  npm run env:validate        - Validate basic setup', 'Component');
  logger.debug('  npm run env:validate-saas   - Validate SaaS features', 'Component');
  logger.debug('  npm run env:health          - Complete health check', 'Component');
  logger.debug('  npm run env:generate        - Generate .env template', 'Component');
  logger.debug('', 'Component');
}

function printReadyMessage(): void {
  console.log(colorize('🚀 Server Starting...', 'green'));
  console.log(
    colorize('===============================================', 'cyan')
  );
  logger.debug('', 'Component');
}

/**
 * Main environment validation function
 */
export async function validateEnvironmentOnStartup(): Promise<void> {
  try {
    printStartupBanner();

    // Basic validation
    try {
      validateEnvironment(false);
    } catch (error) {
      if (error instanceof EnvironmentValidationError) {
        console.log(colorize('❌ Basic environment validation failed!', 'red'));
        printMissingVariables(error.missingVars);
        console.log(
          colorize(
            '⚠️  Server will continue with limited functionality',
            'yellow'
          )
        );
        logger.debug('', 'Component');
      } else {
        throw error;
      }
    }

    // SaaS features validation (non-blocking)
    try {
      validateEnvironment(true);
    } catch (error) {
      if (error instanceof EnvironmentValidationError) {
        console.log(
          colorize('⚠️  SaaS features are not fully configured', 'yellow')
        );
        console.log(
          colorize('   Some advanced features may be disabled', 'yellow')
        );
        logger.debug('', 'Component');
      } else {
        throw error;
      }
    }

    // Print environment summary
    printEnvironmentSummary();

    // Print warnings
    const status = getEnvironmentStatus();
    if (status.warnings.length > 0) {
      printWarnings(status.warnings);
    }

    // Print quick commands
    printQuickCommands();

    // Ready message
    printReadyMessage();
  } catch (error) {
    console.error(colorize('💥 Critical environment error:', 'red'));
    console.error(colorize((error as Error).message, 'red'));
    logger.debug('', 'Component');
    console.log(
      colorize('🔧 Please check your environment configuration:', 'yellow')
    );
    logger.debug('  1. Run: npm run env:status', 'Component');
    logger.debug('  2. Run: npm run env:validate', 'Component');
    logger.debug('  3. Check the Environment Setup Guide: docs/ENVIRONMENT_SETUP.md', 'Component');
    logger.debug('', 'Component');
    process.exit(1);
  }
}

/**
 * Validate environment in production mode
 */
export async function validateProductionEnvironment(): Promise<void> {
  const config = loadEnvironmentConfig();

  if (config.NODE_ENV !== 'production') {
    return;
  }

  console.log(colorize('🔒 Production Environment Validation', 'blue'));
  console.log(colorize('=====================================', 'blue'));

  const productionChecks = [
    {
      name: 'JWT Secret',
      check: () =>
        config.JWT_SECRET !== 'fallback-jwt-secret-change-in-production',
      critical: true,
      message: 'Using default JWT secret in production is not secure',
    },
    {
      name: 'Database URL',
      check: () => config.DATABASE_URL.includes('postgres'),
      critical: true,
      message: 'Production should use PostgreSQL, not SQLite',
    },
    {
      name: 'SSL Configuration',
      check: () => !!(config.SSL_CERT_PATH && config.SSL_KEY_PATH),
      critical: false,
      message: 'SSL certificates not configured',
    },
    {
      name: 'Email Service',
      check: () =>
        !!(
          config.GMAIL_APP_PASSWORD ||
          (config.MAILJET_API_KEY && config.MAILJET_SECRET_KEY)
        ),
      critical: false,
      message: 'Email service not configured',
    },
    {
      name: 'Monitoring',
      check: () => !!(config.SENTRY_DSN || config.GOOGLE_ANALYTICS_ID),
      critical: false,
      message: 'No monitoring service configured',
    },
  ];

  const failures: string[] = [];
  const warnings: string[] = [];

  for (const check of productionChecks) {
    if (!check.check()) {
      if (check.critical) {
        failures.push(`❌ ${check.name}: ${check.message}`);
      } else {
        warnings.push(`⚠️  ${check.name}: ${check.message}`);
      }
    } else {
      logger.debug('✅ ${check.name}: OK', 'Component');
    }
  }

  if (failures.length > 0) {
    logger.debug('', 'Component');
    console.log(colorize('💥 Critical Production Issues:', 'red'));
    failures.forEach(failure => logger.debug(`  ${failure}`, 'Component'));
    logger.debug('', 'Component');
    console.log(
      colorize(
        '🔧 Please fix these issues before deploying to production',
        'yellow'
      )
    );
    process.exit(1);
  }

  if (warnings.length > 0) {
    logger.debug('', 'Component');
    console.log(colorize('⚠️  Production Warnings:', 'yellow'));
    warnings.forEach(warning => logger.debug(`  ${warning}`, 'Component'));
    logger.debug('', 'Component');
  }

  console.log(colorize('✅ Production environment validation passed', 'green'));
  logger.debug('', 'Component');
}

/**
 * Quick environment check for development
 */
export function quickEnvironmentCheck(): boolean {
  try {
    validateEnvironment(false);
    return true;
  } catch (error) {
    if (error instanceof EnvironmentValidationError) {
      console.log(
        colorize(
          '⚠️  Environment issues detected. Run: npm run env:validate',
          'yellow'
        )
      );
      return false;
    }
    throw error;
  }
}

/**
 * Print environment status in compact format
 */
export function printCompactEnvironmentStatus(): void {
  const status = getEnvironmentStatus();
  const _config = loadEnvironmentConfig();

  const _statusIcon = status.basicSetup ? '✅' : '❌';
  const _saasIcon = status.saasFeatures ? '✅' : '⚪';

  logger.debug(`${_statusIcon} Environment: ${_config.NODE_ENV} | SaaS: ${_saasIcon} | Port: ${_config.PORT}`, 'Component');

  if (status.missing.length > 0) {
    console.log(colorize(`   Missing: ${status.missing.join(', ')}`, 'red'));
  }

  if (status.warnings.length > 0) {
    console.log(colorize(`   Warnings: ${status.warnings.length}`, 'yellow'));
  }
}

// Export startup function as default
export default validateEnvironmentOnStartup;
