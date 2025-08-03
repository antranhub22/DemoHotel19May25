/* ========================================
   ASSETS INDEX - CENTRALIZED ASSET MANAGEMENT
   ======================================== */

// ========================================
// HOTEL IMAGES
// ========================================

export const hotelImages = {
  exterior: '/assets/hotel-exterior.jpeg',
  courtyard: '/assets/courtyard.jpeg',
  generalView1: '/assets/General_View1.jpg',
  generalView2: '/assets/General_View2.jpg',
  poolView2: '/assets/Pool_View2.jpg',
  defaultLogo: '/assets/hotel-default-logo.png',
  hailyLogo: '/assets/haily-logo1.jpg',
} as const;

// ========================================
// REFERENCE IMAGES
// ========================================

export const referenceImages = {
  // Hotel Amenities
  amenities: {
    breakfast: '/assets/references/images/hotel-amenities/Breakfast.jpg',
    lunch: '/assets/references/images/hotel-amenities/Lunch.jpg',
    restaurant: '/assets/references/images/hotel-amenities/Restaurant.jpg',
    restaurant2: '/assets/references/images/hotel-amenities/Restaurant2.jpg',
    roomService:
      '/assets/references/images/hotel-amenities/Roomfood_Service.jpg',
    roomView1: '/assets/references/images/hotel-amenities/Roomview1.jpg',
    roomView2: '/assets/references/images/hotel-amenities/Roomview2.jpg',
    roomView3: '/assets/references/images/hotel-amenities/Roomview3.jpg',
    poolView1: '/assets/references/images/hotel-amenities/Pool_View1.jpg',
    poolView2: '/assets/references/images/hotel-amenities/Pool_View2.jpg',
    generalView1: '/assets/references/images/hotel-amenities/General_View1.jpg',
    generalView2: '/assets/references/images/hotel-amenities/General_View2.jpg',
    decorateService:
      '/assets/references/images/hotel-amenities/Decorate_Service.jpg',
    freeBicycles:
      '/assets/references/images/hotel-amenities/Free_Bicyles Service.jpg',
  },

  // Activities & Experiences
  activities: {
    familyBeachfun1:
      '/assets/references/images/activities-experiences/Family_Beachfun1.jpg',
    familyBeachfun2:
      '/assets/references/images/activities-experiences/Family_Beachfun2.jpg',
    friendsJeepDunes1:
      '/assets/references/images/activities-experiences/Friends_JeepDunes1.jpg',
    friendsJeepDunes2:
      '/assets/references/images/activities-experiences/Friends_JeepDunes2.jpg',
    relaxingPoolside:
      '/assets/references/images/activities-experiences/Relaxing_Poolside.jpg',
    touristBar:
      '/assets/references/images/activities-experiences/Tourist_Bar.jpg',
    touristFairyStream1:
      '/assets/references/images/activities-experiences/Tourist_FairyStream1.jpg',
    touristFairyStream2:
      '/assets/references/images/activities-experiences/Tourist_FairyStream2.jpg',
    touristLocalFood:
      '/assets/references/images/activities-experiences/Tourist_LocalFood.jpg',
    touristSeaviewcafe:
      '/assets/references/images/activities-experiences/Tourist_Seaviewcafe.jpg',
    touristSunriseDune1:
      '/assets/references/images/activities-experiences/Tourist_SunriseDune1.jpg',
    touristSunriseDune2:
      '/assets/references/images/activities-experiences/Tourist_SunriseDune2.jpg',
    touristWatersport1:
      '/assets/references/images/activities-experiences/Tourist_Watersport1.jpg',
    touristWatersport2:
      '/assets/references/images/activities-experiences/Tourist_Watersport2.jpg',
  },

  // Landmarks
  landmarks: {
    fairyStream1: '/assets/references/images/landmark/Fairy_Stream1.png',
    fairyStream2: '/assets/references/images/landmark/Fairy_Stream2.jpg',
    hamTienBeach1: '/assets/references/images/landmark/HamTien_Beach1.jpg',
    hamTienBeach2: '/assets/references/images/landmark/HamTien_Beach2.jpg',
    keGaLighthouse1: '/assets/references/images/landmark/KeGa_Lighthouse1.jpg',
    keGaLighthouse2: '/assets/references/images/landmark/KeGa_Lighthouse2.jpg',
    muineBeach1: '/assets/references/images/landmark/Muine_Beach1.jpg',
    muineBeach2: '/assets/references/images/landmark/Muine_Beach2.jpg',
    muineFishingVillage1:
      '/assets/references/images/landmark/Muine_FishingVillage1.jpg',
    muineFishingVillage2:
      '/assets/references/images/landmark/Muine_FishingVillage2.jpg',
    poSahInuTower1: '/assets/references/images/landmark/PoSahInu_Tower1.jpg',
  },

  // Local Cuisine
  cuisine: {
    banhCanMuine1: '/assets/references/images/local-cuisine/BanhCan_Muine1.jpg',
    banhCanMuine2: '/assets/references/images/local-cuisine/BanhCan_Muine2.jpg',
    banhQuaiVac1: '/assets/references/images/local-cuisine/BanhQuaiVac1.jpg',
  },

  // Menu
  menu: {
    basic: '/assets/references/images/menu-minhon/Menu-Minhon-basic.jpg',
    vegetarian:
      '/assets/references/images/menu-minhon/Menu-Minhon-Vegetarian.jpg',
  },

  // Tours
  tours: {
    phanthietTour: '/assets/references/images/muine-tours/Phanthiet-tour.jpg',
    tour01: '/assets/references/images/muine-tours/Tour01.jpg',
    tour02: '/assets/references/images/muine-tours/Tour02.jpg',
  },

  // Bus Tickets
  busTickets: {
    busTickets01:
      '/assets/references/images/bus-tickets/MiNhon-Bus Tickets01.jpg',
  },

  // Area Map
  areaMap: {
    areaMap: '/assets/references/images/area-map/Area Map.jpg',
  },

  // Logo
  logo: {
    minhonLogo: '/assets/references/images/minhon-logo.jpg',
  },
} as const;

// ========================================
// DOCUMENTS
// ========================================

export const documents = {
  beachTideChart:
    '/assets/references/documents/Beach & Sea (Tide Chart) 2024.pdf',
  busTickets: '/assets/references/documents/MiNhon - Bus Tickets.pdf',
  phanThietTour: '/assets/references/documents/PHAN THIET TOUR .pdf',
  poolGuidelines: '/assets/references/documents/pool-guidelines.txt',
  roomServiceMenu: '/assets/references/documents/room-service-menu.txt',
} as const;

// ========================================
// AUDIO FILES
// ========================================

export const audioFiles = {
  notification: '/notification.mp3',
  ping: '/ping.mp3',
} as const;

// ========================================
// UTILITY FUNCTIONS
// ========================================

export const getImageUrl = (path: string): string => {
  return path.startsWith('http') ? path : path;
};

export const getAssetPath = (
  category: keyof typeof referenceImages,
  subcategory: string,
  filename: string
): string => {
  const categoryAssets = referenceImages[category] as Record<string, string>;
  return categoryAssets[filename] || '';
};

export const getAllImages = (): string[] => {
  const images: string[] = [];

  // Add hotel images
  Object.values(hotelImages).forEach(img => images.push(img));

  // Add reference images
  Object.values(referenceImages).forEach(category => {
    if (typeof category === 'object') {
      Object.values(category).forEach(img => images.push(img));
    }
  });

  return images;
};

export const getImagesByCategory = (
  category: keyof typeof referenceImages
): string[] => {
  const categoryAssets = referenceImages[category] as Record<string, string>;
  return Object.values(categoryAssets);
};

// ========================================
// TYPE DEFINITIONS
// ========================================

export type HotelImageKey = keyof typeof hotelImages;
export type ReferenceImageCategory = keyof typeof referenceImages;
export type DocumentKey = keyof typeof documents;
export type AudioFileKey = keyof typeof audioFiles;
