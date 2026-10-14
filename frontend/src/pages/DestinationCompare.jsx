import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  GitCompare, Star, MapPin, Calendar, IndianRupee,
  Utensils, Navigation, PlusCircle, Heart, ArrowRight
} from 'lucide-react';
import api from '../api/client';
import { formatRupees } from '../utils/currency';

export default function DestinationCompare() {
  const [destinations, setDestinations] = useState([]);
  const [selectedId1, setSelectedId1] = useState('');
  const [selectedId2, setSelectedId2] = useState('');
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    Promise.all([api.get('/destinations'), api.get('/trips')])
      .then(([destRes, tripRes]) => {
        setDestinations(destRes.data);
        setTrips(tripRes.data);
        if (destRes.data.length >= 2) {
          setSelectedId1(destRes.data[0].id);
          setSelectedId2(destRes.data[1].id);
        }
      })
      .catch(console.error);
  }, []);

  const dest1 = destinations.find(d => d.id === Number(selectedId1));
  const dest2 = destinations.find(d => d.id === Number(selectedId2));

  const trips1 = trips.filter(t => t.destinationId === Number(selectedId1));
  const trips2 = trips.filter(t => t.destinationId === Number(selectedId2));

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-trail-100 text-trail-800 text-xs font-bold uppercase tracking-wider">
          <GitCompare className="w-3.5 h-3.5 text-trail-600" />
          <span>Decision Assistant</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-forest font-display">
          Compare Destinations
        </h1>
        <p className="text-sm text-moss-500">
          Compare two dream locations side-by-side to choose the best destination for your upcoming journey.
        </p>
      </div>

      {/* Selectors */}
      <div className="bg-white p-6 rounded-3xl shadow-soft border border-moss-200/80 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-bold text-moss-500 uppercase tracking-wider block mb-2">First Destination</label>
          <select
            value={selectedId1}
            onChange={(e) => setSelectedId1(e.target.value)}
            className="w-full p-3 bg-moss-50 border border-moss-200 rounded-xl text-sm font-semibold outline-none focus:border-pine text-moss-900 placeholder:text-moss-600"
          >
            {destinations.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.city}, {d.country})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-moss-500 uppercase tracking-wider block mb-2">Second Destination</label>
          <select
            value={selectedId2}
            onChange={(e) => setSelectedId2(e.target.value)}
            className="w-full p-3 bg-moss-50 border border-moss-200 rounded-xl text-sm font-semibold outline-none focus:border-pine"
          >
            {destinations.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.city}, {d.country})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Grid */}
      {dest1 && dest2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-soft border border-moss-200/80 space-y-6">
            <div className="relative h-60 overflow-hidden">
              <img src={dest1.heroImageUrl} alt={dest1.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs font-semibold text-soft">{dest1.city}, {dest1.country}</span>
                <h3 className="text-2xl font-bold font-display">{dest1.name}</h3>
              </div>
            </div>

            <div className="p-6 pt-0 space-y-4 text-xs">
              <div className="flex justify-between py-2 border-b border-moss-100">
                <span className="text-moss-500">Rating</span>
                <strong className="flex items-center gap-1 text-moss-800">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {dest1.rating} ({dest1.reviewCount} reviews)
                </strong>
              </div>

              <div className="flex justify-between py-2 border-b border-moss-100">
                <span className="text-moss-500">Est. Daily Budget</span>
                <strong className="text-trail-700 text-sm font-bold">{formatRupees(dest1.avgBudgetPerDay)}/day</strong>
              </div>

              <div className="flex justify-between py-2 border-b border-moss-100">
                <span className="text-moss-500">Best Season</span>
                <strong>{dest1.bestTimeToVisit}</strong>
              </div>

              <div className="py-2 border-b border-moss-100 space-y-1">
                <span className="text-moss-500 block">Top Landmarks</span>
                <p className="text-moss-800 font-medium leading-relaxed">{dest1.popularAttractions}</p>
              </div>

              <div className="py-2 border-b border-moss-100 space-y-1">
                <span className="text-moss-500 block">Local Cuisine</span>
                <p className="text-moss-800 font-medium">{dest1.cuisine}</p>
              </div>

              <div className="flex justify-between py-2 border-b border-moss-100">
                <span className="text-moss-500">Active Trips on Tripzy</span>
                <strong className="text-emerald-700">{trips1.length} Trips Available</strong>
              </div>

              <div className="pt-2 flex gap-2">
                <NavLink
                  to={`/destinations/${dest1.id}`}
                  className="flex-1 py-2.5 rounded-xl bg-moss-100 hover:bg-moss-200 text-moss-800 font-bold text-center transition"
                >
                  View Details
                </NavLink>
                <NavLink
                  to={`/create-trip?destinationId=${dest1.id}&destinationName=${encodeURIComponent(dest1.name)}`}
                  className="flex-1 py-2.5 rounded-xl bg-forest hover:bg-pine text-white font-bold text-center transition shadow-sm"
                >
                  Host Trip Here
                </NavLink>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-soft border border-moss-200/80 space-y-6">
            <div className="relative h-60 overflow-hidden">
              <img src={dest2.heroImageUrl} alt={dest2.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs font-semibold text-soft">{dest2.city}, {dest2.country}</span>
                <h3 className="text-2xl font-bold font-display">{dest2.name}</h3>
              </div>
            </div>

            <div className="p-6 pt-0 space-y-4 text-xs">
              <div className="flex justify-between py-2 border-b border-moss-100">
                <span className="text-moss-500">Rating</span>
                <strong className="flex items-center gap-1 text-moss-800">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  {dest2.rating} ({dest2.reviewCount} reviews)
                </strong>
              </div>

              <div className="flex justify-between py-2 border-b border-moss-100">
                <span className="text-moss-500">Est. Daily Budget</span>
                <strong className="text-trail-700 text-sm font-bold">{formatRupees(dest2.avgBudgetPerDay)}/day</strong>
              </div>

              <div className="flex justify-between py-2 border-b border-moss-100">
                <span className="text-moss-500">Best Season</span>
                <strong>{dest2.bestTimeToVisit}</strong>
              </div>

              <div className="py-2 border-b border-moss-100 space-y-1">
                <span className="text-moss-500 block">Top Landmarks</span>
                <p className="text-moss-800 font-medium leading-relaxed">{dest2.popularAttractions}</p>
              </div>

              <div className="py-2 border-b border-moss-100 space-y-1">
                <span className="text-moss-500 block">Local Cuisine</span>
                <p className="text-moss-800 font-medium">{dest2.cuisine}</p>
              </div>

              <div className="flex justify-between py-2 border-b border-moss-100">
                <span className="text-moss-500">Active Trips on Tripzy</span>
                <strong className="text-emerald-700">{trips2.length} Trips Available</strong>
              </div>

              <div className="pt-2 flex gap-2">
                <NavLink
                  to={`/destinations/${dest2.id}`}
                  className="flex-1 py-2.5 rounded-xl bg-moss-100 hover:bg-moss-200 text-moss-800 font-bold text-center transition"
                >
                  View Details
                </NavLink>
                <NavLink
                  to={`/create-trip?destinationId=${dest2.id}&destinationName=${encodeURIComponent(dest2.name)}`}
                  className="flex-1 py-2.5 rounded-xl bg-forest hover:bg-pine text-white font-bold text-center transition shadow-sm"
                >
                  Host Trip Here
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
