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

// Purge legacy mock demo data from localStorage if present
if (typeof window !== 'undefined') {
  try {
    const existing = localStorage.getItem('bhangar_items');
    if (existing && (existing.includes('item-1') || existing.includes('Green Soul') || existing.includes('Coway'))) {
      localStorage.removeItem('bhangar_items');
      localStorage.removeItem('bhangar_saved_ids');
      localStorage.removeItem('bhangar_seller_offers');
      localStorage.removeItem('bhangar_comments');
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
  const [userProfile, setUserProfile] = useState<UserProfile>(() => 
    loadStorage('bhangar_user_profile', INITIAL_USER_PROFILE)
  );
  const [userTower, setUserTower] = useState<string>(() => 
    loadStorage('bhangar_tower', INITIAL_USER_PROFILE.tower || 'Tower 4')
  );
  const [items, setItems] = useState<ThriftItem[]>(() => 
    loadStorage('bhangar_items', INITIAL_THRIFT_ITEMS)
  );
  const [comments, setComments] = useState<ItemComment[]>(() => 
    loadStorage('bhangar_comments', INITIAL_COMMENTS)
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTowerFilter, setSelectedTowerFilter] = useState<string>('all');
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
  useEffect(() => saveStorage('bhangar_user_profile', userProfile), [userProfile]);
  useEffect(() => saveStorage('bhangar_tower', userTower), [userTower]);
  useEffect(() => saveStorage('bhangar_items', items), [items]);
  useEffect(() => saveStorage('bhangar_comments', comments), [comments]);
  useEffect(() => saveStorage('bhangar_saved_ids', Array.from(savedIds)), [savedIds]);
  useEffect(() => saveStorage('bhangar_seller_offers', sellerOffers), [sellerOffers]);

  // Initial fetch from backend if connected + Realtime subscriptions
  useEffect(() => {
    fetchItemsFromDB(currentSociety.id).then((fetched) => {
      if (fetched) setItems(fetched);
    });
    fetchOffersFromDB().then((offers) => {
      if (offers) setSellerOffers(offers);
    });

    const unsubscribe = subscribeToRealtimeChanges(
      () => {
        fetchItemsFromDB(currentSociety.id).then((refetched) => {
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
  }, [currentSociety.id]);

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

      setUserProfile((prev) => ({
        ...prev,
        name: fullName,
        email: user.email || prev.email,
        authProvider: 'google',
        googleAvatar: avatar,
        isLoggedIn: true,
        tower: prev.tower || currentSociety.towers[0] || 'Tower 4',
        societyId: currentSociety.id,
        societyName: currentSociety.name,
        isVerified: true,
      }));

      setUserTower((prev) => prev || currentSociety.towers[0] || 'Tower 4');
      setShowGoogleModal(false);

      if (pendingAction) {
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
  }, [currentSociety.id, currentSociety.name, currentSociety.towers, pendingAction]);


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

  // Filtering logic
  const filteredItems = items.filter((item) => {
    // Saved filter
    if (showOnlySaved && !savedIds.has(item.id)) return false;

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchTag = item.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTag) return false;
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

    // Adapt items to reflect the selected society and towers smoothly
    setItems((prev) =>
      prev.map((it, idx) => ({
        ...it,
        seller: {
          ...it.seller,
          society: soc.name,
          city: soc.city,
          tower: soc.towers[idx % soc.towers.length] || soc.towers[0]
        },
        locationNote: `${soc.towers[idx % soc.towers.length] || soc.towers[0]} · Handover lobby`
      }))
    );
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
    setSearchQuery('');
    setSelectedTowerFilter('all');
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
    setUserProfile((prev) => ({
      ...prev,
      isLoggedIn: false,
      email: '',
      name: 'Guest Resident',
      googleAvatar: undefined
    }));
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
      />

      {/* Main Masonry Area */}
      <main style={{
        width: '100%',
        maxWidth: '1360px',
        margin: '0 auto',
        padding: '0 24px 60px',
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
          paddingTop: '4px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>{filteredItems.length}</span>
            <span>items in</span>
            <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{currentSociety.name.split('(')[0].trim()}</span>
            {selectedTowerFilter !== 'all' && <span>· {selectedTowerFilter}</span>}
            {showOnlySaved && <span>· Saved only</span>}
          </div>
          {(selectedCategory !== 'all' || selectedTowerFilter !== 'all' || searchQuery || showOnlySaved) && (
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
        padding: '14px 24px',
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
          gap: '8px',
        }}>
          <span>
            <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Bhangar.Space</strong>
            <span style={{ margin: '0 6px', color: 'var(--border-subtle)' }}>·</span>
            <span style={{ color: 'var(--text-muted)' }}>Tenant moving liquidation &amp; cheap finds. No BS.</span>
          </span>
          <button
            onClick={() => setShowSocietyModal(true)}
            style={{
              background: 'none', border: 'none',
              color: 'var(--text-muted)',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
              fontSize: '11.5px',
              cursor: 'pointer', padding: 0,
            }}
          >
            + Add your society
          </button>
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
            }, `Sign in with Google to make offers on ${it.title}`);
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
          userProfile={userProfile}
          onClose={() => setShowOnboardingModal(false)}
          onSaveProfile={handleSaveProfile}
          onSelectSociety={handleSelectSociety}
        />
      )}

      {showGoogleModal && (
        <GoogleOAuthModal
          currentSociety={currentSociety}
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
