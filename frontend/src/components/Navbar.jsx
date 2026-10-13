import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, User, LogOut, Shield, PlusCircle, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Navbar({ onToggleSidebar, isSidebarCollapsed }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/notifications/unread-count')
        .then(res => setUnreadCount(res.data.unreadCount || 0))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/destinations?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-moss-200/80 px-4 lg:px-8 flex items-center justify-between transition-all shadow-sm">
      {/* Left: Hamburger & Tagline */}
      <div className="flex items-center gap-4">
        {/* 3-line hamburger menu */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-moss-700 hover:text-trail-600 hover:bg-moss-100 transition outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine"
          title="Toggle Navigation Menu (☰)"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden md:flex flex-col">
          <span className="font-display font-bold text-moss-900 text-sm tracking-wide">
            TRIPZY
          </span>
          <span className="text-[11px] text-moss-500 font-medium italic">
            “See a Place. Find Your People. Travel Together.”
          </span>
        </div>
      </div>

      {/* Middle: Global Search */}
      <div className="flex-1 max-w-md mx-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-moss-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search destinations, trips, companions..."
            className="w-full pl-10 pr-4 py-2 bg-moss-100/80 hover:bg-moss-100 focus:bg-white text-sm rounded-full border border-moss-200 focus:border-pine focus:ring-2 focus:ring-pine/20 outline-none transition"
          />
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Create Trip Shortcut */}
        <NavLink
          to="/create-trip"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-forest text-white hover:bg-pine transition shadow-sm"
        >
          <PlusCircle className="w-3.5 h-3.5 text-trail-400" />
          <span>Host a Trip</span>
        </NavLink>

        {/* Notifications Bell */}
        {isAuthenticated && (
          <NavLink
            to="/notifications"
            className="relative p-2 rounded-xl text-moss-600 hover:text-trail-600 hover:bg-moss-100 transition"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </NavLink>
        )}

        {/* User Menu / Auth Buttons */}
        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-full hover:ring-2 hover:ring-trail-500/30 transition"
            >
              <img
                src={user?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                alt={user?.fullName || "User"}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-trail-500"
              />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-moss-100 py-2 z-50 text-sm animate-in fade-in"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-moss-100">
                  <p className="font-semibold text-moss-900 truncate">{user?.fullName}</p>
                  <p className="text-xs text-moss-500 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-trail-50 text-trail-700">
                    Trust Score: {user?.trustScore || 90}%
                  </span>
                </div>

                <NavLink to="/profile" className="flex items-center gap-2 px-4 py-2 text-moss-700 hover:bg-moss-50">
                  <User className="w-4 h-4 text-moss-500" /> My Profile
                </NavLink>
                <NavLink to="/my-trips" className="flex items-center gap-2 px-4 py-2 text-moss-700 hover:bg-moss-50">
                  <Compass className="w-4 h-4 text-moss-500" /> My Trips & Requests
                </NavLink>
                {user?.role === 'ROLE_ADMIN' && (
                  <NavLink to="/admin" className="flex items-center gap-2 px-4 py-2 text-trail-700 bg-trail-50/50 hover:bg-trail-50">
                    <Shield className="w-4 h-4 text-trail-600" /> Admin Dashboard
                  </NavLink>
                )}

                <div className="border-t border-moss-100 my-1" />
                <button
                  onClick={logout}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <NavLink
              to="/login"
              className="px-3.5 py-1.5 text-xs font-semibold text-moss-700 hover:text-trail-600 hover:bg-moss-100 rounded-lg transition"
            >
              Sign In
            </NavLink>
            <NavLink
              to="/register"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-pine hover:bg-forest rounded-lg shadow-sm shadow-trail-500/20 transition"
            >
              Join Tripzy
            </NavLink>
          </div>
        )}
      </div>
    </header>
  );
}
