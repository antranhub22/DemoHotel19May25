// ============================================
// MODULE LIFECYCLE INITIALIZATION - v2.0
// ============================================
// Server startup script for initializing module lifecycle management system
// Registers modules, starts lifecycle monitoring, and handles graceful shutdown

import { ModuleLifecycleManager } from '@server/shared/ModuleLifecycleManager';
import { logger } from '@shared/utils/logger';

// Import modules to trigger their auto-registration
import '@server/modules/analytics-module';
import '@server/modules/assistant-module';
import '@server/modules/request-module';
import '@server/modules/tenant-module'; // Core module - must load first

/**
 * Initialize the module lifecycle management system
 * This should be called during server startup
 */
export async function initializeModuleLifecycle(): Promise<void> {
  try {
    logger.info(
      '🔄 [ModuleLifecycle Init] Initializing module lifecycle system...',
      'ModuleLifecycleInit'
    );

    // Give modules a moment to auto-register
    await new Promise(resolve => setTimeout(resolve, 100));

    // Start all modules in dependency order
    await ModuleLifecycleManager.startAllModules();

    // Get system health after startup
    const systemHealth = ModuleLifecycleManager.getSystemHealth();

    logger.success(
      '🎉 [ModuleLifecycle Init] Module lifecycle system initialized successfully',
      'ModuleLifecycleInit',
      {
        totalModules: systemHealth.totalModules,
        runningModules: systemHealth.runningModules,
        overallStatus: systemHealth.overallStatus,
      }
    );

    // Setup graceful shutdown handlers
    setupGracefulShutdown();
  } catch (error) {
    logger.error(
      '❌ [ModuleLifecycle Init] Failed to initialize module lifecycle system',
      'ModuleLifecycleInit',
      error
    );
    throw error;
  }
}

/**
 * Setup graceful shutdown handlers for the module lifecycle system
 */
function setupGracefulShutdown(): void {
  const shutdown = async (signal: string) => {
    logger.info(
      `🛑 [ModuleLifecycle Init] Received ${signal}, initiating graceful shutdown...`,
      'ModuleLifecycleInit'
    );

    try {
      // Stop all modules gracefully
      await ModuleLifecycleManager.stopAllModules();

      logger.success(
        '✅ [ModuleLifecycle Init] Graceful shutdown completed',
        'ModuleLifecycleInit'
      );

      process.exit(0);
    } catch (error) {
      logger.error(
        '❌ [ModuleLifecycle Init] Error during graceful shutdown',
        'ModuleLifecycleInit',
        error
      );
      process.exit(1);
    }
  };

  // Handle various shutdown signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGHUP', () => shutdown('SIGHUP'));

  // Handle uncaught exceptions
  process.on('uncaughtException', error => {
    logger.error(
      '💀 [ModuleLifecycle Init] Uncaught exception, forcing shutdown',
      'ModuleLifecycleInit',
      error
    );
    shutdown('uncaughtException');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error(
      '💀 [ModuleLifecycle Init] Unhandled promise rejection, forcing shutdown',
      'ModuleLifecycleInit',
      { reason, promise }
    );
    shutdown('unhandledRejection');
  });

  logger.debug(
    '🛡️ [ModuleLifecycle Init] Graceful shutdown handlers registered',
    'ModuleLifecycleInit'
  );
}

/**
 * Get current module lifecycle status for debugging
 */
export function getModuleLifecycleStatus(): any {
  try {
    const systemHealth = ModuleLifecycleManager.getSystemHealth();
    const diagnostics = ModuleLifecycleManager.getDiagnostics();

    return {
      systemHealth,
      diagnostics,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error(
      '❌ [ModuleLifecycle Init] Failed to get status',
      'ModuleLifecycleInit',
      error
    );
    return {
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Force restart of all modules (for emergency situations)
 */
export async function restartAllModules(): Promise<void> {
  try {
    logger.warn(
      '🔄 [ModuleLifecycle Init] Force restarting all modules...',
      'ModuleLifecycleInit'
    );

    // Stop all modules first
    await ModuleLifecycleManager.stopAllModules();

    // Wait a moment for cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Start all modules again
    await ModuleLifecycleManager.startAllModules();

    const systemHealth = ModuleLifecycleManager.getSystemHealth();

    logger.success(
      '✅ [ModuleLifecycle Init] All modules restarted successfully',
      'ModuleLifecycleInit',
      {
        overallStatus: systemHealth.overallStatus,
        runningModules: systemHealth.runningModules,
      }
    );
  } catch (error) {
    logger.error(
      '❌ [ModuleLifecycle Init] Failed to restart modules',
      'ModuleLifecycleInit',
      error
    );
    throw error;
  }
}
