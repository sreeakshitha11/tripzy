import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home, Map, Camera, Compass, Search, PlusCircle, Briefcase,
  Users, UserCheck, Bot, Calendar, Calculator, Route, GitCompare,
  Heart, CheckSquare, MessageSquare, BookOpen, Star, ShieldAlert,
  Bell, User, Settings, Shield, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, setIsOpen, isCollapsed, setIsCollapsed }) {
  const location = useLocation();
  const { user } = useAuth();

  const sections = [
    {
      title: "DISCOVER",
      items: [
        { name: "Home", path: "/", icon: Home },
        { name: "Explore Map", path: "/explore-map", icon: Map },
        { name: "Discover Places", path: "/destinations", icon: Compass },
        { name: "Search Trips", path: "/search-trips", icon: Search },
      ]
    },
    {
      title: "TRAVEL",
      items: [
        { name: "Create Trip", path: "/create-trip", icon: PlusCircle },
        { name: "My Trips", path: "/my-trips", icon: Briefcase },
        { name: "Travel Groups", path: "/travel-groups", icon: Users },
        { name: "Open-to-Travel", path: "/open-to-travel", icon: UserCheck },
      ]
    },
    {
      title: "PLAN",
      items: [
        { name: "Tripzy AI", path: "/tripzy-ai", icon: Bot, badge: "Smart" },
        { name: "Trip Planner", path: "/trip-planner", icon: Calendar },
        { name: "Budget Calculator", path: "/budget-calculator", icon: Calculator },
        { name: "Itinerary Builder", path: "/itinerary-builder", icon: Route },
        { name: "Destination Compare", path: "/destination-compare", icon: GitCompare },
        { name: "Travel Wishlist", path: "/wishlist", icon: Heart },
        { name: "Packing Checklist", path: "/packing-checklist", icon: CheckSquare },
      ]
    },
    {
      title: "COMMUNITY",
      items: [
        { name: "Travel Community", path: "/community", icon: MessageSquare },
        { name: "Travel Diary", path: "/travel-diary", icon: BookOpen },
        { name: "Reviews & Ratings", path: "/reviews", icon: Star },
      ]
    },
    {
      title: "SAFETY & ACCOUNT",
      items: [
        { name: "Safety & Support", path: "/safety-support", icon: ShieldAlert },
        { name: "Notifications", path: "/notifications", icon: Bell },
        { name: "My Profile", path: "/profile", icon: User },
        { name: "Settings", path: "/settings", icon: Settings },
      ]
    }
  ];

  if (user && user.role === 'ROLE_ADMIN') {
    sections.push({
      title: "ADMINISTRATION",
      items: [
        { name: "Admin Dashboard", path: "/admin", icon: Shield, badge: "Admin" }
      ]
    });
  }

  const handleNavClick = () => {
    // Auto-close on mobile
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-forest/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-forest text-soft flex flex-col border-r border-white/10 transition-all duration-300 ease-in-out shadow-2xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64 w-72'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 bg-trail-950">
          <NavLink to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-sage flex items-center justify-center text-forest shrink-0">
              <Camera className="w-5 h-5 text-forest" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-xl text-linen tracking-wider flex items-center gap-1">
                  TRIPZY <span className="w-1.5 h-1.5 rounded-full bg-sage"></span>
                </span>
                <span className="text-[10px] text-sage font-medium tracking-tight truncate">
                  Travel Companion
                </span>
              </div>
            )}
          </NavLink>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-soft hover:text-white hover:bg-white/10 transition"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-soft hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
          {sections.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 text-[11px] font-bold text-sage tracking-wider uppercase mb-2">
                  {sec.title}
                </div>
              )}
              {isCollapsed && (
                <div className="h-px bg-white/10 my-2" />
              )}

              {sec.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <NavLink
                    key={itemIdx}
                    to={item.path}
                    onClick={handleNavClick}
                    title={isCollapsed ? item.name : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all group relative
                      ${isActive
                        ? 'bg-pine text-white font-semibold border-l-4 border-sage pl-2'
                        : 'text-soft hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-sage group-hover:text-white'}`} />

                    {!isCollapsed && (
                      <span className="truncate flex-1">{item.name}</span>
                    )}

                    {!isCollapsed && item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 bg-soft text-forest">
                        {item.badge}
                      </span>
                    )}

                    {/* Collapsed Tooltip */}
                    {isCollapsed && (
                      <div className="fixed left-20 ml-2 hidden group-hover:flex items-center bg-forest text-linen text-xs px-2.5 py-1.5 rounded-md shadow-xl border border-white/10 whitespace-nowrap z-50 pointer-events-none">
                        {item.name}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Card in Footer */}
        {user && (
          <div className="p-3 border-t border-white/10 bg-trail-950">
            <NavLink
              to="/profile"
              onClick={handleNavClick}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition group"
            >
              <img
                src={user.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                alt={user.fullName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-sage/60 shrink-0"
              />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-linen truncate group-hover:text-white transition">
                    {user.fullName}
                  </div>
                  <div className="text-[11px] text-sage truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage"></span>
                    {user.travelStyle || 'Traveler'}
                  </div>
                </div>
              )}
            </NavLink>
          </div>
        )}
      </aside>
    </>
  );
}
