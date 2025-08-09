// Basic type definitions for common usage patterns
// TODO: Expand and refine these types as needed

// Basic room types for hotel operations
export interface Room {
    id: string;
    number: string;
    type: 'standard' | 'deluxe' | 'suite';
    status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
}

// Basic housekeeping task types
export interface HousekeepingTask {
    id: string;
    roomId: string;
    type: 'cleaning' | 'maintenance' | 'inspection';
    status: 'pending' | 'in_progress' | 'completed';
}

// Basic service request types
export interface ServiceRequest {
    id: string;
    type: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
}

// Basic API response type
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

// Basic utility types for temporary fixes
export type AnyObject = Record<string, any>;
export type AnyFunction = (...args: any[]) => any;