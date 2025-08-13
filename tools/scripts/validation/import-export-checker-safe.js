// ============================================================================
// 🛡️ MEMORY-SAFE IMPORT/EXPORT CHECKER - Prevents memory issues with large files
// ============================================================================

const fs = require("fs");
const path = require("path");
const readline = require("readline");

// ============================================================================
// SAFE FILE READING CONFIGURATION
// ============================================================================

const SAFE_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB max per file
  chunkSize: 64 * 1024, // 64KB chunks
  maxFilesInMemory: 100, // Max files to keep in memory
  streamThreshold: 1024 * 1024, // 1MB - files larger than this will be streamed
};

// ============================================================================
// MEMORY-SAFE FILE PARSER
// ============================================================================

class SafeImportExportParser {
  constructor() {
    this.filesProcessed = 0;
    this.memoryUsage = new Map();
  }

  /**
   * Parse file safely - streams large files, loads small ones
   */
  async parseFile(filePath, options = {}) {
    try {
      const stats = await fs.promises.stat(filePath);

      // Skip very large files
      if (stats.size > SAFE_CONFIG.maxFileSize) {
        console.warn(
          `⚠️ Skipping large file ${filePath} (${this.formatBytes(stats.size)})`,
        );
        return { imports: [], exports: [], skipped: true, reason: "too_large" };
      }

      // Stream large files, load small ones
      if (stats.size > SAFE_CONFIG.streamThreshold) {
        return await this.parseFileStream(filePath, stats.size);
      } else {
        return await this.parseFileMemory(filePath);
      }
    } catch (error) {
      console.warn(`⚠️ Error processing ${filePath}: ${error.message}`);
      return { imports: [], exports: [], error: error.message };
    }
  }

  /**
   * Parse small files in memory (safe)
   */
  async parseFileMemory(filePath) {
    try {
      const content = await fs.promises.readFile(filePath, "utf-8");
      const fileInfo = this.parseContent(content, filePath);

      // Track memory usage
      this.memoryUsage.set(filePath, content.length);
      this.filesProcessed++;

      return fileInfo;
    } catch (error) {
      return { imports: [], exports: [], error: error.message };
    }
  }

  /**
   * Parse large files using streaming (memory safe)
   */
  async parseFileStream(filePath, fileSize) {
    return new Promise((resolve, reject) => {
      const imports = [];
      const exports = [];
      let lineNumber = 0;
      let chunks = [];
      let totalSize = 0;

      console.log(
        `📤 Streaming large file ${filePath} (${this.formatBytes(fileSize)})`,
      );

      const fileStream = fs.createReadStream(filePath, {
        encoding: "utf-8",
        highWaterMark: SAFE_CONFIG.chunkSize,
      });

      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });

      rl.on("line", (line) => {
        lineNumber++;
        totalSize += Buffer.byteLength(line, "utf-8");

        // Parse imports and exports from line
        const lineImports = this.extractImportsFromLine(line, lineNumber);
        const lineExports = this.extractExportsFromLine(line, lineNumber);

        imports.push(...lineImports);
        exports.push(...lineExports);

        // Memory safety check
        if (totalSize > SAFE_CONFIG.maxFileSize) {
          rl.close();
          resolve({
            imports,
            exports,
            partial: true,
            reason: "size_limit_reached",
            linesProcessed: lineNumber,
          });
        }
      });

      rl.on("close", () => {
        resolve({
          imports,
          exports,
          linesProcessed: lineNumber,
          bytesProcessed: totalSize,
          streamed: true,
        });
      });

      rl.on("error", (error) => {
        reject(error);
      });

      // Timeout protection
      setTimeout(() => {
        rl.close();
        reject(new Error("Stream timeout"));
      }, 30000); // 30 second timeout
    });
  }

  /**
   * Parse content for imports and exports
   */
  parseContent(content, filePath) {
    const lines = content.split("\n");
    const imports = [];
    const exports = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Extract imports and exports
      imports.push(...this.extractImportsFromLine(line, lineNumber));
      exports.push(...this.extractExportsFromLine(line, lineNumber));
    }

    return {
      imports,
      exports,
      linesProcessed: lines.length,
      bytesProcessed: content.length,
    };
  }

  /**
   * Extract imports from a single line
   */
  extractImportsFromLine(line, lineNumber) {
    const imports = [];

    // Simple regex patterns for imports
    const importPatterns = [
      /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g,
      /import\s+['"`]([^'"`]+)['"`]/g,
      /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    ];

    for (const pattern of importPatterns) {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        imports.push({
          module: match[1],
          line: lineNumber,
          type: line.includes("require") ? "require" : "import",
        });
      }
    }

    return imports;
  }

  /**
   * Extract exports from a single line
   */
  extractExportsFromLine(line, lineNumber) {
    const exports = [];

    // Simple regex patterns for exports
    const exportPatterns = [
      /export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)/g,
      /export\s*\{\s*([^}]+)\s*\}/g,
      /module\.exports\s*=\s*(\w+)/g,
    ];

    for (const pattern of exportPatterns) {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        if (pattern.source.includes("{")) {
          // Handle named exports
          const names = match[1].split(",").map((n) => n.trim());
          for (const name of names) {
            exports.push({
              name: name.replace(/\s+as\s+\w+/, "").trim(),
              line: lineNumber,
              type: "named",
            });
          }
        } else {
          exports.push({
            name: match[1],
            line: lineNumber,
            type: line.includes("default") ? "default" : "named",
          });
        }
      }
    }

    return exports;
  }

  /**
   * Format bytes for display
   */
  formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStats() {
    const totalMemory = Array.from(this.memoryUsage.values()).reduce(
      (sum, size) => sum + size,
      0,
    );
    return {
      filesInMemory: this.memoryUsage.size,
      totalMemoryUsage: this.formatBytes(totalMemory),
      filesProcessed: this.filesProcessed,
      averageFileSize: this.formatBytes(
        totalMemory / this.memoryUsage.size || 0,
      ),
    };
  }

  /**
   * Cleanup memory usage
   */
  cleanup() {
    this.memoryUsage.clear();
    console.log("🧹 Memory usage cleared");
  }
}

// ============================================================================
// MEMORY-SAFE ANALYZER
// ============================================================================

class SafeImportExportAnalyzer {
  constructor() {
    this.parser = new SafeImportExportParser();
    this.results = {
      files: new Map(),
      imports: new Map(),
      exports: new Map(),
      stats: {
        totalFiles: 0,
        skippedFiles: 0,
        streamedFiles: 0,
        totalImports: 0,
        totalExports: 0,
        memoryUsage: 0,
      },
    };
  }

  /**
   * Find files safely with memory limits
   */
  async findFiles() {
    const extensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];
    const files = [];
    const maxFiles = 1000; // Limit total files processed

    const walkDir = async (dir, depth = 0) => {
      if (depth > 10) return; // Prevent infinite recursion
      if (files.length >= maxFiles) return; // Limit total files

      try {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          if (files.length >= maxFiles) break;

          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            if (
              !entry.name.startsWith(".") &&
              !entry.name.includes("node_modules") &&
              !entry.name.includes("dist") &&
              !entry.name.includes("build")
            ) {
              await walkDir(fullPath, depth + 1);
            }
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            if (extensions.includes(ext)) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️ Cannot read directory ${dir}: ${error.message}`);
      }
    };

    await walkDir(process.cwd());
    return files;
  }

  /**
   * Process files with memory management
   */
  async processFiles() {
    console.log("🔍 Finding files...");
    const files = await this.findFiles();

    console.log(`📂 Found ${files.length} files to analyze`);
    console.log("🔄 Processing files (memory-safe mode)...");

    let processed = 0;
    const batchSize = 10; // Process in small batches

    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);

      // Process batch in parallel
      const batchPromises = batch.map((filePath) => this.processFile(filePath));
      await Promise.allSettled(batchPromises);

      processed += batch.length;

      // Progress reporting
      if (processed % 50 === 0) {
        console.log(`📈 Processed ${processed}/${files.length} files`);
        this.reportMemoryUsage();
      }

      // Memory cleanup every 100 files
      if (processed % 100 === 0) {
        this.cleanup();
      }
    }

    console.log("✅ File processing completed");
    this.reportFinalStats();
  }

  /**
   * Process a single file safely
   */
  async processFile(filePath) {
    try {
      const fileInfo = await this.parser.parseFile(filePath);

      if (fileInfo.error) {
        console.warn(`⚠️ Error processing ${filePath}: ${fileInfo.error}`);
        return;
      }

      if (fileInfo.skipped) {
        this.results.stats.skippedFiles++;
        return;
      }

      if (fileInfo.streamed) {
        this.results.stats.streamedFiles++;
      }

      // Store results
      this.results.files.set(filePath, fileInfo);
      this.results.stats.totalFiles++;
      this.results.stats.totalImports += fileInfo.imports.length;
      this.results.stats.totalExports += fileInfo.exports.length;

      // Store imports and exports in global maps
      if (fileInfo.imports.length > 0) {
        this.results.imports.set(filePath, fileInfo.imports);
      }

      if (fileInfo.exports.length > 0) {
        this.results.exports.set(filePath, fileInfo.exports);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to process ${filePath}: ${error.message}`);
    }
  }

  /**
   * Report memory usage
   */
  reportMemoryUsage() {
    const stats = this.parser.getMemoryStats();
    const memUsage = process.memoryUsage();

    console.log(
      `💾 Memory: Heap ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB, Files: ${stats.filesInMemory}, Avg: ${stats.averageFileSize}`,
    );
  }

  /**
   * Cleanup memory
   */
  cleanup() {
    this.parser.cleanup();
    if (global.gc) {
      global.gc();
    }
  }

  /**
   * Report final statistics
   */
  reportFinalStats() {
    const stats = this.results.stats;
    console.log("\n📊 Final Statistics:");
    console.log(`   Total files: ${stats.totalFiles}`);
    console.log(`   Skipped files: ${stats.skippedFiles}`);
    console.log(`   Streamed files: ${stats.streamedFiles}`);
    console.log(`   Total imports: ${stats.totalImports}`);
    console.log(`   Total exports: ${stats.totalExports}`);

    const memUsage = process.memoryUsage();
    console.log(
      `   Peak memory: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    );
  }

  /**
   * Get results
   */
  getResults() {
    return this.results;
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log("🛡️ Memory-Safe Import/Export Checker");
  console.log("=====================================\n");

  const analyzer = new SafeImportExportAnalyzer();

  try {
    await analyzer.processFiles();

    // Optional: Save results to file
    const results = analyzer.getResults();
    const outputFile = "import-export-analysis-safe.json";

    // Save with streaming for large results
    const fs = require("fs");
    const stream = fs.createWriteStream(outputFile);
    stream.write(
      JSON.stringify(
        {
          stats: results.stats,
          fileCount: results.files.size,
          importCount: results.imports.size,
          exportCount: results.exports.size,
        },
        null,
        2,
      ),
    );
    stream.end();

    console.log(`\n💾 Results saved to ${outputFile}`);
  } catch (error) {
    console.error("❌ Analysis failed:", error.message);
    process.exit(1);
  } finally {
    analyzer.cleanup();
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  SafeImportExportParser,
  SafeImportExportAnalyzer,
  SAFE_CONFIG,
};

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
