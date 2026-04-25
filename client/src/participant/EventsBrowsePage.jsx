import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const allEvents = [
  { id: 1,  name: "TechSummit 2025",       type: "Team",       status: "Ongoing",  date: "Apr 28, 2025", venue: "Main Auditorium", category: "Technology", seats: 12, desc: "Annual flagship tech conference." },
  { id: 2,  name: "AI & ML Workshop",      type: "Individual", status: "Upcoming", date: "May 3, 2025",  venue: "Lab Block B",     category: "Technology", seats: 45, desc: "Hands-on workshop on AI/ML fundamentals." },
  { id: 3,  name: "Pitch Night",           type: "Team",       status: "Upcoming", date: "May 10, 2025", venue: "Innovation Hub",  category: "Business",   seats: 30, desc: "Present your startup idea to investors." },
  { id: 4,  name: "Design Masterclass",    type: "Individual", status: "Ongoing",  date: "Apr 26, 2025", venue: "Room 204",        category: "Design",     seats: 8,  desc: "Master Figma and design systems." },
  { id: 5,  name: "Leadership Bootcamp",   type: "Individual", status: "Upcoming", date: "May 15, 2025", venue: "Seminar Hall",    category: "Education",  seats: 60, desc: "Develop essential leadership skills." },
  { id: 6,  name: "Hackathon 2025",        type: "Team",       status: "Upcoming", date: "May 20, 2025", venue: "Tech Park",       category: "Technology", seats: 20, desc: "24-hour coding hackathon." },
  { id: 7,  name: "Data Science Summit",   type: "Individual", status: "Upcoming", date: "Jun 1, 2025",  venue: "Conference Hall", category: "Technology", seats: 80, desc: "Explore data science at scale." },
  { id: 8,  name: "Marketing Workshop",    type: "Team",       status: "Upcoming", date: "Jun 5, 2025",  venue: "Room 101",        category: "Business",   seats: 35, desc: "Digital marketing strategies for 2025." },
];

const categories = ["All", "Technology", "Business", "Design", "Education"];

const EventCard = ({ event }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-300 transition-all flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 leading-tight">{event.name}</h3>
          <span className="inline-block mt-1 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
            {event.category}
          </span>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${
          event.status === "Ongoing" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 border border-gray-300"
        }`}>
          {event.status}
        </span>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">{event.desc}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
        <span className="flex items-center gap-1"><span>📍</span>{event.venue}</span>
        <span className="flex items-center gap-1"><span>📅</span>{event.date}</span>
        <span className="flex items-center gap-1"><span>{event.type === "Team" ? "👥" : "👤"}</span>{event.type}</span>
        <span className="flex items-center gap-1"><span>🎟️</span>{event.seats} seats left</span>
      </div>
      <button className="mt-auto w-full py-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-xl transition-all">
        Register Now
      </button>
    </div>
  );
};

const EventsBrowsePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const filtered = allEvents.filter(e => {
    const matchSearch   = e.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || e.category === category;
    const matchType     = typeFilter === "All" || e.type === typeFilter;
    return matchSearch && matchCategory && matchType;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-800">⚡</span>
          <span className="text-base font-bold text-gray-900 tracking-tight">
            Smart<span className="text-gray-500">Event</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/participant-dashboard")}
            className="text-xs font-semibold text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-all bg-gray-50 hover:bg-gray-100"
          >
            ← Dashboard
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Browse Events</h1>
          <p className="text-sm text-gray-400 mt-1">Discover and register for upcoming events.</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-gray-400 bg-gray-50 placeholder-gray-400"
          />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-gray-400 bg-gray-50 text-gray-700"
          >
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-gray-400 bg-gray-50 text-gray-700"
          >
            {["All", "Individual", "Team"].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Results Count */}
        <p className="text-xs text-gray-400 font-medium">{filtered.length} event{filtered.length !== 1 ? "s" : ""} found</p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(event => <EventCard key={event.id} event={event} />)}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
              No events match your filters.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center pt-4 pb-2 border-t border-gray-100">
          <p className="text-xs text-gray-400">© 2025 SmartEvent Platform · Participant Portal</p>
        </div>
      </main>
    </div>
  );
};

export default EventsBrowsePage;
