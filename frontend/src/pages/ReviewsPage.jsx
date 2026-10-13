import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageSquare, Plus, Filter, Compass, CheckCircle2, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [selectedDestId, setSelectedDestId] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [newReview, setNewReview] = useState({
    destinationId: '',
    rating: 5,
    title: '',
    comment: '',
    visitSeason: 'Autumn',
    recommendedDays: 4,
    tags: 'Sightseeing, Culture'
  });

  useEffect(() => {
    fetchDestinations();
    fetchReviews();
  }, [selectedDestId]);

  const fetchDestinations = async () => {
    try {
      const res = await client.get('/destinations');
      setDestinations(res.data || []);
      if (res.data && res.data.length > 0 && !newReview.destinationId) {
        setNewReview(prev => ({ ...prev, destinationId: res.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      if (selectedDestId) {
        const res = await client.get(`/reviews/destination/${selectedDestId}`);
        setReviews(res.data || []);
      } else {
        const res = await client.get('/reviews/recent');
        setReviews(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (id) => {
    try {
      await client.post(`/reviews/${id}/helpful`);
      setReviews(reviews.map(r => r.id === id ? { ...r, helpfulVotes: (r.helpfulVotes || 0) + 1 } : r));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to submit a review!");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        destinationId: Number(newReview.destinationId),
        rating: Number(newReview.rating),
        title: newReview.title,
        comment: newReview.comment,
        visitSeason: newReview.visitSeason,
        recommendedDays: Number(newReview.recommendedDays),
        tags: newReview.tags.split(',').map(s => s.trim()).filter(Boolean)
      };
      const res = await client.post('/reviews', payload);
      setReviews([res.data, ...reviews]);
      setShowModal(false);
      setNewReview({
        destinationId: destinations[0]?.id || '',
        rating: 5,
        title: '',
        comment: '',
        visitSeason: 'Autumn',
        recommendedDays: 4,
        tags: 'Sightseeing, Culture'
      });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReviews = reviews.filter(r => {
    if (!ratingFilter) return true;
    return r.rating === Number(ratingFilter);
  });

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '4.8';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Hero Banner */}
      <div className="bg-white border border-moss-200 rounded-3xl p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 text-xs font-semibold uppercase tracking-wider mb-3">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-700" /> Traveler Ratings & Reviews
          </div>
          <h1 className="text-3xl font-display font-bold text-forest tracking-tight">
            Honest Travel Feedback from Real Companions
          </h1>
          <p className="text-moss-500 text-sm mt-2 max-w-xl">
            Browse verified community ratings, safety scores, season tips, and honest reviews before booking your next trip.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-3 rounded-xl bg-pine hover:bg-forest text-white font-semibold flex items-center gap-2 shadow-lg shadow-trail-500/20 transition shrink-0"
        >
          <Plus className="w-4 h-4" /> Write a Review
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-moss-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-xl">
            ★ {avgRating}
          </div>
          <div>
            <div className="text-xs text-moss-500">Average Score</div>
            <div className="text-lg font-bold text-forest">Out of 5.0</div>
          </div>
        </div>
        <div className="bg-white border border-moss-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-trail-500/10 text-trail-600 flex items-center justify-center font-bold text-xl">
            {reviews.length}
          </div>
          <div>
            <div className="text-xs text-moss-500">Total Reviews</div>
            <div className="text-lg font-bold text-forest">Community Shared</div>
          </div>
        </div>
        <div className="bg-white border border-moss-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold text-xl">
            100%
          </div>
          <div>
            <div className="text-xs text-moss-500">Verified Stays</div>
            <div className="text-lg font-bold text-forest">Authentic Voices</div>
          </div>
        </div>
        <div className="bg-white border border-moss-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-trail-500/10 text-trail-700 flex items-center justify-center font-bold text-xl">
            {destinations.length}
          </div>
          <div>
            <div className="text-xs text-moss-500">Locations</div>
            <div className="text-lg font-bold text-forest">Covered</div>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl border border-moss-200">
        <div className="flex items-center gap-2 text-moss-600 text-sm font-medium">
          <Filter className="w-4 h-4 text-trail-600" /> Filter:
        </div>
        <select
          value={selectedDestId}
          onChange={(e) => setSelectedDestId(e.target.value)}
          className="bg-white border border-moss-200 rounded-xl px-4 py-2 text-sm text-forest focus:outline-none focus:border-pine"
        >
          <option value="">All Destinations</option>
          {destinations.map(d => (
            <option key={d.id} value={d.id}>{d.name}, {d.country}</option>
          ))}
        </select>
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="bg-white border border-moss-200 rounded-xl px-4 py-2 text-sm text-forest focus:outline-none focus:border-pine"
        >
          <option value="">All Star Ratings</option>
          <option value="5">5 Stars only</option>
          <option value="4">4 Stars only</option>
          <option value="3">3 Stars only</option>
        </select>
        {reviews.length > 0 && (
          <span className="text-xs text-moss-500 ml-auto">
            Showing {filteredReviews.length} reviews
          </span>
        )}
      </div>

      {/* Review List */}
      {loading ? (
        <div className="py-20 text-center text-moss-500 animate-pulse">Loading reviews...</div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white border border-moss-200 rounded-2xl p-12 text-center">
          <Star className="w-12 h-12 text-moss-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-forest">No reviews found</h3>
          <p className="text-moss-500 text-sm mt-1">Be the first to share your experience with fellow travelers!</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-pine text-white font-medium text-sm hover:bg-forest transition"
          >
            Leave First Review
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReviews.map(r => (
            <div key={r.id} className="bg-white border border-moss-200 rounded-2xl p-6 hover:border-moss-200 transition flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-moss-100 border border-moss-200 overflow-hidden flex items-center justify-center font-bold text-moss-600">
                      {r.userAvatar ? (
                        <img src={r.userAvatar} alt={r.userName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-moss-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-forest flex items-center gap-1.5">
                        {r.userName || "Traveler"}
                        <CheckCircle2 className="w-3.5 h-3.5 text-trail-600" />
                      </h4>
                      <p className="text-xs text-trail-600 font-medium">
                        {r.destinationName ? `Visited ${r.destinationName}` : "Verified Explorer"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {r.rating}.0
                  </div>
                </div>

                <h3 className="text-base font-bold text-forest mb-2">{r.title}</h3>
                <p className="text-moss-600 text-sm leading-relaxed mb-4">{r.comment}</p>

                {r.tags && r.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {r.tags.map((t, i) => (
                      <span key={i} className="text-[11px] px-2.5 py-0.5 rounded-full bg-moss-100 text-moss-600 border border-moss-200">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-moss-200 flex items-center justify-between text-xs text-moss-500">
                <div className="flex items-center gap-3">
                  {r.visitSeason && <span>Season: <b className="text-moss-800">{r.visitSeason}</b></span>}
                  {r.recommendedDays && <span>Recommended: <b className="text-moss-800">{r.recommendedDays} days</b></span>}
                </div>
                <button
                  onClick={() => handleHelpful(r.id)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-moss-100 hover:bg-moss-200 text-moss-600 hover:text-forest transition"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-trail-600" /> Helpful ({r.helpfulVotes || 0})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/60 backdrop-blur-sm">
          <div className="bg-white border border-moss-200 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h2 className="text-xl font-bold text-forest">Write a Review</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-moss-500 block mb-1">Destination</label>
                <select
                  value={newReview.destinationId}
                  onChange={e => setNewReview({ ...newReview, destinationId: e.target.value })}
                  required
                  className="w-full bg-white border border-moss-200 rounded-xl px-3 py-2 text-sm text-forest focus:outline-none focus:border-pine"
                >
                  {destinations.map(d => (
                    <option key={d.id} value={d.id}>{d.name}, {d.country}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-moss-500 block mb-1">Rating (1 to 5)</label>
                  <select
                    value={newReview.rating}
                    onChange={e => setNewReview({ ...newReview, rating: e.target.value })}
                    className="w-full bg-white border border-moss-200 rounded-xl px-3 py-2 text-sm text-forest focus:outline-none focus:border-pine"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ 5 - Exceptional</option>
                    <option value="4">⭐⭐⭐⭐ 4 - Great</option>
                    <option value="3">⭐⭐⭐ 3 - Average</option>
                    <option value="2">⭐⭐ 2 - Disappointing</option>
                    <option value="1">⭐ 1 - Not Recommended</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-moss-500 block mb-1">Season Visited</label>
                  <select
                    value={newReview.visitSeason}
                    onChange={e => setNewReview({ ...newReview, visitSeason: e.target.value })}
                    className="w-full bg-white border border-moss-200 rounded-xl px-3 py-2 text-sm text-forest focus:outline-none focus:border-pine"
                  >
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Autumn">Autumn</option>
                    <option value="Winter">Winter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-moss-500 block mb-1">Headline / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Unbelievable mountain sunsets & safe solo trails"
                  value={newReview.title}
                  onChange={e => setNewReview({ ...newReview, title: e.target.value })}
                  required
                  className="w-full bg-white border border-moss-200 rounded-xl px-3 py-2 text-sm text-forest focus:outline-none focus:border-pine"
                />
              </div>

              <div>
                <label className="text-xs text-moss-500 block mb-1">Detailed Review & Tips</label>
                <textarea
                  rows="4"
                  placeholder="Share safety tips, recommended local spots, companion advice..."
                  value={newReview.comment}
                  onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                  required
                  className="w-full bg-white border border-moss-200 rounded-xl px-3 py-2 text-sm text-forest focus:outline-none focus:border-pine"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-moss-500 block mb-1">Recommended Stay (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={newReview.recommendedDays}
                    onChange={e => setNewReview({ ...newReview, recommendedDays: e.target.value })}
                    className="w-full bg-white border border-moss-200 rounded-xl px-3 py-2 text-sm text-forest focus:outline-none focus:border-pine"
                  />
                </div>
                <div>
                  <label className="text-xs text-moss-500 block mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={newReview.tags}
                    onChange={e => setNewReview({ ...newReview, tags: e.target.value })}
                    placeholder="Hiking, Food, Solo-friendly"
                    className="w-full bg-white border border-moss-200 rounded-xl px-3 py-2 text-sm text-forest focus:outline-none focus:border-pine"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-moss-100 text-moss-600 hover:bg-moss-200 text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-pine hover:bg-forest text-white text-sm font-semibold transition"
                >
                  {submitting ? "Publishing..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
