import React, { useState, useEffect } from 'react';
import {
  CheckSquare, Plus, Sparkles, Trash2, CheckCircle2,
  Circle, Luggage, ArrowRight
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function PackingChecklist() {
  const { isAuthenticated } = useAuth();
  const [lists, setLists] = useState([]);
  const [activeListId, setActiveListId] = useState(null);
  const [activeList, setActiveList] = useState(null);
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newCategory, setNewCategory] = useState('Essentials');
  const [genDest, setGenDest] = useState('Manali');
  const [generating, setGenerating] = useState(false);

  const categories = ['Essentials', 'Documents', 'Clothing', 'Toiletries', 'Electronics', 'Medicines'];

  useEffect(() => {
    if (isAuthenticated) {
      loadLists();
    }
  }, [isAuthenticated]);

  const loadLists = async () => {
    try {
      const res = await api.get('/packing-lists');
      setLists(res.data);
      if (res.data.length > 0) {
        selectList(res.data[0].id);
      } else {
        // Auto generate first list
        handleGenerateSuggestions('General Adventure');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectList = async (id) => {
    setActiveListId(id);
    try {
      const res = await api.get(`/packing-lists/${id}`);
      setActiveList(res.data.list);
      setItems(res.data.items);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleItem = async (itemId) => {
    try {
      const res = await api.patch(`/packing-lists/items/${itemId}/toggle`);
      setItems(items.map(i => i.id === itemId ? res.data : i));
    } catch (err) {
      alert("Failed to toggle item");
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !activeListId) return;

    try {
      const res = await api.post(`/packing-lists/${activeListId}/items`, {
        itemName: newItemName.trim(),
        category: newCategory,
        isAiSuggested: false
      });
      setItems([...items, res.data]);
      setNewItemName('');
    } catch (err) {
      alert("Failed to add item");
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await api.delete(`/packing-lists/items/${itemId}`);
      setItems(items.filter(i => i.id !== itemId));
    } catch (err) {
      alert("Failed to delete item");
    }
  };

  const handleGenerateSuggestions = async (dest) => {
    setGenerating(true);
    try {
      const res = await api.post('/packing-lists/suggest', {
        destination: dest || genDest,
        duration: '1 Week',
        style: 'Adventurer'
      });
      loadLists();
    } catch (err) {
      alert("Failed to generate suggestions");
    } finally {
      setGenerating(false);
    }
  };

  const packedCount = items.filter(i => i.isPacked).length;
  const progressPercent = items.length > 0 ? Math.round((packedCount / items.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-forest font-display flex items-center gap-2">
            <CheckSquare className="w-8 h-8 text-trail-600" />
            <span>Packing Checklist</span>
          </h1>
          <p className="text-sm text-moss-500">
            Never forget essential gear, travel docs, or alpine medicines.
          </p>
        </div>

        {/* Generate suggestions button */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={genDest}
            onChange={(e) => setGenDest(e.target.value)}
            placeholder="Destination (e.g. Manali)"
            className="p-2 text-xs bg-white border border-moss-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine"
          />
          <button
            onClick={() => handleGenerateSuggestions(genDest)}
            disabled={generating}
            className="px-3.5 py-2 bg-pine hover:bg-forest text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{generating ? 'Generating...' : 'AI Suggest'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="bg-white p-6 rounded-3xl shadow-soft border border-moss-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm text-forest">{activeList?.title || "Trip Checklist"}</span>
          <span className="text-xs font-bold text-trail-700">{packedCount} of {items.length} items packed ({progressPercent}%)</span>
        </div>
        <div className="w-full bg-moss-100 h-3 rounded-full overflow-hidden">
          <div
            className="bg-pine hover:bg-forest h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Add Custom Item Form */}
      <form onSubmit={handleAddItem} className="bg-white p-4 rounded-2xl border border-moss-200/80 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Add custom packing item..."
          className="flex-1 p-2.5 text-xs bg-moss-50 rounded-xl border border-moss-200 outline-none focus:bg-white focus:border-pine"
          required
        />
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="p-2.5 text-xs bg-moss-50 rounded-xl border border-moss-200 outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine"
        >
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          type="submit"
          className="px-5 py-2.5 bg-forest hover:bg-pine text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </form>

      {/* Categorized Checklist Items */}
      <div className="space-y-6">
        {categories.map(cat => {
          const catItems = items.filter(i => i.category === cat);
          if (catItems.length === 0) return null;

          return (
            <div key={cat} className="bg-white p-6 rounded-3xl shadow-soft border border-moss-200/80 space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-moss-400 flex items-center justify-between">
                <span>{cat}</span>
                <span className="text-trail-600 font-semibold">{catItems.filter(i => i.isPacked).length}/{catItems.length}</span>
              </h3>

              <div className="space-y-2">
                {catItems.map(item => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                      item.isPacked ? 'bg-moss-50 border-moss-200 text-moss-400' : 'bg-white border-moss-200/80 text-moss-800'
                    }`}
                  >
                    <button
                      onClick={() => handleToggleItem(item.id)}
                      className="flex items-center gap-3 text-xs font-medium text-left flex-1"
                    >
                      {item.isPacked ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-moss-300 shrink-0" />
                      )}
                      <span className={item.isPacked ? 'line-through' : ''}>{item.itemName}</span>
                      {item.isAiSuggested && (
                        <span className="text-[10px] bg-trail-50 text-trail-700 px-2 py-0.5 rounded-full font-semibold">
                          AI Suggested
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 text-moss-300 hover:text-red-500 rounded-lg transition"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
