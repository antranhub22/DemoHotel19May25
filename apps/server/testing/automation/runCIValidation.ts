import { runCISystemValidation } from './validateCISystem';

// Simple validation runner for ES modules
async function main() {
  try {
    await runCISystemValidation();
    process.exit(0);
  } catch (error) {
    console.error('❌ CI Validation failed:', error);
    process.exit(1);
  }
}

// Execute validation
main();
