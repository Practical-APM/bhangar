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
import { 
  METRO_SOCIETIES, 
  INITIAL_THRIFT_ITEMS, 
  INITIAL_SELLER_OFFERS,
  INITIAL_USER_PROFILE,
  INITIAL_COMMENTS,
  ThriftItem, 
  SellerOffer,
  SocietyInfo,
  SocietyRequest,
  UserProfile,
  ItemComment 
} from './data/mockData';
import {
  fetchItemsFromDB,
  createItemInDB,
  fetchOffersFromDB,
  updateOfferStatusInDB,
  createCommentInDB,
  subscribeToRealtimeChanges
} from './services/api';
import { supabase, isSupabaseConfigured, signOutFromSupabase } from './lib/supabase';


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
          !it.id?.startsWith('item-') && 
          !it.title?.toLowerCase().includes('markus') && 
          !it.title?.toLowerCase().includes('dell 34') &&
          !it.title?.toLowerCase().includes('green soul') &&
          !it.title?.toLowerCase().includes('coway')
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
        const cleanOffers = parsedOffers.filter((o: any) => !o.itemId?.startsWith('item-'));
        if (cleanOffers.length !== parsedOffers.length) {
          localStorage.setItem('bhangar_seller_offers', JSON.stringify(cleanOffers));
        }
      }
    }
  } catch {}
}

export function App() {
  const [societies, setSocieties] = useState<SocietyInfo[]>(() => 
    loadStorage('bhangar_societies', METRO_SOCIETIES)
  );
  const [currentSociety, setCurrentSociety] = useState<SocietyInfo>(() => 
    loadStorage('bhangar_society', METRO_SOCIETIES[0])
  );
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
    return loaded.filter((it) => 
      !it.id?.startsWith('item-') && 
      !it.title?.toLowerCase().includes('markus') && 
      !it.title?.toLowerCase().includes('dell 34')
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
      if (fetched && fetched.length > 0) setItems(fetched);
    });
    fetchOffersFromDB().then((offers) => {
      if (offers) setSellerOffers(offers);
    });

    const unsubscribe = subscribeToRealtimeChanges(
      () => {
        fetchItemsFromDB().then((refetched) => {
          if (refetched && refetched.length > 0) setItems(refetched);
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

    const syncUserFromSupabase = (user: any) => {
      const meta = user.user_metadata || {};
      const fullName = meta.full_name || meta.name || user.email?.split('@')[0] || 'Resident';
      const avatar = meta.avatar_url || meta.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`;

      const saved = loadStorage<UserProfile | null>('bhangar_user_profile', null);
      const isAlreadyOnboarded = Boolean(
        saved && 
        saved.isLoggedIn && 
        saved.email === user.email && 
        saved.isOnboarded && 
        saved.phone && 
        saved.tower
      );

      const baseProfile: UserProfile = {
        ...(saved || INITIAL_USER_PROFILE),
        name: (saved && saved.name) || fullName,
        username: (saved && saved.username) || user.email?.split('@')[0] || fullName.toLowerCase().replace(/\s+/g, '_'),
        email: user.email || (saved ? saved.email : ''),
        authProvider: 'google',
        googleAvatar: (saved && saved.googleAvatar) || avatar,
        customAvatar: saved?.customAvatar,
        isLoggedIn: true,
        isOnboarded: isAlreadyOnboarded,
        tower: (saved && saved.tower) || '',
        societyId: (saved && saved.societyId) || currentSociety.id,
        societyName: (saved && saved.societyName) || currentSociety.name,
        phone: (saved && saved.phone) || '',
        isVerified: true,
      };

      setUserProfile(baseProfile);
      if (saved?.tower) {
        setUserTower(saved.tower);
      }
      setShowGoogleModal(false);

      if (!isAlreadyOnboarded) {
        // Automatically pop up Onboarding modal to complete profile!
        setShowOnboardingModal(true);
      } else if (pendingAction) {
        const action = pendingAction;
        setPendingAction(null);
        setTimeout(() => action(), 100);
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
  }, [currentSociety.id, currentSociety.name, pendingAction]);


  const requireAuth = (action: () => void, promptReason: string) => {
    if (userProfile.isLoggedIn) {
      action();
    } else {
      setPendingAction(() => action);
      setAuthPromptReason(promptReason);
      setShowGoogleModal(true);
    }
  };

  // Items listed by the current user (matches user tower or posted by user)
  const myItems = items.filter((it) => it.seller.tower === userTower);
  const pendingOffersCount = sellerOffers.filter((o) => o.status === 'pending').length;

  // Filtering logic (Feed shows items from all societies by default, with city and society filters)
  const filteredItems = items.filter((item) => {
    // Saved filter
    if (showOnlySaved && !savedIds.has(item.id)) return false;

    // Scope / Society filter
    if (selectedScopeFilter === 'my_society') {
      if (item.seller.society !== currentSociety.name) return false;
    }

    // City filter
    if (selectedCityFilter !== 'all') {
      if (item.seller.city.toLowerCase() !== selectedCityFilter.toLowerCase()) return false;
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchTag = item.tags.some(t => t.toLowerCase().includes(q));
      const matchLoc = item.seller.society.toLowerCase().includes(q) || item.seller.city.toLowerCase().includes(q);
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
      if (item.seller.tower !== selectedTowerFilter) return false;
    }

    return true;
  });

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
      pincode: req.pincode,
      activeListingsCount: 1,
      residentCount: req.approxFlats * 3,
      isLive: true,
      towers: Array.from({ length: req.towersCount }, (_, i) => `Tower ${i + 1}`)
    };
    setSocieties((prev) => [newSoc, ...prev]);
    handleSelectSociety(newSoc);
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
    setItems((prev) => [newItem, ...prev]);
    try {
      const persisted = await createItemInDB(newItem);
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
  };

  const handleMarkdownItem = (itemId: string, newPrice: number) => {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, price: newPrice } : it))
    );
  };

  const handleSaveProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    setUserTower(updated.tower);
    const soc = societies.find((s) => s.id === updated.societyId);
    if (soc) {
      setCurrentSociety(soc);
    }
    setShowOnboardingModal(false);
    if (pendingAction) {
      const action = pendingAction;
      setPendingAction(null);
      setTimeout(() => action(), 100);
    }
  };

  const handleAddComment = (itemId: string, text: string) => {
    requireAuth(() => {
      const newCmt: ItemComment = {
        id: 'cmt-' + Date.now(),
        itemId,
        authorName: userProfile.name,
        authorTower: userTower,
        text,
        timestamp: 'Just now',
        isSeller: false
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

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-page)',
      width: '100%',
      overflowX: 'hidden'
    }}>
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
        availableCities={Array.from(new Set(items.map(it => it.seller.city).filter(Boolean)))}
        totalAllItemsCount={items.length}
        mySocietyItemsCount={items.filter(it => it.seller.society === currentSociety.name).length}
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
        {filteredItems.length > 0 ? (
          <div className="masonry-feed">
            {filteredItems.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                userTower={userTower}
                isSaved={savedIds.has(item.id)}
                onToggleSave={handleToggleSave}
                onOpenOfferModal={(it) => {
                  requireAuth(
                    () => setActiveOfferItem(it),
                    `Sign in with Google to make offers and negotiate with ${it.seller.alias} in ${it.seller.tower}`
                  );
                }}
                onViewDetails={(it) => setActiveDetailItem(it)}
              />
            ))}
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
          </div>
        </div>
      </footer>

      {/* CORE MODALS */}
      {showSellerModal && (
        <SellerOffersModal
          currentSociety={currentSociety}
          userTower={userTower}
          offers={sellerOffers}
          myItems={myItems}
          onClose={() => setShowSellerModal(false)}
          onAcceptOffer={handleAcceptSellerOffer}
          onCounterOffer={handleCounterSellerOffer}
          onDeclineOffer={handleDeclineSellerOffer}
          onMarkItemSold={handleMarkItemSold}
          onMarkdownItem={handleMarkdownItem}
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
    </div>
  );
}

export default App;
