import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calculator, IndianRupee, Users, PieChart, Plus,
  CheckCircle2, AlertCircle, ArrowRight, Wallet
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatRupees } from '../utils/currency';

export default function BudgetCalculator() {
  const [searchParams] = useSearchParams();
  const destParam = searchParams.get('destination') || 'Manali';
  const dailyParam = Number(searchParams.get('dailyCost')) || 3000;

  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('estimator'); // estimator or split
  const [travelers, setTravelers] = useState(2);
  const [days, setDays] = useState(5);

  // Category Estimates
  const [costs, setCosts] = useState({
    transport: 10000,
    accommodation: 15000,
    food: 8000,
    activities: 6000,
    localTransit: 3000,
    shopping: 4000,
    emergencyReserve: 4000
  });

  // Shared Group Expenses State
  const [myGroups, setMyGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [groupExpenses, setGroupExpenses] = useState([]);
  const [balanceSummary, setBalanceSummary] = useState(null);
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: 'Food & Dining',
    notes: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/trips/my-created').then(created => {
        api.get('/trips/my-joined').then(joined => {
          const allTrips = [...created.data, ...joined.data];
          if (allTrips.length > 0) {
            // Find corresponding groups
            Promise.all(allTrips.map(t => api.get(`/groups/trip/${t.id}`).catch(() => null)))
              .then(resList => {
                const groups = resList.filter(r => r && r.data).map(r => r.data);
                setMyGroups(groups);
                if (groups.length > 0) {
                  setSelectedGroupId(groups[0].id);
                  loadGroupFinance(groups[0].id);
                }
              });
          }
        });
      });
    }
  }, [isAuthenticated]);

  const loadGroupFinance = async (groupId) => {
    try {
      const [expRes, balRes] = await Promise.all([
        api.get(`/budget/groups/${groupId}/expenses`),
        api.get(`/budget/groups/${groupId}/balances`)
      ]);
      setGroupExpenses(expRes.data);
      setBalanceSummary(balRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGroupSelect = (gId) => {
    setSelectedGroupId(gId);
    loadGroupFinance(gId);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.title.trim() || !newExpense.amount || !selectedGroupId) return;

    try {
      await api.post(`/budget/groups/${selectedGroupId}/expenses`, {
        title: newExpense.title.trim(),
        amount: Number(newExpense.amount),
        category: newExpense.category,
        notes: newExpense.notes
      });
      setNewExpense({ title: '', amount: '', category: 'Food & Dining', notes: '' });
      loadGroupFinance(selectedGroupId);
    } catch (err) {
      alert("Failed to log expense");
    }
  };

  const totalCost = Object.values(costs).reduce((acc, curr) => acc + Number(curr), 0);
  const perPersonTotal = travelers > 0 ? Math.round(totalCost / travelers) : totalCost;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-forest font-display flex items-center gap-2">
          <Calculator className="w-8 h-8 text-trail-600" />
          <span>Budget Calculator & Shared Expenses</span>
        </h1>
        <p className="text-sm text-moss-500">
          Estimate travel costs for destinations and split expenses fairly across your group.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-moss-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('estimator')}
          className={`pb-3 transition ${activeTab === 'estimator' ? 'text-trail-600 border-b-2 border-trail-500 font-bold' : 'text-moss-500 hover:text-moss-800'}`}
        >
          Trip Cost Estimator
        </button>
        <button
          onClick={() => setActiveTab('split')}
          className={`pb-3 transition ${activeTab === 'split' ? 'text-trail-600 border-b-2 border-trail-500 font-bold' : 'text-moss-500 hover:text-moss-800'}`}
        >
          Group Expense Splitter ({myGroups.length} Groups)
        </button>
      </div>

      {/* Tab 1: Cost Estimator */}
      {activeTab === 'estimator' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Controls */}
          <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-moss-200/80 space-y-5">
            <h2 className="text-lg font-bold text-forest font-display">Configure Trip Estimates</h2>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-moss-700 block mb-1">Number of Travelers</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={travelers}
                  onChange={(e) => setTravelers(Math.max(1, Number(e.target.value)))}
                  className="w-full p-2.5 bg-moss-50 border border-moss-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine text-moss-900 placeholder:text-moss-600"
                />
              </div>
              <div>
                <label className="font-semibold text-moss-700 block mb-1">Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={days}
                  onChange={(e) => setDays(Math.max(1, Number(e.target.value)))}
                  className="w-full p-2.5 bg-moss-50 border border-moss-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine text-moss-900 placeholder:text-moss-600"
                />
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-moss-100 text-xs">
              <span className="font-bold text-moss-400 uppercase tracking-wider block">Cost Categories (₹)</span>
              {Object.keys(costs).map((cat) => (
                <div key={cat} className="flex items-center justify-between gap-4">
                  <span className="capitalize font-medium text-moss-700">
                    {cat.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <div className="relative w-36">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-moss-400">₹</span>
                    <input
                      type="number"
                      value={costs[cat]}
                      onChange={(e) => setCosts({ ...costs, [cat]: Number(e.target.value) })}
                      className="w-full pl-7 pr-3 py-1.5 bg-moss-50 border border-moss-200 rounded-xl text-right font-mono outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine text-moss-900 placeholder:text-moss-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Result Card */}
          <div className="md:col-span-5 space-y-4">
            <div className="bg-forest text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-5">
              <span className="text-xs font-bold text-trail-300 uppercase tracking-wider">
                Total Estimated Cost
              </span>
              <div>
                <h3 className="text-4xl font-black text-trail-300 font-display">
                  {formatRupees(totalCost)}
                </h3>
                <span className="text-xs text-moss-300">Total for all {travelers} travelers</span>
              </div>

              <div className="p-4 bg-white/10 rounded-2xl border border-white/15 space-y-1">
                <span className="text-[11px] text-moss-300 block">Cost Per Traveler:</span>
                <span className="text-2xl font-bold text-white font-display">{formatRupees(perPersonTotal)}</span>
                <span className="text-[10px] text-moss-300 block">({formatRupees(Math.round(perPersonTotal / days))} / person per day)</span>
              </div>

              <p className="text-[11px] text-moss-300 italic leading-relaxed">
                *Clearly labeled estimates. Actual on-ground prices fluctuate according to flight seasonality and booking advance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Group Expense Splitter */}
      {activeTab === 'split' && (
        <div className="space-y-6">
          {/* Select Group */}
          {myGroups.length > 0 ? (
            <div className="bg-white p-4 rounded-2xl border border-moss-200 flex items-center justify-between gap-4">
              <span className="text-xs font-semibold text-moss-700">Select Travel Group:</span>
              <select
                value={selectedGroupId}
                onChange={(e) => handleGroupSelect(e.target.value)}
                className="p-2 text-xs font-bold bg-moss-50 border border-moss-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine text-moss-900 placeholder:text-moss-600"
              >
                {myGroups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 text-center text-xs text-moss-400 border border-moss-200">
              You are not a member of any travel group yet. Once you join or host a trip, your group expense ledger will appear here!
            </div>
          )}

          {selectedGroupId && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Record Expense Form */}
              <div className="md:col-span-6 bg-white p-6 rounded-3xl shadow-soft border border-moss-200/80 space-y-4">
                <h3 className="font-bold text-base text-forest font-display flex items-center gap-2">
                  <Plus className="w-4 h-4 text-trail-600" />
                  <span>Log a Group Expense</span>
                </h3>

                <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-moss-700 block mb-1">Expense Description</label>
                    <input
                      type="text"
                      value={newExpense.title}
                      onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                      placeholder="e.g. Traditional Group Dinner at Cafe 1947"
                      className="w-full p-2.5 bg-moss-50 border border-moss-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine text-moss-900 placeholder:text-moss-600"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-moss-700 block mb-1">Amount (₹)</label>
                      <input
                        type="number"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                        placeholder="e.g. 2500"
                        className="w-full p-2.5 bg-moss-50 border border-moss-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine text-moss-900 placeholder:text-moss-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-moss-700 block mb-1">Category</label>
                      <select
                        value={newExpense.category}
                        onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                        className="w-full p-2.5 bg-moss-50 border border-moss-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine text-moss-900 placeholder:text-moss-600"
                      >
                        <option value="Food & Dining">Food & Dining</option>
                        <option value="Transport">Transport</option>
                        <option value="Stay">Stay & Camps</option>
                        <option value="Activities">Activities</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-pine hover:bg-forest text-white rounded-xl font-bold shadow-sm transition"
                  >
                    Add Group Expense (Split Equally)
                  </button>
                </form>

                {/* Logged Expenses List */}
                <div className="pt-4 border-t border-moss-100 space-y-2">
                  <h4 className="font-bold text-xs text-moss-500 uppercase tracking-wider">Logged Expenses</h4>
                  {groupExpenses.length > 0 ? (
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {groupExpenses.map(exp => (
                        <div key={exp.id} className="p-3 rounded-xl bg-moss-50 border border-moss-100 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-moss-900 block">{exp.title}</span>
                            <span className="text-[10px] text-moss-400">Paid by {exp.payerName} • {exp.category}</span>
                          </div>
                          <span className="font-bold text-trail-700">{formatRupees(exp.amount)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-moss-400 italic">No expenses logged yet.</p>
                  )}
                </div>
              </div>

              {/* Balances & Suggested Settlements */}
              <div className="md:col-span-6 bg-white p-6 rounded-3xl shadow-soft border border-moss-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-forest font-display flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-700" />
                    <span>Calculated Balances</span>
                  </h3>
                  <span className="text-xs font-bold text-trail-700">
                    Total: {formatRupees((balanceSummary?.totalGroupExpenses || 0))}
                  </span>
                </div>

                <div className="space-y-3">
                  {balanceSummary?.memberSummaries?.map(m => (
                    <div key={m.userId} className="p-3.5 rounded-2xl bg-moss-50 border border-moss-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={m.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"}
                          alt={m.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-trail-500"
                        />
                        <div>
                          <span className="font-bold text-moss-900 block">{m.name}</span>
                          <span className="text-[10px] text-moss-400">Paid {formatRupees(m.totalPaid)} • Share {formatRupees(m.totalOwed)}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`font-bold block ${m.netBalance >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                          {m.netBalance >= 0 ? `+ ${formatRupees(m.netBalance)}` : `- ${formatRupees(Math.abs(m.netBalance))}`}
                        </span>
                        <span className="text-[10px] text-moss-400">
                          {m.netBalance >= 0 ? 'Gets back' : 'Owes'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-[11px] text-amber-900 leading-snug">
                  ⚖️ {balanceSummary?.disclaimer || "Balances are mathematical calculations for shared budgeting and do not represent actual bank transfers."}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
