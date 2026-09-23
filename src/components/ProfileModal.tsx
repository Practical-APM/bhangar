import React from 'react';
import { X, ShieldCheck, Star, Clock, Package, Heart, Edit3, CheckCircle2 } from 'lucide-react';
import { UserProfile, ThriftItem } from '../data/mockData';

interface ProfileModalProps {
  userProfile: UserProfile;
  myItemsCount: number;
  savedCount: number;
  onClose: () => void;
  onOpenEditProfile: () => void;
  onOpenMyListings: () => void;
  onOpenSaved: () => void;
  onOpenGoogleLogin?: () => void;
  onSignOut?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  userProfile,
  myItemsCount,
  savedCount,
  onClose,
  onOpenEditProfile,
  onOpenMyListings,
  onOpenSaved,
  onOpenGoogleLogin,
  onSignOut
}) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '460px', padding: '24px' }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          borderBottom: '1px solid var(--border-hairline)',
          paddingBottom: '12px'
        }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Resident Profile
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {userProfile.name}
            </h3>
          </div>
          <button 
            onClick={onClose}
            style={{ color: 'var(--text-muted)', padding: '2px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Resident Card */}
        <div style={{
          background: '#FAF8F5',
          border: '1px solid #EBE5DC',
          borderRadius: 'var(--radius-sm)',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {userProfile.tower} · Flat {userProfile.flatNumber}
                </span>
                <ShieldCheck size={16} color="#16a34a" />
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {userProfile.societyName}
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenEditProfile();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-hairline)',
                background: '#FFFFFF',
                fontSize: '11px',
                color: 'var(--text-secondary)'
              }}
            >
              <Edit3 size={11} />
              <span>Edit</span>
            </button>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: '#F0FDF4',
            color: '#166534',
            padding: '3px 8px',
            borderRadius: 'var(--radius-xs)',
            fontSize: '11px',
            fontWeight: 500
          }}>
            <CheckCircle2 size={12} color="#16a34a" />
            <span>Gatepass & Intercom Verified Resident</span>
          </div>
        </div>

        {/* Reputation Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '10px',
          marginBottom: '18px'
        }}>
          <div style={{
            border: '1px solid var(--border-hairline)',
            borderRadius: 'var(--radius-xs)',
            padding: '10px',
            textAlign: 'center',
            background: 'var(--bg-surface)'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {userProfile.dealsCompleted}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Deals Closed
            </div>
          </div>

          <div style={{
            border: '1px solid var(--border-hairline)',
            borderRadius: 'var(--radius-xs)',
            padding: '10px',
            textAlign: 'center',
            background: 'var(--bg-surface)'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
              <span>{userProfile.rating.toFixed(1)}</span>
              <Star size={13} fill="#EAB308" color="#EAB308" />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Trust Score
            </div>
          </div>

          <div style={{
            border: '1px solid var(--border-hairline)',
            borderRadius: 'var(--radius-xs)',
            padding: '10px',
            textAlign: 'center',
            background: 'var(--bg-surface)'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              &lt; 10m
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Response
            </div>
          </div>
        </div>

        {/* Google Authentication Status */}
        <div style={{
          padding: '10px 12px',
          borderRadius: 'var(--radius-xs)',
          border: '1px solid var(--border-hairline)',
          background: 'var(--bg-subtle)',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#FFFFFF',
              border: '1px solid var(--border-hairline)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {userProfile.email || 'Authenticated with Google'}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Google OAuth 2.0 Verified
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              if (onOpenGoogleLogin) onOpenGoogleLogin();
            }}
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: '#0058A3',
              padding: '4px 8px',
              borderRadius: 'var(--radius-xs)',
              background: '#FFFFFF',
              border: '1px solid var(--border-hairline)',
              whiteSpace: 'nowrap'
            }}
          >
            Switch
          </button>
        </div>

        {/* Quick Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => {
              onClose();
              onOpenMyListings();
            }}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-hairline)',
              background: 'var(--bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12.5px',
              color: 'var(--text-primary)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={15} color="var(--text-secondary)" />
              <span style={{ fontWeight: 500 }}>My Active Items</span>
            </div>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{myItemsCount} listings</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenSaved();
            }}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-hairline)',
              background: 'var(--bg-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12.5px',
              color: 'var(--text-primary)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Heart size={15} color="#DC2626" />
              <span style={{ fontWeight: 500 }}>Saved Wishlist</span>
            </div>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{savedCount} items</span>
          </button>

          {onSignOut && (
            <button
              onClick={() => {
                onClose();
                onSignOut();
              }}
              style={{
                width: '100%',
                padding: '8px 14px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid transparent',
                fontSize: '11.5px',
                color: 'var(--text-muted)',
                textAlign: 'center',
                marginTop: '4px'
              }}
            >
              Sign out from this browser
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
