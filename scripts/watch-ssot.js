#!/usr/bin/env node

/**
 * SSOT File Watcher
 * Watches SSOT files for changes and automatically updates dependencies
 * Usage: node scripts/watch-ssot.js [--debounce=ms] [--dry-run]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  watchPaths: [
    path.join(__dirname, '../packages/shared/db/schema.ts'),
    path.join(__dirname, '../packages/shared/validation/schemas.ts'),
    path.join(__dirname, '../apps/server/routes'),
    path.join(__dirname, '../packages/types')
  ],
  ignorePaths: [
    'node_modules',
    '.git',
    'dist',
    'build',
    'backup',
    '*.test.ts',
    '*.spec.ts',
    '*.test.js',
    '*.spec.js'
  ],
  debounceMs: parseInt(process.argv.find(arg => arg.startsWith('--debounce='))?.split('=')[1]) || 1000,
  dryRun: process.argv.includes('--dry-run'),
  logPath: path.join(__dirname, '../watch-ssot.log')
};

// Action mappings for different file types
const FILE_ACTIONS = {
  'packages/shared/db/schema.ts': [
    'generate-types',
    'validate-ssot',
    'update-frontend-types'
  ],
  'packages/shared/validation/schemas.ts': [
    'validate-ssot',
    'generate-api-docs'
  ],
  'apps/server/routes/*.ts': [
    'generate-api-docs',
    'validate-ssot'
  ],
  'packages/types/*.ts': [
    'update-frontend-types'
  ]
};

class SSOTWatcher {
  constructor() {
    this.watchers = new Map();
    this.debounceTimers = new Map();
    this.changeQueue = new Map();
    this.isProcessing = false;
    this.lastProcessTime = 0;
    this.stats = {
      filesWatched: 0,
      changesDetected: 0,
      actionsExecuted: 0,
      errors: 0
    };
  }

  async startWatching() {
    console.log('🔍 SSOT Watcher started');
    console.log(`📁 Watching ${CONFIG.watchPaths.length} paths...`);
    console.log(`⏱️ Debounce: ${CONFIG.debounceMs}ms`);
    console.log(`🎭 Dry run: ${CONFIG.dryRun ? 'Yes' : 'No'}`);
    
    try {
      // Create log file
      this.initializeLogging();
      
      // Setup watchers for each path
      for (const watchPath of CONFIG.watchPaths) {
        await this.setupWatcher(watchPath);
      }
      
      // Setup graceful shutdown
      this.setupGracefulShutdown();
      
      // Log initial state
      this.logMessage('info', `SSOT Watcher initialized - watching ${this.stats.filesWatched} files`);
      
      console.log(`✅ Watching ${this.stats.filesWatched} files for SSOT changes...`);
      console.log('📝 Press Ctrl+C to stop watching');
      
    } catch (error) {
      console.error('❌ Failed to start SSOT watcher:', error);
      process.exit(1);
    }
  }

  initializeLogging() {
    // Ensure log directory exists
    const logDir = path.dirname(CONFIG.logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Initialize log file
    const logHeader = `# SSOT Watcher Log\nStarted: ${new Date().toISOString()}\nPID: ${process.pid}\n\n`;
    fs.writeFileSync(CONFIG.logPath, logHeader);
  }

  async setupWatcher(watchPath) {
    try {
      const stats = fs.statSync(watchPath);
      
      if (stats.isFile()) {
        await this.watchFile(watchPath);
      } else if (stats.isDirectory()) {
        await this.watchDirectory(watchPath);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.warn(`⚠️ Could not watch ${watchPath}: ${error.message}`);
      }
    }
  }

  async watchFile(filePath) {
    const relativePath = path.relative(process.cwd(), filePath);
    
    if (this.shouldIgnoreFile(filePath)) {
      return;
    }
    
    try {
      const watcher = fs.watch(filePath, (eventType, filename) => {
        if (eventType === 'change') {
          this.handleFileChange(filePath);
        }
      });
      
      this.watchers.set(filePath, watcher);
      this.stats.filesWatched++;
      
      console.log(`  📄 ${relativePath}`);
    } catch (error) {
      console.warn(`  ⚠️ Could not watch file ${relativePath}: ${error.message}`);
    }
  }

  async watchDirectory(dirPath) {
    const relativePath = path.relative(process.cwd(), dirPath);
    console.log(`📁 Setting up directory watcher: ${relativePath}`);
    
    try {
      // Watch directory for new/deleted files
      const dirWatcher = fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
        if (filename) {
          const fullPath = path.join(dirPath, filename);
          
          if (eventType === 'change' && this.isRelevantFile(fullPath)) {
            this.handleFileChange(fullPath);
          } else if (eventType === 'rename') {
            // Handle file creation/deletion
            this.handleFileRename(fullPath);
          }
        }
      });
      
      this.watchers.set(dirPath, dirWatcher);
      
      // Also watch existing files in directory
      const files = this.getRelevantFiles(dirPath);
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        this.stats.filesWatched++;
        console.log(`  📄 ${path.relative(process.cwd(), filePath)}`);
      }
      
    } catch (error) {
      console.warn(`  ⚠️ Could not watch directory ${relativePath}: ${error.message}`);
    }
  }

  getRelevantFiles(dirPath) {
    try {
      return fs.readdirSync(dirPath, { recursive: true })
        .filter(file => {
          const fullPath = path.join(dirPath, file);
          return fs.statSync(fullPath).isFile() && this.isRelevantFile(fullPath);
        });
    } catch (error) {
      return [];
    }
  }

  isRelevantFile(filePath) {
    const ext = path.extname(filePath);
    const relevantExtensions = ['.ts', '.js', '.json'];
    
    return relevantExtensions.includes(ext) && !this.shouldIgnoreFile(filePath);
  }

  shouldIgnoreFile(filePath) {
    const relativePath = path.relative(process.cwd(), filePath);
    
    return CONFIG.ignorePaths.some(pattern => {
      if (pattern.includes('*')) {
        // Simple glob pattern matching
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(relativePath);
      }
      return relativePath.includes(pattern);
    });
  }

  handleFileChange(filePath) {
    const relativePath = path.relative(process.cwd(), filePath);
    
    this.stats.changesDetected++;
    this.logMessage('info', `File changed: ${relativePath}`);
    
    console.log(`🔄 Change detected: ${relativePath}`);
    
    // Add to change queue with debouncing
    this.debounceChange(filePath);
  }

  handleFileRename(filePath) {
    const relativePath = path.relative(process.cwd(), filePath);
    
    try {
      if (fs.existsSync(filePath)) {
        // File was created
        this.logMessage('info', `File created: ${relativePath}`);
        console.log(`➕ File created: ${relativePath}`);
        this.handleFileChange(filePath);
      } else {
        // File was deleted
        this.logMessage('info', `File deleted: ${relativePath}`);
        console.log(`➖ File deleted: ${relativePath}`);
        // Handle file deletion if needed
      }
    } catch (error) {
      this.logMessage('error', `Error handling file rename: ${error.message}`);
    }
  }

  debounceChange(filePath) {
    const key = filePath;
    
    // Clear existing timer
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }
    
    // Set new timer
    const timer = setTimeout(async () => {
      this.debounceTimers.delete(key);
      await this.processChange(filePath);
    }, CONFIG.debounceMs);
    
    this.debounceTimers.set(key, timer);
  }

  async processChange(filePath) {
    if (this.isProcessing) {
      // Queue the change for later processing
      this.changeQueue.set(filePath, Date.now());
      return;
    }
    
    this.isProcessing = true;
    this.lastProcessTime = Date.now();
    
    try {
      const relativePath = path.relative(process.cwd(), filePath);
      const actions = this.getActionsForFile(relativePath);
      
      if (actions.length === 0) {
        console.log(`ℹ️ No actions configured for: ${relativePath}`);
        return;
      }
      
      console.log(`🚀 Processing ${actions.length} actions for: ${relativePath}`);
      this.logMessage('info', `Processing actions: ${actions.join(', ')} for ${relativePath}`);
      
      for (const action of actions) {
        await this.executeAction(action, filePath);
      }
      
      console.log(`✅ Successfully processed changes for: ${relativePath}`);
      
    } catch (error) {
      this.stats.errors++;
      this.logMessage('error', `Error processing change: ${error.message}`);
      console.error(`❌ Error processing change: ${error.message}`);
    } finally {
      this.isProcessing = false;
      
      // Process any queued changes
      await this.processQueuedChanges();
    }
  }

  getActionsForFile(relativePath) {
    const actions = [];
    
    for (const [pattern, patternActions] of Object.entries(FILE_ACTIONS)) {
      if (this.matchesPattern(relativePath, pattern)) {
        actions.push(...patternActions);
      }
    }
    
    // Remove duplicates
    return [...new Set(actions)];
  }

  matchesPattern(filePath, pattern) {
    if (pattern.includes('*')) {
      // Simple glob pattern matching
      const regex = new RegExp(pattern.replace(/\*/g, '[^/]*'));
      return regex.test(filePath);
    }
    
    return filePath === pattern || filePath.startsWith(pattern);
  }

  async executeAction(action, filePath) {
    const actionCommands = {
      'generate-types': 'node scripts/generate-types.js',
      'generate-api-docs': 'node scripts/generate-api-docs.js',
      'validate-ssot': 'node scripts/validate-ssot.js',
      'update-dependencies': 'node scripts/update-dependencies.js',
      'update-frontend-types': 'node -e "console.log(\'🎨 Frontend types sync would run here\')"'
    };
    
    const command = actionCommands[action];
    if (!command) {
      console.warn(`⚠️ Unknown action: ${action}`);
      return;
    }
    
    try {
      console.log(`  🔧 Executing: ${action}`);
      
      if (CONFIG.dryRun) {
        console.log(`  🎭 [DRY RUN] Would execute: ${command}`);
      } else {
        const startTime = Date.now();
        execSync(command, { 
          stdio: ['pipe', 'pipe', 'pipe'],
          encoding: 'utf8',
          timeout: 60000 // 1 minute timeout
        });
        const duration = Date.now() - startTime;
        
        this.stats.actionsExecuted++;
        console.log(`  ✅ ${action} completed (${duration}ms)`);
        this.logMessage('info', `Action completed: ${action} (${duration}ms)`);
      }
      
    } catch (error) {
      this.stats.errors++;
      console.error(`  ❌ ${action} failed: ${error.message}`);
      this.logMessage('error', `Action failed: ${action} - ${error.message}`);
      
      // Continue with other actions even if one fails
    }
  }

  async processQueuedChanges() {
    if (this.changeQueue.size === 0) return;
    
    console.log(`📋 Processing ${this.changeQueue.size} queued changes...`);
    
    const queuedChanges = Array.from(this.changeQueue.entries());
    this.changeQueue.clear();
    
    for (const [filePath, timestamp] of queuedChanges) {
      await this.processChange(filePath);
    }
  }

  setupGracefulShutdown() {
    const cleanup = () => {
      console.log('\n🛑 Stopping SSOT watcher...');
      
      // Clear all timers
      for (const timer of this.debounceTimers.values()) {
        clearTimeout(timer);
      }
      
      // Close all watchers
      for (const watcher of this.watchers.values()) {
        watcher.close();
      }
      
      // Log final statistics
      this.logFinalStats();
      
      console.log('✅ SSOT watcher stopped');
      process.exit(0);
    };
    
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('SIGUSR2', cleanup); // nodemon restart
  }

  logMessage(level, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${level.toUpperCase()}: ${message}\n`;
    
    try {
      fs.appendFileSync(CONFIG.logPath, logEntry);
    } catch (error) {
      // Ignore logging errors
    }
  }

  logFinalStats() {
    const runtime = Date.now() - this.stats.startTime;
    const stats = `
# Final Statistics
Runtime: ${Math.round(runtime / 1000)}s
Files watched: ${this.stats.filesWatched}
Changes detected: ${this.stats.changesDetected}
Actions executed: ${this.stats.actionsExecuted}
Errors: ${this.stats.errors}
Stopped: ${new Date().toISOString()}
`;
    
    this.logMessage('info', 'SSOT Watcher stopped');
    
    try {
      fs.appendFileSync(CONFIG.logPath, stats);
    } catch (error) {
      // Ignore logging errors
    }
    
    console.log('\n📊 Final Statistics:');
    console.log(`  Files watched: ${this.stats.filesWatched}`);
    console.log(`  Changes detected: ${this.stats.changesDetected}`);
    console.log(`  Actions executed: ${this.stats.actionsExecuted}`);
    console.log(`  Errors: ${this.stats.errors}`);
    console.log(`  Runtime: ${Math.round(runtime / 1000)}s`);
  }

  // Public method to get current statistics
  getStats() {
    return {
      ...this.stats,
      isProcessing: this.isProcessing,
      queuedChanges: this.changeQueue.size,
      activeWatchers: this.watchers.size
    };
  }
}

// Helper function to check if another watcher is running
function checkExistingWatcher() {
  try {
    const lockFile = path.join(__dirname, '../.ssot-watcher.lock');
    
    if (fs.existsSync(lockFile)) {
      const lockData = fs.readFileSync(lockFile, 'utf8');
      const { pid, startTime } = JSON.parse(lockData);
      
      // Check if process is still running
      try {
        process.kill(pid, 0); // Signal 0 checks if process exists
        console.warn(`⚠️ Another SSOT watcher is already running (PID: ${pid})`);
        console.warn('Use `pkill -f watch-ssot.js` to stop it first');
        process.exit(1);
      } catch (error) {
        // Process doesn't exist, remove stale lock file
        fs.unlinkSync(lockFile);
      }
    }
    
    // Create lock file
    fs.writeFileSync(lockFile, JSON.stringify({
      pid: process.pid,
      startTime: Date.now()
    }));
    
    // Clean up lock file on exit
    process.on('exit', () => {
      try {
        fs.unlinkSync(lockFile);
      } catch (error) {
        // Ignore cleanup errors
      }
    });
    
  } catch (error) {
    console.warn('⚠️ Could not create lock file:', error.message);
  }
}

// Main execution
if (require.main === module) {
  // Check for existing watcher
  checkExistingWatcher();
  
  // Start the watcher
  const watcher = new SSOTWatcher();
  watcher.stats.startTime = Date.now();
  
  watcher.startWatching().catch(error => {
    console.error('❌ SSOT watcher error:', error);
    process.exit(1);
  });
}

module.exports = SSOTWatcher; 