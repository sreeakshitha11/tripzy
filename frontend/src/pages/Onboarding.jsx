import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Sparkles, Check, ArrowRight, MapPin, Smile } from 'lucide-react';
import client from '../api/client';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [styles, setStyles] = useState(['Adventure', 'Cultural', 'Nature']);
  const [pace, setPace] = useState('MODERATE');
  const [budgetTier, setBudgetTier] = useState('MID_RANGE');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [bio, setBio] = useState('');

  const allStyles = [
    'Adventure', 'Cultural', 'Nature', 'Photography', 'Foodie', 
    'Road Trips', 'Solo Exploration', 'Trekking', 'Beaches', 'Historical Sites'
  ];

  const toggleStyle = (s) => {
    if (styles.includes(s)) {
      setStyles(styles.filter(x => x !== s));
    } else {
      setStyles([...styles, s]);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await client.put('/auth/profile', {
        city,
        country,
        bio,
        preferredTravelStyle: styles.join(', '),
        travelPace: pace,
        budgetTier: budgetTier,
        openToTravel: true
      });
      navigate('/');
    } catch (err) {
      console.error(err);
      // Fallback redirect if profile fails
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-xl w-full bg-white border border-moss-200 p-8 rounded-3xl shadow-2xl backdrop-blur-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-moss-200">
          <div>
            <span className="text-[11px] font-bold text-trail-600 uppercase tracking-wider">Step {step} of 3</span>
            <h2 className="text-xl font-bold text-forest mt-0.5">Customize Your Explorer Profile</h2>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`w-8 h-2 rounded-full transition-colors ${
                  s === step ? 'bg-trail-400' : s < step ? 'bg-emerald-400' : 'bg-moss-100'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Travel Styles */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-moss-800">
              What types of travel experiences excite you most?
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {allStyles.map(s => {
                const selected = styles.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleStyle(s)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                      selected
                        ? 'bg-pine text-white shadow-lg shadow-trail-500/20'
                        : 'bg-moss-100 text-moss-600 hover:bg-moss-100'
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5" />}
                    {s}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl bg-pine hover:bg-forest text-white font-semibold text-sm transition flex items-center gap-2 shadow-lg shadow-trail-500/20"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Pace & Budget */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="text-xs text-moss-500 block mb-2 font-semibold">Your Preferred Travel Rhythm</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'RELAXED', title: 'Relaxed', desc: 'Chill, café, slow mornings' },
                  { id: 'MODERATE', title: 'Moderate', desc: 'Balanced sight & chill' },
                  { id: 'FAST_PACED', title: 'Action', desc: 'Packed sunrise to sunset' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPace(item.id)}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      pace === item.id
                        ? 'border-trail-500 bg-trail-500/10 text-forest'
                        : 'border-moss-200 bg-white text-moss-600 hover:border-moss-200'
                    }`}
                  >
                    <div className="font-bold text-sm text-forest">{item.title}</div>
                    <div className="text-[11px] text-moss-500 mt-1">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-moss-500 block mb-2 font-semibold">Typical Budget Tier</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'BACKPACKER', title: 'Backpacker', desc: 'Hostels, local transit' },
                  { id: 'MID_RANGE', title: 'Mid-Range', desc: 'Private rooms & comfort' },
                  { id: 'LUXURY', title: 'Luxury', desc: 'Resorts & private tours' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBudgetTier(item.id)}
                    className={`p-3.5 rounded-2xl border text-left transition ${
                      budgetTier === item.id
                        ? 'border-trail-500 bg-trail-500/10 text-forest'
                        : 'border-moss-200 bg-white text-moss-600 hover:border-moss-200'
                    }`}
                  >
                    <div className="font-bold text-sm text-forest">{item.title}</div>
                    <div className="text-[11px] text-moss-500 mt-1">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl bg-moss-100 text-moss-600 text-sm font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl bg-pine hover:bg-forest text-white font-semibold text-sm transition flex items-center gap-2 shadow-lg shadow-trail-500/20"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Location & Bio */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-moss-500 block mb-1">Your Current City</label>
                <input
                  type="text"
                  placeholder="e.g. Seattle"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full bg-white border border-moss-200 rounded-xl px-4 py-2.5 text-sm text-forest focus:outline-none focus:border-pine"
                />
              </div>
              <div>
                <label className="text-xs text-moss-500 block mb-1">Country</label>
                <input
                  type="text"
                  placeholder="e.g. USA"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="w-full bg-white border border-moss-200 rounded-xl px-4 py-2.5 text-sm text-forest focus:outline-none focus:border-pine"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-moss-500 block mb-1">Short Traveler Bio</label>
              <textarea
                rows="4"
                placeholder="Share a sentence about where you want to go next or your travel dreams..."
                value={bio}
                onChange={e => setBio(e.target.value)}
                className="w-full bg-white border border-moss-200 rounded-xl px-4 py-2.5 text-sm text-forest focus:outline-none focus:border-pine"
              />
            </div>

            <div className="pt-4 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-xl bg-moss-100 text-moss-600 text-sm font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl bg-pine hover:bg-forest text-white font-semibold text-sm transition flex items-center gap-2 shadow-lg shadow-trail-500/20"
              >
                {loading ? "Completing..." : "Complete Setup & Launch"}
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
