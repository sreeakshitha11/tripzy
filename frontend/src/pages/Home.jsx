import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass, Users, PlusCircle, ArrowRight, MapPin,
  Calendar, ShieldCheck, Star, Sparkles, Heart, Search, CheckCircle2
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [destinations, setDestinations] = useState([]);
  const [trips, setTrips] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [destRes, tripRes, storyRes] = await Promise.all([
          api.get('/destinations'),
          api.get('/trips'),
          api.get('/community/posts')
        ]);
        setDestinations(destRes.data.slice(0, 6));
        setTrips(tripRes.data.slice(0, 4));
        setStories(storyRes.data.slice(0, 3));
      } catch (err) {
        console.error("Error loading home dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-brand-gradient text-white shadow-2xl p-8 sm:p-12 lg:p-16">
        {/* Background Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest via-transparent to-transparent opacity-90" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-trail-500/20 border border-trail-400/30 text-trail-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-trail-400" />
            <span>AI-Powered Travel Companion & Group Discovery</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-display leading-tight">
            Your Next Adventure <br />
            <span className="text-gradient">Starts Here.</span>
          </h1>

          <p className="text-base sm:text-lg text-moss-300 leading-relaxed font-light">
            Discover incredible places, meet travel companions, and turn your travel dreams into real journeys. Don't let having no travel buddies stop you from seeing the world.
          </p>

          {/* 4 Action Cards Grid */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            <NavLink
              to="/destinations"
              className="glass-panel text-moss-900 p-4 rounded-2xl hover:bg-white hover:scale-105 transition shadow-lg group flex flex-col items-center text-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-trail-500/10 text-trail-600 flex items-center justify-center group-hover:bg-trail-500 group-hover:text-white transition">
                <Compass className="w-5 h-5" />
              </div>
              <span className="font-semibold text-xs sm:text-sm">Explore Destinations</span>
            </NavLink>

            <NavLink
              to="/open-to-travel"
              className="glass-panel text-moss-900 p-4 rounded-2xl hover:bg-white hover:scale-105 transition shadow-lg group flex flex-col items-center text-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-trail-500/10 text-trail-600 flex items-center justify-center group-hover:bg-trail-500 group-hover:text-white transition">
                <Users className="w-5 h-5" />
              </div>
              <span className="font-semibold text-xs sm:text-sm">Find Travel Buddies</span>
            </NavLink>

            <NavLink
              to="/create-trip"
              className="glass-panel text-moss-900 p-4 rounded-2xl hover:bg-white hover:scale-105 transition shadow-lg group flex flex-col items-center text-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-trail-500/10 text-trail-600 flex items-center justify-center group-hover:bg-trail-500 group-hover:text-white transition">
                <PlusCircle className="w-5 h-5" />
              </div>
              <span className="font-semibold text-xs sm:text-sm">Create a Trip</span>
            </NavLink>
          </div>
        </div>
      </section>

      {/* Trending Destinations */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-forest font-display">Trending Destinations</h2>
            <p className="text-sm text-moss-500">Curated dream spots with active companion groups</p>
          </div>
          <NavLink to="/destinations" className="text-sm font-semibold text-trail-600 hover:text-trail-700 flex items-center gap-1">
            View All Places <ArrowRight className="w-4 h-4" />
          </NavLink>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <NavLink
              key={dest.id}
              to={`/destinations/${dest.id}`}
              className="bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-premium border border-moss-200/80 transition-all duration-300 group flex flex-col"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={dest.heroImageUrl}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{dest.rating}</span>
                </div>
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-forest/80 backdrop-blur-md text-white text-xs font-medium">
                  {dest.city}, {dest.country}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-lg text-forest group-hover:text-trail-600 transition">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-moss-500 line-clamp-2 mt-1">
                    {dest.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-moss-100 flex items-center justify-between text-xs text-moss-600">
                  <span className="font-medium text-moss-500">
                    Est. <strong className="text-forest">₹{dest.avgBudgetPerDay}</strong> / day
                  </span>
                  <span className="text-trail-600 font-semibold group-hover:underline">
                    Explore Details &rarr;
                  </span>
                </div>
              </div>
            </NavLink>
          ))}
        </div>
      </section>

      {/* Upcoming Trips */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-forest font-display">Upcoming Adventures</h2>
            <p className="text-sm text-moss-500">Join real trips hosted by verified travelers</p>
          </div>
          <NavLink to="/search-trips" className="text-sm font-semibold text-trail-600 hover:text-trail-700 flex items-center gap-1">
            Search All Trips <ArrowRight className="w-4 h-4" />
          </NavLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trips.map((trip) => {
            const spotsLeft = trip.maxParticipants - trip.currentParticipants;
            return (
              <div
                key={trip.id}
                className="bg-white rounded-3xl p-5 shadow-soft hover:shadow-premium border border-moss-200/80 transition flex flex-col sm:flex-row gap-5"
              >
                <div className="sm:w-48 h-40 sm:h-auto rounded-2xl overflow-hidden shrink-0 relative">
                  <img
                    src={trip.coverImageUrl}
                    alt={trip.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-moss-800">
                    {trip.category}
                  </span>
                </div>

                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-moss-500 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-trail-500" />
                      <span>{trip.destinationName}</span>
                      <span>•</span>
                      <Calendar className="w-3.5 h-3.5 text-moss-400" />
                      <span>{trip.startDate}</span>
                    </div>

                    <NavLink to={`/trips/${trip.id}`}>
                      <h3 className="font-bold text-base text-forest hover:text-trail-600 transition line-clamp-1">
                        {trip.title}
                      </h3>
                    </NavLink>

                    <p className="text-xs text-moss-500 line-clamp-2 mt-1">
                      {trip.description}
                    </p>
                  </div>

                  {/* Organizer & Spots */}
                  <div className="flex items-center justify-between pt-2 border-t border-moss-100">
                    <div className="flex items-center gap-2">
                      <img
                        src={trip.organizerAvatar}
                        alt={trip.organizerName}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-trail-500"
                      />
                      <span className="text-xs text-moss-700 font-medium">{trip.organizerName}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-trail-600">
                        ₹{trip.estimatedBudget?.toLocaleString('en-IN')}
                      </span>
                      <span className="block text-[10px] text-emerald-700 font-semibold">
                        {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <NavLink
                      to={`/trips/${trip.id}`}
                      className="flex-1 text-center py-2 px-3 text-xs font-semibold rounded-xl bg-moss-100 hover:bg-moss-200 text-moss-700 transition"
                    >
                      View Details
                    </NavLink>
                    <NavLink
                      to={`/trips/${trip.id}`}
                      className="flex-1 text-center py-2 px-3 text-xs font-semibold rounded-xl bg-pine hover:bg-forest text-white transition shadow-sm"
                    >
                      Request to Join
                    </NavLink>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Community Stories & Inspiration */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-forest font-display">Travel Stories & Inspiration</h2>
            <p className="text-sm text-moss-500">Real journeys shared by our companion community</p>
          </div>
          <NavLink to="/community" className="text-sm font-semibold text-trail-600 hover:text-trail-700 flex items-center gap-1">
            Community Hub <ArrowRight className="w-4 h-4" />
          </NavLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stories.map((story) => (
            <div key={story.id} className="bg-white rounded-3xl p-6 shadow-soft border border-moss-200/80 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={story.authorAvatar}
                    alt={story.authorName}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-trail-500"
                  />
                  <div>
                    <h4 className="text-xs font-semibold text-moss-900">{story.authorName}</h4>
                    <span className="text-[10px] text-trail-600 font-medium">Visiting {story.destinationName}</span>
                  </div>
                </div>

                <h3 className="font-bold text-base text-forest line-clamp-2">
                  {story.title}
                </h3>
                <p className="text-xs text-moss-600 line-clamp-3 leading-relaxed">
                  {story.content}
                </p>
              </div>

              <div className="pt-3 border-t border-moss-100 flex items-center justify-between text-xs text-moss-500">
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                  {story.likesCount} Likes
                </span>
                <NavLink to="/community" className="text-trail-600 font-semibold hover:underline">
                  Read Story &rarr;
                </NavLink>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
