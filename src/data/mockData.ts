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
  status: 'available' | 'held' | 'sold';
  heldBy?: string;
  tags: string[];
  listedAgo: string;
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
  status: 'pending' | 'accepted' | 'countered' | 'declined';
  counterPrice?: number;
  timestamp: string;
  buyerNote: string;
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
  name: string;
  email: string;
  authProvider: 'google' | 'guest';
  googleAvatar?: string;
  isLoggedIn: boolean;
  flatNumber: string;
  tower: string;
  societyId: string;
  societyName: string;
  isVerified: boolean;
  rating: number;
  dealsCompleted: number;
  joinedDate: string;
}

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Sakar M.',
  email: 'sakar.m@gmail.com',
  authProvider: 'google',
  googleAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
  isLoggedIn: true,
  flatNumber: '802',
  tower: 'Tower 4',
  societyId: 'dlf-phase-5',
  societyName: 'DLF Phase 5 (The Crest & Park Place)',
  isVerified: true,
  rating: 5.0,
  dealsCompleted: 0,
  joinedDate: 'Resident since 2024'
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
    dimensions: 'Standard apartment size',
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

export const METRO_SOCIETIES: SocietyInfo[] = [
  {
    id: 'dlf-phase-5',
    name: 'DLF Phase 5 (The Crest & Park Place)',
    city: 'Gurugram',
    pincode: '122002',
    activeListingsCount: 0,
    residentCount: 1420,
    isLive: true,
    towers: ['Tower 1', 'Tower 2', 'Tower 3', 'Tower 4', 'Tower 5', 'Tower 6', 'Tower 7']
  },
  {
    id: 'prestige-shantiniketan',
    name: 'Prestige Shantiniketan',
    city: 'Bengaluru',
    pincode: '560048',
    activeListingsCount: 0,
    residentCount: 3100,
    isLive: true,
    towers: ['Tower 01', 'Tower 04', 'Tower 07', 'Tower 11', 'Tower 15']
  },
  {
    id: 'amanora-park-town',
    name: 'Amanora Park Town',
    city: 'Pune',
    pincode: '411028',
    activeListingsCount: 0,
    residentCount: 2450,
    isLive: true,
    towers: ['Sector R1', 'Sector R2', 'Future Towers A', 'Future Towers B']
  },
  {
    id: 'ats-greens',
    name: 'ATS Greens Village',
    city: 'Noida',
    pincode: '201304',
    activeListingsCount: 0,
    residentCount: 1180,
    isLive: true,
    towers: ['Tower 2', 'Tower 5', 'Tower 8', 'Tower 10']
  },
  {
    id: 'hiranandani-estate',
    name: 'Hiranandani Estate',
    city: 'Mumbai',
    pincode: '400607',
    activeListingsCount: 0,
    residentCount: 2900,
    isLive: true,
    towers: ['Rodas Enclave A', 'Rodas Enclave B', 'Canis', 'Pegasus']
  }
];

export const INITIAL_THRIFT_ITEMS: ThriftItem[] = [];
