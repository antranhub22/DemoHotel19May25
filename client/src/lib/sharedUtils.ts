/**
 * Shared utility functions for text processing and data extraction
 */

// ========================================
// TEXT PROCESSING UTILITIES
// ========================================

/**
 * Normalize text for comparison
 */
export function normalizeText(text: string): string {
  return text
    .replace(/([.,!?;:()"'-])/g, ' $1 ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Calculate string similarity between 0 and 1
 * Higher values mean strings are more similar
 */
export function stringSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  if (str1.length === 0 || str2.length === 0) return 0.0;
  
  // Get longest common substring
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  // Check if the shorter string appears in the longer one
  if (longer.includes(shorter)) {
    return shorter.length / longer.length;
  }
  
  // Count matching characters
  let matches = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) {
      matches++;
    }
  }
  
  return matches / shorter.length;
}

/**
 * Remove duplicates from array using similarity comparison
 */
export function removeSimilarItems<T extends { name: string }>(items: T[], similarityThreshold: number = 0.8): T[] {
  const uniqueItems: T[] = [];
  const nameMap = new Map<string, boolean>();
  
  for (const item of items) {
    const normalizedName = item.name.toLowerCase().replace(/\s+/g, ' ').trim();
    
    let isDuplicate = false;
    const existingNames = Array.from(nameMap.keys());
    
    for (const existingName of existingNames) {
      if (stringSimilarity(normalizedName, existingName) > similarityThreshold) {
        isDuplicate = true;
        break;
      }
    }
    
    if (!isDuplicate) {
      nameMap.set(normalizedName, true);
      uniqueItems.push(item);
    }
  }
  
  return uniqueItems;
}

// ========================================
// REGEX PATTERNS
// ========================================

export const PATTERNS = {
  // Room number detection
  roomNumber: /(?:room(?:\s+number)?|room|phòng)(?:\s*[:#\-]?\s*)([0-9]{1,4}[A-Za-z]?)|(?:staying in|in room|in phòng|phòng số)(?:\s+)([0-9]{1,4}[A-Za-z]?)/i,
  
  // Service categories
  food: /food|beverage|breakfast|lunch|dinner|meal|drink|snack|restaurant/i,
  housekeeping: /housekeeping|cleaning|towel|cleaning\s*service|laundry/i,
  roomService: /room\s*service/i,
  spa: /spa|massage|wellness|treatment/i,
  transportation: /transportation|taxi|car|shuttle|airport\s*transfer/i,
  tours: /tour|sightseeing|excursion|attraction|visit|activity/i,
  technical: /wifi|internet|tv|television|remote|device|technical|connection/i,
  concierge: /reservation|booking|restaurant|ticket|arrangement|concierge/i,
  wellness: /gym|fitness|exercise|yoga|swimming|pool|sauna/i,
  security: /safe|security|lost|found|key|card|lock|emergency/i,
  specialOccasion: /birthday|anniversary|celebration|honeymoon|proposal|wedding|special occasion/i,
  
  // Support categories
  wifi: /wifi|internet|connection|password/i,
  checkIn: /check\s*-?\s*in|registration/i,
  checkOut: /check\s*-?\s*out|departure/i,
  information: /information|hotel\s*info|facilities|amenities/i,
  feedback: /feedback|suggestion|complaint|comment/i,
  support: /support|help|assistance|issue/i,
  
  // Other category
  other: /currency\s*exchange|money\s*change|exchange\s*money|foreign\s*currency|bus\s*ticket|train\s*ticket|sell|purchase|buy/i,
  
  // Item extraction
  items: /items?[:\s]*([^\.]+)/i,
  
  // Time patterns
  time: /(?:at|from)\s+(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))/i,
  
  // Date patterns
  date: /(?:on|for)\s+((?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/i,
  
  // People/quantity patterns
  people: /(\d+)\s+(?:people|person|pax|guest|adult|child|passenger)/i,
  
  // Location patterns
  location: /(?:to|in|at|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|[A-Z][A-Z]+|[A-Z][a-z]+)/,
  
  // Amount patterns
  amount: /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:USD|US dollars|\$|VND|dong)/i,
  
  // Request patterns
  request: /(?:requested|asked for|ordered|booking|reservation for|inquired about)\s+([^\.;]+)/gi,
  
  // Bullet points
  bullets: /(?:^|\n)[-•*]\s*([^\n]+)/g,
  
  // Sentences
  sentences: /\.(?:\s|$)/,
  
  // Special instructions
  specialInstructions: /(?:special|additional|extra|note|instruction|request|preference)[:\s]*([^\.]+)/i,
  
  // Delivery time
  deliveryTime: /(?:delivery|arrival|ready|serve|bring)[:\s]*([^\.]+)/i,
  
  // Total amount
  totalAmount: /(?:total|amount|cost|price|bill|charge)[:\s]*(\d+(?:,\d+)*(?:\.\d+)?)/i
};

// ========================================
// EXTRACTION UTILITIES
// ========================================

/**
 * Extract room number from text
 */
export function extractRoomNumber(text: string): string | null {
  const match = text.match(PATTERNS.roomNumber);
  return match ? (match[1] || match[2]) : null;
}

/**
 * Extract time information from text
 */
export function extractTime(text: string): string | null {
  const match = text.match(PATTERNS.time);
  return match ? match[1] : null;
}

/**
 * Extract date information from text
 */
export function extractDate(text: string): string | null {
  const match = text.match(PATTERNS.date);
  return match ? match[1] : null;
}

/**
 * Extract people/quantity information from text
 */
export function extractPeople(text: string): string | null {
  const match = text.match(PATTERNS.people);
  return match ? match[1] : null;
}

/**
 * Extract location information from text
 */
export function extractLocation(text: string): string | null {
  const match = text.match(PATTERNS.location);
  return match ? match[1] : null;
}

/**
 * Extract amount information from text
 */
export function extractAmount(text: string): string | null {
  const match = text.match(PATTERNS.amount);
  return match ? match[1] : null;
}

/**
 * Extract special instructions from text
 */
export function extractSpecialInstructions(text: string): string | null {
  const match = text.match(PATTERNS.specialInstructions);
  return match ? match[1].trim() : null;
}

/**
 * Extract delivery time from text
 */
export function extractDeliveryTime(text: string): string | null {
  const match = text.match(PATTERNS.deliveryTime);
  return match ? match[1].trim() : null;
}

/**
 * Extract total amount from text
 */
export function extractTotalAmount(text: string): number | null {
  const match = text.match(PATTERNS.totalAmount);
  return match ? parseFloat(match[1].replace(/,/g, '')) : null;
}

// ========================================
// VALIDATION UTILITIES
// ========================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Validate room number format
 */
export function isValidRoomNumber(roomNumber: string): boolean {
  const roomRegex = /^[0-9]{1,4}[A-Za-z]?$/;
  return roomRegex.test(roomNumber);
}

// ========================================
// FORMATTING UTILITIES
// ========================================

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Format date
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format time
 */
export function formatTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(text: string): string {
  return text.replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
} 