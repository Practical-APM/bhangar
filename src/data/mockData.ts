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
  dealsCompleted: 4,
  joinedDate: 'Resident since 2024'
};

export const INITIAL_COMMENTS: ItemComment[] = [
  {
    id: 'c1',
    itemId: 'item-1',
    authorName: 'Rohan V.',
    authorTower: 'Tower 2',
    text: 'Is the hydraulic height adjuster working smoothly? Any squeaks?',
    timestamp: '2 hours ago'
  },
  {
    id: 'c2',
    itemId: 'item-1',
    authorName: 'Karan S.',
    authorTower: 'Tower 5',
    text: 'Yes! Tested completely. Gas lift is 100% firm, zero squeaks. Video proof also attached above.',
    timestamp: '1 hour ago',
    isSeller: true
  },
  {
    id: 'c3',
    itemId: 'item-2',
    authorName: 'Ananya G.',
    authorTower: 'Tower 6',
    text: 'Does this come with the original HEPA filter or did you change it recently?',
    timestamp: 'Yesterday'
  },
  {
    id: 'c4',
    itemId: 'item-2',
    authorName: 'Vikram R.',
    authorTower: 'Tower 4',
    text: 'Replaced with genuine Coway filter 2 months ago, green filter light is glowing strong.',
    timestamp: 'Yesterday',
    isSeller: true
  }
];

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

export const INITIAL_SELLER_OFFERS: SellerOffer[] = [
  {
    id: 'off-1',
    itemId: 'item-1',
    itemTitle: 'Green Soul Ergonomic Office Chair',
    itemImage: '/images/chair.jpg',
    askingPrice: 3200,
    offeredPrice: 2900,
    buyerName: 'Kavita D.',
    buyerTower: 'Tower 2',
    status: 'pending',
    timestamp: '12 mins ago',
    buyerNote: 'Can walk over right now with cash/UPI. Need it for my WFH setup today.'
  },
  {
    id: 'off-2',
    itemId: 'item-6',
    itemTitle: 'Solid Sheesham Wood Desk (120 x 60 cm)',
    itemImage: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
    askingPrice: 3800,
    offeredPrice: 3200,
    buyerName: 'Rohan M.',
    buyerTower: 'Tower 5',
    status: 'pending',
    timestamp: '35 mins ago',
    buyerNote: 'Moving into Tower 5 tomorrow. Can we do ₹3,200? Will collect via service lift.'
  }
];

export const METRO_SOCIETIES: SocietyInfo[] = [
  {
    id: 'dlf-phase-5',
    name: 'DLF Phase 5 (The Crest & Park Place)',
    city: 'Gurugram',
    pincode: '122002',
    activeListingsCount: 28,
    residentCount: 1420,
    isLive: true,
    towers: ['Tower 1', 'Tower 2', 'Tower 3', 'Tower 4', 'Tower 5', 'Tower 6', 'Tower 7']
  },
  {
    id: 'prestige-shantiniketan',
    name: 'Prestige Shantiniketan',
    city: 'Bengaluru',
    pincode: '560048',
    activeListingsCount: 42,
    residentCount: 3100,
    isLive: true,
    towers: ['Tower 01', 'Tower 04', 'Tower 07', 'Tower 11', 'Tower 15']
  },
  {
    id: 'amanora-park-town',
    name: 'Amanora Park Town',
    city: 'Pune',
    pincode: '411028',
    activeListingsCount: 22,
    residentCount: 2450,
    isLive: true,
    towers: ['Sector R1', 'Sector R2', 'Future Towers A', 'Future Towers B']
  },
  {
    id: 'ats-greens',
    name: 'ATS Greens Village',
    city: 'Noida',
    pincode: '201304',
    activeListingsCount: 19,
    residentCount: 1180,
    isLive: true,
    towers: ['Tower 2', 'Tower 5', 'Tower 8', 'Tower 10']
  },
  {
    id: 'hiranandani-estate',
    name: 'Hiranandani Estate',
    city: 'Mumbai',
    pincode: '400607',
    activeListingsCount: 35,
    residentCount: 2900,
    isLive: true,
    towers: ['Rodas Enclave A', 'Rodas Enclave B', 'Canis', 'Pegasus']
  }
];

export const INITIAL_THRIFT_ITEMS: ThriftItem[] = [
  {
    id: 'item-1',
    articleNumber: '702.611.50',
    ikeaStyleName: 'MARKUS / Ergonomic high-back chair',
    title: 'Green Soul Ergonomic Office Chair',
    category: 'furniture',
    roomType: 'wfh',
    price: 3200,
    originalPrice: 16999,
    condition: 'gently_used',
    conditionLabel: 'Gently Used · Hydraulics & 4D armrests verified',
    dimensions: '62 × 60 × 129 cm',
    assemblyStatus: 'Ready Assembled (Zero assembly needed)',
    liftFriendly: 'Fits standard passenger lift',
    inspectionNote: 'Verified resident test: smooth hydraulic height adjust, firm lumbar support, mesh backing flawless.',
    sellerQuote: '“Spent ₹17k when remote work started. Now company recalled us to Cyber Hub. Please give my spine buddy a good home.”',
    aspectRatio: '3/4',
    savesCount: 34,
    description: 'Relocating this weekend. Used 1.5 years for remote work. Breathable mesh high-back with lumbar support. Handover in Tower 4 service elevator.',
    images: [
      '/images/chair.jpg',
      'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80'
    ],
    hasVideoProof: true,
    videoProofNote: 'Hydraulic height adjust and recline mechanism tested',
    seller: {
      name: 'Arjun Mehta',
      alias: 'Arjun M.',
      tower: 'Tower 4',
      society: 'DLF Phase 5 (The Crest & Park Place)',
      city: 'Gurugram',
      verifiedResident: true,
      rating: 4.9,
      dealsCompleted: 6,
      responseTime: '< 10 mins'
    },
    locationNote: 'Tower 4 · 8th Floor (Lift accessible)',
    isMovingOut: true,
    movingOutDate: 'Moving this Sunday',
    bottomLinePrice: 2800,
    status: 'available',
    tags: ['Office', 'Furniture', 'Ergonomic', 'WFH'],
    listedAgo: '2h ago'
  },
  {
    id: 'item-2',
    articleNumber: '403.009.28',
    ikeaStyleName: 'TILLREDA / Convection microwave 28L',
    title: 'LG 28L Convection Microwave Oven',
    category: 'appliances',
    roomType: 'kitchen',
    price: 2600,
    originalPrice: 15490,
    condition: 'like_new',
    conditionLabel: 'Like New · Turntable and roller ring included',
    dimensions: '51 × 40 × 31 cm',
    assemblyStatus: 'Plug & Play',
    liftFriendly: 'Hand-carry 1 person',
    inspectionNote: 'Clean cavity, tested heating cycles, glass turntable spotless with zero chips.',
    sellerQuote: '“New rented flat has a built-in Bosch oven. This trusty LG baked 50 pizzas and deserves an appreciative kitchen.”',
    aspectRatio: '1/1',
    savesCount: 19,
    description: 'Purchased 11 months ago. Clean and tested. Moving to a furnished apartment with built-in appliances.',
    images: [
      'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=800&q=80'
    ],
    hasVideoProof: true,
    videoProofNote: 'Rapid heating cycle demonstrated on video',
    seller: {
      name: 'Pooja Verma',
      alias: 'Pooja V.',
      tower: 'Tower 2',
      society: 'DLF Phase 5 (The Crest & Park Place)',
      city: 'Gurugram',
      verifiedResident: true,
      rating: 5.0,
      dealsCompleted: 4,
      responseTime: 'Quick reply'
    },
    locationNote: 'Tower 2 · Ground lobby pickup',
    isMovingOut: true,
    movingOutDate: 'Leaving in 3 days',
    bottomLinePrice: 2300,
    status: 'available',
    tags: ['Kitchen', 'Appliances', 'Convection'],
    listedAgo: '4h ago'
  },
  {
    id: 'item-3',
    articleNumber: '104.912.44',
    ikeaStyleName: 'FÖRNUFTIG / Smart HEPA air purifier',
    title: 'Philips 1000i Smart HEPA Air Purifier',
    category: 'appliances',
    roomType: 'appliances',
    price: 3400,
    originalPrice: 11995,
    condition: 'like_new',
    conditionLabel: 'Like New · Filter life 70% remaining',
    dimensions: '25 × 25 × 37 cm',
    assemblyStatus: 'Plug & Play',
    liftFriendly: 'Hand-carry 1 person',
    inspectionNote: 'Sensor recalibrated, AQI LED ring responsive, whisper-quiet sleep mode confirmed.',
    sellerQuote: '“Moving to Goa where air is actually breathable. Do not enter Delhi November smog without this.”',
    aspectRatio: '4/5',
    savesCount: 52,
    description: 'Essential for Delhi-NCR winters. Real-time AQI ring indicator, ultra-quiet sleep mode, and phone app support.',
    images: [
      '/images/air_purifier.jpg'
    ],
    hasVideoProof: true,
    videoProofNote: 'AQI ring sensor and 3 fan speeds tested',
    seller: {
      name: 'Nitin Gupta',
      alias: 'Nitin G.',
      tower: 'Tower 1',
      society: 'DLF Phase 5 (The Crest & Park Place)',
      city: 'Gurugram',
      verifiedResident: true,
      rating: 4.9,
      dealsCompleted: 5,
      responseTime: 'Within 1 hour'
    },
    locationNote: 'Tower 1 · Main entrance lobby',
    isMovingOut: true,
    movingOutDate: 'Relocating Oct 1st',
    bottomLinePrice: 3000,
    status: 'available',
    tags: ['Appliances', 'Air Purifier', 'HEPA'],
    listedAgo: '5h ago'
  },
  {
    id: 'item-4',
    articleNumber: '803.951.19',
    ikeaStyleName: 'ÅHÄCK / RO+UV multi-stage purifier',
    title: 'Kent Grand Plus RO + UV Water Purifier',
    category: 'appliances',
    roomType: 'kitchen',
    price: 2900,
    originalPrice: 18500,
    condition: 'gently_used',
    conditionLabel: 'Gently Used · 3 New replacement filters included',
    dimensions: '40 × 26 × 52 cm',
    assemblyStatus: 'Ready Assembled (Zero assembly needed)',
    liftFriendly: 'Fits standard passenger lift',
    inspectionNote: 'Membrane checked 4 months ago, TDS tested down to 42. Packaged securely with mounting bracket.',
    sellerQuote: '“Already unmounted and boxed. Throwing in 3 sealed sediment filters for free because I can’t carry them.”',
    aspectRatio: '3/4',
    savesCount: 16,
    description: 'Installed for rental apartment. Membrane changed 4 months ago. Tested TDS reduction. Already unmounted and boxed.',
    images: [
      '/images/water_purifier.jpg'
    ],
    hasVideoProof: false,
    seller: {
      name: 'Meenakshi Sundaram',
      alias: 'Meenakshi S.',
      tower: 'Tower 3',
      society: 'DLF Phase 5 (The Crest & Park Place)',
      city: 'Gurugram',
      verifiedResident: true,
      rating: 4.7,
      dealsCompleted: 3,
      responseTime: 'Quick reply'
    },
    locationNote: 'Tower 3 · Boxed and ready',
    isMovingOut: true,
    movingOutDate: 'Moving Friday',
    bottomLinePrice: 2500,
    status: 'available',
    tags: ['Water Purifier', 'Appliances', 'Kitchen'],
    listedAgo: '7h ago'
  },
  {
    id: 'item-5',
    articleNumber: '904.102.73',
    ikeaStyleName: 'UPPSPEL / 27" 4K IPS display (Fixer)',
    title: 'Dell 27" 4K IPS Monitor (Loose DC Port)',
    category: 'fixer',
    roomType: 'fixer',
    price: 1800,
    originalPrice: 28990,
    condition: 'fixer_upper',
    conditionLabel: 'Fixer-Upper · Screen 100% fine; needs cable taped',
    dimensions: '61 × 18 × 45 cm',
    assemblyStatus: 'Ready Assembled (Zero assembly needed)',
    liftFriendly: 'Hand-carry 1 person',
    inspectionNote: 'Panel verified 100% functional with zero dead pixels. DC power jack requires tape tension or resoldering.',
    sellerQuote: '“Glorious 4K panel. If you have a strip of electrical tape or a soldering iron, you get a ₹29k monitor for ₹1.8k.”',
    aspectRatio: '4/5',
    savesCount: 47,
    description: 'Gorgeous 4K IPS screen with zero dead pixels. The power adapter port is loose; once taped in place it operates smoothly. Great for engineers or dual-screen desks.',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80'
    ],
    hasVideoProof: true,
    videoProofNote: '4K video playback running without flicker',
    seller: {
      name: 'Karan Shah',
      alias: 'Karan S.',
      tower: 'Tower 5',
      society: 'DLF Phase 5 (The Crest & Park Place)',
      city: 'Gurugram',
      verifiedResident: true,
      rating: 4.8,
      dealsCompleted: 11,
      responseTime: '< 15 mins'
    },
    locationNote: 'Tower 5 · 4th Floor',
    isMovingOut: false,
    bottomLinePrice: 1500,
    status: 'available',
    tags: ['Electronics', 'Fixer-Upper', '4K', 'Monitor'],
    listedAgo: '1d ago'
  },
  {
    id: 'item-6',
    articleNumber: '202.457.11',
    ikeaStyleName: 'HEMNES / Solid study desk with drawers',
    title: 'Solid Sheesham Wood Desk (120 x 60 cm)',
    category: 'furniture',
    roomType: 'wfh',
    price: 3800,
    originalPrice: 14500,
    condition: 'gently_used',
    conditionLabel: 'Gently Used · 2 Drawers, heavy sturdy build',
    dimensions: '120 × 60 × 76 cm',
    assemblyStatus: 'Ready Assembled (Zero assembly needed)',
    liftFriendly: 'Service lift recommended',
    inspectionNote: 'All drawer runners glide cleanly. Natural grain finish, minor pen mark on back edge. Rock solid.',
    sellerQuote: '“Heavy solid Sheesham. Will outlive your rental lease and probably your career. Lift trolley is available.”',
    aspectRatio: '3/4',
    savesCount: 28,
    description: 'Urban Ladder Sheesham study desk. Extremely sturdy. Selling inside the society to avoid heavy packers and movers charges.',
    images: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80'
    ],
    hasVideoProof: false,
    seller: {
      name: 'Rohan Deshmukh',
      alias: 'Rohan D.',
      tower: 'Tower 7',
      society: 'DLF Phase 5 (The Crest & Park Place)',
      city: 'Gurugram',
      verifiedResident: true,
      rating: 5.0,
      dealsCompleted: 8,
      responseTime: '< 10 mins'
    },
    locationNote: 'Tower 7 · Service lift accessible',
    isMovingOut: true,
    movingOutDate: 'Leaving this Friday',
    bottomLinePrice: 3200,
    status: 'available',
    tags: ['Furniture', 'Desk', 'Solid Wood', 'WFH'],
    listedAgo: '1d ago'
  },
  {
    id: 'item-7',
    articleNumber: '603.882.09',
    ikeaStyleName: 'ENEBY / High-fidelity Bluetooth speaker',
    title: 'Marshall Kilburn II Bluetooth Speaker',
    category: 'fixer',
    roomType: 'fixer',
    price: 3900,
    originalPrice: 24999,
    condition: 'fixer_upper',
    conditionLabel: 'Fixer-Upper · Works flawlessly on wall power cable',
    dimensions: '24 × 16 × 14 cm',
    assemblyStatus: 'Plug & Play',
    liftFriendly: 'Hand-carry 1 person',
    inspectionNote: 'Brass analog dials tested, pristine stereo separation. Battery holds limited charge; perfect tabletop wall unit.',
    sellerQuote: '“Looks like an album cover on your credenza. Keep it plugged in and enjoy sound that annoys your next-door neighbor.”',
    aspectRatio: '1/1',
    savesCount: 61,
    description: 'Iconic Marshall sound with brass knobs. Internal battery holds little charge, so it works as a plugged-in living room speaker. Power cord included.',
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80'
    ],
    hasVideoProof: true,
    videoProofNote: 'Audio bass and analog treble knobs tested',
    seller: {
      name: 'Vikram Sethi',
      alias: 'Vikram S.',
      tower: 'Tower 2',
      society: 'DLF Phase 5 (The Crest & Park Place)',
      city: 'Gurugram',
      verifiedResident: true,
      rating: 4.9,
      dealsCompleted: 7,
      responseTime: '< 20 mins'
    },
    locationNote: 'Tower 2 · Flat 304',
    isMovingOut: false,
    bottomLinePrice: 3500,
    status: 'available',
    tags: ['Audio', 'Fixer-Upper', 'Speaker'],
    listedAgo: '3h ago'
  },
  {
    id: 'item-8',
    articleNumber: '501.928.37',
    ikeaStyleName: 'FEJKA / Ceramic balcony planters (Set of 4)',
    title: 'Lush Balcony Planters Set (4 Pots + Plants)',
    category: 'decor',
    roomType: 'living',
    price: 950,
    originalPrice: 3800,
    condition: 'like_new',
    conditionLabel: 'Lush & Healthy · 2 Jade + 1 Snake plant in ceramic urns',
    dimensions: '22 × 22 × 35 cm (each)',
    assemblyStatus: 'Ready Assembled (Zero assembly needed)',
    liftFriendly: 'Hand-carry 1 person',
    inspectionNote: 'Healthy root systems in nutrient potting soil, zero pests, glaze on pots unbroken.',
    sellerQuote: '“My green babies have survived Delhi dry heat. Interstate movers strictly refuse live soil. Please take them!”',
    aspectRatio: '4/5',
    savesCount: 38,
    description: 'Moving interstate and movers refuse soil/plants. Healthy, compost-grown indoor & balcony plants looking for a caring neighbor.',
    images: [
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80'
    ],
    hasVideoProof: false,
    seller: {
      name: 'Ananya Roy',
      alias: 'Ananya R.',
      tower: 'Tower 4',
      society: 'DLF Phase 5 (The Crest & Park Place)',
      city: 'Gurugram',
      verifiedResident: true,
      rating: 5.0,
      dealsCompleted: 10,
      responseTime: '< 10 mins'
    },
    locationNote: 'Tower 4 · Same building',
    isMovingOut: true,
    movingOutDate: 'Vacating in 4 days',
    bottomLinePrice: 800,
    status: 'available',
    tags: ['Decor', 'Plants', 'Balcony'],
    listedAgo: '2h ago'
  },
  {
    id: 'item-9',
    articleNumber: '304.721.84',
    ikeaStyleName: 'LÅNGFJÄLL / Wireless mechanical keyboard',
    title: 'Keychron K2 Wireless Mechanical Keyboard',
    category: 'electronics',
    roomType: 'wfh',
    price: 2700,
    originalPrice: 7999,
    condition: 'gently_used',
    conditionLabel: 'Gently Used · Gateron Brown tactile switches',
    dimensions: '31 × 12 × 4 cm',
    assemblyStatus: 'Plug & Play',
    liftFriendly: 'Hand-carry 1 person',
    inspectionNote: 'Bluetooth and USB-C modes verified, battery holds full charge, all keycaps sanitized.',
    sellerQuote: '“The tactile clack-clack that makes Slack arguments feel cinematic. Sanitized keycaps, connects to Mac & iPad.”',
    aspectRatio: '1/1',
    savesCount: 41,
    description: 'Compact 75% wireless mechanical keyboard. Connects with Mac, Windows, iPad. White LED backlight. USB-C cable included.',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'
    ],
    hasVideoProof: true,
    videoProofNote: 'Typing sound and wireless connection demonstrated',
    seller: {
      name: 'Aditya Sen',
      alias: 'Aditya S.',
      tower: 'Tower 3',
      society: 'DLF Phase 5 (The Crest & Park Place)',
      city: 'Gurugram',
      verifiedResident: true,
      rating: 4.9,
      dealsCompleted: 8,
      responseTime: '< 10 mins'
    },
    locationNote: 'Tower 3 · Lobby pickup',
    isMovingOut: false,
    bottomLinePrice: 2400,
    status: 'available',
    tags: ['Electronics', 'Keyboard', 'WFH'],
    listedAgo: '3h ago'
  },
  {
    id: 'item-10',
    articleNumber: '703.119.82',
    ikeaStyleName: 'SLADDA / Commuter mountain bike (Fixer)',
    title: 'Decathlon Rockrider ST30 Mountain Bike',
    category: 'fixer',
    roomType: 'fixer',
    price: 2100,
    originalPrice: 8999,
    condition: 'fixer_upper',
    conditionLabel: 'Fixer-Upper · Solid steel frame; needs tube check & chain lube',
    dimensions: '168 × 58 × 100 cm',
    assemblyStatus: 'Ready Assembled (Zero assembly needed)',
    liftFriendly: 'Service lift recommended',
    inspectionNote: 'Steel frame intact with zero rust. V-brakes functional. Tires require air and chain requires lubrication.',
    sellerQuote: '“Bought with grand New Year cycling resolutions that lasted exactly 11 days. Ready for someone with actual stamina.”',
    aspectRatio: '4/5',
    savesCount: 25,
    description: 'Parked in tower stilt. Strong steel frame and gears in sound condition; tires need air and chain needs lubricant.',
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80'
    ],
    hasVideoProof: false,
    seller: {
      name: 'Rajesh Bakshi',
      alias: 'Rajesh B.',
      tower: 'Tower 6',
      society: 'DLF Phase 5 (The Crest & Park Place)',
      city: 'Gurugram',
      verifiedResident: true,
      rating: 4.8,
      dealsCompleted: 9,
      responseTime: 'Evening replies'
    },
    locationNote: 'Tower 6 · Parking bay #14',
    isMovingOut: false,
    bottomLinePrice: 1800,
    status: 'available',
    tags: ['Bicycle', 'Fitness', 'Fixer-Upper'],
    listedAgo: '1d ago'
  }
];
