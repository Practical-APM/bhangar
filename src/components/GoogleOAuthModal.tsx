import React, { useState } from 'react';
import { X, ArrowLeft, User, ChevronDown, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { SocietyInfo, UserProfile } from '../data/mockData';
import { isSupabaseConfigured, signInWithGoogleOAuth } from '../lib/supabase';

interface GoogleOAuthModalProps {
  currentSociety: SocietyInfo;
  userProfile: UserProfile;
  promptReason?: string;
  onClose: () => void;
  onLoginSuccess: (profile: UserProfile) => void;
}

interface GoogleAccountItem {
  name: string;
  email: string;
  avatar?: string;
  tower?: string;
  flatNumber?: string;
}

const PRESET_GOOGLE_ACCOUNTS: GoogleAccountItem[] = [
  {
    name: 'Sakar Baxi',
    email: 'sakar@tartanhq.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    tower: 'Tower 4',
    flatNumber: '802'
  },
  {
    name: 'Duski Flake',
    email: 'duskiflake@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
    tower: 'Tower 2',
    flatNumber: '304'
  },
  {
    name: 'Sakar Baxi',
    email: 'sakar.baxi@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    tower: 'Tower 4',
    flatNumber: '802'
  },
  {
    name: 'Sakar Baxi',
    email: 'baxisakar18@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    tower: 'Tower 4',
    flatNumber: '802'
  },
  {
    name: 'Pranav Awasthi',
    email: 'pranav@tartanhq.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    tower: 'Tower 1',
    flatNumber: '1102'
  }
];

export const GoogleOAuthModal: React.FC<GoogleOAuthModalProps> = ({
  currentSociety,
  promptReason,
  onClose,
  onLoginSuccess
}) => {
  // 'auth_portal': Main sign-in layout
  // 'google_consent': Google account selection simulation
  const [view, setView] = useState<'auth_portal' | 'google_consent'>('auth_portal');
  
  // Real OAuth state
  const hasSupabase = isSupabaseConfigured();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);

  // Auth Portal state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Google OAuth consent state
  const [authenticatingAccount, setAuthenticatingAccount] = useState<GoogleAccountItem | null>(null);
  const [isCustomGoogle, setIsCustomGoogle] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  const handleGoogleSignInClick = async () => {
    setOauthError(null);
    if (hasSupabase) {
      try {
        setIsRedirecting(true);
        await signInWithGoogleOAuth();
        // Browser will redirect to Google accounts login
      } catch (err: any) {
        setIsRedirecting(false);
        const errMsg = err?.message || 'Failed to start Google sign in';
        setOauthError(errMsg);
      }
    } else {
      // Supabase is not configured -> open local simulated resident chooser
      setView('google_consent');
    }
  };


  const handleSelectGoogleAccount = (acc: GoogleAccountItem) => {
    setAuthenticatingAccount(acc);
    setTimeout(() => {
      const authenticatedProfile: UserProfile = {
        name: acc.name,
        email: acc.email,
        authProvider: 'google',
        googleAvatar: acc.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(acc.name)}`,
        isLoggedIn: true,
        flatNumber: acc.flatNumber || '802',
        tower: acc.tower || currentSociety.towers[0] || 'Tower 4',
        societyId: currentSociety.id,
        societyName: currentSociety.name,
        isVerified: true,
        rating: 5.0,
        dealsCompleted: 6,
        joinedDate: 'Resident since 2024'
      };
      onLoginSuccess(authenticatedProfile);
      onClose();
    }, 550);
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    const name = customName.trim() || customEmail.split('@')[0];
    handleSelectGoogleAccount({
      name,
      email: customEmail.trim(),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
    });
  };

  const handleEmailSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const derivedName = email.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);
    
    const authenticatedProfile: UserProfile = {
      name: formattedName || 'Resident',
      email: email.trim(),
      authProvider: 'google',
      isLoggedIn: true,
      flatNumber: '802',
      tower: currentSociety.towers[0] || 'Tower 4',
      societyId: currentSociety.id,
      societyName: currentSociety.name,
      isVerified: true,
      rating: 5.0,
      dealsCompleted: 1,
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
      {/* VIEW 1: SIGN IN PORTAL (SCREENSHOT 2 STRUCTURE - CONSISTENT LIGHT THEME) */}
      {view === 'auth_portal' && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '430px',
            background: '#FFFFFF',
            border: '1px solid var(--border-hairline)',
            borderRadius: '16px',
            padding: '32px 28px',
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
              top: '18px',
              right: '18px',
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

          {/* App Brand Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
            <img 
              src="/new_bhangar_logo.png" 
              alt="Bhangar.Space Logo" 
              style={{ height: '30px', width: 'auto', objectFit: 'contain' }}
            />
          </div>

          {/* Mode Status Chip */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
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
                color: '#D97706',
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                padding: '3px 9px',
                borderRadius: '999px',
                fontWeight: 500
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B' }} />
                Local Demo Mode (Mock OAuth)
              </span>
            )}
          </div>

          {/* Title & Description */}
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              Sign in
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
              {promptReason || `Sign in to explore verified society listings, make offers, and connect with neighbors in ${currentSociety.name.split('(')[0].trim()}.`}
            </p>
          </div>

          {/* Error Banner */}
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
                Tip: In Supabase Dashboard, go to <strong>Authentication → Providers → Google</strong>, toggle Enable, and enter your Google Cloud Client ID & Secret.
              </div>
              <div style={{ marginTop: '10px', paddingLeft: '24px' }}>
                <button
                  type="button"
                  onClick={() => setView('google_consent')}
                  style={{
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: '#1D4ED8',
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '5px',
                    padding: '4px 10px',
                    cursor: 'pointer'
                  }}
                >
                  Switch to Demo Resident Profiles →
                </button>
              </div>
            </div>
          )}

          {/* CONTINUE WITH GOOGLE BUTTON */}
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
                {/* Google SVG Icon */}
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

          {/* Optional Demo Switcher link if Supabase is active */}
          {hasSupabase && (
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setView('google_consent')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '11px',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Or test with simulated demo profiles
              </button>
            </div>
          )}


          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '20px 0 16px 0'
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-hairline)' }} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'lowercase' }}>
              or continue with email
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-hairline)' }} />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSignInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Email
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
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

            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 48px 9px 12px',
                    borderRadius: '6px',
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    padding: '2px 4px'
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
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
                marginTop: '4px',
                transition: 'opacity 0.15s ease'
              }}
            >
              Sign in
            </button>
          </form>

          {/* Links */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => {}}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '11.5px',
                cursor: 'pointer',
                marginBottom: '10px',
                textDecoration: 'underline'
              }}
            >
              Forgot password?
            </button>

            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              New here?{' '}
              <button
                type="button"
                onClick={() => setView('google_consent')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline'
                }}
              >
                Create an account
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                ← Back to home
              </button>
              <span>·</span>
              <span style={{ cursor: 'pointer' }}>Privacy</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: GOOGLE OAUTH CONSENT SCREEN (SCREENSHOT 3 STRUCTURE - LIGHT THEME) */}
      {view === 'google_consent' && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '780px',
            background: '#FFFFFF',
            border: '1px solid #DADCE0',
            borderRadius: '24px',
            padding: '36px 40px 24px',
            color: '#202124',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.15)',
            position: 'relative'
          }}
        >
          {/* Top Bar: Google Logo + Sign in with Google */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#3C4043', letterSpacing: '0.01em' }}>
                Sign in with Google
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setView('auth_portal')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#5F6368',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px'
                }}
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#5F6368',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Main 2-Column Split: Title on Left, Accounts on Right */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.35fr',
            gap: '36px',
            alignItems: 'start',
            marginBottom: '32px'
          }}>
            {/* Left Column: Heading */}
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: 400,
                color: '#202124',
                margin: '0 0 10px 0',
                lineHeight: 1.25,
                letterSpacing: '-0.02em'
              }}>
                Choose an account
              </h1>
              <div style={{ fontSize: '15px', color: '#202124', lineHeight: 1.5 }}>
                to continue to{' '}
                <span style={{ color: '#1A73E8', fontWeight: 500 }}>
                  bhangar.space
                </span>
              </div>

              {promptReason && (
                <div style={{
                  marginTop: '20px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#E8F0FE',
                  border: '1px solid #D2E3FC',
                  fontSize: '12px',
                  color: '#174EA6',
                  lineHeight: 1.4
                }}>
                  {promptReason}
                </div>
              )}
            </div>

            {/* Right Column: Account List */}
            <div>
              <div style={{
                borderTop: '1px solid #E0E0E0',
                borderBottom: '1px solid #E0E0E0'
              }}>
                {PRESET_GOOGLE_ACCOUNTS.map((acc, index) => {
                  const isCurrentAuth = authenticatingAccount?.email === acc.email;
                  return (
                    <div
                      key={index}
                      onClick={() => handleSelectGoogleAccount(acc)}
                      style={{
                        padding: '12px 14px',
                        borderBottom: index < PRESET_GOOGLE_ACCOUNTS.length - 1 ? '1px solid #E0E0E0' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F8F9FA'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {acc.avatar ? (
                          <img
                            src={acc.avatar}
                            alt={acc.name}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: '#5F6368',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 600
                          }}>
                            {acc.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 500, color: '#202124', marginBottom: '2px' }}>
                            {acc.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#5F6368' }}>
                            {acc.email}
                          </div>
                        </div>
                      </div>

                      {isCurrentAuth && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#1A73E8',
                          fontSize: '12px'
                        }}>
                          <span style={{ animation: 'spin 1.2s linear infinite', display: 'inline-block' }}>⟳</span>
                          <span>Signing in...</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* "Use another account" button */}
                <div
                  onClick={() => setIsCustomGoogle(!isCustomGoogle)}
                  style={{
                    padding: '14px',
                    borderTop: '1px solid #E0E0E0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F8F9FA'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'transparent',
                    border: '1.5px solid #5F6368',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#202124'
                  }}>
                    <User size={18} />
                  </div>
                  <span style={{ fontSize: '13.5px', fontWeight: 500, color: '#202124' }}>
                    Use another account
                  </span>
                </div>
              </div>

              {/* Custom Google account inline input form */}
              {isCustomGoogle && (
                <form
                  onSubmit={handleCustomGoogleSubmit}
                  style={{
                    marginTop: '12px',
                    padding: '12px',
                    background: '#F8F9FA',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    border: '1px solid #DADCE0'
                  }}
                >
                  <input
                    type="text"
                    placeholder="Your Full Name (e.g. Sakar Baxi)"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '4px',
                      background: '#FFFFFF',
                      border: '1px solid #DADCE0',
                      color: '#202124',
                      fontSize: '12.5px',
                      outline: 'none'
                    }}
                  />
                  <input
                    type="email"
                    required
                    placeholder="Google Email (e.g. sakar@gmail.com)"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '4px',
                      background: '#FFFFFF',
                      border: '1px solid #DADCE0',
                      color: '#202124',
                      fontSize: '12.5px',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '8px 14px',
                      borderRadius: '4px',
                      background: '#1A73E8',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      fontSize: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      alignSelf: 'flex-end'
                    }}
                  >
                    Next
                  </button>
                </form>
              )}

              {/* Disclaimer text */}
              <div style={{
                marginTop: '20px',
                fontSize: '11.5px',
                color: '#5F6368',
                lineHeight: 1.5
              }}>
                Before using this app, you can review bhangar.space's{' '}
                <span style={{ color: '#1A73E8', cursor: 'pointer' }}>Privacy Policy</span> and{' '}
                <span style={{ color: '#1A73E8', cursor: 'pointer' }}>Terms of Service</span>.
              </div>
            </div>
          </div>

          {/* Footer Bar: English dropdown + Help, Privacy, Terms */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '16px',
            borderTop: '1px solid #E0E0E0',
            fontSize: '11.5px',
            color: '#5F6368'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <span>English (United Kingdom)</span>
              <ChevronDown size={12} />
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
              <span style={{ cursor: 'pointer' }}>Help</span>
              <span style={{ cursor: 'pointer' }}>Privacy</span>
              <span style={{ cursor: 'pointer' }}>Terms</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
