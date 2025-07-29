# 🤝 Contributing Guidelines

Thank you for your interest in contributing to **DemoHotel19May**! This document provides guidelines
and best practices for contributing to our restructured monorepo.

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Code Standards](#code-standards)
4. [Commit Guidelines](#commit-guidelines)
5. [Pull Request Process](#pull-request-process)
6. [Testing Requirements](#testing-requirements)
7. [Documentation](#documentation)
8. [Issue Guidelines](#issue-guidelines)

## 🚀 Getting Started

### Prerequisites

- Read the [Onboarding Guide](./ONBOARDING_GUIDE.md)
- Set up development environment
- Understand the [Architecture](./ARCHITECTURE.md)

### First Contribution

1. **Fork the repository**
2. **Clone your fork**
3. **Create a feature branch**
4. **Make your changes**
5. **Test thoroughly**
6. **Submit a pull request**

## 🔄 Development Workflow

### Branch Strategy

We use **feature branch workflow**:

```bash
main                    # Production-ready code
├── feature/user-auth   # New feature development
├── bugfix/login-issue  # Bug fixes
├── hotfix/critical     # Critical production fixes
└── docs/update-readme  # Documentation updates
```

### Branch Naming Conventions

```bash
# Features
feature/voice-assistant-improvements
feature/multi-language-support

# Bug fixes
bugfix/database-connection-timeout
bugfix/ui-rendering-issue

# Hotfixes
hotfix/security-vulnerability
hotfix/memory-leak

# Documentation
docs/api-documentation
docs/deployment-guide

# Refactoring
refactor/cleanup-imports
refactor/optimize-database-queries
```

### Development Process

1. **Create feature branch**

   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**
   - Follow code standards
   - Write tests
   - Update documentation

3. **Test locally**

   ```bash
   npm run typecheck
   npm run test
   npm run build
   ```

4. **Commit changes**

   ```bash
   git add .
   git commit -m "feat: add voice recognition feature"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create pull request via GitHub
   ```

## 📝 Code Standards

### File Organization

#### Adding New Files

```bash
# Components
apps/client/src/components/YourComponent/
├── YourComponent.tsx
├── YourComponent.test.tsx
├── index.ts
└── YourComponent.stories.tsx (optional)

# Services
apps/server/services/
├── yourService.ts
└── yourService.test.ts

# Shared utilities
packages/shared/utils/
├── yourUtil.ts
└── yourUtil.test.ts
```

#### Naming Conventions

| Type       | Convention          | Example                  |
| ---------- | ------------------- | ------------------------ |
| Components | PascalCase          | `VoiceAssistant.tsx`     |
| Utilities  | camelCase           | `hotelUtils.ts`          |
| Constants  | UPPER_SNAKE_CASE    | `API_ENDPOINTS.ts`       |
| Types      | PascalCase + suffix | `ApiResponse.types.ts`   |
| Hooks      | camelCase + prefix  | `useVoiceRecognition.ts` |

### Import Standards

#### Import Order

```typescript
// 1. External packages
import React from 'react';
import axios from 'axios';
import { z } from 'zod';

// 2. Internal imports (by hierarchy)
import { Button } from '@/components/ui/button';
import { apiClient } from '@shared/utils/apiClient';
import { userService } from '@server/services/userService';

// 3. Type imports (separate section)
import type { User } from '@types/core';
import type { ApiResponse } from '@types/api';
```

#### Absolute Path Usage

```typescript
// ✅ Always use absolute paths
import { logger } from '@shared/utils/logger';
import { Component } from '@/components/Component';
import { service } from '@server/services/service';

// ❌ Never use relative paths
import { logger } from '../../../../packages/shared/utils/logger';
import { Component } from '../../../components/Component';
```

### TypeScript Standards

#### Type Definitions

```typescript
// ✅ Good: Explicit types
interface UserProps {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

function createUser(props: UserProps): Promise<User> {
  // Implementation
}

// ✅ Good: Utility types
type PartialUser = Partial<UserProps>;
type UserEmail = Pick<UserProps, 'email'>;

// ❌ Avoid: any types
function processData(data: any): any {
  // Avoid this
}
```

#### Component Typing

```typescript
// ✅ React component typing
interface ComponentProps {
  title: string;
  onSubmit: (data: FormData) => void;
  children?: React.ReactNode;
}

export default function Component({ title, onSubmit, children }: ComponentProps): JSX.Element {
  // Implementation
}
```

### Logging Standards

#### Use Proper Logger

```typescript
import { logger } from '@shared/utils/logger';

// ✅ Good: Semantic logging
logger.info('User created successfully', 'UserService', { userId });
logger.error('Database connection failed', 'Database', error);
logger.database('Query executed', 'UserRepository', { query });

// ❌ Avoid: console.log in production code
console.log('User created'); // Only for quick debugging
```

#### Log Levels

- **DEBUG**: Development debugging information
- **INFO**: General application flow
- **WARN**: Warning conditions
- **ERROR**: Error conditions that don't stop execution

## 📝 Commit Guidelines

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

| Type       | Description              | Example                            |
| ---------- | ------------------------ | ---------------------------------- |
| `feat`     | New feature              | `feat: add voice recognition`      |
| `fix`      | Bug fix                  | `fix: resolve database timeout`    |
| `docs`     | Documentation            | `docs: update API reference`       |
| `style`    | Code style changes       | `style: format code with prettier` |
| `refactor` | Code refactoring         | `refactor: simplify user service`  |
| `test`     | Adding tests             | `test: add unit tests for auth`    |
| `chore`    | Maintenance tasks        | `chore: update dependencies`       |
| `perf`     | Performance improvements | `perf: optimize database queries`  |

### Examples

```bash
# Feature
feat(voice): add multi-language support

# Bug fix
fix(auth): resolve JWT token validation issue

# Documentation
docs: update contributing guidelines

# Refactoring
refactor(database): simplify query builder

# Performance
perf(api): optimize response caching

# Breaking change
feat!: change user authentication flow

BREAKING CHANGE: Users now need to re-authenticate
```

## 🔍 Pull Request Process

### Before Creating PR

1. **Ensure tests pass**

   ```bash
   npm run test
   npm run typecheck
   npm run build
   ```

2. **Update documentation**
   - Update relevant docs
   - Add JSDoc comments
   - Update README if needed

3. **Self-review**
   - Check code quality
   - Remove debugging code
   - Verify imports are correct

### PR Template

```markdown
## Description

Brief description of changes made.

## Type of Change

- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Refactoring

## Testing

- [ ] Added unit tests
- [ ] Added integration tests
- [ ] Manual testing completed
- [ ] All existing tests pass

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-reviewed the code
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] TypeScript errors resolved
```

### Review Process

1. **Automated checks** must pass
2. **At least one approval** required
3. **No merge conflicts**
4. **All conversations resolved**

### Merge Strategy

- **Squash and merge** for feature branches
- **Merge commit** for important milestones
- **Rebase and merge** for small fixes

## 🧪 Testing Requirements

### Test Coverage

#### Required Tests

- **Unit tests** for utilities and services
- **Component tests** for React components
- **Integration tests** for API endpoints
- **Type tests** for complex types

#### Test Structure

```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import VoiceAssistant from './VoiceAssistant';

describe('VoiceAssistant', () => {
  it('should render correctly', () => {
    render(<VoiceAssistant />);
    expect(screen.getByText('Voice Assistant')).toBeInTheDocument();
  });

  it('should handle voice commands', () => {
    const onCommand = vi.fn();
    render(<VoiceAssistant onCommand={onCommand} />);

    fireEvent.click(screen.getByText('Start Recording'));
    expect(onCommand).toHaveBeenCalled();
  });
});
```

### Running Tests

```bash
# All tests
npm run test

# Specific test file
npm run test -- VoiceAssistant.test.tsx

# Watch mode
npm run test -- --watch

# Coverage report
npm run test -- --coverage
```

## 📚 Documentation

### Code Documentation

#### JSDoc Comments

````typescript
/**
 * Creates a new hotel booking with voice confirmation
 * @param bookingData - The booking information
 * @param guestId - Unique identifier for the guest
 * @returns Promise resolving to booking confirmation
 * @throws {ValidationError} When booking data is invalid
 * @example
 * ```typescript
 * const booking = await createBooking({
 *   roomType: 'deluxe',
 *   checkIn: '2024-01-15'
 * }, 'guest-123');
 * ```
 */
async function createBooking(
  bookingData: BookingRequest,
  guestId: string
): Promise<BookingConfirmation> {
  // Implementation
}
````

#### README Updates

- Update README when adding major features
- Include example usage
- Update setup instructions if needed

### Documentation Types

| Type              | When to Update               |
| ----------------- | ---------------------------- |
| API docs          | New/changed endpoints        |
| Component docs    | New/changed components       |
| README            | Major features/setup changes |
| Architecture docs | Structural changes           |
| Contributing      | Process changes              |

## 🐛 Issue Guidelines

### Bug Reports

Use the bug report template:

```markdown
## Bug Description

Clear description of the bug.

## Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior

What should happen.

## Actual Behavior

What actually happens.

## Environment

- OS: [e.g. macOS 13.0]
- Node.js: [e.g. v18.17.0]
- Browser: [e.g. Chrome 118]

## Additional Context

Screenshots, logs, etc.
```

### Feature Requests

```markdown
## Feature Description

Clear description of the proposed feature.

## Problem Statement

What problem does this solve?

## Proposed Solution

How should this be implemented?

## Alternatives Considered

Other approaches considered.

## Additional Context

Mockups, examples, etc.
```

### Issue Labels

| Label              | Description             |
| ------------------ | ----------------------- |
| `bug`              | Something isn't working |
| `enhancement`      | New feature request     |
| `documentation`    | Documentation needs     |
| `good first issue` | Good for newcomers      |
| `help wanted`      | Need community help     |
| `priority: high`   | High priority issue     |

## ✅ Quality Checklist

Before submitting any contribution:

### Code Quality

- [ ] Follows TypeScript strict mode
- [ ] Uses absolute imports with aliases
- [ ] Proper error handling
- [ ] No console.log statements
- [ ] Meaningful variable names
- [ ] Proper type definitions

### Testing

- [ ] Unit tests for new functions
- [ ] Component tests for UI changes
- [ ] Integration tests for API changes
- [ ] All tests pass locally

### Documentation

- [ ] JSDoc comments for public APIs
- [ ] README updated if needed
- [ ] Code is self-documenting
- [ ] Examples provided for complex features

### Performance

- [ ] No unnecessary re-renders
- [ ] Efficient database queries
- [ ] Proper caching where applicable
- [ ] Bundle size impact considered

## 🎯 Best Practices

### Development

1. **Start small** - Make incremental changes
2. **Test early** - Write tests as you develop
3. **Document as you go** - Don't leave it for later
4. **Ask questions** - When in doubt, ask
5. **Review your own code** - Before submitting

### Collaboration

1. **Be respectful** - Constructive feedback only
2. **Be thorough** - Review code carefully
3. **Be responsive** - Address feedback promptly
4. **Be helpful** - Help others learn
5. **Be patient** - Good code takes time

## 🆘 Getting Help

### When You Need Help

1. **Check documentation** first
2. **Search existing issues**
3. **Ask in discussions**
4. **Create detailed issue**

### Resources

- [Onboarding Guide](./ONBOARDING_GUIDE.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Code Review Guide](./CODE_REVIEW_GUIDE.md)

---

Thank you for contributing to **DemoHotel19May**! 🎉

Your contributions help make this project better for everyone.
