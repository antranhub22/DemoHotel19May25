# 🔧 **Repository Refactoring Guide - Step by Step Cursor Commands**

## **📋 PREPARATION - Analysis First**

### **Step 0: Complete Repository Analysis**

```bash
@Codebase Please perform a comprehensive analysis of our Mi Nhon Hotel repository structure and provide:

1. Complete file tree with sizes and purposes
2. Identify duplicate code, unused files, and redundant dependencies
3. Analyze component structure and coupling
4. Review service organization and separation of concerns
5. Check for circular dependencies and architectural issues
6. Identify opportunities for code consolidation
7. Review naming conventions and folder organization

Give me a detailed report of current state and refactoring opportunities.
```

---

## **🔍 PHASE 1: ARCHITECTURE ASSESSMENT**

### **Step 1: Analyze Current Architecture**

```bash
@Codebase Based on the repository analysis, please:

1. Map out the current architecture layers (frontend, backend, shared)
2. Identify architectural violations and anti-patterns
3. Check for proper separation between:
   - Business logic vs UI components
   - Data access vs business logic
   - API routes vs controllers vs services
4. Review dependency flow and identify circular references
5. Assess current folder structure effectiveness

Show me what needs to be restructured for better maintainability.
```

### **Step 2: Create Refactoring Strategy**

```bash
@Codebase Create a comprehensive refactoring strategy that:

1. Proposes new folder structure with clear separation of concerns
2. Identifies which files can be consolidated or split
3. Plans for removing unused code and dependencies
4. Suggests better naming conventions
5. Maps migration path that won't break existing functionality
6. Prioritizes changes by risk level (low risk first)

Ensure zero functionality loss during refactoring.
```

---

## **🗂️ PHASE 2: FOLDER STRUCTURE OPTIMIZATION**

### **Step 3: Design New Folder Structure**

```bash
@Codebase Design an optimal folder structure for our codebase:

1. Create a clear, scalable folder hierarchy for:
   - Frontend components (by feature vs by type)
   - Backend services (domain-driven organization)
   - Shared utilities and types
   - Configuration and environment files

2. Follow industry best practices for:
   - React/TypeScript frontend organization
   - Node.js/Express backend structure
   - Monorepo organization principles

3. Ensure easy navigation and logical grouping
4. Plan for future SaaS multi-tenant expansion

Show me the proposed new structure with explanations.
```

### **Step 4: Create Migration Plan**

```bash
@Codebase Create a detailed migration plan to move from current structure to new structure:

1. List all files that need to be moved/renamed
2. Identify import statements that need updating
3. Plan the order of changes to minimize broken states
4. Create scripts for automated file moves where possible
5. Identify manual steps that require careful attention

Ensure we can validate functionality at each step.
```

---

## **📦 PHASE 3: DEPENDENCY CLEANUP**

### **Step 5: Audit Dependencies**

```bash
@Codebase Perform a thorough dependency audit:

1. Analyze package.json files (client, server, root)
2. Identify unused dependencies that can be removed
3. Find duplicate dependencies with different versions
4. Check for security vulnerabilities in dependencies
5. Identify dependencies that can be replaced with lighter alternatives
6. Review dev dependencies vs production dependencies placement

Show me what can be cleaned up safely.
```

### **Step 6: Optimize Package Structure**

```bash
@Codebase Optimize our package structure:

1. Consolidate duplicate dependencies
2. Move dependencies to appropriate package.json files
3. Update dependency versions to latest stable
4. Remove unused packages
5. Optimize bundle size by replacing heavy dependencies
6. Ensure proper peer dependency management

Create updated package.json files and migration commands.
```

---

## **🧩 PHASE 4: CODE CONSOLIDATION**

### **Step 7: Identify Code Duplication**

```bash
@Codebase Find and analyze code duplication across the codebase:

1. Identify duplicate utility functions
2. Find repeated component patterns
3. Locate similar business logic in different files
4. Check for duplicate API patterns
5. Find repeated configuration code
6. Identify copy-pasted code blocks

Show me consolidation opportunities with specific examples.
```

### **Step 8: Create Shared Utilities**

```bash
@Codebase Create consolidated shared utilities:

1. Extract common utility functions into shared/utils/
2. Create reusable hooks for common patterns
3. Consolidate API client functions
4. Create shared constants and configuration
5. Build reusable component patterns
6. Standardize error handling patterns

Ensure all existing functionality is preserved.
```

---

## **⚙️ PHASE 5: COMPONENT ORGANIZATION**

### **Step 9: Analyze Component Structure**

```bash
@Codebase Analyze our current React component organization:

1. Review component hierarchy and relationships
2. Identify overly complex components that should be split
3. Find components that are too small and should be merged
4. Check for proper separation of concerns
5. Review prop drilling and state management patterns
6. Identify missing component abstractions

Suggest improvements for better maintainability.
```

### **Step 10: Restructure Components**

```bash
@Codebase Restructure components following best practices:

1. Group components by feature/domain rather than type
2. Create proper component hierarchies
3. Extract custom hooks from components
4. Consolidate similar components into variants
5. Create proper abstraction layers
6. Implement consistent naming conventions

Show me the new component organization with migration steps.
```

---

## **🛠️ PHASE 6: SERVICE LAYER OPTIMIZATION**

### **Step 11: Analyze Backend Services**

```bash
@Codebase Review our backend service organization:

1. Analyze current service responsibilities
2. Identify violations of single responsibility principle
3. Check for proper layering (routes → controllers → services → data)
4. Review error handling consistency
5. Check for business logic in wrong layers
6. Identify missing service abstractions

Suggest improvements for better architecture.
```

### **Step 12: Refactor Service Architecture**

```bash
@Codebase Implement improved service architecture:

1. Create clear service layer separation
2. Extract business logic from routes and controllers
3. Implement consistent error handling patterns
4. Create proper data access layer abstraction
5. Standardize service interfaces and patterns
6. Improve dependency injection patterns

Ensure all existing APIs continue to work.
```

---

## **🎨 PHASE 7: STYLING AND ASSETS**

### **Step 13: Optimize Styling Structure**

```bash
@Codebase Review and optimize our styling approach:

1. Analyze current CSS/styling organization
2. Identify unused styles and redundant CSS
3. Check for styling consistency across components
4. Review TailwindCSS usage and optimization
5. Identify opportunities for design system patterns
6. Check for style conflicts and specificity issues

Suggest improvements for maintainable styling.
```

### **Step 14: Consolidate Assets and Resources**

```bash
@Codebase Organize assets and static resources:

1. Audit all images, fonts, and static assets
2. Optimize image sizes and formats
3. Remove unused assets
4. Organize assets by feature/usage
5. Implement consistent naming conventions
6. Set up proper asset bundling and optimization

Show me the optimized asset structure.
```

---

## **📊 PHASE 8: CONFIGURATION MANAGEMENT**

### **Step 15: Consolidate Configuration**

```bash
@Codebase Optimize configuration management:

1. Review all configuration files and environment variables
2. Consolidate duplicate configuration
3. Create proper configuration hierarchy
4. Implement environment-specific configs
5. Add configuration validation
6. Document all configuration options

Create a cleaner, more maintainable config structure.
```

### **Step 16: Optimize Build and Dev Setup**

```bash
@Codebase Improve build and development setup:

1. Review and optimize build scripts
2. Consolidate package.json scripts
3. Improve development environment setup
4. Optimize build performance
5. Standardize linting and formatting rules
6. Improve hot reload and development experience

Show me the optimized development workflow.
```

---

## **🔧 PHASE 9: TYPE SAFETY AND INTERFACES**

### **Step 17: Consolidate TypeScript Types**

```bash
@Codebase Optimize TypeScript type organization:

1. Review all type definitions across the codebase
2. Identify duplicate or similar types
3. Consolidate types into logical modules
4. Create proper type hierarchies
5. Improve type safety and remove 'any' usage
6. Standardize interface naming conventions

Create a clean, well-organized type system.
```

### **Step 18: Improve API Type Safety**

```bash
@Codebase Enhance API type safety:

1. Create comprehensive API type definitions
2. Ensure type safety between frontend and backend
3. Generate types from API schemas where possible
4. Implement proper request/response typing
5. Add runtime type validation
6. Create type-safe API client patterns

Show me the improved type-safe API structure.
```

---

## **🧪 PHASE 10: TESTING STRUCTURE**

### **Step 19: Organize Test Structure**

```bash
@Codebase Review and improve test organization:

1. Analyze current test coverage and structure
2. Organize tests to match code structure
3. Identify missing test utilities and helpers
4. Create consistent testing patterns
5. Improve test performance and reliability
6. Add proper test data management

Create a maintainable testing structure.
```

### **Step 20: Optimize Test Performance**

```bash
@Codebase Optimize testing performance and reliability:

1. Consolidate test utilities and mocks
2. Improve test isolation and cleanup
3. Optimize test execution speed
4. Create better test data factories
5. Improve test debugging capabilities
6. Standardize test naming and organization

Show me the optimized test setup.
```

---

## **📚 PHASE 11: DOCUMENTATION AND COMMENTS**

### **Step 21: Audit Documentation**

```bash
@Codebase Review and improve code documentation:

1. Audit existing comments and documentation
2. Remove outdated or redundant comments
3. Add missing documentation for complex logic
4. Create consistent documentation patterns
5. Improve README files and setup guides
6. Document architectural decisions and patterns

Create comprehensive, maintainable documentation.
```

### **Step 22: Create Development Guidelines**

```bash
@Codebase Create development guidelines and standards:

1. Document coding standards and conventions
2. Create component development guidelines
3. Document API design patterns
4. Create contribution guidelines
5. Document deployment and maintenance procedures
6. Create troubleshooting guides

Ensure new developers can understand and contribute easily.
```

---

## **🚀 PHASE 12: IMPLEMENTATION AND VALIDATION**

### **Step 23: Execute Folder Structure Migration**

```bash
@Codebase Execute the folder structure refactoring:

1. Implement the new folder structure gradually
2. Move files in logical groups to minimize breakage
3. Update all import statements automatically where possible
4. Test functionality after each major move
5. Update build configurations and scripts
6. Verify all paths and references are correct

Ensure zero functionality loss during migration.
```

### **Step 24: Implement Code Consolidation**

```bash
@Codebase Implement code consolidation changes:

1. Move duplicate code to shared utilities
2. Refactor components following new organization
3. Implement new service architecture
4. Consolidate configuration and types
5. Update all references to moved/changed code
6. Test each change thoroughly

Maintain all existing functionality throughout.
```

### **Step 25: Optimize Dependencies and Build**

```bash
@Codebase Implement dependency and build optimizations:

1. Update package.json files with optimized dependencies
2. Remove unused dependencies and code
3. Update build scripts and configurations
4. Optimize bundle sizes and performance
5. Update development environment setup
6. Test build and deployment processes

Ensure everything still works correctly.
```

---

## **✅ PHASE 13: VALIDATION AND CLEANUP**

### **Step 26: Comprehensive Testing**

```bash
@Codebase Perform comprehensive testing of refactored codebase:

1. Run full test suite and ensure all tests pass
2. Test all major user flows manually
3. Verify build and deployment processes
4. Check performance hasn't degraded
5. Validate all APIs and integrations still work
6. Test development environment setup

Document any issues found and fix them.
```

### **Step 27: Final Cleanup and Documentation**

```bash
@Codebase Perform final cleanup and documentation:

1. Remove any temporary files or unused code
2. Update all documentation to reflect new structure
3. Create migration guide for team members
4. Update deployment scripts if needed
5. Create summary of improvements made
6. Document lessons learned for future refactoring

Provide final report of refactoring results.
```

---

## **🎯 EXECUTION WORKFLOW**

### **How to Use These Commands:**

1. **Start with thorough analysis** - Don't skip the assessment phases
2. **Execute one phase at a time** - Each phase builds on previous ones
3. **Test frequently** - Validate functionality after major changes
4. **Keep backups** - Use git branches and commits liberally
5. **Document changes** - Track what was changed and why

### **Risk Management:**

```bash
# Before starting any phase:
@Codebase Before implementing this refactoring phase, help me identify potential risks and create a rollback plan.

# If something breaks:
@Codebase The refactoring broke [specific functionality]. Help me identify what went wrong and fix it while preserving the refactoring improvements.

# Emergency rollback:
@Codebase I need to rollback the refactoring changes safely. Show me how to restore functionality while keeping beneficial changes.
```

### **Success Criteria:**

✅ **Zero functionality loss**  
✅ **Improved code organization**  
✅ **Better maintainability**  
✅ **Reduced code duplication**  
✅ **Cleaner dependencies**  
✅ **Better performance**  
✅ **Easier development experience**

### **Progressive Validation:**

After each phase, run:

```bash
@Codebase Validate that all functionality still works after this refactoring phase. Run tests and check for any regressions.
```

---

## **📋 REFACTORING CHECKLIST**

### **Phase 1-2: Analysis & Strategy** ✅

- [ ] Step 0: Complete Repository Analysis
- [ ] Step 1: Analyze Current Architecture
- [ ] Step 2: Create Refactoring Strategy

### **Phase 3-4: Structure & Dependencies** ✅

- [ ] Step 3: Design New Folder Structure
- [ ] Step 4: Create Migration Plan
- [ ] Step 5: Audit Dependencies
- [ ] Step 6: Optimize Package Structure

### **Phase 5-6: Code & Services** ✅

- [ ] Step 7: Identify Code Duplication
- [ ] Step 8: Create Shared Utilities
- [ ] Step 9: Analyze Component Structure
- [ ] Step 10: Restructure Components
- [ ] Step 11: Analyze Backend Services
- [ ] Step 12: Refactor Service Architecture

### **Phase 7-8: Assets & Configuration** ✅

- [ ] Step 13: Optimize Styling Structure
- [ ] Step 14: Consolidate Assets and Resources
- [ ] Step 15: Consolidate Configuration
- [ ] Step 16: Optimize Build and Dev Setup
