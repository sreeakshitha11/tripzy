import React, { useState, useEffect } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import {
  MapPin, Star, Calendar, IndianRupee, Heart, PlusCircle,
  Bot, Utensils, Navigation, Info, Users, ArrowRight, Share2, MessageSquare
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatRupees } from '../utils/currency';

export default function DestinationDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [destination, setDestination] = useState(null);
  const [trips, setTrips] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistSaved, setWishlistSaved] = useState(false);
  const [newReviewText, setNewReviewText] = useState('');
  const [newRating, setNewRating] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [destRes, tripsRes, revRes] = await Promise.all([
          api.get(`/destinations/${id}`),
          api.get('/trips'),
          api.get(`/reviews/destination/${id}`)
        ]);
        setDestination(destRes.data);
        setTrips(tripsRes.data.filter(t => t.destinationId === Number(id)));
        setReviews(revRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSaveWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await api.post(`/wishlist/destinations/${id}`, { notes: "Saved from destination detail" });
      setWishlistSaved(true);
      setTimeout(() => setWishlistSaved(false), 3000);
    } catch (err) {}
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!newReviewText.trim()) return;

    try {
      const res = await api.post('/reviews', {
        destinationId: Number(id),
        rating: newRating,
        comment: newReviewText.trim()
      });
      setReviews([res.data, ...reviews]);
      setNewReviewText('');
    } catch (err) {
      alert("Failed to submit review");
    }
  };

  if (loading || !destination) {
    return <div className="py-20 text-center text-sm text-moss-400">Loading destination details...</div>;
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Hero Header */}
      <div className="relative h-96 rounded-3xl overflow-hidden shadow-xl">
        <img
          src={destination.heroImageUrl}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-forest/30 to-transparent" />

        <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-4 text-white">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-soft text-xs font-semibold">
              <MapPin className="w-4 h-4" />
              <span>{destination.city}, {destination.stateOrCountry}, {destination.country}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold font-display">
              {destination.name}
            </h1>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 bg-amber-400/90 text-forest px-2.5 py-1 rounded-full font-bold">
                <Star className="w-3.5 h-3.5 fill-white" />
                {destination.rating} ({destination.reviewCount} Reviews)
              </span>
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                Best: {destination.bestTimeToVisit}
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveWishlist}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 ${
                wishlistSaved
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-moss-900'
              }`}
            >
              <Heart className={`w-4 h-4 ${wishlistSaved ? 'fill-white' : ''}`} />
              <span>{wishlistSaved ? 'Saved to Wishlist' : 'Save to Wishlist'}</span>
            </button>

            <NavLink
              to={`/create-trip?destinationId=${destination.id}&destinationName=${encodeURIComponent(destination.name)}`}
              className="px-5 py-2.5 rounded-2xl bg-pine hover:bg-forest text-white font-bold text-xs shadow-lg shadow-trail-500/30 transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Host a Trip Here</span>
            </NavLink>
          </div>
        </div>
      </div>

      {/* Main Grid: Details + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Overview, Food, Guide, Reviews */}
        <div className="lg:col-span-8 space-y-8">
          {/* Overview */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-moss-200/80 space-y-4">
            <h2 className="text-xl font-bold text-forest font-display">About {destination.name}</h2>
            <p className="text-sm text-moss-600 leading-relaxed whitespace-pre-line">
              {destination.overview || destination.description}
            </p>

            {/* Popular Attractions */}
            <div className="pt-4 border-t border-moss-100">
              <h3 className="font-bold text-xs uppercase tracking-wider text-moss-400 mb-2">
                Popular Attractions & Landmarks
              </h3>
              <p className="text-sm text-moss-800 font-medium">
                {destination.popularAttractions}
              </p>
            </div>
          </section>

          {/* Cuisine & Transportation Guide */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-soft border border-moss-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Utensils className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-forest">Local Cuisine & Food</h3>
              <p className="text-xs text-moss-600 leading-relaxed">
                {destination.cuisine || "Famous local regional specialties and culinary tours."}
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-soft border border-moss-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-trail-50 text-trail-600 flex items-center justify-center">
                <Navigation className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-forest">Transportation Guide</h3>
              <p className="text-xs text-moss-600 leading-relaxed">
                {destination.transportGuide || "Accessible via regional airports, express railways, and scenic highways."}
              </p>
            </div>
          </div>

          {/* Reviews & Ratings */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-moss-200/80 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-forest font-display">Traveler Reviews</h2>
                <p className="text-xs text-moss-500">Verified participant feedback and tips</p>
              </div>
              <span className="font-display font-extrabold text-2xl text-amber-700 flex items-center gap-1">
                <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                {destination.rating}
              </span>
            </div>

            {/* Write Review Form */}
            <form onSubmit={handleAddReview} className="bg-moss-50 p-4 rounded-2xl border border-moss-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-moss-700">Leave Your Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-1 outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine"
                    >
                      <Star className={`w-4 h-4 ${star <= newRating ? 'text-amber-400 fill-amber-400' : 'text-moss-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                placeholder="Share your experience, highlights, or tips for upcoming travelers..."
                rows="2"
                className="w-full p-3 text-xs bg-white rounded-xl border border-moss-200 focus:border-pine outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-forest hover:bg-pine text-white rounded-xl text-xs font-semibold shadow-sm transition"
              >
                Submit Review
              </button>
            </form>

            {/* Review List */}
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl border border-moss-100 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={rev.userAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"}
                        alt={rev.userName}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-trail-500"
                      />
                      <div>
                        <span className="font-semibold text-xs text-moss-900 block">{rev.userName}</span>
                        <span className="text-[10px] text-emerald-700 font-medium">Verified Companion Traveler</span>
                      </div>
                    </div>
                    <div className="flex items-center text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-moss-600 leading-relaxed pl-10">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Estimated Budget & Active Trips */}
        <div className="lg:col-span-4 space-y-6">
          {/* Estimated Budget Card */}
          <div className="bg-forest text-white p-6 rounded-3xl shadow-soft space-y-4">
            <h3 className="font-bold text-base font-display">Estimated Travel Costs</h3>
            <div className="text-3xl font-extrabold text-soft font-display">
              {formatRupees(destination.avgBudgetPerDay)} <span className="text-xs font-normal text-moss-300">/ day per person</span>
            </div>
            <p className="text-xs text-moss-300 leading-relaxed">
              *Clearly labeled as estimates based on moderate accommodations, dining, and local activities. Actual expenses depend on travel style and group size.
            </p>
            <NavLink
              to={`/budget-calculator?destination=${encodeURIComponent(destination.name)}&dailyCost=${destination.avgBudgetPerDay}`}
              className="block w-full py-2.5 text-center bg-pine hover:bg-forest text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Calculate Detailed Budget
            </NavLink>
          </div>

          {/* Active Trips Going Here */}
          <div className="bg-white p-6 rounded-3xl shadow-soft border border-moss-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-forest uppercase tracking-wider">
                Trips to {destination.name}
              </h3>
              <span className="text-xs font-semibold text-trail-600">{trips.length} active</span>
            </div>

            {trips.length > 0 ? (
              <div className="space-y-3">
                {trips.map((trip) => (
                  <div key={trip.id} className="p-3.5 rounded-2xl bg-moss-50 border border-moss-200/80 space-y-2">
                    <NavLink to={`/trips/${trip.id}`} className="font-bold text-xs text-forest hover:text-trail-600 line-clamp-1 block">
                      {trip.title}
                    </NavLink>
                    <div className="flex items-center justify-between text-[11px] text-moss-500">
                      <span>{trip.startDate}</span>
                      <span className="font-bold text-trail-600">{formatRupees(trip.estimatedBudget)}</span>
                    </div>
                    <NavLink
                      to={`/trips/${trip.id}`}
                      className="block text-center py-1.5 rounded-lg bg-pine text-white text-[11px] font-semibold hover:bg-forest transition"
                    >
                      Request to Join
                    </NavLink>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <Users className="w-8 h-8 text-moss-300 mx-auto" />
                <p className="text-xs text-moss-500">No active trips scheduled yet.</p>
                <NavLink
                  to={`/create-trip?destinationId=${destination.id}&destinationName=${encodeURIComponent(destination.name)}`}
                  className="inline-block text-xs text-trail-600 font-bold hover:underline"
                >
                  Be the first to create one &rarr;
                </NavLink>
              </div>
            )}
          </div>

          {/* Ask AI Widget */}
          <div className="bg-trail-50 p-6 rounded-3xl border border-trail-200/60 space-y-3">
            <div className="flex items-center gap-2 text-trail-900 font-bold text-sm">
              <Bot className="w-5 h-5 text-trail-600" />
              <span>Ask Tripzy AI About {destination.name}</span>
            </div>
            <p className="text-xs text-trail-800 leading-relaxed">
              Get customized advice regarding packing lists, route options, local etiquette, or safety guidelines.
            </p>
            <NavLink
              to={`/tripzy-ai?prompt=${encodeURIComponent(`Plan a complete trip to ${destination.name}`)}`}
              className="block w-full py-2.5 text-center bg-pine hover:bg-forest text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Open AI Chat
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}
