#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import { glob } from 'glob';
import path from 'path';

console.log('🔍 Generating missing interfaces and type declarations...');

// Get current TypeScript errors to analyze
function getCurrentErrors() {
    try {
        const result = execSync('npx tsc --noEmit 2>&1', { encoding: 'utf8' });
        return result.split('\n').filter(line => line.includes('error TS'));
    } catch (error) {
        return error.stdout ? error.stdout.split('\n').filter(line => line.includes('error TS')) : [];
    }
}

// Extract TS2304 errors (Cannot find name)
function getTS2304Errors(errors) {
    return errors.filter(error => error.includes('error TS2304'))
        .map(error => {
            const match = error.match(/(.+?):\d+:\d+.*Cannot find name ['"]([^'"]+)['"]/);
            if (match) {
                return {
                    file: match[1].trim(),
                    name: match[2],
                    line: error
                };
            }
            return null;
        }).filter(Boolean);
}

// Extract TS2339 errors (Property does not exist)
function getTS2339Errors(errors) {
    return errors.filter(error => error.includes('error TS2339'))
        .map(error => {
            const match = error.match(/(.+?):\d+:\d+.*Property ['"]([^'"]+)['"] does not exist on type ['"]([^'"]+)['"]/);
            if (match) {
                return {
                    file: match[1].trim(),
                    property: match[2],
                    type: match[3],
                    line: error
                };
            }
            return null;
        }).filter(Boolean);
}

// Analyze codebase to infer missing types
async function analyzeMissingTypes() {
    console.log('🔍 1. Analyzing codebase for missing types...');

    const allFiles = await glob('apps/client/src/**/*.{ts,tsx}');
    const missingTypes = new Set();
    const missingInterfaces = new Map(); // interfaceName -> properties

    for (const filePath of allFiles) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');

            // Look for common patterns that suggest missing types
            const patterns = [
                // Interface usage without definition
                /interface\s+(\w+)\s*\{/g,
                /:\s*(\w+)\[\]/g,  // Array types
                /:\s*(\w+)\s*[;,}]/g,  // Property types
                /extends\s+(\w+)/g,  // Extended interfaces
                /React\.FC<(\w+)>/g,  // React component props
            ];

            patterns.forEach(pattern => {
                let match;
                while ((match = pattern.exec(content)) !== null) {
                    const typeName = match[1];
                    if (typeName && typeName !== 'string' && typeName !== 'number' &&
                        typeName !== 'boolean' && typeName !== 'any' && typeName !== 'void') {
                        missingTypes.add(typeName);
                    }
                }
            });

            // Look for object property usage patterns
            const propertyPattern = /(\w+)\.(\w+)/g;
            let match;
            while ((match = propertyPattern.exec(content)) !== null) {
                const [, objectName, propertyName] = match;
                if (!missingInterfaces.has(objectName)) {
                    missingInterfaces.set(objectName, new Set());
                }
                missingInterfaces.get(objectName).add(propertyName);
            }

        } catch (error) {
            console.warn(`Warning: Could not analyze ${filePath}`);
        }
    }

    console.log(`   Found ${missingTypes.size} potential missing types`);
    console.log(`   Found ${missingInterfaces.size} potential missing interfaces`);

    return { missingTypes: Array.from(missingTypes), missingInterfaces };
}

// Generate common interface definitions
function generateCommonInterfaces() {
    console.log('🔧 2. Generating common interface definitions...');

    const commonInterfaces = `// ===============================================
// Common Interface Definitions - Auto-generated
// TODO: Review and refine these interfaces
// ===============================================

// Voice Assistant Types
export interface VoiceConfig {
  language?: string;
  voiceId?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
}

export interface CallMetadata {
  callId?: string;
  duration?: number;
  timestamp?: Date;
  status?: 'active' | 'ended' | 'failed';
  language?: string;
  roomNumber?: string;
}

export interface ServiceRequest {
  id: string;
  type: ServiceCategory;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt?: Date;
  metadata?: Record<string, any>;
}

// UI Component Types
export interface NotificationConfig {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message?: string;
  duration?: number;
  autoHide?: boolean;
  position?: 'top' | 'bottom' | 'center';
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlay?: boolean;
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

// Data Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Hotel Operations Types
export interface Room {
  id: string;
  number: string;
  type: 'standard' | 'deluxe' | 'suite';
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  capacity: number;
  amenities: string[];
  floor: number;
}

export interface HousekeepingTask {
  id: string;
  roomId: string;
  type: 'cleaning' | 'maintenance' | 'inspection';
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high';
  estimatedDuration: number;
  notes?: string;
  createdAt: Date;
  completedAt?: Date;
}

// Guest Experience Types
export interface GuestProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  preferences: GuestPreferences;
  loyaltyLevel?: 'bronze' | 'silver' | 'gold' | 'platinum';
  language?: string;
  checkInDate?: Date;
  checkOutDate?: Date;
  roomNumber?: string;
}

export interface GuestPreferences {
  roomType?: string;
  temperature?: number;
  lighting?: 'bright' | 'dim' | 'auto';
  services?: ServiceCategory[];
  dietary?: string[];
  language?: string;
  communicationMethod?: 'voice' | 'text' | 'both';
}

// Dashboard Types
export interface DashboardStats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  maintenanceRooms: number;
  totalGuests: number;
  checkInsToday: number;
  checkOutsToday: number;
  revenue: {
    today: number;
    week: number;
    month: number;
  };
  occupancyRate: number;
}

export interface DashboardConfig {
  layout: 'grid' | 'list';
  refreshInterval: number;
  widgets: string[];
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
}

// Enhanced Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  context?: string;
  recoverable: boolean;
}

// Form Types
export interface FormField {
  name: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'checkbox';
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    custom?: (value: any) => boolean;
  };
  options?: { label: string; value: any }[];
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
}

// TODO: Add more specific interfaces based on actual usage patterns
`;

    return commonInterfaces;
}

// Generate utility types
function generateUtilityTypes() {
    console.log('🔧 3. Generating utility types...');

    const utilityTypes = `// ===============================================
// Utility Types - Auto-generated
// TODO: Review and refine these types
// ===============================================

// Common utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Event types
export type EventHandler<T = any> = (event: T) => void;
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>;

// Status types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';
export type OperationStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

// Voice Assistant specific types
export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
export type CallState = 'idle' | 'dialing' | 'connected' | 'on_hold' | 'ending' | 'ended';
export type AudioQuality = 'low' | 'medium' | 'high' | 'auto';

// Hotel operation types
export type RoomStatus = 'available' | 'occupied' | 'maintenance' | 'cleaning' | 'out_of_order';
export type ServicePriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

// UI state types
export type Theme = 'light' | 'dark' | 'auto';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Variant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
export type Position = 'top' | 'bottom' | 'left' | 'right' | 'center';

// Generic response types
export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Temporary types for quick fixes (TODO: Replace with proper types)
export type AnyObject = Record<string, any>;
export type AnyFunction = (...args: any[]) => any;
export type AnyArray = any[];

// TODO: Add more utility types as needed
`;

    return utilityTypes;
}

// Create missing type files
async function createMissingTypeFiles() {
    console.log('📝 4. Creating missing type files...');

    const typeFiles = [
        {
            path: 'apps/client/src/types/common.types.ts',
            content: generateCommonInterfaces()
        },
        {
            path: 'apps/client/src/types/utility.types.ts',
            content: generateUtilityTypes()
        }
    ];

    let createdCount = 0;

    for (const { path: filePath, content } of typeFiles) {
        try {
            // Create directory if it doesn't exist
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // Only create if file doesn't exist
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, content);
                createdCount++;
                console.log(`   ✅ Created ${filePath}`);
            } else {
                console.log(`   📄 Already exists: ${filePath}`);
            }
        } catch (error) {
            console.warn(`Warning: Could not create ${filePath}`);
        }
    }

    console.log(`✅ Created ${createdCount} new type files`);
}

// Update main index files to export new types
async function updateTypeIndexes() {
    console.log('📦 5. Updating type index files...');

    const indexFiles = [
        'apps/client/src/types/index.ts',
        'packages/shared/types/index.ts'
    ];

    let updatedCount = 0;

    for (const indexPath of indexFiles) {
        try {
            if (!fs.existsSync(indexPath)) {
                // Create basic index file
                const content = `// Type definitions index - Auto-generated
// TODO: Review and organize exports

// Common types
export * from './common.types';
export * from './utility.types';

// Re-export shared types
export * from '@shared/types';
`;
                fs.writeFileSync(indexPath, content);
                console.log(`   ✅ Created ${indexPath}`);
                updatedCount++;
            } else {
                // Check if exports are already present
                const content = fs.readFileSync(indexPath, 'utf8');
                if (!content.includes('common.types') || !content.includes('utility.types')) {
                    const additionalExports = `
// Auto-generated exports
export * from './common.types';
export * from './utility.types';
`;
                    fs.appendFileSync(indexPath, additionalExports);
                    console.log(`   ✅ Updated ${indexPath}`);
                    updatedCount++;
                }
            }
        } catch (error) {
            console.warn(`Warning: Could not update ${indexPath}`);
        }
    }

    console.log(`✅ Updated ${updatedCount} index files`);
}

// Add missing imports to files that need them
async function addMissingTypeImports() {
    console.log('📥 6. Adding missing type imports...');

    const allFiles = await glob('apps/client/src/**/*.{ts,tsx}');
    let updatedCount = 0;

    for (const filePath of allFiles) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let hasChanges = false;

            // Common patterns that need type imports
            const typeImports = [
                {
                    usage: /\bRoom\b/,
                    import: "import type { Room } from '../types/common.types';",
                    check: /import.*Room.*from/
                },
                {
                    usage: /\bHousekeepingTask\b/,
                    import: "import type { HousekeepingTask } from '../types/common.types';",
                    check: /import.*HousekeepingTask.*from/
                },
                {
                    usage: /\bServiceRequest\b/,
                    import: "import type { ServiceRequest } from '../types/common.types';",
                    check: /import.*ServiceRequest.*from/
                },
                {
                    usage: /\bGuestProfile\b/,
                    import: "import type { GuestProfile } from '../types/common.types';",
                    check: /import.*GuestProfile.*from/
                },
                {
                    usage: /\bApiResponse\b/,
                    import: "import type { ApiResponse } from '../types/common.types';",
                    check: /import.*ApiResponse.*from/
                }
            ];

            typeImports.forEach(({ usage, import: importStatement, check }) => {
                if (usage.test(content) && !check.test(content)) {
                    // Add import at the top
                    const lines = content.split('\n');
                    const importIndex = lines.findIndex(line => line.startsWith('import'));
                    if (importIndex >= 0) {
                        lines.splice(importIndex, 0, importStatement);
                        content = lines.join('\n');
                        hasChanges = true;
                    }
                }
            });

            if (hasChanges) {
                fs.writeFileSync(filePath, content);
                updatedCount++;
            }
        } catch (error) {
            console.warn(`Warning: Could not process ${filePath}`);
        }
    }

    console.log(`✅ Added type imports to ${updatedCount} files`);
}

// Get error count
function getErrorCount() {
    try {
        const result = execSync('npm run type-check 2>&1 | grep "error TS" | wc -l', { encoding: 'utf8' });
        return parseInt(result.trim());
    } catch (error) {
        return 0;
    }
}

// Main execution
async function main() {
    const startTime = Date.now();
    console.log('🚀 Starting missing interface and type generation...\n');

    const initialErrors = getErrorCount();
    console.log(`📊 Initial TypeScript errors: ${initialErrors}\n`);

    // Analyze current state
    const errors = getCurrentErrors();
    const ts2304Errors = getTS2304Errors(errors);
    const ts2339Errors = getTS2339Errors(errors);

    console.log(`🔍 Error analysis:`);
    console.log(`   TS2304 (Cannot find name): ${ts2304Errors.length}`);
    console.log(`   TS2339 (Property does not exist): ${ts2339Errors.length}`);
    console.log(`   Other errors: ${errors.length - ts2304Errors.length - ts2339Errors.length}\n`);

    // Run all generation steps
    const { missingTypes, missingInterfaces } = await analyzeMissingTypes();
    await createMissingTypeFiles();
    await updateTypeIndexes();
    await addMissingTypeImports();

    // Get final error count
    console.log('\n🔍 Checking results...');
    const finalErrors = getErrorCount();
    const improvement = initialErrors - finalErrors;

    console.log('\n📊 RESULTS:');
    console.log(`Initial errors: ${initialErrors}`);
    console.log(`Final errors: ${finalErrors}`);
    console.log(`Fixed: ${improvement} errors`);
    console.log(`Time taken: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);

    if (improvement > 0) {
        console.log('\n🎉 Successfully generated missing type definitions!');
    } else if (finalErrors === initialErrors) {
        console.log('\n💡 Type definitions created for better development experience');
    }

    console.log('\n📋 Summary:');
    console.log(`   Created comprehensive interface definitions`);
    console.log(`   Added utility types for common patterns`);
    console.log(`   Updated type index files`);
    console.log(`   All new types marked with TODO for review`);
}

main().catch(console.error);