import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { z } from 'zod';

// ============================================
// Types & Interfaces for Hotel Research
// ============================================

export interface BasicHotelData {
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  priceLevel?: number;
  location: {
    lat: number;
    lng: number;
  };
  categories: string[];
  openingHours?: string[];
  photos?: string[];
  services: HotelService[];
  amenities: string[];
  policies: HotelPolicies;
  roomTypes: RoomType[];
  localAttractions: LocalAttraction[];
}

export interface AdvancedHotelData extends BasicHotelData {
  socialMediaData: SocialMediaData;
  reviewData: ReviewData;
  competitorData: CompetitorData;
}

export interface HotelService {
  name: string;
  description: string;
  type: 'room_service' | 'spa' | 'restaurant' | 'tour' | 'transportation' | 'housekeeping' | 'concierge' | 'other';
  available: boolean;
  price?: string;
  hours?: string;
}

export interface HotelPolicies {
  checkIn: string;
  checkOut: string;
  cancellation: string;
  petPolicy?: string;
  smokingPolicy?: string;
  ageRequirement?: string;
}

export interface RoomType {
  name: string;
  description: string;
  price: string;
  capacity: number;
  amenities: string[];
  images?: string[];
}

export interface LocalAttraction {
  name: string;
  description: string;
  distance: string;
  category: 'beach' | 'restaurant' | 'landmark' | 'shopping' | 'entertainment' | 'nature' | 'cultural';
  rating?: number;
}

export interface SocialMediaData {
  instagram?: {
    followers: number;
    recentPosts: string[];
  };
  facebook?: {
    likes: number;
    reviews: number;
  };
}

export interface ReviewData {
  averageRating: number;
  totalReviews: number;
  platforms: {
    google: { rating: number; reviews: number };
    tripadvisor: { rating: number; reviews: number };
    booking: { rating: number; reviews: number };
  };
  commonPraises: string[];
  commonComplaints: string[];
}

export interface CompetitorData {
  nearbyHotels: Array<{
    name: string;
    rating: number;
    priceRange: string;
    distance: string;
  }>;
  marketPosition: 'budget' | 'mid-range' | 'luxury';
  uniqueSellingPoints: string[];
}

// ============================================
// Error Handling & Rate Limiting
// ============================================

export class HotelResearchError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'HotelResearchError';
  }
}

interface RateLimitInfo {
  requests: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitInfo> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 3600000) { // 100 requests per hour
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const limit = this.limits.get(key);

    if (!limit) {
      this.limits.set(key, { requests: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (now > limit.resetTime) {
      this.limits.set(key, { requests: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (limit.requests >= this.maxRequests) {
      return false;
    }

    limit.requests++;
    return true;
  }
}

// ============================================
// Hotel Research Service
// ============================================

export class HotelResearchService {
  private googlePlacesApiKey: string;
  private rateLimiter: RateLimiter;
  private baseUrl = 'https://maps.googleapis.com/maps/api/place';

  constructor() {
    this.googlePlacesApiKey = process.env.GOOGLE_PLACES_API_KEY || '';
    this.rateLimiter = new RateLimiter();
    
    if (!this.googlePlacesApiKey) {
      console.warn('Google Places API key not found. Hotel research will be limited.');
    }
  }

  // ============================================
  // Public Methods
  // ============================================

  /**
   * Basic tier research using free/cheap APIs
   */
  async basicResearch(hotelName: string, location?: string): Promise<BasicHotelData> {
    if (!this.rateLimiter.canMakeRequest('basic_research')) {
      throw new HotelResearchError('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429);
    }

    try {
      console.log(`🔍 Starting basic research for: ${hotelName}`);
      
      // 1. Get Google Places data
      const googlePlacesData = await this.getGooglePlacesData(hotelName, location);
      
      // 2. Scrape website if available
      let websiteData: any = {};
      if (googlePlacesData.website) {
        try {
          websiteData = await this.scrapeOfficialWebsite(googlePlacesData.website);
        } catch (error) {
          console.warn('Website scraping failed:', (error as any).message || error);
        }
      }

      // 3. Combine and structure data
      const hotelData: BasicHotelData = {
        name: googlePlacesData.name || hotelName,
        address: googlePlacesData.formatted_address || location || '',
        phone: googlePlacesData.formatted_phone_number,
        website: googlePlacesData.website,
        rating: googlePlacesData.rating,
        priceLevel: googlePlacesData.price_level,
        location: {
          lat: googlePlacesData.geometry?.location?.lat || 0,
          lng: googlePlacesData.geometry?.location?.lng || 0
        },
        categories: googlePlacesData.types || [],
        openingHours: googlePlacesData.opening_hours?.weekday_text || [],
        photos: this.extractPhotoUrls(googlePlacesData.photos || []),
        services: this.extractServices(websiteData),
        amenities: this.extractAmenities(websiteData, googlePlacesData),
        policies: this.extractPolicies(websiteData),
        roomTypes: this.extractRoomTypes(websiteData),
        localAttractions: await this.getNearbyAttractions(googlePlacesData.geometry?.location)
      };

      console.log(`✅ Basic research completed for: ${hotelName}`);
      return hotelData;
    } catch (error) {
      console.error('Basic research failed:', (error as any).message || error);
      throw new HotelResearchError(
        `Failed to research hotel: ${(error as any).message || error}`,
        'RESEARCH_FAILED',
        500
      );
    }
  }

  /**
   * Advanced tier research using paid APIs (for premium plans)
   */
  async advancedResearch(hotelName: string, location?: string): Promise<AdvancedHotelData> {
    if (!this.rateLimiter.canMakeRequest('advanced_research')) {
      throw new HotelResearchError('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429);
    }

    try {
      console.log(`🔍 Starting advanced research for: ${hotelName}`);
      
      // Get basic data first
      const basicData = await this.basicResearch(hotelName, location);
      
      // Get advanced data
      const [socialMediaData, reviewData, competitorData] = await Promise.allSettled([
        this.getSocialMediaData(hotelName),
        this.getReviewData(hotelName),
        this.getCompetitorAnalysis(hotelName, basicData.location)
      ]);

      const advancedData: AdvancedHotelData = {
        ...basicData,
        socialMediaData: socialMediaData.status === 'fulfilled' ? socialMediaData.value : {} as SocialMediaData,
        reviewData: reviewData.status === 'fulfilled' ? reviewData.value : {} as ReviewData,
        competitorData: competitorData.status === 'fulfilled' ? competitorData.value : {} as CompetitorData
      };

      console.log(`✅ Advanced research completed for: ${hotelName}`);
      return advancedData;
    } catch (error) {
      console.error('Advanced research failed:', (error as any).message || error);
      throw new HotelResearchError(
        `Failed to perform advanced research: ${(error as any).message || error}`,
        'ADVANCED_RESEARCH_FAILED',
        500
      );
    }
  }

  // ============================================
  // Private Methods - Google Places Integration
  // ============================================

  private async getGooglePlacesData(hotelName: string, location?: string): Promise<any> {
    if (!this.googlePlacesApiKey) {
      throw new HotelResearchError('Google Places API key not configured', 'API_KEY_MISSING', 500);
    }

    try {
      const query = location ? `${hotelName} ${location}` : hotelName;
      const searchUrl = `${this.baseUrl}/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id,name,formatted_address,geometry&key=${this.googlePlacesApiKey}`;
      
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();

      const searchDataAny = searchData as any;
      if (!searchDataAny.candidates || searchDataAny.candidates.length === 0) {
        throw new HotelResearchError('Hotel not found in Google Places', 'HOTEL_NOT_FOUND', 404);
      }

      const placeId = searchDataAny.candidates[0].place_id;
      
      // Get detailed information
      const detailsUrl = `${this.baseUrl}/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,rating,price_level,opening_hours,photos,types,geometry&key=${this.googlePlacesApiKey}`;
      
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();
      if ((detailsData as any).status !== 'OK') {
        throw new HotelResearchError(`Google Places API error: ${(detailsData as any).status}`, 'API_ERROR', 500);
      }
      return (detailsData as any).result;
    } catch (error) {
      if (error instanceof HotelResearchError) {
        throw error;
      }
      throw new HotelResearchError(`Google Places API request failed: ${(error as any).message || error}`, 'API_REQUEST_FAILED', 500);
    }
  }

  private extractPhotoUrls(photos: any[]): string[] {
    if (!photos || photos.length === 0) return [];
    
    return photos.slice(0, 10).map(photo => 
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${this.googlePlacesApiKey}`
    );
  }

  private async getNearbyAttractions(location?: { lat: number; lng: number }): Promise<LocalAttraction[]> {
    if (!location || !this.googlePlacesApiKey) return [];

    try {
      const radius = 5000; // 5km radius
      const nearbyUrl = `${this.baseUrl}/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&type=tourist_attraction&key=${this.googlePlacesApiKey}`;
      
      const response = await fetch(nearbyUrl);
      const data = await response.json();

      const dataAny = data as any;
      if (dataAny.status !== 'OK') return [];

      return dataAny.results.slice(0, 10).map((place: any) => ({
        name: place.name,
        description: place.types.join(', '),
        distance: this.calculateDistance(location, place.geometry.location),
        category: this.categorizeAttraction(place.types),
        rating: place.rating
      }));
    } catch (error) {
      console.warn('Failed to get nearby attractions:', (error as any).message || error);
      return [];
    }
  }

  // ============================================
  // Private Methods - Website Scraping
  // ============================================

  private async scrapeOfficialWebsite(websiteUrl: string): Promise<any> {
    try {
      console.log(`🕷️ Scraping website: ${websiteUrl}`);
      
      const response = await fetch(websiteUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract structured data
      const scrapedData = {
        title: $('title').text().trim(),
        description: $('meta[name="description"]').attr('content') || '',
        keywords: $('meta[name="keywords"]').attr('content') || '',
        services: this.extractServicesFromHTML($),
        amenities: this.extractAmenitiesFromHTML($),
        policies: this.extractPoliciesFromHTML($),
        roomTypes: this.extractRoomTypesFromHTML($),
        contact: this.extractContactInfo($)
      };

      console.log(`✅ Website scraping completed for: ${websiteUrl}`);
      return scrapedData;
    } catch (error) {
      console.warn(`Website scraping failed for ${websiteUrl}:`, (error as any).message || error);
      return {};
    }
  }

  private extractServicesFromHTML($: cheerio.CheerioAPI): HotelService[] {
    const services: HotelService[] = [];
    
    // Common service keywords and selectors
    const serviceKeywords = {
      'room_service': ['room service', 'in-room dining', 'food delivery'],
      'spa': ['spa', 'massage', 'wellness', 'treatment'],
      'restaurant': ['restaurant', 'dining', 'bar', 'cafe'],
      'tour': ['tour', 'excursion', 'activity', 'sightseeing'],
      'transportation': ['taxi', 'transfer', 'shuttle', 'transport'],
      'housekeeping': ['housekeeping', 'cleaning', 'laundry'],
      'concierge': ['concierge', 'reception', 'front desk']
    };

    // Look for services in text content
    const pageText = $('body').text().toLowerCase();
    
    Object.entries(serviceKeywords).forEach(([type, keywords]) => {
      const found = keywords.some(keyword => pageText.includes(keyword));
      if (found) {
        services.push({
          name: this.formatServiceName(type),
          description: `${this.formatServiceName(type)} available`,
          type: type as any,
          available: true
        });
      }
    });

    return services;
  }

  private extractAmenitiesFromHTML($: cheerio.CheerioAPI): string[] {
    const amenities: string[] = [];
    const amenityKeywords = [
      'wifi', 'parking', 'pool', 'gym', 'fitness', 'breakfast', 'restaurant',
      'bar', 'spa', 'sauna', 'jacuzzi', 'air conditioning', 'tv', 'minibar',
      'balcony', 'view', 'beach access', 'garden', 'terrace'
    ];

    const pageText = $('body').text().toLowerCase();
    
    amenityKeywords.forEach(keyword => {
      if (pageText.includes(keyword)) {
        amenities.push(keyword);
      }
    });

    return Array.from(new Set(amenities)); // Remove duplicates
  }

  private extractPoliciesFromHTML($: cheerio.CheerioAPI): HotelPolicies {
    const pageText = $('body').text().toLowerCase();
    
    // Extract check-in/check-out times
    const checkInMatch = pageText.match(/check.?in[\s:]*(\d{1,2}:?\d{0,2}?\s?(?:am|pm|:00)?)/i);
    const checkOutMatch = pageText.match(/check.?out[\s:]*(\d{1,2}:?\d{0,2}?\s?(?:am|pm|:00)?)/i);
    
    // Extract cancellation policy
    const cancellationMatch = pageText.match(/cancellation[\s\w]*(\d+)\s*(?:hours?|days?)/i);
    
    return {
      checkIn: checkInMatch ? checkInMatch[1] : '15:00',
      checkOut: checkOutMatch ? checkOutMatch[1] : '11:00',
      cancellation: cancellationMatch ? `${cancellationMatch[1]} ${cancellationMatch[0].includes('hour') ? 'hours' : 'days'} before arrival` : 'Contact hotel for cancellation policy'
    };
  }

  private extractRoomTypesFromHTML($: cheerio.CheerioAPI): RoomType[] {
    const roomTypes: RoomType[] = [];
    
    // Look for room type keywords
    const roomKeywords = [
      'standard room', 'deluxe room', 'suite', 'family room', 'twin room',
      'double room', 'single room', 'premium room', 'executive room'
    ];

    const pageText = $('body').text().toLowerCase();
    
    roomKeywords.forEach(roomType => {
      if (pageText.includes(roomType)) {
        roomTypes.push({
          name: roomType.replace(/^\w/, c => c.toUpperCase()),
          description: `Comfortable ${roomType}`,
          price: 'Contact hotel for rates',
          capacity: roomType.includes('family') ? 4 : roomType.includes('twin') ? 2 : 2,
          amenities: ['Air conditioning', 'Private bathroom', 'TV']
        });
      }
    });

    return roomTypes;
  }

  private extractContactInfo($: cheerio.CheerioAPI): any {
    const pageText = $('body').text();
    
    // Extract phone numbers
    const phoneMatch = pageText.match(/(\+?[\d\s\-\(\)]{10,})/g);
    // Extract email addresses
    const emailMatch = pageText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g);
    
    return {
      phone: phoneMatch ? phoneMatch[0] : null,
      email: emailMatch ? emailMatch[0] : null
    };
  }

  // ============================================
  // Private Methods - Advanced Research
  // ============================================

  private async getSocialMediaData(hotelName: string): Promise<SocialMediaData> {
    // Placeholder for social media data extraction
    // In a real implementation, this would use APIs like Instagram Basic Display API
    // or Facebook Graph API
    console.log(`📱 Analyzing social media for: ${hotelName}`);
    
    return {
      instagram: {
        followers: 0,
        recentPosts: []
      },
      facebook: {
        likes: 0,
        reviews: 0
      }
    };
  }

  private async getReviewData(hotelName: string): Promise<ReviewData> {
    // Placeholder for review data aggregation
    // In a real implementation, this would scrape TripAdvisor, Google Reviews, etc.
    console.log(`⭐ Analyzing reviews for: ${hotelName}`);
    
    return {
      averageRating: 4.0,
      totalReviews: 0,
      platforms: {
        google: { rating: 4.0, reviews: 0 },
        tripadvisor: { rating: 4.0, reviews: 0 },
        booking: { rating: 4.0, reviews: 0 }
      },
      commonPraises: ['Clean rooms', 'Friendly staff', 'Good location'],
      commonComplaints: ['Slow wifi', 'Limited parking']
    };
  }

  private async getCompetitorAnalysis(hotelName: string, location: { lat: number; lng: number }): Promise<CompetitorData> {
    // Placeholder for competitor analysis
    // In a real implementation, this would use Google Places API to find nearby hotels
    console.log(`🏨 Analyzing competitors for: ${hotelName}`);
    
    return {
      nearbyHotels: [],
      marketPosition: 'mid-range',
      uniqueSellingPoints: ['Excellent location', 'Personalized service', 'Competitive rates']
    };
  }

  // ============================================
  // Helper Methods
  // ============================================

  private formatServiceName(type: string): string {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private categorizeAttraction(types: string[]): LocalAttraction['category'] {
    if (types.includes('natural_feature')) return 'nature';
    if (types.includes('museum') || types.includes('art_gallery')) return 'cultural';
    if (types.includes('restaurant') || types.includes('food')) return 'restaurant';
    if (types.includes('shopping_mall') || types.includes('store')) return 'shopping';
    if (types.includes('amusement_park') || types.includes('night_club')) return 'entertainment';
    return 'landmark';
  }

  private calculateDistance(point1: { lat: number; lng: number }, point2: { lat: number; lng: number }): string {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Validate hotel research data
   */
  static validateHotelData(data: any): BasicHotelData {
    const schema = z.object({
      name: z.string().min(1),
      address: z.string().min(1),
      phone: z.string().optional(),
      website: z.string().optional(),
      location: z.object({
        lat: z.number(),
        lng: z.number()
      }),
      services: z.array(z.any()).default([]),
      amenities: z.array(z.string()).default([]),
      policies: z.object({
        checkIn: z.string(),
        checkOut: z.string(),
        cancellation: z.string()
      }),
      categories: z.array(z.string()).default([]),
      roomTypes: z.array(z.any()).default([]),
      localAttractions: z.array(z.any()).default([])
    });

    // Bổ sung property nếu thiếu
    const dataAny = data as any;
    if (!dataAny.name) dataAny.name = 'Unknown Hotel';
    if (!dataAny.categories) dataAny.categories = [];
    if (!dataAny.roomTypes) dataAny.roomTypes = [];
    if (!dataAny.localAttractions) dataAny.localAttractions = [];

    return schema.parse(dataAny) as BasicHotelData;
  }

  /**
   * Get research service health status
   */
  async getServiceHealth(): Promise<{ status: string; apis: Record<string, boolean> }> {
    const health = {
      status: 'healthy',
      apis: {
        googlePlaces: !!this.googlePlacesApiKey,
        websiteScraping: true,
        rateLimiting: true
      }
    };

    // Test Google Places API
    if (this.googlePlacesApiKey) {
      try {
        const testUrl = `${this.baseUrl}/findplacefromtext/json?input=hotel&inputtype=textquery&fields=place_id&key=${this.googlePlacesApiKey}`;
        const response = await fetch(testUrl);
        const data = await response.json();
        const dataAny = data as any;
        health.apis.googlePlaces = dataAny.status === 'OK';
      } catch (error) {
        health.apis.googlePlaces = false;
      }
    }

    if (!health.apis.googlePlaces) {
      health.status = 'degraded';
    }

    return health;
  }

  // Public wrappers for amenities, policies, roomTypes extraction
  public extractAmenities(data: any, googlePlacesData?: any): string[] {
    // Ưu tiên lấy từ data nếu có, fallback sang Google Places nếu không
    if (data && data.amenities && Array.isArray(data.amenities)) return data.amenities;
    if (googlePlacesData && googlePlacesData.amenities && Array.isArray(googlePlacesData.amenities)) return googlePlacesData.amenities;
    return [];
  }

  public extractPolicies(data: any): HotelPolicies {
    if (data && data.policies) return data.policies;
    // Fallback mặc định
    return { checkIn: '', checkOut: '', cancellation: '' };
  }

  public extractRoomTypes(data: any): RoomType[] {
    if (data && data.roomTypes && Array.isArray(data.roomTypes)) return data.roomTypes;
    return [];
  }

  public extractServices(data: any): HotelService[] {
    if (data && data.services && Array.isArray(data.services)) return data.services;
    return [];
  }
} 