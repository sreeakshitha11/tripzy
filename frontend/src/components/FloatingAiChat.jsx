import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, MessageCircle, ArrowRight, Compass } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import api from '../api/client';

export default function FloatingAiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "👋 Hi! I'm **Tripzy AI**, your travel companion. Ask me anything about destinations, finding live trips to join, or budgeting!",
      suggestedFollowUps: [
        "Show upcoming adventure trips",
        "Best time to visit Manali?",
        "What are the budget estimates?"
      ]
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: query,
        history: messages.slice(-10).map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', text: m.text }))
      });

      const aiMsg = {
        sender: 'ai',
        text: res.data.reply,
        suggestedFollowUps: res.data.suggestedFollowUps || [],
        referencedData: res.data.referencedData || []
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: "Sorry, I encountered a temporary connection issue. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 bg-forest hover:bg-pine text-white rounded-full shadow-2xl hover:shadow-trail-500/25 hover:scale-105 transition-all group border border-trail-400/30"
          title="Open Tripzy AI Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-trail-300 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-forest animate-pulse" />
          </div>
          <span className="font-semibold text-sm tracking-wide">Ask Tripzy AI</span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 w-[95vw] sm:w-[420px] h-[580px] bg-white rounded-3xl shadow-2xl border border-moss-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-forest text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-trail-500/20 border border-trail-400/40 flex items-center justify-center text-trail-300">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm tracking-wide flex items-center gap-2">
                  Tripzy AI Assistant
                  <span className="text-[10px] bg-trail-400/20 text-trail-300 px-2 py-0.5 rounded-full font-mono">LIVE</span>
                </h3>
                <p className="text-[11px] text-moss-300">Connected to community database & travel engine</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-moss-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-moss-50/70 text-sm">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-forest text-white rounded-br-none'
                      : 'bg-pine text-white rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* Referenced Live Cards if available */}
                {msg.referencedData && msg.referencedData.length > 0 && (
                  <div className="mt-2.5 space-y-2 w-full max-w-[90%]">
                    {msg.referencedData.map((item, i) => (
                      <div key={i} className="bg-white p-3 rounded-xl border border-trail-100 shadow-sm flex items-center justify-between">
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-xs text-forest truncate">{item.title || item.name}</p>
                          <p className="text-[11px] text-moss-500 truncate">{item.destinationName || item.city}</p>
                        </div>
                        <NavLink
                          to={item.startDate ? `/trips/${item.id}` : `/destinations/${item.id}`}
                          onClick={() => setIsOpen(false)}
                          className="shrink-0 text-xs text-trail-600 hover:text-trail-700 font-semibold flex items-center gap-1"
                        >
                          View <ArrowRight className="w-3 h-3" />
                        </NavLink>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggested prompt chips */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[90%]">
                    {msg.suggestedFollowUps.map((chip, chipIdx) => (
                      <button
                        key={chipIdx}
                        onClick={() => handleSend(chip)}
                        className="text-[11px] bg-trail-50 hover:bg-trail-100 text-trail-800 px-2.5 py-1 rounded-full border border-trail-200/60 transition flex items-center gap-1 text-left"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-trail-600" />
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-moss-500 text-xs bg-white p-3 rounded-2xl w-fit border border-moss-200">
                <Bot className="w-4 h-4 text-trail-500 animate-spin" />
                <span>Tripzy AI is querying travel data...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-3 bg-white border-t border-moss-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about trips, places, costs, gear..."
                className="flex-1 text-moss-800 placeholder:text-moss-400 caret-trail-600 text-xs sm:text-sm px-4 py-2.5 bg-moss-100 rounded-full border border-moss-200 focus:bg-white focus:border-pine focus:ring-2 focus:ring-pine/20 outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-full bg-pine hover:bg-forest disabled:bg-moss-300 disabled:text-moss-700 disabled:shadow-none text-white flex items-center justify-center shrink-0 shadow-md transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
