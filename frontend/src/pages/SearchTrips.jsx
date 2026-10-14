import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Search, Filter, MapPin, Calendar, Users, IndianRupee,
  ShieldCheck, ArrowRight, Compass, PlusCircle
} from 'lucide-react';
import api from '../api/client';
import { formatRupees } from '../utils/currency';

export default function SearchTrips() {
  const [trips, setTrips] = useState([]);
  const [destination, setDestination] = useState('');
  const [category, setCategory] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = ['All Categories', 'Adventure', 'Leisure & Beach', 'Biking & Roadtrip', 'Culture', 'Nature'];

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const res = await api.get('/trips', {
        params: {
          destination: destination || undefined,
          category: category && category !== 'All Categories' ? category : undefined,
          maxBudget: maxBudget ? Number(maxBudget) : undefined
        }
      });
      setTrips(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchTrips();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-forest font-display">
            Find Your Travel Group
          </h1>
          <p className="text-sm text-moss-500">
            Browse upcoming journeys organized by passionate travelers and request to join.
          </p>
        </div>
        <NavLink
          to="/create-trip"
          className="px-5 py-2.5 rounded-2xl bg-forest hover:bg-pine text-white font-bold text-xs shadow-md transition flex items-center gap-2 w-fit"
        >
          <PlusCircle className="w-4 h-4 text-trail-400" />
          <span>Host Your Own Trip</span>
        </NavLink>
      </div>

      {/* Filter Form */}
      <form
        onSubmit={handleFilterSubmit}
        className="bg-white p-5 rounded-3xl shadow-soft border border-moss-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
      >
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-moss-700">Destination</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-moss-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Manali, Goa, Ladakh..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-moss-50 border border-moss-200 rounded-xl focus:bg-white focus:border-pine outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-moss-700">Trip Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-moss-50 border border-moss-200 rounded-xl focus:bg-white focus:border-pine outline-none"
          >
            {categories.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-moss-700">Max Budget (₹)</label>
          <div className="relative">
            <IndianRupee className="w-4 h-4 text-moss-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              placeholder="e.g. 25000"
              className="w-full pl-9 pr-3 py-2 text-xs bg-moss-50 border border-moss-200 rounded-xl focus:bg-white focus:border-pine outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-pine hover:bg-forest text-white font-bold text-xs transition shadow-sm flex items-center justify-center gap-1.5"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Apply Filters</span>
        </button>
      </form>

      {/* Trips Grid */}
      {loading ? (
        <div className="py-20 text-center text-moss-400 text-sm">Loading trips...</div>
      ) : trips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => {
            const spotsLeft = trip.maxParticipants - trip.currentParticipants;
            return (
              <div
                key={trip.id}
                className="bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-premium border border-moss-200/80 transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={trip.coverImageUrl}
                      alt={trip.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-forest/80 text-white text-[10px] font-semibold">
                      {trip.category}
                    </div>
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-pine text-white font-extrabold text-xs">
                      {formatRupees(trip.estimatedBudget)}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-moss-500">
                      <MapPin className="w-3.5 h-3.5 text-trail-600" />
                      <span className="font-semibold text-moss-700">{trip.destinationName}</span>
                      <span>•</span>
                      <Calendar className="w-3.5 h-3.5 text-moss-400" />
                      <span>{trip.startDate}</span>
                    </div>

                    <NavLink to={`/trips/${trip.id}`}>
                      <h3 className="font-bold text-base text-forest hover:text-trail-600 transition line-clamp-1">
                        {trip.title}
                      </h3>
                    </NavLink>

                    <p className="text-xs text-moss-500 line-clamp-2 leading-relaxed">
                      {trip.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-moss-100 text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={trip.organizerAvatar}
                          alt={trip.organizerName}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-trail-500"
                        />
                        <span className="text-moss-800 font-medium text-xs">{trip.organizerName}</span>
                      </div>
                      <span className="font-bold text-emerald-700 text-[11px]">
                        {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Trip Full'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex gap-2">
                  <NavLink
                    to={`/trips/${trip.id}`}
                    className="flex-1 text-center py-2 rounded-xl bg-moss-100 hover:bg-moss-200 text-moss-700 text-xs font-semibold transition"
                  >
                    View Details
                  </NavLink>
                  <NavLink
                    to={`/trips/${trip.id}`}
                    className="flex-1 text-center py-2 rounded-xl bg-pine hover:bg-forest text-white text-xs font-semibold transition shadow-sm"
                  >
                    Join Trip
                  </NavLink>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-moss-200 p-8 space-y-3">
          <Compass className="w-12 h-12 text-moss-300 mx-auto" />
          <h3 className="font-bold text-moss-700">No trips found matching your criteria</h3>
          <p className="text-xs text-moss-400">Try adjusting your filters or be the first to create one!</p>
          <NavLink
            to="/create-trip"
            className="inline-block mt-2 px-5 py-2 rounded-xl bg-pine text-white text-xs font-bold"
          >
            Create This Trip
          </NavLink>
        </div>
      )}
    </div>
  );
}
