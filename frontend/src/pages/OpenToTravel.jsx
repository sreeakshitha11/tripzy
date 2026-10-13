import React, { useState, useEffect } from 'react';
import { UserCheck, Sparkles, MapPin, Heart, MessageCircle, Filter, Compass, PlusCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function OpenToTravel() {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const [travelers, setTravelers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpenToTravel, setIsOpenToTravel] = useState(user?.openToTravel ?? true);
  const [filterStyle, setFilterStyle] = useState('ALL');

  useEffect(() => {
    api.get('/open-to-travel/travelers')
      .then(res => setTravelers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleToggleOpen = async () => {
    const nextVal = !isOpenToTravel;
    setIsOpenToTravel(nextVal);
    if (isAuthenticated) {
      await updateProfile({ openToTravel: nextVal });
    }
  };

  const filtered = travelers.filter(t => {
    if (filterStyle === 'ALL') return true;
    return t.travelStyle?.toLowerCase().includes(filterStyle.toLowerCase());
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Opt-In Banner */}
      <div className="bg-forest text-white p-6 sm:p-10 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-trail-500/20 text-trail-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Companion Matching
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-display">
            Open-to-Travel Discovery
          </h1>
          <p className="text-xs sm:text-sm text-moss-300 leading-relaxed">
            Ready to explore but haven't settled on a fixed destination yet? Connect with like-minded solo travelers with flexible schedules and co-create an adventure together!
          </p>
        </div>

        {/* Toggle Status Card */}
        <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 text-center space-y-3 shrink-0">
          <span className="text-xs font-semibold block text-moss-200">Your Traveler Status</span>
          <button
            onClick={handleToggleOpen}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm ${
              isOpenToTravel
                ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                : 'bg-moss-200 text-moss-800 hover:bg-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>{isOpenToTravel ? 'Open to Travel: Active' : 'Status: Inactive'}</span>
          </button>
          <span className="text-[10px] text-soft block">Click to toggle your visibility</span>
        </div>
      </div>

      {/* Filter Styles */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs font-bold text-moss-500 uppercase tracking-wider mr-2">Filter Style:</span>
        {['ALL', 'Explorer', 'Backpacker', 'Adventurer', 'Cultural', 'Leisure'].map(st => (
          <button
            key={st}
            onClick={() => setFilterStyle(st)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
              filterStyle === st
                ? 'bg-forest text-white shadow-sm'
                : 'bg-white hover:bg-moss-100 text-moss-600 border border-moss-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Travelers Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-moss-400">Loading travelers...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(trav => (
            <div
              key={trav.id}
              className="bg-white rounded-3xl p-6 shadow-soft hover:shadow-premium border border-moss-200/80 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={trav.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                    alt={trav.fullName}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-trail-500 shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-base text-forest">{trav.fullName}</h3>
                    <span className="text-xs text-trail-700 font-semibold block">{trav.travelStyle || 'Explorer'}</span>
                    <span className="text-[10px] text-moss-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-moss-400" />
                      {trav.homeCity || 'Worldwide Explorer'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-moss-600 leading-relaxed line-clamp-3">
                  "{trav.bio || 'Passionate about discovering unseen trails and meeting spontaneous travel partners.'}"
                </p>

                <div className="flex items-center justify-between text-xs pt-3 border-t border-moss-100">
                  <span className="text-moss-500">Budget Style: <strong className="text-moss-800">{trav.budgetPreference || 'Moderate'}</strong></span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-trail-50 text-trail-800">
                    Trust: {trav.trustScore || 90}%
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <NavLink
                  to={`/tripzy-ai?prompt=${encodeURIComponent(`Suggest a shared trip itinerary between me and ${trav.fullName} who loves ${trav.travelStyle}`)}`}
                  className="w-full py-2.5 rounded-xl bg-moss-100 hover:bg-trail-50 hover:text-trail-800 text-moss-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-trail-600" />
                  <span>Suggest Match Itinerary</span>
                </NavLink>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
