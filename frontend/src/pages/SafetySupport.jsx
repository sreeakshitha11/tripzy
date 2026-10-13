import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, PhoneCall, AlertTriangle, LifeBuoy, FileText, CheckCircle2, 
  HelpCircle, Clock, Send, ShieldCheck, Lock, Eye, UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export default function SafetySupport() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('guidelines'); // guidelines, report, support, history
  const [emergencyContacts, setEmergencyContacts] = useState({});
  const [myReports, setMyReports] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Report Form
  const [reportForm, setReportForm] = useState({
    reportedUserId: '',
    tripId: '',
    reason: 'HARASSMENT',
    description: '',
    evidenceUrl: ''
  });
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Support Form
  const [supportForm, setSupportForm] = useState({
    category: 'GENERAL_INQUIRY',
    subject: '',
    description: '',
    priority: 'MEDIUM'
  });
  const [submittingSupport, setSubmittingSupport] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);

  useEffect(() => {
    fetchEmergencyContacts();
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchEmergencyContacts = async () => {
    try {
      const res = await client.get('/safety/emergency-contacts');
      setEmergencyContacts(res.data || {});
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const [repRes, supRes] = await Promise.all([
        client.get('/safety/my-reports'),
        client.get('/safety/my-support-requests')
      ]);
      setMyReports(repRes.data || []);
      setMyTickets(supRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to submit a safety report.");
      return;
    }
    setSubmittingReport(true);
    try {
      const payload = {
        reportedUserId: reportForm.reportedUserId ? Number(reportForm.reportedUserId) : null,
        tripId: reportForm.tripId ? Number(reportForm.tripId) : null,
        reason: reportForm.reason,
        description: reportForm.description,
        evidenceUrl: reportForm.evidenceUrl || null
      };
      await client.post('/safety/report', payload);
      setReportSuccess(true);
      setReportForm({
        reportedUserId: '',
        tripId: '',
        reason: 'HARASSMENT',
        description: '',
        evidenceUrl: ''
      });
      fetchHistory();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit safety report.");
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to submit a support inquiry.");
      return;
    }
    setSubmittingSupport(true);
    try {
      await client.post('/safety/support', supportForm);
      setSupportSuccess(true);
      setSupportForm({
        category: 'GENERAL_INQUIRY',
        subject: '',
        description: '',
        priority: 'MEDIUM'
      });
      fetchHistory();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit support request.");
    } finally {
      setSubmittingSupport(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white border border-moss-200 rounded-3xl p-8 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-700 border border-red-500/20 text-xs font-semibold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-red-700" /> Traveler Trust & Safety 24/7
        </div>
        <h1 className="text-3xl font-display font-bold text-forest tracking-tight">
          Safe Travels with Verified Companions
        </h1>
        <p className="text-moss-500 text-sm mt-2 max-w-2xl leading-relaxed">
          At Tripzy, your physical security, privacy, and peace of mind come first. We combine ID verification, community vetting, emergency response channels, and immediate dispute resolution.
        </p>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-moss-200">
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === 'guidelines'
                ? 'bg-pine text-white shadow-lg shadow-trail-500/20'
                : 'bg-moss-100 text-moss-600 hover:bg-moss-100'
            }`}
          >
            Safety Guidelines
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === 'contacts'
                ? 'bg-pine text-white shadow-lg shadow-trail-500/20'
                : 'bg-moss-100 text-moss-600 hover:bg-moss-100'
            }`}
          >
            Emergency Contacts
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === 'report'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                : 'bg-moss-100 text-moss-600 hover:bg-moss-100'
            }`}
          >
            Report an Incident
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === 'support'
                ? 'bg-pine text-white shadow-lg shadow-trail-500/20'
                : 'bg-moss-100 text-moss-600 hover:bg-moss-100'
            }`}
          >
            Help & Support Tickets
          </button>
          {user && (
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === 'history'
                  ? 'bg-pine text-white shadow-lg shadow-trail-500/20'
                  : 'bg-moss-100 text-moss-600 hover:bg-moss-100'
              }`}
            >
              My Activity & Tickets ({myReports.length + myTickets.length})
            </button>
          )}
        </div>
      </div>

      {/* Tab: Safety Guidelines */}
      {activeTab === 'guidelines' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-moss-200 rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-trail-500/10 text-trail-600 flex items-center justify-center mb-4">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-forest mb-2">1. Verify Profiles First</h3>
              <p className="text-moss-500 text-sm leading-relaxed">
                Look for the blue verified badge on organizer and companion profiles. Review past trips completed, feedback ratings, and verified government ID status.
              </p>
            </div>

            <div className="bg-white border border-moss-200 rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-trail-500/10 text-trail-600 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-forest mb-2">2. Chat Within Tripzy</h3>
              <p className="text-moss-500 text-sm leading-relaxed">
                Always keep pre-trip communications inside the Tripzy Travel Group chat. Our system monitors spam, abusive messages, and preserves an audit trail.
              </p>
            </div>

            <div className="bg-white border border-moss-200 rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center mb-4">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-forest mb-2">3. Meet in Public Spaces</h3>
              <p className="text-moss-500 text-sm leading-relaxed">
                For initial group meetups and rendezvous points, choose well-lit public transit hubs, hotel lobbies, or prominent landmarks during daylight hours.
              </p>
            </div>
          </div>

          <div className="bg-white border border-moss-200 rounded-2xl p-8 space-y-4">
            <h2 className="text-xl font-bold text-forest flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-trail-600" /> Essential Golden Rules for Solo Explorers
            </h2>
            <ul className="space-y-3 text-moss-600 text-sm">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <span><b>Share Your Live Itinerary:</b> Use our export link or share trip URL with close family or trusted friends before traveling to high-altitude or remote terrain.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <span><b>Emergency Medical Preparedness:</b> Verify comprehensive adventure travel insurance covers your chosen destination (e.g. altitude sickness evacuations).</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <span><b>Zero Tolerance for Harassment:</b> Any form of verbal abuse, unsolicited physical contact, or extortion leads to immediate permanent ban and law enforcement escalation.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <span><b>Financial Transparency:</b> Never wire cash outside documented group splitters. Use Tripzy's integrated Budget Calculator and Expense Shares.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab: Emergency Contacts */}
      {activeTab === 'contacts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-white border border-moss-200 rounded-2xl p-6">
              <div className="text-xs uppercase font-bold text-red-700 tracking-wider mb-1">Worldwide Emergency</div>
              <h3 className="text-lg font-bold text-forest mb-2">Tripzy 24/7 Safety Hotline</h3>
              <p className="text-2xl font-black text-red-700 mb-2">{emergencyContacts.tripzyHotline || "+1 (800) 874-7999"}</p>
              <p className="text-xs text-moss-500">Available globally in English, Spanish, Hindi, and Japanese.</p>
            </div>

            <div className="bg-white border border-moss-200 rounded-2xl p-6">
              <div className="text-xs uppercase font-bold text-trail-600 tracking-wider mb-1">India National Helpline</div>
              <h3 className="text-lg font-bold text-forest mb-2">Tourist Police & Emergency</h3>
              <p className="text-2xl font-black text-trail-600 mb-2">{emergencyContacts.indiaTouristHelpline || "1363 / 112"}</p>
              <p className="text-xs text-moss-500">24-hour multilingual tourist assistance across all Indian states.</p>
            </div>

            <div className="bg-white border border-moss-200 rounded-2xl p-6">
              <div className="text-xs uppercase font-bold text-trail-600 tracking-wider mb-1">European Union</div>
              <h3 className="text-lg font-bold text-forest mb-2">Single Emergency Number</h3>
              <p className="text-2xl font-black text-trail-600 mb-2">{emergencyContacts.euEmergency || "112"}</p>
              <p className="text-xs text-moss-500">Toll-free emergency line across all EU member states including Greece & Switzerland.</p>
            </div>

            <div className="bg-white border border-moss-200 rounded-2xl p-6">
              <div className="text-xs uppercase font-bold text-trail-600 tracking-wider mb-1">Japan Helpline</div>
              <h3 className="text-lg font-bold text-forest mb-2">Japan Visitor Hotline</h3>
              <p className="text-2xl font-black text-trail-600 mb-2">{emergencyContacts.japanHotline || "050-3816-2720"}</p>
              <p className="text-xs text-moss-500">Operated by JNTO for emergencies, medical, and natural disasters.</p>
            </div>

            <div className="bg-white border border-moss-200 rounded-2xl p-6">
              <div className="text-xs uppercase font-bold text-trail-600 tracking-wider mb-1">United States</div>
              <h3 className="text-lg font-bold text-forest mb-2">National Emergency Dispatch</h3>
              <p className="text-2xl font-black text-trail-600 mb-2">{emergencyContacts.usEmergency || "911"}</p>
              <p className="text-xs text-moss-500">Police, ambulance, and mountain rescue services.</p>
            </div>

            <div className="bg-white border border-moss-200 rounded-2xl p-6">
              <div className="text-xs uppercase font-bold text-emerald-700 tracking-wider mb-1">Digital Safety</div>
              <h3 className="text-lg font-bold text-forest mb-2">Email Escalation Desk</h3>
              <p className="text-lg font-black text-emerald-700 mb-2">safety@tripzy.com</p>
              <p className="text-xs text-moss-500">Response turnaround within 15 minutes for flagged trip alerts.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Report Incident */}
      {activeTab === 'report' && (
        <div className="bg-white border border-moss-200 rounded-2xl p-8 max-w-2xl mx-auto space-y-6">
          <div>
            <h2 className="text-xl font-bold text-forest flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-700" /> Submit Confidential Safety Report
            </h2>
            <p className="text-moss-500 text-sm mt-1">
              Your report is strictly confidential and reviewed immediately by our Trust & Safety response team.
            </p>
          </div>

          {reportSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Report filed successfully. Our team has received the alert and is investigating.</span>
            </div>
          )}

          <form onSubmit={handleReportSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-moss-500 block mb-1">Category / Reason</label>
              <select
                value={reportForm.reason}
                onChange={e => setReportForm({ ...reportForm, reason: e.target.value })}
                className="w-full bg-white border border-moss-200 rounded-xl px-4 py-2.5 text-sm text-forest focus:outline-none focus:border-red-500"
              >
                <option value="HARASSMENT">Harassment or Inappropriate Conduct</option>
                <option value="SCAM_OR_FRAUD">Financial Fraud or Scam</option>
                <option value="SAFETY_VIOLATION">Dangerous Behavior / Safety Hazard</option>
                <option value="FAKE_PROFILE">Impersonation or False Information</option>
                <option value="OTHER">Other Serious Violation</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-moss-500 block mb-1">User ID (optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 2"
                  value={reportForm.reportedUserId}
                  onChange={e => setReportForm({ ...reportForm, reportedUserId: e.target.value })}
                  className="w-full bg-white border border-moss-200 rounded-xl px-4 py-2.5 text-sm text-forest focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-xs text-moss-500 block mb-1">Trip ID (optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 1"
                  value={reportForm.tripId}
                  onChange={e => setReportForm({ ...reportForm, tripId: e.target.value })}
                  className="w-full bg-white border border-moss-200 rounded-xl px-4 py-2.5 text-sm text-forest focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-moss-500 block mb-1">Detailed Description of What Happened</label>
              <textarea
                rows="5"
                placeholder="Please describe the incident, dates, locations, and any individuals involved..."
                value={reportForm.description}
                onChange={e => setReportForm({ ...reportForm, description: e.target.value })}
                required
                className="w-full bg-white border border-moss-200 rounded-xl px-4 py-2.5 text-sm text-forest focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="text-xs text-moss-500 block mb-1">Evidence URL / Screenshot Link (optional)</label>
              <input
                type="url"
                placeholder="https://imgur.com/example-screenshot"
                value={reportForm.evidenceUrl}
                onChange={e => setReportForm({ ...reportForm, evidenceUrl: e.target.value })}
                className="w-full bg-white border border-moss-200 rounded-xl px-4 py-2.5 text-sm text-forest focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              type="submit"
              disabled={submittingReport}
              className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white font-semibold text-sm transition shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              {submittingReport ? "Submitting Alert..." : "Dispatch Incident Report"}
            </button>
          </form>
        </div>
      )}

      {/* Tab: Help & Support */}
      {activeTab === 'support' && (
        <div className="bg-white border border-moss-200 rounded-2xl p-8 max-w-2xl mx-auto space-y-6">
          <div>
            <h2 className="text-xl font-bold text-forest flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-trail-600" /> Open a Support Ticket
            </h2>
            <p className="text-moss-500 text-sm mt-1">
              Have questions regarding trip booking, profile verification, payment splits, or app features?
            </p>
          </div>

          {supportSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Support ticket submitted! Our traveler support team will reply within 24 hours.</span>
            </div>
          )}

          <form onSubmit={handleSupportSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-moss-500 block mb-1">Category</label>
                <select
                  value={supportForm.category}
                  onChange={e => setSupportForm({ ...supportForm, category: e.target.value })}
                  className="w-full bg-white border border-moss-200 rounded-xl px-4 py-2.5 text-sm text-forest focus:outline-none focus:border-pine"
                >
                  <option value="GENERAL_INQUIRY">General Inquiry</option>
                  <option value="ACCOUNT_ISSUE">Account & Verification</option>
                  <option value="TRIP_PROBLEM">Trip or Booking Problem</option>
                  <option value="TECHNICAL_BUG">Bug or Tech Glitch</option>
                  <option value="FEATURE_REQUEST">Feature Idea / Feedback</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-moss-500 block mb-1">Priority</label>
                <select
                  value={supportForm.priority}
                  onChange={e => setSupportForm({ ...supportForm, priority: e.target.value })}
                  className="w-full bg-white border border-moss-200 rounded-xl px-4 py-2.5 text-sm text-forest focus:outline-none focus:border-pine"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High (Urgent)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-moss-500 block mb-1">Subject</label>
              <input
                type="text"
                placeholder="e.g. Need assistance with Ladakh group approval"
                value={supportForm.subject}
                onChange={e => setSupportForm({ ...supportForm, subject: e.target.value })}
                required
                className="w-full bg-white border border-moss-200 rounded-xl px-4 py-2.5 text-sm text-forest focus:outline-none focus:border-pine"
              />
            </div>

            <div>
              <label className="text-xs text-moss-500 block mb-1">Detailed Inquiry</label>
              <textarea
                rows="5"
                placeholder="How can we assist you today? Provide relevant details..."
                value={supportForm.description}
                onChange={e => setSupportForm({ ...supportForm, description: e.target.value })}
                required
                className="w-full bg-white border border-moss-200 rounded-xl px-4 py-2.5 text-sm text-forest focus:outline-none focus:border-pine"
              />
            </div>

            <button
              type="submit"
              disabled={submittingSupport}
              className="w-full py-3 rounded-xl bg-pine hover:bg-forest text-white font-semibold text-sm transition shadow-lg shadow-trail-500/20 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {submittingSupport ? "Sending Ticket..." : "Submit Support Request"}
            </button>
          </form>
        </div>
      )}

      {/* Tab: My Activity & Tickets */}
      {activeTab === 'history' && (
        <div className="space-y-8">
          {/* Reports filed */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-forest flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-700" /> Your Safety Reports ({myReports.length})
            </h3>
            {myReports.length === 0 ? (
              <p className="text-moss-500 text-sm bg-white border border-moss-200 p-6 rounded-2xl">
                You have not filed any safety incident reports.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myReports.map(rep => (
                  <div key={rep.id} className="bg-white border border-moss-200 p-5 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-700 border border-red-500/20">
                        {rep.reason}
                      </span>
                      <span className="text-xs font-semibold text-moss-500">
                        Status: <b className="text-trail-600">{rep.status}</b>
                      </span>
                    </div>
                    <p className="text-sm text-moss-800 line-clamp-2">{rep.description}</p>
                    <div className="text-xs text-moss-500 mt-3 pt-3 border-t border-moss-200">
                      Report ID #{rep.id} • Filed on {new Date(rep.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tickets opened */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-forest flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-trail-600" /> Your Support Tickets ({myTickets.length})
            </h3>
            {myTickets.length === 0 ? (
              <p className="text-moss-500 text-sm bg-white border border-moss-200 p-6 rounded-2xl">
                You have no active support requests.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myTickets.map(ticket => (
                  <div key={ticket.id} className="bg-white border border-moss-200 p-5 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-trail-500/10 text-trail-600 border border-trail-500/20">
                        {ticket.category}
                      </span>
                      <span className="text-xs font-semibold text-moss-500">
                        {ticket.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-forest mb-1">{ticket.subject}</h4>
                    <p className="text-xs text-moss-600 line-clamp-2">{ticket.description}</p>
                    {ticket.resolutionNotes && (
                      <div className="mt-2 p-2 rounded bg-moss-100 text-xs text-emerald-700">
                        Support Reply: {ticket.resolutionNotes}
                      </div>
                    )}
                    <div className="text-xs text-moss-500 mt-3 pt-3 border-t border-moss-200">
                      Ticket #{ticket.id} • {new Date(ticket.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
