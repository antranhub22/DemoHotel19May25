# Cursor Agent Command - Comprehensive TypeScript Fix

## Main Command for Cursor Agent:

```
@codebase Fix all TypeScript compilation errors systematically:

1. CRITICAL FIXES (Execute in this exact order):

   a) Type Definition Conflicts Resolution:
   - Scan entire codebase for duplicate type definitions of Language, Room, HousekeepingTask
   - Consolidate all shared types into src/types/common.types.ts
   - Remove all duplicate type definitions
   - Update all import statements to reference the consolidated types

   b) Missing Type Files:
   - Create missing ../types/common.types file with all required type definitions
   - Ensure all missing modules are properly exported and imported
   - Fix all "Cannot find module" errors

   c) Redux Integration Fix:
   - Fix all AsyncThunk actions compatibility with dispatch
   - Update Redux store configuration for proper type safety
   - Ensure all Redux actions have correct return types

   d) Logger Parameter Issues:
   - Fix all logger function calls with correct parameter types
   - Ensure logger functions accept proper argument signatures

   e) Missing Dependencies:
   - Install any missing dependencies causing undefined functions/types
   - Update package.json with all required type definitions

2. VERIFICATION STEPS:
   - Run `npx tsc --noEmit` to verify zero compilation errors
   - Check that all import/export statements resolve correctly
   - Ensure Redux store and actions work without type errors
   - Verify all logger calls have correct parameter types

3. ARCHITECTURE CLEANUP:
   - Organize all types into proper directory structure
   - Ensure consistent import/export patterns across the codebase
   - Remove any unused type definitions or imports
   - Update tsconfig.json paths if needed

Execute this comprehensively and show me the summary of changes made and files modified.
```

## Alternative Specific Commands:

### For Type Conflicts Only:

```
@codebase Find and fix all duplicate type definitions for Language, Room, and HousekeepingTask. Consolidate them into a single source of truth in src/types/common.types.ts and update all imports.
```

### For Redux Issues Only:

```
@codebase Fix all Redux AsyncThunk dispatch compatibility issues and ensure proper type safety throughout the Redux store configuration.
```

### For Missing Dependencies:

```
@codebase Identify and fix all "Cannot find module" errors and undefined function/type issues by creating missing files or installing required dependencies.
```

## Complete System Recovery Command:

```
@codebase Completely fix this TypeScript project that's in a transitional state from domain-driven architecture refactoring. The application cannot compile due to:
1. Duplicate type identifiers (Language, Room, HousekeepingTask)
2. Missing type files (../types/common.types)
3. Redux dispatch compatibility issues
4. Logger parameter type mismatches
5. Various undefined functions and types

Execute a complete systematic fix of all compilation errors, organize the type system properly, and ensure the application can build and run successfully. Prioritize fixing the root causes rather than individual symptoms.
```

## Quick Nuclear Option:

```
@codebase This codebase has extensive TypeScript compilation errors preventing the app from working. Perform a complete TypeScript error resolution: fix all type conflicts, create missing type files, resolve Redux integration issues, fix logger parameters, and handle all missing dependencies. Make it compile and run successfully.
```

## Usage Instructions:

1. **Copy one of the commands above**
2. **Paste it into Cursor's chat**
3. **Press Enter and let the agent work**
4. **Review the changes before accepting**
5. **Test with `npm run build` or `npm start`**

The main comprehensive command is recommended as it addresses all issues systematically in the correct order.
