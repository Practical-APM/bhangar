import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ProductCard } from './components/ProductCard';
import { MolBhavModal } from './components/MolBhavModal';
import { ItemDetailModal } from './components/ItemDetailModal';
import { ListItemModal } from './components/ListItemModal';
import { SellerOffersModal } from './components/SellerOffersModal';
import { OnboardingModal } from './components/OnboardingModal';
import { ProfileModal } from './components/ProfileModal';
import { GoogleOAuthModal } from './components/GoogleOAuthModal';
import { WishlistModal } from './components/WishlistModal';
import { SocietyModal } from './components/SocietyModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Analytics } from '@vercel/analytics/react';
import { CheckCircle2, X } from 'lucide-react';
import { 
  METRO_SOCIETIES, 
  DEFAULT_SOCIETY,
  INITIAL_THRIFT_ITEMS, 
  INITIAL_SELLER_OFFERS,
  INITIAL_USER_PROFILE,
  INITIAL_COMMENTS,
  ThriftItem, 
  SellerOffer,
  SocietyInfo,
  SocietyRequest,
  UserProfile,
  ItemComment,
  isItemOwner,
  getDistanceKm
} from './data/mockData';
import {
  fetchItemsFromDB,
  createItemInDB,
  deleteItemFromDB,
  fetchOffersFromDB,
  updateOfferStatusInDB,
  createCommentInDB,
  subscribeToRealtimeChanges,
  fetchUserProfileFromDB,
  saveUserProfileToDB,
  fetchSocietiesFromDB,
  createSocietyInDB,
  updateItemStatusInDB,
  updateItemPriceInDB,
  renewItemInDB
} from './services/api';
import { supabase, isSupabaseConfigured, signOutFromSupabase } from './lib/supabase';

const DUMMY_SOCIETY_IDS = new Set([
  'dlf-phase-5',
  'prestige-shantiniketan',
  'amanora-park-town',
  'ats-greens',
  'hiranandani-estate',
  'my-home-bhooja',
  'godrej-woodsman'
]);

export const LEGACY_DUMMY_ITEM_IDS = new Set([
  'item-1',
  'item-2',
  'item-3',
  'item-4',
  'item-5',
  'item-6',
  'item-7',
  'item-8',
  'item-9',
  'item-10'
]);

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[LocalStorage] Failed to save "${key}":`, e);
  }
}

// Route /privacy and /terms if accessed directly by Google verification or user
if (typeof window !== 'undefined') {
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
  if (path === '/privacy' || path === '/privacy-policy') {
    window.location.replace('/privacy.html');
  } else if (path === '/terms' || path === '/terms-of-service') {
    window.location.replace('/terms.html');
  }
}

// Purge legacy mock demo data from localStorage if present
if (typeof window !== 'undefined') {
  try {
    const existing = localStorage.getItem('bhangar_items');
    if (existing) {
      const parsed = JSON.parse(existing);
      if (Array.isArray(parsed)) {
        const cleanItems = parsed.filter((it: any) => 
          !LEGACY_DUMMY_ITEM_IDS.has(it.id) && 
          !it.is_seed
        );
        if (cleanItems.length !== parsed.length) {
          localStorage.setItem('bhangar_items', JSON.stringify(cleanItems));
        }
      }
    }
    const existingOffers = localStorage.getItem('bhangar_seller_offers');
    if (existingOffers) {
      const parsedOffers = JSON.parse(existingOffers);
      if (Array.isArray(parsedOffers)) {
        const cleanOffers = parsedOffers.filter((o: any) => !LEGACY_DUMMY_ITEM_IDS.has(o.itemId));
        if (cleanOffers.length !== parsedOffers.length) {
          localStorage.setItem('bhangar_seller_offers', JSON.stringify(cleanOffers));
        }
      }
    }
    // Purge dummy societies from localStorage
    const existingSocieties = localStorage.getItem('bhangar_societies');
    if (existingSocieties) {
      const parsedSocieties = JSON.parse(existingSocieties);
      if (Array.isArray(parsedSocieties)) {
        const cleanSocieties = parsedSocieties.filter((s: any) => !DUMMY_SOCIETY_IDS.has(s.id));
        if (cleanSocieties.length !== parsedSocieties.length) {
          localStorage.setItem('bhangar_societies', JSON.stringify(cleanSocieties));
        }
      }
    }
    const existingCurrentSoc = localStorage.getItem('bhangar_society');
    if (existingCurrentSoc) {
      const parsedCurrent = JSON.parse(existingCurrentSoc);
      if (parsedCurrent && DUMMY_SOCIETY_IDS.has(parsedCurrent.id)) {
        localStorage.removeItem('bhangar_society');
      }
    }
  } catch {}
}

export function App() {
  const [societies, setSocieties] = useState<SocietyInfo[]>(() => {
    const loaded = loadStorage<SocietyInfo[]>('bhangar_societies', METRO_SOCIETIES);
    if (!Array.isArray(loaded)) return [];
    return loaded.filter((s) => !DUMMY_SOCIETY_IDS.has(s.id));
  });
  const [currentSociety, setCurrentSociety] = useState<SocietyInfo>(() => {
    const saved = loadStorage<SocietyInfo | null>('bhangar_society', null);
    if (saved && saved.id && !DUMMY_SOCIETY_IDS.has(saved.id)) return saved;
    const initialSocieties = loadStorage<SocietyInfo[]>('bhangar_societies', []).filter((s) => !DUMMY_SOCIETY_IDS.has(s.id));
    return initialSocieties[0] || DEFAULT_SOCIETY;
  });
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = loadStorage<UserProfile>('bhangar_user_profile', INITIAL_USER_PROFILE);
    if (!saved || saved.email === 'sakar.m@gmail.com' || saved.name === 'Sakar M.' || !saved.isLoggedIn) {
      try {
        localStorage.removeItem('bhangar_user_profile');
      } catch {}
      return INITIAL_USER_PROFILE;
    }
    return saved;
  });
  const [userTower, setUserTower] = useState<string>(() => 
    loadStorage('bhangar_tower', 'Tower 4')
  );
  const [items, setItems] = useState<ThriftItem[]>(() => {
    const loaded = loadStorage<ThriftItem[]>('bhangar_items', INITIAL_THRIFT_ITEMS);
    if (!Array.isArray(loaded)) return [];
    const deletedRaw = loadStorage<string[]>('bhangar_deleted_ids', []);
    const deletedSet = new Set(deletedRaw);
    return loaded.filter((it) => 
      !LEGACY_DUMMY_ITEM_IDS.has(it.id) && 
      !deletedSet.has(it.id) &&
      !it.is_seed &&
      it.status !== 'deleted'
    );
  });
  const [comments, setComments] = useState<ItemComment[]>(() => 
    loadStorage('bhangar_comments', INITIAL_COMMENTS)
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTowerFilter, setSelectedTowerFilter] = useState<string>('all');
  const [selectedScopeFilter, setSelectedScopeFilter] = useState<'all' | 'my_society'>('all');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('all');
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    const raw = loadStorage<string[]>('bhangar_saved_ids', []);
    return new Set(raw);
  });
  const [showOnlySaved, setShowOnlySaved] = useState<boolean>(false);

  // Seller inbox & offers
  const [sellerOffers, setSellerOffers] = useState<SellerOffer[]>(() => 
    loadStorage('bhangar_seller_offers', INITIAL_SELLER_OFFERS)
  );
  const [showSellerModal, setShowSellerModal] = useState<boolean>(false);

  // Admin Route state (/admin or #/admin)
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
    const hash = window.location.hash.toLowerCase();
    return path === '/admin' || hash === '#/admin' || hash === '#admin';
  });

  // Action URL parameters (e.g. 1-tap WhatsApp mark sold link: /?action=mark_sold&item=xxx)
  const [markSoldModalItem, setMarkSoldModalItem] = useState<ThriftItem | null>(null);
  const [markSoldSuccessMessage, setMarkSoldSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    const itemId = urlParams.get('item') || urlParams.get('itemId');

    if (action === 'mark_sold' && itemId && items.length > 0) {
      const target = items.find((it) => it.id === itemId);
      if (target) {
        if (target.status === 'sold') {
          setMarkSoldSuccessMessage(`"${target.title}" is already marked as Sold.`);
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          setMarkSoldModalItem(target);
        }
      }
    }
  }, [items]);

  useEffect(() => {
    if (!markSoldSuccessMessage) return;
    const timer = setTimeout(() => setMarkSoldSuccessMessage(null), 4500);
    return () => clearTimeout(timer);
  }, [markSoldSuccessMessage]);

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
      const hash = window.location.hash.toLowerCase();
      setIsAdminRoute(path === '/admin' || hash === '#/admin' || hash === '#admin');
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateToHome = () => {
    if (window.location.pathname.toLowerCase().startsWith('/admin')) {
      window.history.pushState(null, '', '/');
    } else {
      window.location.hash = '';
    }
    setIsAdminRoute(false);
  };

  // Auto-sync state to localStorage
  useEffect(() => saveStorage('bhangar_societies', societies), [societies]);
  useEffect(() => saveStorage('bhangar_society', currentSociety), [currentSociety]);
  useEffect(() => {
    if (userProfile.isLoggedIn) {
      saveStorage('bhangar_user_profile', userProfile);
    } else {
      try {
        localStorage.removeItem('bhangar_user_profile');
      } catch {}
    }
  }, [userProfile]);

  useEffect(() => saveStorage('bhangar_tower', userTower), [userTower]);
  useEffect(() => saveStorage('bhangar_items', items), [items]);
  useEffect(() => saveStorage('bhangar_comments', comments), [comments]);
  useEffect(() => saveStorage('bhangar_saved_ids', Array.from(savedIds)), [savedIds]);
  useEffect(() => saveStorage('bhangar_seller_offers', sellerOffers), [sellerOffers]);

  // Initial fetch from backend if connected + Realtime subscriptions (All societies feed)
  useEffect(() => {
    fetchItemsFromDB().then((fetched) => {
      if (fetched) setItems(fetched);
    });
    fetchOffersFromDB().then((offers) => {
      if (offers) setSellerOffers(offers);
    });
    fetchSocietiesFromDB().then((dbSocieties) => {
      if (dbSocieties && dbSocieties.length > 0) {
        setSocieties((prev) => {
          const map = new Map<string, SocietyInfo>();
          prev.forEach(s => map.set(s.id, s));
          dbSocieties.forEach(s => map.set(s.id, s));
          return Array.from(map.values());
        });
      }
    });

    const unsubscribe = subscribeToRealtimeChanges(
      () => {
        fetchItemsFromDB().then((refetched) => {
          if (refetched) setItems(refetched);
        });
      },
      () => {
        fetchOffersFromDB().then((refetched) => {
          if (refetched) setSellerOffers(refetched);
        });
      }
    );

    return () => unsubscribe();
  }, []);

  // Core Modals
  const [activeOfferItem, setActiveOfferItem] = useState<ThriftItem | null>(null);
  const [activeDetailItem, setActiveDetailItem] = useState<ThriftItem | null>(null);
  const [showListItemModal, setShowListItemModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);
  const [showGoogleModal, setShowGoogleModal] = useState<boolean>(false);
  const [showWishlistModal, setShowWishlistModal] = useState<boolean>(false);
  const [showSocietyModal, setShowSocietyModal] = useState<boolean>(false);

  // Guest Intent Gatekeeping
  const [authPromptReason, setAuthPromptReason] = useState<string>('Sign in to continue');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Real Supabase Google OAuth Session Sync & Listener
  useEffect(() => {
    if (!supabase) return;

    const syncUserFromSupabase = async (user: any) => {
      const meta = user.user_metadata || {};
      const fullName = meta.full_name || meta.name || user.email?.split('@')[0] || 'Resident';
      const avatar = meta.avatar_url || meta.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`;

      const saved = loadStorage<UserProfile | null>('bhangar_user_profile', null);
      
      // Fetch cloud-persisted resident profile from Supabase first
      let dbProfile: UserProfile | null = null;
      try {
        dbProfile = await fetchUserProfileFromDB(user.id);
      } catch (err) {
        console.warn('[SyncUser] Cloud profile lookup warning:', err);
      }

      const activeProfile = dbProfile || saved;

      const isAlreadyOnboarded = Boolean(
        activeProfile && 
        activeProfile.isOnboarded && 
        activeProfile.phone && 
        activeProfile.tower
      );

      const baseProfile: UserProfile = {
        ...(activeProfile || INITIAL_USER_PROFILE),
        id: user.id,
        name: activeProfile?.name || fullName,
        username: activeProfile?.username || user.email?.split('@')[0] || fullName.toLowerCase().replace(/\s+/g, '_'),
        email: user.email || activeProfile?.email || '',
        authProvider: 'google',
        googleAvatar: activeProfile?.googleAvatar || avatar,
        customAvatar: activeProfile?.customAvatar,
        isLoggedIn: true,
        isOnboarded: isAlreadyOnboarded,
        tower: activeProfile?.tower || '',
        societyId: activeProfile?.societyId || currentSociety.id,
        societyName: activeProfile?.societyName || currentSociety.name,
        phone: activeProfile?.phone || '',
        isVerified: true,
      };

      setUserProfile(baseProfile);
      if (baseProfile.tower) {
        setUserTower(baseProfile.tower);
      }
      if (baseProfile.societyId && baseProfile.societyId !== currentSociety.id) {
        const matchingSoc = societies.find(s => s.id === baseProfile.societyId);
        if (matchingSoc) {
          setCurrentSociety(matchingSoc);
        }
      }
      setShowGoogleModal(false);

      if (!isAlreadyOnboarded) {
        // Automatically pop up Onboarding modal to complete profile for new residents!
        setShowOnboardingModal(true);
      } else {
        setShowOnboardingModal(false);
        if (pendingAction) {
          const action = pendingAction;
          setPendingAction(null);
          setTimeout(() => action(), 100);
        }
      }
    };

    // Check existing active Supabase session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!error && session?.user) {
        syncUserFromSupabase(session.user);
      }
    });

    // Listen to OAuth events (redirect callback, sign in, sign out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        syncUserFromSupabase(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUserProfile((prev) => ({
          ...prev,
          isLoggedIn: false,
          email: '',
          name: 'Guest Resident'
        }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [currentSociety.id, currentSociety.name, pendingAction, societies]);


  const requireAuth = (action: () => void, promptReason: string) => {
    if (userProfile.isLoggedIn) {
      action();
    } else {
      setPendingAction(() => action);
      setAuthPromptReason(promptReason);
      setShowGoogleModal(true);
    }
  };

  // Items listed by the current user (strictly authenticated via isItemOwner)
  const myItems = items.filter((it) => isItemOwner(it, userProfile));
  const myItemIds = new Set(myItems.map((it) => it.id));
  const mySellerOffers = sellerOffers.filter((o) => myItemIds.has(o.itemId));
  const pendingOffersCount = mySellerOffers.filter((o) => o.status === 'pending').length;

  // Filter out expired items from public view (unless owner viewing their own items)
  const activeUnexpiredItems = items.filter(
    (item) => !item.isExpired || isItemOwner(item, userProfile)
  );

  // Filtering logic (Feed shows items from all societies by default, with city and society filters)
  const filteredItems = activeUnexpiredItems.filter((item) => {
    // Saved filter
    if (showOnlySaved && !savedIds.has(item.id)) return false;

    // Scope / Society filter
    if (selectedScopeFilter === 'my_society') {
      const itemSoc = (item.seller?.society || '').trim().toLowerCase();
      const currentSoc = (currentSociety.name || '').trim().toLowerCase();
      if (itemSoc !== currentSoc) return false;
    }

    // City filter
    if (selectedCityFilter !== 'all') {
      const itemCity = (item.seller?.city || '').trim().toLowerCase();
      const targetCity = (selectedCityFilter || '').trim().toLowerCase();
      if (itemCity !== targetCity) return false;
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchDesc = (item.description || '').toLowerCase().includes(q);
      const matchTag = Array.isArray(item.tags) && item.tags.some(t => t.toLowerCase().includes(q));
      const matchLoc = (item.seller?.society || '').toLowerCase().includes(q) || (item.seller?.city || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchTag && !matchLoc) return false;
    }

    // Category match
    if (selectedCategory === 'moving_out') {
      if (!item.isMovingOut) return false;
    } else if (selectedCategory === 'fixer') {
      if (item.condition !== 'fixer_upper' && item.category !== 'fixer' && item.roomType !== 'fixer') return false;
    } else if (selectedCategory === 'wfh') {
      if (item.roomType !== 'wfh' && item.category !== 'electronics') return false;
    } else if (selectedCategory === 'furniture') {
      if (item.category !== 'furniture') return false;
    } else if (selectedCategory === 'living') {
      if (item.roomType !== 'living' && item.category !== 'decor') return false;
    } else if (selectedCategory === 'appliances') {
      if (item.roomType !== 'appliances' && item.category !== 'appliances') return false;
    }

    // Tower filter
    if (selectedTowerFilter !== 'all') {
      if (item.seller?.tower !== selectedTowerFilter) return false;
    }

    return true;
  });

  // Sort items: items with recent price drops get an organic boost, then by recency
  const sortedFilteredItems = [...filteredItems].sort((a, b) => {
    // If one has a recent price drop, boost it to the top
    const aDrop = a.previousPrice && a.previousPrice > a.price ? 1 : 0;
    const bDrop = b.previousPrice && b.previousPrice > b.price ? 1 : 0;
    if (aDrop !== bDrop) return bDrop - aDrop;

    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  // Nearby spillover items (when user is filtering by my_society and there are few or zero items)
  const nearbySpilloverItems = React.useMemo(() => {
    if (selectedScopeFilter !== 'my_society' || !currentSociety.id) return [];
    const currentSocName = (currentSociety.name || '').trim().toLowerCase();

    return activeUnexpiredItems
      .filter((item) => {
        const itemSoc = (item.seller?.society || '').trim().toLowerCase();
        if (itemSoc === currentSocName) return false;

        // Match category
        if (selectedCategory === 'moving_out' && !item.isMovingOut) return false;
        if (selectedCategory === 'fixer' && item.condition !== 'fixer_upper' && item.category !== 'fixer' && item.roomType !== 'fixer') return false;
        if (selectedCategory === 'wfh' && item.roomType !== 'wfh' && item.category !== 'electronics') return false;
        if (selectedCategory === 'furniture' && item.category !== 'furniture') return false;
        if (selectedCategory === 'living' && item.roomType !== 'living' && item.category !== 'decor') return false;
        if (selectedCategory === 'appliances' && item.roomType !== 'appliances' && item.category !== 'appliances') return false;

        // Search match
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = (item.title || '').toLowerCase().includes(q);
          const matchDesc = (item.description || '').toLowerCase().includes(q);
          if (!matchTitle && !matchDesc) return false;
        }

        return true;
      })
      .map((item) => {
        let distanceKm: number | undefined;
        if (currentSociety.lat && currentSociety.lng) {
          const matchSoc = societies.find(s => s.name.toLowerCase() === (item.seller?.society || '').toLowerCase());
          if (matchSoc?.lat && matchSoc?.lng) {
            distanceKm = getDistanceKm(currentSociety.lat, currentSociety.lng, matchSoc.lat, matchSoc.lng);
          }
        }
        return { item, distanceKm };
      })
      .sort((a, b) => {
        if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
          return a.distanceKm - b.distanceKm;
        }
        return 0;
      })
      .slice(0, 8);
  }, [activeUnexpiredItems, selectedScopeFilter, currentSociety, societies, selectedCategory, searchQuery]);

  const handleSelectSociety = (soc: SocietyInfo) => {
    setCurrentSociety(soc);
    const defaultTower = soc.towers[0] || 'Tower 1';
    setUserTower(defaultTower);
    setSelectedTowerFilter('all');
  };

  const handleRequestSociety = (req: SocietyRequest) => {
    const newSoc: SocietyInfo = {
      id: req.id || `soc-${Date.now()}`,
      name: req.name,
      city: req.city,
      area: req.locality,
      pincode: req.pincode,
      activeListingsCount: 0,
      residentCount: 0,
      isLive: true,
      towers: Array.from({ length: req.towersCount || 4 }, (_, i) => `Tower ${i + 1}`)
    };
    setSocieties((prev) => [newSoc, ...prev]);
    handleSelectSociety(newSoc);
    createSocietyInDB(newSoc);
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedScopeFilter('all');
    setSelectedCityFilter('all');
    setSelectedTowerFilter('all');
    setSearchQuery('');
    setShowOnlySaved(false);
  };

  const handleToggleSave = (id: string) => {
    requireAuth(() => {
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }, `Sign in with Google to save items to your ${currentSociety.name.split('(')[0].trim()} wishlist`);
  };

  const handleItemUpdated = (updatedItem: ThriftItem) => {
    setItems((prev) => prev.map((it) => (it.id === updatedItem.id ? updatedItem : it)));
  };

  const handleItemAdded = async (newItem: ThriftItem) => {
    const itemWithSeller: ThriftItem = {
      ...newItem,
      sellerId: userProfile.id || newItem.sellerId,
    };
    setItems((prev) => [itemWithSeller, ...prev]);
    try {
      const persisted = await createItemInDB(itemWithSeller);
      setItems((prev) => prev.map((it) => (it.id === persisted.id ? persisted : it)));
    } catch (e) {
      console.warn('[ItemAdded] DB sync error:', e);
    }
  };

  // Seller Offer Actions
  const handleAcceptSellerOffer = (offer: SellerOffer) => {
    setSellerOffers((prev) =>
      prev.map((o) => (o.id === offer.id ? { ...o, status: 'accepted' as const } : o))
    );

    setItems((prev) =>
      prev.map((it) =>
        it.id === offer.itemId
          ? { ...it, status: 'held' as const, heldBy: offer.buyerTower }
          : it
      )
    );
    updateOfferStatusInDB(offer.id, 'accepted');
    updateItemStatusInDB(offer.itemId, 'held');
  };

  const handleCounterSellerOffer = (offerId: string, counterPrice: number) => {
    setSellerOffers((prev) =>
      prev.map((o) =>
        o.id === offerId
          ? { ...o, status: 'countered' as const, counterPrice }
          : o
      )
    );
    updateOfferStatusInDB(offerId, 'countered', counterPrice);
  };

  const handleDeclineSellerOffer = (offerId: string) => {
    setSellerOffers((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, status: 'declined' as const } : o))
    );
    updateOfferStatusInDB(offerId, 'declined');
  };

  const handleMarkItemSold = (itemId: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, status: 'sold' as const } : it))
    );
    setSellerOffers((prev) =>
      prev.map((o) => (o.itemId === itemId ? { ...o, status: 'accepted' as const } : o))
    );
    if (activeDetailItem?.id === itemId) {
      setActiveDetailItem((prev) => (prev ? { ...prev, status: 'sold' } : null));
    }
    updateItemStatusInDB(itemId, 'sold');
  };

  const handleMarkdownItem = (itemId: string, newPrice: number) => {
    let oldPrice: number | undefined;
    const now = new Date().toISOString();
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          oldPrice = it.price;
          return {
            ...it,
            price: newPrice,
            previousPrice: it.price > newPrice ? it.price : it.previousPrice,
            priceDroppedAt: now
          };
        }
        return it;
      })
    );
    if (activeDetailItem?.id === itemId) {
      setActiveDetailItem((prev) =>
        prev
          ? {
              ...prev,
              price: newPrice,
              previousPrice: prev.price > newPrice ? prev.price : prev.previousPrice,
              priceDroppedAt: now
            }
          : null
      );
    }
    updateItemPriceInDB(itemId, newPrice, oldPrice);
  };

  const handleRenewItem = async (itemId: string) => {
    const now = new Date().toISOString();
    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? { ...it, createdAt: now, isExpired: false, renewedAt: now, listedAgo: 'Just now' }
          : it
      )
    );
    if (activeDetailItem?.id === itemId) {
      setActiveDetailItem((prev) =>
        prev
          ? { ...prev, createdAt: now, isExpired: false, renewedAt: now, listedAgo: 'Just now' }
          : null
      );
    }
    await renewItemInDB(itemId);
  };

  const handleDeleteItem = async (itemId: string) => {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
    setSellerOffers((prev) => prev.filter((o) => o.itemId !== itemId));
    if (activeDetailItem?.id === itemId) {
      setActiveDetailItem(null);
    }
    await deleteItemFromDB(itemId);
  };

  const handleUpdateItemStatus = (itemId: string, status: 'available' | 'held' | 'sold') => {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, status } : it))
    );
    if (status === 'sold') {
      setSellerOffers((prev) =>
        prev.map((o) => (o.itemId === itemId ? { ...o, status: 'accepted' as const } : o))
      );
    }
    if (activeDetailItem?.id === itemId) {
      setActiveDetailItem((prev) => (prev ? { ...prev, status } : null));
    }
    updateItemStatusInDB(itemId, status);
  };

  const handleSaveProfile = async (updated: UserProfile) => {
    const profileToSave: UserProfile = {
      ...updated,
      id: userProfile.id || updated.id,
      isOnboarded: true,
      isLoggedIn: true
    };
    setUserProfile(profileToSave);
    setUserTower(profileToSave.tower);
    const soc = societies.find((s) => s.id === profileToSave.societyId);
    if (soc) {
      setCurrentSociety(soc);
    }
    setShowOnboardingModal(false);

    // Save to Cloud Supabase DB!
    if (profileToSave.id) {
      await saveUserProfileToDB(profileToSave, profileToSave.id);
    }

    if (pendingAction) {
      const action = pendingAction;
      setPendingAction(null);
      setTimeout(() => action(), 100);
    }
  };

  const handleAddComment = (itemId: string, text: string) => {
    requireAuth(() => {
      const targetItem = items.find((it) => it.id === itemId);
      const isOwner = targetItem ? isItemOwner(targetItem, userProfile) : false;

      const newCmt: ItemComment = {
        id: 'cmt-' + Date.now(),
        itemId,
        authorName: userProfile.name,
        authorTower: userTower,
        text,
        timestamp: 'Just now',
        isSeller: isOwner
      };
      setComments((prev) => [newCmt, ...prev]);
      createCommentInDB(newCmt);
    }, `Sign in with Google to post questions in ${currentSociety.name.split('(')[0].trim()}`);
  };

  const handleGoogleLoginSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
    setUserTower(profile.tower);
    const soc = societies.find((s) => s.id === profile.societyId);
    if (soc) {
      setCurrentSociety(soc);
    }
    setShowGoogleModal(false);
    if (pendingAction) {
      const action = pendingAction;
      setPendingAction(null);
      setTimeout(() => action(), 100);
    }
  };

  const handleSignOut = async () => {
    if (isSupabaseConfigured()) {
      await signOutFromSupabase();
    }
    try {
      localStorage.removeItem('bhangar_user_profile');
    } catch {}
    setUserProfile(INITIAL_USER_PROFILE);
  };



  const savedItems = items.filter((it) => savedIds.has(it.id));

  // Render Admin Dashboard if user is on /admin route
  if (isAdminRoute) {
    return (
      <>
        <Analytics />
        <AdminDashboard
          items={items}
          societies={societies}
          offers={sellerOffers}
          comments={comments}
          userProfile={userProfile}
          onBackToStorefront={navigateToHome}
          onUpdateItemStatus={(itemId, status) => {
            setItems(prev => prev.map(it => it.id === itemId ? { ...it, status } : it));
            if (isSupabaseConfigured() && supabase) {
              supabase.from('items').update({ status }).eq('id', itemId).then(() => {});
            }
          }}
          onDeleteItem={(itemId) => {
            setItems(prev => prev.filter(it => it.id !== itemId));
            if (isSupabaseConfigured() && supabase) {
              supabase.from('items').delete().eq('id', itemId).then(() => {});
            }
          }}
          onApproveSociety={(newSoc) => {
            setSocieties(prev => [newSoc, ...prev.filter(s => s.id !== newSoc.id)]);
          }}
          onRefreshData={async () => {
            try {
              const freshItems = await fetchItemsFromDB();
              setItems(freshItems);
              const freshOffers = await fetchOffersFromDB();
              setSellerOffers(freshOffers);
            } catch (e) {
              console.warn('Admin refresh error:', e);
            }
          }}
        />
      </>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-page)',
      width: '100%',
      overflowX: 'hidden'
    }}>
      <Analytics />
      {/* Header */}
      <Header
        currentSociety={currentSociety}
        societies={societies}
        onSelectSociety={handleSelectSociety}
        userTower={userTower}
        onChangeUserTower={(t) => {
          setUserTower(t);
          setUserProfile((prev) => ({ ...prev, tower: t }));
        }}
        onOpenListItem={() => {
          requireAuth(
            () => setShowListItemModal(true),
            `Sign in with Google to list items in ${currentSociety.name.split('(')[0].trim()}`
          );
        }}
        pendingOffersCount={pendingOffersCount}
        onOpenSellerOffers={() => setShowSellerModal(true)}
        userProfile={userProfile}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenOnboarding={() => setShowOnboardingModal(true)}
        onOpenGoogleLogin={() => {
          setAuthPromptReason(`Sign in with Google to access ${currentSociety.name.split('(')[0].trim()} verified deals`);
          setShowGoogleModal(true);
        }}
        savedWishlistCount={savedIds.size}
        onOpenWishlist={() => setShowWishlistModal(true)}
        onOpenSocietyModal={() => setShowSocietyModal(true)}
      />

      {/* Hero Search & Categories */}
      <HeroSection
        currentSociety={currentSociety}
        items={items}
        onOpenListItem={() => {
          requireAuth(
            () => setShowListItemModal(true),
            `Sign in with Google to list items in ${currentSociety.name.split('(')[0].trim()}`
          );
        }}
        onViewDetails={(it) => setActiveDetailItem(it)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTowerFilter={selectedTowerFilter}
        onSelectTowerFilter={setSelectedTowerFilter}
        userTower={userTower}
        savedCount={savedIds.size}
        showOnlySaved={showOnlySaved}
        onToggleShowOnlySaved={() => {
          if (!userProfile.isLoggedIn && !showOnlySaved) {
            requireAuth(() => setShowOnlySaved(true), `Sign in with Google to view your saved wishlist in ${currentSociety.name.split('(')[0].trim()}`);
          } else {
            setShowOnlySaved(!showOnlySaved);
          }
        }}
        selectedScopeFilter={selectedScopeFilter}
        onSelectScopeFilter={(scope) => {
          setSelectedScopeFilter(scope);
          if (scope === 'all') {
            setSelectedTowerFilter('all');
          } else {
            setSelectedCityFilter('all');
          }
        }}
        selectedCityFilter={selectedCityFilter}
        onSelectCityFilter={setSelectedCityFilter}
        availableCities={Array.from(new Set(items.map(it => it.seller?.city).filter(Boolean)))}
        totalAllItemsCount={items.length}
        mySocietyItemsCount={items.filter(it => (it.seller?.society || '').toLowerCase() === (currentSociety.name || '').toLowerCase()).length}
      />

      {/* Main Masonry Area */}
      <main style={{
        width: '100%',
        maxWidth: '1360px',
        margin: '0 auto',
        padding: '0 clamp(14px, 3vw, 24px) 60px',
        flex: 1,
        boxSizing: 'border-box'
      }}>

        {/* Results Metadata */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '18px',
          fontSize: '12px',
          color: 'var(--text-muted)',
          paddingTop: '2px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>{filteredItems.length}</span>
            <span>items</span>
            {selectedScopeFilter === 'my_society' ? (
              <span>in <strong style={{ color: 'var(--text-primary)' }}>{currentSociety.name.split('(')[0].trim()}</strong></span>
            ) : selectedCityFilter !== 'all' ? (
              <span>in <strong style={{ color: 'var(--text-primary)' }}>{selectedCityFilter}</strong></span>
            ) : (
              <span>across all societies</span>
            )}
            {selectedTowerFilter !== 'all' && <span>· {selectedTowerFilter}</span>}
            {showOnlySaved && <span>· Saved only</span>}
          </div>
          {(selectedCategory !== 'all' || selectedTowerFilter !== 'all' || selectedScopeFilter !== 'all' || selectedCityFilter !== 'all' || searchQuery || showOnlySaved) && (
            <button
              onClick={handleResetFilters}
              style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Pure Product Masonry Feed */}
        {sortedFilteredItems.length > 0 ? (
          <div>
            <div className="masonry-feed">
              {sortedFilteredItems.map((item) => {
                const isOwner = isItemOwner(item, userProfile);
                return (
                  <ProductCard
                    key={item.id}
                    item={item}
                    userTower={userTower}
                    currentSocietyName={currentSociety.name}
                    isOwner={isOwner}
                    isSaved={savedIds.has(item.id)}
                    onToggleSave={handleToggleSave}
                    onOpenOfferModal={(it) => {
                      if (isItemOwner(it, userProfile)) {
                        setActiveDetailItem(it);
                        return;
                      }
                      requireAuth(
                        () => setActiveOfferItem(it),
                        `Sign in with Google to make offers and negotiate with ${it.seller.alias} in ${it.seller.tower}`
                      );
                    }}
                    onViewDetails={(it) => setActiveDetailItem(it)}
                  />
                );
              })}
            </div>

            {/* Nearby Society Spillover Section (when society has few items) */}
            {selectedScopeFilter === 'my_society' && sortedFilteredItems.length < 4 && nearbySpilloverItems.length > 0 && (
              <div style={{ marginTop: '36px', borderTop: '1px dashed var(--border-medium)', paddingTop: '24px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>📍</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      More Finds in Nearby Societies
                    </span>
                    <span style={{
                      fontSize: '11px',
                      background: '#EFF6FF',
                      color: '#1D4ED8',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontWeight: 600
                    }}>
                      Within 3 km
                    </span>
                  </div>
                </div>

                <div className="masonry-feed">
                  {nearbySpilloverItems.map(({ item, distanceKm }) => {
                    const isOwner = isItemOwner(item, userProfile);
                    return (
                      <ProductCard
                        key={`nearby-${item.id}`}
                        item={item}
                        userTower={userTower}
                        currentSocietyName={currentSociety.name}
                        distanceKm={distanceKm}
                        isOwner={isOwner}
                        isSaved={savedIds.has(item.id)}
                        onToggleSave={handleToggleSave}
                        onOpenOfferModal={(it) => {
                          if (isItemOwner(it, userProfile)) {
                            setActiveDetailItem(it);
                            return;
                          }
                          requireAuth(
                            () => setActiveOfferItem(it),
                            `Sign in with Google to make offers and negotiate with ${it.seller.alias}`
                          );
                        }}
                        onViewDetails={(it) => setActiveDetailItem(it)}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : nearbySpilloverItems.length > 0 ? (
          /* Graceful Spillover When Current Society Has 0 Items */
          <div>
            <div style={{
              margin: '0 auto 24px',
              padding: '14px 18px',
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>🏘️</span>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#1E3A8A' }}>
                    No listings yet in {currentSociety.name.split('(')[0].trim()}
                  </div>
                  <div style={{ fontSize: '12px', color: '#3B82F6' }}>
                    Showing verified pre-loved finds from nearby societies (within 3 km):
                  </div>
                </div>
              </div>
              <button
                onClick={() => requireAuth(() => setShowListItemModal(true), 'Sign in to list items')}
                style={{
                  padding: '8px 14px',
                  background: '#1D4ED8',
                  color: '#FFFFFF',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                + Post First Listing
              </button>
            </div>

            <div className="masonry-feed">
              {nearbySpilloverItems.map(({ item, distanceKm }) => {
                const isOwner = isItemOwner(item, userProfile);
                return (
                  <ProductCard
                    key={`spillover-${item.id}`}
                    item={item}
                    userTower={userTower}
                    currentSocietyName={currentSociety.name}
                    distanceKm={distanceKm}
                    isOwner={isOwner}
                    isSaved={savedIds.has(item.id)}
                    onToggleSave={handleToggleSave}
                    onOpenOfferModal={(it) => {
                      if (isItemOwner(it, userProfile)) {
                        setActiveDetailItem(it);
                        return;
                      }
                      requireAuth(
                        () => setActiveOfferItem(it),
                        `Sign in with Google to make offers and negotiate with ${it.seller.alias}`
                      );
                    }}
                    onViewDetails={(it) => setActiveDetailItem(it)}
                  />
                );
              })}
            </div>
          </div>
        ) : items.length === 0 ? (
          <div style={{
            padding: '72px 20px',
            textAlign: 'center',
            maxWidth: '420px',
            margin: '0 auto',
          }}>
            <div style={{
              width: '56px', height: '56px',
              borderRadius: '18px',
              background: 'var(--bg-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '26px',
            }}>📦</div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
              No listings yet in {currentSociety.name.split('(')[0].trim()}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '22px', lineHeight: 1.5 }}>
              Be the first to list! Moving out or clearing space? Sell your pre-loved furniture, appliances, or study desk in under 2 minutes.
            </div>
            <button
              onClick={() => requireAuth(() => setShowListItemModal(true), 'Sign in to list items')}
              style={{
                padding: '11px 24px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--text-primary)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              + Post First Listing
            </button>
          </div>
        ) : (
          <div style={{
            padding: '72px 20px',
            textAlign: 'center',
            maxWidth: '320px',
            margin: '0 auto',
          }}>
            <div style={{
              width: '52px', height: '52px',
              borderRadius: '16px',
              background: 'var(--bg-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '24px',
            }}>🔍</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', letterSpacing: '-0.02em' }}>
              No items found
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
              Try a different search term or clear your filters to see all listings.
            </div>
            <button
              onClick={handleResetFilters}
              style={{
                padding: '9px 20px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--text-primary)',
                color: '#FFFFFF',
                fontSize: '12.5px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                letterSpacing: '-0.01em',
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-hairline)',
        padding: '16px 24px',
        color: 'var(--text-muted)',
        fontSize: '11.5px',
        background: 'var(--bg-surface)',
        width: '100%',
      }}>
        <div style={{
          maxWidth: '1360px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Bhangar.Space</strong>
            <span style={{ margin: '0 6px', color: 'var(--border-subtle)' }}>·</span>
            <span>Hyperlocal resident marketplace for moving tenants.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <a
              href="/privacy.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-muted)', textDecoration: 'underline', textUnderlineOffset: '2px' }}
            >
              Privacy Policy
            </a>
            <a
              href="/terms.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-muted)', textDecoration: 'underline', textUnderlineOffset: '2px' }}
            >
              Terms of Service
            </a>
            <button
              onClick={() => setShowSocietyModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                textDecoration: 'underline',
                textUnderlineOffset: '2px',
                fontSize: '11.5px',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              + Add your society
            </button>
            <a
              href="/admin"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState(null, '', '/admin');
                setIsAdminRoute(true);
              }}
              style={{ color: 'var(--text-muted)', textDecoration: 'none', opacity: 0.6, fontSize: '11px' }}
              title="Admin & PM Portal"
            >
              Admin
            </a>
          </div>
        </div>
      </footer>

      {/* CORE MODALS */}
      {showSellerModal && (
        <SellerOffersModal
          currentSociety={currentSociety}
          userTower={userTower}
          offers={mySellerOffers}
          myItems={myItems}
          onClose={() => setShowSellerModal(false)}
          onAcceptOffer={handleAcceptSellerOffer}
          onCounterOffer={handleCounterSellerOffer}
          onDeclineOffer={handleDeclineSellerOffer}
          onMarkItemSold={handleMarkItemSold}
          onMarkdownItem={handleMarkdownItem}
          onDeleteItem={handleDeleteItem}
        />
      )}

      {activeOfferItem && (
        <MolBhavModal
          item={activeOfferItem}
          userTower={userTower}
          userProfile={userProfile}
          onUpdateUserProfile={(up) => setUserProfile(up)}
          onClose={() => setActiveOfferItem(null)}
          onItemUpdated={handleItemUpdated}
        />
      )}

      {activeDetailItem && (
        <ItemDetailModal
          item={activeDetailItem}
          userTower={userTower}
          userProfile={userProfile}
          comments={comments}
          onAddComment={handleAddComment}
          onClose={() => setActiveDetailItem(null)}
          onDeleteItem={handleDeleteItem}
          onUpdateItemStatus={handleUpdateItemStatus}
          onMarkdownItem={handleMarkdownItem}
          onRenewItem={handleRenewItem}
          onOpenOfferModal={(it) => {
            requireAuth(() => {
              setActiveDetailItem(null);
              setActiveOfferItem(it);
            }, `Sign in to make offers on ${it.title}`);
          }}
          onOpenSellerOffers={() => {
            setActiveDetailItem(null);
            setShowSellerModal(true);
          }}
        />
      )}

      {showListItemModal && (
        <ListItemModal
          currentSociety={currentSociety}
          userTower={userTower}
          userProfile={userProfile}
          onUpdateUserProfile={(up) => setUserProfile(up)}
          onClose={() => setShowListItemModal(false)}
          onItemAdded={handleItemAdded}
        />
      )}


      {showWishlistModal && (
        <WishlistModal
          savedItems={savedItems}
          userTower={userTower}
          onClose={() => setShowWishlistModal(false)}
          onToggleSave={handleToggleSave}
          onOpenOfferModal={(it) => {
            setShowWishlistModal(false);
            requireAuth(() => setActiveOfferItem(it), `Sign in with Google to make an offer on ${it.title}`);
          }}
          onViewDetails={(it) => {
            setShowWishlistModal(false);
            setActiveDetailItem(it);
          }}
        />
      )}

      {showSocietyModal && (
        <SocietyModal
          currentSociety={currentSociety}
          societies={societies}
          onClose={() => setShowSocietyModal(false)}
          onSelectSociety={handleSelectSociety}
          onRequestSociety={handleRequestSociety}
        />
      )}

      {showProfileModal && (
        <ProfileModal
          userProfile={userProfile}
          myItemsCount={myItems.length}
          savedCount={savedIds.size}
          onClose={() => setShowProfileModal(false)}
          onOpenEditProfile={() => {
            setShowProfileModal(false);
            setShowOnboardingModal(true);
          }}
          onOpenMyListings={() => {
            setShowProfileModal(false);
            setSelectedTowerFilter(userTower);
          }}
          onOpenSaved={() => {
            setShowProfileModal(false);
            setShowWishlistModal(true);
          }}
          onOpenGoogleLogin={() => {
            setShowProfileModal(false);
            setAuthPromptReason('Sign in with Google to manage your verified resident account');
            setShowGoogleModal(true);
          }}
          onSignOut={handleSignOut}
        />
      )}

      {showOnboardingModal && (
        <OnboardingModal
          currentSociety={currentSociety}
          societies={societies}
          userProfile={userProfile}
          onClose={() => setShowOnboardingModal(false)}
          onSaveProfile={handleSaveProfile}
          onSelectSociety={handleSelectSociety}
        />
      )}

      {showGoogleModal && (
        <GoogleOAuthModal
          currentSociety={currentSociety}
          societies={societies}
          userProfile={userProfile}
          promptReason={authPromptReason}
          onClose={() => {
            setShowGoogleModal(false);
            setPendingAction(null);
          }}
          onLoginSuccess={handleGoogleLoginSuccess}
        />
      )}

      {/* 1-Tap Magic Action: Mark as Sold Confirmation Modal */}
      {markSoldModalItem && (
        <div
          className="modal-overlay"
          onClick={() => {
            setMarkSoldModalItem(null);
            window.history.replaceState({}, document.title, window.location.pathname);
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '400px',
              padding: '24px',
              textAlign: 'center',
              borderRadius: '16px'
            }}
          >
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <CheckCircle2 size={26} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              Mark as Sold?
            </h3>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: '0 0 16px' }}>
              Did you complete the sale for <strong>"{markSoldModalItem.title}"</strong>?
              <br />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Closing this listing stops other neighbors from messaging you.
              </span>
            </p>

            {/* Item preview card */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-hairline)',
              borderRadius: '10px',
              textAlign: 'left',
              marginBottom: '18px'
            }}>
              {markSoldModalItem.images[0] && (
                <img
                  src={markSoldModalItem.images[0]}
                  alt={markSoldModalItem.title}
                  style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {markSoldModalItem.title}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  ₹{markSoldModalItem.price.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  handleMarkItemSold(markSoldModalItem.id);
                  setMarkSoldModalItem(null);
                  setMarkSoldSuccessMessage(`✓ "${markSoldModalItem.title}" marked as Sold! Listing closed.`);
                  window.history.replaceState({}, document.title, window.location.pathname);
                }}
                style={{
                  flex: 1,
                  padding: '11px',
                  borderRadius: 'var(--radius-xs)',
                  background: '#059669',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                ✓ Yes, Mark as Sold
              </button>

              <button
                onClick={() => {
                  setMarkSoldModalItem(null);
                  window.history.replaceState({}, document.title, window.location.pathname);
                }}
                style={{
                  padding: '11px 16px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-subtle)',
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: 500,
                  border: '1px solid var(--border-hairline)',
                  cursor: 'pointer'
                }}
              >
                Keep Active
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Status Notification Toast */}
      {markSoldSuccessMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#0F172A',
          color: '#FFFFFF',
          padding: '10px 18px',
          borderRadius: '999px',
          fontSize: '12.5px',
          fontWeight: 500,
          boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>{markSoldSuccessMessage}</span>
          <button
            onClick={() => setMarkSoldSuccessMessage(null)}
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, display: 'flex' }}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
