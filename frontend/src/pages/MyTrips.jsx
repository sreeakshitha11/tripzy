import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Briefcase, Users, Calendar, MapPin, CheckCircle2,
  XCircle, Clock, AlertCircle, ArrowRight, MessageSquare, Ban
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function MyTrips() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('created');
  const [createdTrips, setCreatedTrips] = useState([]);
  const [joinedTrips, setJoinedTrips] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedTripRequests, setSelectedTripRequests] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadMyTrips();
    }
  }, [isAuthenticated]);

  const loadMyTrips = async () => {
    setLoading(true);
    try {
      const [createdRes, joinedRes, pendingRes] = await Promise.all([
        api.get('/trips/my-created'),
        api.get('/trips/my-joined'),
        api.get('/trips/my-pending')
      ]);
      setCreatedTrips(createdRes.data);
      setJoinedTrips(joinedRes.data);
      setPendingRequests(pendingRes.data);

      // Load applicant requests for all created trips
      for (const trip of createdRes.data) {
        try {
          const reqRes = await api.get(`/trips/${trip.id}/join-requests`);
          setSelectedTripRequests(prev => ({ ...prev, [trip.id]: reqRes.data }));
        } catch (ignored) {}
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewRequest = async (tripId, requestId, status) => {
    try {
      await api.patch(`/trips/join-requests/${requestId}`, { status });
      // Refresh requests
      const reqRes = await api.get(`/trips/${tripId}/join-requests`);
      setSelectedTripRequests(prev => ({ ...prev, [tripId]: reqRes.data }));
      loadMyTrips();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update join request");
    }
  };

  const handleCancelTrip = async (tripId) => {
    if (window.confirm("Are you sure you want to cancel this trip?")) {
      try {
        await api.put(`/trips/${tripId}/cancel`);
        loadMyTrips();
      } catch (err) {
        alert("Failed to cancel trip");
      }
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-forest font-display">
          My Trips & Journeys
        </h1>
        <p className="text-sm text-moss-500">
          Manage your hosted expeditions, joined groups, and pending applicant approvals.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-moss-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('created')}
          className={`pb-3 transition relative ${
            activeTab === 'created' ? 'text-trail-600 border-b-2 border-trail-500 font-bold' : 'text-moss-500 hover:text-moss-700'
          }`}
        >
          Trips I Created ({createdTrips.length})
        </button>
        <button
          onClick={() => setActiveTab('joined')}
          className={`pb-3 transition relative ${
            activeTab === 'joined' ? 'text-trail-600 border-b-2 border-trail-500 font-bold' : 'text-moss-500 hover:text-moss-700'
          }`}
        >
          Trips I Joined ({joinedTrips.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 transition relative ${
            activeTab === 'pending' ? 'text-trail-600 border-b-2 border-trail-500 font-bold' : 'text-moss-500 hover:text-moss-700'
          }`}
        >
          My Pending Requests ({pendingRequests.length})
        </button>
      </div>

      {/* Tab 1: Created Trips + Join Request Management */}
      {activeTab === 'created' && (
        <div className="space-y-6">
          {createdTrips.length > 0 ? (
            createdTrips.map(trip => {
              const reqs = selectedTripRequests[trip.id] || [];
              const pendingReqs = reqs.filter(r => r.status === 'PENDING');
              const spotsLeft = trip.maxParticipants - trip.currentParticipants;

              return (
                <div key={trip.id} className="bg-white rounded-3xl p-6 shadow-soft border border-moss-200/80 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-moss-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          trip.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {trip.status}
                        </span>
                        <span className="text-xs text-moss-500 font-medium">{trip.category}</span>
                      </div>
                      <NavLink to={`/trips/${trip.id}`}>
                        <h3 className="font-bold text-lg text-forest hover:text-trail-600 transition">
                          {trip.title}
                        </h3>
                      </NavLink>
                      <p className="text-xs text-moss-500 flex items-center gap-2 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-trail-600" />
                        <span>{trip.destinationName}</span>
                        <span>•</span>
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{trip.startDate} to {trip.endDate}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs text-moss-400 block">Participants</span>
                        <span className="font-bold text-sm text-moss-800">
                          {trip.currentParticipants} / {trip.maxParticipants} ({spotsLeft} spots left)
                        </span>
                      </div>

                      <NavLink
                        to="/travel-groups"
                        className="px-3.5 py-2 rounded-xl bg-pine hover:bg-forest text-white text-xs font-semibold shadow-sm transition"
                      >
                        Group Chat
                      </NavLink>

                      {trip.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleCancelTrip(trip.id)}
                          className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition"
                          title="Cancel Trip"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Join Requests Review Panel */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-moss-500 flex items-center gap-2">
                      <span>Join Requests for this Trip</span>
                      {pendingReqs.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          {pendingReqs.length} Action Needed
                        </span>
                      )}
                    </h4>

                    {reqs.length > 0 ? (
                      <div className="space-y-2">
                        {reqs.map(req => (
                          <div key={req.id} className="p-4 rounded-2xl bg-moss-50 border border-moss-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={req.applicantAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"}
                                alt={req.applicantName}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-trail-500 shrink-0"
                              />
                              <div>
                                <h5 className="font-bold text-xs text-moss-900">{req.applicantName}</h5>
                                <p className="text-xs text-moss-500 italic mt-0.5">"{req.message}"</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {req.status === 'PENDING' ? (
                                <>
                                  <button
                                    onClick={() => handleReviewRequest(trip.id, req.id, 'ACCEPTED')}
                                    className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                                  </button>
                                  <button
                                    onClick={() => handleReviewRequest(trip.id, req.id, 'REJECTED')}
                                    className="px-3.5 py-1.5 rounded-xl bg-moss-200 hover:bg-moss-300 text-moss-700 text-xs font-semibold transition flex items-center gap-1"
                                  >
                                    <XCircle className="w-3.5 h-3.5" /> Decline
                                  </button>
                                </>
                              ) : (
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                  req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {req.status}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-moss-400 italic">No join requests received yet.</p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-moss-200 space-y-3">
              <Briefcase className="w-10 h-10 text-moss-300 mx-auto" />
              <h3 className="font-bold text-moss-700">You haven't created any trips yet</h3>
              <p className="text-xs text-moss-400">Host your own journey and invite fellow solo travelers to explore together!</p>
              <NavLink to="/create-trip" className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-pine text-white text-xs font-bold">
                Create a Trip Now
              </NavLink>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Trips I Joined */}
      {activeTab === 'joined' && (
        <div className="space-y-4">
          {joinedTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {joinedTrips.map(trip => (
                <div key={trip.id} className="bg-white rounded-3xl p-5 shadow-soft border border-moss-200/80 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      Confirmed Participant
                    </span>
                    <NavLink to={`/trips/${trip.id}`}>
                      <h3 className="font-bold text-base text-forest hover:text-trail-600 transition">
                        {trip.title}
                      </h3>
                    </NavLink>
                    <p className="text-xs text-moss-500">
                      Destination: <strong>{trip.destinationName}</strong> • {trip.startDate}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-moss-100">
                    <NavLink
                      to={`/trips/${trip.id}`}
                      className="flex-1 py-2 text-center text-xs font-semibold rounded-xl bg-moss-100 hover:bg-moss-200 text-moss-700 transition"
                    >
                      Trip Details
                    </NavLink>
                    <NavLink
                      to="/travel-groups"
                      className="flex-1 py-2 text-center text-xs font-bold rounded-xl bg-pine hover:bg-forest text-white transition shadow-sm"
                    >
                      Travel Group Chat
                    </NavLink>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-moss-200">
              <Users className="w-10 h-10 text-moss-300 mx-auto mb-2" />
              <p className="text-xs text-moss-500">You haven't joined any trips yet. Discover journeys in Search Trips!</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: My Pending Requests */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingRequests.length > 0 ? (
            pendingRequests.map(req => (
              <div key={req.id} className="bg-white rounded-2xl p-4 border border-moss-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-forest">{req.tripTitle}</h4>
                  <p className="text-xs text-moss-500 italic mt-0.5">"{req.message}"</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  req.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                  req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {req.status}
                </span>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-moss-200 text-xs text-moss-400">
              No pending join requests.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
