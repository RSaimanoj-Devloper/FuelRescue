import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OfflineSyncBanner } from './components/OfflineSyncBanner';
import { DriverDashboard } from './pages/DriverDashboard';
import { EmergencyRequestForm } from './pages/EmergencyRequestForm';
import { RequestTracker } from './pages/RequestTracker';
import { ProviderDashboard } from './pages/ProviderDashboard';
import { OutletDashboard } from './pages/OutletDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { VehiclesPage } from './pages/VehiclesPage';
import { OfflineSyncPage } from './pages/OfflineSyncPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ThankYouPage } from './pages/ThankYouPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { CaseStudiesSection } from './components/CaseStudiesSection';
import { FaqSection } from './components/FaqSection';
import { Breadcrumbs } from './components/Breadcrumbs';
import { StickyMobileCta } from './components/StickyMobileCta';
import { OneTapSOSModal } from './components/OneTapSOSModal';
import { LoginModal } from './components/LoginModal';
import { QuickStartTourModal } from './components/QuickStartTourModal';
import { AuthGatePage } from './pages/AuthGatePage';
import { UserRole, AssistanceRequest, ServiceType } from './types';
import { initializeDatabase } from './offline/db';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { trackEvent } from './utils/analytics';
import {
  Home, Fuel, Navigation, HardHat, MoreHorizontal, Database, Car,
  BookOpen, AlertOctagon, Truck, Wrench, Shield, Users, Sparkles, LogOut, Store, Radio
} from 'lucide-react';

const ROLE_DEFAULT_TABS: Record<UserRole, string> = {
  DRIVER: 'DRIVER_HOME',
  PROVIDER: 'PROVIDER',
  OUTLET: 'OUTLET',
  ADMIN: 'ADMIN'
};

const ALLOWED_TABS: Record<UserRole, string[]> = {
  DRIVER: ['DRIVER_HOME', 'EMERGENCY_FORM', 'TRACKER', 'VEHICLES', 'OFFLINE_SYNC', 'NOT_FOUND', 'THANK_YOU', 'PRIVACY_POLICY', 'CASE_STUDIES', 'FAQS'],
  PROVIDER: ['PROVIDER', 'DRIVER_HOME', 'TRACKER', 'OFFLINE_SYNC', 'PRIVACY_POLICY', 'FAQS', 'NOT_FOUND'],
  OUTLET: ['OUTLET', 'DRIVER_HOME', 'OFFLINE_SYNC', 'PRIVACY_POLICY', 'FAQS', 'NOT_FOUND'],
  ADMIN: ['ADMIN', 'DRIVER_HOME', 'TRACKER', 'VEHICLES', 'OFFLINE_SYNC', 'PRIVACY_POLICY', 'FAQS', 'CASE_STUDIES', 'NOT_FOUND']
};

function FuelRescueMain() {
  const { user, role, logout, isAuthenticated } = useAuth();
  const { theme, lowBatteryMode, t } = useTheme();

  const [activeTab, setActiveTab] = useState<string>(() => {
    return user?.role ? ROLE_DEFAULT_TABS[user.role] : 'DRIVER_HOME';
  });

  const [activeTrackingId, setActiveTrackingId] = useState<string>('FR-2026-8919');
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType>('FUEL');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [tourModalOpen, setTourModalOpen] = useState(false);

  // Automatically direct to role-specific dashboard when user authenticates
  useEffect(() => {
    if (user?.role) {
      setActiveTab(ROLE_DEFAULT_TABS[user.role]);
    }
  }, [user?.role, user?.id]);

  // Strict Privilege Guard: Disallow non-authorized tabs based on authenticated role
  useEffect(() => {
    if (user?.role) {
      const allowed = ALLOWED_TABS[user.role] || ['DRIVER_HOME'];
      if (!allowed.includes(activeTab)) {
        setActiveTab(ROLE_DEFAULT_TABS[user.role]);
      }
    }
  }, [activeTab, user?.role]);

  // First Login: mark tour ready without blocking homepage viewport
  useEffect(() => {
    if (isAuthenticated && user && user.role === 'DRIVER') {
      const tourKey = `fuelrescue_tour_seen_${user.id || user.email}`;
      if (!localStorage.getItem(tourKey)) {
        localStorage.setItem(tourKey, 'true');
      }
    }
  }, [isAuthenticated, user?.id, user?.email, user?.role]);

  const handleCloseTour = () => {
    if (user) {
      localStorage.setItem(`fuelrescue_tour_seen_${user.id || user.email}`, 'true');
    }
    localStorage.setItem('fuelrescue_tour_seen', 'true');
    setTourModalOpen(false);
  };

  useEffect(() => {
    initializeDatabase();

    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('Service worker registration note:', err);
      });
    }
  }, []);

  // Unique page titles for enhanced SEO and tab clarity
  useEffect(() => {
    const titles: Record<string, string> = {
      DRIVER_HOME: 'Driver Hub & Highway Fuel Radar | FuelRescue',
      EMERGENCY_FORM: 'Request Emergency Roadside Assistance | FuelRescue',
      TRACKER: 'Live Highway Incident Telemetry Tracker | FuelRescue',
      VEHICLES: 'Registered Vehicles & Emergency QR Passes | FuelRescue',
      PROVIDER: 'Highway Patrol & Tow Rescue Dispatch | FuelRescue',
      OUTLET: 'Fuel Outlets Inventory & Pricing Control | FuelRescue',
      ADMIN: 'Command Operations & Traffic Management | FuelRescue',
      OFFLINE_SYNC: 'Offline Synchronization Engine | FuelRescue',
      NOT_FOUND: '404 Highway Route Not Found | FuelRescue',
      THANK_YOU: 'Assistance Dispatched – Thank You | FuelRescue',
      PRIVACY_POLICY: 'Driver Privacy & Geolocation Policy | FuelRescue',
      CASE_STUDIES: 'Highway Emergency Rescue Case Studies | FuelRescue',
      FAQS: '5 Highway Emergency FAQs | FuelRescue'
    };
    document.title = titles[activeTab] || 'FuelRescue – 24/7 Highway Emergency Fuel Delivery';
  }, [activeTab]);

  // MANDATORY SIGN IN GATEWAY: If not authenticated, require sign in first
  if (!isAuthenticated) {
    return <AuthGatePage />;
  }

  const handleSelectRequest = (id: string) => {
    setActiveTrackingId(id);
    setActiveTab('TRACKER');
  };

  const handleRequestCreated = (req: AssistanceRequest) => {
    setActiveTrackingId(req.id || req.clientRequestId);
    setActiveTab('THANK_YOU');
    trackEvent('assistance_request_dispatched', {
      serviceType: req.serviceType,
      requestId: req.id || req.clientRequestId
    });
  };

  const handleServiceSelect = (serviceType: ServiceType) => {
    if (role !== 'DRIVER') return;
    setSelectedServiceType(serviceType);
    setActiveTab('EMERGENCY_FORM');
  };

  const navigateTab = (targetTab: string) => {
    const allowed = ALLOWED_TABS[role] || ['DRIVER_HOME'];
    if (allowed.includes(targetTab)) {
      setActiveTab(targetTab);
    } else {
      setActiveTab('NOT_FOUND');
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className={`min-h-screen ${
      theme === 'dark'
        ? lowBatteryMode ? 'bg-black text-slate-100' : 'bg-slate-950 text-slate-100'
        : 'bg-slate-100 text-slate-900'
    } flex flex-col font-sans pb-20 md:pb-6 transition-colors duration-200`}>
      {/* Top Navigation Bar with Strict RBAC & No Role Switching */}
      <Navbar
        currentRole={role}
        onSelectRole={() => {}}
        activeTab={activeTab}
        onSelectTab={navigateTab}
        onEmergencyClick={() => {
          if (role === 'DRIVER') {
            setSelectedServiceType('FUEL');
            setActiveTab('EMERGENCY_FORM');
          }
        }}
        onOpenSOS={() => {
          if (role === 'DRIVER') setSosModalOpen(true);
        }}
        onOpenLoginModal={() => {}}
        onOpenTour={() => setTourModalOpen(true)}
      />

      {/* Real-time Network Connectivity & Offline Synchronization Banner */}
      <OfflineSyncBanner />

      {/* Main Content Viewport */}
      <main className="flex-1">
        {activeTab === 'DRIVER_HOME' && (
          <DriverDashboard
            onRequestServiceClick={handleServiceSelect}
            onSelectRequest={handleSelectRequest}
            onOpenSOS={() => setSosModalOpen(true)}
            onOpenTour={() => setTourModalOpen(true)}
            onNavigateTab={navigateTab}
          />
        )}

        {activeTab === 'EMERGENCY_FORM' && role === 'DRIVER' && (
          <EmergencyRequestForm
            initialServiceType={selectedServiceType}
            onSuccess={handleRequestCreated}
            onCancel={() => setActiveTab('DRIVER_HOME')}
          />
        )}

        {activeTab === 'TRACKER' && (
          <RequestTracker
            requestId={activeTrackingId}
            onBack={() => setActiveTab(ROLE_DEFAULT_TABS[role])}
          />
        )}

        {activeTab === 'PROVIDER' && role === 'PROVIDER' && (
          <ProviderDashboard
            onSelectRequest={handleSelectRequest}
          />
        )}

        {activeTab === 'OUTLET' && role === 'OUTLET' && (
          <OutletDashboard />
        )}

        {activeTab === 'ADMIN' && role === 'ADMIN' && (
          <AdminDashboard />
        )}

        {activeTab === 'VEHICLES' && role === 'DRIVER' && (
          <VehiclesPage />
        )}

        {activeTab === 'OFFLINE_SYNC' && (
          <OfflineSyncPage
            onSelectRequest={handleSelectRequest}
          />
        )}

        {activeTab === 'NOT_FOUND' && (
          <NotFoundPage
            onGoHome={() => navigateTab(ROLE_DEFAULT_TABS[role])}
            onGoTracker={() => navigateTab('TRACKER')}
            onGoSOS={() => setSosModalOpen(true)}
            onGoFaqs={() => navigateTab('FAQS')}
            onGoPrivacy={() => navigateTab('PRIVACY_POLICY')}
          />
        )}

        {activeTab === 'THANK_YOU' && (
          <ThankYouPage
            requestId={activeTrackingId}
            serviceType={selectedServiceType}
            onGoTracker={() => navigateTab('TRACKER')}
            onGoHome={() => navigateTab('DRIVER_HOME')}
          />
        )}

        {activeTab === 'PRIVACY_POLICY' && (
          <PrivacyPolicyPage
            onGoHome={() => navigateTab(ROLE_DEFAULT_TABS[role])}
          />
        )}

        {activeTab === 'CASE_STUDIES' && (
          <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
            <Breadcrumbs
              items={[{ label: 'Highway Rescue Case Studies', active: true }]}
              onHomeClick={() => navigateTab('DRIVER_HOME')}
            />
            <CaseStudiesSection onRequestClick={() => handleServiceSelect('FUEL')} />
          </div>
        )}

        {activeTab === 'FAQS' && (
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
            <Breadcrumbs
              items={[{ label: '5 Highway Emergency FAQs', active: true }]}
              onHomeClick={() => navigateTab('DRIVER_HOME')}
            />
            <FaqSection />
          </div>
        )}
      </main>

      {/* Sticky Mobile CTA for Stranded Highway Drivers */}
      {role === 'DRIVER' && activeTab === 'DRIVER_HOME' && (
        <StickyMobileCta
          onRequestFuel={() => handleServiceSelect('FUEL')}
          onOpenSOS={() => setSosModalOpen(true)}
        />
      )}

      {/* Mobile Bottom Navigation Bar (Thumb-Zone Ergonomics) - STRICT PRIVILEGE FILTERED */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 ${
        theme === 'dark' ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200 shadow-lg'
      } backdrop-blur-md border-t flex items-center justify-around h-16 px-2`}>
        {/* DRIVER MOBILE NAVIGATION */}
        {role === 'DRIVER' && (
          <>
            <button
              onClick={() => navigateTab('DRIVER_HOME')}
              className={`flex-1 flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                activeTab === 'DRIVER_HOME' ? 'text-orange-500 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] mt-1">{t.driverHub}</span>
            </button>

            <button
              onClick={() => navigateTab('TRACKER')}
              className={`flex-1 flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                activeTab === 'TRACKER' ? 'text-orange-500 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Navigation className="w-5 h-5" />
              <span className="text-[10px] mt-1">{t.tracker}</span>
            </button>

            {/* Center Emergency SOS Button: ONLY FOR DRIVER */}
            <button
              onClick={() => setSosModalOpen(true)}
              className="flex-1 flex flex-col items-center justify-center h-full min-h-[44px] -mt-3"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 to-orange-500 text-white shadow-lg shadow-red-500/40 flex items-center justify-center animate-pulse">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-black text-red-500 mt-0.5">SOS</span>
            </button>

            <button
              onClick={() => navigateTab('VEHICLES')}
              className={`flex-1 flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                activeTab === 'VEHICLES' ? 'text-orange-500 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Car className="w-5 h-5" />
              <span className="text-[10px] mt-1">{t.vehicles}</span>
            </button>
          </>
        )}

        {/* PROVIDER MOBILE NAVIGATION (NO SOS BUTTON) */}
        {role === 'PROVIDER' && (
          <>
            <button
              onClick={() => navigateTab('PROVIDER')}
              className={`flex-1 flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                activeTab === 'PROVIDER' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <HardHat className="w-5 h-5" />
              <span className="text-[10px] mt-1">{t.providerDispatch}</span>
            </button>

            <button
              onClick={() => navigateTab('TRACKER')}
              className={`flex-1 flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                activeTab === 'TRACKER' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Navigation className="w-5 h-5" />
              <span className="text-[10px] mt-1">{t.tracker}</span>
            </button>

            <button
              onClick={() => navigateTab('OFFLINE_SYNC')}
              className={`flex-1 flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                activeTab === 'OFFLINE_SYNC' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Database className="w-5 h-5" />
              <span className="text-[10px] mt-1">Sync</span>
            </button>
          </>
        )}

        {/* OUTLET MOBILE NAVIGATION (NO SOS BUTTON) */}
        {role === 'OUTLET' && (
          <>
            <button
              onClick={() => navigateTab('OUTLET')}
              className={`flex-1 flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                activeTab === 'OUTLET' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Store className="w-5 h-5" />
              <span className="text-[10px] mt-1">{t.fuelOutlets}</span>
            </button>

            <button
              onClick={() => navigateTab('OFFLINE_SYNC')}
              className={`flex-1 flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                activeTab === 'OFFLINE_SYNC' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Database className="w-5 h-5" />
              <span className="text-[10px] mt-1">Sync</span>
            </button>
          </>
        )}

        {/* ADMIN MOBILE NAVIGATION (NO SOS BUTTON) */}
        {role === 'ADMIN' && (
          <>
            <button
              onClick={() => navigateTab('ADMIN')}
              className={`flex-1 flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                activeTab === 'ADMIN' ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span className="text-[10px] mt-1">Operations</span>
            </button>

            <button
              onClick={() => navigateTab('OFFLINE_SYNC')}
              className={`flex-1 flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                activeTab === 'OFFLINE_SYNC' ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Database className="w-5 h-5" />
              <span className="text-[10px] mt-1">Sync</span>
            </button>
          </>
        )}

        {/* Universal Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`flex-1 flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            mobileMenuOpen ? 'text-orange-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] mt-1">Menu</span>
        </button>
      </nav>

      {/* Mobile Drawer Menu (Strict: No Role Switching Allowed!) */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className={`border-t rounded-t-3xl p-6 space-y-3 shadow-2xl ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1.5 bg-slate-600 rounded-full mx-auto mb-3" />

            {/* Authenticated User Status Bar */}
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-bold text-white">{user?.name}</p>
                <p className="text-[10px] font-mono text-orange-400">{user?.email}</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-700 text-slate-200">
                ROLE: {role}
              </span>
            </div>

            {/* Role-Specific Allowed Links Only */}
            {role === 'DRIVER' && (
              <>
                <button
                  onClick={() => navigateTab('VEHICLES')}
                  className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-left text-xs font-semibold text-white flex items-center gap-2.5"
                >
                  <Car className="w-4 h-4 text-orange-400" />
                  <span>{t.vehicles} & QR Pass</span>
                </button>

                <button
                  onClick={() => {
                    handleServiceSelect('TOW_TRUCK');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-left text-xs font-semibold text-white flex items-center gap-2.5"
                >
                  <Truck className="w-4 h-4 text-blue-400" />
                  <span>{t.towingService}</span>
                </button>

                <button
                  onClick={() => {
                    handleServiceSelect('MECHANIC');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-left text-xs font-semibold text-white flex items-center gap-2.5"
                >
                  <Wrench className="w-4 h-4 text-emerald-400" />
                  <span>{t.mechanicService}</span>
                </button>

                <button
                  onClick={() => {
                    setTourModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full p-3 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/40 hover:bg-orange-500/30 text-left text-xs font-bold text-amber-300 flex items-center gap-2.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Quick Start Tour</span>
                </button>
              </>
            )}

            <button
              onClick={() => navigateTab('OFFLINE_SYNC')}
              className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-left text-xs font-semibold text-white flex items-center gap-2.5"
            >
              <Database className="w-4 h-4 text-amber-400" />
              <span>{t.offlineBannerTitle}</span>
            </button>

            {/* Sign Out Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full p-3 rounded-xl bg-red-950/40 border border-red-800/60 hover:bg-red-900/50 text-left text-xs font-bold text-red-400 flex items-center gap-2.5 transition-colors mt-2"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.logout}</span>
            </button>
          </div>
        </div>
      )}

      {/* One-Tap SOS Modal: Only for Drivers */}
      {sosModalOpen && role === 'DRIVER' && (
        <OneTapSOSModal
          onSOSCreated={handleRequestCreated}
          onClose={() => setSosModalOpen(false)}
        />
      )}

      {/* Guided Quick Start Tour Modal (Driver Only) */}
      <QuickStartTourModal
        isOpen={tourModalOpen && role === 'DRIVER'}
        onClose={handleCloseTour}
        onOpenSOS={() => setSosModalOpen(true)}
        onRequestFuel={() => handleServiceSelect('FUEL')}
      />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FuelRescueMain />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
