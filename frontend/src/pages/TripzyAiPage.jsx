import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, NavLink } from 'react-router-dom';
import { Bot, Send, Sparkles, Compass, MapPin, ArrowRight, RefreshCw, MessageSquare } from 'lucide-react';
import api from '../api/client';

// Explain why a chat request failed instead of a generic message
const chatErrorMessage = (err) => {
  if (!err.response) {
    return "I couldn't reach the Tripzy server. If the site was idle, the server may be waking up (this can take up to a minute). Please try again shortly.";
  }
  if (err.response.status === 401 || err.response.status === 403) {
    return "Your session has expired. Please sign in again and retry.";
  }
  return "Something went wrong on the Tripzy server. Please try again in a moment.";
};

export default function TripzyAiPage() {
  const [searchParams] = useSearchParams();
  const initialPrompt = searchParams.get('prompt') || '';

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "👋 Welcome to **Tripzy AI Travel Engine**!\n\nI am directly connected to the Tripzy community database, destination guides, and live trip listings. You can ask me:\n• *'Find matching trips to Manali or Goa'*\n• *'What is the best time to visit Santorini?'*\n• *'How can I reach Ladakh from Hyderabad?'*\n• *'Help me estimate a 6-day budget'*",
      suggestedFollowUps: [
        "Show me upcoming adventure trips",
        "Best time to visit Manali?",
        "What might a 5-day trip to Goa cost?"
      ]
    }
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (initialPrompt) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        message: textToSend,
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
        { sender: 'ai', text: chatErrorMessage(err) }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-6rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-soft border border-moss-200/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-trail-500/10 text-trail-600 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-forest font-display flex items-center gap-2">
              Tripzy AI Travel Engine
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full font-mono">
                ONLINE
              </span>
            </h1>
            <p className="text-xs text-moss-400">Context-aware assistant querying live destinations & trips</p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="p-2 text-xs text-moss-500 hover:text-moss-800 hover:bg-moss-100 rounded-xl transition flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Clear Chat
        </button>
      </div>

      {/* Main Chat Stream */}
      <div className="flex-1 overflow-y-auto bg-white rounded-3xl p-6 shadow-soft border border-moss-200/80 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-3xl p-4 text-sm leading-relaxed shadow-xs ${
              msg.sender === 'user'
                ? 'bg-forest text-white rounded-br-none'
                : 'bg-pine text-white rounded-bl-none'
            }`}>
              <p className="whitespace-pre-line">{msg.text}</p>
            </div>

            {/* Referenced Live DB Cards */}
            {msg.referencedData && msg.referencedData.length > 0 && (
              <div className="mt-3 space-y-2 w-full max-w-[85%]">
                {msg.referencedData.map((item, i) => (
                  <div key={i} className="bg-white p-3.5 rounded-2xl border border-trail-200 shadow-sm flex items-center justify-between">
                    <div className="min-w-0 pr-3">
                      <p className="font-bold text-xs text-forest truncate">{item.title || item.name}</p>
                      <p className="text-[11px] text-moss-500 truncate">{item.destinationName || item.city}</p>
                    </div>
                    <NavLink
                      to={item.startDate ? `/trips/${item.id}` : `/destinations/${item.id}`}
                      className="px-3 py-1.5 rounded-xl bg-pine hover:bg-forest text-white text-xs font-semibold shrink-0 flex items-center gap-1 shadow-xs"
                    >
                      View Live <ArrowRight className="w-3 h-3" />
                    </NavLink>
                  </div>
                ))}
              </div>
            )}

            {/* Chips */}
            {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3 max-w-[85%]">
                {msg.suggestedFollowUps.map((chip, chipIdx) => (
                  <button
                    key={chipIdx}
                    onClick={() => handleSend(chip)}
                    className="text-xs bg-trail-50 hover:bg-trail-100 text-trail-900 px-3 py-1 rounded-full border border-trail-200 transition flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-trail-600" />
                    <span>{chip}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-moss-50 rounded-2xl w-fit text-xs text-moss-500 border border-moss-200">
            <Bot className="w-4 h-4 text-trail-500 animate-spin" />
            <span>Tripzy AI is generating recommendations...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="bg-white p-3 rounded-3xl shadow-soft border border-moss-200/80 flex items-center gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about destinations, trips, or itineraries..."
          className="flex-1 text-moss-800 placeholder:text-moss-400 caret-trail-600 px-4 py-2.5 text-sm bg-moss-50 focus:bg-white rounded-2xl border border-moss-200 focus:border-pine outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-5 py-2.5 rounded-2xl bg-pine hover:bg-forest disabled:bg-moss-300 disabled:text-moss-700 disabled:shadow-none text-white text-xs font-bold shadow-md transition flex items-center gap-2"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask</span>
        </button>
      </form>
    </div>
  );
}
