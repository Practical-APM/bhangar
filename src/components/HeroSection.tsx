import React, { useState, useEffect } from 'react';
import { Search, Heart, ChevronRight, Sparkles, Share2 } from 'lucide-react';
import { SocietyInfo, ThriftItem } from '../data/mockData';

interface HeroSectionProps {
  currentSociety?: SocietyInfo;
  items?: ThriftItem[];
  onOpenListItem?: () => void;
  onViewDetails?: (item: ThriftItem) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTowerFilter: string;
  onSelectTowerFilter: (tower: string) => void;
  userTower: string;
  savedCount: number;
  showOnlySaved: boolean;
  onToggleShowOnlySaved: () => void;
  selectedScopeFilter?: 'all' | 'my_society';
  onSelectScopeFilter?: (scope: 'all' | 'my_society') => void;
  selectedCityFilter?: string;
  onSelectCityFilter?: (city: string) => void;
  availableCities?: string[];
  totalAllItemsCount?: number;
  mySocietyItemsCount?: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentSociety,
  items = [],
  onOpenListItem,
  onViewDetails,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  selectedTowerFilter,
  onSelectTowerFilter,
  userTower,
  savedCount,
  showOnlySaved,
  onToggleShowOnlySaved,
  selectedScopeFilter = 'all',
  onSelectScopeFilter,
  selectedCityFilter = 'all',
  onSelectCityFilter,
  availableCities = [],
  totalAllItemsCount,
  mySocietyItemsCount
}) => {
  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'wanted', label: '🔍 Wanted by Neighbors' },
    { id: 'wfh', label: 'Electronics & WFH' },
    { id: 'furniture', label: 'Furniture' },
    { id: 'appliances', label: 'Appliances' },
    { id: 'living', label: 'Home Decor & Plants' },
    { id: 'moving_out', label: 'Moving Out Sale' },
    { id: 'fixer', label: 'Needs Repair' }
  ];

  // Rotating highlight items
  const rotatingPhrases = [
    'study chairs & desks',
    'air purifiers & filters',
    'monitors & WFH setups',
    'microwaves & appliances',
    'sofas & coffee tables',
    'balcony plants & planters'
  ];

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setPhraseIndex((prev) => (prev + 1) % rotatingPhrases.length);
        setFade(true);
      }, 250);
    }, 3200);
    return () => clearInterval(timer);
  }, [rotatingPhrases.length]);

  // Featured and secondary cards from current items
  const featuredItem = items.length > 0 ? items[0] : null;
  const secondaryItem = items.length > 1 ? items[1] : null;

  const societyNameClean = currentSociety ? currentSociety.name.split('(')[0].trim() : 'Your Society';

  const handleShareDigest = () => {
    const currentSocietyName = currentSociety ? currentSociety.name.split('(')[0].trim() : 'our society';
    const societyItems = items.filter(it => !it.isExpired && it.status !== 'sold');
    const forSale = societyItems.filter(it => !it.isWanted).slice(0, 4);
    const wanted = societyItems.filter(it => it.isWanted).slice(0, 2);

    let text = `🏡 *What's happening in ${currentSocietyName} on Bhangar.Space:*\n\n`;
    if (forSale.length > 0) {
      text += `📦 *Available for Elevator Pickup:*\n`;
      forSale.forEach(it => {
        text += `• ${it.title} - ₹${it.price.toLocaleString('en-IN')} (${it.seller?.tower || 'Tower'})\n`;
      });
      text += `\n`;
    }
    if (wanted.length > 0) {
      text += `🔍 *Neighbors are Looking For:*\n`;
      wanted.forEach(it => {
        text += `• ${it.title} (${it.seller?.tower || 'Tower'})\n`;
      });
      text += `\n`;
    }
    text += `👉 Browse listings & post directly (free):\nhttps://bhangar.space`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section style={{
      width: '100%',
      maxWidth: '1360px',
      margin: '0 auto',
      padding: 'clamp(12px, 2vw, 16px) clamp(14px, 3vw, 24px) clamp(10px, 1.5vw, 14px)',
      boxSizing: 'border-box',
    }}>
      {/* Hero Showcase */}
      <div 
        className="hero-card-container"
        style={{
          background: 'linear-gradient(150deg, #FFFFFF 0%, #FAFAF8 40%, #F5F2EC 100%)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          borderRadius: '28px',
          marginBottom: '24px',
          boxShadow: '0 12px 40px -8px rgba(28, 25, 23, 0.08), 0 1px 3px rgba(0, 0, 0, 0.03)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Soft atmospheric ambient glow */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-40px',
          width: '380px',
          height: '380px',
          background: 'radial-gradient(circle, rgba(235, 222, 203, 0.5) 0%, rgba(250, 247, 242, 0) 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div className="hero-grid" style={{ position: 'relative', zIndex: 1 }}>
          {/* LEFT COLUMN */}
          <div>
            {/* Eyebrow */}
            <div className="hero-text-animate" style={{
              fontSize: '12px',
              fontWeight: 500,
              letterSpacing: '0.01em',
              color: 'var(--text-muted)',
              marginBottom: '10px',
            }}>
              {societyNameClean} · Residential Marketplace
            </div>

            {/* Headline */}
            <h1 className="hero-sub-animate hero-main-heading" style={{
              fontSize: 'clamp(28px, 4.2vw, 38px)',
              fontWeight: 700,
              letterSpacing: '-0.035em',
              color: 'var(--text-primary)',
              lineHeight: 1.15,
              margin: '0 0 12px 0',
            }}>
              One neighbor’s clutter,<br />
              another neighbor’s find.
            </h1>

            {/* Rotating highlight text */}
            <div className="hero-body-animate" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '14px',
              fontSize: '14.5px',
              color: 'var(--text-secondary)',
              flexWrap: 'wrap',
            }}>
              <span>Find pre-owned</span>
              <span style={{
                fontWeight: 600,
                color: 'var(--text-primary)',
                opacity: fade ? 1 : 0,
                transform: fade ? 'translateY(0)' : 'translateY(3px)',
                transition: 'all 0.22s var(--ease-out-expo)',
              }}>
                {rotatingPhrases[phraseIndex]}
              </span>
            </div>

            <p className="hero-body-animate" style={{
              fontSize: '13.5px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: '0 0 22px 0',
              maxWidth: '520px',
            }}>
              Buy and sell pre-owned furniture, appliances, and home essentials directly with your neighbors. Quick handovers within your society, with no packing or shipping required.
            </p>

            {/* CTA Buttons */}
            <div className="hero-cta-animate" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {onOpenListItem && (
                <button
                  type="button"
                  onClick={onOpenListItem}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    background: 'var(--text-primary)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '7px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <span>Sell an item</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onSelectCategory('all')}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  background: '#FFFFFF',
                  color: 'var(--text-primary)',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  border: '1px solid rgba(0,0,0,0.1)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
              >
                <span>Browse listings</span>
                <ChevronRight size={13} />
              </button>

              <button
                type="button"
                onClick={handleShareDigest}
                title="Share this week's society listings directly to your society WhatsApp group"
                style={{
                  padding: '10px 16px',
                  borderRadius: '10px',
                  background: '#ECFDF5',
                  color: '#065F46',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid #A7F3D0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#D1FAE5'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#ECFDF5'}
              >
                <Share2 size={13} color="#059669" />
                <span>Share Digest</span>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Floating Product Cards */}
          <div style={{ position: 'relative' }}>
            {/* Cards stack — uses normal flow on mobile, absolute on desktop */}
            <div style={{
              position: 'relative',
              minHeight: '200px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              {/* Primary Card */}
              {featuredItem ? (
                <div
                  className="hero-floating-card-1"
                  onClick={() => onViewDetails && onViewDetails(featuredItem)}
                  style={{
                    width: '100%',
                    background: '#FFFFFF',
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    borderRadius: '20px',
                    padding: '14px',
                    boxShadow: '0 16px 36px -8px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0,0,0,0.02)',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '14px',
                    alignItems: 'center',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                >
                  <div style={{
                    width: '72px', height: '72px',
                    borderRadius: '14px', overflow: 'hidden',
                    background: '#F3F4F6', flexShrink: 0,
                  }}>
                    <img
                      src={featuredItem.images[0]}
                      alt={featuredItem.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '10px', padding: '2px 7px',
                        borderRadius: '6px',
                        background: '#ECFDF5', color: '#065F46', fontWeight: 600,
                      }}>
                        Nearby · {featuredItem.seller.tower}
                      </span>
                      <span style={{
                        fontSize: '10px', padding: '2px 7px',
                        borderRadius: '6px',
                        background: '#FEF3C7', color: '#92400E', fontWeight: 600,
                      }}>
                        Save ₹{(featuredItem.originalPrice - featuredItem.price).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div style={{
                      fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      marginBottom: '4px',
                    }}>
                      {featuredItem.title}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        ₹{featuredItem.price.toLocaleString('en-IN')}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                        ₹{featuredItem.originalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={onOpenListItem}
                  style={{
                    width: '100%',
                    background: '#FFFFFF',
                    border: '1.5px dashed var(--border-subtle)',
                    borderRadius: '20px',
                    padding: '24px 20px',
                    boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.04)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: '12px',
                    boxSizing: 'border-box',
                    transition: 'all 0.18s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--text-primary)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: '44px', height: '44px',
                    borderRadius: '12px',
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#15803D'
                  }}>
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.015em' }}>
                      Spotlight open in {societyNameClean}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '280px', lineHeight: 1.45 }}>
                      Be the first to list! Moving out or clearing space? Post your items in under 2 minutes.
                    </div>
                  </div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    background: 'var(--text-primary)',
                    padding: '7px 16px',
                    borderRadius: 'var(--radius-full)',
                  }}>
                    + Post First Listing
                  </span>
                </div>
              )}

              {/* Secondary Card */}
              {secondaryItem && (
                <div
                  className="hero-floating-card-2"
                  onClick={() => onViewDetails && onViewDetails(secondaryItem)}
                  style={{
                    width: '90%',
                    alignSelf: 'flex-end',
                    background: '#FFFFFF',
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    borderRadius: '20px',
                    padding: '13px 14px',
                    boxShadow: '0 12px 30px -6px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0,0,0,0.02)',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <div style={{
                    width: '60px', height: '60px',
                    borderRadius: '12px', overflow: 'hidden',
                    background: '#F3F4F6', flexShrink: 0,
                  }}>
                    <img
                      src={secondaryItem.images[0]}
                      alt={secondaryItem.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      marginBottom: '4px',
                    }}>
                      {secondaryItem.title}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        ₹{secondaryItem.price.toLocaleString('en-IN')}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                        ₹{secondaryItem.originalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Metrics row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '12px',
              padding: '0 2px',
              fontSize: '11px',
              color: 'var(--text-muted)',
              flexWrap: 'wrap',
            }}>
              <span>{currentSociety ? currentSociety.residentCount || 1400 : 1400}+ neighbors</span>
              <span style={{ color: 'var(--border-subtle)' }}>·</span>
              <span>Fast 24h moving sales</span>
              <span style={{ color: 'var(--border-subtle)' }}>·</span>
              <span>No packing or shipping</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
        flexWrap: 'wrap',
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
          <Search size={15} style={{
            position: 'absolute', left: '14px', top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Search desks, appliances, items…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 40px',
              borderRadius: '10px',
              border: '1px solid var(--border-hairline)',
              background: '#FFFFFF',
              fontSize: '13px',
              boxSizing: 'border-box',
              boxShadow: 'var(--shadow-subtle)',
              outline: 'none',
            }}
          />
        </div>

        {/* Scope Switcher: All Societies vs My Society */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: '#FFFFFF',
          border: '1px solid var(--border-hairline)',
          borderRadius: '10px',
          padding: '3px',
          boxShadow: 'var(--shadow-subtle)',
          boxSizing: 'border-box',
          flexShrink: 0
        }}>
          <button
            type="button"
            onClick={() => onSelectScopeFilter && onSelectScopeFilter('all')}
            style={{
              padding: '6px 11px',
              borderRadius: '8px',
              fontSize: '11.5px',
              fontWeight: selectedScopeFilter === 'all' ? 700 : 500,
              background: selectedScopeFilter === 'all' ? 'var(--text-primary)' : 'transparent',
              color: selectedScopeFilter === 'all' ? '#FFFFFF' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🌐 All</span>
            <span style={{
              fontSize: '10px',
              opacity: 0.85,
              background: selectedScopeFilter === 'all' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)',
              padding: '1px 5px',
              borderRadius: '999px'
            }}>
              {totalAllItemsCount ?? items.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectScopeFilter && onSelectScopeFilter('my_society')}
            style={{
              padding: '6px 11px',
              borderRadius: '8px',
              fontSize: '11.5px',
              fontWeight: selectedScopeFilter === 'my_society' ? 700 : 500,
              background: selectedScopeFilter === 'my_society' ? '#059669' : 'transparent',
              color: selectedScopeFilter === 'my_society' ? '#FFFFFF' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>📍 {currentSociety?.name.split('(')[0].trim() || 'My Hub'}</span>
            <span style={{
              fontSize: '10px',
              opacity: 0.85,
              background: selectedScopeFilter === 'my_society' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)',
              padding: '1px 5px',
              borderRadius: '999px'
            }}>
              {mySocietyItemsCount ?? items.filter(it => it.seller.society === currentSociety?.name).length}
            </span>
          </button>
        </div>

        {/* Secondary Contextual Filter: City (if All) or Tower (if My Society) */}
        {selectedScopeFilter === 'all' ? (
          availableCities.length > 0 && (
            <div style={{ position: 'relative', minWidth: '105px' }}>
              <select
                value={selectedCityFilter}
                onChange={(e) => onSelectCityFilter && onSelectCityFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 28px 9px 11px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-hairline)',
                  background: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  outline: 'none',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-subtle)',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                }}
              >
                <option value="all">All Cities</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <span style={{
                position: 'absolute', right: '11px', top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none', color: 'var(--text-muted)', fontSize: '9px',
              }}>▾</span>
            </div>
          )
        ) : (
          <div style={{ position: 'relative', minWidth: '115px' }}>
            <select
              value={selectedTowerFilter}
              onChange={(e) => onSelectTowerFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 28px 9px 11px',
                borderRadius: '10px',
                border: '1px solid var(--border-hairline)',
                background: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                outline: 'none',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-subtle)',
                appearance: 'none',
                WebkitAppearance: 'none',
              }}
            >
              <option value="all">All Towers</option>
              <option value={userTower}>My Tower ({userTower})</option>
              {currentSociety?.towers.filter(t => t !== userTower).map((tower) => (
                <option key={tower} value={tower}>{tower}</option>
              ))}
            </select>
            <span style={{
              position: 'absolute', right: '11px', top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none', color: 'var(--text-muted)', fontSize: '9px',
            }}>▾</span>
          </div>
        )}

        {/* Saved Wishlist Toggle */}
        <button
          type="button"
          onClick={onToggleShowOnlySaved}
          style={{
            padding: '9px 13px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            border: `1px solid ${showOnlySaved ? '#DC2626' : 'var(--border-hairline)'}`,
            background: showOnlySaved ? '#FEF2F2' : '#FFFFFF',
            color: showOnlySaved ? '#DC2626' : 'var(--text-secondary)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-subtle)',
            transition: 'all 0.15s ease',
          }}
        >
          <Heart size={13} fill={showOnlySaved ? '#DC2626' : 'none'} color={showOnlySaved ? '#DC2626' : 'currentColor'} />
          <span>Saved{savedCount > 0 ? ` (${savedCount})` : ''}</span>
        </button>
      </div>

      {/* Category Ribbon */}
      <div className="mood-ribbon-wrapper">
        <div className="mood-ribbon">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`category-pill${isActive ? ' active' : ''}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '7px 16px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: isActive ? 600 : 400,
                  background: isActive ? 'var(--text-primary)' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--text-primary)' : 'var(--border-hairline)',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  boxShadow: isActive ? '0 2px 6px rgba(0,0,0,0.10)' : 'var(--shadow-subtle)',
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
