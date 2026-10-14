import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { NavLink } from 'react-router-dom';
import {
  MapPin, Search, Compass, Calendar, IndianRupee,
  PlusCircle, Heart, Bot, ArrowRight, X, ExternalLink
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatRupees } from '../utils/currency';

// Custom Leaflet Icons using SVG DivIcon
const createCustomIcon = (name, color = '#245C45') => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `<div style="
      background: ${color};
      color: white;
      padding: 6px 10px;
      border-radius: 9999px;
      font-weight: 700;
      font-size: 11px;
      display: flex;
      align-items: center;
      gap: 4px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.25);
      border: 2px solid white;
      white-space: nowrap;
    ">
      <span>📍</span>
      <span>${name}</span>
    </div>`,
    iconSize: [80, 30],
    iconAnchor: [40, 15]
  });
};

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    }
  });
  return null;
}

export default function ExploreMap() {
  const { isAuthenticated } = useAuth();
  const [destinations, setDestinations] = useState([]);
  const [trips, setTrips] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [placeTrips, setPlaceTrips] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customPin, setCustomPin] = useState(null);
  const [wishlistSaved, setWishlistSaved] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [destRes, tripRes] = await Promise.all([
          api.get('/destinations'),
          api.get('/trips')
        ]);
        setDestinations(destRes.data);
        setTrips(tripRes.data);
        if (destRes.data.length > 0) {
          selectDestination(destRes.data[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const selectDestination = (dest) => {
    setSelectedPlace(dest);
    setCustomPin(null);
    const matched = trips.filter(t => t.destinationId === dest.id);
    setPlaceTrips(matched);
  };

  const handleMapClick = (latlng) => {
    setCustomPin(latlng);
    setSelectedPlace({
      name: `Selected Coordinates`,
      city: `Lat ${latlng.lat.toFixed(4)}`,
      country: `Lng ${latlng.lng.toFixed(4)}`,
      latitude: latlng.lat,
      longitude: latlng.lng,
      description: "Custom coordinate selected on map. You can plan an adventure or organize a new group journey here.",
      avgBudgetPerDay: 3000,
      bestTimeToVisit: "Check local seasonal forecast",
      popularAttractions: "Unexplored terrain & backcountry trails",
      heroImageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
    });
    setPlaceTrips([]);
  };

  const handleSavePlace = async () => {
    if (!selectedPlace?.id || !isAuthenticated) return;
    try {
      await api.post(`/wishlist/destinations/${selectedPlace.id}`, { notes: "Saved from Explore Map" });
      setWishlistSaved(true);
      setTimeout(() => setWishlistSaved(false), 3000);
    } catch (err) {}
  };

  const filteredDestinations = destinations.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.city && d.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (d.country && d.country.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
      {/* Top Map Controls Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-soft border border-moss-200/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-moss-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter places or drop pin anywhere..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-moss-50 border border-moss-200 rounded-xl focus:bg-white focus:border-pine outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-moss-400 hidden sm:inline">
            Click map to drop custom pin
          </span>
        </div>
      </div>

      {/* Main Map + Side Inspector Split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 relative">
        {/* Leaflet Map Container */}
        <div className="lg:col-span-8 h-full rounded-3xl overflow-hidden shadow-soft border border-moss-200 relative">
          <MapContainer
            center={[28.6139, 77.2090]} // Northern / central hub
            zoom={4}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapClickHandler onMapClick={handleMapClick} />

            {/* Destination Markers */}
            {filteredDestinations.map((dest) => (
              <Marker
                key={dest.id}
                position={[dest.latitude, dest.longitude]}
                icon={createCustomIcon(dest.name, selectedPlace?.id === dest.id ? '#142D20' : '#245C45')}
                eventHandlers={{
                  click: () => selectDestination(dest)
                }}
              >
                <Popup>
                  <div className="text-xs p-1">
                    <p className="font-bold text-sm">{dest.name}</p>
                    <p className="text-moss-500">{dest.city}, {dest.country}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Custom Dropped Pin */}
            {customPin && (
              <Marker
                position={[customPin.lat, customPin.lng]}
                icon={createCustomIcon('Selected Pin', '#B45309')}
              />
            )}
          </MapContainer>
        </div>

        {/* Side Inspector Sheet */}
        <div className="lg:col-span-4 h-full bg-white rounded-3xl p-6 shadow-soft border border-moss-200/80 overflow-y-auto space-y-5 flex flex-col justify-between">
          {selectedPlace ? (
            <div className="space-y-5">
              <div className="relative h-44 rounded-2xl overflow-hidden">
                <img
                  src={selectedPlace.heroImageUrl}
                  alt={selectedPlace.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-forest/90 text-white text-[10px] font-semibold">
                  {selectedPlace.city}, {selectedPlace.country}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-forest font-display">
                  {selectedPlace.name}
                </h3>
                <p className="text-xs text-moss-500 mt-1 leading-relaxed">
                  {selectedPlace.description}
                </p>
              </div>

              {/* Geo & Highlights */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-moss-50 p-3.5 rounded-2xl border border-moss-100">
                <div>
                  <span className="text-[10px] text-moss-400 block font-semibold">Coordinates</span>
                  <span className="font-mono text-[11px] text-moss-700">
                    {selectedPlace.latitude?.toFixed(4)}, {selectedPlace.longitude?.toFixed(4)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-moss-400 block font-semibold">Best Season</span>
                  <span className="text-moss-700 font-medium truncate block">
                    {selectedPlace.bestTimeToVisit}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <NavLink
                  to={`/create-trip?destinationName=${encodeURIComponent(selectedPlace.name)}`}
                  className="py-2.5 px-3 rounded-xl bg-forest hover:bg-pine text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition text-center shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-trail-400" />
                  <span>Create Trip Here</span>
                </NavLink>

                <button
                  onClick={handleSavePlace}
                  className="py-2.5 px-3 rounded-xl bg-moss-100 hover:bg-moss-200 text-moss-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Heart className={`w-3.5 h-3.5 ${wishlistSaved ? 'fill-red-500 text-red-500' : 'text-moss-500'}`} />
                  <span>{wishlistSaved ? 'Saved!' : 'Save Place'}</span>
                </button>
              </div>

              <NavLink
                to={`/tripzy-ai?prompt=${encodeURIComponent(`Tell me all about traveling to ${selectedPlace.name}`)}`}
                className="w-full py-2.5 px-3 rounded-xl bg-trail-50 hover:bg-trail-100 text-trail-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Bot className="w-3.5 h-3.5 text-trail-600" />
                <span>Ask Tripzy AI About This Place</span>
              </NavLink>

              {/* Available Trips Near Here */}
              <div className="pt-3 border-t border-moss-100 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-moss-500 flex items-center justify-between">
                  <span>Available Trips</span>
                  <span className="text-trail-600 font-semibold">{placeTrips.length} active</span>
                </h4>

                {placeTrips.length > 0 ? (
                  <div className="space-y-2">
                    {placeTrips.map(trip => (
                      <NavLink
                        key={trip.id}
                        to={`/trips/${trip.id}`}
                        className="p-3 rounded-xl bg-moss-50 hover:bg-trail-50/50 border border-moss-200/60 block transition"
                      >
                        <p className="font-semibold text-xs text-forest truncate">{trip.title}</p>
                        <div className="flex items-center justify-between text-[11px] text-moss-500 mt-1">
                          <span>{trip.startDate}</span>
                          <span className="font-bold text-trail-700">{formatRupees(trip.estimatedBudget)}</span>
                        </div>
                      </NavLink>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-moss-400 italic">
                    No active trips planned here yet. Click "Create Trip Here" to invite others!
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-moss-400 text-xs">
              Select any marker on the map to inspect place details and trips.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
