import {
  AdvancedHotelData,
  BasicHotelData as ResearchHotelData,
} from './hotelResearch';
// ============================================
// Knowledge Base Generator Service
// ============================================

// Type guard to check if we have the full research data structure
function isResearchHotelData(data: any): data is ResearchHotelData {
  return (
    data && typeof data.location === 'object' && data.location.lat !== undefined
  );
}

// Type guard for services array
function hasHotelServices(services: any): services is any[] {
  return Array.isArray(services) && services.length > 0;
}

export class KnowledgeBaseGenerator {
  /**
   * Generate comprehensive knowledge base from hotel research data
   */
  generateKnowledgeBase(
    hotelData: ResearchHotelData | AdvancedHotelData
  ): string {
    const sections = [
      this.generateBasicInfoSection(hotelData),
      this.generateServicesSection(hotelData.services || []),
      this.generateRoomTypesSection(hotelData.roomTypes || []),
      this.generateAmenitiesSection(hotelData.amenities || []),
      this.generatePoliciesSection(hotelData.policies),
      this.generateLocalAttractionsSection(hotelData.localAttractions || []),
      this.generateContactSection(hotelData),
    ];

    // Add advanced sections if available
    if (this.isAdvancedHotelData(hotelData)) {
      sections.push(this.generateReviewsSection(hotelData.reviewData));
      sections.push(this.generateCompetitorSection(hotelData.competitorData));
    }

    return sections.filter(section => section.trim()).join('\n\n');
  }

  /**
   * Generate system prompt for AI assistant
   */
  generateSystemPrompt(
    hotelData: ResearchHotelData | AdvancedHotelData,
    customization: {
      personality: string;
      tone: string;
      languages: string[];
    }
  ): string {
    const basePrompt = `You are the AI concierge for ${hotelData.name}, a ${this.getHotelCategory(hotelData)} hotel located in ${hotelData.address || 'a prime location'}.

Your personality is ${customization.personality} and your tone should be ${customization.tone}.

You can communicate in: ${customization.languages.join(', ')}.

HOTEL INFORMATION:
${this.generateBasicInfoSection(hotelData)}

AVAILABLE SERVICES:
${this.generateFunctionDescriptions(hotelData.services || [])}`;

    // Add policies information
    if (hotelData.policies) {
      basePrompt += `\n\nHOTEL POLICIES:
Check-in: ${hotelData.policies.checkIn || 'Contact front desk'}
Check-out: ${hotelData.policies.checkOut || 'Contact front desk'}`;
    }

    return basePrompt;
  }

  /**
   * Generate FAQ section from hotel data
   */
  generateFAQSection(
    hotelData: ResearchHotelData | AdvancedHotelData
  ): Array<{ question: string; answer: string }> {
    const faqs: Array<{ question: string; answer: string }> = [
      {
        question: 'What amenities are available?',
        answer: `We offer the following amenities: ${(hotelData.amenities || []).join(', ') || 'Please contact front desk for details'}.`,
      },
      {
        question: 'What services do you provide?',
        answer: `Our available services include: ${hasHotelServices(hotelData.services) ? hotelData.services.map(s => s.name).join(', ') : 'Please contact front desk for service information'}.`,
      },
      {
        question: 'How can I contact the hotel?',
        answer: `You can reach us at ${hotelData.phone || 'the front desk'} or visit us at ${hotelData.address || 'our location'}.`,
      },
    ];

    // Add room-specific FAQs if available
    if (hotelData.roomTypes && hotelData.roomTypes.length > 0) {
      faqs.push({
        question: 'What room types are available?',
        answer: `We offer ${hotelData.roomTypes.map(r => r.name).join(', ')}. Each room type has different amenities and pricing.`,
      });
    }

    // Add location-specific FAQs if available
    if (hotelData.localAttractions && hotelData.localAttractions.length > 0) {
      faqs.push({
        question: 'What attractions are nearby?',
        answer: `Popular nearby attractions include: ${hotelData.localAttractions
          .slice(0, 5)
          .map(a => a.name)
          .join(', ')}.`,
      });
    }

    // Add policies FAQ if available
    if (hotelData.policies) {
      faqs.push({
        question: 'What time is check-in and check-out?',
        answer: `Check-in is at ${hotelData.policies.checkIn || 'standard time'} and check-out is at ${hotelData.policies.checkOut || 'standard time'}.`,
      });
    }

    return faqs;
  }

  /**
   * Generate service menu from hotel data
   */
  generateServiceMenu(
    hotelData: BasicHotelData | AdvancedHotelData
  ): ServiceMenu {
    const menu: ServiceMenu = {
      roomService: this.generateRoomServiceMenu(hotelData.services),
      housekeeping: this.generateHousekeepingMenu(hotelData.services),
      concierge: this.generateConciergeMenu(hotelData.services),
      transportation: this.generateTransportationMenu(hotelData.services),
      spa: this.generateSpaMenu(hotelData.services),
      tours: this.generateToursMenu(hotelData.localAttractions),
    };

    return menu;
  }

  // ============================================
  // Private Section Generators
  // ============================================

  private generateBasicInfoSection(hotelData: BasicHotelData): string {
    return `HOTEL INFORMATION:
Name: ${hotelData.name}
Address: ${hotelData.address}
Phone: ${hotelData.phone || 'Contact front desk'}
Website: ${hotelData.website || 'Not available'}
Rating: ${hotelData.rating ? `${hotelData.rating}/5 stars` : 'Not rated'}
Category: ${this.getHotelCategory(hotelData)}
Location: ${hotelData.location.lat}, ${hotelData.location.lng}`;
  }

  private generateServicesSection(services: HotelService[]): string {
    if (services.length === 0) {
      return '';
    }

    const servicesByType = this.groupServicesByType(services);
    let section = 'SERVICES AVAILABLE:\n';

    Object.entries(servicesByType).forEach(([type, typeServices]) => {
      section += `\n${type.toUpperCase()}:\n`;
      typeServices.forEach(service => {
        section += `- ${service.name}: ${service.description}`;
        if (service.price) {
          section += ` (${service.price})`;
        }
        if (service.hours) {
          section += ` - Available: ${service.hours}`;
        }
        section += '\n';
      });
    });

    return section;
  }

  private generateRoomTypesSection(roomTypes: RoomType[]): string {
    if (roomTypes.length === 0) {
      return '';
    }

    let section = 'ROOM TYPES:\n';
    roomTypes.forEach(room => {
      section += `\n${room.name}:\n`;
      section += `- Description: ${room.description}\n`;
      section += `- Price: ${room.price}\n`;
      section += `- Capacity: ${room.capacity} guests\n`;
      section += `- Amenities: ${room.amenities.join(', ')}\n`;
    });

    return section;
  }

  private generateAmenitiesSection(amenities: string[]): string {
    if (amenities.length === 0) {
      return '';
    }

    return `AMENITIES:
${amenities.map(amenity => `- ${amenity}`).join('\n')}`;
  }

  private generatePoliciesSection(policies: any): string {
    return `HOTEL POLICIES:
Check-in: ${policies.checkIn}
Check-out: ${policies.checkOut}
Cancellation: ${policies.cancellation}`;
  }

  private generateLocalAttractionsSection(
    attractions: LocalAttraction[]
  ): string {
    if (attractions.length === 0) {
      return '';
    }

    const attractionsByCategory = this.groupAttractionsByCategory(attractions);
    let section = 'LOCAL ATTRACTIONS:\n';

    Object.entries(attractionsByCategory).forEach(
      ([category, categoryAttractions]) => {
        section += `\n${category.toUpperCase()}:\n`;
        categoryAttractions.forEach(attraction => {
          section += `- ${attraction.name} (${attraction.distance}): ${attraction.description}`;
          if (attraction.rating) {
            section += ` - Rating: ${attraction.rating}/5`;
          }
          section += '\n';
        });
      }
    );

    return section;
  }

  private generateContactSection(hotelData: BasicHotelData): string {
    return `CONTACT INFORMATION:
Address: ${hotelData.address}
Phone: ${hotelData.phone || 'Available at front desk'}
Website: ${hotelData.website || 'Not available'}
Operating Hours: ${hotelData.openingHours?.join(', ') || 'Contact hotel for hours'}`;
  }

  private generateReviewsSection(reviewData: any): string {
    if (!reviewData || !reviewData.totalReviews) {
      return '';
    }

    return `GUEST REVIEWS:
Average Rating: ${reviewData.averageRating}/5 (${reviewData.totalReviews} reviews)
What Guests Love: ${reviewData.commonPraises?.join(', ') || 'Great service'}
Areas for Improvement: ${reviewData.commonComplaints?.join(', ') || 'Continuous improvement'}`;
  }

  private generateCompetitorSection(competitorData: any): string {
    if (!competitorData || !competitorData.uniqueSellingPoints) {
      return '';
    }

    return `UNIQUE SELLING POINTS:
${competitorData.uniqueSellingPoints.map((point: string) => `- ${point}`).join('\n')}
Market Position: ${competitorData.marketPosition || 'Mid-range'}`;
  }

  private generateFunctionDescriptions(services: HotelService[]): string {
    const availableServices = services.filter(s => s.available);
    if (availableServices.length === 0) {
      return 'Standard hotel information services';
    }

    return availableServices
      .map(service => `- ${service.name}: ${service.description}`)
      .join('\n');
  }

  // ============================================
  // Service Menu Generators
  // ============================================

  private generateRoomServiceMenu(services: HotelService[]): ServiceMenuItem[] {
    const roomServices = services.filter(s => s.type === 'room_service');
    return roomServices.map(service => ({
      name: service.name,
      description: service.description,
      price: service.price || 'Contact for pricing',
      available: service.available,
    }));
  }

  private generateHousekeepingMenu(
    services: HotelService[]
  ): ServiceMenuItem[] {
    const housekeepingServices = services.filter(
      s => s.type === 'housekeeping'
    );
    return housekeepingServices.map(service => ({
      name: service.name,
      description: service.description,
      price: service.price || 'Complimentary',
      available: service.available,
    }));
  }

  private generateConciergeMenu(services: HotelService[]): ServiceMenuItem[] {
    const conciergeServices = services.filter(s => s.type === 'concierge');
    return conciergeServices.map(service => ({
      name: service.name,
      description: service.description,
      price: service.price || 'Complimentary',
      available: service.available,
    }));
  }

  private generateTransportationMenu(
    services: HotelService[]
  ): ServiceMenuItem[] {
    const transportServices = services.filter(s => s.type === 'transportation');
    return transportServices.map(service => ({
      name: service.name,
      description: service.description,
      price: service.price || 'Contact for pricing',
      available: service.available,
    }));
  }

  private generateSpaMenu(services: HotelService[]): ServiceMenuItem[] {
    const spaServices = services.filter(s => s.type === 'spa');
    return spaServices.map(service => ({
      name: service.name,
      description: service.description,
      price: service.price || 'Contact for pricing',
      available: service.available,
    }));
  }

  private generateToursMenu(attractions: LocalAttraction[]): ServiceMenuItem[] {
    return attractions.slice(0, 10).map(attraction => ({
      name: `Tour to ${attraction.name}`,
      description: `${attraction.description} - ${attraction.distance} away`,
      price: 'Contact for pricing',
      available: true,
    }));
  }

  // ============================================
  // Helper Methods
  // ============================================

  private isAdvancedHotelData(data: any): data is AdvancedHotelData {
    return 'reviewData' in data && 'competitorData' in data;
  }

  private getHotelCategory(hotelData: BasicHotelData): string {
    if (hotelData.priceLevel === undefined) {
      return 'hotel';
    }

    switch (hotelData.priceLevel) {
      case 0:
        return 'budget hotel';
      case 1:
        return 'budget hotel';
      case 2:
        return 'mid-range hotel';
      case 3:
        return 'upscale hotel';
      case 4:
        return 'luxury hotel';
      default:
        return 'hotel';
    }
  }

  private groupServicesByType(
    services: HotelService[]
  ): Record<string, HotelService[]> {
    const grouped: Record<string, HotelService[]> = {};

    services.forEach(service => {
      if (!grouped[service.type]) {
        grouped[service.type] = [];
      }
      grouped[service.type].push(service);
    });

    return grouped;
  }

  private groupAttractionsByCategory(
    attractions: LocalAttraction[]
  ): Record<string, LocalAttraction[]> {
    const grouped: Record<string, LocalAttraction[]> = {};

    attractions.forEach(attraction => {
      if (!grouped[attraction.category]) {
        grouped[attraction.category] = [];
      }
      grouped[attraction.category].push(attraction);
    });

    return grouped;
  }
}

// ============================================
// Types for Knowledge Base Generation
// ============================================

export interface SystemPromptCustomization {
  personality: 'professional' | 'friendly' | 'luxurious' | 'casual';
  tone: 'formal' | 'friendly' | 'enthusiastic' | 'calm';
  languages: string[];
  specialInstructions?: string;
}

export interface ServiceMenu {
  roomService: ServiceMenuItem[];
  housekeeping: ServiceMenuItem[];
  concierge: ServiceMenuItem[];
  transportation: ServiceMenuItem[];
  spa: ServiceMenuItem[];
  tours: ServiceMenuItem[];
}

export interface ServiceMenuItem {
  name: string;
  description: string;
  price: string;
  available: boolean;
}
