import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Globe, Award, CheckCircle2, 
  Edit3, Save, Calendar, Compass, Heart, ShieldCheck, Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: '',
    country: '',
    bio: '',
    avatarUrl: '',
    openToTravel: true,
    preferredTravelStyle: 'Adventure, Cultural, Nature',
    travelPace: 'MODERATE',
    budgetTier: 'MID_RANGE',
    visitedDestinationsCount: 5
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await client.get('/auth/profile');
      setProfile(res.data);
      setFormData({
        fullName: res.data.fullName || '',
        phone: res.data.phone || '',
        city: res.data.city || '',
        country: res.data.country || '',
        bio: res.data.bio || '',
        avatarUrl: res.data.avatarUrl || '',
        openToTravel: res.data.openToTravel !== false,
        preferredTravelStyle: res.data.preferredTravelStyle || 'Adventure, Cultural, Nature',
        travelPace: res.data.travelPace || 'MODERATE',
        budgetTier: res.data.budgetTier || 'MID_RANGE',
        visitedDestinationsCount: res.data.visitedDestinationsCount || 5
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await client.put('/auth/profile', formData);
      setProfile(res.data);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-moss-500 animate-pulse">Loading profile...</div>;
  }

  const p = profile || user || {};

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Profile Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-moss-200 bg-white shadow-2xl">
        <div className="h-44 bg-pine relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-forest/30" />
        </div>

        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 sm:-mt-14 mb-6">
            <div className="flex items-end gap-5">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl border-4 border-white bg-moss-100 overflow-hidden shadow-2xl shrink-0 relative group">
                <img
                  src={p.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                  alt={p.fullName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mb-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-forest">
                    {p.fullName || "Travel Explorer"}
                  </h1>
                  {p.isVerified && (
                    <span title="Verified Traveler" className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-trail-500/20 text-trail-600 border border-trail-500/30 text-xs font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>
                <p className="text-moss-500 text-sm flex items-center gap-1.5 mt-1">
                  <Mail className="w-3.5 h-3.5" /> {p.email}
                  {(p.city || p.country) && (
                    <>
                      <span>•</span>
                      <MapPin className="w-3.5 h-3.5" /> {p.city ? `${p.city}, ` : ''}{p.country}
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isEditing ? (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-moss-100 hover:bg-moss-200 text-moss-600 text-sm font-semibold transition"
                >
                  Cancel
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-xl bg-pine hover:bg-forest text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-trail-500/20 transition"
                >
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
              )}
            </div>
          </div>

          {saveSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
            </div>
          )}

          {/* Quick Badges Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-moss-200">
            <div className="bg-white border border-moss-200 p-3 rounded-2xl">
              <div className="text-xs text-moss-500">Open to Companions</div>
              <div className="text-sm font-bold text-forest mt-0.5 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${p.openToTravel ? 'bg-emerald-400' : 'bg-moss-500'}`} />
                {p.openToTravel ? 'Actively Seeking' : 'Not Looking'}
              </div>
            </div>

            <div className="bg-white border border-moss-200 p-3 rounded-2xl">
              <div className="text-xs text-moss-500">Travel Pace</div>
              <div className="text-sm font-bold text-trail-600 mt-0.5">
                {p.travelPace || 'MODERATE'}
              </div>
            </div>

            <div className="bg-white border border-moss-200 p-3 rounded-2xl">
              <div className="text-xs text-moss-500">Budget Tier</div>
              <div className="text-sm font-bold text-emerald-700 mt-0.5">
                {p.budgetTier || 'MID_RANGE'}
              </div>
            </div>

            <div className="bg-white border border-moss-200 p-3 rounded-2xl">
              <div className="text-xs text-moss-500">Destinations Visited</div>
              <div className="text-sm font-bold text-amber-700 mt-0.5">
                {p.visitedDestinationsCount || 5} Places
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white border border-moss-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <h2 className="text-lg font-bold text-forest flex items-center gap-2 border-b border-moss-200 pb-3">
            <Edit3 className="w-4 h-4 text-trail-600" /> Update Explorer Bio & Travel Preferences
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-moss-500 block mb-1">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="w-full bg-white border border-moss-200 rounded-xl px-4 py-2.5 text-sm text-forest focus:outline-none focus:border-pine"
              />
            </div>
            <div>
              <label className="text-xs text-moss-500 block mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 019-2834"
                className="w-full bg-white border border-moss-200 rounded-xl px-4 py-2.5 text-sm text-forest focus:outline-none focus:border-pine"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-moss-500 block mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. San Francisco"
                className="w-full bg-white border border-moss-200 rounded-xl px-4 py-2.5 text-sm text-forest focus:outline-none focus:border-pine"
              />
            </div>
            <div>
              <label className="text-xs text-moss-500 block mb-1">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={e => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g. USA"
                className="w-full bg-white border border-moss-200 rounded-xl px-4 py-2.5 text-sm text-forest focus:outline-none focus:border-pine"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-moss-500 block mb-1">Avatar Image URL</label>
            <input
              type="url"
              value={formData.avatarUrl}
              onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
              className="w-full bg-white border border-moss-200 rounded-xl px-4 py-2.5 text-sm text-forest focus:outline-none focus:border-pine"
            />
          </div>

          <div>
            <label className="text-xs text-moss-500 block mb-1">Traveler Bio</label>
            <textarea
              rows="4"
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell other travelers about your passions, past adventures, and what makes you a great companion..."
              className="w-full bg-white border border-moss-200 rounded-xl px-4 py-2.5 text-sm text-forest focus:outline-none focus:border-pine"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-moss-500 block mb-1">Travel Pace</label>
              <select
                value={formData.travelPace}
                onChange={e => setFormData({ ...formData, travelPace: e.target.value })}
                className="w-full bg-white border border-moss-200 rounded-xl px-4 py-2.5 text-sm text-forest focus:outline-none focus:border-pine"
              >
                <option value="RELAXED">Relaxed & Leisurely</option>
                <option value="MODERATE">Moderate / Balanced</option>
                <option value="FAST_PACED">Fast-Paced / Action-Packed</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-moss-500 block mb-1">Budget Tier</label>
              <select
                value={formData.budgetTier}
                onChange={e => setFormData({ ...formData, budgetTier: e.target.value })}
                className="w-full bg-white border border-moss-200 rounded-xl px-4 py-2.5 text-sm text-forest focus:outline-none focus:border-pine"
              >
                <option value="BACKPACKER">Backpacker / Shoestring</option>
                <option value="MID_RANGE">Mid-Range / Comfort</option>
                <option value="LUXURY">Luxury / Premium</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-moss-500 block mb-1">Destinations Visited</label>
              <input
                type="number"
                min="0"
                value={formData.visitedDestinationsCount}
                onChange={e => setFormData({ ...formData, visitedDestinationsCount: Number(e.target.value) })}
                className="w-full bg-white border border-moss-200 rounded-xl px-4 py-2.5 text-sm text-forest focus:outline-none focus:border-pine"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-moss-200">
            <input
              type="checkbox"
              id="openToTravel"
              checked={formData.openToTravel}
              onChange={e => setFormData({ ...formData, openToTravel: e.target.checked })}
              className="w-4 h-4 rounded text-trail-600 focus:ring-pine bg-white border-moss-200"
            />
            <label htmlFor="openToTravel" className="text-sm text-moss-800 cursor-pointer">
              <b>Broadcast as "Open to Travel":</b> Make my profile visible in the Open-to-Travel directory so nearby solo travelers can reach out.
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-moss-200">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 rounded-xl bg-moss-100 hover:bg-moss-200 text-moss-600 text-sm font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-pine hover:bg-forest text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-trail-500/20 transition"
            >
              <Save className="w-4 h-4" /> {saving ? "Saving Changes..." : "Save Profile"}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white border border-moss-200 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-bold text-forest flex items-center gap-2">
                <Compass className="w-5 h-5 text-trail-600" /> About Me
              </h3>
              <p className="text-moss-600 text-sm leading-relaxed whitespace-pre-line">
                {p.bio || "No bio added yet. Click 'Edit Profile' to introduce yourself to prospective companions!"}
              </p>
            </div>

            <div className="bg-white border border-moss-200 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-bold text-forest flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-700" /> Preferred Travel Styles & Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {(p.preferredTravelStyle || 'Hiking, Photography, Coffee Walks, Historical Ruins').split(',').map((tag, i) => (
                  <span key={i} className="px-3 py-1 rounded-xl bg-moss-100 text-moss-800 border border-moss-200 text-xs font-medium">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-moss-200 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-moss-500">
                Companion Verification
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-moss-600">
                  <span>Email Confirmed</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="flex items-center justify-between text-moss-600">
                  <span>Photo Landmark Accuracy</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="flex items-center justify-between text-moss-600">
                  <span>Community Guidelines Signed</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
