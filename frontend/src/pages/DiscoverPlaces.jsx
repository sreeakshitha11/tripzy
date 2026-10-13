import React, { useState, useEffect } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { Compass, Search, Star, MapPin, DollarSign, Calendar, ArrowRight, Filter } from 'lucide-react';
import api from '../api/client';

export default function DiscoverPlaces() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || '';

  const [destinations, setDestinations] = useState([]);
  const [query, setQuery] = useState(initialQuery);
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const tags = ['ALL', 'Mountains', 'Adventure', 'Beaches', 'Snow', 'Culture', 'Temples', 'Heritage'];

  useEffect(() => {
    fetchDestinations(initialQuery);
  }, [initialQuery]);

  const fetchDestinations = async (searchStr) => {
    setLoading(true);
    try {
      const res = await api.get('/destinations', {
        params: { query: searchStr }
      });
      setDestinations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDestinations(query);
  };

  const filtered = destinations.filter(d => {
    if (selectedTag === 'ALL') return true;
    return d.tags && d.tags.toLowerCase().includes(selectedTag.toLowerCase());
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-forest font-display">
          Discover Places
        </h1>
        <p className="text-sm text-moss-500">
          Find your dream location and discover solo-traveler friendly groups ready to explore together.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl shadow-soft border border-moss-200/80 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-moss-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by city, country, or attraction..."
            className="w-full pl-10 pr-4 py-2.5 bg-moss-50 focus:bg-white text-sm rounded-2xl border border-moss-200 focus:border-pine outline-none"
          />
        </form>

        {/* Filter Tags */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedTag === tag
                  ? 'bg-forest text-white shadow-sm'
                  : 'bg-moss-100 hover:bg-moss-200 text-moss-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Destinations Grid */}
      {loading ? (
        <div className="text-center py-20 text-moss-400 text-sm">
          Loading destinations...
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((dest) => (
            <NavLink
              key={dest.id}
              to={`/destinations/${dest.id}`}
              className="bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-premium border border-moss-200/80 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={dest.heroImageUrl}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{dest.rating}</span>
                  </div>
                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-forest/90 backdrop-blur-md text-white text-xs font-medium">
                    {dest.city}, {dest.country}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-lg text-forest group-hover:text-trail-600 transition">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-moss-500 line-clamp-2 leading-relaxed">
                    {dest.description}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-1">
                    {dest.tags?.split(',').map((t, i) => (
                      <span key={i} className="text-[10px] font-semibold bg-moss-100 text-moss-600 px-2 py-0.5 rounded-md">
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="pt-3 border-t border-moss-100 flex items-center justify-between text-xs text-moss-500">
                  <span>Best: <strong className="text-moss-800">{dest.bestTimeToVisit?.split('(')[0]}</strong></span>
                  <span className="font-bold text-trail-700 flex items-center gap-1 group-hover:translate-x-1 transition">
                    View Place &rarr;
                  </span>
                </div>
              </div>
            </NavLink>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-moss-200 p-8">
          <Compass className="w-12 h-12 text-moss-300 mx-auto mb-2" />
          <h3 className="font-bold text-moss-700">No destinations found matching "{query}"</h3>
          <p className="text-xs text-moss-400 mt-1">Try searching another location or clear filter.</p>
        </div>
      )}
    </div>
  );
}
