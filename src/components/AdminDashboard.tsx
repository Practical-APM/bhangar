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
import { testSupabaseConnection } from '../services/api';

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

  // Supabase Testing State
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseResult, setSupabaseResult] = useState<{
    isConfigured: boolean;
    dbConnected: boolean;
    storageConnected: boolean;
    itemsCount: number;
    latencyMs: number;
    message: string;
    error?: string;
  } | null>(null);

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

  // Handle Live Supabase Connection Test
  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    setSupabaseResult(null);
    try {
      const res = await testSupabaseConnection();
      setSupabaseResult(res);
    } catch (err: any) {
      setSupabaseResult({
        isConfigured: false,
        dbConnected: false,
        storageConnected: false,
        itemsCount: 0,
        latencyMs: 0,
        message: err.message || 'Supabase test failed'
      });
    } finally {
      setIsTestingSupabase(false);
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
      </header>

      {/* Tabs Sub-Navigation (Smooth Horizontal Scroll on Mobile) */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 60, zIndex: 40 }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 16px'
        }}>
          <div className="admin-tab-nav">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'supply', label: `Listings (${items.length})`, icon: ShoppingBag },
              { id: 'demand', label: `Offers (${offers.length})`, icon: TrendingUp },
              { id: 'residents', label: 'Residents', icon: Users },
              { id: 'societies', label: `Societies (${societies.length})`, icon: Building2 },
              { id: 'resources', label: 'Database & System', icon: Database }
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
            TAB 6: DATABASE & SYSTEM STATUS
           ========================================================= */}
        {activeTab === 'resources' && (
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px 0' }}>
                  Database & Cloud Infrastructure
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                  Live connection health, storage status, and Supabase database permissions.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleTestSupabase}
                  disabled={isTestingSupabase}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    background: '#047857',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: isTestingSupabase ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Database size={14} className={isTestingSupabase ? 'spin-icon' : ''} />
                  <span>{isTestingSupabase ? 'Testing Connection...' : 'Test Supabase Connection'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestGeminiPing}
                  disabled={isTestingPing}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    background: '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: isTestingPing ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Activity size={14} className={isTestingPing ? 'spin-icon' : ''} />
                  <span>{isTestingPing ? 'Pinging...' : 'Gemini AI Healthcheck'}</span>
                </button>
              </div>
            </div>

            {/* Diagnostic Alert Box */}
            {supabaseResult && (
              <div style={{
                marginBottom: '20px',
                padding: '14px 18px',
                borderRadius: '10px',
                background: supabaseResult.dbConnected && supabaseResult.storageConnected ? '#ECFDF5' : (supabaseResult.dbConnected ? '#FFFBEB' : '#FEF2F2'),
                border: `1px solid ${supabaseResult.dbConnected && supabaseResult.storageConnected ? '#A7F3D0' : (supabaseResult.dbConnected ? '#FDE68A' : '#FECACA')}`,
                color: supabaseResult.dbConnected && supabaseResult.storageConnected ? '#065F46' : (supabaseResult.dbConnected ? '#92400E' : '#991B1B'),
                fontSize: '13px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, marginBottom: '6px' }}>
                  {supabaseResult.dbConnected && supabaseResult.storageConnected ? <Check size={18} /> : <AlertCircle size={18} />}
                  <span>{supabaseResult.message}</span>
                </div>
                {supabaseResult.error && (
                  <div style={{
                    marginTop: '8px',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    background: '#FFFFFF',
                    color: '#DC2626',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    border: '1px solid #FECACA'
                  }}>
                    {supabaseResult.error}
                  </div>
                )}
              </div>
            )}

            {/* Gemini Ping Result Alert */}
            {pingResult && (
              <div style={{
                marginBottom: '20px',
                padding: '14px 18px',
                borderRadius: '10px',
                background: pingResult.success ? '#ECFDF5' : '#FEF2F2',
                border: `1px solid ${pingResult.success ? '#A7F3D0' : '#FECACA'}`,
                color: pingResult.success ? '#065F46' : '#991B1B',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {pingResult.success ? <Check size={16} /> : <AlertCircle size={16} />}
                  <span>{pingResult.message}</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>{pingResult.latencyMs}ms</span>
              </div>
            )}

            {/* Core Status Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {/* Database Status */}
              <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '20px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Database size={18} color="#0F172A" />
                    <span style={{ fontWeight: 600, fontSize: '14px', color: '#0F172A' }}>PostgreSQL Database</span>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: isSupabaseConfigured() ? '#ECFDF5' : '#FFFBEB',
                    color: isSupabaseConfigured() ? '#059669' : '#B45309'
                  }}>
                    {isSupabaseConfigured() ? 'CONFIGURED' : 'LOCAL FALLBACK'}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6 }}>
                  <div>Live Items: <strong style={{ color: '#0F172A' }}>{items.length}</strong></div>
                  <div>Live Offers: <strong style={{ color: '#0F172A' }}>{offers.length}</strong></div>
                  <div>Live Societies: <strong style={{ color: '#0F172A' }}>{societies.length}</strong></div>
                </div>
              </div>

              {/* Storage CDN Status */}
              <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '20px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HardDrive size={18} color="#0F172A" />
                    <span style={{ fontWeight: 600, fontSize: '14px', color: '#0F172A' }}>Image Storage & CDN</span>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: '#ECFDF5',
                    color: '#059669'
                  }}>
                    ACTIVE
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6 }}>
                  <div>Bucket: <strong style={{ color: '#0F172A' }}>listing-images</strong></div>
                  <div>Public CDN: <strong style={{ color: '#059669' }}>Enabled</strong></div>
                  <div>Upload Optimization: <strong style={{ color: '#0F172A' }}>Active</strong></div>
                </div>
              </div>

              {/* AI Valuation Engine */}
              <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '20px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Cpu size={18} color="#0F172A" />
                    <span style={{ fontWeight: 600, fontSize: '14px', color: '#0F172A' }}>Gemini AI Engine</span>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: '#EFF6FF',
                    color: '#2563EB'
                  }}>
                    READY
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6 }}>
                  <div>Model: <strong style={{ color: '#0F172A' }}>gemini-2.0-flash</strong></div>
                  <div>Automated Valuation: <strong style={{ color: '#059669' }}>Active</strong></div>
                  <div>Elevator & Fit Check: <strong style={{ color: '#059669' }}>Active</strong></div>
                </div>
              </div>
            </div>

            {/* Quick SQL Permissions Help Box */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #E2E8F0'
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                🔑 Supabase API Permission Setup
              </h4>
              <p style={{ margin: '0 0 12px 0', fontSize: '12.5px', color: '#64748B', lineHeight: 1.5 }}>
                If the database connection reports <code style={{ color: '#DC2626' }}>permission denied for table items</code>, execute this SQL block in your <strong>Supabase SQL Editor</strong> to grant access to the anon public client:
              </p>
              <pre style={{
                background: '#0F172A',
                color: '#34D399',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '12px',
                overflowX: 'auto',
                lineHeight: 1.5,
                margin: 0
              }}>
{`GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;`}
              </pre>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
