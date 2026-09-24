import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  Building2, 
  CheckCircle2, 
  Search, 
  Filter, 
  Download, 
  ArrowLeft, 
  LogOut, 
  Lock, 
  Mail, 
  ShieldCheck, 
  RefreshCw, 
  Phone, 
  MapPin, 
  Trash2, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  SlidersHorizontal,
  Cpu,
  Database,
  HardDrive,
  Activity,
  Zap,
  Check,
  AlertCircle,
  Clock,
  Layers,
  Camera,
  Coins
} from 'lucide-react';
import { ThriftItem, SellerOffer, ItemComment, SocietyInfo, UserProfile } from '../data/mockData';
import { getAIResourceStats, clearAIUsageHistory, testGeminiConnection } from '../services/ai';
import { isSupabaseConfigured } from '../lib/supabase';

interface AdminDashboardProps {
  items: ThriftItem[];
  societies: SocietyInfo[];
  offers: SellerOffer[];
  comments: ItemComment[];
  userProfile: UserProfile;
  onBackToStorefront: () => void;
  onUpdateItemStatus?: (itemId: string, status: 'available' | 'held' | 'sold') => void;
  onDeleteItem?: (itemId: string) => void;
  onApproveSociety?: (society: SocietyInfo) => void;
  onRefreshData?: () => void;
}

const ADMIN_EMAIL = 'duskiflake@gmail.com';
const ADMIN_PASS = 'Prrs_@_4989.';

type AdminTab = 'overview' | 'supply' | 'demand' | 'residents' | 'societies' | 'resources';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  items,
  societies,
  offers,
  comments,
  userProfile,
  onBackToStorefront,
  onUpdateItemStatus,
  onDeleteItem,
  onRefreshData
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('bhangar_admin_auth') === 'true' || 
             localStorage.getItem('bhangar_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  // Dashboard Filters & Tabs
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // AI Telemetry & Testing State
  const [aiStats, setAiStats] = useState(() => getAIResourceStats());
  const [isTestingPing, setIsTestingPing] = useState(false);
  const [pingResult, setPingResult] = useState<{ success: boolean; latencyMs: number; message: string; tokens?: number } | null>(null);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (emailInput.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && passwordInput === ADMIN_PASS) {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem('bhangar_admin_auth', 'true');
        if (rememberMe) {
          localStorage.setItem('bhangar_admin_auth', 'true');
        }
      } catch {}
    } else {
      setAuthError('Invalid credentials. Please verify your admin username and password.');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('bhangar_admin_auth');
      localStorage.removeItem('bhangar_admin_auth');
    } catch {}
  };

  // Handle Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (onRefreshData) {
      await onRefreshData();
    }
    setAiStats(getAIResourceStats());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Handle Live Gemini Connection Ping
  const handleTestGeminiPing = async () => {
    setIsTestingPing(true);
    setPingResult(null);
    try {
      const res = await testGeminiConnection();
      setPingResult(res);
      setAiStats(getAIResourceStats());
    } catch (err: any) {
      setPingResult({ success: false, latencyMs: 0, message: err.message || 'Ping failed' });
    } finally {
      setIsTestingPing(false);
    }
  };

  // Clear AI Telemetry History
  const handleClearTelemetry = () => {
    if (confirm('Clear local AI telemetry logs? Call counts and latency logs will be reset.')) {
      clearAIUsageHistory();
      setAiStats(getAIResourceStats());
      setPingResult(null);
    }
  };

  // Filtered Items by City
  const scopedItems = useMemo(() => {
    if (selectedCity === 'all') return items;
    return items.filter(it => it.seller.city?.toLowerCase() === selectedCity.toLowerCase());
  }, [items, selectedCity]);

  // Client Storage Memory Footprint
  const storageUsageKB = useMemo(() => {
    try {
      let total = 0;
      for (let x in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, x)) {
          total += (localStorage[x].length * 2);
        }
      }
      return Math.round(total / 1024);
    } catch {
      return 0;
    }
  }, [items, offers, comments, aiStats]);

  // Image Resource Breakdown
  const imageTelemetry = useMemo(() => {
    let totalImages = 0;
    let base64Images = 0;
    let remoteImages = 0;
    scopedItems.forEach(it => {
      (it.images || []).forEach(img => {
        totalImages++;
        if (img.startsWith('data:image')) {
          base64Images++;
        } else {
          remoteImages++;
        }
      });
    });
    return { totalImages, base64Images, remoteImages };
  }, [scopedItems]);

  // PURE PRODUCT METRICS (Zero Vanity, Zero Ego, Computed Strictly from Live DB State)
  const metrics = useMemo(() => {
    const totalListings = scopedItems.length;
    const activeListings = scopedItems.filter(it => it.status === 'available').length;
    const soldListings = scopedItems.filter(it => it.status === 'sold').length;
    const heldListings = scopedItems.filter(it => it.status === 'held').length;

    const totalListedGMV = scopedItems.reduce((acc, it) => acc + (it.price || 0), 0);
    const soldGMV = scopedItems.filter(it => it.status === 'sold').reduce((acc, it) => acc + (it.price || 0), 0);
    const averagePrice = totalListings > 0 ? Math.round(totalListedGMV / totalListings) : 0;

    // Median price
    const sortedPrices = [...scopedItems].map(it => it.price || 0).sort((a, b) => a - b);
    const medianPrice = sortedPrices.length > 0 
      ? sortedPrices[Math.floor(sortedPrices.length / 2)] 
      : 0;

    // Sell-Through Rate (STR): strictly (sold / total)
    const sellThroughRate = totalListings > 0 ? Math.round((soldListings / totalListings) * 100) : 0;

    // Marketplace Liquidity: listings with real buyer interaction (offers or comments or marked sold)
    const itemsWithOffers = new Set(offers.map(o => o.itemId));
    const itemsWithComments = new Set(comments.map(c => c.itemId));
    const engagedItemsCount = scopedItems.filter(it => 
      itemsWithOffers.has(it.id) || itemsWithComments.has(it.id) || it.status === 'sold'
    ).length;
    const liquidityRate = totalListings > 0 ? Math.round((engagedItemsCount / totalListings) * 100) : 0;

    // Offers & MolBhav Funnel
    const totalOffers = offers.length;
    const acceptedOffers = offers.filter(o => o.status === 'accepted').length;
    const counteredOffers = offers.filter(o => o.status === 'countered').length;
    const declinedOffers = offers.filter(o => o.status === 'declined').length;
    const offerAcceptanceRate = totalOffers > 0 ? Math.round((acceptedOffers / totalOffers) * 100) : 0;

    // Real negotiation discount depth requested by buyers in MolBhav
    const discounts = offers
      .filter(o => o.askingPrice && o.offeredPrice && o.askingPrice > 0)
      .map(o => Math.round(((o.askingPrice - o.offeredPrice) / o.askingPrice) * 100));
    const avgDiscountRequested = discounts.length > 0 
      ? Math.round(discounts.reduce((a, b) => a + b, 0) / discounts.length) 
      : 0;

    // Verification & Quality Metrics
    const itemsWithImages = scopedItems.filter(it => it.images && it.images.length > 0).length;
    const imageCoverageRate = totalListings > 0 ? Math.round((itemsWithImages / totalListings) * 100) : 0;

    const itemsWithPhone = scopedItems.filter(it => it.seller?.phone && it.seller.phone.trim().length > 0).length;
    const phoneCaptureRate = totalListings > 0 ? Math.round((itemsWithPhone / totalListings) * 100) : 0;

    // Category Distribution
    const categoryCounts: Record<string, { count: number; gmv: number }> = {};
    scopedItems.forEach(it => {
      const cat = it.category || 'other';
      if (!categoryCounts[cat]) categoryCounts[cat] = { count: 0, gmv: 0 };
      categoryCounts[cat].count += 1;
      categoryCounts[cat].gmv += it.price || 0;
    });

    // Society Density
    const societyCounts: Record<string, number> = {};
    scopedItems.forEach(it => {
      const soc = it.seller.society || 'Independent';
      societyCounts[soc] = (societyCounts[soc] || 0) + 1;
    });

    // AI Unit Economics (INR cost per listing created)
    const aiCostPerListing = totalListings > 0 
      ? (aiStats.totalCostINR / totalListings).toFixed(3) 
      : '0.000';

    return {
      totalListings,
      activeListings,
      soldListings,
      heldListings,
      totalListedGMV,
      soldGMV,
      averagePrice,
      medianPrice,
      sellThroughRate,
      liquidityRate,
      totalOffers,
      acceptedOffers,
      counteredOffers,
      declinedOffers,
      offerAcceptanceRate,
      avgDiscountRequested,
      itemsWithImages,
      imageCoverageRate,
      itemsWithPhone,
      phoneCaptureRate,
      categoryCounts,
      societyCounts,
      aiCostPerListing
    };
  }, [scopedItems, offers, comments, aiStats]);

  // Export CSV Data for PM deep dive
  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Category', 'Price_INR', 'Status', 'Seller_Name', 'Seller_Tower', 'Society', 'City', 'Phone_Verified', 'Images_Count'];
    const rows = items.map(it => [
      it.id,
      `"${(it.title || '').replace(/"/g, '""')}"`,
      it.category,
      it.price,
      it.status,
      `"${(it.seller.name || '').replace(/"/g, '""')}"`,
      it.seller.tower,
      `"${(it.seller.society || '').replace(/"/g, '""')}"`,
      it.seller.city,
      it.seller.phone ? 'YES' : 'NO',
      (it.images || []).length
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bhangar_pure_metrics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Inventory Table
  const filteredInventory = useMemo(() => {
    return scopedItems.filter(it => {
      if (statusFilter !== 'all' && it.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && it.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = it.title.toLowerCase().includes(q);
        const matchSeller = it.seller.name.toLowerCase().includes(q) || it.seller.tower.toLowerCase().includes(q);
        const matchSociety = it.seller.society.toLowerCase().includes(q);
        if (!matchTitle && !matchSeller && !matchSociety) return false;
      }
      return true;
    });
  }, [scopedItems, statusFilter, categoryFilter, searchQuery]);

  // Available Cities
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    items.forEach(it => { if (it.seller.city) set.add(it.seller.city); });
    societies.forEach(s => { if (s.city) set.add(s.city); });
    return Array.from(set);
  }, [items, societies]);

  // Render Login Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '420px',
          background: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '32px 24px',
          boxSizing: 'border-box'
        }}>
          {/* Brand & Badge */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '999px',
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              color: '#15803D',
              fontSize: '11.5px',
              fontWeight: 600,
              marginBottom: '12px'
            }}>
              <ShieldCheck size={14} />
              <span>Bhangar Product Operations</span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
              Admin & PM Intelligence
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
              Live metrics, AI token tracking, and resident deal flow.
            </p>
          </div>

          {authError && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#DC2626',
              fontSize: '12.5px',
              marginBottom: '20px',
              lineHeight: 1.4
            }}>
              {authError}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Admin Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  placeholder="duskiflake@gmail.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#64748B', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember admin session
              </label>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                background: '#0F172A',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
            >
              Sign In to Dashboard
            </button>
          </form>

          {/* Back to store */}
          <div style={{ marginTop: '22px', textAlign: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
            <button
              type="button"
              onClick={onBackToStorefront}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                fontSize: '12.5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={13} />
              <span>Return to Public Storefront</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Logged-in Admin Dashboard
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      color: '#0F172A',
      fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Navbar */}
      <header style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 16px',
          boxSizing: 'border-box'
        }}>
          <div className="admin-header-row">
            {/* Logo & Product Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={onBackToStorefront}
                title="Return to Public Storefront"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: '#F1F5F9',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={13} />
                <span className="admin-hide-mobile">Storefront</span>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '15.5px', fontWeight: 700, letterSpacing: '-0.02em', color: '#0F172A' }}>
                  Bhangar
                </span>
                <span style={{
                  background: '#EEF2FF',
                  color: '#4F46E5',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  Admin PM
                </span>
              </div>
            </div>

            {/* Controls: City Filter, Refresh, Export, Logout */}
            <div className="admin-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* City Filter */}
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                style={{
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  fontSize: '11.5px',
                  background: '#FFFFFF',
                  color: '#334155',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Cities</option>
                {availableCities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleRefresh}
                title="Refresh Live Data"
                style={{
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#475569',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                <RefreshCw size={13} className={isRefreshing ? 'spin-icon' : ''} />
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                title="Export PM CSV"
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: '#0F172A',
                  color: '#FFFFFF',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <Download size={12} />
                <span className="admin-hide-mobile">Export CSV</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                style={{
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  background: '#FFFFFF',
                  color: '#DC2626',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11.5px',
                  fontWeight: 500
                }}
              >
                <LogOut size={13} />
                <span className="admin-hide-mobile">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Insights Live Pulse Bar (Mobile & Desktop Instant Summary) */}
        <div style={{
          background: '#0F172A',
          color: '#F8FAFC',
          borderTop: '1px solid #1E293B',
          padding: '8px 16px',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            whiteSpace: 'nowrap',
            fontSize: '11.5px'
          }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#94A3B8' }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
              <strong style={{ color: '#F8FAFC' }}>Live Pulse:</strong>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: '#94A3B8' }}>Liquidity:</span>
              <span style={{ fontWeight: 700, color: '#34D399' }}>{metrics.liquidityRate}%</span>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: '#94A3B8' }}>Active Listings:</span>
              <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{metrics.activeListings}</span>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: '#94A3B8' }}>Listed GMV:</span>
              <span style={{ fontWeight: 700, color: '#60A5FA' }}>₹{metrics.totalListedGMV.toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: '#94A3B8' }}>Realized Sold:</span>
              <span style={{ fontWeight: 700, color: '#FBBF24' }}>₹{metrics.soldGMV.toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: '#94A3B8' }}>STR:</span>
              <span style={{ fontWeight: 700, color: '#FBBF24' }}>{metrics.sellThroughRate}%</span>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: '#94A3B8' }}>Bids/MolBhav:</span>
              <span style={{ fontWeight: 700, color: '#C084FC' }}>{metrics.totalOffers}</span>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: '#94A3B8' }}>AI Calls:</span>
              <span style={{ fontWeight: 700, color: '#A7F3D0' }}>{aiStats.totalCalls} (₹{aiStats.totalCostINR})</span>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: '#94A3B8' }}>DB Engine:</span>
              <span style={{ fontWeight: 600, color: isSupabaseConfigured() ? '#34D399' : '#FCD34D' }}>
                {isSupabaseConfigured() ? 'Supabase Live' : 'Local Fallback'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Sub-Navigation (Smooth Horizontal Scroll on Mobile) */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 92, zIndex: 40 }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 16px'
        }}>
          <div className="admin-tab-nav">
            {[
              { id: 'overview', label: 'PM Overview & Funnel', icon: BarChart3 },
              { id: 'supply', label: `Supply (${items.length})`, icon: ShoppingBag },
              { id: 'demand', label: `Demand (${offers.length})`, icon: TrendingUp },
              { id: 'residents', label: 'Residents & Trust', icon: Users },
              { id: 'societies', label: `Societies (${societies.length})`, icon: Building2 },
              { id: 'resources', label: `AI & System Resources (${aiStats.totalCalls})`, icon: Cpu, highlight: true }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '12px 2px',
                    background: 'none',
                    border: 'none',
                    borderBottom: isActive ? '2px solid #0F172A' : '2px solid transparent',
                    color: isActive ? '#0F172A' : '#64748B',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={14} color={isActive ? '#0F172A' : '#94A3B8'} />
                  <span>{tab.label}</span>
                  {tab.highlight && (
                    <span style={{
                      background: '#ECFDF5',
                      color: '#059669',
                      fontSize: '9.5px',
                      padding: '1px 5px',
                      borderRadius: '999px',
                      fontWeight: 700
                    }}>
                      LIVE
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '16px', boxSizing: 'border-box', flex: 1 }}>
        
        {/* =========================================================
            TAB 1: PM OVERVIEW & FUNNEL
           ========================================================= */}
        {activeTab === 'overview' && (
          <div>
            {/* 4 Core PM KPI Cards */}
            <div className="admin-kpi-grid">
              {/* Liquidity Ratio */}
              <div className="admin-card-compact" style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '18px 20px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Marketplace Liquidity
                  </span>
                  <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={13} />
                  </div>
                </div>
                <div className="admin-kpi-val" style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>
                  {metrics.liquidityRate}%
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  Listings with buyer offers, comments, or marked sold
                </div>
              </div>

              {/* Total Listed GMV */}
              <div className="admin-card-compact" style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '18px 20px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Gross Listed GMV
                  </span>
                  <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DollarSign size={13} />
                  </div>
                </div>
                <div className="admin-kpi-val" style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>
                  ₹{metrics.totalListedGMV.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  Across {metrics.totalListings} items · Avg ₹{metrics.averagePrice.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Sell-Through Rate */}
              <div className="admin-card-compact" style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '18px 20px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Sell-Through Rate (STR)
                  </span>
                  <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={13} />
                  </div>
                </div>
                <div className="admin-kpi-val" style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>
                  {metrics.sellThroughRate}%
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  {metrics.soldListings} items marked sold (₹{metrics.soldGMV.toLocaleString('en-IN')} realized)
                </div>
              </div>

              {/* Offer Conversion Rate */}
              <div className="admin-card-compact" style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '18px 20px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Offer Conversion
                  </span>
                  <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp size={13} />
                  </div>
                </div>
                <div className="admin-kpi-val" style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>
                  {metrics.offerAcceptanceRate}%
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  {metrics.acceptedOffers} of {metrics.totalOffers} MolBhav offers accepted
                </div>
              </div>
            </div>

            {/* PM Conversion Funnel & Actionable Insights */}
            <div className="admin-funnel-grid">
              {/* Funnel Card */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: '#0F172A', margin: 0 }}>
                    Deal Flow Funnel
                  </h3>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Live Event Flow</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Step 1: Supply Listed */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: '#475569', fontWeight: 500 }}>1. Items Listed (Supply)</span>
                      <span style={{ fontWeight: 700, color: '#0F172A' }}>{metrics.totalListings} (100%)</span>
                    </div>
                    <div style={{ height: '7px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '100%', height: '100%', background: '#3B82F6', borderRadius: '4px' }} />
                    </div>
                  </div>

                  {/* Step 2: Demand Discovered */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: '#475569', fontWeight: 500 }}>2. Items Inquired / Engaged</span>
                      <span style={{ fontWeight: 700, color: '#0F172A' }}>
                        {Math.round((metrics.liquidityRate * metrics.totalListings) / 100)} ({metrics.liquidityRate}%)
                      </span>
                    </div>
                    <div style={{ height: '7px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${metrics.liquidityRate}%`, height: '100%', background: '#10B981', borderRadius: '4px' }} />
                    </div>
                  </div>

                  {/* Step 3: MolBhav Offers Made */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: '#475569', fontWeight: 500 }}>3. Offers Placed (MolBhav)</span>
                      <span style={{ fontWeight: 700, color: '#0F172A' }}>
                        {metrics.totalOffers} offers (Avg -{metrics.avgDiscountRequested}% ask)
                      </span>
                    </div>
                    <div style={{ height: '7px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, metrics.totalOffers * 10)}%`, height: '100%', background: '#8B5CF6', borderRadius: '4px' }} />
                    </div>
                  </div>

                  {/* Step 4: Items Sold */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: '#475569', fontWeight: 500 }}>4. Realized Transactions (Sold)</span>
                      <span style={{ fontWeight: 700, color: '#0F172A' }}>
                        {metrics.soldListings} items ({metrics.sellThroughRate}% STR)
                      </span>
                    </div>
                    <div style={{ height: '7px', background: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${metrics.sellThroughRate}%`, height: '100%', background: '#F59E0B', borderRadius: '4px' }} />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '16px', padding: '10px 12px', borderRadius: '8px', background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '11.5px', color: '#475569', lineHeight: 1.4 }}>
                  💡 <strong>PM Insight:</strong> Realized revenue from sold items stands at <strong>₹{metrics.soldGMV.toLocaleString('en-IN')}</strong> vs gross listed pipeline of <strong>₹{metrics.totalListedGMV.toLocaleString('en-IN')}</strong>.
                </div>
              </div>

              {/* Category Breakdown */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <h3 style={{ fontSize: '14.5px', fontWeight: 600, color: '#0F172A', margin: '0 0 14px 0' }}>
                  Inventory by Category
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(metrics.categoryCounts).map(([cat, data]) => {
                    const pct = metrics.totalListings > 0 ? Math.round((data.count / metrics.totalListings) * 100) : 0;
                    return (
                      <div key={cat}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                          <span style={{ textTransform: 'capitalize', fontWeight: 500, color: '#334155' }}>{cat}</span>
                          <span style={{ color: '#64748B', fontSize: '11.5px' }}>
                            {data.count} items ({pct}%) · ₹{data.gmv.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div style={{ height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: '#0F172A', borderRadius: '3px' }} />
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(metrics.categoryCounts).length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
                      No active listings in selected filter.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quality & Telemetry Summary Row */}
            <div className="admin-kpi-grid" style={{ marginBottom: '16px' }}>
              <div className="admin-card-compact" style={{ background: '#FFFFFF', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Photo Coverage
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>
                  {metrics.imageCoverageRate}%
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  {metrics.itemsWithImages} of {metrics.totalListings} listings have photos
                </div>
              </div>

              <div className="admin-card-compact" style={{ background: '#FFFFFF', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Seller Phone Capture
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>
                  {metrics.phoneCaptureRate}%
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  Verified contact captured on {metrics.itemsWithPhone} items
                </div>
              </div>

              <div className="admin-card-compact" style={{ background: '#FFFFFF', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                  AI Unit Economics
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#059669' }}>
                  ₹{metrics.aiCostPerListing}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  Estimated AI cost per listing created ({aiStats.model})
                </div>
              </div>

              <div className="admin-card-compact" style={{ background: '#FFFFFF', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Resident Discussions
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#7C3AED' }}>
                  {comments.length}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  Buyer comments and inquiry threads
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 2: SUPPLY & INVENTORY MANAGEMENT
           ========================================================= */}
        {activeTab === 'supply' && (
          <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px' }}>
            {/* Controls Bar */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 240px' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                  <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search by title, resident, society..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 10px 7px 32px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12.5px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    background: '#FFFFFF',
                    color: '#334155'
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="available">Available ({scopedItems.filter(i => i.status === 'available').length})</option>
                  <option value="held">Held ({scopedItems.filter(i => i.status === 'held').length})</option>
                  <option value="sold">Sold ({scopedItems.filter(i => i.status === 'sold').length})</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    background: '#FFFFFF',
                    color: '#334155'
                  }}
                >
                  <option value="all">All Categories</option>
                  <option value="furniture">Furniture</option>
                  <option value="electronics">Electronics</option>
                  <option value="appliances">Appliances</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="decor">Decor</option>
                  <option value="fixer">Fixer-upper</option>
                </select>
              </div>
            </div>

            {/* Hint for mobile horizontal scroll */}
            <div className="admin-hide-mobile" style={{ display: 'none' }} />
            <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>← Swipe table horizontally to see full listing attributes & controls →</span>
            </div>

            {/* Inventory Table Container with Touch Scrolling */}
            <div className="admin-table-scroll">
              <table className="admin-table-min" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 600 }}>
                    <th style={{ padding: '10px 12px' }}>Listing Item</th>
                    <th style={{ padding: '10px 12px' }}>Category</th>
                    <th style={{ padding: '10px 12px' }}>Price</th>
                    <th style={{ padding: '10px 12px' }}>Resident & Tower</th>
                    <th style={{ padding: '10px 12px' }}>Society</th>
                    <th style={{ padding: '10px 12px' }}>Status</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#94A3B8' }}>
                        No inventory matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map(it => (
                      <tr key={it.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {it.images && it.images[0] ? (
                              <img 
                                src={it.images[0]} 
                                alt={it.title} 
                                style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover' }} 
                              />
                            ) : (
                              <div style={{ width: '38px', height: '38px', borderRadius: '6px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                                <ShoppingBag size={16} />
                              </div>
                            )}
                            <div>
                              <div style={{ fontWeight: 600, color: '#0F172A' }}>{it.title}</div>
                              <div style={{ fontSize: '11px', color: '#64748B' }}>
                                ID: {it.id} · {it.savesCount || 0} saves
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px', textTransform: 'capitalize', color: '#475569' }}>
                          {it.category}
                        </td>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#0F172A' }}>
                          ₹{it.price?.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ color: '#0F172A', fontWeight: 500 }}>{it.seller.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>
                            {it.seller.tower} {it.seller.phone ? `· 📞 ${it.seller.phone}` : ''}
                          </div>
                        </td>
                        <td style={{ padding: '12px', color: '#475569' }}>
                          <div>{it.seller.society}</div>
                          <div style={{ fontSize: '11px', color: '#94A3B8' }}>{it.seller.city}</div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            background: it.status === 'sold' ? '#ECFDF5' : it.status === 'held' ? '#FFFBEB' : '#EFF6FF',
                            color: it.status === 'sold' ? '#059669' : it.status === 'held' ? '#B45309' : '#2563EB'
                          }}>
                            {it.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            {it.status !== 'sold' && onUpdateItemStatus && (
                              <button
                                type="button"
                                onClick={() => onUpdateItemStatus(it.id, 'sold')}
                                title="Mark as Sold"
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  background: '#ECFDF5',
                                  color: '#059669',
                                  border: '1px solid #A7F3D0',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                Mark Sold
                              </button>
                            )}
                            {it.status === 'sold' && onUpdateItemStatus && (
                              <button
                                type="button"
                                onClick={() => onUpdateItemStatus(it.id, 'available')}
                                title="Re-list as Available"
                                style={{
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  background: '#EFF6FF',
                                  color: '#2563EB',
                                  border: '1px solid #BFDBFE',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                Re-list
                              </button>
                            )}
                            {onDeleteItem && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Remove "${it.title}" permanently?`)) {
                                    onDeleteItem(it.id);
                                  }
                                }}
                                title="Delete item"
                                style={{
                                  padding: '4px 6px',
                                  borderRadius: '4px',
                                  background: '#FEF2F2',
                                  color: '#DC2626',
                                  border: '1px solid #FECACA',
                                  cursor: 'pointer'
                                }}
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 3: DEMAND & MOLBHAV NEGOTIATIONS
           ========================================================= */}
        {activeTab === 'demand' && (
          <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', margin: '0 0 4px 0' }}>
                MolBhav & Deal Negotiations Audit ({offers.length})
              </h3>
              <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                Buyer offers, discount depths, and resident contact handoffs.
              </p>
            </div>

            <div className="admin-table-scroll">
              <table className="admin-table-min" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 600 }}>
                    <th style={{ padding: '10px 12px' }}>Target Item</th>
                    <th style={{ padding: '10px 12px' }}>Asking Price</th>
                    <th style={{ padding: '10px 12px' }}>Offered Price</th>
                    <th style={{ padding: '10px 12px' }}>Bargain %</th>
                    <th style={{ padding: '10px 12px' }}>Buyer Name & Tower</th>
                    <th style={{ padding: '10px 12px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#94A3B8' }}>
                        No offers recorded yet.
                      </td>
                    </tr>
                  ) : (
                    offers.map(o => {
                      const discountPct = o.askingPrice && o.offeredPrice
                        ? Math.round(((o.askingPrice - o.offeredPrice) / o.askingPrice) * 100)
                        : 0;
                      return (
                        <tr key={o.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '12px', fontWeight: 500, color: '#0F172A' }}>
                            {o.itemTitle}
                          </td>
                          <td style={{ padding: '12px', color: '#64748B' }}>
                            ₹{o.askingPrice?.toLocaleString('en-IN') || '—'}
                          </td>
                          <td style={{ padding: '12px', fontWeight: 600, color: '#0F172A' }}>
                            ₹{o.offeredPrice.toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              fontWeight: 600,
                              color: discountPct > 30 ? '#DC2626' : '#2563EB',
                              background: discountPct > 30 ? '#FEF2F2' : '#EFF6FF',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '11px'
                            }}>
                              -{discountPct}%
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ color: '#0F172A', fontWeight: 500 }}>{o.buyerName}</div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>{o.buyerTower || 'Resident'}</div>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              background: o.status === 'accepted' ? '#ECFDF5' : o.status === 'declined' ? '#FEF2F2' : '#FFFBEB',
                              color: o.status === 'accepted' ? '#059669' : o.status === 'declined' ? '#DC2626' : '#B45309'
                            }}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 4: RESIDENTS & PENETRATION
           ========================================================= */}
        {activeTab === 'residents' && (
          <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', margin: '0 0 4px 0' }}>
                Resident Identity & Verification Audit
              </h3>
              <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                Verified residents, phone numbers captured, and society representation.
              </p>
            </div>

            {/* Profile Highlight Card */}
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: '#0F172A',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '16px'
                }}>
                  {userProfile.name ? userProfile.name[0] : 'R'}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                    {userProfile.name || 'Anonymous Resident'} {userProfile.username ? `(@${userProfile.username})` : ''}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={11} />
                    <span>{userProfile.phone || 'No phone entered yet'}</span>
                    <span>·</span>
                    <MapPin size={11} />
                    <span>{userProfile.societyName || 'Unassigned Society'} ({userProfile.tower || 'No tower'})</span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#059669', background: '#ECFDF5', padding: '4px 10px', borderRadius: '999px', fontWeight: 600 }}>
                ✓ {userProfile.isLoggedIn ? 'Active Verified Session' : 'Guest'}
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '8px', background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534', fontSize: '12.5px', lineHeight: 1.5 }}>
              🛡️ <strong>Resident Privacy & Safety:</strong> Contact numbers are only exchanged between buyer and seller once a MolBhav offer is accepted to take the inspection/deal forward off-platform.
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 5: SOCIETIES & LAUNCH PIPELINE
           ========================================================= */}
        {activeTab === 'societies' && (
          <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', margin: '0 0 4px 0' }}>
                Residential Societies & Launch Density ({societies.length})
              </h3>
              <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                Active residential community hubs created by real residents.
              </p>
            </div>

            <div className="admin-table-scroll">
              <table className="admin-table-min" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 600 }}>
                    <th style={{ padding: '10px 12px' }}>Society / Community</th>
                    <th style={{ padding: '10px 12px' }}>City</th>
                    <th style={{ padding: '10px 12px' }}>Locality</th>
                    <th style={{ padding: '10px 12px' }}>Pincode</th>
                    <th style={{ padding: '10px 12px' }}>Listings Density</th>
                    <th style={{ padding: '10px 12px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {societies.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#94A3B8' }}>
                        No societies added yet. Societies appear here as residents create them.
                      </td>
                    </tr>
                  ) : (
                    societies.map(soc => {
                      const count = items.filter(it => it.seller.society === soc.name).length;
                      return (
                        <tr key={soc.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '12px', fontWeight: 600, color: '#0F172A' }}>
                            {soc.name}
                          </td>
                          <td style={{ padding: '12px', color: '#475569' }}>
                            {soc.city}
                          </td>
                          <td style={{ padding: '12px', color: '#64748B' }}>
                            {soc.area || '—'}
                          </td>
                          <td style={{ padding: '12px', color: '#64748B' }}>
                            {soc.pincode || '—'}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              fontWeight: 600,
                              color: count > 0 ? '#059669' : '#94A3B8',
                              background: count > 0 ? '#ECFDF5' : '#F1F5F9',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px'
                            }}>
                              {count} active listings
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                              background: '#F0FDF4',
                              color: '#15803D'
                            }}>
                              <CheckCircle2 size={12} />
                              Live Hub
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================
            TAB 6: AI USAGE & SYSTEM RESOURCE TELEMETRY
           ========================================================= */}
        {activeTab === 'resources' && (
          <div>
            {/* Header & Controls */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>
                  AI Usage & Infrastructure Telemetry
                </h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                  Real-time monitoring of Gemini token consumption, latency, API costs (INR), and database resource utilization.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleTestGeminiPing}
                  disabled={isTestingPing}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    background: '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: isTestingPing ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Activity size={13} className={isTestingPing ? 'spin-icon' : ''} />
                  <span>{isTestingPing ? 'Pinging Gemini...' : 'Live Gemini Healthcheck'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearTelemetry}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: '#FFFFFF',
                    color: '#DC2626',
                    border: '1px solid #FECACA',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Clear Logs
                </button>
              </div>
            </div>

            {/* Ping Healthcheck Banner */}
            {pingResult && (
              <div style={{
                marginBottom: '20px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: pingResult.success ? '#ECFDF5' : '#FEF2F2',
                border: `1px solid ${pingResult.success ? '#A7F3D0' : '#FECACA'}`,
                color: pingResult.success ? '#065F46' : '#991B1B',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {pingResult.success ? <Check size={16} /> : <AlertCircle size={16} />}
                  <span><strong>{pingResult.message}</strong></span>
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                  <span>Latency: <strong>{pingResult.latencyMs}ms</strong></span>
                  {pingResult.tokens && <span>Tokens: <strong>{pingResult.tokens}</strong></span>}
                </div>
              </div>
            )}

            {/* 4 Core Resource Cards */}
            <div className="admin-kpi-grid">
              {/* AI Invocations */}
              <div className="admin-card-compact" style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '18px 20px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                    AI Invocations
                  </span>
                  <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Cpu size={13} />
                  </div>
                </div>
                <div className="admin-kpi-val" style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>
                  {aiStats.totalCalls}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  {aiStats.geminiCalls} Cloud Gemini · {aiStats.localCalls} Local Heuristic ({aiStats.todayCalls} today)
                </div>
              </div>

              {/* Total Tokens Consumed */}
              <div className="admin-card-compact" style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '18px 20px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                    Tokens Consumed
                  </span>
                  <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={13} />
                  </div>
                </div>
                <div className="admin-kpi-val" style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>
                  {aiStats.totalTokens.toLocaleString()}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  {aiStats.promptTokens.toLocaleString()} prompt · {aiStats.completionTokens.toLocaleString()} candidates
                </div>
              </div>

              {/* Estimated AI Cost */}
              <div className="admin-card-compact" style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '18px 20px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                    Calculated AI Cost
                  </span>
                  <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Coins size={13} />
                  </div>
                </div>
                <div className="admin-kpi-val" style={{ fontSize: '24px', fontWeight: 700, color: '#059669', marginBottom: '2px' }}>
                  ₹{aiStats.totalCostINR}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  ${aiStats.totalCostUSD} USD ($0.10/M prompt, $0.40/M output)
                </div>
              </div>

              {/* Latency & Health */}
              <div className="admin-card-compact" style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '18px 20px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                    Latency & Engine
                  </span>
                  <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={13} />
                  </div>
                </div>
                <div className="admin-kpi-val" style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>
                  {aiStats.avgLatencyMs}ms
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  Active model: <strong>{aiStats.model}</strong>
                </div>
              </div>
            </div>

            {/* Infrastructure & Storage Breakdown */}
            <div className="admin-funnel-grid" style={{ marginBottom: '24px' }}>
              {/* Database Telemetry */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Database size={16} color="#0F172A" />
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                      Database Resources (Supabase / Local)
                    </h4>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: isSupabaseConfigured() ? '#ECFDF5' : '#FFFBEB',
                    color: isSupabaseConfigured() ? '#059669' : '#B45309'
                  }}>
                    {isSupabaseConfigured() ? 'Connected' : 'Local Fallback'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748B' }}>Items Table Rows:</span>
                    <strong style={{ color: '#0F172A' }}>{items.length} records</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748B' }}>Offers Table Rows:</span>
                    <strong style={{ color: '#0F172A' }}>{offers.length} records</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748B' }}>Comments Table Rows:</span>
                    <strong style={{ color: '#0F172A' }}>{comments.length} records</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748B' }}>Societies Table Rows:</span>
                    <strong style={{ color: '#0F172A' }}>{societies.length} records</strong>
                  </div>
                </div>
              </div>

              {/* Asset Storage & Bandwidth */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #E2E8F0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HardDrive size={16} color="#0F172A" />
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                      Media & Storage Footprint
                    </h4>
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    Client Cache: <strong>{storageUsageKB} KB</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748B' }}>Total Images Tracked:</span>
                    <strong style={{ color: '#0F172A' }}>{imageTelemetry.totalImages} images</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748B' }}>Supabase / CDN URLs:</span>
                    <strong style={{ color: '#059669' }}>{imageTelemetry.remoteImages} images</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748B' }}>Inline Base64 Payloads:</span>
                    <strong style={{ color: '#D97706' }}>{imageTelemetry.base64Images} images</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748B' }}>Telemetry Buffer:</span>
                    <strong style={{ color: '#0F172A' }}>{aiStats.recentCalls.length} calls logged</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent AI Request Logs Stream */}
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px' }}>
              <div style={{ marginBottom: '14px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', margin: '0 0 4px 0' }}>
                  Live AI Request Stream (Last 50 Invocations)
                </h4>
                <p style={{ fontSize: '11.5px', color: '#64748B', margin: 0 }}>
                  Exact tokens, latency, engine choice, and estimated cost for each resident item analyzed.
                </p>
              </div>

              <div className="admin-table-scroll">
                <table className="admin-table-min" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 600 }}>
                      <th style={{ padding: '8px 10px' }}>Timestamp</th>
                      <th style={{ padding: '8px 10px' }}>Item Title</th>
                      <th style={{ padding: '8px 10px' }}>Engine</th>
                      <th style={{ padding: '8px 10px' }}>Type</th>
                      <th style={{ padding: '8px 10px' }}>Tokens</th>
                      <th style={{ padding: '8px 10px' }}>Latency</th>
                      <th style={{ padding: '8px 10px' }}>Cost (INR)</th>
                      <th style={{ padding: '8px 10px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aiStats.recentCalls.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ padding: '28px', textAlign: 'center', color: '#94A3B8' }}>
                          No AI requests recorded in telemetry yet. Create an item to trigger Gemini valuation.
                        </td>
                      </tr>
                    ) : (
                      aiStats.recentCalls.map((call) => (
                        <tr key={call.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '10px', color: '#64748B', whiteSpace: 'nowrap' }}>
                            {new Date(call.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td style={{ padding: '10px', fontWeight: 500, color: '#0F172A', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {call.title}
                          </td>
                          <td style={{ padding: '10px' }}>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '10.5px',
                              fontWeight: 600,
                              background: call.engine === 'gemini-2.0-flash' ? '#EFF6FF' : '#F1F5F9',
                              color: call.engine === 'gemini-2.0-flash' ? '#2563EB' : '#475569'
                            }}>
                              {call.engine}
                            </span>
                          </td>
                          <td style={{ padding: '10px', textTransform: 'capitalize', color: '#64748B' }}>
                            {call.type}
                          </td>
                          <td style={{ padding: '10px', color: '#0F172A', fontWeight: 500 }}>
                            {call.totalTokens > 0 ? call.totalTokens : '0 (heuristic)'}
                          </td>
                          <td style={{ padding: '10px', color: '#64748B' }}>
                            {call.latencyMs}ms
                          </td>
                          <td style={{ padding: '10px', fontWeight: 600, color: call.estimatedCostINR > 0 ? '#059669' : '#94A3B8' }}>
                            ₹{call.estimatedCostINR}
                          </td>
                          <td style={{ padding: '10px' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              background: call.status === 'success' ? '#ECFDF5' : call.status === 'fallback' ? '#FFFBEB' : '#FEF2F2',
                              color: call.status === 'success' ? '#059669' : call.status === 'fallback' ? '#B45309' : '#DC2626'
                            }}>
                              {call.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
