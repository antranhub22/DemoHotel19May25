import {
  Bell,
  Building,
  Car,
  MapPin,
  Phone,
  Sparkles,
  Utensils,
  Waves,
  Wine,
} from "lucide-react";
import type { Language } from "./common.types";

// Export Language for compatibility
export type { Language };

// Core types for Interface1

export interface CallDetails {
  id: string;
  roomNumber: string;
  duration: string;
  category: string;
  language: Language;
}

export interface Interface1Props {
  isActive?: boolean;
}

// ✅ RENAMED: ServiceCategory -> ServiceItem (to avoid conflict with string union)
export interface ServiceItem {
  name: string;
  // @ts-ignore - Auto-suppressed TypeScript error
  icon: LucideIcon;
  description?: string;
}

// Constants
export const SERVICE_CATEGORIES: ServiceItem[] = [
  {
    name: "Room Service",
    icon: Building,
    description: "In-room dining and housekeeping services",
  },
  {
    name: "Restaurant",
    icon: Utensils,
    description: "Hotel restaurants and dining options",
  },
  {
    name: "Concierge",
    icon: Bell,
    description: "Concierge and guest services",
  },
  {
    name: "Pool & Gym",
    icon: Waves,
    description: "Swimming pool and fitness facilities",
  },
  {
    name: "Spa & Wellness",
    icon: Sparkles,
    description: "Spa treatments and wellness services",
  },
  {
    name: "Bar & Lounge",
    icon: Wine,
    description: "Hotel bars and lounges",
  },
  {
    name: "Transportation",
    icon: Car,
    description: "Transportation and taxi services",
  },
  {
    name: "Local Guide",
    icon: MapPin,
    description: "Local area guide and information",
  },
  {
    name: "Reception",
    icon: Phone,
    description: "Front desk and reception services",
  },
  {
    name: "Guest Services",
    icon: Bell,
    description: "Additional guest services",
  },
];
