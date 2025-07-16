import { ReactNode } from 'react';
import { IconType } from 'react-icons';
import { FaBed, FaUtensils, FaConciergeBell, FaSwimmingPool, FaSpa, FaGlassMartini, FaTaxi, FaMapMarkedAlt, FaPhoneAlt } from 'react-icons/fa';

export interface Interface1Props {
  isActive?: boolean;
}

export interface ServiceCategory {
  name: string;
  icon: IconType;
  description?: string;
}

export type Language = 'en' | 'fr' | 'zh' | 'ru' | 'ko' | 'vi';

export interface CallDetails {
  id: string;
  roomNumber: string;
  duration: string;
  category: string;
  language: string;
}

// Constants
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { name: 'Room Service', icon: FaBed, description: 'In-room dining and housekeeping services' },
  { name: 'Restaurant', icon: FaUtensils, description: 'Hotel restaurants and dining options' },
  { name: 'Concierge', icon: FaConciergeBell, description: 'Concierge and guest services' },
  { name: 'Pool & Gym', icon: FaSwimmingPool, description: 'Swimming pool and fitness facilities' },
  { name: 'Spa & Wellness', icon: FaSpa, description: 'Spa treatments and wellness services' },
  { name: 'Bar & Lounge', icon: FaGlassMartini, description: 'Hotel bars and lounges' },
  { name: 'Transportation', icon: FaTaxi, description: 'Transportation and taxi services' },
  { name: 'Local Guide', icon: FaMapMarkedAlt, description: 'Local area guide and information' },
  { name: 'Reception', icon: FaPhoneAlt, description: 'Front desk and reception services' },
  { name: 'Guest Services', icon: FaConciergeBell, description: 'Additional guest services' }
]; 