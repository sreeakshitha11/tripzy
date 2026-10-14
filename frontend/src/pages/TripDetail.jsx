import React, { useState, useEffect } from 'react';
import { useParams, NavLink, useNavigate } from 'react-router-dom';
import {
  MapPin, Calendar, Users, IndianRupee, Clock, ShieldCheck,
  CheckCircle2, ArrowRight, MessageSquare, PlusCircle, AlertCircle
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatRupees } from '../utils/currency';

export default function TripDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [joinMessage, setJoinMessage] = useState('Hi! I love this destination and would be thrilled to join the group.');
  const [submitting, setSubmitting] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  const fetchTripDetails = async () => {
    setLoading(true);
    try {
      const [tripRes, partRes] = await Promise.all([
        api.get(`/trips/${id}`),
        api.get(`/trips/${id}/participants`)
      ]);
      setTrip(tripRes.data);
      setParticipants(partRes.data);

      if (isAuthenticated) {
        const myPending = await api.get('/trips/my-pending');
        const pendingForThis = myPending.data.some(r => r.tripId === Number(id) && r.status === 'PENDING');
        setHasPendingRequest(pendingForThis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/trips/${id}/join-requests`, { message: joinMessage });
      setRequestSubmitted(true);
      setHasPendingRequest(true);
      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !trip) {
    return <div className="py-20 text-center text-sm text-moss-400">Loading trip details...</div>;
  }

  const isOrganizer = user && trip.organizerId === user.id;
  const isMember = user && participants.some(p => p.userId === user.id);
  const spotsLeft = trip.maxParticipants - trip.currentParticipants;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Cover Header */}
      <div className="relative h-80 sm:h-96 rounded-3xl overflow-hidden shadow-xl">
        <img
          src={trip.coverImageUrl}
          alt={trip.title}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/85 via-forest/40 to-transparent" />

        <div className="absolute bottom-6 left-6 right-6 text-white space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-pine text-white font-extrabold uppercase tracking-wider">
              {trip.category}
            </span>
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-trail-300" />
              {trip.destinationName}
            </span>
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {trip.durationDays} Days ({trip.startDate} - {trip.endDate})
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold font-display">
            {trip.title}
          </h1>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <img
                src={trip.organizerAvatar}
                alt={trip.organizerName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-trail-400"
              />
              <span className="text-xs font-semibold">{trip.organizerName} (Organizer)</span>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-soft font-display">{formatRupees(trip.estimatedBudget)}</span>
              <span className="text-[11px] text-soft block">per person</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Logistics & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Details & Itinerary */}
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-moss-200/80 space-y-4">
            <h2 className="text-xl font-bold text-forest font-display">Trip Overview</h2>
            <p className="text-sm text-moss-600 leading-relaxed whitespace-pre-line">
              {trip.description}
            </p>

            {/* Travel Logistics Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-moss-100 text-xs">
              <div className="bg-moss-50 p-3 rounded-2xl">
                <span className="text-[10px] text-moss-400 font-bold block uppercase">Transport</span>
                <span className="font-semibold text-moss-800">{trip.transportType}</span>
              </div>
              <div className="bg-moss-50 p-3 rounded-2xl">
                <span className="text-[10px] text-moss-400 font-bold block uppercase">Accommodation</span>
                <span className="font-semibold text-moss-800">{trip.accommodationPlan}</span>
              </div>
              <div className="bg-moss-50 p-3 rounded-2xl">
                <span className="text-[10px] text-moss-400 font-bold block uppercase">Meeting Point</span>
                <span className="font-semibold text-moss-800 truncate block">{trip.meetingPoint}</span>
              </div>
            </div>

            {/* Trip Rules */}
            <div className="pt-4 border-t border-moss-100 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-moss-400">
                Group Expectations & Trip Rules
              </h3>
              <p className="text-xs text-moss-700 bg-trail-50/50 p-3.5 rounded-2xl border border-trail-100 leading-relaxed">
                {trip.tripRules}
              </p>
            </div>
          </section>

          {/* Participants */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-moss-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-forest font-display">
                Trip Companions ({participants.length}/{trip.maxParticipants})
              </h3>
              <span className="text-xs font-bold text-emerald-700">
                {spotsLeft} remaining seats
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {participants.map((p) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-2xl bg-moss-50 border border-moss-100">
                  <img
                    src={p.userAvatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"}
                    alt={p.userFullName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-trail-500"
                  />
                  <div>
                    <h4 className="font-semibold text-xs text-moss-900">{p.userFullName}</h4>
                    <span className="text-[10px] text-trail-700 font-medium">{p.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Join Action Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-soft border border-moss-200/80 space-y-5">
            <h3 className="font-bold text-base text-forest font-display">Join this Journey</h3>

            <div className="space-y-3 text-xs text-moss-600 bg-moss-50 p-4 rounded-2xl border border-moss-100">
              <div className="flex justify-between">
                <span>Total Capacity</span>
                <strong>{trip.maxParticipants} Travelers</strong>
              </div>
              <div className="flex justify-between">
                <span>Confirmed Members</span>
                <strong>{trip.currentParticipants}</strong>
              </div>
              <div className="flex justify-between">
                <span>Available Spots</span>
                <strong className="text-emerald-700">{spotsLeft} Spots</strong>
              </div>
              <div className="flex justify-between pt-2 border-t border-moss-200">
                <span>Estimated Budget</span>
                <strong className="text-trail-700 text-sm font-bold">{formatRupees(trip.estimatedBudget)}</strong>
              </div>
            </div>

            {/* Action Button Conditional Rendering */}
            {isOrganizer ? (
              <NavLink
                to="/my-trips"
                className="block w-full py-3 text-center bg-forest hover:bg-pine text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Manage Join Requests & Trip
              </NavLink>
            ) : isMember ? (
              <NavLink
                to="/travel-groups"
                className="block w-full py-3 text-center bg-emerald-700 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Open Group Chat & Hub
              </NavLink>
            ) : hasPendingRequest || requestSubmitted ? (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Join request pending organizer approval.</span>
              </div>
            ) : spotsLeft <= 0 ? (
              <button disabled className="w-full py-3 bg-moss-200 text-moss-500 rounded-xl text-xs font-bold cursor-not-allowed">
                Trip is Full
              </button>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3.5 bg-pine hover:bg-forest text-white rounded-2xl text-xs font-bold shadow-lg shadow-trail-500/20 transition flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Request to Join Group</span>
              </button>
            )}

            <p className="text-[11px] text-moss-400 text-center leading-snug">
              Requests are reviewed by the trip organizer before group membership is confirmed.
            </p>
          </div>
        </div>
      </div>

      {/* Request to Join Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-forest/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-moss-200 space-y-4 animate-in fade-in">
            <h3 className="font-bold text-lg text-forest font-display">
              Request to Join "{trip.title}"
            </h3>
            <p className="text-xs text-moss-500">
              Introduce yourself to {trip.organizerName}. Mention your travel style and why you want to join this trip.
            </p>

            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <textarea
                value={joinMessage}
                onChange={(e) => setJoinMessage(e.target.value)}
                rows="4"
                className="w-full p-3 text-xs bg-moss-50 rounded-xl border border-moss-200 focus:bg-white focus:border-pine outline-none"
                placeholder="Write a message to the organizer..."
                required
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-moss-100 hover:bg-moss-200 text-moss-700 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-pine hover:bg-forest text-white text-xs font-bold shadow-md transition"
                >
                  {submitting ? 'Submitting...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
