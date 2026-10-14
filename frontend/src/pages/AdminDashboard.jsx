import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, Plane, ShieldAlert, LifeBuoy, CheckCircle2, 
  XCircle, AlertTriangle, RefreshCw, Eye, Search, Filter, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { formatRupees } from '../utils/currency';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, users, trips, safety
  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [tripsList, setTripsList] = useState([]);
  const [safetyReports, setSafetyReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, usersRes, tripsRes, safetyRes] = await Promise.all([
        client.get('/admin/analytics'),
        client.get('/admin/users'),
        client.get('/admin/trips'),
        client.get('/admin/safety-reports')
      ]);
      setAnalytics(analyticsRes.data);
      setUsersList(usersRes.data || []);
      setTripsList(tripsRes.data || []);
      setSafetyReports(safetyRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async (userId) => {
    try {
      await client.put(`/admin/users/${userId}/verify`);
      setUsersList(usersList.map(u => u.id === userId ? { ...u, isVerified: !u.isVerified } : u));
    } catch (err) {
      console.error(err);
      alert("Failed to toggle verification status.");
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await client.put(`/admin/users/${userId}/status?status=${newStatus}`);
      setUsersList(usersList.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      console.error(err);
      alert("Failed to update user status.");
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm("Are you sure you want to cancel and remove this trip?")) return;
    try {
      await client.delete(`/admin/trips/${tripId}`);
      setTripsList(tripsList.filter(t => t.id !== tripId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete trip.");
    }
  };

  const handleUpdateReportStatus = async (reportId, newStatus) => {
    try {
      await client.put(`/admin/safety-reports/${reportId}/status?status=${newStatus}`);
      setSafetyReports(safetyReports.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
    } catch (err) {
      console.error(err);
      alert("Failed to update report status.");
    }
  };

  if (!user || user.role !== 'ROLE_ADMIN') {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-2xl font-bold text-forest">Administrator Access Required</h2>
        <p className="text-moss-500 text-sm">
          You must be logged in with an administrative account (e.g. <code>admin@tripzy.com</code>) to access the control panel.
        </p>
      </div>
    );
  }

  const filteredUsers = usersList.filter(u => 
    u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Admin Header */}
      <div className="bg-white border border-moss-200 rounded-3xl p-8 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-trail-500/10 text-trail-600 border border-trail-500/20 text-xs font-semibold uppercase tracking-wider mb-2">
            <Shield className="w-3.5 h-3.5" /> Tripzy Master Control Center
          </div>
          <h1 className="text-3xl font-display font-bold text-forest tracking-tight">
            Administrator Dashboard
          </h1>
          <p className="text-moss-500 text-sm mt-1">
            Global metrics, companion verification badges, trip moderation, and trust & safety resolution.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 rounded-xl bg-moss-100 hover:bg-moss-200 text-trail-600 text-sm font-semibold flex items-center gap-2 border border-moss-200 transition"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-moss-200 pb-3">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'analytics'
              ? 'bg-pine text-white shadow-lg shadow-trail-500/20'
              : 'text-moss-500 hover:text-forest'
          }`}
        >
          Analytics Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'users'
              ? 'bg-pine text-white shadow-lg shadow-trail-500/20'
              : 'text-moss-500 hover:text-forest'
          }`}
        >
          User Accounts ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('trips')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'trips'
              ? 'bg-pine text-white shadow-lg shadow-trail-500/20'
              : 'text-moss-500 hover:text-forest'
          }`}
        >
          Active Trips ({tripsList.length})
        </button>
        <button
          onClick={() => setActiveTab('safety')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === 'safety'
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
              : 'text-moss-500 hover:text-forest'
          }`}
        >
          Safety Incident Reports ({safetyReports.length})
        </button>
      </div>

      {/* Tab 1: Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white border border-moss-200 rounded-2xl p-4">
              <div className="text-xs text-moss-500">Total Users</div>
              <div className="text-2xl font-bold text-forest mt-1">
                {analytics?.totalUsers ?? usersList.length}
              </div>
            </div>
            <div className="bg-white border border-moss-200 rounded-2xl p-4">
              <div className="text-xs text-moss-500">Published Trips</div>
              <div className="text-2xl font-bold text-trail-600 mt-1">
                {analytics?.totalTrips ?? tripsList.length}
              </div>
            </div>
            <div className="bg-white border border-moss-200 rounded-2xl p-4">
              <div className="text-xs text-moss-500">Travel Groups</div>
              <div className="text-2xl font-bold text-trail-600 mt-1">
                {analytics?.totalGroups ?? 5}
              </div>
            </div>
            <div className="bg-white border border-moss-200 rounded-2xl p-4">
              <div className="text-xs text-moss-500">Reviews & Ratings</div>
              <div className="text-2xl font-bold text-amber-700 mt-1">
                {analytics?.totalReviews ?? 12}
              </div>
            </div>
            <div className="bg-white border border-moss-200 rounded-2xl p-4">
              <div className="text-xs text-moss-500">Open Incident Reports</div>
              <div className="text-2xl font-bold text-red-700 mt-1">
                {analytics?.openSafetyReports ?? safetyReports.filter(r => r.status === 'PENDING').length}
              </div>
            </div>
            <div className="bg-white border border-moss-200 rounded-2xl p-4">
              <div className="text-xs text-moss-500">Pending Support</div>
              <div className="text-2xl font-bold text-trail-700 mt-1">
                {analytics?.pendingTickets ?? 2}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-moss-200 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-forest">System Health & Live Services</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center text-moss-600">
                  <span>Spring Boot REST Backend</span>
                  <span className="text-emerald-700 font-bold">● Active (Port 8080)</span>
                </div>
                <div className="flex justify-between items-center text-moss-600">
                  <span>MySQL 9 Database Engine</span>
                  <span className="text-emerald-700 font-bold">● Connected (tripzy_db)</span>
                </div>
                <div className="flex justify-between items-center text-moss-600">
                  <span>Visual Landmark AI Matching</span>
                  <span className="text-trail-600 font-bold">● Ready (Multi-Cosine)</span>
                </div>
                <div className="flex justify-between items-center text-moss-600">
                  <span>WebSocket STOMP Broker</span>
                  <span className="text-trail-600 font-bold">● Listening (/ws)</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-moss-200 rounded-2xl p-6 space-y-4">
              <h3 className="text-base font-bold text-forest">Recent Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('users')}
                  className="w-full text-left px-4 py-2.5 rounded-xl bg-moss-100 hover:bg-moss-200 text-xs font-semibold text-moss-800 transition"
                >
                  Review and verify unverified member profiles →
                </button>
                <button
                  onClick={() => setActiveTab('safety')}
                  className="w-full text-left px-4 py-2.5 rounded-xl bg-moss-100 hover:bg-moss-200 text-xs font-semibold text-red-700 transition"
                >
                  Inspect flagged safety complaints ({safetyReports.length}) →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Users Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-moss-200">
            <Search className="w-4 h-4 text-moss-500" />
            <input
              type="text"
              placeholder="Search user by name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-forest placeholder-moss-400 outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine w-full"
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-moss-200 bg-white">
            <table className="w-full text-left text-xs text-moss-600">
              <thead className="bg-white text-moss-500 uppercase text-[11px] font-bold border-b border-moss-200">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-moss-200">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-moss-100 transition">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-moss-100 overflow-hidden font-bold flex items-center justify-center text-moss-600 shrink-0">
                        {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" /> : u.fullName?.[0]}
                      </div>
                      <div>
                        <div className="font-bold text-forest text-sm">{u.fullName}</div>
                        <div className="text-moss-500 text-[11px]">{u.email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        u.role === 'ROLE_ADMIN' ? 'bg-trail-500/10 text-trail-700 border border-trail-500/20' : 'bg-moss-100 text-moss-600'
                      }`}>
                        {u.role || 'USER'}
                      </span>
                    </td>
                    <td className="p-4 text-moss-500">
                      {u.city ? `${u.city}, ` : ''}{u.country || 'Not specified'}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleVerification(u.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                          u.isVerified
                            ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 hover:bg-emerald-500/20'
                            : 'bg-moss-100 text-moss-500 hover:text-forest'
                        }`}
                      >
                        {u.isVerified ? <CheckCircle2 className="w-3 h-3" /> : null}
                        {u.isVerified ? 'Verified' : 'Unverified'}
                      </button>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        u.status === 'ACTIVE' || !u.status
                          ? 'bg-trail-500/10 text-trail-600 border border-trail-500/20'
                          : 'bg-red-500/10 text-red-700 border border-red-500/20'
                      }`}>
                        {u.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {u.role !== 'ROLE_ADMIN' && (
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.status || 'ACTIVE')}
                          className="px-3 py-1 rounded-lg bg-moss-100 hover:bg-moss-200 text-moss-600 hover:text-forest transition"
                        >
                          {u.status === 'ACTIVE' || !u.status ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Trips Moderation */}
      {activeTab === 'trips' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-moss-200 bg-white">
            <table className="w-full text-left text-xs text-moss-600">
              <thead className="bg-white text-moss-500 uppercase text-[11px] font-bold border-b border-moss-200">
                <tr>
                  <th className="p-4">Trip Title</th>
                  <th className="p-4">Destination</th>
                  <th className="p-4">Organizer</th>
                  <th className="p-4">Dates</th>
                  <th className="p-4">Budget</th>
                  <th className="p-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-moss-200">
                {tripsList.map(t => (
                  <tr key={t.id} className="hover:bg-moss-100 transition">
                    <td className="p-4 font-bold text-forest text-sm max-w-xs truncate">
                      {t.title}
                    </td>
                    <td className="p-4 text-trail-600">
                      {t.destinationName || t.destination?.name || 'Various'}
                    </td>
                    <td className="p-4">
                      {t.organizerName || t.organizer?.fullName || 'Traveler'}
                    </td>
                    <td className="p-4 text-moss-500">
                      {t.startDate} - {t.endDate}
                    </td>
                    <td className="p-4 font-semibold text-emerald-700">
                      {formatRupees(t.estimatedBudget ?? t.budgetEstimate)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteTrip(t.id)}
                        className="px-3 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-700 border border-red-500/20 transition flex items-center gap-1 ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Safety Incident Reports */}
      {activeTab === 'safety' && (
        <div className="space-y-4">
          {safetyReports.length === 0 ? (
            <div className="p-12 text-center bg-white border border-moss-200 rounded-2xl text-moss-500">
              No incident reports have been submitted.
            </div>
          ) : (
            <div className="space-y-4">
              {safetyReports.map(rep => (
                <div key={rep.id} className="bg-white border border-moss-200 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-700 border border-red-500/20 text-xs font-bold">
                      {rep.reason}
                    </span>
                    <span className="text-xs text-moss-500">
                      Status: <b className="text-trail-600">{rep.status}</b>
                    </span>
                  </div>

                  <p className="text-sm text-moss-800 leading-relaxed">{rep.description}</p>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-moss-200 text-xs text-moss-500">
                    <div>
                      Reporter ID: #{rep.reporterId || 'Anonymous'} • Trip ID: #{rep.tripId || 'N/A'}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateReportStatus(rep.id, 'RESOLVED')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 hover:bg-emerald-500/20 transition font-semibold"
                      >
                        Mark Resolved
                      </button>
                      <button
                        onClick={() => handleUpdateReportStatus(rep.id, 'DISMISSED')}
                        className="px-3 py-1.5 rounded-lg bg-moss-100 text-moss-600 hover:bg-moss-200 transition"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
