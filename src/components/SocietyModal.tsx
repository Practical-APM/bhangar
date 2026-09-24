import React, { useState } from 'react';
import { X, Building2, Search, PlusCircle, CheckCircle2, MapPin, ArrowRight } from 'lucide-react';
import { SocietyInfo, SocietyRequest } from '../data/mockData';

interface SocietyModalProps {
  currentSociety: SocietyInfo;
  societies: SocietyInfo[];
  onClose: () => void;
  onSelectSociety: (society: SocietyInfo) => void;
  onRequestSociety: (request: SocietyRequest) => void;
}

export const SocietyModal: React.FC<SocietyModalProps> = ({
  currentSociety,
  societies,
  onClose,
  onSelectSociety,
  onRequestSociety
}) => {
  const [activeTab, setActiveTab] = useState<'explore' | 'request'>('explore');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add Society Form State (no pre-filled dummy data)
  const [name, setName] = useState('');
  const [city, setCity] = useState('Gurugram');
  const [locality, setLocality] = useState('');
  const [pincode, setPincode] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedSociety, setSubmittedSociety] = useState<SocietyInfo | null>(null);

  const filteredSocieties = societies.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.area && s.area.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.pincode && s.pincode.includes(searchQuery))
  );

  const handleAddSocietySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newRequest: SocietyRequest = {
      id: `soc-${Date.now()}`,
      name: name.trim(),
      city: city.trim(),
      locality: locality.trim() || undefined,
      pincode: pincode.trim() || undefined,
      towersCount: 0,
      approxFlats: 0,
      applicantRole: 'resident',
      requestedAt: 'Just now'
    };

    onRequestSociety(newRequest);
    
    const createdSoc: SocietyInfo = {
      id: newRequest.id,
      name: newRequest.name,
      city: newRequest.city,
      area: newRequest.locality,
      pincode: newRequest.pincode,
      activeListingsCount: 0,
      residentCount: 0,
      isLive: true,
      towers: []
    };
    
    setSubmittedSociety(createdSoc);
    setSubmitted(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px', padding: '24px' }}
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
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: '#F0FDF4',
              color: '#15803D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building2 size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                Apartment Societies
              </h2>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                Select your residential community or add a new society
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ 
              color: 'var(--text-muted)', 
              padding: '4px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-subtle)',
          padding: '3px',
          borderRadius: '8px',
          marginBottom: '16px',
          border: '1px solid var(--border-hairline)'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('explore')}
            style={{
              flex: 1,
              padding: '7px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: activeTab === 'explore' ? 600 : 500,
              background: activeTab === 'explore' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'explore' ? 'var(--text-primary)' : 'var(--text-muted)',
              border: 'none',
              boxShadow: activeTab === 'explore' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Available Societies ({societies.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('request')}
            style={{
              flex: 1,
              padding: '7px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: activeTab === 'request' ? 600 : 500,
              background: activeTab === 'request' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'request' ? 'var(--text-primary)' : 'var(--text-muted)',
              border: 'none',
              boxShadow: activeTab === 'request' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              transition: 'all 0.15s ease'
            }}
          >
            <PlusCircle size={13} />
            <span>+ Add My Society</span>
          </button>
        </div>

        {/* Tab 1: Available Societies */}
        {activeTab === 'explore' && (
          <div>
            {/* Search Input */}
            <div style={{
              position: 'relative',
              marginBottom: '14px'
            }}>
              <Search size={14} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none'
              }} />
              <input 
                type="text"
                placeholder="Search by society name, locality, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  background: '#FFFFFF',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* List */}
            <div style={{
              maxHeight: '340px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              paddingRight: '2px'
            }}>
              {filteredSocieties.map((soc) => {
                const isSelected = Boolean(currentSociety?.id && soc.id === currentSociety.id);
                return (
                  <div
                    key={soc.id}
                    onClick={() => {
                      onSelectSociety(soc);
                      onClose();
                    }}
                    style={{
                      padding: '11px 14px',
                      borderRadius: '10px',
                      border: isSelected ? '1.5px solid var(--text-primary)' : '1px solid var(--border-hairline)',
                      background: isSelected ? '#FAFAF9' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'border-color 0.15s ease'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {soc.name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <MapPin size={11} />
                          {soc.city}{soc.area ? ` · ${soc.area}` : ''}{soc.pincode ? ` (${soc.pincode})` : ''}
                        </span>
                        {soc.towers && soc.towers.length > 0 && (
                          <>
                            <span>·</span>
                            <span>{soc.towers.length} Towers</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      {isSelected ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#059669',
                          background: '#ECFDF5',
                          padding: '4px 9px',
                          borderRadius: '6px'
                        }}>
                          <CheckCircle2 size={12} color="#059669" />
                          Selected
                        </span>
                      ) : (
                        <button
                          type="button"
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '5px 10px',
                            borderRadius: '6px',
                            background: '#FFFFFF',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer'
                          }}
                        >
                          Switch
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredSocieties.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                  <Building2 size={24} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                  {searchQuery ? (
                    <>
                      <p style={{ fontSize: '13px', margin: '0 0 8px 0' }}>No societies found matching "{searchQuery}"</p>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('request');
                          setName(searchQuery);
                        }}
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-primary)',
                          fontWeight: 600,
                          background: 'none',
                          border: 'none',
                          textDecoration: 'underline',
                          cursor: 'pointer'
                        }}
                      >
                        + Add "{searchQuery}" as a new society
                      </button>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: '13px', margin: '0 0 4px 0', fontWeight: 600, color: 'var(--text-primary)' }}>No societies added yet</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>Be the first to add your society and connect with neighbors.</p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('request')}
                        style={{
                          fontSize: '12px',
                          color: '#FFFFFF',
                          fontWeight: 600,
                          background: 'var(--text-primary)',
                          border: 'none',
                          borderRadius: 'var(--radius-full)',
                          padding: '7px 16px',
                          cursor: 'pointer'
                        }}
                      >
                        + Add My Society
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Bottom helper */}
            <div style={{
              marginTop: '16px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: '#F9FAFB',
              border: '1px solid var(--border-hairline)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                Don't see your society? Add it to start listing items with your neighbors.
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('request')}
                style={{
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  background: 'none',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  cursor: 'pointer'
                }}
              >
                <span>Add Society</span>
                <ArrowRight size={11} />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Add Society */}
        {activeTab === 'request' && (
          <div>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '24px 16px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <CheckCircle2 size={24} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
                  {name} Added!
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '0 0 18px 0', lineHeight: 1.5, maxWidth: '380px', marginInline: 'auto' }}>
                  Your society is now active. You and your neighbors can start listing pre-owned furniture, electronics, and appliances.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (submittedSociety) {
                        onSelectSociety(submittedSociety);
                      }
                      onClose();
                    }}
                    style={{
                      padding: '9px 18px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--text-primary)',
                      color: '#FFFFFF',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Switch to {name}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setActiveTab('explore');
                    }}
                    style={{
                      padding: '9px 16px',
                      borderRadius: 'var(--radius-full)',
                      background: '#FFFFFF',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                      fontSize: '12.5px',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    View All Societies
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAddSocietySubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      Society / Apartment Name *
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. ATS Greens Village, DLF Phase 5, Sobha City"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        City *
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '13px',
                          outline: 'none',
                          background: '#FFFFFF',
                          boxSizing: 'border-box'
                        }}
                      >
                        <option value="Gurugram">Gurugram</option>
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Noida">Noida</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Pune">Pune</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Chennai">Chennai</option>
                        <option value="Kolkata">Kolkata</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        Pincode
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g. 122002"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '13px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      Locality / Area
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. Sector 93A, Golf Course Road, Whitefield"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('explore')}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '8px',
                      background: 'none',
                      border: '1px solid var(--border-hairline)',
                      fontSize: '12.5px',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!name.trim()}
                    style={{
                      padding: '9px 18px',
                      borderRadius: '8px',
                      background: name.trim() ? 'var(--text-primary)' : '#D1D5DB',
                      color: '#FFFFFF',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: name.trim() ? 'pointer' : 'not-allowed',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <PlusCircle size={14} />
                    <span>Add Society</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
