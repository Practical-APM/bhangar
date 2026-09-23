import React, { useState } from 'react';
import { X, Building2, Search, PlusCircle, CheckCircle2, Users, MapPin, Sparkles, ArrowRight } from 'lucide-react';
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
  
  // Request Society Form State
  const [name, setName] = useState('');
  const [city, setCity] = useState('Gurugram');
  const [locality, setLocality] = useState('');
  const [pincode, setPincode] = useState('');
  const [towersCount, setTowersCount] = useState('6');
  const [flatsCount, setFlatsCount] = useState('800');
  const [userRole, setUserRole] = useState<'owner' | 'tenant' | 'rwa' | 'enthusiast'>('owner');
  const [shareWhatsApp, setShareWhatsApp] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const filteredSocieties = societies.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.pincode && s.pincode.includes(searchQuery))
  );

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newRequest: SocietyRequest = {
      id: `req-${Date.now()}`,
      name: name.trim(),
      city: city.trim(),
      locality: locality.trim() || undefined,
      pincode: pincode.trim() || undefined,
      towersCount: parseInt(towersCount, 10) || 4,
      approxFlats: parseInt(flatsCount, 10) || 500,
      applicantRole: userRole,
      requestedAt: 'Just now'
    };

    onRequestSociety(newRequest);
    setSubmitted(true);
  };

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
              borderRadius: 'var(--radius-xs)',
              background: '#F0FDF4',
              color: '#15803D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building2 size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Society Hub & Campus Directory
              </h2>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Zero-transit hyperlocal circular trading within gated complexes
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ color: 'var(--text-muted)', padding: '4px' }}
            aria-label="Close society modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-subtle)',
          padding: '3px',
          borderRadius: 'var(--radius-xs)',
          marginBottom: '16px',
          border: '1px solid var(--border-hairline)'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('explore')}
            style={{
              flex: 1,
              padding: '7px 12px',
              borderRadius: 'calc(var(--radius-xs) - 2px)',
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
            Live Societies ({societies.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('request')}
            style={{
              flex: 1,
              padding: '7px 12px',
              borderRadius: 'calc(var(--radius-xs) - 2px)',
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
            <span>+ Add / Request My Society</span>
          </button>
        </div>

        {/* Tab 1: Live Societies */}
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
                color: 'var(--text-muted)'
              }} />
              <input 
                type="text"
                placeholder="Search by society name, city or pincode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-canvas)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            {/* List */}
            <div style={{
              maxHeight: '340px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              paddingRight: '4px'
            }}>
              {filteredSocieties.map((soc) => {
                const isSelected = soc.id === currentSociety.id;
                return (
                  <div
                    key={soc.id}
                    onClick={() => {
                      onSelectSociety(soc);
                      onClose();
                    }}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-xs)',
                      border: isSelected ? '1.5px solid var(--text-primary)' : '1px solid var(--border-hairline)',
                      background: isSelected ? '#FAFAF9' : 'var(--bg-canvas)',
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
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '10px',
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-full)',
                          background: '#ECFDF5',
                          color: '#047857',
                          fontWeight: 500
                        }}>
                          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10B981' }} />
                          Live Hub
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <MapPin size={11} />
                          {soc.city} {soc.pincode ? `(${soc.pincode})` : ''}
                        </span>
                        <span>·</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Users size={11} />
                          {soc.residentCount || 1200}+ residents
                        </span>
                        <span>·</span>
                        <span>{soc.towers.length} Towers</span>
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
                          color: 'var(--text-primary)',
                          background: '#E5E7EB',
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-xs)'
                        }}>
                          <CheckCircle2 size={12} />
                          Active
                        </span>
                      ) : (
                        <button
                          type="button"
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '5px 10px',
                            borderRadius: 'var(--radius-xs)',
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
                  <p style={{ fontSize: '13px', margin: '0 0 8px 0' }}>No societies found for "{searchQuery}"</p>
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
                    + Request to add "{searchQuery}" as a beta society
                  </button>
                </div>
              )}
            </div>

            {/* Bottom info banner */}
            <div style={{
              marginTop: '16px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-xs)',
              background: '#F9FAFB',
              border: '1px solid var(--border-hairline)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Don't see your residential society? Launch Bhangar.Space in your high-rise today.
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('request')}
                style={{
                  fontSize: '11px',
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

        {/* Tab 2: Request / Add Society */}
        {activeTab === 'request' && (
          <div>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '28px 16px' }}>
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
                  {name} registered for Beta Launch!
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 16px 0', lineHeight: 1.5, maxWidth: '380px', marginInline: 'auto' }}>
                  Your society is added to your active hubs. Share Bhangar.Space with your tower neighbors to buy & sell cheap moving setups with zero packing!
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Hey neighbors! Check out Bhangar.Space (BS) for our society (${name}). Moving in? Buy cheap furniture & electronics from neighbors. Moving out? Sell off your setup in 24h before moving day with zero packaging! Browse here: https://bhangar.space`)}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-full)',
                      background: '#25D366',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(37, 211, 102, 0.25)'
                    }}
                  >
                    <span>Share on WhatsApp Group</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setActiveTab('explore');
                    }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--text-primary)',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    View Societies List
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit}>
                <div style={{
                  marginBottom: '12px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-xs)',
                  background: '#F0F9FF',
                  border: '1px solid #BAE6FD',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Sparkles size={14} color="#0284C7" />
                  <span style={{ fontSize: '11px', color: '#0369A1', lineHeight: 1.4 }}>
                    <strong>PM Beta Access:</strong> Registered societies get instant access with automatic tower routing for zero-transit handovers in lift lobbies.
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>
                      Society / Condominium Name *
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Sobha City, DLF The Aralias, Pebble Bay"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-xs)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '12px',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>
                        City *
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '12px',
                          outline: 'none',
                          background: '#FFFFFF'
                        }}
                      >
                        <option value="Gurugram">Gurugram</option>
                        <option value="Bengaluru">Bengaluru</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Pune">Pune</option>
                        <option value="Noida">Noida</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Chennai">Chennai</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>
                        Locality / Sector
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g. Sector 108 / Whitefield"
                        value={locality}
                        onChange={(e) => setLocality(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '12px',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>
                        Towers Count
                      </label>
                      <input 
                        type="number"
                        min="1"
                        max="50"
                        value={towersCount}
                        onChange={(e) => setTowersCount(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '12px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>
                        Approx. Flats
                      </label>
                      <input 
                        type="number"
                        min="10"
                        max="10000"
                        value={flatsCount}
                        onChange={(e) => setFlatsCount(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '12px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>
                        Pincode
                      </label>
                      <input 
                        type="text"
                        placeholder="122001"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '12px',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px' }}>
                      Your Role in this Society
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                      {[
                        { id: 'owner', label: 'Flat Owner' },
                        { id: 'tenant', label: 'Resident Tenant' },
                        { id: 'rwa', label: 'RWA / Admin' },
                        { id: 'enthusiast', label: 'Volunteer' }
                      ].map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setUserRole(r.id as any)}
                          style={{
                            padding: '6px 4px',
                            borderRadius: 'var(--radius-xs)',
                            fontSize: '11px',
                            fontWeight: userRole === r.id ? 600 : 400,
                            border: userRole === r.id ? '1.5px solid var(--text-primary)' : '1px solid var(--border-hairline)',
                            background: userRole === r.id ? '#FAFAF9' : '#FFFFFF',
                            cursor: 'pointer'
                          }}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '4px' }}>
                    <input 
                      type="checkbox"
                      checked={shareWhatsApp}
                      onChange={(e) => setShareWhatsApp(e.target.checked)}
                      style={{ accentColor: '#1A1A1A' }}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      I can share this beta with our tower/society WhatsApp group to seed listings
                    </span>
                  </label>
                </div>

                <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('explore')}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-xs)',
                      background: 'none',
                      border: '1px solid var(--border-hairline)',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!name.trim()}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-xs)',
                      background: name.trim() ? 'var(--text-primary)' : '#9CA3AF',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: name.trim() ? 'pointer' : 'not-allowed',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <PlusCircle size={13} />
                    <span>Launch Beta Hub</span>
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
