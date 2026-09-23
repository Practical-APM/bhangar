import React, { useState } from 'react';
import { X, ShieldCheck, Sparkles, ArrowRight, Building } from 'lucide-react';
import { SocietyInfo, UserProfile, METRO_SOCIETIES } from '../data/mockData';

interface OnboardingModalProps {
  currentSociety: SocietyInfo;
  userProfile: UserProfile;
  onClose: () => void;
  onSaveProfile: (updated: UserProfile) => void;
  onSelectSociety: (society: SocietyInfo) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  currentSociety,
  userProfile,
  onClose,
  onSaveProfile,
  onSelectSociety
}) => {
  const [name, setName] = useState(userProfile.name || '');
  const [selectedTower, setSelectedTower] = useState(userProfile.tower || currentSociety.towers[0] || 'Tower 1');
  const [flatNumber, setFlatNumber] = useState(userProfile.flatNumber || '802');
  const [selectedSocId, setSelectedSocId] = useState(currentSociety.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const chosenSoc = METRO_SOCIETIES.find((s) => s.id === selectedSocId) || currentSociety;
    if (chosenSoc.id !== currentSociety.id) {
      onSelectSociety(chosenSoc);
    }

    const updated: UserProfile = {
      ...userProfile,
      name: name.trim(),
      tower: selectedTower,
      flatNumber: flatNumber.trim() || '802',
      societyId: chosenSoc.id,
      societyName: chosenSoc.name,
      isVerified: true
    };

    onSaveProfile(updated);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', padding: '24px' }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11px',
              fontWeight: 500,
              color: '#8A6D3B',
              background: '#F5EFE0',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              marginBottom: '6px'
            }}>
              <Sparkles size={11} color="#8A6D3B" />
              <span>10-Second Resident Setup</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Join Bhangar.Space
            </h3>
          </div>
          <button 
            onClick={onClose}
            style={{ color: 'var(--text-muted)', padding: '2px' }}
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '18px' }}>
          Connect with neighbors moving out or shifting in. Sell off what you don't need or grab bargain furniture in under 4 minutes.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Society */}
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Society Hub
            </label>
            <select
              value={selectedSocId}
              onChange={(e) => {
                setSelectedSocId(e.target.value);
                const matched = METRO_SOCIETIES.find((s) => s.id === e.target.value);
                if (matched && matched.towers.length > 0) {
                  setSelectedTower(matched.towers[0]);
                }
              }}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-subtle)',
                background: '#FFFFFF',
                fontSize: '13px'
              }}
            >
              {METRO_SOCIETIES.map((soc) => (
                <option key={soc.id} value={soc.id}>
                  {soc.name} ({soc.city})
                </option>
              ))}
            </select>
          </div>

          {/* Tower & Flat Number */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Your Tower
              </label>
              <select
                value={selectedTower}
                onChange={(e) => setSelectedTower(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)',
                  background: '#FFFFFF',
                  fontSize: '13px'
                }}
              >
                {currentSociety.towers.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Flat Number
              </label>
              <input
                type="text"
                placeholder="e.g. 802"
                value={flatNumber}
                onChange={(e) => setFlatNumber(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)',
                  background: '#FFFFFF',
                  fontSize: '13px'
                }}
              />
            </div>
          </div>

          {/* Resident Name */}
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Your Name or Resident Alias
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sakar M."
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-subtle)',
                background: '#FFFFFF',
                fontSize: '13px'
              }}
            />
          </div>

          {/* Instant Intercom Verification Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            background: '#F0FDF4',
            borderRadius: 'var(--radius-xs)',
            border: '1px solid #BBF7D0',
            fontSize: '11.5px',
            color: '#166534'
          }}>
            <ShieldCheck size={16} color="#16a34a" />
            <span>Instant gatepass & intercom verification active for {selectedTower}.</span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-xs)',
              background: 'var(--text-primary)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '4px'
            }}
          >
            <span>Enter Bhangar.Space</span>
            <ArrowRight size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};
