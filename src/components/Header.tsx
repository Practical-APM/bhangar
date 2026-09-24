import React, { useState, useEffect } from 'react';
import { ChevronDown, Plus, Heart, Building2, Menu, X, Tag, User, LogIn, CheckCircle2, MapPin } from 'lucide-react';
import { SocietyInfo, METRO_SOCIETIES, UserProfile } from '../data/mockData';

interface HeaderProps {
  currentSociety: SocietyInfo;
  societies?: SocietyInfo[];
  onSelectSociety: (society: SocietyInfo) => void;
  userTower: string;
  onChangeUserTower: (tower: string) => void;
  onOpenListItem: () => void;
  pendingOffersCount: number;
  onOpenSellerOffers: () => void;
  userProfile: UserProfile;
  onOpenProfile: () => void;
  onOpenOnboarding: () => void;
  onOpenGoogleLogin?: () => void;
  savedWishlistCount?: number;
  onOpenWishlist?: () => void;
  onOpenSocietyModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSociety,
  societies = METRO_SOCIETIES,
  onSelectSociety,
  userTower,
  onChangeUserTower,
  onOpenListItem,
  pendingOffersCount,
  onOpenSellerOffers,
  userProfile,
  onOpenProfile,
  onOpenOnboarding,
  onOpenGoogleLogin,
  savedWishlistCount = 0,
  onOpenWishlist,
  onOpenSocietyModal
}) => {
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [towerInput, setTowerInput] = useState(userTower || '');

  useEffect(() => {
    setTowerInput(userTower || '');
  }, [userTower]);

  const hasActivity = pendingOffersCount > 0 || savedWishlistCount > 0;

  return (
    <header style={{
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-hairline)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%'
    }}>
      <div className="header-inner">
        {/* Brand & Community Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flexShrink: 1 }}>
          {/* Bhangar Brand Logo */}
          <div 
            className="logo-container"
            title="Bhangar.Space — Hyperlocal Resident Marketplace"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img 
              src="/new_bhangar_logo.png" 
              alt="Bhangar" 
              className="brand-logo-img"
              style={{
                height: '32px',
                width: 'auto',
                display: 'block',
                objectFit: 'contain',
                userSelect: 'none',
                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.08))',
                transition: 'transform 0.2s ease',
              }}
            />
          </div>

          {/* Location / Society Trigger */}
          <div style={{ position: 'relative', minWidth: 0, flexShrink: 1 }}>
            {/* Display society name cleanly without artificial string clipping */}
            {(() => {
              const rawName = currentSociety.name.split('(')[0].trim();
              const towerShort = userTower.replace('Tower ', 'T');
              return (
                <button
                  className="society-trigger-btn"
                  onClick={() => {
                    setShowLocationMenu(!showLocationMenu);
                    setShowMobileMenu(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    borderRadius: 'var(--radius-full)',
                    background: showLocationMenu ? '#F0FDF4' : 'var(--bg-subtle)',
                    border: showLocationMenu ? '1px solid #A7F3D0' : '1px solid var(--border-hairline)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <MapPin size={13} color="#059669" strokeWidth={2.2} style={{ flexShrink: 0 }} />
                  <span className="society-trigger-label" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {rawName}
                    <span className="hide-on-mobile" style={{ color: 'var(--text-muted)', fontWeight: 500, marginLeft: '3px' }}>
                      · {towerShort}
                    </span>
                  </span>
                  <ChevronDown
                    size={12}
                    color="var(--text-muted)"
                    style={{ transform: showLocationMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}
                  />
                </button>
              );
            })()}


            {showLocationMenu && (
              <>
                <div
                  onClick={() => setShowLocationMenu(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 150 }}
                />
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  width: '320px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-hairline)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-menu)',
                  padding: '14px',
                  zIndex: 200,
                }}
                  className="panel-reveal"
                >
                  {/* Society list */}
                  <div style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                    Society Hub
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '160px', overflowY: 'auto', marginBottom: '10px' }}>
                    {societies.map((soc) => (
                      <button
                        key={soc.id}
                        onClick={() => {
                          onSelectSociety(soc);
                          setShowLocationMenu(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          borderRadius: 'var(--radius-sm)',
                          background: soc.id === currentSociety.id ? '#F0FDF4' : 'transparent',
                          border: soc.id === currentSociety.id ? '1px solid #A7F3D0' : '1px solid transparent',
                          color: 'var(--text-primary)',
                          textAlign: 'left',
                          fontSize: '12.5px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          {soc.id === currentSociety.id && <MapPin size={11} color="#059669" />}
                          {soc.id !== currentSociety.id && <MapPin size={11} color="var(--text-muted)" />}
                          <span style={{ fontWeight: soc.id === currentSociety.id ? 600 : 400 }}>{soc.name.split('(')[0].trim()}</span>
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{soc.city}</span>
                      </button>
                    ))}
                  </div>

                  {/* Tower Input */}
                  <div style={{ borderTop: '1px solid var(--border-hairline)', paddingTop: '10px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                      Your Tower / Wing
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (towerInput.trim()) {
                          onChangeUserTower(towerInput.trim());
                          setShowLocationMenu(false);
                        }
                      }}
                      style={{ display: 'flex', gap: '6px' }}
                    >
                      <input
                        type="text"
                        placeholder="e.g. Tower 4, Wing B"
                        value={towerInput}
                        onChange={(e) => setTowerInput(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          fontSize: '12.5px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-subtle)',
                          outline: 'none',
                          background: '#FFFFFF',
                          color: 'var(--text-primary)',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="submit"
                        disabled={!towerInput.trim() || towerInput.trim() === userTower}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: (!towerInput.trim() || towerInput.trim() === userTower) ? 'var(--bg-subtle)' : 'var(--text-primary)',
                          color: (!towerInput.trim() || towerInput.trim() === userTower) ? 'var(--text-muted)' : '#FFFFFF',
                          fontSize: '12px',
                          fontWeight: 600,
                          border: 'none',
                          cursor: (!towerInput.trim() || towerInput.trim() === userTower) ? 'default' : 'pointer',
                          transition: 'all 0.15s ease',
                          flexShrink: 0
                        }}
                      >
                        Save
                      </button>
                    </form>
                  </div>

                  {/* Add society CTA */}
                  {onOpenSocietyModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowLocationMenu(false);
                        onOpenSocietyModal();
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px dashed var(--border-subtle)',
                        background: 'transparent',
                        color: 'var(--text-secondary)',
                        fontSize: '12px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <Building2 size={12} />
                      <span>Browse all societies or add yours</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 1. DESKTOP NAVIGATION (>= 768px) */}
        <div className="desktop-nav">
          {userProfile.isLoggedIn ? (
            /* Logged-in Resident Profile Badge Button */
            <button
              onClick={onOpenProfile}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 11px',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-hairline)',
                fontSize: '12px',
                color: 'var(--text-primary)',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
              title="View resident profile & account settings"
            >
              {userProfile.customAvatar || userProfile.googleAvatar ? (
                <img
                  src={userProfile.customAvatar || userProfile.googleAvatar}
                  alt={userProfile.name}
                  style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#059669',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  ✓
                </div>
              )}
              <span>{userProfile.username ? `@${userProfile.username}` : (userProfile.name ? userProfile.name.split(' ')[0] : 'Resident')}</span>
              {userTower && (
                <span className="hide-on-mobile" style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 500 }}>
                  · {userTower.replace('Tower ', 'T')}{userProfile.flatNumber ? `-${userProfile.flatNumber}` : ''}
                </span>
              )}
            </button>
          ) : (
            /* Dedicated High-Visibility Log In Button */
            <button
              onClick={onOpenGoogleLogin}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '6px 13px',
                borderRadius: 'var(--radius-xs)',
                background: '#FFFFFF',
                border: '1.5px solid var(--border-subtle)',
                fontSize: '12.5px',
                color: 'var(--text-primary)',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--text-primary)';
                e.currentTarget.style.background = '#F8F9FA';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.background = '#FFFFFF';
              }}
              title="Sign in with Google to explore & trade"
            >
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Log In</span>
            </button>
          )}


          {onOpenWishlist && (
            <button
              onClick={onOpenWishlist}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-hairline)',
                background: 'var(--bg-subtle)',
                color: 'var(--text-primary)',
                fontSize: '11.5px',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
              title="Open saved wishlist"
            >
              <Heart size={12} color={savedWishlistCount > 0 ? '#DC2626' : 'var(--text-muted)'} fill={savedWishlistCount > 0 ? '#DC2626' : 'none'} />
              <span>Wishlist</span>
              {savedWishlistCount > 0 && (
                <span style={{
                  background: 'var(--text-primary)',
                  color: '#FFFFFF',
                  fontSize: '9.5px',
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: 'var(--radius-full)'
                }}>
                  {savedWishlistCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={onOpenSellerOffers}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 10px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-hairline)',
              background: 'var(--bg-subtle)',
              color: 'var(--text-primary)',
              fontSize: '11.5px',
              fontWeight: 500,
              whiteSpace: 'nowrap'
            }}
          >
            <span>Offers</span>
            {pendingOffersCount > 0 && (
              <span style={{
                background: '#DC2626',
                color: '#FFFFFF',
                fontSize: '9.5px',
                fontWeight: 700,
                padding: '1px 5px',
                borderRadius: 'var(--radius-full)'
              }}>
                {pendingOffersCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenListItem}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '7px 12px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--text-primary)',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 500,
              whiteSpace: 'nowrap'
            }}
          >
            <Plus size={13} />
            <span>List an Item</span>
          </button>
        </div>

        {/* 2. MOBILE NAVIGATION (< 768px): COMPACT & UNCLUTTERED */}
        <div className="mobile-nav">
          {/* Direct Mobile Sign In / Profile Button */}
          {!userProfile.isLoggedIn ? (
            <button
              onClick={onOpenGoogleLogin}
              className="mobile-login-btn"
              title="Log In"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Log In</span>
            </button>
          ) : (
            <button
              onClick={onOpenProfile}
              className="mobile-profile-btn"
              title="Resident profile"
            >
              {userProfile.customAvatar || userProfile.googleAvatar ? (
                <img
                  src={userProfile.customAvatar || userProfile.googleAvatar}
                  alt={userProfile.name}
                  style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
              ) : (
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#059669',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  ✓
                </div>
              )}
              <span className="hide-on-mobile" style={{ marginLeft: '2px' }}>{userProfile.username ? `@${userProfile.username}` : (userProfile.name ? userProfile.name.split(' ')[0] : 'Resident')}</span>
            </button>
          )}

          {/* Quick List Button */}
          <button
            onClick={onOpenListItem}
            className="mobile-list-btn"
            title="List an item"
          >
            <Plus size={13} strokeWidth={2.5} style={{ flexShrink: 0 }} />
            <span className="mobile-list-text">List</span>
          </button>

          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={() => {
              setShowMobileMenu(!showMobileMenu);
              setShowLocationMenu(false);
            }}
            className="mobile-menu-btn"
            aria-label="Toggle navigation menu"
          >
            {showMobileMenu ? <X size={17} /> : <Menu size={17} />}

            {/* Notification indicator on hamburger */}
            {hasActivity && !showMobileMenu && (
              <span style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#DC2626'
              }} />
            )}
          </button>
        </div>
      </div>

      {/* MOBILE SLIDE-DOWN DRAWER */}
      {showMobileMenu && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowMobileMenu(false)}
            style={{
              position: 'fixed',
              inset: 0,
              top: '56px',
              background: 'rgba(0,0,0,0.3)',
              backdropFilter: 'blur(2px)',
              zIndex: 140
            }}
          />

          {/* Drawer Content */}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-hairline)',
            boxShadow: 'var(--shadow-overlay)',
            zIndex: 150,
            padding: '16px',
            animation: 'slideDownDrawer 0.18s ease-out'
          }}>
            {/* User Profile / Sign In Card */}
            {userProfile.isLoggedIn ? (
              <div
                onClick={() => {
                  setShowMobileMenu(false);
                  onOpenProfile();
                }}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-hairline)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {userProfile.customAvatar || userProfile.googleAvatar ? (
                    <img
                      src={userProfile.customAvatar || userProfile.googleAvatar}
                      alt={userProfile.name}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#166534',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      ✓
                    </div>
                  )}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {userProfile.name || userProfile.username}
                      </span>
                      <span style={{
                        fontSize: '9.5px',
                        padding: '1px 5px',
                        borderRadius: 'var(--radius-full)',
                        background: '#DCFCE7',
                        color: '#15803D',
                        fontWeight: 600
                      }}>
                        Verified
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {userTower}{userProfile.flatNumber ? ` · Flat ${userProfile.flatNumber}` : ''}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textDecoration: 'underline' }}>
                  Profile
                </span>
              </div>
            ) : (
              <div style={{ marginBottom: '12px' }}>
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    if (onOpenGoogleLogin) onOpenGoogleLogin();
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-xs)',
                    background: '#FFFFFF',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </div>
            )}

            {/* Menu Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
              {/* Wishlist Link */}
              {onOpenWishlist && (
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    onOpenWishlist();
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--border-hairline)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12.5px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Heart size={14} color={savedWishlistCount > 0 ? '#DC2626' : 'var(--text-muted)'} fill={savedWishlistCount > 0 ? '#DC2626' : 'none'} />
                    <span>Saved Wishlist</span>
                  </div>
                  {savedWishlistCount > 0 && (
                    <span style={{
                      background: 'var(--text-primary)',
                      color: '#FFFFFF',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-full)'
                    }}>
                      {savedWishlistCount} items
                    </span>
                  )}
                </button>
              )}

              {/* Offers Inbox Link */}
              <button
                onClick={() => {
                  setShowMobileMenu(false);
                  onOpenSellerOffers();
                }}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-hairline)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12.5px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Tag size={14} color="var(--text-muted)" />
                  <span>Offers & Negotiation Inbox</span>
                </div>
                {pendingOffersCount > 0 && (
                  <span style={{
                    background: '#DC2626',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)'
                  }}>
                    {pendingOffersCount} new
                  </span>
                )}
              </button>

              {/* Society Hub Link */}
              {onOpenSocietyModal && (
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    onOpenSocietyModal();
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--border-hairline)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12.5px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building2 size={14} color="var(--text-muted)" />
                    <span>Society Directory & + Add Hub</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {currentSociety.name.split('(')[0].trim()}
                  </span>
                </button>
              )}
            </div>

            {/* Quick Tower Input */}
            <div style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-hairline)',
              marginBottom: '14px'
            }}>
              <div style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Your Tower / Wing {currentSociety?.name ? `in ${currentSociety.name.split('(')[0].trim()}` : ''}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (towerInput.trim()) {
                    onChangeUserTower(towerInput.trim());
                    setShowMobileMenu(false);
                  }
                }}
                style={{ display: 'flex', gap: '6px' }}
              >
                <input
                  type="text"
                  placeholder="e.g. Tower 4, Wing B"
                  value={towerInput}
                  onChange={(e) => setTowerInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    outline: 'none',
                    background: '#FFFFFF',
                    color: 'var(--text-primary)',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="submit"
                  disabled={!towerInput.trim() || towerInput.trim() === userTower}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: (!towerInput.trim() || towerInput.trim() === userTower) ? 'var(--border-subtle)' : 'var(--text-primary)',
                    color: (!towerInput.trim() || towerInput.trim() === userTower) ? 'var(--text-muted)' : '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: (!towerInput.trim() || towerInput.trim() === userTower) ? 'default' : 'pointer',
                    flexShrink: 0
                  }}
                >
                  Save
                </button>
              </form>
            </div>

            {/* List an Item Full-Width CTA */}
            <button
              onClick={() => {
                setShowMobileMenu(false);
                onOpenListItem();
              }}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--text-primary)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Plus size={15} />
              <span>+ List an Item in {userTower}</span>
            </button>
          </div>
        </>
      )}
    </header>
  );
};
