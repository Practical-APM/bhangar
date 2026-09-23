import React from 'react';
import { X, Heart, Trash2, ArrowRight, Clock, ShieldCheck, Tag, ShoppingBag } from 'lucide-react';
import { ThriftItem } from '../data/mockData';

interface WishlistModalProps {
  savedItems: ThriftItem[];
  userTower: string;
  onClose: () => void;
  onToggleSave: (id: string) => void;
  onOpenOfferModal: (item: ThriftItem) => void;
  onViewDetails: (item: ThriftItem) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  savedItems,
  userTower,
  onClose,
  onToggleSave,
  onOpenOfferModal,
  onViewDetails
}) => {
  const totalOriginal = savedItems.reduce((acc, it) => acc + it.originalPrice, 0);
  const totalPrice = savedItems.reduce((acc, it) => acc + it.price, 0);
  const totalSavings = totalOriginal - totalPrice;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '580px', padding: '24px' }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-hairline)',
          paddingBottom: '14px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#FEF2F2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Heart size={15} fill="#DC2626" />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Saved Wishlist
              </h2>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {savedItems.length} {savedItems.length === 1 ? 'item' : 'items'} tracked in your society
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Savings Summary Banner */}
        {savedItems.length > 0 && (
          <div style={{
            background: '#FAF8F5',
            border: '1px solid #EBE5DC',
            borderRadius: 'var(--radius-xs)',
            padding: '12px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Combined Retail Value
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'line-through' }} className="tabular-nums">
                ₹{totalOriginal.toLocaleString('en-IN')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Total Asking Price
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }} className="tabular-nums">
                ₹{totalPrice.toLocaleString('en-IN')}
              </div>
            </div>

            <div style={{
              background: '#DCFCE7',
              color: '#166534',
              padding: '6px 10px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '11.5px',
              fontWeight: 600
            }}>
              Save ₹{totalSavings.toLocaleString('en-IN')}
            </div>
          </div>
        )}

        {/* Saved Items List */}
        <div style={{
          maxHeight: '420px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '16px',
          paddingRight: '4px'
        }}>
          {savedItems.length > 0 ? (
            savedItems.map((item) => {
              const isSameTower = item.seller.tower === userTower;
              const isAvailable = item.status === 'available';

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-hairline)',
                    background: 'var(--bg-surface)',
                    transition: 'border-color 0.15s ease'
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    onClick={() => {
                      onClose();
                      onViewDetails(item);
                    }}
                    style={{
                      width: '76px',
                      height: '76px',
                      borderRadius: 'var(--radius-xs)',
                      overflow: 'hidden',
                      background: 'var(--bg-subtle)',
                      flexShrink: 0,
                      cursor: 'pointer'
                    }}
                  >
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '2px' }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 500,
                          padding: '1px 5px',
                          borderRadius: '2px',
                          background: isSameTower ? 'var(--ikea-blue-subtle)' : 'var(--bg-subtle)',
                          color: isSameTower ? 'var(--ikea-blue)' : 'var(--text-secondary)'
                        }}>
                          {isSameTower ? `${item.seller.tower} (Same building)` : item.seller.tower}
                        </span>

                        <span style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          color: item.status === 'sold' ? '#DC2626' : item.status === 'held' ? '#D97706' : '#166534'
                        }}>
                          {item.status === 'sold' ? 'Sold' : item.status === 'held' ? 'Reserved on Hold' : 'Available'}
                        </span>
                      </div>

                      <h3
                        onClick={() => {
                          onClose();
                          onViewDetails(item);
                        }}
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          margin: '0 0 4px',
                          lineHeight: 1.3,
                          cursor: 'pointer',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item.title}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span className="tabular-nums" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                        <span className="tabular-nums" style={{ fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          ₹{item.originalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Action Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                      <button
                        onClick={() => onToggleSave(item.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                          padding: '2px 0'
                        }}
                        title="Remove from wishlist"
                      >
                        <Trash2 size={12} />
                        <span>Remove</span>
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => {
                            onClose();
                            onViewDetails(item);
                          }}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--border-hairline)',
                            background: 'var(--bg-subtle)',
                            fontSize: '11px',
                            fontWeight: 500,
                            color: 'var(--text-primary)'
                          }}
                        >
                          Specs
                        </button>

                        <button
                          onClick={() => {
                            onClose();
                            onOpenOfferModal(item);
                          }}
                          disabled={!isAvailable}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-xs)',
                            background: isAvailable ? 'var(--text-primary)' : 'var(--bg-subtle)',
                            color: isAvailable ? '#FFFFFF' : 'var(--text-muted)',
                            fontSize: '11px',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: isAvailable ? 'pointer' : 'default'
                          }}
                        >
                          <span>{isAvailable ? 'Make Offer' : 'Held'}</span>
                          {isAvailable && <ArrowRight size={11} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              background: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-xs)'
            }}>
              <ShoppingBag size={28} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Your wishlist is empty
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '320px', margin: '0 auto' }}>
                Tap the heart on any item in your society to save it and track price drops or hold updates.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid var(--border-hairline)', paddingTop: '12px', textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{
              padding: '7px 16px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--text-primary)',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 500
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
