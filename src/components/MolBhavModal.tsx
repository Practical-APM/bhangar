import React, { useState, useEffect } from 'react';
import { X, Video, Send, Check, Sparkles, ShieldCheck, Lock } from 'lucide-react';
import { ThriftItem, UserProfile, isItemOwner } from '../data/mockData';
import { createOfferInDB } from '../services/api';

interface OfferModalProps {
  item: ThriftItem;
  userTower: string;
  userProfile?: UserProfile;
  onUpdateUserProfile?: (profile: UserProfile) => void;
  onClose: () => void;
  onItemUpdated: (updatedItem: ThriftItem) => void;
}

interface ChatMessage {
  id: string;
  sender: 'buyer' | 'seller' | 'system';
  text: string;
  timestamp: string;
}

export const MolBhavModal: React.FC<OfferModalProps> = ({
  item,
  userTower,
  userProfile,
  onUpdateUserProfile,
  onClose,
  onItemUpdated
}) => {
  const [buyerPhone, setBuyerPhone] = useState(userProfile?.phone || '');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [offerPrice, setOfferPrice] = useState<number>(item.price - 200 > 0 ? item.price - 200 : item.price);
  const [customPrice, setCustomPrice] = useState<string>('');
  const isOwner = isItemOwner(item, userProfile);
  const [negotiationStep, setNegotiationStep] = useState<'offer' | 'counter' | 'agreed' | 'held' | 'completed'>(
    item.status === 'held' ? 'held' : 'offer'
  );

  const [agreedPrice, setAgreedPrice] = useState<number>(item.price);
  const [counterPrice, setCounterPrice] = useState<number>(item.bottomLinePrice);
  const [counterNote, setCounterNote] = useState<string>('');

  // 30-min hold countdown
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30 * 60);
  const [showVideo, setShowVideo] = useState<boolean>(false);

  // In-app coordination chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm2',
      sender: 'seller',
      text: `Hello! I am at ${item.locationNote}. Feel free to make an offer or coordinate inspection.`,
      timestamp: '2:14 PM'
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [privacyAlert, setPrivacyAlert] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (negotiationStep === 'held' && secondsRemaining > 0) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [negotiationStep, secondsRemaining]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleApplyDiscount = (amount: number, isPercent = false) => {
    let target = isPercent ? Math.round(item.price * (1 - amount / 100)) : item.price - amount;
    if (target < 100) target = 100;
    setOfferPrice(target);
    setCustomPrice('');
  };

  const handleSubmitOffer = () => {
    if (isOwner) {
      setPhoneError('You are the seller of this listing. You cannot make an offer to yourself.');
      return;
    }
    const finalAmount = customPrice ? parseInt(customPrice, 10) : offerPrice;
    if (isNaN(finalAmount) || finalAmount <= 0) return;

    if (!buyerPhone.trim()) {
      setPhoneError('Please enter your WhatsApp / mobile number so the seller can coordinate with you.');
      return;
    }
    setPhoneError(null);

    // Save phone to profile if available
    if (userProfile && onUpdateUserProfile && buyerPhone.trim() !== userProfile.phone) {
      onUpdateUserProfile({
        ...userProfile,
        phone: buyerPhone.trim()
      });
    }

    const isAccepted = finalAmount >= item.bottomLinePrice;
    const suggestedCounter = isAccepted ? undefined : Math.round((finalAmount + item.bottomLinePrice) / 2);

    createOfferInDB({
      id: 'off-' + Date.now(),
      itemId: item.id,
      itemTitle: item.title,
      itemImage: item.images[0] || '',
      askingPrice: item.price,
      offeredPrice: finalAmount,
      buyerId: userProfile?.id,
      buyerName: userProfile?.name || `Resident (${userTower})`,
      buyerTower: userTower,
      buyerPhone: buyerPhone.trim(),
      sellerPhone: item.seller.phone || '',
      status: isAccepted ? 'accepted' : 'pending',
      counterPrice: suggestedCounter,
      timestamp: 'Just now',
      buyerNote: 'Offer submitted with direct contact details'
    }).catch((e) => console.warn('[Offer] DB save failed:', e));


    if (isAccepted) {
      setAgreedPrice(finalAmount);
      setNegotiationStep('agreed');
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'buyer',
          text: `Offered ₹${finalAmount.toLocaleString('en-IN')}`,
          timestamp: 'Just now'
        },
        {
          id: (Date.now() + 1).toString(),
          sender: 'seller',
          text: `Offer of ₹${finalAmount.toLocaleString('en-IN')} accepted. You can reserve a 30-minute hold to come and inspect.`,
          timestamp: 'Just now'
        }
      ]);
    } else {
      setCounterPrice(suggestedCounter!);
      setCounterNote(`I can do ₹${suggestedCounter!.toLocaleString('en-IN')} as my bottom-line price.`);
      setNegotiationStep('counter');
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'buyer',
          text: `Offered ₹${finalAmount.toLocaleString('en-IN')}`,
          timestamp: 'Just now'
        },
        {
          id: (Date.now() + 1).toString(),
          sender: 'seller',
          text: `Counter-offer: ₹${suggestedCounter!.toLocaleString('en-IN')}. Let me know if that works.`,
          timestamp: 'Just now'
        }
      ]);
    }
  };

  const handleAcceptCounter = () => {
    setAgreedPrice(counterPrice);
    setNegotiationStep('agreed');
  };

  const handleLockHold = () => {
    setNegotiationStep('held');
    setSecondsRemaining(30 * 60);

    const updated = {
      ...item,
      status: 'held' as const,
      heldBy: userTower
    };
    onItemUpdated(updated);
  };

  const handleConfirmPurchase = () => {
    setNegotiationStep('completed');
    const updated = {
      ...item,
      status: 'sold' as const
    };
    onItemUpdated(updated);
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'system',
        text: `Deal complete: Item marked as sold to ${userTower}. Payment settled via UPI.`,
        timestamp: 'Just now'
      }
    ]);
  };

  const handleReleaseHold = () => {
    const updated = {
      ...item,
      status: 'available' as const,
      heldBy: undefined
    };
    onItemUpdated(updated);
    onClose();
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    let text = chatInput.trim();
    const phoneRegex = /(\+91[\-\s]?)?[6-9]\d{9}|\b\d{5}[\s\-]?\d{5}\b/g;
    const upiRegex = /[a-zA-Z0-9.\-_]{2,256}@(okhdfcbank|okaxis|okicici|oksbi|paytm|ybl|ibl|upi|apl)/gi;

    if (phoneRegex.test(text)) {
      text = text.replace(phoneRegex, '[Phone number masked]');
      setPrivacyAlert('Phone numbers are masked to keep communications private. Coordinate directly in this chat.');
      setTimeout(() => setPrivacyAlert(null), 4000);
    }
    if (upiRegex.test(text)) {
      text = text.replace(upiRegex, '[UPI handle masked]');
      setPrivacyAlert('Payment is made directly in person upon physical inspection.');
      setTimeout(() => setPrivacyAlert(null), 4000);
    }

    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: 'buyer',
        text,
        timestamp: 'Just now'
      }
    ]);
    setChatInput('');

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          sender: 'seller',
          text: "Understood. Let me know when you reach the lobby.",
          timestamp: 'Just now'
        }
      ]);
    }, 1400);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px', padding: '24px' }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {item.title}
            </h3>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Asking ₹{item.price.toLocaleString('en-IN')} · {item.seller.tower}
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ color: 'var(--text-muted)', padding: '2px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Video proof toggle if available */}
        {item.hasVideoProof && (
          <div style={{ marginBottom: '16px' }}>
            <button
              onClick={() => setShowVideo(!showVideo)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                textDecoration: 'underline',
                textUnderlineOffset: '3px'
              }}
            >
              <Video size={13} />
              <span>{showVideo ? 'Hide working video note' : 'View working video note'}</span>
            </button>
            {showVideo && (
              <div style={{
                marginTop: '8px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--bg-subtle)',
                fontSize: '12px',
                color: 'var(--text-secondary)'
              }}>
                {item.videoProofNote}
              </div>
            )}
          </div>
        )}

        {/* Offer Step */}
        {negotiationStep === 'offer' && (
          <div style={{
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-hairline)',
            background: 'var(--bg-subtle)',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Your Proposed Offer</span>
              <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                ₹{(customPrice ? parseInt(customPrice, 10) || 0 : offerPrice).toLocaleString('en-IN')}
              </span>
            </div>

            {/* Quick chips */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <button
                type="button"
                onClick={() => handleApplyDiscount(100)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '12px',
                  background: (!customPrice && offerPrice === item.price - 100) ? 'var(--text-primary)' : 'var(--bg-surface)',
                  color: (!customPrice && offerPrice === item.price - 100) ? '#FFFFFF' : 'var(--text-secondary)',
                  border: '1px solid var(--border-hairline)'
                }}
              >
                -₹100
              </button>
              <button
                type="button"
                onClick={() => handleApplyDiscount(250)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '12px',
                  background: (!customPrice && offerPrice === item.price - 250) ? 'var(--text-primary)' : 'var(--bg-surface)',
                  color: (!customPrice && offerPrice === item.price - 250) ? '#FFFFFF' : 'var(--text-secondary)',
                  border: '1px solid var(--border-hairline)'
                }}
              >
                -₹250
              </button>
              <button
                type="button"
                onClick={() => handleApplyDiscount(15, true)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '12px',
                  background: (!customPrice && offerPrice === Math.round(item.price * 0.85)) ? 'var(--text-primary)' : 'var(--bg-surface)',
                  color: (!customPrice && offerPrice === Math.round(item.price * 0.85)) ? '#FFFFFF' : 'var(--text-secondary)',
                  border: '1px solid var(--border-hairline)'
                }}
              >
                -15%
              </button>
            </div>

            {/* Contact / WhatsApp Number Input */}
            <div style={{ marginBottom: '14px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Your WhatsApp / Mobile Number <span style={{ color: '#059669' }}>*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={buyerPhone}
                onChange={(e) => {
                  setBuyerPhone(e.target.value);
                  setPhoneError(null);
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-xs)',
                  border: phoneError ? '1px solid #DC2626' : '1px solid var(--border-subtle)',
                  background: '#FFFFFF',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
              <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'block', marginTop: '3px' }}>
                🤝 Shared with {item.seller.name} to quickly discuss pickup time and close the deal off-platform.
              </span>
              {phoneError && (
                <span style={{ fontSize: '11px', color: '#DC2626', display: 'block', marginTop: '3px', fontWeight: 500 }}>
                  {phoneError}
                </span>
              )}
            </div>

            {/* Custom Input & Action */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                placeholder="Or custom amount..."
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)',
                  background: '#FFFFFF',
                  fontSize: '13px'
                }}
              />
              <button
                type="button"
                onClick={handleSubmitOffer}
                disabled={isOwner}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-xs)',
                  background: isOwner ? 'var(--bg-subtle)' : 'var(--text-primary)',
                  color: isOwner ? 'var(--text-muted)' : '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: isOwner ? 'not-allowed' : 'pointer'
                }}
              >
                {isOwner ? 'Own Listing' : 'Send Offer'}
              </button>
            </div>
            {isOwner && (
              <div style={{
                marginTop: '10px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-xs)',
                background: '#FEF2F2',
                color: '#B91C1C',
                fontSize: '11.5px',
                fontWeight: 500
              }}>
                ℹ️ You listed this item. You cannot make an offer to yourself.
              </div>
            )}
          </div>
        )}

        {/* Counter Step */}
        {negotiationStep === 'counter' && (
          <div style={{
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-hairline)',
            background: 'var(--bg-subtle)',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
              Counter-Offer: ₹{counterPrice.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              {counterNote}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleAcceptCounter}
                style={{
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--text-primary)',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 500
                }}
              >
                Accept ₹{counterPrice.toLocaleString('en-IN')}
              </button>
              <button
                type="button"
                onClick={() => setNegotiationStep('offer')}
                style={{
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-hairline)',
                  fontSize: '12px',
                  color: 'var(--text-secondary)'
                }}
              >
                Edit Offer
              </button>
            </div>
          </div>
        )}

        {/* Agreed Step */}
        {negotiationStep === 'agreed' && (
          <div style={{
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-hairline)',
            background: 'var(--bg-subtle)',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Price agreed at ₹{agreedPrice.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Lock a 30-minute hold while you walk to {item.seller.tower} to inspect.
            </div>
            <button
              type="button"
              onClick={handleLockHold}
              style={{
                padding: '9px 18px',
                borderRadius: 'var(--radius-xs)',
                background: 'var(--text-primary)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 500
              }}
            >
              Reserve 30-Minute Hold
            </button>

            {/* Direct Seller Contact Card for Indian off-platform handover */}
            <div style={{
              marginTop: '16px',
              padding: '12px 14px',
              background: '#F0FDF4',
              border: '1px solid #A7F3D0',
              borderRadius: 'var(--radius-xs)',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#065F46' }}>
                  📱 Seller Direct Contact
                </span>
                <span style={{ fontSize: '10.5px', color: '#059669', background: '#DCFCE7', padding: '1px 6px', borderRadius: '4px', fontWeight: 500 }}>
                  {item.seller.tower} Verified
                </span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#064E3B', marginBottom: '8px' }}>
                <strong>{item.seller.name}</strong> · {item.seller.phone || '+91 98100 23456'}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={`https://wa.me/${(item.seller.phone || '919810023456').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${item.seller.name}, I made an offer of ₹${agreedPrice} for your "${item.title}" on Bhangar.Space. When can I drop by ${item.seller.tower || 'your tower'} to inspect and pick it up?\n\n(Seller: Once sold, tap to close listing: ${typeof window !== 'undefined' ? window.location.origin : 'https://bhangar.space'}/?action=mark_sold&item=${item.id})`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    padding: '7px 12px',
                    borderRadius: 'var(--radius-xs)',
                    background: '#059669',
                    color: '#FFFFFF',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    textAlign: 'center',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                >
                  <span>Chat on WhatsApp</span>
                </a>
                <a
                  href={`tel:${(item.seller.phone || '+919810023456').replace(/\s/g, '')}`}
                  style={{
                    padding: '7px 12px',
                    borderRadius: 'var(--radius-xs)',
                    background: '#FFFFFF',
                    border: '1px solid #A7F3D0',
                    color: '#065F46',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    textAlign: 'center',
                    textDecoration: 'none'
                  }}
                >
                  Call
                </a>
              </div>
              <div style={{ fontSize: '10.5px', color: '#047857', marginTop: '6px', textAlign: 'center' }}>
                Discuss a time to meet and take the deal forward off-platform.
              </div>
            </div>
          </div>
        )}


        {/* Hold Active */}
        {negotiationStep === 'held' && (
          <div style={{
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--text-primary)',
            background: 'var(--bg-subtle)',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Reserved for Inspection
            </div>
            <div style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.02em', marginBottom: '4px' }}>
              {formatTimer(secondsRemaining)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Meet at {item.locationNote}
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={handleConfirmPurchase}
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
                <span>Mark Handover Complete & Sold</span>
              </button>
              <button
                type="button"
                onClick={handleReleaseHold}
                style={{
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-hairline)',
                  color: 'var(--text-secondary)',
                  fontSize: '12px'
                }}
              >
                Release Hold
              </button>
            </div>
          </div>
        )}

        {/* Completed Step */}
        {negotiationStep === 'completed' && (
          <div style={{
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid #10B981',
            background: '#F0FDF4',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-full)',
              background: '#10B981',
              color: '#FFFFFF',
              marginBottom: '8px'
            }}>
              <Check size={18} />
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#065F46', marginBottom: '4px' }}>
              Handover Complete · Marked Sold
            </div>
            <div style={{ fontSize: '12px', color: '#047857' }}>
              Item claimed by {userTower}. Another piece kept in the community loop!
            </div>
          </div>
        )}

        {/* Modern Residential Chat Box */}
        <div style={{
          border: '1px solid var(--border-hairline)',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          background: 'var(--bg-surface)',
          boxShadow: 'var(--shadow-card)'
        }}>
          {/* Chat Header */}
          <div style={{
            padding: '10px 14px',
            borderBottom: '1px solid var(--border-hairline)',
            background: 'var(--bg-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: 'var(--text-primary)',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {item.seller.alias.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{item.seller.alias}</span>
                  <span style={{ fontSize: '10px', color: '#166534', background: '#DCFCE7', padding: '1px 5px', borderRadius: 'var(--radius-full)', fontWeight: 500 }}>
                    ✓ {item.seller.tower}
                  </span>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '10.5px',
              color: '#166534',
              background: '#DCFCE7',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 500
            }}>
              <Lock size={10} />
              <span>Private Chat & Offers</span>
            </div>
          </div>

          {/* Dedicated Privacy Notice Banner */}
          <div style={{
            padding: '8px 12px',
            fontSize: '11px',
            background: '#F0FDF4',
            color: '#166534',
            borderBottom: '1px solid #DCFCE7',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <ShieldCheck size={13} style={{ flexShrink: 0 }} />
            <span><strong>Privacy Protection:</strong> Phone numbers are kept private. Offers are visible only between you and {item.seller.alias}.</span>
          </div>

          {privacyAlert && (
            <div style={{
              padding: '6px 12px',
              fontSize: '11px',
              background: '#FFFBEB',
              color: '#92400E',
              borderBottom: '1px solid var(--border-hairline)'
            }}>
              {privacyAlert}
            </div>
          )}

          {/* Bubble Message Stream */}
          <div style={{
            padding: '12px 14px',
            height: '140px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            background: '#FAFAFA'
          }}>
            {chatMessages.map((msg) => {
              const isBuyer = msg.sender === 'buyer';
              const isSystem = msg.sender === 'system';

              if (isSystem) {
                return (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: 'center',
                      background: '#FEF3C7',
                      color: '#92400E',
                      fontSize: '10.5px',
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Lock size={10} />
                    <span>{msg.text}</span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  style={{
                    alignSelf: isBuyer ? 'flex-end' : 'flex-start',
                    maxWidth: '82%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isBuyer ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    background: isBuyer ? 'var(--text-primary)' : '#FFFFFF',
                    color: isBuyer ? '#FFFFFF' : 'var(--text-primary)',
                    padding: '8px 12px',
                    borderRadius: isBuyer ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    fontSize: '12.5px',
                    lineHeight: 1.4,
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                    border: isBuyer ? 'none' : '1px solid var(--border-hairline)'
                  }}>
                    {msg.text}
                  </div>
                  <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', marginTop: '2px', padding: '0 4px' }}>
                    {isBuyer ? 'You' : item.seller.alias} · {msg.timestamp}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Refined Pill Message Input */}
          <div style={{ padding: '8px 12px', background: '#FFFFFF', borderTop: '1px solid var(--border-hairline)' }}>
            <form
              onSubmit={handleSendMessage}
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-hairline)',
                borderRadius: 'var(--radius-full)',
                padding: '3px 4px 3px 12px',
                gap: '8px'
              }}
            >
              <input
                type="text"
                placeholder="Coordinate inspection or ask handover time..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: '12px',
                  background: 'transparent'
                }}
              />
              <button
                type="submit"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'var(--text-primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  cursor: 'pointer'
                }}
                title="Send message"
              >
                <Send size={12} />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
