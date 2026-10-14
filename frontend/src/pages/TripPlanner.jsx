import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Compass, IndianRupee, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function TripPlanner() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [destinations, setDestinations] = useState([]);
  const [formData, setFormData] = useState({
    destination: 'Manali',
    days: 4,
    budget: 'Moderate',
    travelStyle: 'Adventurer',
    interests: 'Snow activities, mountain viewpoints, local cuisine'
  });
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api.get('/destinations')
      .then(res => setDestinations(res.data))
      .catch(() => {});
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setGenerating(true);
    try {
      const res = await api.post('/itineraries/generate', formData);
      navigate(`/itinerary-builder?itineraryId=${res.data.id}`);
    } catch (err) {
      alert("Failed to generate itinerary");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-trail-100 text-trail-800 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-trail-600" />
          <span>AI Itinerary Generator</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-forest font-display">
          AI Trip Planner
        </h1>
        <p className="text-sm text-moss-500">
          Enter your dream destination and preferences. We’ll generate a customized day-by-day itinerary with activities and cost estimates.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="bg-white p-6 sm:p-10 rounded-3xl shadow-soft border border-moss-200/80 space-y-6">
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-moss-700 block mb-1">Destination</label>
            <input
              type="text"
              list="dest-list"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              className="w-full p-3 bg-moss-50 border border-moss-200 rounded-xl focus:bg-white focus:border-pine outline-none"
              required
            />
            <datalist id="dest-list">
              {destinations.map(d => <option key={d.id} value={d.name} />)}
            </datalist>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-moss-700 block mb-1">Duration (Days)</label>
              <input
                type="number"
                min="1"
                max="14"
                value={formData.days}
                onChange={(e) => setFormData({ ...formData, days: Number(e.target.value) })}
                className="w-full p-3 bg-moss-50 border border-moss-200 rounded-xl focus:bg-white focus:border-pine outline-none"
              />
            </div>
            <div>
              <label className="font-semibold text-moss-700 block mb-1">Budget Preference</label>
              <select
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full p-3 bg-moss-50 border border-moss-200 rounded-xl focus:bg-white focus:border-pine outline-none"
              >
                <option value="Backpacker">Budget / Backpacker</option>
                <option value="Moderate">Moderate / Balanced</option>
                <option value="Luxury">Luxury / Premium</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-moss-700 block mb-1">Travel Style</label>
            <select
              value={formData.travelStyle}
              onChange={(e) => setFormData({ ...formData, travelStyle: e.target.value })}
              className="w-full p-3 bg-moss-50 border border-moss-200 rounded-xl focus:bg-white focus:border-pine outline-none"
            >
              <option value="Adventurer">Adventurer (Hiking, outdoor thrills)</option>
              <option value="Cultural">Cultural (Temples, heritage, food)</option>
              <option value="Leisure">Leisure (Scenic viewpoints, relaxation)</option>
              <option value="Photography">Photography (Golden hour spots, vistas)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-moss-700 block mb-1">Key Interests & Activities</label>
            <input
              type="text"
              value={formData.interests}
              onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
              className="w-full p-3 bg-moss-50 border border-moss-200 rounded-xl focus:bg-white focus:border-pine outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={generating}
          className="w-full py-3.5 bg-pine hover:bg-forest disabled:bg-moss-300 disabled:text-moss-700 disabled:shadow-none text-white font-bold text-sm rounded-2xl shadow-lg shadow-trail-500/20 transition flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>{generating ? 'Crafting Custom Itinerary...' : 'Generate Itinerary with AI'}</span>
        </button>
      </form>
    </div>
  );
}
