// ========================================
// HOTEL TYPES
// ========================================

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  bedType: string;
  bedCount: number;
  capacity: number;
  size: number;
  view: string;
  basePrice: number;
  status: string;
  currentGuest?: {
    guestName: string;
  };
  lastCleaning?: Date;
}

export interface HousekeepingTask {
  id: string;
  roomId: string;
  roomNumber: string;
  taskType: string;
  priority: string;
  description: string;
  estimatedDuration: number;
  assignedStaffName?: string;
  scheduledStart?: Date;
  status: string;
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  location: string;
  priority: string;
  urgency: string;
  source: string;
  reportedAt: Date;
  assignedStaffName?: string;
  status: string;
}
