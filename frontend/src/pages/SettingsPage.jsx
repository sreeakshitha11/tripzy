import React, { useState } from 'react';
import { 
  Settings, Lock, Bell, Shield, Moon, Eye, KeyRound, 
  CheckCircle2, AlertCircle, Save
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('security'); // security, notifications, privacy
  
  // Password change state
  const [pwState, setPwState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  // Notifications state
  const [notifState, setNotifState] = useState({
    emailTripInvites: true,
    emailJoinUpdates: true,
    pushChatMessages: true,
    weeklyDigest: false
  });
  const [notifSaved, setNotifSaved] = useState(false);

  // Privacy state
  const [privacyState, setPrivacyState] = useState({
    profilePublic: true,
    showLocation: true,
    allowDirectMessages: true
  });
  const [privacySaved, setPrivacySaved] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwSuccess('');
    setPwError('');

    if (pwState.newPassword !== pwState.confirmPassword) {
      setPwError("New passwords do not match!");
      return;
    }
    if (pwState.newPassword.length < 6) {
      setPwError("New password must be at least 6 characters long.");
      return;
    }

    setPwLoading(true);
    try {
      await client.post('/auth/change-password', {
        currentPassword: pwState.currentPassword,
        newPassword: pwState.newPassword
      });
      setPwSuccess("Password changed successfully!");
      setPwState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      setPwError(err.response?.data?.message || "Failed to update password. Verify your current password.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 3000);
  };

  const handleSavePrivacy = (e) => {
    e.preventDefault();
    setPrivacySaved(true);
    setTimeout(() => setPrivacySaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white border border-moss-200 rounded-3xl p-8 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-trail-500/10 text-trail-600 border border-trail-500/20 text-xs font-semibold uppercase tracking-wider mb-3">
          <Settings className="w-3.5 h-3.5" /> Account & Preferences
        </div>
        <h1 className="text-3xl font-display font-bold text-forest tracking-tight">
          Settings & Security
        </h1>
        <p className="text-moss-500 text-sm mt-2 max-w-xl">
          Manage your credentials, notification channels, privacy controls, and travel companion discovery rules.
        </p>

        {/* Tab Strip */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-moss-200">
          <button
            onClick={() => setActiveTab('security')}
            aria-pressed={activeTab === 'security'}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'security'
                ? 'bg-pine text-white shadow-lg shadow-trail-500/20'
                : 'bg-moss-100 text-moss-600 hover:bg-soft hover:text-forest'
            }`}
          >
            <Lock className="w-4 h-4" /> Password & Security
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            aria-pressed={activeTab === 'notifications'}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'notifications'
                ? 'bg-pine text-white shadow-lg shadow-trail-500/20'
                : 'bg-moss-100 text-moss-600 hover:bg-soft hover:text-forest'
            }`}
          >
            <Bell className="w-4 h-4" /> Notifications
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            aria-pressed={activeTab === 'privacy'}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'privacy'
                ? 'bg-pine text-white shadow-lg shadow-trail-500/20'
                : 'bg-moss-100 text-moss-600 hover:bg-soft hover:text-forest'
            }`}
          >
            <Eye className="w-4 h-4" /> Privacy & Visibility
          </button>
        </div>
      </div>

      {/* Tab 1: Password & Security */}
      {activeTab === 'security' && (
        <div className="bg-white border border-moss-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <h2 className="text-lg font-bold text-forest flex items-center gap-2 border-b border-moss-200 pb-3">
            <KeyRound className="w-4 h-4 text-trail-600" /> Change Account Password
          </h2>

          {pwSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {pwSuccess}
            </div>
          )}
          {pwError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {pwError}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
            <div>
              <label className="text-xs text-moss-500 block mb-1">Current Password</label>
              <input
                type="password"
                value={pwState.currentPassword}
                onChange={e => setPwState({ ...pwState, currentPassword: e.target.value })}
                required
                placeholder="••••••••"
                className="w-full bg-white border border-moss-200 rounded-xl px-4 py-2.5 text-sm text-forest focus:outline-none focus:border-pine"
              />
            </div>

            <div>
              <label className="text-xs text-moss-500 block mb-1">New Password (min 6 characters)</label>
              <input
                type="password"
                value={pwState.newPassword}
                onChange={e => setPwState({ ...pwState, newPassword: e.target.value })}
                required
                placeholder="••••••••"
                className="w-full bg-white border border-moss-200 rounded-xl px-4 py-2.5 text-sm text-forest focus:outline-none focus:border-pine"
              />
            </div>

            <div>
              <label className="text-xs text-moss-500 block mb-1">Confirm New Password</label>
              <input
                type="password"
                value={pwState.confirmPassword}
                onChange={e => setPwState({ ...pwState, confirmPassword: e.target.value })}
                required
                placeholder="••••••••"
                className="w-full bg-white border border-moss-200 rounded-xl px-4 py-2.5 text-sm text-forest focus:outline-none focus:border-pine"
              />
            </div>

            <button
              type="submit"
              disabled={pwLoading}
              className="px-6 py-2.5 rounded-xl bg-pine hover:bg-forest text-white font-semibold text-sm transition shadow-lg shadow-trail-500/20"
            >
              {pwLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Notifications */}
      {activeTab === 'notifications' && (
        <form onSubmit={handleSaveNotifications} className="bg-white border border-moss-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <h2 className="text-lg font-bold text-forest flex items-center gap-2 border-b border-moss-200 pb-3">
            <Bell className="w-4 h-4 text-trail-600" /> Email & Push Alert Preferences
          </h2>

          {notifSaved && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> Preferences saved!
            </div>
          )}

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-2xl bg-white border border-moss-200 cursor-pointer">
              <div>
                <div className="text-sm font-semibold text-forest">Trip Invitations & Join Approvals</div>
                <div className="text-xs text-moss-500">Receive instant alerts when an organizer approves your join request</div>
              </div>
              <input
                type="checkbox"
                checked={notifState.emailTripInvites}
                onChange={e => setNotifState({ ...notifState, emailTripInvites: e.target.checked })}
                className="w-5 h-5 rounded text-trail-600 focus:ring-pine bg-white border-moss-200"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-2xl bg-white border border-moss-200 cursor-pointer">
              <div>
                <div className="text-sm font-semibold text-forest">Group Chat Messages</div>
                <div className="text-xs text-moss-500">Notify when new messages or polls are posted in your travel group</div>
              </div>
              <input
                type="checkbox"
                checked={notifState.pushChatMessages}
                onChange={e => setNotifState({ ...notifState, pushChatMessages: e.target.checked })}
                className="w-5 h-5 rounded text-trail-600 focus:ring-pine bg-white border-moss-200"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-2xl bg-white border border-moss-200 cursor-pointer">
              <div>
                <div className="text-sm font-semibold text-forest">Weekly Tripzy Explorer Digest</div>
                <div className="text-xs text-moss-500">Curated trips, high-demand destinations, and new companion matches</div>
              </div>
              <input
                type="checkbox"
                checked={notifState.weeklyDigest}
                onChange={e => setNotifState({ ...notifState, weeklyDigest: e.target.checked })}
                className="w-5 h-5 rounded text-trail-600 focus:ring-pine bg-white border-moss-200"
              />
            </label>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-pine hover:bg-forest text-white font-semibold text-sm transition shadow-lg shadow-trail-500/20"
          >
            Save Alert Preferences
          </button>
        </form>
      )}

      {/* Tab 3: Privacy & Visibility */}
      {activeTab === 'privacy' && (
        <form onSubmit={handleSavePrivacy} className="bg-white border border-moss-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <h2 className="text-lg font-bold text-forest flex items-center gap-2 border-b border-moss-200 pb-3">
            <Eye className="w-4 h-4 text-trail-600" /> Traveler Visibility & Privacy Controls
          </h2>

          {privacySaved && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> Privacy settings updated!
            </div>
          )}

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-2xl bg-white border border-moss-200 cursor-pointer">
              <div>
                <div className="text-sm font-semibold text-forest">Public Explorer Profile</div>
                <div className="text-xs text-moss-500">Allow other Tripzy members to view your bio, ratings, and past trips</div>
              </div>
              <input
                type="checkbox"
                checked={privacyState.profilePublic}
                onChange={e => setPrivacyState({ ...privacyState, profilePublic: e.target.checked })}
                className="w-5 h-5 rounded text-trail-600 focus:ring-pine bg-white border-moss-200"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-2xl bg-white border border-moss-200 cursor-pointer">
              <div>
                <div className="text-sm font-semibold text-forest">Show City / Country on Profile</div>
                <div className="text-xs text-moss-500">Display your general location so travelers in your area can connect</div>
              </div>
              <input
                type="checkbox"
                checked={privacyState.showLocation}
                onChange={e => setPrivacyState({ ...privacyState, showLocation: e.target.checked })}
                className="w-5 h-5 rounded text-trail-600 focus:ring-pine bg-white border-moss-200"
              />
            </label>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-pine hover:bg-forest text-white font-semibold text-sm transition shadow-lg shadow-trail-500/20"
          >
            Save Privacy Settings
          </button>
        </form>
      )}
    </div>
  );
}
