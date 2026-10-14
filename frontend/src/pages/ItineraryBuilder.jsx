import React, { useState, useEffect } from 'react';
import { useSearchParams, NavLink } from 'react-router-dom';
import {
  Route, Plus, Clock, MapPin, IndianRupee, Trash2,
  Calendar, CheckCircle2, ArrowRight, Share2
} from 'lucide-react';
import api from '../api/client';
import { formatRupees } from '../utils/currency';

export default function ItineraryBuilder() {
  const [searchParams] = useSearchParams();
  const itineraryId = searchParams.get('itineraryId');

  const [itinerary, setItinerary] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    dayNumber: 1,
    timeSlot: '10:00 AM',
    title: '',
    description: '',
    locationName: '',
    estimatedCost: 1000,
    notes: ''
  });

  useEffect(() => {
    if (itineraryId) {
      loadItinerary();
    } else {
      // Default to sample itinerary 1
      api.get('/itineraries/trip/1')
        .then(res => {
          setItinerary(res.data);
          return api.get(`/itineraries/${res.data.id}/items`);
        })
        .then(res => setItems(res.data))
        .catch(() => {});
    }
  }, [itineraryId]);

  const loadItinerary = async () => {
    try {
      const itemsRes = await api.get(`/itineraries/${itineraryId}/items`);
      setItems(itemsRes.data);
      // Fetch itinerary metadata
      setItinerary({
        id: itineraryId,
        title: "Curated Master Itinerary",
        totalDays: Math.max(...itemsRes.data.map(i => i.dayNumber), 3)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.title.trim()) return;

    try {
      const targetId = itinerary?.id || itineraryId || 1;
      const res = await api.post(`/itineraries/${targetId}/items`, {
        ...newItem,
        dayNumber: selectedDay
      });
      setItems([...items, res.data]);
      setIsModalOpen(false);
      setNewItem({
        dayNumber: selectedDay,
        timeSlot: '10:00 AM',
        title: '',
        description: '',
        locationName: '',
        estimatedCost: 1000,
        notes: ''
      });
    } catch (err) {
      alert("Failed to add activity");
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await api.delete(`/itineraries/items/${itemId}`);
      setItems(items.filter(i => i.id !== itemId));
    } catch (err) {
      alert("Failed to delete activity");
    }
  };

  const daysList = Array.from({ length: itinerary?.totalDays || 4 }, (_, i) => i + 1);
  const currentDayItems = items.filter(i => i.dayNumber === selectedDay);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-forest font-display flex items-center gap-2">
            <Route className="w-8 h-8 text-trail-600" />
            <span>Itinerary Builder</span>
          </h1>
          <p className="text-sm text-moss-500">
            {itinerary?.title || "Custom Journey Timeline"} • Interactive activity builder
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-pine hover:bg-forest text-white text-xs font-bold transition flex items-center gap-2 shadow-sm w-fit"
        >
          <Plus className="w-4 h-4" /> Add Activity to Day {selectedDay}
        </button>
      </div>

      {/* Day Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {daysList.map(d => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition shrink-0 ${
              selectedDay === d
                ? 'bg-forest text-white shadow-md'
                : 'bg-white hover:bg-moss-100 text-moss-600 border border-moss-200'
            }`}
          >
            Day {d}
          </button>
        ))}
      </div>

      {/* Activity Timeline Cards */}
      <div className="space-y-4">
        {currentDayItems.length > 0 ? (
          currentDayItems.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 shadow-soft border border-moss-200/80 flex items-start justify-between gap-4 transition hover:border-trail-200"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-trail-700 bg-trail-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.timeSlot}
                  </span>
                  {item.locationName && (
                    <span className="text-moss-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-moss-400" /> {item.locationName}
                    </span>
                  )}
                  {item.estimatedCost > 0 && (
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                      Est. {formatRupees(item.estimatedCost)}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-forest">
                  {item.title}
                </h3>

                <p className="text-xs text-moss-600 leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>

                {item.notes && (
                  <p className="text-[11px] text-moss-400 italic">
                    Note: {item.notes}
                  </p>
                )}
              </div>

              <button
                onClick={() => handleDeleteItem(item.id)}
                className="p-2 text-moss-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                title="Remove activity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-moss-200 space-y-3">
            <Calendar className="w-10 h-10 text-moss-300 mx-auto" />
            <h4 className="font-bold text-moss-700">No activities scheduled for Day {selectedDay}</h4>
            <p className="text-xs text-moss-400">Add an activity or excursion to populate this day's timeline.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-block mt-2 px-4 py-2 rounded-xl bg-pine text-white text-xs font-bold"
            >
              Add Activity
            </button>
          </div>
        )}
      </div>

      {/* Add Activity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-forest/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-moss-200 space-y-4">
            <h3 className="font-bold text-base text-forest font-display">
              Add Activity to Day {selectedDay}
            </h3>

            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-moss-700 block mb-1">Activity Title</label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="e.g. Solang Valley Gondola & Skiing"
                  className="w-full p-2.5 bg-moss-50 border border-moss-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-moss-700 block mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={newItem.timeSlot}
                    onChange={(e) => setNewItem({ ...newItem, timeSlot: e.target.value })}
                    placeholder="e.g. 09:30 AM"
                    className="w-full p-2.5 bg-moss-50 border border-moss-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine"
                  />
                </div>
                <div>
                  <label className="font-semibold text-moss-700 block mb-1">Est. Cost (₹)</label>
                  <input
                    type="number"
                    value={newItem.estimatedCost}
                    onChange={(e) => setNewItem({ ...newItem, estimatedCost: Number(e.target.value) })}
                    className="w-full p-2.5 bg-moss-50 border border-moss-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-moss-700 block mb-1">Location Landmark</label>
                <input
                  type="text"
                  value={newItem.locationName}
                  onChange={(e) => setNewItem({ ...newItem, locationName: e.target.value })}
                  placeholder="e.g. Solang Valley Base Terminal"
                  className="w-full p-2.5 bg-moss-50 border border-moss-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine"
                />
              </div>

              <div>
                <label className="font-semibold text-moss-700 block mb-1">Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  rows="2"
                  placeholder="Details of the activity..."
                  className="w-full p-2.5 bg-moss-50 border border-moss-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-moss-100 text-moss-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-pine text-white font-bold"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
