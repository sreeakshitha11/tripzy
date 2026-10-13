import React, { useState, useEffect } from 'react';
import {
  BookOpen, Plus, Calendar, Star, Lock, Globe,
  Users, Trash2, MapPin
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function TravelDiary() {
  const { isAuthenticated } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: '',
    destinationName: '',
    visitDate: new Date().toISOString().split('T')[0],
    content: '',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    activities: 'Sunrise viewpoint hike, lakeside campfire, stargazing',
    expenses: 120.0,
    rating: 5,
    visibility: 'PUBLIC'
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadEntries();
    }
  }, [isAuthenticated]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/diary/my');
      setEntries(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async (e) => {
    e.preventDefault();
    if (!newEntry.title.trim()) return;

    try {
      const res = await api.post('/diary', newEntry);
      setEntries([res.data, ...entries]);
      setIsModalOpen(false);
      setNewEntry({
        title: '',
        destinationName: '',
        visitDate: new Date().toISOString().split('T')[0],
        content: '',
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        activities: '',
        expenses: 0,
        rating: 5,
        visibility: 'PUBLIC'
      });
    } catch (err) {
      alert("Failed to save entry");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/diary/${id}`);
      setEntries(entries.filter(e => e.id !== id));
    } catch (err) {
      alert("Failed to delete entry");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center space-y-3">
        <BookOpen className="w-12 h-12 text-moss-300 mx-auto" />
        <h3 className="font-bold text-moss-700">Sign in to view your Travel Diary</h3>
        <p className="text-xs text-moss-400">Keep private or public memories, photos, and reflections of your adventures.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-forest font-display flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-trail-600" />
            <span>My Travel Diary</span>
          </h1>
          <p className="text-sm text-moss-500">
            Personal travel memories, photos, reflections, and privacy controls.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-forest hover:bg-pine text-white font-bold text-xs shadow-md transition flex items-center gap-2 w-fit"
        >
          <Plus className="w-4 h-4 text-trail-400" /> New Diary Entry
        </button>
      </div>

      {/* Diary Entries Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-moss-400">Loading diary entries...</div>
      ) : entries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {entries.map(entry => (
            <div
              key={entry.id}
              className="bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-premium border border-moss-200/80 transition flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img src={entry.imageUrl} alt={entry.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold flex items-center gap-1">
                    {entry.visibility === 'PRIVATE' ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                    <span>{entry.visibility}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-moss-400">
                    <Calendar className="w-3 h-3" />
                    <span>{entry.visitDate}</span>
                    <span>•</span>
                    <MapPin className="w-3 h-3 text-trail-600" />
                    <span className="font-semibold text-moss-700">{entry.destinationName}</span>
                  </div>

                  <h3 className="font-bold text-base text-forest">{entry.title}</h3>
                  <p className="text-xs text-moss-600 leading-relaxed whitespace-pre-line line-clamp-3">
                    {entry.content}
                  </p>

                  {entry.activities && (
                    <div className="pt-2 text-[11px] text-trail-800 font-medium bg-trail-50/60 p-2 rounded-xl">
                      Activities: {entry.activities}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between text-xs text-moss-500 border-t border-moss-100 mt-2">
                <span className="flex items-center gap-1 text-amber-700 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {entry.rating} / 5
                </span>
                {entry.expenses > 0 && (
                  <span className="font-bold text-moss-700">Spent: ${entry.expenses}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-moss-200 space-y-3">
          <BookOpen className="w-10 h-10 text-moss-300 mx-auto" />
          <h3 className="font-bold text-moss-700">No diary entries yet</h3>
          <p className="text-xs text-moss-400">Capture your first travel memories, reflections, and secret spots.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-pine text-white text-xs font-bold"
          >
            Create First Entry
          </button>
        </div>
      )}

      {/* New Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-forest/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-moss-200 space-y-4">
            <h3 className="font-bold text-lg text-forest font-display">New Travel Diary Entry</h3>

            <form onSubmit={handleCreateEntry} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-moss-700 block mb-1">Title</label>
                <input
                  type="text"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  placeholder="e.g. Sunrise above Solang Valley"
                  className="w-full p-2.5 bg-moss-50 border border-moss-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-moss-700 block mb-1">Destination</label>
                  <input
                    type="text"
                    value={newEntry.destinationName}
                    onChange={(e) => setNewEntry({ ...newEntry, destinationName: e.target.value })}
                    placeholder="e.g. Manali"
                    className="w-full p-2.5 bg-moss-50 border border-moss-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine"
                  />
                </div>
                <div>
                  <label className="font-semibold text-moss-700 block mb-1">Visit Date</label>
                  <input
                    type="date"
                    value={newEntry.visitDate}
                    onChange={(e) => setNewEntry({ ...newEntry, visitDate: e.target.value })}
                    className="w-full p-2.5 bg-moss-50 border border-moss-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-moss-700 block mb-1">Visibility</label>
                <select
                  value={newEntry.visibility}
                  onChange={(e) => setNewEntry({ ...newEntry, visibility: e.target.value })}
                  className="w-full p-2.5 bg-moss-50 border border-moss-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine"
                >
                  <option value="PUBLIC">Public (Visible to community)</option>
                  <option value="GROUP">Group Only (Shared with travel companions)</option>
                  <option value="PRIVATE">Private (Only you can see)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-moss-700 block mb-1">Memories & Content</label>
                <textarea
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                  rows="3"
                  placeholder="Write your personal reflections..."
                  className="w-full p-2.5 bg-moss-50 border border-moss-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-moss-100 text-moss-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-pine text-white font-bold"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
