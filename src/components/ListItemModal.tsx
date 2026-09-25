import React, { useState } from 'react';
import { X, Camera, CheckCircle2, ChevronDown, ChevronUp, Tag, Video, Sparkles } from 'lucide-react';
import { ThriftItem, SocietyInfo, UserProfile, AI_CATALOG, AIDetectionResult, analyzeItemWithAI } from '../data/mockData';
import { analyzeItemWithGemini, isGeminiConfigured } from '../services/ai';
import { compressImageToWebP } from '../utils/imageCompressor';

interface ListItemModalProps {
  currentSociety: SocietyInfo;
  userTower: string;
  userProfile?: UserProfile;
  onUpdateUserProfile?: (profile: UserProfile) => void;
  onClose: () => void;
  onItemAdded: (item: ThriftItem) => void;
}

export const ListItemModal: React.FC<ListItemModalProps> = ({
  currentSociety,
  userTower,
  userProfile,
  onUpdateUserProfile,
  onClose,
  onItemAdded
}) => {
  const [images, setImages] = useState<string[]>([]);
  const [hasVideoProof, setHasVideoProof] = useState<boolean>(false);
  const [sellerPhone, setSellerPhone] = useState<string>(userProfile?.phone || '');
  const [sellerTower, setSellerTower] = useState<string>(userProfile?.tower || userTower || '');


  const [title, setTitle] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [detectedData, setDetectedData] = useState<AIDetectionResult | null>(null);

  const [price, setPrice] = useState<string>('');
  const [originalPrice, setOriginalPrice] = useState<string>('');
  const [condition, setCondition] = useState<'like_new' | 'gently_used' | 'fixer_upper'>('gently_used');
  const [dimensions, setDimensions] = useState<string>('');
  const [assemblyStatus, setAssemblyStatus] = useState<ThriftItem['assemblyStatus']>('Ready Assembled (Zero assembly needed)');
  const [liftFriendly, setLiftFriendly] = useState<ThriftItem['liftFriendly']>('Fits standard passenger lift');
  const [isMovingOut, setIsMovingOut] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  const titlePresets = [
    { label: 'IKEA Markus Chair', title: 'IKEA Markus High-Back Mesh Chair', key: 'chair', img: '/images/chair.jpg' },
    { label: 'Coway Air Purifier', title: 'Coway Airmega 150 HEPA Air Purifier', key: 'air_purifier', img: '/images/air_purifier.jpg' },
    { label: 'Kent RO', title: 'Kent Grand Plus RO+UV Water Purifier', key: 'water_purifier', img: '/images/water_purifier.jpg' },
    { label: 'Dell Monitor', title: 'Dell 27" UltraSharp 4K Monitor', key: 'display', img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80' },
    { label: 'Study Desk', title: 'Solid Sheesham Wood Study & Work Desk', key: 'desk', img: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80' }
  ];

  const runAIAnalysis = async (newTitle: string, presetKey?: string, defaultImg?: string) => {
    setTitle(newTitle);
    setIsAnalyzing(true);
    if (defaultImg && !images.includes(defaultImg)) {
      setImages([defaultImg, ...images.slice(0, 3)]);
    }
    const result = await analyzeItemWithGemini(newTitle, presetKey, defaultImg || images[0]);
    setDetectedData(result);
    setPrice(result.suggestedPrice.toString());
    setOriginalPrice(result.estimatedRetail.toString());
    setCondition(result.condition);
    setDimensions(result.dimensions);
    setAssemblyStatus(result.assemblyStatus);
    setLiftFriendly(result.liftFriendly);
    setIsAnalyzing(false);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (val.trim().length > 3) {
      setIsAnalyzing(true);
      const timer = setTimeout(async () => {
        const result = await analyzeItemWithGemini(val, undefined, images[0]);
        setDetectedData(result);
        setPrice(result.suggestedPrice.toString());
        setOriginalPrice(result.estimatedRetail.toString());
        setCondition(result.condition);
        setDimensions(result.dimensions);
        setAssemblyStatus(result.assemblyStatus);
        setLiftFriendly(result.liftFriendly);
        setIsAnalyzing(false);
      }, 550);
      return () => clearTimeout(timer);
    }
  };

  const handleMultipleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsAnalyzing(true);
    try {
      const validFiles = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, 4);
      const compressedList = await Promise.all(
        validFiles.map((f) => compressImageToWebP(f, { maxDimension: 1200, quality: 0.82 }))
      );
      setImages((prev) => [...compressedList, ...prev].slice(0, 6));
      if (title.trim()) {
        runAIAnalysis(title);
      } else {
        setIsAnalyzing(false);
      }
    } catch (err) {
      console.warn('[ImageUpload] Notice processing images:', err);
      setIsAnalyzing(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) return;

    const asking = parseInt(price, 10);
    const orig = originalPrice ? parseInt(originalPrice, 10) : asking * 2;
    const randomArt = `${Math.floor(100 + Math.random() * 900)}.${Math.floor(100 + Math.random() * 900)}.${Math.floor(10 + Math.random() * 90)}`;
    const category = detectedData ? detectedData.category : 'furniture';
    const roomType = detectedData ? detectedData.roomType : 'living';
    const finalTower = sellerTower.trim() || userTower || 'Tower 1';

    if (userProfile && onUpdateUserProfile) {
      const phoneChanged = sellerPhone.trim() && sellerPhone.trim() !== userProfile.phone;
      const towerChanged = finalTower !== userProfile.tower;
      if (phoneChanged || towerChanged) {
        onUpdateUserProfile({
          ...userProfile,
          phone: sellerPhone.trim() || userProfile.phone,
          tower: finalTower
        });
      }
    }

    const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? `listing_${crypto.randomUUID()}`
      : `listing_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const newItem: ThriftItem = {
      id: uniqueId,
      articleNumber: randomArt,
      ikeaStyleName: `${title.split(' ')[0].toUpperCase()} / ${category}`,
      title: title.trim(),
      category,
      roomType,
      price: asking,
      originalPrice: orig,
      condition,
      conditionLabel: condition === 'fixer_upper' ? 'Needs Repair' : (condition === 'like_new' ? 'Like New' : 'Gently Used'),
      dimensions: dimensions.trim() || 'Standard size',
      assemblyStatus,
      liftFriendly,
      inspectionNote: 'Available for inspection at pickup in residential tower.',
      description: `Listed in ${currentSociety.name.split('(')[0].trim()}. Direct resident pickup from ${finalTower}.`,
      aspectRatio: '3/4',
      savesCount: 0,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'],
      hasVideoProof,
      videoProofNote: hasVideoProof ? 'Video of working condition available' : undefined,
      sellerId: userProfile?.id,
      seller: {
        name: userProfile?.name || `Resident (${finalTower})`,
        alias: userProfile?.name || `Resident (${finalTower})`,
        tower: finalTower,
        phone: sellerPhone.trim() || userProfile?.phone,
        society: currentSociety.name,
        city: currentSociety.city,
        verifiedResident: true,
        rating: userProfile?.rating || 5.0,
        dealsCompleted: userProfile?.dealsCompleted || 0,
        responseTime: '< 10 mins'
      },
      locationNote: `${currentSociety.name.split('(')[0].trim()} · Pickup from ${finalTower}`,
      isMovingOut,
      bottomLinePrice: Math.round(asking * 0.85),
      status: 'available',
      tags: detectedData?.tags || ['#BhangarSpace', `#${category}`],
      listedAgo: 'Just now'
    };

    onItemAdded(newItem);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px', padding: '24px' }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '20px',
          borderBottom: '1px solid var(--border-hairline)',
          paddingBottom: '14px'
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 3px', letterSpacing: '-0.025em' }}>
              Sell Something
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
              Free to list · Buyers come to you
            </p>
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
              marginTop: '-4px',
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

        {/* Photos */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Photos
            </label>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              First photo is the cover
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            marginBottom: '10px'
          }}>
            {images.map((img, idx) => (
              <div
                key={idx}
                style={{
                  position: 'relative',
                  aspectRatio: '1',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: idx === 0 ? '2px solid var(--text-primary)' : '1px solid var(--border-hairline)',
                  background: '#F3F4F6'
                }}
              >
                <img src={img} alt={`Photo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {idx === 0 && (
                  <span style={{
                    position: 'absolute', bottom: '3px', left: '3px',
                    background: 'rgba(0,0,0,0.72)', color: '#FFFFFF',
                    fontSize: '9px', fontWeight: 600,
                    padding: '1px 5px', borderRadius: '4px'
                  }}>
                    Cover
                  </span>
                )}
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    style={{
                      position: 'absolute', top: '3px', right: '3px',
                      width: '18px', height: '18px',
                      borderRadius: '50%',
                      background: 'rgba(0,0,0,0.6)',
                      color: '#FFFFFF', border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            ))}

            {images.length < 6 && (
              <label style={{
                aspectRatio: '1',
                borderRadius: '10px',
                border: '1.5px dashed var(--border-subtle)',
                background: 'var(--bg-subtle)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}>
                <Camera size={16} color="var(--text-muted)" />
                <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)' }}>Add</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleMultipleFilesUpload}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>

          {/* Video toggle — simple, no jargon */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 10px',
            background: hasVideoProof ? '#F0FDF4' : 'var(--bg-subtle)',
            borderRadius: '10px',
            border: `1px solid ${hasVideoProof ? '#A7F3D0' : 'var(--border-hairline)'}`,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}>
            <input
              type="checkbox"
              checked={hasVideoProof}
              onChange={(e) => setHasVideoProof(e.target.checked)}
              style={{ accentColor: '#059669' }}
            />
            <Video size={13} color={hasVideoProof ? '#059669' : 'var(--text-muted)'} />
            <span style={{ fontSize: '12px', fontWeight: 500, color: hasVideoProof ? '#047857' : 'var(--text-secondary)' }}>
              {hasVideoProof ? 'I have a short video showing it works' : 'Add a short video (optional)'}
            </span>
          </label>
        </div>

        {/* Item name */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
            What are you selling?
          </label>
          <input
            type="text"
            required
            placeholder="e.g. IKEA office chair, Coway air purifier…"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              fontSize: '13.5px',
              fontWeight: 500,
              outline: 'none',
              background: '#FFFFFF',
              boxSizing: 'border-box',
            }}
          />

          {/* Quick-fill chips */}
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '8px' }}>
            {titlePresets.map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => runAIAnalysis(preset.title, preset.key, preset.img)}
                style={{
                  padding: '3px 9px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-hairline)',
                  background: title === preset.title ? 'var(--text-primary)' : 'var(--bg-canvas)',
                  color: title === preset.title ? '#FFFFFF' : 'var(--text-secondary)',
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Smart suggestions status */}
        <div style={{
          marginBottom: '16px',
          padding: '10px 12px',
          borderRadius: '10px',
          background: isAnalyzing ? '#FFFBEB' : (detectedData ? '#F0FDF4' : 'var(--bg-subtle)'),
          border: `1px solid ${isAnalyzing ? '#FDE68A' : (detectedData ? '#BBF7D0' : 'var(--border-hairline)')}`,
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
        }}>
          {isAnalyzing ? (
            <Sparkles size={13} color="#D97706" />
          ) : detectedData ? (
            <CheckCircle2 size={13} color="#16A34A" />
          ) : (
            <Sparkles size={13} color="var(--text-muted)" />
          )}
          <span style={{ fontSize: '11.5px', fontWeight: 500, color: isAnalyzing ? '#92400E' : (detectedData ? '#166534' : 'var(--text-muted)'), flex: 1 }}>
            {isAnalyzing 
              ? (isGeminiConfigured() ? 'Gemini AI analyzing item…' : 'Filling in details…') 
              : detectedData
                ? (isGeminiConfigured() ? 'Valuation & specs auto-filled by Gemini' : 'Price and details auto-filled')
                : (isGeminiConfigured() ? 'Type a title or pick a preset to estimate price with Gemini' : 'Enter what you\'re selling to auto-estimate price')}
          </span>
          {detectedData && (
            <span style={{ fontSize: '10px', fontWeight: 600, color: isAnalyzing ? '#B45309' : '#15803D', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isGeminiConfigured() ? 'Gemini · ' : ''}{detectedData.category}
            </span>
          )}
          {!isAnalyzing && detectedData && (
            <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {(detectedData.tags || []).slice(0, 4).map((t, idx) => (
                <span key={idx} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '3px',
                  fontSize: '10.5px', padding: '2px 7px',
                  borderRadius: 'var(--radius-full)',
                  background: '#DCFCE7', color: '#14532D', fontWeight: 500,
                }}>
                  <Tag size={9} />{t}
                </span>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Price */}
          <div style={{
            background: '#FAF8F5',
            border: '1px solid #EBE5DC',
            borderRadius: '10px',
            padding: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Your asking price (₹)
              </label>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {originalPrice && !isNaN(parseInt(originalPrice, 10))
                  ? `Retail: ₹${parseInt(originalPrice, 10).toLocaleString('en-IN')}`
                  : 'Estimated retail price'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="number"
                required
                placeholder="e.g. 2500"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  background: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: 700,
                  outline: 'none',
                  letterSpacing: '-0.02em',
                }}
              />
              {detectedData?.pricePresets && detectedData.pricePresets.length > 0 && (
                <div style={{ display: 'flex', gap: '4px' }}>
                  {detectedData.pricePresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPrice(preset.toString())}
                      style={{
                        padding: '6px 9px',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: price === preset.toString() ? 'var(--text-primary)' : 'var(--border-hairline)',
                        background: price === preset.toString() ? 'var(--text-primary)' : '#FFFFFF',
                        color: price === preset.toString() ? '#FFFFFF' : 'var(--text-secondary)',
                        fontSize: '11px', fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      ₹{preset.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price Anchor Psychology Nudge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '9px',
              fontSize: '11px',
              color: '#78716C',
              lineHeight: 1.4
            }}>
              <span style={{ fontSize: '12px' }}>💡</span>
              <span>Items priced at 30%–50% of retail usually sell within 48 hours to neighbors.</span>
            </div>
          </div>

          {/* Seller Pickup & Contact Details */}
          <div style={{
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {/* Tower / Block / Floor */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#166534' }}>
                  Pickup Tower / Block / Floor
                </label>
                <span style={{ fontSize: '10.5px', color: '#15803D', fontWeight: 500 }}>
                  Elevator pickup
                </span>
              </div>
              <input
                type="text"
                placeholder="e.g. Tower C, 4th Floor or Block 2"
                value={sellerTower}
                onChange={(e) => setSellerTower(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #A7F3D0',
                  background: '#FFFFFF',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Seller WhatsApp / Contact Number */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#166534' }}>
                  Your WhatsApp / Mobile Number <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <span style={{ fontSize: '10.5px', color: '#15803D', fontWeight: 500 }}>
                  Shared upon offer
                </span>
              </div>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={sellerPhone}
                onChange={(e) => setSellerPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #A7F3D0',
                  background: '#FFFFFF',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <span style={{ fontSize: '10.5px', color: '#15803D', display: 'block', lineHeight: 1.35 }}>
              🤝 Shared with neighbors when an offer is made so you can coordinate elevator inspection and handover off-platform.
            </span>
          </div>

          {/* Moving out toggle */}
          <label style={{

            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12.5px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={isMovingOut}
              onChange={(e) => setIsMovingOut(e.target.checked)}
              style={{ accentColor: '#1A1A1A' }}
            />
            <span>I'm moving out and need this gone quickly</span>
          </label>

          {/* Optional: more details toggle */}
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              background: 'none',
              border: 'none',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              cursor: 'pointer',
              padding: 0,
              alignSelf: 'flex-start',
            }}
          >
            {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            <span>{showDetails ? 'Fewer options' : 'Add more details (optional)'}</span>
          </button>

          {showDetails && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              padding: '12px',
              background: 'var(--bg-subtle)',
              borderRadius: '10px',
              border: '1px solid var(--border-hairline)',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Condition
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    style={{ width: '100%', padding: '7px 8px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '12px', background: '#FFFFFF' }}
                  >
                    <option value="like_new">Like New</option>
                    <option value="gently_used">Gently Used</option>
                    <option value="fixer_upper">Needs Some Repair</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Can it fit in the elevator?
                  </label>
                  <select
                    value={liftFriendly}
                    onChange={(e) => setLiftFriendly(e.target.value as any)}
                    style={{ width: '100%', padding: '7px 8px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '12px', background: '#FFFFFF' }}
                  >
                    <option value="Fits standard passenger lift">Yes, fits in lift</option>
                    <option value="Service lift recommended">Service lift needed</option>
                    <option value="Hand-carry 1 person">Hand carry only</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Size / Dimensions (optional)
                </label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  style={{ width: '100%', padding: '7px 8px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '12px', background: '#FFFFFF' }}
                />
              </div>
            </div>
          )}

          {/* Publish */}
          <button
            type="submit"
            style={{
              marginTop: '2px',
              padding: '13px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--text-primary)',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '-0.02em',
            }}
          >
            Publish Listing
          </button>
        </form>
      </div>
    </div>
  );
};
