import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, Loader2, Phone, User, Mail, MapPin } from 'lucide-react';
import { SocietyInfo, UserProfile } from '../data/mockData';
import { isSupabaseConfigured, signInWithGoogleOAuth } from '../lib/supabase';

interface GoogleOAuthModalProps {
  currentSociety: SocietyInfo;
  userProfile: UserProfile;
  promptReason?: string;
  onClose: () => void;
  onLoginSuccess: (profile: UserProfile) => void;
}

export const GoogleOAuthModal: React.FC<GoogleOAuthModalProps> = ({
  currentSociety,
  userProfile,
  promptReason,
  onClose,
  onLoginSuccess
}) => {
  const hasSupabase = isSupabaseConfigured();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);

  // Manual/Email Resident Sign-in state
  const [activeTab, setActiveTab] = useState<'quick' | 'details'>('quick');
  const [fullName, setFullName] = useState(userProfile.name || '');
  const [email, setEmail] = useState(userProfile.email || '');
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [tower, setTower] = useState(userProfile.tower || currentSociety.towers[0] || 'Tower 1');
  const [flatNumber, setFlatNumber] = useState(userProfile.flatNumber || '');

  const handleGoogleSignInClick = async () => {
    setOauthError(null);
    if (hasSupabase) {
      try {
        setIsRedirecting(true);
        await signInWithGoogleOAuth();
      } catch (err: any) {
        setIsRedirecting(false);
        const errMsg = err?.message || 'Failed to start Google sign in';
        setOauthError(errMsg);
      }
    } else {
      // If Supabase not yet configured, switch directly to resident details form
      setActiveTab('details');
    }
  };

  const handleResidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() && !phone.trim() && !fullName.trim()) return;

    const displayName = fullName.trim() || (email ? email.split('@')[0] : 'Resident Neighbor');
    const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

    const authenticatedProfile: UserProfile = {
      name: formattedName,
      email: email.trim(),
      phone: phone.trim(),
      authProvider: 'google',
      googleAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}`,
      isLoggedIn: true,
      flatNumber: flatNumber.trim() || 'Floor resident',
      tower: tower || currentSociety.towers[0] || 'Tower 1',
      societyId: currentSociety.id,
      societyName: currentSociety.name,
      isVerified: true,
      rating: 5.0,
      dealsCompleted: 0,
      joinedDate: 'Resident since 2024'
    };

    onLoginSuccess(authenticatedProfile);
    onClose();
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        background: 'rgba(0, 0, 0, 0.48)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '430px',
          background: '#FFFFFF',
          border: '1px solid var(--border-hairline)',
          borderRadius: '16px',
          padding: '28px 24px',
          color: 'var(--text-primary)',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0,0,0,0.06)',
          position: 'relative'
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px'
          }}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
          <img 
            src="/new_bhangar_logo.png" 
            alt="Bhangar.Space" 
            style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
          />
        </div>

        {/* Mode Status Pill */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
          {hasSupabase ? (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11px',
              color: '#059669',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              padding: '3px 9px',
              borderRadius: '999px',
              fontWeight: 500
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
              Real Google OAuth Connected
            </span>
          ) : (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11px',
              color: '#059669',
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              padding: '3px 9px',
              borderRadius: '999px',
              fontWeight: 500
            }}>
              <ShieldCheck size={12} color="#059669" />
              Resident Sign In & Verification
            </span>
          )}
        </div>

        {/* Title & Description */}
        <div style={{ marginBottom: '18px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 5px 0', letterSpacing: '-0.02em' }}>
            Resident Sign In
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
            {promptReason || `Sign in to make offers, list items, and connect with neighbors in ${currentSociety.name.split('(')[0].trim()}.`}
          </p>
        </div>

        {/* Error Alert */}
        {oauthError && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: '8px',
            padding: '12px 14px',
            marginBottom: '16px',
            color: '#991B1B',
            fontSize: '12px',
            lineHeight: 1.45
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
              <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: '1px' }} />
              <div>
                <strong style={{ display: 'block', fontWeight: 600 }}>Google Sign-In Notice</strong>
                <span>{oauthError}</span>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: '#7F1D1D', marginTop: '6px', paddingLeft: '24px' }}>
              Tip: In Supabase Dashboard, ensure Google Provider is enabled under <strong>Authentication → Providers → Google</strong>.
            </div>
          </div>
        )}

        {/* PRIMARY GOOGLE BUTTON */}
        <button
          type="button"
          disabled={isRedirecting}
          onClick={handleGoogleSignInClick}
          style={{
            width: '100%',
            padding: '11px 16px',
            borderRadius: '8px',
            background: '#FFFFFF',
            border: '1px solid #DADCE0',
            color: '#3C4043',
            fontSize: '13.5px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            cursor: isRedirecting ? 'wait' : 'pointer',
            opacity: isRedirecting ? 0.75 : 1,
            boxShadow: '0 1px 2px rgba(60, 64, 67, 0.08)',
            transition: 'background 0.15s ease, box-shadow 0.15s ease'
          }}
          onMouseEnter={(e) => { if (!isRedirecting) e.currentTarget.style.background = '#F8F9FA'; }}
          onMouseLeave={(e) => { if (!isRedirecting) e.currentTarget.style.background = '#FFFFFF'; }}
        >
          {isRedirecting ? (
            <>
              <Loader2 size={18} className="animate-spin" color="#4285F4" />
              <span>Connecting to Google...</span>
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '18px 0 16px 0'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-hairline)' }} />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'lowercase' }}>
            or resident details
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-hairline)' }} />
        </div>

        {/* Resident Details Form with Contact Number */}
        <form onSubmit={handleResidentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Your Name
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px',
                  borderRadius: '6px',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <User size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              WhatsApp / Mobile Number <span style={{ color: '#059669', fontWeight: 600 }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px',
                  borderRadius: '6px',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <Phone size={15} color="#059669" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'block', marginTop: '3px' }}>
              Shared with buyer/seller when an offer is placed to coordinate pickup off-platform.
            </span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px',
                  borderRadius: '6px',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <Mail size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* Tower & Flat */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Tower
              </label>
              <select
                value={tower}
                onChange={(e) => setTower(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 10px',
                  borderRadius: '6px',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '12.5px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                {currentSociety.towers.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Flat No.
              </label>
              <input
                type="text"
                placeholder="e.g. 802"
                value={flatNumber}
                onChange={(e) => setFlatNumber(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 10px',
                  borderRadius: '6px',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: '8px',
              background: 'var(--text-primary)',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '6px',
              transition: 'opacity 0.15s ease'
            }}
          >
            Continue as Resident
          </button>
        </form>

        {/* Back Link */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '11.5px',
              cursor: 'pointer'
            }}
          >
            ← Back to marketplace
          </button>
        </div>
      </div>
    </div>
  );
};
