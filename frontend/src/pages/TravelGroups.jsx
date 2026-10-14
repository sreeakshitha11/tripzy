import React, { useState, useEffect, useRef } from 'react';
import {
  Users, MessageSquare, Megaphone, BarChart2, IndianRupee,
  Send, ShieldCheck, Plus, CheckCircle2, AlertTriangle, ArrowRight
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function TravelGroups() {
  const { user, isAuthenticated } = useAuth();
  const [joinedTrips, setJoinedTrips] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [polls, setPolls] = useState([]);
  const [activeTab, setActiveTab] = useState('chat'); // chat, announcements, polls, members
  const [newMessage, setNewMessage] = useState('');
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '', priority: 'NORMAL' });
  const [newPoll, setNewPoll] = useState({ question: '', option1: '', option2: '' });
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadGroups();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  const loadGroups = async () => {
    setLoading(true);
    try {
      // Find trips user created or joined
      const [createdRes, joinedRes] = await Promise.all([
        api.get('/trips/my-created'),
        api.get('/trips/my-joined')
      ]);
      const allMyTrips = [...createdRes.data, ...joinedRes.data];
      setJoinedTrips(allMyTrips);

      if (allMyTrips.length > 0) {
        selectGroup(allMyTrips[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectGroup = async (tripId) => {
    try {
      const groupRes = await api.get(`/groups/trip/${tripId}`);
      const group = groupRes.data;
      setActiveGroup(group);

      const [membersRes, msgsRes, annsRes, pollsRes] = await Promise.all([
        api.get(`/groups/${group.id}/members`),
        api.get(`/groups/${group.id}/messages`),
        api.get(`/groups/${group.id}/announcements`),
        api.get(`/groups/${group.id}/polls`)
      ]);
      setMembers(membersRes.data);
      setMessages(msgsRes.data);
      setAnnouncements(annsRes.data);
      setPolls(pollsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeGroup) return;

    try {
      const res = await api.post(`/groups/${activeGroup.id}/messages`, {
        content: newMessage.trim(),
        messageType: 'TEXT'
      });
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
    } catch (err) {
      alert("Failed to send message");
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) return;

    try {
      const res = await api.post(`/groups/${activeGroup.id}/announcements`, newAnnouncement);
      setAnnouncements(prev => [res.data, ...prev]);
      setNewAnnouncement({ title: '', content: '', priority: 'NORMAL' });
    } catch (err) {
      alert("Failed to post announcement");
    }
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    if (!newPoll.question.trim() || !newPoll.option1.trim() || !newPoll.option2.trim()) return;

    try {
      await api.post(`/groups/${activeGroup.id}/polls`, {
        question: newPoll.question,
        options: [newPoll.option1, newPoll.option2]
      });
      const updated = await api.get(`/groups/${activeGroup.id}/polls`);
      setPolls(updated.data);
      setNewPoll({ question: '', option1: '', option2: '' });
    } catch (err) {
      alert("Failed to create poll");
    }
  };

  const handleVote = async (pollId, optionId) => {
    try {
      await api.post(`/groups/polls/${pollId}/vote`, { optionId });
      const updated = await api.get(`/groups/${activeGroup.id}/polls`);
      setPolls(updated.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to vote");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center space-y-3">
        <Users className="w-12 h-12 text-moss-300 mx-auto" />
        <h3 className="font-bold text-moss-700">Sign in to access Travel Groups</h3>
        <p className="text-xs text-moss-400">Only verified companions and organizers can access private group chats.</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
      {/* Groups Sidebar Selector + Chat Hub */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* Left: My Groups List */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 shadow-soft border border-moss-200/80 overflow-y-auto space-y-4 flex flex-col">
          <div>
            <h2 className="text-lg font-bold text-forest font-display">My Travel Groups</h2>
            <p className="text-xs text-moss-400">Private spaces for confirmed trip companions</p>
          </div>

          <div className="space-y-2 flex-1">
            {joinedTrips.map(trip => {
              const isSelected = activeGroup?.tripId === trip.id;
              return (
                <button
                  key={trip.id}
                  onClick={() => selectGroup(trip.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition flex items-center gap-3 ${
                    isSelected
                      ? 'bg-trail-50/70 border-trail-400 shadow-xs'
                      : 'bg-moss-50 border-moss-200/60 hover:bg-moss-100'
                  }`}
                >
                  <img
                    src={trip.coverImageUrl}
                    alt={trip.title}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-forest truncate">{trip.title}</h4>
                    <p className="text-[11px] text-moss-500 truncate">{trip.destinationName} • {trip.startDate}</p>
                    <span className="text-[10px] text-emerald-700 font-semibold">{trip.currentParticipants} members</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Active Group Hub */}
        <div className="lg:col-span-8 bg-white rounded-3xl shadow-soft border border-moss-200/80 flex flex-col min-h-0 overflow-hidden">
          {activeGroup ? (
            <>
              {/* Group Header & Tabs */}
              <div className="p-4 sm:p-5 border-b border-moss-200/80 bg-moss-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg text-forest font-display">{activeGroup.name}</h3>
                  <p className="text-xs text-moss-500">{activeGroup.description}</p>
                </div>

                {/* Sub-tabs */}
                <div className="flex bg-moss-200/70 p-1 rounded-xl text-xs font-semibold gap-1">
                  {[
                    { id: 'chat', label: 'Chat', icon: MessageSquare },
                    { id: 'announcements', label: 'Announcements', icon: Megaphone },
                    { id: 'polls', label: 'Polls', icon: BarChart2 },
                    { id: 'members', label: 'Members', icon: Users }
                  ].map(t => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                          activeTab === t.id ? 'bg-white text-moss-900 shadow-xs font-bold' : 'text-moss-600 hover:text-moss-900'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab 1: Live Chat Thread */}
              {activeTab === 'chat' && (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-moss-50/50">
                    {messages.map((m) => {
                      const isMe = m.senderId === user?.id;
                      const isSystem = m.messageType === 'SYSTEM';

                      if (isSystem) {
                        return (
                          <div key={m.id} className="text-center py-2">
                            <span className="text-[11px] bg-moss-200/80 text-moss-600 px-3 py-1 rounded-full font-medium">
                              {m.content}
                            </span>
                          </div>
                        );
                      }

                      return (
                        <div key={m.id} className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                          <img
                            src={m.senderAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"}
                            alt={m.senderName}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-trail-500 shrink-0 mt-0.5"
                          />
                          <div className={`max-w-[75%] rounded-2xl p-3 text-xs shadow-xs ${
                            isMe
                              ? 'bg-pine hover:bg-forest text-white rounded-br-none'
                              : 'bg-white border border-moss-200 text-moss-800 rounded-bl-none'
                          }`}>
                            {!isMe && <span className="font-bold block text-[10px] text-trail-600 mb-0.5">{m.senderName}</span>}
                            <p className="leading-relaxed whitespace-pre-line">{m.content}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Message Input Box */}
                  <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-moss-200 flex gap-2 items-center">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a group message..."
                      className="flex-1 text-xs px-4 py-2.5 bg-moss-100 rounded-full border border-moss-200 focus:bg-white focus:border-pine outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="w-10 h-10 rounded-full bg-pine hover:bg-forest disabled:bg-moss-300 disabled:text-moss-700 disabled:shadow-none text-white flex items-center justify-center shrink-0 shadow-sm transition"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 2: Announcements */}
              {activeTab === 'announcements' && (
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Create Announcement */}
                  <form onSubmit={handleCreateAnnouncement} className="bg-moss-50 p-4 rounded-2xl border border-moss-200 space-y-3">
                    <h4 className="font-bold text-xs text-forest">Post an Announcement</h4>
                    <input
                      type="text"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Announcement Title"
                      className="w-full p-2.5 text-xs bg-white border border-moss-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine"
                    />
                    <textarea
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Details, meeting times, gear requirements..."
                      rows="2"
                      className="w-full p-2.5 text-xs bg-white border border-moss-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine"
                    />
                    <div className="flex justify-between items-center">
                      <select
                        value={newAnnouncement.priority}
                        onChange={(e) => setNewAnnouncement(prev => ({ ...prev, priority: e.target.value }))}
                        className="text-xs bg-white border border-moss-200 p-2 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine"
                      >
                        <option value="NORMAL">Normal Priority</option>
                        <option value="IMPORTANT">Important</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-forest text-white text-xs font-bold rounded-xl shadow-sm"
                      >
                        Publish Announcement
                      </button>
                    </div>
                  </form>

                  {/* Announcements Feed */}
                  <div className="space-y-3">
                    {announcements.map(a => (
                      <div key={a.id} className="p-4 rounded-2xl bg-white border border-moss-200 shadow-soft space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-forest">{a.title}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            a.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                            a.priority === 'IMPORTANT' ? 'bg-amber-100 text-amber-800' : 'bg-moss-100 text-moss-700'
                          }`}>
                            {a.priority}
                          </span>
                        </div>
                        <p className="text-xs text-moss-600 leading-relaxed whitespace-pre-line">{a.content}</p>
                        <span className="text-[10px] text-moss-400 block pt-1 border-t border-moss-100">
                          Posted by {a.authorName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Group Polls */}
              {activeTab === 'polls' && (
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Create Poll */}
                  <form onSubmit={handleCreatePoll} className="bg-moss-50 p-4 rounded-2xl border border-moss-200 space-y-3">
                    <h4 className="font-bold text-xs text-forest">Create a Group Poll</h4>
                    <input
                      type="text"
                      value={newPoll.question}
                      onChange={(e) => setNewPoll(prev => ({ ...prev, question: e.target.value }))}
                      placeholder="e.g. Which cafe or hike should we do on Day 2?"
                      className="w-full p-2.5 text-xs bg-white border border-moss-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newPoll.option1}
                        onChange={(e) => setNewPoll(prev => ({ ...prev, option1: e.target.value }))}
                        placeholder="Option 1"
                        className="p-2.5 text-xs bg-white border border-moss-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine"
                      />
                      <input
                        type="text"
                        value={newPoll.option2}
                        onChange={(e) => setNewPoll(prev => ({ ...prev, option2: e.target.value }))}
                        placeholder="Option 2"
                        className="p-2.5 text-xs bg-white border border-moss-200 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-pine/40 focus:border-pine"
                      />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-pine text-white text-xs font-bold rounded-xl shadow-sm">
                      Create Poll
                    </button>
                  </form>

                  {/* Polls Feed */}
                  <div className="space-y-4">
                    {polls.map((item, idx) => (
                      <div key={idx} className="p-5 rounded-2xl bg-white border border-moss-200 shadow-soft space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm text-forest">{item.poll.question}</h4>
                          <span className="text-[10px] text-moss-400">By {item.poll.creatorName}</span>
                        </div>

                        <div className="space-y-2">
                          {item.options.map(opt => (
                            <button
                              key={opt.id}
                              onClick={() => handleVote(item.poll.id, opt.id)}
                              disabled={item.hasVoted}
                              className={`w-full p-3 rounded-xl border text-left text-xs font-medium flex justify-between items-center transition ${
                                item.hasVoted
                                  ? 'bg-moss-50 border-moss-200 cursor-default'
                                  : 'bg-white hover:border-trail-500 hover:bg-trail-50/30'
                              }`}
                            >
                              <span>{opt.optionText}</span>
                              <span className="font-bold text-trail-700 bg-trail-50 px-2 py-0.5 rounded-full text-[11px]">
                                {opt.voteCount} votes
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: Member List */}
              {activeTab === 'members' && (
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <h4 className="font-bold text-sm text-forest">Confirmed Group Members ({members.length})</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {members.map(m => (
                      <div key={m.id} className="p-3.5 rounded-2xl bg-moss-50 border border-moss-200/80 flex items-center gap-3">
                        <img
                          src={m.userAvatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80"}
                          alt={m.userFullName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-trail-500 shrink-0"
                        />
                        <div>
                          <h5 className="font-bold text-xs text-moss-900">{m.userFullName}</h5>
                          <span className="text-[10px] font-semibold text-trail-700">{m.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center text-xs text-moss-400">
              Select a travel group from the left to access live chat and coordination.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
