import React, { useState, useEffect } from 'react';
import { 
  Bell, Check, CheckCheck, Clock, UserCheck, MessageSquare, 
  ShieldAlert, Plane, Info, Trash2, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import client from '../api/client';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await client.get('/notifications');
      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await client.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await client.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type) => {
    switch (type) {
      case 'JOIN_REQUEST_APPROVED':
      case 'JOIN_REQUEST_SUBMITTED':
        return <UserCheck className="w-5 h-5 text-trail-600" />;
      case 'GROUP_MESSAGE':
      case 'GROUP_ANNOUNCEMENT':
        return <MessageSquare className="w-5 h-5 text-trail-600" />;
      case 'SAFETY_ALERT':
        return <ShieldAlert className="w-5 h-5 text-red-700" />;
      case 'TRIP_UPDATE':
        return <Plane className="w-5 h-5 text-amber-700" />;
      default:
        return <Bell className="w-5 h-5 text-trail-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white border border-moss-200 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-trail-500/10 text-trail-600 border border-trail-500/20 text-xs font-semibold uppercase tracking-wider mb-2">
            <Bell className="w-3.5 h-3.5" /> Notifications Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-forest tracking-tight">
            Updates & Trip Alerts
          </h1>
          <p className="text-moss-500 text-sm mt-1">
            Stay on top of join requests, organizer approvals, group chats, and itinerary changes.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 rounded-xl bg-moss-100 hover:bg-moss-200 text-trail-600 hover:text-trail-600 text-sm font-semibold flex items-center gap-2 border border-moss-200 transition shrink-0"
          >
            <CheckCheck className="w-4 h-4" /> Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-moss-200 pb-3">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-1.5 rounded-xl text-sm font-medium transition ${
            filter === 'ALL'
              ? 'bg-pine text-white'
              : 'text-moss-500 hover:text-forest'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-4 py-1.5 rounded-xl text-sm font-medium transition ${
            filter === 'UNREAD'
              ? 'bg-pine text-white'
              : 'text-moss-500 hover:text-forest'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notification List */}
      {loading ? (
        <div className="py-20 text-center text-moss-500 animate-pulse">Loading updates...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-moss-200 rounded-2xl p-12 text-center">
          <Bell className="w-12 h-12 text-moss-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-forest">No notifications</h3>
          <p className="text-moss-500 text-sm mt-1">
            {filter === 'UNREAD' ? "You're all caught up! No unread alerts." : "You have no notifications yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition flex items-start gap-4 ${
                item.isRead
                  ? 'bg-white border-moss-200 text-moss-600'
                  : 'bg-white border-trail-500/30 text-forest shadow-lg shadow-trail-500/5'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                item.isRead ? 'bg-moss-100 text-moss-500' : 'bg-trail-500/10 text-trail-600 border border-trail-500/20'
              }`}>
                {getIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="text-sm font-bold text-forest truncate">{item.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-moss-500 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}</span>
                  </div>
                </div>

                <p className="text-xs text-moss-600 leading-relaxed mb-3">
                  {item.message}
                </p>

                <div className="flex items-center gap-3">
                  {item.actionUrl && (
                    <Link
                      to={item.actionUrl}
                      className="text-xs font-semibold text-trail-600 hover:text-trail-600 flex items-center gap-1"
                    >
                      View Details <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  {!item.isRead && (
                    <button
                      onClick={() => markAsRead(item.id)}
                      className="text-xs text-moss-500 hover:text-moss-800 flex items-center gap-1 ml-auto"
                    >
                      <Check className="w-3 h-3" /> Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
