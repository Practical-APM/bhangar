import React, { useState } from 'react';
import { X, Video, ShieldCheck, ArrowRight, MessageSquare, Lock, Send, Trash2, CheckCircle2 } from 'lucide-react';
import { ThriftItem, ItemComment, UserProfile, isItemOwner } from '../data/mockData';

interface ItemDetailModalProps {
  item: ThriftItem;
  userTower: string;
  userProfile?: UserProfile;
  comments?: ItemComment[];
  onAddComment?: (itemId: string, text: string) => void;
  onClose: () => void;
  onOpenOfferModal: (item: ThriftItem) => void;
  onOpenSellerOffers?: () => void;
  onDeleteItem?: (itemId: string) => void;
  onUpdateItemStatus?: (itemId: string, status: 'available' | 'held' | 'sold') => void;
  onMarkdownItem?: (itemId: string, newPrice: number) => void;
  onRenewItem?: (itemId: string) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  userTower,
  userProfile,
  comments = [],
  onAddComment,
  onClose,
  onOpenOfferModal,
  onOpenSellerOffers,
  onDeleteItem,
  onUpdateItemStatus,
  onMarkdownItem,
  onRenewItem
}) => {
  const [activeTab, setActiveTab] = useState<'specs' | 'discussion'>('specs');
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [newQuestionText, setNewQuestionText] = useState('');

  const itemComments = comments.filter((c) => c.itemId === item.id);
  const discountPercent = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100);
  const savingsAmount = item.originalPrice - item.price;
  const isSeller = isItemOwner(item, userProfile);

  const getCleanAssembly = (status?: string) => {
    if (!status) return 'Ready to use';
    if (status.includes('Zero assembly') || status.includes('Ready Assembled')) return 'Fully assembled';
    if (status.includes('Flat-pack') || status.includes('Disassembled')) return 'Needs assembly';
    if (status.includes('Plug')) return 'Plug & play';
    return status;
  };

  const getCleanLift = (lift?: string) => {
    if (!lift) return 'Fits in lift';
    if (lift.includes('standard passenger')) return 'Fits in elevator';
    if (lift.includes('Service lift')) return 'Service lift needed';
    if (lift.includes('Hand-carry')) return 'Easy to hand-carry';
    return lift;
  };

  const getCleanCondition = (cond?: string) => {
    if (cond === 'like_new') return 'Like new condition';
    if (cond === 'fixer_upper') return 'Needs repair';
    return 'Gently used';
  };

  const handlePostQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim() || !onAddComment) return;
    onAddComment(item.id, newQuestionText.trim());
    setNewQuestionText('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px', padding: '24px' }}
      >
        {/* Header with Resident Location */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-hairline)',
          paddingBottom: '12px',
          marginBottom: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--text-primary)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {item.seller.alias.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{item.seller.alias}</span>
                <span style={{ fontSize: '10.5px', color: '#166534', background: '#DCFCE7', padding: '1px 6px', borderRadius: 'var(--radius-full)', fontWeight: 500 }}>
                  ✓ {item.seller.tower}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {item.seller.society.split('(')[0].trim()}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              color: 'var(--text-muted)',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s ease, color 0.15s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-subtle)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-hairline)',
          marginBottom: '16px',
          gap: '16px'
        }}>
          <button
            onClick={() => setActiveTab('specs')}
            style={{
              padding: '6px 2px 10px',
              fontSize: '13px',
              fontWeight: activeTab === 'specs' ? 600 : 400,
              color: activeTab === 'specs' ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'specs' ? '2px solid var(--text-primary)' : '2px solid transparent',
              cursor: 'pointer'
            }}
          >
            Item Details & Specs
          </button>
          <button
            onClick={() => setActiveTab('discussion')}
            style={{
              padding: '6px 2px 10px',
              fontSize: '13px',
              fontWeight: activeTab === 'discussion' ? 600 : 400,
              color: activeTab === 'discussion' ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'discussion' ? '2px solid var(--text-primary)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <MessageSquare size={13} />
            <span>Questions</span>
            {itemComments.length > 0 && (
              <span style={{
                background: 'var(--bg-subtle)',
                fontSize: '10.5px',
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
                color: 'var(--text-secondary)'
              }}>
                {itemComments.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'specs' ? (
          <>
            {/* Product Photo Gallery */}
            <div style={{
              position: 'relative',
              width: '100%',
              paddingTop: '68%',
              borderRadius: 'var(--radius-xs)',
              overflow: 'hidden',
              background: 'var(--bg-subtle)',
              marginBottom: item.images.length > 1 ? '8px' : '16px'
            }}>
              <img 
                src={item.images[activeImgIndex] || item.images[0]} 
                alt={item.title}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              {item.hasVideoProof && (
                <div style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  color: 'var(--text-primary)',
                  fontSize: '11px',
                  fontWeight: 500,
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}>
                  <Video size={13} color="#0058A3" />
                  <span>Tested on Video</span>
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {item.images.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {item.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImgIndex(idx)}
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: 'var(--radius-xs)',
                      overflow: 'hidden',
                      border: '2px solid',
                      borderColor: activeImgIndex === idx ? 'var(--text-primary)' : 'transparent',
                      padding: 0,
                      background: 'var(--bg-subtle)',
                      cursor: 'pointer'
                    }}
                  >
                    <img src={img} alt={`Angle ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}

            {/* Title & Price Banner */}
            <div style={{
              background: item.isWanted ? '#FEFDF8' : '#FAF8F5',
              border: `1px solid ${item.isWanted ? '#FDE68A' : '#EBE5DC'}`,
              borderRadius: 'var(--radius-xs)',
              padding: '14px 16px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
                  {item.title}
                </h2>
                {item.isWanted ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#B45309', fontWeight: 600 }}>Max Budget:</span>
                    <span className="tabular-nums" style={{ fontSize: '19px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.price > 0 ? `₹${item.price.toLocaleString('en-IN')}` : 'Flexible'}
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="tabular-nums" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      ₹{item.originalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="tabular-nums" style={{ fontSize: '19px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      ₹{item.price.toLocaleString('en-IN')}
                    </span>
                    <span className="tabular-nums" style={{
                      background: 'var(--ikea-yellow)',
                      color: '#1A1A1A',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '2px'
                    }}>
                      -{discountPercent}%
                    </span>
                  </div>
                )}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {item.isWanted
                  ? '🔍 Neighbor request in your society. If you have this item at home or in storage, message the neighbor directly to arrange elevator handover!'
                  : <>You save <strong className="tabular-nums" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>₹{savingsAmount.toLocaleString('en-IN')}</strong> compared to retail store price.</>}
              </div>
            </div>

            {/* Quick Specs Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              marginBottom: '14px',
              fontSize: '12px'
            }}>
              <div style={{
                background: 'var(--bg-subtle)',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-hairline)'
              }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '10.5px', marginBottom: '2px' }}>Condition</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {getCleanCondition(item.condition)}
                </div>
              </div>

              <div style={{
                background: 'var(--bg-subtle)',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-hairline)'
              }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '10.5px', marginBottom: '2px' }}>Assembly</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {getCleanAssembly(item.assemblyStatus)}
                </div>
              </div>

              <div style={{
                background: 'var(--bg-subtle)',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-hairline)'
              }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '10.5px', marginBottom: '2px' }}>Elevator</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {getCleanLift(item.liftFriendly)}
                </div>
              </div>

              <div style={{
                background: 'var(--bg-subtle)',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-hairline)'
              }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '10.5px', marginBottom: '2px' }}>Pickup Tower</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {item.seller?.tower || 'Direct elevator'}
                </div>
              </div>

              {item.dimensions && !item.dimensions.toLowerCase().includes('standard') && (
                <div style={{
                  gridColumn: 'span 2',
                  background: 'var(--bg-subtle)',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-hairline)'
                }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '10.5px', marginBottom: '2px' }}>Dimensions</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.dimensions}</div>
                </div>
              )}
            </div>

            {/* In-Person Verification & Pickup Note */}
            <div style={{
              padding: '11px 13px',
              borderRadius: '8px',
              border: '1px solid #BBF7D0',
              background: '#F0FDF4',
              fontSize: '12px',
              lineHeight: 1.45,
              color: '#166534',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
              <CheckCircle2 size={15} color="#16A34A" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, color: '#14532D', marginBottom: '2px' }}>
                  In-Person Inspection
                </div>
                <div>
                  Meet {item.seller.alias} at {item.seller.tower} to check the item yourself before taking it. Handover via elevator with zero courier or packing hassle.
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Public Discussion Tab */
          <div style={{ marginBottom: '18px' }}>
            {/* Privacy Clarification Banner */}
            <div style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-xs)',
              padding: '10px 12px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
              <Lock size={14} color="#166534" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                <strong style={{ color: 'var(--text-primary)' }}>Public Q&amp;A:</strong> Questions asked here are visible to everyone in the society. Price offers are private between you and the seller.
              </div>
            </div>

            {/* Comments Stream */}
            <div style={{
              maxHeight: '260px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginBottom: '14px',
              paddingRight: '4px'
            }}>
              {itemComments.length > 0 ? (
                itemComments.map((cmt) => (
                  <div
                    key={cmt.id}
                    style={{
                      background: cmt.isSeller ? '#FAF8F5' : 'var(--bg-surface)',
                      border: '1px solid var(--border-hairline)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '10px 12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {cmt.authorName}
                        </span>
                        <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                          · {cmt.authorTower}
                        </span>
                        {cmt.isSeller && (
                          <span style={{
                            background: 'var(--text-primary)',
                            color: '#FFFFFF',
                            fontSize: '9.5px',
                            fontWeight: 600,
                            padding: '1px 5px',
                            borderRadius: '2px',
                            textTransform: 'uppercase'
                          }}>
                            Seller
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                        {cmt.timestamp}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {cmt.text}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{
                  padding: '24px',
                  textAlign: 'center',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  color: 'var(--text-muted)',
                  fontSize: '12px'
                }}>
                  No questions yet. Ask about dimensions, pickup, or condition!
                </div>
              )}
            </div>

            {/* Post Question Form */}
            <form onSubmit={handlePostQuestion} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Ask a question (e.g. Can we arrange elevator pickup?)..."
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-hairline)',
                  background: 'var(--bg-surface)',
                  fontSize: '12px'
                }}
              />
              <button
                type="submit"
                disabled={!newQuestionText.trim()}
                style={{
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-xs)',
                  background: newQuestionText.trim() ? 'var(--text-primary)' : 'var(--bg-subtle)',
                  color: newQuestionText.trim() ? '#FFFFFF' : 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: newQuestionText.trim() ? 'pointer' : 'default'
                }}
              >
                <Send size={12} />
                <span>Ask</span>
              </button>
            </form>
          </div>
        )}

        {/* Private Offer Action Bar */}
        <div style={{ borderTop: '1px solid var(--border-hairline)', paddingTop: '12px' }}>
          {isSeller ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '8px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                fontSize: '12px'
              }}>
                <span style={{ color: '#475569', fontWeight: 500 }}>
                  Your Listing Status: <strong style={{ color: item.status === 'sold' ? '#059669' : (item.status === 'held' ? '#D97706' : '#2563EB'), textTransform: 'capitalize' }}>{item.status}</strong>
                </span>
                {onUpdateItemStatus && (
                  <button
                    type="button"
                    onClick={() => {
                      const nextStatus = item.status === 'sold' ? 'available' : 'sold';
                      onUpdateItemStatus(item.id, nextStatus);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: item.status === 'sold' ? '#2563EB' : '#059669',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '2px 6px'
                    }}
                  >
                    {item.status === 'sold' ? 'Mark Available' : 'Mark as Sold'}
                  </button>
                )}
              </div>

              {/* Listing Expired Banner */}
              {item.isExpired && (
                <div style={{
                  padding: '9px 12px',
                  background: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  marginBottom: '10px'
                }}>
                  <div style={{ fontSize: '11.5px', color: '#92400E' }}>
                    <strong>Listing Expired (21+ days old)</strong>
                    <div style={{ fontSize: '10.5px', color: '#B45309' }}>Hidden from neighbors until renewed.</div>
                  </div>
                  {onRenewItem && (
                    <button
                      type="button"
                      onClick={() => onRenewItem(item.id)}
                      style={{
                        padding: '5px 10px',
                        background: '#B45309',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 'var(--radius-xs)',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      🔄 Renew for 14 Days
                    </button>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenSellerOffers) onOpenSellerOffers();
                  }}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--text-primary)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  <span>View Offers</span>
                  <ArrowRight size={14} />
                </button>

                {/* 1-Tap Mark as Sold or Reactivate */}
                {onUpdateItemStatus && (
                  item.status === 'sold' ? (
                    <button
                      type="button"
                      onClick={() => onUpdateItemStatus(item.id, 'available')}
                      title="Reactivate listing if deal fell through"
                      style={{
                        padding: '11px 14px',
                        borderRadius: 'var(--radius-xs)',
                        background: '#F1F5F9',
                        color: '#334155',
                        border: '1px solid #CBD5E1',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      <span>Reopen</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onUpdateItemStatus(item.id, 'sold')}
                      title="Mark item as sold to close listing"
                      style={{
                        padding: '11px 14px',
                        borderRadius: 'var(--radius-xs)',
                        background: '#ECFDF5',
                        color: '#059669',
                        border: '1px solid #A7F3D0',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      <CheckCircle2 size={14} />
                      <span>Mark Sold</span>
                    </button>
                  )
                )}

                {onDeleteItem && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Are you sure you want to take down "${item.title}"? It will be removed from Bhangar immediately.`)) {
                        onDeleteItem(item.id);
                        onClose();
                      }
                    }}
                    title="Take down listing permanently"
                    style={{
                      padding: '11px 14px',
                      borderRadius: 'var(--radius-xs)',
                      background: '#FEF2F2',
                      color: '#DC2626',
                      border: '1px solid #FECACA',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Take Down</span>
                  </button>
                )}
              </div>

              {/* Quick Price Drop Button */}
              {onMarkdownItem && item.status === 'available' && (
                <div style={{ marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const discounted = Math.round(item.price * 0.9);
                      if (confirm(`Drop price from ₹${item.price.toLocaleString('en-IN')} to ₹${discounted.toLocaleString('en-IN')} (-10%) to highlight to neighbors?`)) {
                        onMarkdownItem(item.id, discounted);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-xs)',
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      color: '#DC2626',
                      fontSize: '12px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <span>🔥 Drop Price -10% (New: ₹{Math.round(item.price * 0.9).toLocaleString('en-IN')})</span>
                  </button>
                </div>
              )}
            </div>
          ) : item.isWanted ? (
            <div>
              <button
                onClick={() => {
                  const cleanPhone = (item.seller?.phone || '').replace(/[^0-9]/g, '');
                  if (cleanPhone) {
                    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                    const text = `Hi ${item.seller?.alias || item.seller?.name || 'Neighbor'}! I saw your request on Bhangar.Space looking for "${item.title}". I live in ${userTower || 'the society'} and have one available. Let me know if you are interested!`;
                    window.open(`https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(text)}`, '_blank');
                  } else {
                    onClose();
                    onOpenOfferModal(item);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-xs)',
                  background: '#059669',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <span>🤝 I Have This! Chat on WhatsApp</span>
                <ArrowRight size={14} />
              </button>
              <div style={{
                textAlign: 'center',
                fontSize: '11px',
                color: 'var(--text-muted)',
                marginTop: '6px'
              }}>
                💬 Connect directly with {item.seller.alias} on WhatsApp to coordinate
              </div>
            </div>
          ) : (
            <div>
              <button
                onClick={() => {
                  onClose();
                  onOpenOfferModal(item);
                }}
                disabled={item.status === 'held' || item.status === 'sold'}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-xs)',
                  background: item.status === 'sold' || item.status === 'held' ? 'var(--bg-subtle)' : 'var(--text-primary)',
                  color: item.status === 'sold' || item.status === 'held' ? 'var(--text-muted)' : '#FFFFFF',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  border: 'none',
                  cursor: item.status === 'held' || item.status === 'sold' ? 'default' : 'pointer'
                }}
              >
                <MessageSquare size={15} />
                <span>
                  {item.status === 'sold'
                    ? 'Sold Out'
                    : item.status === 'held'
                    ? 'Reserved on Hold'
                    : 'Make an Offer / Chat'}
                </span>
                {item.status !== 'held' && item.status !== 'sold' && <ArrowRight size={14} />}
              </button>
              <div style={{
                textAlign: 'center',
                fontSize: '11px',
                color: 'var(--text-muted)',
                marginTop: '6px'
              }}>
                💬 Connect directly with {item.seller.alias} to agree on price &amp; pickup time
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
