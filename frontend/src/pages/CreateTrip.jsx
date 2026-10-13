import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Compass, Calendar, Navigation, DollarSign, Users,
  CheckCircle2, ArrowRight, ArrowLeft, PlusCircle, AlertCircle
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function CreateTrip() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [step, setStep] = useState(1);
  const [destinations, setDestinations] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    destinationId: searchParams.get('destinationId') ? Number(searchParams.get('destinationId')) : '',
    destinationName: searchParams.get('destinationName') || '',
    description: '',
    category: 'Adventure',
    startDate: '',
    endDate: '',
    durationDays: 5,
    transportType: 'Shared Cab / Rental SUV',
    accommodationPlan: 'Boutique Cottages & Camps',
    meetingPoint: 'Central Airport / Railway Terminal',
    estimatedBudget: 350.0,
    currency: 'INR',
    minParticipants: 2,
    maxParticipants: 6,
    travelStyle: 'Moderate Adventurer',
    tripRules: 'Punctual group departures, respect local cultures, zero littering policy.',
    coverImageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/destinations')
      .then(res => setDestinations(res.data))
      .catch(() => {});
  }, []);

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleDestinationSelect = (destName) => {
    const dest = destinations.find(d => d.name === destName);
    setFormData(prev => ({
      ...prev,
      destinationName: destName,
      destinationId: dest ? dest.id : null,
      coverImageUrl: dest?.heroImageUrl || prev.coverImageUrl
    }));
  };

  const validateCurrentStep = () => {
    setError('');
    if (step === 1) {
      if (!formData.title.trim()) { setError('Please enter a trip title'); return false; }
      if (!formData.destinationName.trim()) { setError('Please specify a destination'); return false; }
    }
    if (step === 2) {
      if (!formData.startDate) { setError('Start date is required'); return false; }
      if (!formData.endDate) { setError('End date is required'); return false; }
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        setError('End date must be after start date');
        return false;
      }
    }
    if (step === 4) {
      if (Number(formData.estimatedBudget) <= 0) { setError('Estimated budget must be greater than 0'); return false; }
      if (Number(formData.maxParticipants) < Number(formData.minParticipants)) {
        setError('Max participants cannot be less than min participants');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateCurrentStep()) setStep(s => Math.min(s + 1, 6));
  };

  const prevStep = () => {
    setError('');
    setStep(s => Math.max(s - 1, 1));
  };

  const handlePublish = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/trips', formData);
      navigate(`/trips/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create trip');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      {/* Header & Stepper */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-forest font-display">
          Host a New Adventure
        </h1>
        <p className="text-xs sm:text-sm text-moss-500">
          Step-by-step trip creation wizard. Once published, travelers can find and request to join your group.
        </p>

        {/* Stepper Progress */}
        <div className="flex items-center justify-center gap-2 pt-4">
          {[1, 2, 3, 4, 5, 6].map(num => (
            <div key={num} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === num
                  ? 'bg-pine text-white ring-4 ring-trail-500/20'
                  : step > num
                    ? 'bg-emerald-700 text-white'
                    : 'bg-moss-200 text-moss-500'
              }`}>
                {step > num ? <CheckCircle2 className="w-4 h-4" /> : num}
              </div>
              {num < 6 && <div className={`w-6 sm:w-10 h-1 ${step > num ? 'bg-emerald-500' : 'bg-moss-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-soft border border-moss-200/80">
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in">
            <h2 className="text-lg font-bold text-forest font-display">Step 1: Basic Trip Details</h2>
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-moss-700 block mb-1">Trip Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g. Himalayan Snow Peaks Trek & Stargazing"
                  className="w-full p-3 bg-moss-50 border border-moss-200 rounded-xl focus:bg-white focus:border-pine outline-none text-moss-900 placeholder:text-moss-600"
                />
              </div>

              <div>
                <label className="font-semibold text-moss-700 block mb-1">Destination</label>
                <input
                  type="text"
                  list="destinations-list"
                  value={formData.destinationName}
                  onChange={(e) => handleDestinationSelect(e.target.value)}
                  placeholder="Select from destinations or type custom location..."
                  className="w-full p-3 bg-moss-50 border border-moss-200 rounded-xl focus:bg-white focus:border-pine outline-none text-moss-900 placeholder:text-moss-600"
                />
                <datalist id="destinations-list">
                  {destinations.map(d => <option key={d.id} value={d.name} />)}
                </datalist>
              </div>

              <div>
                <label className="font-semibold text-moss-700 block mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full p-3 bg-moss-50 border border-moss-200 rounded-xl focus:bg-white focus:border-pine outline-none text-moss-900 placeholder:text-moss-600"
                >
                  <option value="Adventure">Adventure</option>
                  <option value="Leisure & Beach">Leisure & Beach</option>
                  <option value="Biking & Roadtrip">Biking & Roadtrip</option>
                  <option value="Culture">Culture</option>
                  <option value="Backpacking">Backpacking</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-moss-700 block mb-1">Trip Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows="3"
                  placeholder="Tell travelers what to expect on this journey..."
                  className="w-full p-3 bg-moss-50 border border-moss-200 rounded-xl focus:bg-white focus:border-pine outline-none text-moss-900 placeholder:text-moss-600"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-in fade-in">
            <h2 className="text-lg font-bold text-forest font-display">Step 2: Dates & Duration</h2>
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-moss-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    className="w-full p-3 bg-moss-50 border border-moss-200 rounded-xl focus:bg-white focus:border-pine outline-none text-moss-900 placeholder:text-moss-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-moss-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    className="w-full p-3 bg-moss-50 border border-moss-200 rounded-xl focus:bg-white focus:border-pine outline-none text-moss-900 placeholder:text-moss-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-moss-700 block mb-1">Duration in Days</label>
                <input
                  type="number"
                  value={formData.durationDays}
                  onChange={(e) => handleChange('durationDays', Number(e.target.value))}
                  min="1"
                  max="30"
                  className="w-full p-3 bg-moss-50 border border-moss-200 rounded-xl focus:bg-white focus:border-pine outline-none text-moss-900 placeholder:text-moss-600"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 animate-in fade-in">
            <h2 className="text-lg font-bold text-forest font-display">Step 3: Travel Arrangements</h2>
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-moss-700 block mb-1">Transport Plan</label>
                <input
                  type="text"
                  value={formData.transportType}
                  onChange={(e) => handleChange('transportType', e.target.value)}
                  placeholder="e.g. Shared Flight + Rented 4x4 SUV"
                  className="w-full p-3 bg-moss-50 border border-moss-200 rounded-xl focus:bg-white focus:border-pine outline-none text-moss-900 placeholder:text-moss-600"
                />
              </div>

              <div>
                <label className="font-semibold text-moss-700 block mb-1">Accommodation Plan</label>
                <input
                  type="text"
                  value={formData.accommodationPlan}
                  onChange={(e) => handleChange('accommodationPlan', e.target.value)}
                  placeholder="e.g. Boutique Alpine Cottages & Riverside Camps"
                  className="w-full p-3 bg-moss-50 border border-moss-200 rounded-xl focus:bg-white focus:border-pine outline-none text-moss-900 placeholder:text-moss-600"
                />
              </div>

              <div>
                <label className="font-semibold text-moss-700 block mb-1">Meeting Point</label>
                <input
                  type="text"
                  value={formData.meetingPoint}
                  onChange={(e) => handleChange('meetingPoint', e.target.value)}
                  placeholder="e.g. Terminal 2 Arrivals or Main Railway Junction"
                  className="w-full p-3 bg-moss-50 border border-moss-200 rounded-xl focus:bg-white focus:border-pine outline-none text-moss-900 placeholder:text-moss-600"
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5 animate-in fade-in">
            <h2 className="text-lg font-bold text-forest font-display">Step 4: Budget & Group Capacity</h2>
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-moss-700 block mb-1">Estimated Budget per Person (₹ INR)</label>
                <input
                  type="number"
                  value={formData.estimatedBudget}
                  onChange={(e) => handleChange('estimatedBudget', Number(e.target.value))}
                  placeholder="e.g. 350"
                  className="w-full p-3 bg-moss-50 border border-moss-200 rounded-xl focus:bg-white focus:border-pine outline-none text-moss-900 placeholder:text-moss-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-moss-700 block mb-1">Min Group Size</label>
                  <input
                    type="number"
                    value={formData.minParticipants}
                    onChange={(e) => handleChange('minParticipants', Number(e.target.value))}
                    min="2"
                    className="w-full p-3 bg-moss-50 border border-moss-200 rounded-xl focus:bg-white focus:border-pine outline-none text-moss-900 placeholder:text-moss-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-moss-700 block mb-1">Max Group Size (Capacity)</label>
                  <input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => handleChange('maxParticipants', Number(e.target.value))}
                    min="2"
                    className="w-full p-3 bg-moss-50 border border-moss-200 rounded-xl focus:bg-white focus:border-pine outline-none text-moss-900 placeholder:text-moss-600"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-5 animate-in fade-in">
            <h2 className="text-lg font-bold text-forest font-display">Step 5: Preferences & Trip Rules</h2>
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-moss-700 block mb-1">Preferred Travel Style</label>
                <input
                  type="text"
                  value={formData.travelStyle}
                  onChange={(e) => handleChange('travelStyle', e.target.value)}
                  placeholder="e.g. Moderate Adventurer, Chill Backpacker"
                  className="w-full p-3 bg-moss-50 border border-moss-200 rounded-xl focus:bg-white focus:border-pine outline-none text-moss-900 placeholder:text-moss-600"
                />
              </div>

              <div>
                <label className="font-semibold text-moss-700 block mb-1">Group Rules & Expectations</label>
                <textarea
                  value={formData.tripRules}
                  onChange={(e) => handleChange('tripRules', e.target.value)}
                  rows="3"
                  className="w-full p-3 bg-moss-50 border border-moss-200 rounded-xl focus:bg-white focus:border-pine outline-none text-moss-900 placeholder:text-moss-600"
                />
              </div>

              <div>
                <label className="font-semibold text-moss-700 block mb-1">Cover Image URL</label>
                <input
                  type="text"
                  value={formData.coverImageUrl}
                  onChange={(e) => handleChange('coverImageUrl', e.target.value)}
                  className="w-full p-3 bg-moss-50 border border-moss-200 rounded-xl focus:bg-white focus:border-pine outline-none text-moss-900 placeholder:text-moss-600"
                />
                {/* Image preview */}
                {formData.coverImageUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.coverImageUrl}
                      alt="Cover preview"
                      className="w-full h-48 object-cover rounded-md"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-lg font-bold text-forest font-display">Step 6: Review & Publish Trip</h2>
            <div className="bg-moss-50 p-5 rounded-2xl border border-moss-200 space-y-3 text-xs">
              <div className="flex justify-between border-b border-moss-200 pb-2">
                <span className="text-moss-500">Title:</span>
                <strong className="text-forest">{formData.title}</strong>
              </div>
              <div className="flex justify-between border-b border-moss-200 pb-2">
                <span className="text-moss-500">Destination:</span>
                <strong>{formData.destinationName} ({formData.category})</strong>
              </div>
              <div className="flex justify-between border-b border-moss-200 pb-2">
                <span className="text-moss-500">Dates:</span>
                <strong>{formData.startDate} to {formData.endDate} ({formData.durationDays} Days)</strong>
              </div>
              <div className="flex justify-between border-b border-moss-200 pb-2">
                <span className="text-moss-500">Capacity & Budget:</span>
                <strong>{formData.maxParticipants} travelers max • ₹{formData.estimatedBudget?.toLocaleString('en-IN')}/person</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-moss-500">Transport:</span>
                <strong>{formData.transportType}</strong>
              </div>
            </div>

            <div className="p-3.5 bg-trail-50 rounded-xl border border-trail-200 text-trail-900 text-xs">
              Publishing will automatically create your private <strong>Travel Group</strong> and <strong>Master Itinerary</strong>.
            </div>
          </div>
        )}

        {/* Wizard Navigation Buttons */}
        <div className="flex items-center justify-between pt-8 border-t border-moss-100 mt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-5 py-2.5 rounded-xl border border-moss-200 hover:bg-moss-100 text-moss-700 text-xs font-semibold flex items-center gap-2 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : <div />}

          {step < 6 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2.5 rounded-xl bg-forest hover:bg-pine text-white text-xs font-bold flex items-center gap-2 shadow-sm transition"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-pine hover:bg-forest text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-trail-500/20 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'Publishing Trip...' : 'Publish Trip Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
