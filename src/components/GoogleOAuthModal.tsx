import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { SocietyInfo, UserProfile } from '../data/mockData';
import { isSupabaseConfigured, signInWithGoogleOAuth } from '../lib/supabase';

interface GoogleOAuthModalProps {
  currentSociety: SocietyInfo;
  societies?: SocietyInfo[];
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
      // Offline/Local dev fallback: Simulate Google OAuth login with realistic resident data
      // and immediately hand over to the post-Google onboarding modal
      const demoGoogleProfile: UserProfile = {
        name: 'Sakar Baxi',
        username: 'sakar_baxi',
        email: 'sakar.baxi@gmail.com',
        phone: '',
        authProvider: 'google',
        googleAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
        isLoggedIn: true,
        isOnboarded: false, // forces the OnboardingModal to appear!
        tower: '',
        societyId: currentSociety.id,
        societyName: currentSociety.name,
        isVerified: true,
        rating: 5.0,
        dealsCompleted: 0,
        joinedDate: 'Resident'
      };
      onLoginSuccess(demoGoogleProfile);
      onClose();
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        background: 'rgba(0, 0, 0, 0.52)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 1000
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '400px',
          background: '#FFFFFF',
          border: '1px solid var(--border-hairline)',
          borderRadius: '18px',
          padding: '32px 28px 28px',
          color: 'var(--text-primary)',
          boxShadow: '0 24px 56px rgba(0, 0, 0, 0.16), 0 2px 6px rgba(0,0,0,0.06)',
          position: 'relative',
          textAlign: 'center'
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

        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <img 
            src="/new_bhangar_logo.png" 
            alt="Bhangar.Space" 
            style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
          />
        </div>

        {/* Trust Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px',
            color: '#059669',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            padding: '3px 10px',
            borderRadius: '999px',
            fontWeight: 500
          }}>
            <Sparkles size={11} color="#059669" />
            Hyperlocal Resident Marketplace
          </span>
        </div>

        {/* Title & Description */}
        <h2 style={{ fontSize: '21px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 7px 0', letterSpacing: '-0.02em' }}>
          Welcome to Bhangar
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 24px 0', lineHeight: 1.45 }}>
          {promptReason || 'Sign in with Google to explore verified neighbor deals, place bids, and list pre-loved goods.'}
        </p>

        {/* Error Alert */}
        {oauthError && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: '8px',
            padding: '12px 14px',
            marginBottom: '18px',
            color: '#991B1B',
            fontSize: '12px',
            lineHeight: 1.45,
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <AlertCircle size={16} color="#DC2626" style={{ flexShrink: 0, marginTop: '1px' }} />
              <div>
                <strong style={{ display: 'block', fontWeight: 600 }}>Google Sign-In Notice</strong>
                <span>{oauthError}</span>
              </div>
            </div>
          </div>
        )}

        {/* THE ONLY LOGIN METHOD: CONTINUE WITH GOOGLE */}
        <button
          type="button"
          disabled={isRedirecting}
          onClick={handleGoogleSignInClick}
          style={{
            width: '100%',
            padding: '13px 16px',
            borderRadius: '10px',
            background: '#FFFFFF',
            border: '1.5px solid #DADCE0',
            color: '#3C4043',
            fontSize: '14.5px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '11px',
            cursor: isRedirecting ? 'wait' : 'pointer',
            opacity: isRedirecting ? 0.75 : 1,
            boxShadow: '0 2px 4px rgba(60, 64, 67, 0.1)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => { if (!isRedirecting) { e.currentTarget.style.background = '#F8F9FA'; e.currentTarget.style.borderColor = '#BDC1C6'; } }}
          onMouseLeave={(e) => { if (!isRedirecting) { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#DADCE0'; } }}
        >
          {isRedirecting ? (
            <>
              <Loader2 size={19} className="animate-spin" color="#4285F4" />
              <span>Connecting to Google...</span>
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Security & Verification Benefits */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          marginTop: '20px',
          fontSize: '11.5px',
          color: '#15803D'
        }}>
          <ShieldCheck size={14} color="#16a34a" />
          <span>One-click Google sign in · No passwords to remember</span>
        </div>

        {/* Legal Links for Google OAuth Verification */}
        <div style={{
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-hairline)',
          fontSize: '11.5px',
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          textAlign: 'center'
        }}>
          By continuing, you agree to our{' '}
          <a
            href="/terms.html"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-secondary)', textDecoration: 'underline', fontWeight: 500 }}
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href="/privacy.html"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-secondary)', textDecoration: 'underline', fontWeight: 500 }}
          >
            Privacy Policy
          </a>.
        </div>
      </div>
    </div>
  );
};
