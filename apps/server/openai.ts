import { logger } from "@shared/utils/logger";
import OpenAI from "openai";

// Initialize OpenAI client only if API key is available
const apiKey = process.env.VITE_OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;
const projectId = process.env.VITE_OPENAI_PROJECT_ID || "";

// ✅ AUDIT: Track whether the last summary generation used the basic fallback (no OpenAI)
let lastSummaryUsedFallback = false;
export function wasLastSummaryUsingFallback(): boolean {
  return lastSummaryUsedFallback;
}

// Service category definitions for better classification
export const SERVICE_CATEGORIES = {
  "room-service": {
    name: "Room Service",
    description: "In-room dining, food and drinks delivered to guest rooms",
    keywords: [
      "food",
      "drink",
      "meal",
      "breakfast",
      "lunch",
      "dinner",
      "snack",
      "water",
      "coffee",
    ],
  },
  "food-beverage": {
    name: "Food & Beverage",
    description:
      "Restaurant reservations, bar service, special dining requests",
    keywords: [
      "restaurant",
      "reservation",
      "bar",
      "dinner",
      "lunch",
      "table",
      "booking",
    ],
  },
  housekeeping: {
    name: "Housekeeping",
    description:
      "Room cleaning, linen change, additional amenities, laundry services",
    keywords: [
      "cleaning",
      "clean",
      "towel",
      "bed",
      "sheet",
      "laundry",
      "amenities",
    ],
  },
  transportation: {
    name: "Transportation",
    description:
      "Taxi service, airport transfers, car rentals, shuttle services",
    keywords: [
      "taxi",
      "car",
      "shuttle",
      "airport",
      "transfer",
      "pickup",
      "transport",
    ],
  },
  spa: {
    name: "Spa",
    description: "Massage appointments, spa treatments, wellness services",
    keywords: ["spa", "massage", "treatment", "wellness", "relax", "therapy"],
  },
  "tours-activities": {
    name: "Tours & Activities",
    description:
      "Tour bookings, excursions, sightseeing, activity arrangements",
    keywords: [
      "tour",
      "activity",
      "excursion",
      "sightseeing",
      "trip",
      "booking",
      "guide",
    ],
  },
  "technical-support": {
    name: "Technical Support",
    description: "WiFi issues, TV problems, electronic device assistance",
    keywords: [
      "wifi",
      "internet",
      "tv",
      "remote",
      "device",
      "connection",
      "technical",
    ],
  },
  concierge: {
    name: "Concierge Services",
    description:
      "General information, recommendations, reservations for outside venues",
    keywords: [
      "concierge",
      "information",
      "recommendation",
      "reservation",
      "booking",
      "ticket",
    ],
  },
  "wellness-fitness": {
    name: "Wellness & Fitness",
    description:
      "Gym access, fitness classes, pool information, wellness facilities",
    keywords: [
      "gym",
      "fitness",
      "exercise",
      "pool",
      "wellness",
      "sauna",
      "yoga",
    ],
  },
  security: {
    name: "Security & Lost Items",
    description: "Safety concerns, lost and found, room safe assistance",
    keywords: ["security", "safe", "lost", "found", "key", "card", "lock"],
  },
  "special-occasions": {
    name: "Special Occasions",
    description: "Birthday/Anniversary arrangements, special event planning",
    keywords: [
      "birthday",
      "anniversary",
      "celebration",
      "special",
      "occasion",
      "event",
    ],
  },
  other: {
    name: "Other Services",
    description:
      "Any services not covered by other categories, such as currency exchange or bus tickets",
    keywords: [
      "currency",
      "exchange",
      "money",
      "bus",
      "ticket",
      "miscellaneous",
      "other",
    ],
  },
};

/**
 * Structure for service request extracted from conversation
 */
export interface ServiceRequest {
  serviceType: string; // Key from SERVICE_CATEGORIES
  requestText: string; // Full text of request
  details: {
    date?: string;
    time?: string;
    location?: string;
    people?: number;
    amount?: string;
    roomNumber?: string;
    otherDetails?: string;
  };
}

/**
 * Generate a comprehensive summary from transcripts without using AI
 * This is a fallback function when OpenAI is not available
 */
export function generateBasicSummary(
  transcripts: Array<{ role: string; content: string }>,
): string {
  if (!transcripts || transcripts.length === 0) {
    return "Nous regrettons de vous informer que votre demande ne contient pas suffisamment d'informations pour nous permettre d'y répondre de manière adéquate. Nous vous invitons à actualiser votre page et à préciser votre requête afin que nous puissions mieux vous accompagner.";
  }

  // Split into guest and assistant messages for easier analysis
  const guestMessages = transcripts.filter((t) => t.role === "user");
  const assistantMessages = transcripts.filter((t) => t.role === "assistant");

  // Extract key information that might be helpful for the form
  const roomNumberMatches = [...guestMessages, ...assistantMessages]
    .map((m) =>
      m.content.match(
        /(?:room\s*(?:number)?|phòng\s*(?:số)?)(?:\s*[:#\-]?\s*)([0-9]{1,4}[A-Za-z]?)|(?:staying in|in room|in phòng|phòng số)(?:\s+)([0-9]{1,4}[A-Za-z]?)/i,
      ),
    )
    .filter(Boolean);

  let roomNumber = "Not specified";
  if (roomNumberMatches.length > 0) {
    const match = roomNumberMatches[0];
    if (match) {
      roomNumber = match[1] || match[2] || "Not specified";
    }
  }

  // Try to identify the service type from the conversation
  const foodServiceMatches = [...guestMessages, ...assistantMessages].some(
    (m) =>
      /food|meal|breakfast|lunch|dinner|sandwich|burger|drink|coffee|tea|juice|water|soda|beer|wine/i.test(
        m.content,
      ),
  );

  const housekeepingMatches = [...guestMessages, ...assistantMessages].some(
    (m) =>
      /housekeeping|cleaning|towel|clean|bed|sheets|laundry/i.test(m.content),
  );

  const transportMatches = [...guestMessages, ...assistantMessages].some((m) =>
    /taxi|car|shuttle|transport|pickup|airport/i.test(m.content),
  );

  const spaMatches = [...guestMessages, ...assistantMessages].some((m) =>
    /spa|massage|wellness|treatment|relax/i.test(m.content),
  );

  // Collect all possible service types that appear in the conversation
  const serviceTypes: string[] = [];
  if (foodServiceMatches) {
    serviceTypes.push("Food & Beverage");
  }
  if (housekeepingMatches) {
    serviceTypes.push("Housekeeping");
  }
  if (transportMatches) {
    serviceTypes.push("Transportation");
  }
  if (spaMatches) {
    serviceTypes.push("Spa Service");
  }

  // Check for additional service types
  const tourMatches = [...guestMessages, ...assistantMessages].some((m) =>
    /tour|sightseeing|excursion|attraction|visit|activity/i.test(m.content),
  );
  if (tourMatches) {
    serviceTypes.push("Tours & Activities");
  }

  const technicalMatches = [...guestMessages, ...assistantMessages].some((m) =>
    /wifi|internet|tv|television|remote|device|technical|connection/i.test(
      m.content,
    ),
  );
  if (technicalMatches) {
    serviceTypes.push("Technical Support");
  }

  const conciergeMatches = [...guestMessages, ...assistantMessages].some((m) =>
    /reservation|booking|restaurant|ticket|arrangement|concierge/i.test(
      m.content,
    ),
  );
  if (conciergeMatches) {
    serviceTypes.push("Concierge Services");
  }

  const wellnessMatches = [...guestMessages, ...assistantMessages].some((m) =>
    /gym|fitness|exercise|yoga|swimming|pool|sauna/i.test(m.content),
  );
  if (wellnessMatches) {
    serviceTypes.push("Wellness & Fitness");
  }

  const securityMatches = [...guestMessages, ...assistantMessages].some((m) =>
    /safe|security|lost|found|key|card|lock|emergency/i.test(m.content),
  );
  if (securityMatches) {
    serviceTypes.push("Security & Lost Items");
  }

  const specialOccasionMatches = [...guestMessages, ...assistantMessages].some(
    (m) =>
      /birthday|anniversary|celebration|honeymoon|proposal|wedding|special occasion/i.test(
        m.content,
      ),
  );
  if (specialOccasionMatches) {
    serviceTypes.push("Special Occasions");
  }

  // If no services detected, use default
  const serviceType =
    serviceTypes.length > 0 ? serviceTypes.join(", ") : "Room Service";

  // Look for timing information
  const urgentMatches = [...guestMessages, ...assistantMessages].some((m) =>
    /urgent|immediately|right away|asap|as soon as possible/i.test(m.content),
  );

  const timing = urgentMatches ? "as soon as possible" : "within 30 minutes";

  // Get the first and last messages
  const firstUserMessage = guestMessages[0]?.content || "";
  const lastAssistantMessage =
    assistantMessages[assistantMessages.length - 1]?.content || "";

  // Create a structured summary that can easily be parsed by the form extractor - only in user language
  let summary = `Guest Service Request Summary:\n\n`;
  summary += `Room Number: ${roomNumber}\n`;

  // Just use the service types directly, no translations
  summary += `Service Type(s): ${serviceType}\n`;

  // Timing information
  summary += `Service Timing Requested: ${timing}\n\n`;

  // Create a detailed list of requests based on detected service types
  summary += "List of Requests:\n";

  let requestCounter = 1;

  if (foodServiceMatches) {
    summary += `Request ${requestCounter}: Food & Beverage\n`;
    // Try to extract food items
    const foodItems = [...guestMessages].flatMap((m) => {
      const matches = m.content.match(
        /(?:want|like|order|bring|get|have)(?:\s+(?:a|an|some|the))?\s+([a-zA-Z\s]+)(?:\.|,|$)/gi,
      );
      return matches
        ? matches.map((match) =>
            match
              .replace(
                /(?:want|like|order|bring|get|have)(?:\s+(?:a|an|some|the))?\s+/i,
                "",
              )
              .trim(),
          )
        : [];
    });

    if (foodItems.length > 0) {
      summary += `- Items: ${foodItems.join(", ")}\n`;
      summary += `- Service Description: Guest requested food and beverage service\n`;
      // Try to extract details about timing
      const timeReferences = [...guestMessages].some(
        (m) =>
          m.content.toLowerCase().includes("urgent") ||
          m.content.toLowerCase().includes("right now") ||
          m.content.toLowerCase().includes("immediately"),
      );
      summary += `- Service Timing Requested: ${timeReferences ? "As soon as possible" : "Within 30 minutes"}\n`;
    } else {
      summary += "- Items: Food items discussed during call\n";
      summary += "- Service Description: Room service order requested\n";
      summary += "- Service Timing Requested: Standard delivery time\n";
    }
    requestCounter++;
  }

  if (transportMatches) {
    summary += `Request ${requestCounter}: Transportation\n`;
    summary += "- Details: Requested transportation service\n";
    summary += "- Service Description: Guest needs transport arrangements\n";

    // Extract possible destinations
    const destinations = [...guestMessages].flatMap((m) => {
      const destinationMatch = m.content.match(
        /(?:to|from|for|at)\s+([a-zA-Z\s]+)(?:\.|,|$)/gi,
      );
      return destinationMatch
        ? destinationMatch.map((match) => match.trim())
        : [];
    });

    if (destinations.length > 0) {
      summary += `- Destinations: ${destinations.join(", ")}\n`;
    }

    summary += "- Service Timing Requested: As specified by guest\n";
    requestCounter++;
  }

  if (housekeepingMatches) {
    summary += `Request ${requestCounter}: Housekeeping\n`;
    summary += "- Details: Requested room cleaning or maintenance\n";
    summary += "- Service Description: Room cleaning or maintenance needed\n";
    summary += "- Service Timing Requested: As per guest's preference\n";
    requestCounter++;
  }

  if (spaMatches) {
    summary += `Request ${requestCounter}: Spa Service\n`;
    summary += "- Details: Requested spa services\n";
    summary +=
      "- Service Description: Spa appointment or treatment information\n";
    summary += "- Service Timing Requested: According to spa availability\n";
    requestCounter++;
  }

  if (tourMatches) {
    summary += `Request ${requestCounter}: Tours & Activities\n`;
    summary += "- Details: Requested tour or activity arrangement\n";
    summary +=
      "- Service Description: Guest interested in local tours or activities\n";
    summary +=
      "- Service Timing Requested: Based on tour schedule availability\n";
    requestCounter++;
  }

  if (technicalMatches) {
    summary += `Request ${requestCounter}: Technical Support\n`;
    summary += "- Details: Requested technical assistance\n";
    summary += "- Service Description: Technical issue requires attention\n";
    summary += "- Service Timing Requested: As soon as possible\n";
    requestCounter++;
  }

  if (conciergeMatches) {
    summary += `Request ${requestCounter}: Concierge Services\n`;
    summary += "- Details: Requested booking or reservation assistance\n";
    summary +=
      "- Service Description: Booking assistance or information needed\n";
    summary +=
      "- Service Timing Requested: Based on reservation requirements\n";
    requestCounter++;
  }

  if (wellnessMatches) {
    summary += `Request ${requestCounter}: Wellness & Fitness\n`;
    summary += "- Details: Requested wellness or fitness facilities\n";
    summary +=
      "- Service Description: Access to or information about fitness services\n";
    summary += "- Service Timing Requested: According to facility hours\n";
    requestCounter++;
  }

  if (securityMatches) {
    summary += `Request ${requestCounter}: Security & Lost Items\n`;
    summary +=
      "- Details: Requested security assistance or reported lost item\n";
    summary +=
      "- Service Description: Security concern or lost item assistance needed\n";
    summary += "- Service Timing Requested: Urgent attention required\n";
    requestCounter++;
  }

  if (specialOccasionMatches) {
    summary += `Request ${requestCounter}: Special Occasions\n`;
    summary += "- Details: Requested special occasion arrangement\n";
    summary +=
      "- Service Description: Support needed for celebration or special event\n";
    summary += "- Service Timing Requested: According to event timing\n";
    requestCounter++;
  }

  summary += `\nSpecial Instructions: Any special requirements mentioned during the call.\n\n`;

  if (firstUserMessage) {
    summary += `The conversation began with the guest saying: "${firstUserMessage.substring(0, 50)}${firstUserMessage.length > 50 ? "..." : ""}". `;
  }

  if (lastAssistantMessage) {
    summary += `The conversation concluded with the assistant saying: "${lastAssistantMessage.substring(0, 50)}${lastAssistantMessage.length > 50 ? "..." : ""}".`;
  }

  return summary;
}

/**
 * Translate text to Vietnamese
 * @param text Text to translate
 * @returns Vietnamese translation
 */
// ✅ RATE LIMITING: Simple rate limiter for translations (max 5 per minute)
const translationRateLimit = new Map<string, number[]>();
const TRANSLATION_RATE_LIMIT = 5; // 5 translations per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

export async function translateToVietnamese(text: string): Promise<string> {
  // If OpenAI client is not available, return original text
  if (!openai) {
    logger.debug(
      "OpenAI client not available, skipping translation",
      "Component",
    );
    return text;
  }

  // ✅ RATE LIMITING: Check if we exceed the limit
  const clientKey = "global"; // In production, use IP or user ID
  const now = Date.now();
  const clientRequests = translationRateLimit.get(clientKey) || [];

  // Remove old requests outside the window
  const validRequests = clientRequests.filter(
    (time) => now - time < RATE_LIMIT_WINDOW,
  );

  if (validRequests.length >= TRANSLATION_RATE_LIMIT) {
    logger.warn("🚫 [RATE-LIMIT] Translation rate limit exceeded", "Component");
    return "Đã vượt quá giới hạn dịch thuật (5 lần/phút). Vui lòng thử lại sau.";
  }

  // Add current request
  validRequests.push(now);
  translationRateLimit.set(clientKey, validRequests);

  try {
    if (!text) {
      return "Không có nội dung để dịch.";
    }

    const prompt = `
      Bạn là một chuyên gia dịch thuật chuyên nghiệp. Hãy dịch đoạn văn sau đây từ tiếng Anh sang tiếng Việt.
      Giữ nguyên các số phòng, tên riêng, và định dạng gạch đầu dòng.
      Hãy dịch một cách tự nhiên và đầy đủ nhất có thể.
      
      Văn bản cần dịch:
      ${text}
      
      Bản dịch tiếng Việt:
    `;

    const chatCompletion = await openai.chat.completions.create(
      {
        model: "gpt-4o-mini", // ✅ COST OPTIMIZATION: Use cheaper model for translation
        messages: [
          {
            role: "system",
            content:
              "Bạn là một chuyên gia dịch thuật chuyên nghiệp cho khách sạn, dịch từ tiếng Anh sang tiếng Việt.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      },
      { headers: { "OpenAi-Project": projectId } },
    );

    logger.debug(
      "💰 [TRANSLATION-OPTIMIZED] Translation completed",
      "Component",
      {
        model: "gpt-4o-mini",
        costSaving: "~95% vs gpt-4o",
      },
    );

    return (
      chatCompletion.choices[0].message.content?.trim() ||
      "Không thể dịch văn bản."
    );
  } catch (error: any) {
    logger.error(
      "Error translating to Vietnamese with OpenAI:",
      "Component",
      error,
    );
    return "Không thể dịch văn bản. Vui lòng thử lại sau.";
  }
}

// Prompt templates cho từng ngôn ngữ
const _PROMPT_TEMPLATES: Record<string, (conversationText: string) => string> =
  {
    en: (
      conversationText,
    ) => `You are a hotel service summarization specialist for Mi Nhon Hotel. 
Summarize the following conversation between a Hotel Assistant and a Guest in a concise, professional manner.

IMPORTANT: For EACH separate request from the guest, structure your summary in the following format (repeat for as many requests as needed, do NOT limit the number of requests):

Room Number: [Extract and display the room number if the guest provides it anywhere in the conversation. If not provided, write "Not specified".]
Guest's Name (used for Guest with a confirmed reservation): [Extract and display the guest's name if provided in the conversation. If not provided, write "Not specified".]

REQUEST 1: [Service Type]
• Service Timing: [Requested completion time]
• Order Details:
    • [Item/Service] x [Quantity] - [Special notes]
    • [Item/Service] x [Quantity] - [Special notes]
• Special Requirements: [Guest special request details]

REQUEST 2: [Other Service Type] (if applicable)
• Service Timing: [Requested completion time]
• Details:
    • [Service details]
• Special Requirements: [Guest special request details]

(Continue numbering REQUEST 3, REQUEST 4, etc. for all guest requests, do NOT limit the number of requests.)

Next Step: Please Press Send To Reception in order to complete your request

IMPORTANT INSTRUCTIONS:
1. Provide the summary only in the guest's original language (English, Russian, Korean, Chinese, or German)
2. Be EXTREMELY comprehensive - include EVERY service request mentioned in the conversation
3. Format with bullet points and indentation as shown above
4. ALWAYS ASK FOR AND INCLUDE ROOM NUMBER - This is the most critical information for every request. If the guest provides a room number anywhere in the conversation, extract and display it in the summary.
5. For Guest's Name, if the guest provides their name anywhere in the conversation, extract and display it in the summary.
6. If room number or guest name is not mentioned in the conversation, make a clear note that "Not specified".
7. For ALL service details, include times, locations, quantities, and any specific requirements
8. For Order Details, ALWAYS extract and list each specific item/service, quantity, and any special notes as mentioned by the guest. DO NOT use generic phrases like 'to order' or 'food items'. For example, if the guest requests '2 beef burgers and 1 orange juice', the summary must show:
    • Beef burger x 2
    • Orange juice x 1
9. End with any required follow-up actions or confirmation needed from staff

Example conversation:
Guest: Hi. My name is Tony. My room is 200. I would like to order 2 beef burgers and 1 orange juice.
Assistant: Sure, Tony. 2 beef burgers and 1 orange juice for room 200. Anything else?
Guest: No, that's all. Please deliver within 30 minutes.

Example summary:
Room Number: 200
Guest's Name (used for Guest with a confirmed reservation): Tony
REQUEST 1: Food & Beverage
• Service Timing: within 30 minutes
• Order Details:
    • Beef burger x 2
    • Orange juice x 1
• Special Requirements: Not specified

Conversation transcript:
${conversationText}

Summary:`,
    fr: (
      conversationText,
    ) => `Vous êtes un spécialiste de la synthèse des services hôteliers pour l'hôtel Mi Nhon. 
Résumez la conversation suivante entre un assistant hôtelier et un client de manière concise et professionnelle.

IMPORTANT : Pour CHAQUE demande distincte du client, structurez votre résumé selon le format suivant (répétez pour autant de demandes que nécessaire, ne limitez PAS le nombre de demandes) :

Numéro de chambre : [Extraire et afficher le numéro de chambre si le client le fournit dans la conversation. Sinon, indiquez "Non spécifié".]
Nom du client (utilisé pour les clients avec réservation confirmée) : [Extraire et afficher le nom du client si fourni. Sinon, indiquez "Non spécifié".]

DEMANDE 1 : [Type de service]
• Heure de service : [Heure demandée]
• Détails de la commande :
    • [Article/Service] x [Quantité] - [Notes spéciales]
    • [Article/Service] x [Quantité] - [Notes spéciales]
• Exigences particulières : [Détails des demandes spéciales]

DEMANDE 2 : [Autre type de service] (le cas échéant)
• Heure de service : [Heure demandée]
• Détails :
    • [Détails du service]
• Exigences particulières : [Détails des demandes spéciales]

(Continuez à numéroter DEMANDE 3, DEMANDE 4, etc. pour toutes les demandes du client, ne limitez PAS le nombre de demandes.)

Étape suivante : Veuillez appuyer sur "Envoyer à la Réception" pour finaliser votre demande

INSTRUCTIONS IMPORTANTES :
1. Fournissez le résumé uniquement dans la langue d'origine du client (français, russe, coréen, chinois, etc.)
2. Soyez EXTRÊMEMENT complet - incluez TOUTES les demandes mentionnées
3. Formatez avec des puces et des indentations comme ci-dessus
4. DEMANDEZ TOUJOURS ET INCLUEZ LE NUMÉRO DE CHAMBRE
5. Pour le nom du client, si le client le fournit, affichez-le
6. Si le numéro de chambre ou le nom du client n'est pas mentionné, indiquez clairement "Non spécifié".
7. Pour tous les détails, incluez heures, lieux, quantités, exigences spécifiques
8. Pour les détails de la commande, listez chaque article/service, quantité, notes spéciales. N'utilisez PAS de phrases génériques comme 'à commander' ou 'articles alimentaires'.
9. Terminez par toute action de suivi ou confirmation nécessaire du personnel

Exemple de conversation :
Client : Bonjour. Je m'appelle Tony. Ma chambre est la 200. Je voudrais commander 2 burgers de boeuf et 1 jus d'orange.
Assistant : Bien sûr, Tony. 2 burgers de boeuf et 1 jus d'orange pour la chambre 200. Autre chose ?
Client : Non, c'est tout. Merci de livrer dans les 30 minutes.

Exemple de résumé :
Numéro de chambre : 200
Nom du client (utilisé pour les clients avec réservation confirmée) : Tony
DEMANDE 1 : Restauration
• Heure de service : dans les 30 minutes
• Détails de la commande :
    • Burger de boeuf x 2
    • Jus d'orange x 1
• Exigences particulières : Non spécifié

Transcription de la conversation :
${conversationText}

Résumé :`,
    ru: (
      conversationText,
    ) => `Вы — специалист по составлению сводок для отеля Mi Nhon. 
Сделайте краткое и профессиональное резюме следующего разговора между гостиничным ассистентом и гостем.

ВАЖНО: Для КАЖДОГО отдельного запроса гостя структурируйте резюме по следующему формату (повторяйте для всех запросов, не ограничивайте их количество):

Номер комнаты: [Укажите номер комнаты, если гость его сообщил. Если нет — "Не указано".]
Имя гостя (для гостей с подтвержденным бронированием): [Укажите имя гостя, если оно было сообщено. Если нет — "Не указано".]

ЗАПРОС 1: [Тип услуги]
• Время выполнения: [Запрошенное время]
• Детали заказа:
    • [Товар/услуга] x [Количество] - [Особые пожелания]
    • [Товар/услуга] x [Количество] - [Особые пожелания]
• Особые требования: [Детали особых пожеланий]

ЗАПРОС 2: [Другой тип услуги] (если применимо)
• Время выполнения: [Запрошенное время]
• Детали:
    • [Детали услуги]
• Особые требования: [Детали особых пожеланий]

(Продолжайте нумерацию ЗАПРОС 3, ЗАПРОС 4 и т.д. для всех запросов гостя, не ограничивайте их количество.)

Следующий шаг: Пожалуйста, нажмите "Отправить на ресепшн", чтобы завершить ваш запрос

ВАЖНЫЕ ИНСТРУКЦИИ:
1. Предоставьте резюме только на языке гостя (русский, французский, корейский, китайский и т.д.)
2. Будьте максимально подробны — включайте ВСЕ запросы
3. Используйте маркированные списки и отступы, как показано выше
4. ВСЕГДА СПРАШИВАЙТЕ И УКАЗЫВАЙТЕ НОМЕР КОМНАТЫ
5. Для имени гостя — если оно указано, обязательно включите
6. Если номер комнаты или имя гостя не указаны, явно напишите "Не указано".
7. Для всех деталей — время, место, количество, особые требования
8. Для деталей заказа — перечисляйте каждый товар/услугу, количество, особые пожелания. Не используйте общие фразы.
9. Завершите необходимыми действиями или подтверждением от персонала

Пример разговора:
Гость: Здравствуйте. Меня зовут Тони. Моя комната 200. Я бы хотел заказать 2 бургера из говядины и 1 апельсиновый сок.
Ассистент: Конечно, Тони. 2 бургера и 1 апельсиновый сок для комнаты 200. Что-нибудь еще?
Гость: Нет, это все. Пожалуйста, доставьте в течение 30 минут.

Пример резюме:
Номер комнаты: 200
Имя гостя (для гостей с подтвержденным бронированием): Тони
ЗАПРОС 1: Еда и напитки
• Время выполнения: в течение 30 минут
• Детали заказа:
    • Бургер из говядины x 2
    • Апельсиновый сок x 1
• Особые требования: Не указано

Транскрипция разговора:
${conversationText}

Резюме:`,
    ko: (conversationText) => `당신은 미년 호텔의 서비스 요약 전문가입니다. 
호텔 어시스턴트와 고객 간의 다음 대화를 간결하고 전문적으로 요약하세요.

중요: 고객의 각 요청마다 아래 형식으로 요약을 작성하세요 (요청 수에 제한 없이 반복).

객실 번호: [고객이 대화 중에 제공했다면 객실 번호를 추출하여 표시. 제공하지 않았다면 "미지정"으로 작성.]
고객 이름 (예약이 확인된 고객의 경우): [고객이 이름을 제공했다면 표시. 제공하지 않았다면 "미지정"으로 작성.]

요청 1: [서비스 유형]
• 요청 시간: [요청된 완료 시간]
• 주문 내역:
    • [항목/서비스] x [수량] - [특이사항]
    • [항목/서비스] x [수량] - [특이사항]
• 특별 요청: [고객의 특별 요청 사항]

요청 2: [다른 서비스 유형] (해당되는 경우)
• 요청 시간: [요청된 완료 시간]
• 세부 정보:
    • [서비스 세부 정보]
• 특별 요청: [고객의 특별 요청 사항]

(요청 3, 요청 4 등 모든 요청에 대해 번호를 계속 매기세요. 제한 없음.)

다음 단계: 요청을 완료하려면 "프론트로 보내기" 버튼을 눌러주세요

중요 안내:
1. 요약은 반드시 고객의 언어(한국어, 프랑스어, 러시아어, 중국어 등)로만 작성하세요
2. 매우 포괄적으로 작성하세요 — 대화에서 언급된 모든 요청을 포함하세요
3. 위와 같이 글머리표와 들여쓰기를 사용하세요
4. 객실 번호는 반드시 요청하세요
5. 고객 이름도 제공된 경우 반드시 포함하세요
6. 객실 번호나 이름이 언급되지 않았다면 "미지정"으로 명확히 표시하세요
7. 모든 서비스 세부 정보(시간, 장소, 수량, 특이사항 등)를 포함하세요
8. 주문 내역은 각 항목/서비스, 수량, 특이사항을 구체적으로 나열하세요. 일반적인 문구는 사용하지 마세요.
9. 필요한 후속 조치나 직원의 확인 요청으로 마무리하세요

예시 대화:
고객: 안녕하세요. 제 이름은 토니입니다. 제 방은 200호입니다. 소고기 버거 2개와 오렌지 주스 1개를 주문하고 싶어요.
어시스턴트: 네, 토니님. 200호에 소고기 버거 2개와 오렌지 주스 1개 준비하겠습니다. 더 필요하신 건 없으신가요?
고객: 아니요, 이게 다예요. 30분 이내에 배달해 주세요.

예시 요약:
객실 번호: 200
고객 이름 (예약이 확인된 고객의 경우): 토니
요청 1: 식음료
• 요청 시간: 30분 이내
• 주문 내역:
    • 소고기 버거 x 2
    • 오렌지 주스 x 1
• 특별 요청: 미지정

대화 내용:
${conversationText}

요약:`,
    zh: (conversationText) => `您是美年酒店的服务总结专家。
请将以下酒店助理与客人的对话进行简明、专业的总结。

重要：对于客人的每一项请求，请按照以下格式进行总结（根据需要重复，不要限制请求数量）：

房间号：[如果客人在对话中提供了房间号，请提取并显示。如果未提供，请写"未指定"。]
客人姓名（用于已确认预订的客人）：[如果客人提供了姓名，请提取并显示。如果未提供，请写"未指定"。]

请求1：[服务类型]
• 服务时间：[要求完成的时间]
• 订单详情：
    • [项目/服务] x [数量] - [特殊说明]
    • [项目/服务] x [数量] - [特殊说明]
• 特殊要求：[客人的特殊要求]

请求2：[其他服务类型]（如适用）
• 服务时间：[要求完成的时间]
• 详情：
    • [服务详情]
• 特殊要求：[客人的特殊要求]

（继续编号请求3、请求4等，涵盖所有请求，不要限制数量。）

下一步：请点击"发送到前台"以完成您的请求

重要说明：
1. 仅用客人的原始语言（中文、法语、俄语、韩语等）提供总结
2. 内容必须非常全面——包括对话中提到的所有请求
3. 按上述格式使用项目符号和缩进
4. 始终询问并包含房间号
5. 客人姓名如有提供必须包含
6. 如果未提及房间号或姓名，请明确写"未指定"
7. 所有服务细节（时间、地点、数量、特殊要求等）都要包含
8. 订单详情要具体列出每项、数量、特殊说明。不要用泛泛的描述
9. 以任何需要的后续操作或员工确认结尾

示例对话：
客人：你好。我叫Tony。我的房间是200。我想点2个牛肉汉堡和1杯橙汁。
助理：好的，Tony。2个牛肉汉堡和1杯橙汁送到200房。还需要别的吗？
客人：不用了，谢谢。请在30分钟内送达。

示例总结：
房间号：200
客人姓名（用于已确认预订的客人）：Tony
请求1：餐饮
• 服务时间：30分钟内
• 订单详情：
    • 牛肉汉堡 x 2
    • 橙汁 x 1
• 特殊要求：未指定

对话内容：
${conversationText}

总结：`,
  };

// ✅ COST OPTIMIZATION: Simple cache for recent summaries (5 minutes TTL)
const summaryCache = new Map<
  string,
  { summary: string; serviceRequests: ServiceRequest[]; timestamp: number }
>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function generateCallSummaryOptimized(
  transcripts: Array<{ role: string; content: string }>,
  language: string = "en",
): Promise<{ summary: string; serviceRequests: ServiceRequest[] }> {
  logger.debug("🔍 [DEBUG] generateCallSummaryOptimized called", "Component", {
    transcriptCount: transcripts?.length || 0,
    language,
    hasOpenAI: !!openai,
    apiKey: process.env.VITE_OPENAI_API_KEY ? "Present" : "Missing",
  });

  // If OpenAI client is not available, use the basic summary generator
  if (!openai) {
    logger.warn(
      "⚠️ [FALLBACK] OpenAI client not available, using basic summary generator",
      "Component",
    );
    lastSummaryUsedFallback = true;
    return {
      summary: generateBasicSummary(transcripts),
      serviceRequests: [],
    };
  }

  // Ensure we have transcripts to summarize
  if (!transcripts || transcripts.length === 0) {
    return {
      summary: "There are no transcripts available to summarize.",
      serviceRequests: [],
    };
  }

  // ✅ CACHE CHECK: Create cache key from transcript content
  const cacheKey = JSON.stringify(transcripts) + language;
  const cached = summaryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    logger.debug("🚀 [COST-SAVE] Using cached summary", "Component", {
      cacheKey: cacheKey.substring(0, 50) + "...",
      age: Math.floor((Date.now() - cached.timestamp) / 1000) + "s",
    });
    return { summary: cached.summary, serviceRequests: cached.serviceRequests };
  }

  try {
    // Format conversation for the prompt
    const conversationText = transcripts
      .map(
        (t) =>
          `${t.role === "assistant" ? "Hotel Assistant" : "Guest"}: ${t.content || t.message}`,
      )
      .join("\n");

    // ✅ COMBINED PROMPT: Generate summary AND extract service requests in ONE call
    const combinedPrompt = `You are a hotel service specialist for Mi Nhon Hotel. Process this conversation and provide BOTH summary and service data extraction.

CONVERSATION:
${conversationText}

Please respond with VALID JSON in this exact format:
{
  "summary": "Room Number: [number or Not specified]\\nGuest's Name: [name or Not specified]\\n\\nREQUEST 1: [Service Type]\\n• Service Timing: [timing]\\n• Order Details:\\n    • [item] x [qty]\\n• Special Requirements: [requirements]\\n\\nNext Step: Please Press Send To Reception to complete your request",
  "serviceRequests": [
    {
      "serviceType": "food-beverage|housekeeping|transportation|etc",
      "requestText": "detailed description of request",
      "details": {
        "date": "YYYY-MM-DD or null",
        "time": "HH:MM or time range",
        "people": number_or_null,
        "location": "specific location or null",
        "amount": "price/cost or null", 
        "roomNumber": "room number or null",
        "otherDetails": "additional helpful details"
      }
    }
  ]
}

IMPORTANT:
- Extract room number and guest name if mentioned
- Be specific about service types, quantities, timing
- Use guest's original language (${language})
- If no specific requests, use empty array for serviceRequests
- Ensure valid JSON format`;

    // ✅ COST OPTIMIZATION: Use GPT-4o-mini for this task (20x cheaper than GPT-4o)
    const options = {
      timeout: 30000,
      headers: { "OpenAi-Project": projectId },
    };

    const chatCompletion = await openai.chat.completions.create(
      {
        model: "gpt-4o-mini", // ✅ MUCH CHEAPER: $0.15/1M tokens vs $5/1M for GPT-4o
        messages: [
          {
            role: "system",
            content:
              "You are a hotel service analyst that outputs valid JSON combining summary and service extraction.",
          },
          { role: "user", content: combinedPrompt },
        ],
        response_format: { type: "json_object" },
        max_tokens: 1200,
        temperature: 0.3, // Lower for more consistent JSON
      },
      options,
    );

    const responseContent = chatCompletion.choices[0].message.content?.trim();
    if (!responseContent) {
      throw new Error("Empty response from OpenAI");
    }

    // Parse combined response
    const parsed = JSON.parse(responseContent);
    const summary = parsed.summary || "Failed to generate summary.";
    const serviceRequests = Array.isArray(parsed.serviceRequests)
      ? parsed.serviceRequests
      : [];

    // ✅ CACHE RESULT: Store for future use
    summaryCache.set(cacheKey, {
      summary,
      serviceRequests,
      timestamp: Date.now(),
    });

    // ✅ CLEANUP: Remove old cache entries
    for (const [key, value] of summaryCache.entries()) {
      if (Date.now() - value.timestamp > CACHE_TTL) {
        summaryCache.delete(key);
      }
    }

    logger.debug(
      "💰 [COST-OPTIMIZED] Combined summary+extraction completed",
      "Component",
      {
        model: "gpt-4o-mini",
        tokensUsed: "estimated 500-800",
        costSaving: "~95% vs original",
        summaryLength: summary.length,
        serviceRequestsCount: serviceRequests.length,
        summaryPreview: summary.substring(0, 100) + "...",
      },
    );

    lastSummaryUsedFallback = false;
    return { summary, serviceRequests };
  } catch (error: any) {
    logger.error("Error generating optimized summary:", "Component", error);

    // Fallback to basic summary
    lastSummaryUsedFallback = true;
    return {
      summary: generateBasicSummary(transcripts),
      serviceRequests: [],
    };
  }
}
