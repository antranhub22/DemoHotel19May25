/**
 * Utility to extract service details from AI-generated summary
 */

import {
  extractRoomNumber as extractRoomNumberShared,
  removeSimilarItems,
} from '@/lib/sharedUtils';
import { OrderSummary, OrderItem } from '@/types';

/**
 * Defines regex patterns to extract service information from summary text
 */
const PATTERNS = {
  // Enhanced room number detection with multiple formats
  roomNumber:
    /(?:room(?:\s+number)?|room|phòng)(?:\s*[:#-]?\s*)([0-9]{1,4}[A-Za-z]?)|(?:staying in|in room|in phòng|phòng số)(?:\s+)([0-9]{1,4}[A-Za-z]?)/i,
  // General service categories with their detection patterns
  food: /food|beverage|breakfast|lunch|dinner|meal|drink|snack|restaurant/i,
  housekeeping: /housekeeping|cleaning|towel|cleaning\s*service|laundry/i,
  roomService: /room\s*service/i,
  spa: /spa|massage|wellness|treatment/i,
  transportation: /transportation|taxi|car|shuttle|airport\s*transfer/i,

  // Additional service categories
  tours: /tour|sightseeing|excursion|attraction|visit|activity/i,
  technical: /wifi|internet|tv|television|remote|device|technical|connection/i,
  concierge: /reservation|booking|restaurant|ticket|arrangement|concierge/i,
  wellness: /gym|fitness|exercise|yoga|swimming|pool|sauna/i,
  security: /safe|security|lost|found|key|card|lock|emergency/i,
  specialOccasion:
    /birthday|anniversary|celebration|honeymoon|proposal|wedding|special occasion/i,

  // Support categories
  wifi: /wifi|internet|connection|password/i,
  checkIn: /check\s*-?\s*in|registration/i,
  checkOut: /check\s*-?\s*out|departure/i,
  information: /information|hotel\s*info|facilities|amenities/i,
  feedback: /feedback|suggestion|complaint|comment/i,
  support: /support|help|assistance|issue/i,

  // Other category - will be used for unmatched requests
  other:
    /currency\s*exchange|money\s*change|exchange\s*money|foreign\s*currency|bus\s*ticket|train\s*ticket|sell|purchase|buy/i,

  // Item extraction
  items: /items?[:\s]*([^.]+)/i,

  // Request patterns
  request:
    /(?:requested|asked for|ordered|booking|reservation for|inquired about)\s+([^.;]+)/gi,

  // Bullet points
  bullets: /(?:^|\n)[-•*]\s*([^\n]+)/g,

  // Sentences
  sentences: /\.(?:\s|$)/,

  // Delivery time patterns
  deliveryTime: {
    asap: /as\s*soon\s*as\s*possible|right\s*away|immediately|asap/i,
    thirtyMin: /30\s*min|half\s*an\s*hour|30\s*minutes/i,
    oneHour: /(?:1|one)\s*hour|60\s*minutes/i,
    specific:
      /specific\s*time|scheduled|later|tomorrow|tonight|afternoon|evening|morning/i,
  },

  // Special instructions
  specialInstructions:
    /special(?:\s+instructions?|(?:\s+notes?)|(?:\s+requests?))(?:\s*:)?\s*([^.]+)/i,

  // Total amount
  totalAmount:
    /(?:total(?:\s+amount)?|cost|price|charge)(?:\s*:)?\s*\$?\s*([0-9]+(?:\.[0-9]{1,2})?)/i,
};

/**
 * Service category mapping from detected keywords to form values
 */
const serviceCategoryMapping: Record<string, string> = {
  roomService: 'room-service',
  food: 'food-beverage',
  housekeeping: 'housekeeping',
  transportation: 'transportation',
  spa: 'spa',
  tours: 'tours-activities',
  technical: 'technical-support',
  concierge: 'concierge',
  wellness: 'wellness-fitness',
  security: 'security',
  specialOccasion: 'special-occasions',

  // Support categories
  wifi: 'wifi-faq',
  checkIn: 'check-in-out',
  checkOut: 'check-in-out',
  information: 'hotel-info',
  tourism: 'attractions',
  feedback: 'feedback',
  support: 'support',

  // Category for miscellaneous services
  other: 'other',
};

/**
 * Extract room number from summary text
 */
export function extractRoomNumber(summary: string): string | null {
  const match = summary.match(PATTERNS.roomNumber);

  // If we got a match, check which capturing group has the value
  if (match) {
    // The regex has two capturing groups, we need to check which one matched
    return match[1] || match[2] || null;
  }

  // Also try to find room numbers in "details" or "room number" sections
  const roomDetails = summary.match(
    /(?:room details|room number|phòng số)(?:\s*[:#-]?\s*)([0-9]{1,4}[A-Za-z]?)/i
  );
  if (roomDetails && roomDetails[1]) {
    return roomDetails[1];
  }

  // Extract room number from specific details format
  const detailsMatch = summary.match(
    /(?:details[\s\S]*?room(?:\s+number)?[\s\S]*?)([0-9]{1,4}[A-Za-z]?)/i
  );
  if (detailsMatch && detailsMatch[1]) {
    return detailsMatch[1];
  }

  return null;
}

/**
 * Determine ALL service categories mentioned in the summary text
 */
function determineOrderTypes(summary: string): string[] {
  // Initialize an empty array to hold all matching service types
  const serviceTypes: string[] = [];

  // Check for each service type pattern and add to the array if found
  if (PATTERNS.food.test(summary)) {
    serviceTypes.push('food');
  }
  if (PATTERNS.housekeeping.test(summary)) {
    serviceTypes.push('housekeeping');
  }
  if (PATTERNS.transportation.test(summary)) {
    serviceTypes.push('transportation');
  }
  if (PATTERNS.roomService.test(summary)) {
    serviceTypes.push('roomService');
  }
  if (PATTERNS.spa.test(summary)) {
    serviceTypes.push('spa');
  }
  if (PATTERNS.tours.test(summary)) {
    serviceTypes.push('tours');
  }
  if (PATTERNS.technical.test(summary)) {
    serviceTypes.push('technical');
  }
  if (PATTERNS.concierge.test(summary)) {
    serviceTypes.push('concierge');
  }
  if (PATTERNS.wellness.test(summary)) {
    serviceTypes.push('wellness');
  }
  if (PATTERNS.security.test(summary)) {
    serviceTypes.push('security');
  }
  if (PATTERNS.specialOccasion.test(summary)) {
    serviceTypes.push('specialOccasion');
  }
  if (PATTERNS.other.test(summary)) {
    serviceTypes.push('other');
  }

  // Map the detected types to form values
  const mappedTypes = serviceTypes.map(
    type => serviceCategoryMapping[type] || 'other'
  );

  // Default to "other" if nothing matches
  return mappedTypes.length > 0 ? mappedTypes : ['other'];
}

/**
 * Combine multiple service types into a single string representation
 */
function determineOrderType(summary: string): string {
  const types = determineOrderTypes(summary);
  return types.join(',');
}

/**
 * Extract requested items from summary text and attempt to generate price estimates
 */
function extractItems(summary: string): OrderItem[] {
  const match = summary.match(PATTERNS.items);
  let allItems: OrderItem[] = [];

  // First look for bulleted items (most reliable format from AI)
  const bulletItems = summary.match(PATTERNS.bullets);
  if (bulletItems && bulletItems.length > 0) {
    const parsedItems = bulletItems
      .map((item, index) => {
        // Remove the bullet and trim
        const cleanItem = item.replace(/^[-•*]\s*/, '').trim();
        return createOrderItem(cleanItem, index);
      })
      .filter(item => item.name.length > 0);

    allItems = [...allItems, ...parsedItems];
  }

  // Look for request patterns to find all requests in the summary
  {
    const requestItems = summary.match(PATTERNS.request);
    if (requestItems && requestItems.length > 0) {
      const parsedItems = requestItems
        .map((item, index) => {
          // Remove the request prefix
          const cleanItem = item
            .replace(
              /(?:requested|asked for|ordered|booking|reservation for|inquired about)\s+/i,
              ''
            )
            .trim();
          return createOrderItem(cleanItem, index);
        })
        .filter(item => item.name.length > 0);

      allItems = [...allItems, ...parsedItems];
    }
  }

  // Use the explicit items section if we found one
  if (match) {
    const itemsText = match[1];
    // Split by commas, "and", or other common separators
    const itemList = itemsText.split(/(?:,\s*|\s+and\s+|\s*&\s*|\s*\+\s*)/);

    // Convert text items to OrderItem objects with default values
    const parsedItems = itemList
      .map((item, index) => createOrderItem(item, index))
      .filter(item => item.name.length > 0);

    allItems = [...allItems, ...parsedItems];
  }

  // Final fallback: Split the entire summary by sentences and look for potential requests
  if (allItems.length === 0) {
    const sentences = summary.split(PATTERNS.sentences);
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      // Only process sentences that look like they might contain a request
      if (
        sentence.toLowerCase().includes('request') ||
        sentence.toLowerCase().includes('book') ||
        sentence.toLowerCase().includes('order') ||
        sentence.toLowerCase().includes('exchange') ||
        sentence.toLowerCase().includes('inquired')
      ) {
        allItems.push(createOrderItem(sentence, allItems.length));
      }
    }
  }

  // Remove duplicates using shared utility
  const uniqueItems = removeSimilarItems(allItems, 0.8);

  // Ensure we have unique item IDs
  return uniqueItems.map((item, index) => ({
    ...item,
    id: (index + 1).toString(),
  }));
}

/**
 * Helper function to create an OrderItem from text
 */
function createOrderItem(itemText: string, index: number): OrderItem {
  const trimmedItem = itemText
    .trim()
    .replace(/^[-•*]\s+/, '') // Remove bullet point if present
    .replace(/^- /, ''); // Remove dash if present

  // Try to extract quantity if it's at the start of the item (e.g., "2 towels")
  const quantityMatch = trimmedItem.match(/^([0-9]+)\s+(.+)$/);
  const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
  const name = quantityMatch ? quantityMatch[2] : trimmedItem;

  // Generate a more descriptive content for the details field
  let description = '';

  // Check for date-related details
  const dateMatch = trimmedItem.match(
    /(?:on|for)\s+((?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/i
  );
  const dateInfo = dateMatch ? `Date: ${dateMatch[1]}` : '';

  // Check for people/quantity information
  const peopleMatch = trimmedItem.match(
    /(\d+)\s+(?:people|person|pax|guest|adult|child|passenger)/i
  );
  const peopleInfo = peopleMatch ? `Guests: ${peopleMatch[1]} people` : '';

  // Check for location/destination information
  const locationMatch = trimmedItem.match(
    /(?:to|in|at|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|[A-Z][A-Z]+|[A-Z][a-z]+)/
  );
  const locationInfo = locationMatch ? `Location: ${locationMatch[1]}` : '';

  // Check for time information
  const timeMatch = trimmedItem.match(
    /(?:at|from)\s+(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))/i
  );
  const timeInfo = timeMatch ? `Time: ${timeMatch[1]}` : '';

  // Check for price or amount information
  const amountMatch = trimmedItem.match(
    /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:USD|US dollars|\$|VND|dong)/i
  );
  const amountInfo = amountMatch
    ? `Amount: ${amountMatch[1]} ${amountMatch[0].includes('USD') || amountMatch[0].includes('US') || amountMatch[0].includes('$') ? 'USD' : 'VND'}`
    : '';

  // Combine the detailed information with line breaks
  const detailParts = [
    dateInfo,
    peopleInfo,
    locationInfo,
    timeInfo,
    amountInfo,
  ].filter(part => part.length > 0);

  // If we extracted specific details, use them; otherwise use a generic description
  if (detailParts.length > 0) {
    description = detailParts.join('\n');
  } else {
    description = `Details for ${name.charAt(0).toLowerCase() + name.slice(1)}`;
  }

  return {
    id: (index + 1).toString(),
    name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
    description,
    quantity,
    price: estimatePrice(name), // Assign a reasonable default price
  };
}

/**
 * Simple price estimation based on item type
 */
function estimatePrice(itemName: string): number {
  const lowerItem = itemName.toLowerCase();

  // Food items
  if (
    /sandwich|burger|pasta|steak|fish|chicken|breakfast|lunch|dinner/.test(
      lowerItem
    )
  ) {
    return 15.0;
  }

  // Beverages
  if (/coffee|tea|juice|water|soda|wine|beer|cocktail|drink/.test(lowerItem)) {
    return 8.0;
  }

  // Room supplies
  if (/towel|soap|shampoo|toothbrush|toothpaste|amenities/.test(lowerItem)) {
    return 5.0;
  }

  // Services
  if (/cleaning|housekeeping|laundry|ironing/.test(lowerItem)) {
    return 20.0;
  }

  // Transport
  if (/taxi|car|shuttle|transfer/.test(lowerItem)) {
    return 30.0;
  }

  // Default price for other items
  return 10.0;
}

/**
 * Main function to parse AI summary and extract order details
 * Returns an OrderSummary object with extracted information
 */
export function parseSummaryToOrderDetails(
  summary: string
): Partial<OrderSummary> {
  if (!summary) {
    return {};
  }

  // Extract individual components using shared utilities
  const roomNumber = extractRoomNumberShared(summary) || '';
  const orderType = determineOrderType(summary);
  // ✅ FIXED: Use inline extraction instead of missing shared functions
  const deliveryTime =
    summary.match(/delivery.*?time:?\s*([^.\n]+)/i)?.[1]?.trim() || '';
  const specialInstructions =
    summary.match(/special.*?instructions?:?\s*([^.\n]+)/i)?.[1]?.trim() || '';
  const items = extractItems(summary);
  const totalAmount =
    parseFloat(
      summary.match(/total.*?amount?:?\s*(\d+(?:\.\d+)?)/i)?.[1] || '0'
    ) || 0;

  return {
    roomNumber,
    orderType,
    deliveryTime: deliveryTime as
      | 'asap'
      | '30min'
      | '1hour'
      | 'specific'
      | undefined,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialInstructions,
    items,
    totalAmount,
  };
}
