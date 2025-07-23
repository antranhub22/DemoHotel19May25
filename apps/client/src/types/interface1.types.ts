import { IconType } from 'react-icons';

import {
  FaBed,
  FaUtensils,
  FaBellConcierge,
  FaPersonSwimming,
  FaSpa,
  FaMartiniGlass,
  FaTaxi,
  FaMapLocationDot,
  FaPhone,
} from 'react-icons/fa6';

// Core types for Interface1
export type Language = 'en' | 'fr' | 'zh' | 'ru' | 'ko' | 'vi';

export interface CallDetails {
  id: string;
  roomNumber: string;
  duration: string;
  category: string;
  language: string;
}

export interface Interface1Props {
  isActive?: boolean;
}

export interface ServiceCategory {
  name: string;
  icon: IconType;
  description?: string;
}

// Constants
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    name: 'Room Service',
    icon: FaBed,
    description: 'In-room dining and housekeeping services',
  },
  {
    name: 'Restaurant',
    icon: FaUtensils,
    description: 'Hotel restaurants and dining options',
  },
  {
    name: 'Concierge',
    icon: FaBellConcierge,
    description: 'Concierge and guest services',
  },
  {
    name: 'Pool & Gym',
    icon: FaPersonSwimming,
    description: 'Swimming pool and fitness facilities',
  },
  {
    name: 'Spa & Wellness',
    icon: FaSpa,
    description: 'Spa treatments and wellness services',
  },
  {
    name: 'Bar & Lounge',
    icon: FaMartiniGlass,
    description: 'Hotel bars and lounges',
  },
  {
    name: 'Transportation',
    icon: FaTaxi,
    description: 'Transportation and taxi services',
  },
  {
    name: 'Local Guide',
    icon: FaMapLocationDot,
    description: 'Local area guide and information',
  },
  {
    name: 'Reception',
    icon: FaPhone,
    description: 'Front desk and reception services',
  },
  {
    name: 'Guest Services',
    icon: FaBellConcierge,
    description: 'Additional guest services',
  },
];
