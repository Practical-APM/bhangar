import React, { useState } from 'react';
import { X, Check, ArrowRight, Clock, MessageSquare, Tag, AlertCircle, Trash2 } from 'lucide-react';
import { ThriftItem, SellerOffer, SocietyInfo } from '../data/mockData';

interface SellerOffersModalProps {
  currentSociety: SocietyInfo;
  userTower: string;
  offers: SellerOffer[];
  myItems: ThriftItem[];
  onClose: () => void;
  onAcceptOffer: (offer: SellerOffer) => void;
  onCounterOffer: (offerId: string, counterPrice: number) => void;
  onDeclineOffer: (offerId: string) => void;
  onMarkItemSold: (itemId: string) => void;
  onMarkdownItem: (itemId: string, newPrice: number) => void;
  onDeleteItem?: (itemId: string) => void;
}

export const SellerOffersModal: React.FC<SellerOffersModalProps> = ({
  currentSociety,
  userTower,
  offers,
  myItems,
  onClose,
  onAcceptOffer,
  onCounterOffer,
  onDeclineOffer,
  onMarkItemSold,
  onMarkdownItem,
  onDeleteItem
}) => {
  const [activeTab, setActiveTab] = useState<'offers' | 'listings'>('offers');
  const [counteringOfferId, setCounteringOfferId] = useState<string | null>(null);
  const [counterInputPrice, setCounterInputPrice] = useState<string>('');

  const pendingCount = offers.filter((o) => o.status === 'pending').length;

  const handleStartCounter = (offer: SellerOffer) => {
    setCounteringOfferId(offer.id);
    const suggested = Math.round((offer.askingPrice + offer.offeredPrice) / 2);
    setCounterInputPrice(suggested.toString());
  };

  const handleSendCounter = (offerId: string) => {
    const val = parseInt(counterInputPrice, 10);
    if (!isNaN(val) && val > 0) {
      onCounterOffer(offerId, val);
      setCounteringOfferId(null);
      setCounterInputPrice('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '560px', padding: '24px' }}
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
              {currentSociety.name.split('(')[0].trim()} · {userTower}
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Seller Activity
            </h3>
          </div>
          <button 
            onClick={onClose}
            style={{ color: 'var(--text-muted)', padding: '2px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '18px',
          borderBottom: '1px solid var(--border-hairline)',
          paddingBottom: '10px'
        }}>
          <button
            onClick={() => setActiveTab('offers')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '12.5px',
              fontWeight: activeTab === 'offers' ? 600 : 500,
              background: activeTab === 'offers' ? 'var(--text-primary)' : 'var(--bg-subtle)',
              color: activeTab === 'offers' ? '#FFFFFF' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Neighbor Offers</span>
            {pendingCount > 0 && (
              <span style={{
                background: activeTab === 'offers' ? '#FFFFFF' : '#DC2626',
                color: activeTab === 'offers' ? 'var(--text-primary)' : '#FFFFFF',
                fontSize: '10.5px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)'
              }}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('listings')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '12.5px',
              fontWeight: activeTab === 'listings' ? 600 : 500,
              background: activeTab === 'listings' ? 'var(--text-primary)' : 'var(--bg-subtle)',
              color: activeTab === 'listings' ? '#FFFFFF' : 'var(--text-secondary)'
            }}
          >
            <span>My Active Items ({myItems.length})</span>
          </button>
        </div>

        {/* Tab 1: Incoming Offers */}
        {activeTab === 'offers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {offers.length > 0 ? (
              offers.map((offer) => {
                const diff = offer.askingPrice - offer.offeredPrice;
                return (
                  <div
                    key={offer.id}
                    style={{
                      border: '1px solid var(--border-hairline)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '14px',
                      background: offer.status === 'pending' ? 'var(--bg-surface)' : 'var(--bg-subtle)',
                      boxShadow: offer.status === 'pending' ? '0 1px 4px rgba(0,0,0,0.03)' : 'none'
                    }}
                  >
                    {/* Item & Buyer Header */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <img 
                        src={offer.itemImage} 
                        alt={offer.itemTitle} 
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: 'var(--radius-xs)',
                          objectFit: 'cover',
                          background: 'var(--bg-subtle)'
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Listing: {offer.itemTitle}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {offer.buyerName}
                          </span>
                          <span style={{
                            background: 'var(--ikea-blue-subtle)',
                            color: 'var(--ikea-blue)',
                            fontSize: '10.5px',
                            fontWeight: 500,
                            padding: '1px 6px',
                            borderRadius: '3px'
                          }}>
                            {offer.buyerTower}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>· {offer.timestamp}</span>
                        </div>
                      </div>

                      {/* Offer Amount */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          ₹{offer.offeredPrice.toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Asking ₹{offer.askingPrice.toLocaleString('en-IN')}
                          {diff > 0 && <span style={{ color: '#DC2626', marginLeft: '4px' }}>(-₹{diff})</span>}
                        </div>
                      </div>
                    </div>

                    {/* Buyer Message */}
                    {offer.buyerNote && (
                      <div style={{
                        background: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-xs)',
                        padding: '8px 10px',
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        fontStyle: 'italic',
                        marginBottom: '12px'
                      }}>
                        “{offer.buyerNote}”
                      </div>
                    )}

                    {/* Buyer Direct Contact for WhatsApp / Call */}
                    {offer.buyerPhone && (
                      <div style={{
                        background: '#F0FDF4',
                        border: '1px solid #BBF7D0',
                        borderRadius: 'var(--radius-xs)',
                        padding: '10px 12px',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px' }}>📱</span>
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#065F46' }}>
                              Buyer Contact: {offer.buyerPhone}
                            </div>
                            <div style={{ fontSize: '10.5px', color: '#047857' }}>
                              Connect directly to discuss inspection & elevator handover
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <a
                            href={`https://wa.me/${offer.buyerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${offer.buyerName}, I received your offer of ₹${offer.offeredPrice.toLocaleString('en-IN')} for "${offer.itemTitle}" on Bhangar.Space. When would you like to drop by for inspection?`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '5px 10px',
                              borderRadius: 'var(--radius-xs)',
                              background: '#059669',
                              color: '#FFFFFF',
                              fontSize: '11px',
                              fontWeight: 600,
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <span>WhatsApp</span>
                          </a>
                          <a
                            href={`tel:${offer.buyerPhone.replace(/\s/g, '')}`}
                            style={{
                              padding: '5px 10px',
                              borderRadius: 'var(--radius-xs)',
                              background: '#FFFFFF',
                              border: '1px solid #A7F3D0',
                              color: '#065F46',
                              fontSize: '11px',
                              fontWeight: 600,
                              textDecoration: 'none'
                            }}
                          >
                            Call
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Actions based on Status */}
                    {offer.status === 'pending' && (

                      <div>
                        {counteringOfferId === offer.id ? (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Counter Price: ₹</span>
                            <input
                              type="number"
                              value={counterInputPrice}
                              onChange={(e) => setCounterInputPrice(e.target.value)}
                              style={{
                                width: '100px',
                                padding: '6px 8px',
                                borderRadius: 'var(--radius-xs)',
                                border: '1px solid var(--border-subtle)',
                                fontSize: '13px'
                              }}
                            />
                            <button
                              onClick={() => handleSendCounter(offer.id)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: 'var(--radius-xs)',
                                background: 'var(--text-primary)',
                                color: '#FFFFFF',
                                fontSize: '12px',
                                fontWeight: 500
                              }}
                            >
                              Send Counter
                            </button>
                            <button
                              onClick={() => setCounteringOfferId(null)}
                              style={{
                                padding: '6px 10px',
                                fontSize: '12px',
                                color: 'var(--text-muted)'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => onAcceptOffer(offer)}
                              style={{
                                padding: '7px 14px',
                                borderRadius: 'var(--radius-xs)',
                                background: 'var(--text-primary)',
                                color: '#FFFFFF',
                                fontSize: '12px',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <Check size={13} />
                              <span>Accept & Lock 30-Min Hold</span>
                            </button>

                            <button
                              onClick={() => handleStartCounter(offer)}
                              style={{
                                padding: '7px 12px',
                                borderRadius: 'var(--radius-xs)',
                                border: '1px solid var(--border-hairline)',
                                background: 'var(--bg-surface)',
                                color: 'var(--text-secondary)',
                                fontSize: '12px',
                                fontWeight: 500
                              }}
                            >
                              Counter Offer
                            </button>

                            <button
                              onClick={() => onDeclineOffer(offer.id)}
                              style={{
                                padding: '7px 10px',
                                color: 'var(--text-muted)',
                                fontSize: '12px'
                              }}
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {offer.status === 'accepted' && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        background: '#ECFDF5',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid #A7F3D0',
                        fontSize: '12px',
                        color: '#065F46'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                          <Check size={14} color="#059669" />
                          <span>Accepted! 30-min hold active for {offer.buyerName}</span>
                        </div>
                        <button
                          onClick={() => onMarkItemSold(offer.itemId)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-xs)',
                            background: '#059669',
                            color: '#FFFFFF',
                            fontSize: '11px',
                            fontWeight: 500
                          }}
                        >
                          Mark Paid & Handed Over
                        </button>
                      </div>
                    )}

                    {offer.status === 'countered' && (
                      <div style={{
                        padding: '6px 10px',
                        background: '#FEF3C7',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid #FDE68A',
                        fontSize: '12px',
                        color: '#92400E'
                      }}>
                        Counter-offer of ₹{offer.counterPrice?.toLocaleString('en-IN')} sent to {offer.buyerName}.
                      </div>
                    )}

                    {offer.status === 'declined' && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Offer declined.
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                No active incoming offers right now.
              </div>
            )}
          </div>
        )}

        {/* Tab 2: My Active Items */}
        {activeTab === 'listings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {myItems.length > 0 ? (
              myItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-hairline)',
                    background: 'var(--bg-surface)',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: 'var(--radius-xs)',
                        objectFit: 'cover'
                      }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        ₹{item.price.toLocaleString('en-IN')} · <span style={{
                          color: item.status === 'sold' ? 'var(--text-muted)' : (item.status === 'held' ? '#D97706' : '#059669'),
                          fontWeight: 500
                        }}>
                          {item.status === 'sold' ? 'Sold' : (item.status === 'held' ? 'Reserved on Hold' : 'Live in feed')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {item.status !== 'sold' && (
                      <>
                        <button
                          onClick={() => {
                            const discounted = Math.round(item.price * 0.9);
                            onMarkdownItem(item.id, discounted);
                          }}
                          title="Markdown price by 10% for quick sale"
                          style={{
                            padding: '5px 8px',
                            borderRadius: 'var(--radius-xs)',
                            border: '1px solid var(--border-hairline)',
                            background: 'var(--bg-subtle)',
                            fontSize: '11px',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Tag size={12} />
                          <span>-10%</span>
                        </button>

                        <button
                          onClick={() => onMarkItemSold(item.id)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: 'var(--radius-xs)',
                            background: 'var(--text-primary)',
                            color: '#FFFFFF',
                            fontSize: '11px',
                            fontWeight: 500
                          }}
                        >
                          Mark Sold
                        </button>
                      </>
                    )}

                    {onDeleteItem && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to take down "${item.title}"? This listing will be removed from Bhangar immediately.`)) {
                            onDeleteItem(item.id);
                          }
                        }}
                        title="Take down listing"
                        style={{
                          padding: '5px 8px',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid #FECACA',
                          background: '#FEF2F2',
                          color: '#DC2626',
                          fontSize: '11px',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={12} />
                        <span>Take Down</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                You haven't listed any items in your tower yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
