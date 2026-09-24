import React, { useState, useRef, useMemo } from 'react';
import { X, ShieldCheck, ArrowRight, Camera, Phone, MapPin, Building, User, AtSign, Check, Navigation, Search, Loader2 } from 'lucide-react';
import { SocietyInfo, UserProfile, METRO_SOCIETIES, findNearestSociety } from '../data/mockData';

interface OnboardingModalProps {
  currentSociety: SocietyInfo;
  societies?: SocietyInfo[];
  userProfile: UserProfile;
  onClose: () => void;
  onSaveProfile: (updated: UserProfile) => void;
  onSelectSociety: (society: SocietyInfo) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  currentSociety,
  societies = METRO_SOCIETIES,
  userProfile,
  onClose,
  onSaveProfile,
  onSelectSociety
}) => {
  const [name, setName] = useState(userProfile.name || '');
  const [username, setUsername] = useState(
    userProfile.username || 
    (userProfile.email ? userProfile.email.split('@')[0] : '') ||
    (userProfile.name ? userProfile.name.toLowerCase().replace(/\s+/g, '_') : '')
  );
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [tower, setTower] = useState(userProfile.tower || '');
  const [selectedSocId, setSelectedSocId] = useState(userProfile.societyId || currentSociety.id);
  const [avatarPreview, setAvatarPreview] = useState<string>(
    userProfile.customAvatar || userProfile.googleAvatar || ''
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-detect & Type-to-search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionSuccess, setDetectionSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selected society object
  const selectedSociety = useMemo(() => {
    return societies.find((s) => s.id === selectedSocId) || currentSociety;
  }, [selectedSocId, societies, currentSociety]);

  // Filtered societies for type-to-search
  const filteredSocieties = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return societies.filter((s) => 
      s.name.toLowerCase().includes(q) ||
      (s.area && s.area.toLowerCase().includes(q)) ||
      s.city.toLowerCase().includes(q) ||
      (s.pincode && s.pincode.includes(q))
    );
  }, [searchQuery, societies]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setErrorMsg('Image size should be under 3MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatarPreview(event.target.result as string);
          setErrorMsg(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Auto-detect GPS location & pick closest society
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetecting(true);
    setErrorMsg(null);
    setDetectionSuccess(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetecting(false);
        const { latitude, longitude } = pos.coords;
        const result = findNearestSociety(latitude, longitude, societies);
        setSelectedSocId(result.society.id);
        setDetectionSuccess(`📍 Auto-detected nearest hub: ${result.society.name} (~${result.distanceKm} km away)`);
      },
      (err) => {
        setIsDetecting(false);
        setErrorMsg('Location permission denied or unavailable. Please type your locality below.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedPhone = phone.trim();
    const trimmedTower = tower.trim();
    const trimmedName = name.trim();

    if (!trimmedPhone) {
      setErrorMsg('Please enter your WhatsApp / mobile number for handover coordination.');
      return;
    }

    if (!trimmedTower) {
      setErrorMsg('Please enter your Tower or Wing name.');
      return;
    }

    const chosenSoc = selectedSociety;
    if (chosenSoc.id !== currentSociety.id) {
      onSelectSociety(chosenSoc);
    }

    const displayName = trimmedName || (username ? username : 'Resident Neighbor');
    const finalAvatar = avatarPreview || userProfile.googleAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

    const updated: UserProfile = {
      ...userProfile,
      name: displayName,
      username: username.trim().replace(/^@/, '') || displayName.toLowerCase().replace(/\s+/g, '_'),
      phone: trimmedPhone,
      tower: trimmedTower,
      societyId: chosenSoc.id,
      societyName: chosenSoc.name,
      customAvatar: avatarPreview || undefined,
      googleAvatar: userProfile.googleAvatar || finalAvatar,
      isLoggedIn: true,
      isOnboarded: true,
      isVerified: true
    };

    onSaveProfile(updated);
    onClose();
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        background: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 1000
      }}
    >
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: '460px', 
          width: '100%',
          padding: '24px 22px',
          borderRadius: '18px',
          background: '#FFFFFF',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.16)',
          border: '1px solid var(--border-hairline)',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '14px'
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Welcome, {name.split(' ')[0] || 'Neighbor'}! 👋
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px', marginBottom: 0 }}>
              Just add your locality and phone number to coordinate neighbor handovers.
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ 
              color: 'var(--text-muted)', 
              padding: '4px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: '8px',
            padding: '9px 12px',
            marginBottom: '12px',
            color: '#991B1B',
            fontSize: '12px',
            lineHeight: 1.4
          }}>
            {errorMsg}
          </div>
        )}

        {detectionSuccess && (
          <div style={{
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: '8px',
            padding: '9px 12px',
            marginBottom: '12px',
            color: '#065F46',
            fontSize: '11.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Check size={14} color="#059669" />
            <span>{detectionSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
          
          {/* Compact Profile Identity */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            background: '#F9FAFB',
            borderRadius: '10px',
            border: '1px solid var(--border-hairline)'
          }}>
            <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
              {avatarPreview ? (
                <img 
                  src={avatarPreview} 
                  alt="Profile" 
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #E5E7EB' }}
                />
              ) : (
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)'
                }}>
                  <User size={22} />
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Change photo"
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'var(--text-primary)',
                  color: '#FFFFFF',
                  border: '2px solid #FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <Camera size={10} />
              </button>
            </div>

            <div style={{ flex: 1, minWidth: 0, display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '10.5px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    background: '#FFFFFF',
                    fontSize: '12.5px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '10.5px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                  Handle
                </label>
                <input
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    background: '#FFFFFF',
                    fontSize: '12.5px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handlePhotoUpload} 
            />
          </div>

          {/* WhatsApp / Contact Phone Number (Required) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
              <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                WhatsApp / Mobile Number <span style={{ color: '#059669' }}>*</span>
              </label>
              <span style={{ fontSize: '10.5px', color: '#059669', fontWeight: 500 }}>
                Direct neighbor calls
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 10px 9px 32px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1.5px solid #A7F3D0',
                  background: '#F0FDF4',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  fontWeight: 500,
                  boxSizing: 'border-box'
                }}
              />
              <Phone size={14} color="#059669" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'block', marginTop: '3px' }}>
              Shared when negotiating or accepting bids for elevator handover.
            </span>
          </div>

          {/* Locality & Society with Map Auto-detect & Type-to-Search */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Your Society / Locality <span style={{ color: '#059669' }}>*</span>
              </label>

              {/* Auto-detect GPS button */}
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isDetecting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#065F46',
                  borderRadius: 'var(--radius-full)',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: isDetecting ? 'wait' : 'pointer'
                }}
              >
                {isDetecting ? (
                  <>
                    <Loader2 size={11} className="animate-spin" color="#059669" />
                    <span>Detecting...</span>
                  </>
                ) : (
                  <>
                    <Navigation size={11} color="#059669" />
                    <span>Auto-detect GPS</span>
                  </>
                )}
              </button>
            </div>

            {/* Currently Selected Locality Card */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              borderRadius: '8px',
              background: '#F0FDF4',
              border: '1.5px solid #86EFAC',
              marginBottom: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
                <Building size={14} color="#059669" style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#166534', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedSociety.name}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#15803D' }}>
                    {selectedSociety.area ? `${selectedSociety.area} · ` : ''}{selectedSociety.city}
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#15803D', background: '#DCFCE7', padding: '2px 6px', borderRadius: '4px', flexShrink: 0 }}>
                Selected
              </span>
            </div>

            {/* Type-to-Search Box */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Type to search society, area, or city (e.g. DLF, Powai, Whitefield)..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearching(true);
                  }}
                  onFocus={() => setIsSearching(true)}
                  style={{
                    width: '100%',
                    padding: '8px 10px 8px 30px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-subtle)',
                    background: '#FFFFFF',
                    fontSize: '12px',
                    boxSizing: 'border-box'
                  }}
                />
                <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>

              {/* Autocomplete Dropdown List */}
              {isSearching && searchQuery.trim().length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  background: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  zIndex: 100,
                  padding: '4px'
                }}>
                  {filteredSocieties.length > 0 ? (
                    filteredSocieties.map((soc) => (
                      <div
                        key={soc.id}
                        onClick={() => {
                          setSelectedSocId(soc.id);
                          setSearchQuery('');
                          setIsSearching(false);
                          setDetectionSuccess(null);
                        }}
                        style={{
                          padding: '7px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          background: soc.id === selectedSocId ? '#F0FDF4' : 'transparent',
                          transition: 'background 0.1s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = soc.id === selectedSocId ? '#F0FDF4' : 'transparent'; }}
                      >
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {soc.name}
                          </div>
                          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                            {soc.area ? `${soc.area} · ` : ''}{soc.city}
                          </div>
                        </div>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', border: '1px solid var(--border-hairline)', padding: '1px 5px', borderRadius: '4px' }}>
                          {soc.city}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '10px', fontSize: '11.5px', color: 'var(--text-muted)', textAlign: 'center' }}>
                      No matching registered society found. Select from dropdown below.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Direct Dropdown Alternative */}
            <div style={{ marginTop: '6px' }}>
              <select
                value={selectedSocId}
                onChange={(e) => {
                  setSelectedSocId(e.target.value);
                  setDetectionSuccess(null);
                }}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-hairline)',
                  background: 'var(--bg-subtle)',
                  fontSize: '11.5px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {societies.map((soc) => (
                  <option key={soc.id} value={soc.id}>
                    {soc.name} ({soc.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tower (Free-form text input) */}
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '3px' }}>
              Tower / Wing / Block <span style={{ color: '#059669' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                placeholder="e.g. Tower 4, Wing B, Block 2, Phase 1"
                value={tower}
                onChange={(e) => setTower(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px 8px 30px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)',
                  background: '#FFFFFF',
                  fontSize: '12.5px',
                  color: 'var(--text-primary)',
                  boxSizing: 'border-box'
                }}
              />
              <MapPin size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* Verification Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            padding: '8px 10px',
            background: '#F0FDF4',
            borderRadius: 'var(--radius-xs)',
            border: '1px solid #BBF7D0',
            fontSize: '11px',
            color: '#166534'
          }}>
            <ShieldCheck size={14} color="#16a34a" style={{ flexShrink: 0 }} />
            <span>Zero broker fees. Verified neighbor-to-neighbor trades only.</span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            style={{
              padding: '11px 16px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--text-primary)',
              color: '#FFFFFF',
              fontSize: '13.5px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '2px',
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.15s ease'
            }}
          >
            <span>Start Exploring Bhangar</span>
            <ArrowRight size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};
