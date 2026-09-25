export interface ThriftItem {
  id: string;
  articleNumber: string; // e.g. "804.249.12"
  ikeaStyleName: string; // e.g. "MARKUS / Ergonomic mesh chair"
  title: string;
  category: 'electronics' | 'furniture' | 'kitchen' | 'decor' | 'fixer' | 'appliances';
  roomType: 'wfh' | 'living' | 'kitchen' | 'appliances' | 'fixer';
  price: number;
  originalPrice: number;
  condition: 'like_new' | 'gently_used' | 'fixer_upper';
  conditionLabel: string;
  dimensions: string; // e.g. "62 × 60 × 129 cm"
  assemblyStatus: 'Ready Assembled (Zero assembly needed)' | 'Flat-pack / Disassembled' | 'Plug & Play';
  liftFriendly: 'Fits standard passenger lift' | 'Service lift recommended' | 'Hand-carry 1 person';
  inspectionNote: string;
  description: string;
  sellerQuote?: string; // Optional legacy note
  aspectRatio: '3/4' | '4/5' | '1/1' | '9/11'; // For dynamic Pinterest masonry rhythm
  savesCount: number;
  images: string[];
  hasVideoProof: boolean;
  videoProofNote?: string;
  seller: {
    name: string;
    alias: string;
    tower: string;
    phone?: string; // Seller's WhatsApp/Call number for elevator pickup coordination
    society: string;
    city: string;
    verifiedResident: boolean;
    rating: number;
    dealsCompleted: number;
    responseTime: string;
  };
  locationNote: string;
  isMovingOut: boolean;
  movingOutDate?: string;
  bottomLinePrice: number;
  status: 'available' | 'held' | 'sold' | 'deleted';
  heldBy?: string;
  tags: string[];
  listedAgo: string;
  is_seed?: boolean;
  sellerId?: string;
  createdAt?: string;
  previousPrice?: number;
  priceDroppedAt?: string;
  isExpired?: boolean;
  renewedAt?: string;
  isWanted?: boolean;
}

export interface SellerOffer {
  id: string;
  itemId: string;
  itemTitle: string;
  itemImage: string;
  askingPrice: number;
  offeredPrice: number;
  buyerName: string;
  buyerTower: string;
  buyerPhone?: string; // Buyer's contact phone number for WhatsApp/Call
  sellerPhone?: string; // Seller's contact phone number for WhatsApp/Call
  status: 'pending' | 'accepted' | 'countered' | 'declined';
  counterPrice?: number;
  timestamp: string;
  buyerNote: string;
  buyerId?: string;
}

export interface ItemComment {
  id: string;
  itemId: string;
  authorName: string;
  authorTower: string;
  text: string;
  timestamp: string;
  isSeller?: boolean;
}

export interface UserProfile {
  id?: string;
  name: string;
  username?: string; // option to define username/alias
  email: string;
  phone?: string; // Contact mobile number (+91)
  authProvider: 'google' | 'guest';
  googleAvatar?: string;
  customAvatar?: string; // option for custom profile photo
  isLoggedIn: boolean;
  isOnboarded?: boolean; // Completed post-auth onboarding profile
  flatNumber?: string; // Optional (flat info not required)
  tower: string; // Free-form tower/wing entered by user
  societyId: string;
  societyName: string;
  isVerified: boolean;
  rating: number;
  dealsCompleted: number;
  joinedDate: string;
}

export const INITIAL_USER_PROFILE: UserProfile = {
  name: '',
  username: '',
  email: '',
  phone: '',
  authProvider: 'guest',
  googleAvatar: undefined,
  customAvatar: undefined,
  isLoggedIn: false,
  isOnboarded: false,
  flatNumber: '',
  tower: '',
  societyId: 'dlf-phase-5',
  societyName: 'DLF Phase 5 (The Crest & Park Place)',
  isVerified: false,
  rating: 5.0,
  dealsCompleted: 0,
  joinedDate: 'Resident'
};


export const INITIAL_COMMENTS: ItemComment[] = [];

export interface AIDetectionResult {
  title: string;
  category: 'electronics' | 'furniture' | 'kitchen' | 'decor' | 'fixer' | 'appliances';
  roomType: 'wfh' | 'living' | 'kitchen' | 'appliances' | 'fixer';
  estimatedRetail: number;
  suggestedPrice: number;
  pricePresets: number[];
  dimensions: string;
  assemblyStatus: 'Ready Assembled (Zero assembly needed)' | 'Flat-pack / Disassembled' | 'Plug & Play';
  liftFriendly: 'Fits standard passenger lift' | 'Service lift recommended' | 'Hand-carry 1 person';
  condition: 'like_new' | 'gently_used' | 'fixer_upper';
  confidence: number;
  tags: string[];
}

export const AI_CATALOG: Record<string, AIDetectionResult> = {
  chair: {
    title: 'Ergonomic High-Back Mesh Desk Chair',
    category: 'furniture',
    roomType: 'wfh',
    estimatedRetail: 16999,
    suggestedPrice: 3200,
    pricePresets: [2800, 3200, 3600],
    dimensions: '62 × 60 × 129 cm',
    assemblyStatus: 'Ready Assembled (Zero assembly needed)',
    liftFriendly: 'Fits standard passenger lift',
    condition: 'gently_used',
    confidence: 98,
    tags: ['#Ergonomic', '#MeshBack', '#WFHSetup', '#GasLiftOK']
  },
  air_purifier: {
    title: 'Smart HEPA Air Purifier (AQI Ring Sensor)',
    category: 'appliances',
    roomType: 'appliances',
    estimatedRetail: 11995,
    suggestedPrice: 3400,
    pricePresets: [3000, 3400, 3800],
    dimensions: '25 × 25 × 37 cm',
    assemblyStatus: 'Plug & Play',
    liftFriendly: 'Hand-carry 1 person',
    condition: 'like_new',
    confidence: 96,
    tags: ['#HEPAFilter', '#CleanAir', '#AntiPollution', '#SilentMode']
  },
  water_purifier: {
    title: 'Multi-Stage RO + UV Water Purifier',
    category: 'appliances',
    roomType: 'kitchen',
    estimatedRetail: 18500,
    suggestedPrice: 2200,
    pricePresets: [1800, 2200, 2500],
    dimensions: '40 × 26 × 52 cm',
    assemblyStatus: 'Plug & Play',
    liftFriendly: 'Hand-carry 1 person',
    condition: 'gently_used',
    confidence: 94,
    tags: ['#KitchenRO', '#TDSControl', '#Mineralizer', '#DirectFitting']
  },
  display: {
    title: '4K IPS Ultra-Slim Desktop Monitor 27"',
    category: 'electronics',
    roomType: 'wfh',
    estimatedRetail: 28990,
    suggestedPrice: 7500,
    pricePresets: [6800, 7500, 8200],
    dimensions: '61 × 20 × 45 cm',
    assemblyStatus: 'Plug & Play',
    liftFriendly: 'Hand-carry 1 person',
    condition: 'like_new',
    confidence: 97,
    tags: ['#4KMonitor', '#IPSPanel', '#DualScreen', '#HDMIIncluded']
  },
  desk: {
    title: 'Solid Sheesham Wood Study & Work Desk',
    category: 'furniture',
    roomType: 'wfh',
    estimatedRetail: 14500,
    suggestedPrice: 3800,
    pricePresets: [3200, 3800, 4200],
    dimensions: '120 × 60 × 75 cm',
    assemblyStatus: 'Ready Assembled (Zero assembly needed)',
    liftFriendly: 'Fits standard passenger lift',
    condition: 'gently_used',
    confidence: 95,
    tags: ['#SolidWood', '#StudyDesk', '#DrawerStorage', '#PreAssembled']
  },
  default: {
    title: 'Pre-Loved Household Item',
    category: 'furniture',
    roomType: 'wfh',
    estimatedRetail: 8000,
    suggestedPrice: 2000,
    pricePresets: [1500, 2000, 2500],
    dimensions: '',
    assemblyStatus: 'Ready Assembled (Zero assembly needed)',
    liftFriendly: 'Fits standard passenger lift',
    condition: 'gently_used',
    confidence: 91,
    tags: ['#CommunityThrift', '#VerifiedResident', '#FastPickup']
  }
};

export const analyzeItemWithAI = (userTitle: string, presetKey?: string): AIDetectionResult => {
  const t = userTitle.toLowerCase();
  if (presetKey && AI_CATALOG[presetKey]) {
    const base = AI_CATALOG[presetKey];
    return {
      ...base,
      title: userTitle.trim() || base.title
    };
  }

  if (t.includes('chair') || t.includes('seating') || t.includes('stool')) {
    return {
      ...AI_CATALOG.chair,
      title: userTitle.trim() || AI_CATALOG.chair.title,
      tags: ['#Ergonomic', '#MeshBack', '#WFHSetup', '#GasLiftOK']
    };
  }
  if (t.includes('air') || t.includes('hepa') || t.includes('coway') || t.includes('purifier') && !t.includes('water')) {
    return {
      ...AI_CATALOG.air_purifier,
      title: userTitle.trim() || AI_CATALOG.air_purifier.title,
      tags: ['#HEPAFilter', '#CleanAir', '#AntiPollution', '#SilentMode']
    };
  }
  if (t.includes('water') || t.includes('ro') || t.includes('kent') || t.includes('aquaguard')) {
    return {
      ...AI_CATALOG.water_purifier,
      title: userTitle.trim() || AI_CATALOG.water_purifier.title,
      tags: ['#KitchenRO', '#TDSControl', '#Mineralizer', '#DirectFitting']
    };
  }
  if (t.includes('monitor') || t.includes('display') || t.includes('screen') || t.includes('tv') || t.includes('dell')) {
    return {
      ...AI_CATALOG.display,
      title: userTitle.trim() || AI_CATALOG.display.title,
      tags: ['#4KMonitor', '#IPSPanel', '#DualScreen', '#HDMIIncluded']
    };
  }
  if (t.includes('desk') || t.includes('table') || t.includes('stand') || t.includes('wood')) {
    return {
      ...AI_CATALOG.desk,
      title: userTitle.trim() || AI_CATALOG.desk.title,
      tags: ['#SolidWood', '#StudyDesk', '#DrawerStorage', '#PreAssembled']
    };
  }

  return {
    ...AI_CATALOG.default,
    title: userTitle.trim() || 'Pre-Loved Household Item',
    tags: ['#CommunityThrift', '#VerifiedResident', '#FastPickup']
  };
};

export interface SocietyInfo {
  id: string;
  name: string;
  city: string;
  area?: string;
  lat?: number;
  lng?: number;
  activeListingsCount: number;
  residentCount: number;
  towers: string[];
  isLive: boolean;
  pincode?: string;
}

export interface SocietyRequest {
  id: string;
  name: string;
  city: string;
  locality?: string;
  pincode?: string;
  towersCount: number;
  approxFlats: number;
  applicantRole: string;
  requestedAt: string;
}

export const INITIAL_SELLER_OFFERS: SellerOffer[] = [];

export const DEFAULT_SOCIETY: SocietyInfo = {
  id: '',
  name: 'All Societies',
  city: 'All Cities',
  area: '',
  activeListingsCount: 0,
  residentCount: 0,
  isLive: true,
  towers: []
};

export const METRO_SOCIETIES: SocietyInfo[] = [];

// Helper to compute distance between coordinates in km
export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper to locate nearest society given user's latitude and longitude
export function findNearestSociety(userLat: number, userLng: number, societies: SocietyInfo[] = METRO_SOCIETIES): { society: SocietyInfo; distanceKm: number } {
  if (!societies || societies.length === 0) {
    return { society: DEFAULT_SOCIETY, distanceKm: 0 };
  }
  let closest = societies[0];
  let minDistance = Infinity;

  for (const soc of societies) {
    if (soc.lat !== undefined && soc.lng !== undefined) {
      const dist = getDistanceKm(userLat, userLng, soc.lat, soc.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closest = soc;
      }
    }
  }

  return { society: closest, distanceKm: Math.round(minDistance * 10) / 10 };
}

export const INITIAL_THRIFT_ITEMS: ThriftItem[] = [];

// Helper to reliably check if a user is the owner/seller of an item
export function isItemOwner(item?: ThriftItem | null, userProfile?: UserProfile | null): boolean {
  if (!item || !userProfile || !userProfile.isLoggedIn) return false;
  // 1. Match by Supabase auth UUID
  if (userProfile.id && item.sellerId && userProfile.id === item.sellerId) return true;
  // 2. Match by validated phone number
  if (userProfile.phone && item.seller?.phone && userProfile.phone.trim() === item.seller.phone.trim()) return true;
  // 3. Match by name and tower (avoiding generic Guest fallback)
  if (
    userProfile.name &&
    item.seller?.name &&
    userProfile.name !== 'Guest Resident' &&
    userProfile.name.trim().toLowerCase() === item.seller.name.trim().toLowerCase() &&
    userProfile.tower &&
    item.seller?.tower &&
    userProfile.tower === item.seller.tower
  ) {
    return true;
  }
  return false;
}


