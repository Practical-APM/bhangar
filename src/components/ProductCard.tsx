import React, { useState } from 'react';
import { Heart, ArrowRight, Package, Share2 } from 'lucide-react';
import { ThriftItem } from '../data/mockData';

interface ProductCardProps {
  item: ThriftItem;
  userTower: string;
  currentSocietyName?: string;
  distanceKm?: number;
  isOwner?: boolean;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
  onOpenOfferModal: (item: ThriftItem) => void;
  onViewDetails: (item: ThriftItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  item,
  userTower,
  currentSocietyName,
  distanceKm,
  isOwner = false,
  isSaved = false,
  onToggleSave,
  onOpenOfferModal,
  onViewDetails
}) => {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const discountPercent = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);

  const getAspectRatioStyle = () => {
    switch (item.aspectRatio) {
      case '3/4':  return '3 / 4';
      case '4/5':  return '4 / 5';
      case '9/11': return '9 / 11';
      default:     return '1 / 1';
    }
  };

  const isSameTower = item.seller.tower === userTower;
  const isDisabled  = item.status === 'held' || item.status === 'sold';

  return (
    <div
      onClick={() => onViewDetails(item)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="pin-card masonry-item"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        borderRadius: '18px',
        padding: '11px',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-card)',
        position: 'relative',
      }}
    >
      {/* Image Container */}
      <div
        className="pin-img-wrapper"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: getAspectRatioStyle(),
          borderRadius: '12px',
          overflow: 'hidden',
          background: 'var(--bg-subtle)',
          marginBottom: '10px',
        }}
      >
        {!imgError ? (
          <img
            src={item.images[0]}
            alt={item.title}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-subtle)', color: 'var(--text-muted)', gap: '6px',
          }}>
            <Package size={28} strokeWidth={1.5} />
            <span style={{ fontSize: '11px' }}>{item.category}</span>
          </div>
        )}

        {/* Condition & Moving-Out Badges */}
        <div style={{
          position: 'absolute', top: '8px', left: '8px',
          display: 'flex', flexDirection: 'column', gap: '4px', pointerEvents: 'none',
        }}>
          <span style={{
            background: 'rgba(24, 22, 20, 0.78)',
            color: '#FFFFFF', fontSize: '9px', fontWeight: 600,
            padding: '3px 7px', borderRadius: '6px',
            letterSpacing: '0.04em', textTransform: 'uppercase',
            backdropFilter: 'blur(4px)',
          }}>
            {item.condition === 'like_new' ? 'Like New' : item.condition === 'gently_used' ? 'Gently Used' : 'Needs Repair'}
          </span>
          {item.isMovingOut && (
            <span style={{
              background: 'rgba(255, 255, 255, 0.92)',
              color: 'var(--text-primary)', fontSize: '9px', fontWeight: 600,
              padding: '3px 7px', borderRadius: '6px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              backdropFilter: 'blur(4px)',
            }}>
              Moving Out
            </span>
          )}
        </div>

        {/* WhatsApp Share Button */}
        <a
          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
            `Check this out on Bhangar.Space:\n\n🛍️ ${item.title}\n💰 ₹${item.price.toLocaleString('en-IN')} (was ₹${item.originalPrice.toLocaleString('en-IN')})\n📍 ${(item.seller?.society || 'Society').split('(')[0].trim()}\n\nhttps://bhangar.space`
          )}`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          title="Share on WhatsApp"
          style={{
            position: 'absolute', top: '46px', right: '8px',
            width: '28px', height: '28px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
            transition: 'transform 0.15s ease, opacity 0.15s ease',
            transform: isHovered ? 'scale(1)' : 'scale(0.88)',
            opacity: isHovered ? 1 : 0,
            pointerEvents: isHovered ? 'auto' : 'none',
            backdropFilter: 'blur(4px)',
          }}
        >
          <Share2 size={11} color="#25D366" strokeWidth={2.5} />
        </a>

        {/* Save Heart Button or Owner Badge */}
        {isOwner ? (
          <div
            style={{
              position: 'absolute', top: '8px', right: '8px',
              padding: '4px 9px', borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.95)',
              color: 'var(--text-primary)',
              fontSize: '10.5px', fontWeight: 700,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              backdropFilter: 'blur(4px)',
              letterSpacing: '-0.01em',
              zIndex: 3
            }}
          >
            Your Listing
          </div>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); if (onToggleSave) onToggleSave(item.id); }}
            title={isSaved ? 'Saved to wishlist' : 'Save item'}
            style={{
              position: 'absolute', top: '8px', right: '8px',
              width: '32px', height: '32px', borderRadius: 'var(--radius-full)',
              background: isSaved ? '#DC2626' : 'rgba(255, 255, 255, 0.9)',
              color: isSaved ? '#FFFFFF' : '#1A1A1A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.14)',
              transition: 'transform 0.18s var(--ease-out-expo), background-color 0.15s ease',
              transform: isHovered || isSaved ? 'scale(1)' : 'scale(0.88)',
              opacity: isHovered || isSaved ? 1 : 0.8,
              backdropFilter: 'blur(4px)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.12)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <Heart size={14} fill={isSaved ? '#FFFFFF' : 'none'} color={isSaved ? '#FFFFFF' : '#1A1A1A'} strokeWidth={2} />
          </button>
        )}

        {/* Reserved Banner */}
        {item.status === 'held' && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(4px)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-primary)', fontSize: '12px', fontWeight: 500,
            gap: '2px', zIndex: 5, borderRadius: '12px',
          }}>
            <span style={{ fontWeight: 700 }}>Reserved on Hold</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Buyer inspecting in tower</span>
          </div>
        )}

        {/* Sold Banner */}
        {item.status === 'sold' && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(24, 22, 20, 0.80)',
            backdropFilter: 'blur(4px)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            color: '#FFFFFF', fontSize: '12px', fontWeight: 500,
            gap: '3px', zIndex: 5, borderRadius: '12px',
          }}>
            <span style={{ fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '11px' }}>Sold</span>
            <span style={{ fontSize: '11px', opacity: 0.8 }}>Handed over to neighbor</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        {/* Society & Tower Tag */}
        <div style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
          {!currentSocietyName || (item.seller?.society || '').trim().toLowerCase() === currentSocietyName.trim().toLowerCase() ? (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: isSameTower ? '#ECFDF5' : 'var(--bg-subtle)',
              color: isSameTower ? '#047857' : 'var(--text-secondary)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              fontSize: '10.5px',
              fontWeight: 500,
              border: `1px solid ${isSameTower ? '#A7F3D0' : 'var(--border-hairline)'}`,
            }}>
              <span style={{ fontWeight: 600 }}>{(item.seller?.society || 'Society').split('(')[0].trim()}</span>
              <span style={{ color: 'var(--text-muted)' }}>· {item.seller?.tower || 'Tower'}</span>
            </span>
          ) : (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: '#EFF6FF',
              color: '#1D4ED8',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              fontSize: '10.5px',
              fontWeight: 600,
              border: '1px solid #BFDBFE',
            }}>
              <span>📍 Nearby · {(item.seller?.society || 'Society').split('(')[0].trim()}{typeof distanceKm === 'number' && distanceKm > 0 ? ` (${distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)} km`})` : ''}</span>
            </span>
          )}

          {item.seller?.city && (
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>
              {item.seller.city}
            </span>
          )}

          {item.previousPrice && item.previousPrice > item.price && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              background: '#FEF2F2',
              color: '#DC2626',
              padding: '2px 7px',
              borderRadius: 'var(--radius-full)',
              fontSize: '10px',
              fontWeight: 700,
              border: '1px solid #FECACA'
            }}>
              <span>🔥</span>
              <span>₹{(item.previousPrice - item.price).toLocaleString('en-IN')} off</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '14px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          lineHeight: 1.35,
          marginBottom: '10px',
          letterSpacing: '-0.01em',
        }}>
          {item.title}
        </h3>

        {/* Price Row */}
        <div style={{
          borderTop: '1px solid var(--border-hairline)',
          paddingTop: '10px',
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '7px' }}>
            <span className="tabular-nums" style={{
              fontSize: '17px', fontWeight: 700,
              color: 'var(--text-primary)', letterSpacing: '-0.02em',
            }}>
              ₹{item.price.toLocaleString('en-IN')}
            </span>
            <span className="tabular-nums" style={{
              fontSize: '11.5px', color: 'var(--text-muted)', textDecoration: 'line-through',
            }}>
              ₹{item.originalPrice.toLocaleString('en-IN')}
            </span>
          </div>

          {item.previousPrice && item.previousPrice > item.price ? (
            <span style={{
              background: '#DC2626',
              color: '#FFFFFF',
              fontSize: '10px', fontWeight: 700,
              padding: '2.5px 7px',
              borderRadius: 'var(--radius-full)',
              letterSpacing: '-0.01em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px'
            }}>
              <span>🔥 Price Drop</span>
            </span>
          ) : (
            <span style={{
              background: 'var(--ikea-yellow)',
              color: '#1A1A1A',
              fontSize: '10.5px', fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              letterSpacing: '-0.01em',
            }}>
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* CTA Button */}
        {isOwner ? (
          <button
            onClick={(e) => { e.stopPropagation(); onViewDetails(item); }}
            className="card-cta-btn"
            style={{
              width: '100%',
              padding: '9px 14px',
              borderRadius: 'var(--radius-full)',
              background: '#F8FAFC',
              color: 'var(--text-primary)',
              fontSize: '12.5px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              border: '1px solid var(--border-medium)',
              cursor: 'pointer',
              letterSpacing: '-0.01em',
            }}
          >
            <span>
              {item.status === 'sold'
                ? 'Your Listing · Sold'
                : item.status === 'held'
                ? 'Your Listing · Reserved'
                : 'Your Listing · Manage'}
            </span>
            <ArrowRight size={13} />
          </button>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onOpenOfferModal(item); }}
            disabled={isDisabled}
            className="card-cta-btn"
            style={{
              width: '100%',
              padding: '9px 14px',
              borderRadius: 'var(--radius-full)',
              background: isDisabled ? 'var(--bg-subtle)' : 'var(--text-primary)',
              color: isDisabled ? 'var(--text-muted)' : '#FFFFFF',
              fontSize: '12.5px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              border: 'none',
              cursor: isDisabled ? 'default' : 'pointer',
              letterSpacing: '-0.01em',
            }}
          >
            <span>{item.status === 'sold' ? 'Sold Out' : item.status === 'held' ? 'Reserved' : 'Make Offer'}</span>
            {!isDisabled && <ArrowRight size={13} />}
          </button>
        )}
      </div>
    </div>
  );
};
