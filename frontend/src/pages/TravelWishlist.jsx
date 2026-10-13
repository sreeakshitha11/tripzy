import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Heart, Trash2, MapPin, ArrowRight, Compass, PlusCircle } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function TravelWishlist() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    }
  }, [isAuthenticated]);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const res = await api.get('/wishlist');
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await api.delete(`/wishlist/${itemId}`);
      setItems(items.filter(i => i.id !== itemId));
    } catch (err) {
      alert("Failed to remove item");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center space-y-3">
        <Heart className="w-12 h-12 text-moss-300 mx-auto" />
        <h3 className="font-bold text-moss-700">Sign in to view your Travel Wishlist</h3>
        <p className="text-xs text-moss-400">Save destinations and trips from the map.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-forest font-display flex items-center gap-2">
          <Heart className="w-8 h-8 text-red-500 fill-red-500" />
          <span>My Travel Wishlist</span>
        </h1>
        <p className="text-sm text-moss-500">
          Saved bucket-list destinations and adventures you plan to experience.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-moss-400">Loading wishlist...</div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-premium border border-moss-200/80 transition flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={item.imageUrl || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-600 transition"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-forest/90 text-white text-[10px] font-semibold">
                    {item.itemType}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-base text-forest line-clamp-1">
                    {item.title}
                  </h3>
                  {item.notes && (
                    <p className="text-xs text-moss-500 italic">
                      "{item.notes}"
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0 flex gap-2">
                <NavLink
                  to={item.destinationId ? `/destinations/${item.destinationId}` : `/trips/${item.tripId}`}
                  className="flex-1 py-2 text-center rounded-xl bg-moss-100 hover:bg-moss-200 text-moss-800 text-xs font-semibold transition"
                >
                  View Details
                </NavLink>
                {item.destinationId && (
                  <NavLink
                    to={`/create-trip?destinationId=${item.destinationId}&destinationName=${encodeURIComponent(item.title)}`}
                    className="flex-1 py-2 text-center rounded-xl bg-forest hover:bg-pine text-white text-xs font-bold transition shadow-xs"
                  >
                    Create Trip
                  </NavLink>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-moss-200 space-y-3">
          <Heart className="w-10 h-10 text-moss-300 mx-auto" />
          <h3 className="font-bold text-moss-700">Your wishlist is empty</h3>
          <p className="text-xs text-moss-400">Discover incredible destinations and click "Save to Wishlist" to save them here!</p>
          <NavLink to="/destinations" className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-pine text-white text-xs font-bold">
            Explore Destinations
          </NavLink>
        </div>
      )}
    </div>
  );
}
