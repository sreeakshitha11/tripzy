import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import FloatingAiChat from './components/FloatingAiChat';

// Pages - Discover
import Home from './pages/Home';
import ExploreMap from './pages/ExploreMap';
import DiscoverPlaces from './pages/DiscoverPlaces';
import DestinationDetail from './pages/DestinationDetail';
import SearchTrips from './pages/SearchTrips';

// Pages - Travel
import TripDetail from './pages/TripDetail';
import CreateTrip from './pages/CreateTrip';
import MyTrips from './pages/MyTrips';
import TravelGroups from './pages/TravelGroups';
import OpenToTravel from './pages/OpenToTravel';

// Pages - Plan
import TripzyAiPage from './pages/TripzyAiPage';
import TripPlanner from './pages/TripPlanner';
import BudgetCalculator from './pages/BudgetCalculator';
import ItineraryBuilder from './pages/ItineraryBuilder';
import DestinationCompare from './pages/DestinationCompare';
import TravelWishlist from './pages/TravelWishlist';
import PackingChecklist from './pages/PackingChecklist';

// Pages - Community & Safety & Account
import TravelCommunity from './pages/TravelCommunity';
import TravelDiary from './pages/TravelDiary';
import ReviewsPage from './pages/ReviewsPage';
import SafetySupport from './pages/SafetySupport';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import AdminDashboard from './pages/AdminDashboard';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import ForgotPassword from './pages/ForgotPassword';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(prev => !prev);
    } else {
      setIsSidebarCollapsed(prev => !prev);
    }
  };

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-linen text-ink flex flex-col font-sans">
          {/* Collapsible Sidebar (23 Items) */}
          <Sidebar
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
          />

          {/* Main Area (Adjusts with desktop sidebar collapsed state) */}
          <div className={`flex-1 flex flex-col transition-all duration-300 ${
            isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
          }`}>
            {/* Top Navbar with Hamburger */}
            <Navbar
              onToggleSidebar={handleToggleSidebar}
              isSidebarCollapsed={isSidebarCollapsed}
            />

            {/* Page Content */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              <Routes>
                {/* Discover */}
                <Route path="/" element={<Home />} />
                <Route path="/explore-map" element={<ExploreMap />} />
                <Route path="/destinations" element={<DiscoverPlaces />} />
                <Route path="/destinations/:id" element={<DestinationDetail />} />
                <Route path="/destinations/:destinationId/reviews" element={<ReviewsPage />} />
                <Route path="/search-trips" element={<SearchTrips />} />

                {/* Travel */}
                <Route path="/trips/:id" element={<TripDetail />} />
                <Route path="/create-trip" element={<CreateTrip />} />
                <Route path="/my-trips" element={<MyTrips />} />
                <Route path="/travel-groups" element={<TravelGroups />} />
                <Route path="/open-to-travel" element={<OpenToTravel />} />

                {/* Plan */}
                <Route path="/tripzy-ai" element={<TripzyAiPage />} />
                <Route path="/trip-planner" element={<TripPlanner />} />
                <Route path="/budget-calculator" element={<BudgetCalculator />} />
                <Route path="/itinerary-builder" element={<ItineraryBuilder />} />
                <Route path="/trips/:tripId/builder" element={<ItineraryBuilder />} />
                <Route path="/destination-compare" element={<DestinationCompare />} />
                <Route path="/wishlist" element={<TravelWishlist />} />
                <Route path="/packing-checklist" element={<PackingChecklist />} />

                {/* Community */}
                <Route path="/community" element={<TravelCommunity />} />
                <Route path="/travel-diary" element={<TravelDiary />} />
                <Route path="/reviews" element={<ReviewsPage />} />

                {/* Safety & Account */}
                <Route path="/safety-support" element={<SafetySupport />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/admin" element={<AdminDashboard />} />

                {/* Auth */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Footer */}
            <footer className="border-t border-forest bg-forest px-6 py-8 text-center sm:text-left text-xs text-linen/80">
              <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-linen tracking-wider">TRIPZY</span> — See a Place. Find Your People. Travel Together.
                </div>
                <div className="flex flex-wrap gap-4 text-soft">
                  <a href="/safety-support" className="underline-offset-4 hover:text-white hover:underline transition">Trust & Safety</a>
                  <a href="/explore-map" className="underline-offset-4 hover:text-white hover:underline transition">Interactive Map</a>
                  <a href="/community" className="underline-offset-4 hover:text-white hover:underline transition">Community Hub</a>
                </div>
                <div>
                  © {new Date().getFullYear()} Tripzy Inc. All rights reserved.
                </div>
              </div>
            </footer>
          </div>

          {/* Global Floating AI Chat Widget */}
          <FloatingAiChat />
        </div>
      </Router>
    </AuthProvider>
  );
}
