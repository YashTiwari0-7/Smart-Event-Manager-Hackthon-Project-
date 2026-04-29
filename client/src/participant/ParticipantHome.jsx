import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getAvailableEvents, getMyEvents, getMyCertificates, getAchievements
} from "../services/participantService";
import EventDetailModal from "./EventDetailModal";

/* ─── Sub-components ─── */

const StatCard = ({ icon, label, value, color, onClick }) => (
  <div
    onClick={onClick}
    className={`group bg-white rounded-2xl border border-gray-200/80 p-5 flex items-start gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${onClick ? "cursor-pointer" : "cursor-default"}`}
  >
    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: `${color}18` }}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-[28px] font-extrabold text-gray-900 leading-none">{value}</p>
    </div>
  </div>
);

const STATUS_STYLE = {
  OPEN:      "bg-indigo-50 text-indigo-600",
  CLOSED:    "bg-amber-50 text-amber-600",
  LIVE:      "bg-emerald-50 text-emerald-600",
  COMPLETED: "bg-gray-100 text-gray-500",
};

const EventCard = ({ event, onSelect }) => (
  <div
    onClick={() => onSelect(event)}
    className="group bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col gap-3"
  >
    <div className="flex justify-between items-start gap-3">
      <h3 className="text-base font-bold text-black leading-snug flex-1 min-w-0 truncate">{event.title}</h3>
      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize whitespace-nowrap shrink-0 ${STATUS_STYLE[event.status] || "bg-gray-100 text-gray-500"}`}>
        {event.status === "CLOSED" ? "Registration Closed" : (event.status || "OPEN")}
      </span>
    </div>
    {event.description && (
      <p className="text-xs text-gray-500 line-clamp-2 mt-1">{event.description}</p>
    )}
    <div className="text-sm text-gray-600 font-medium">
      📅 {event.registrationStartDate ? new Date(event.registrationStartDate).toLocaleDateString() : "TBD"} - {event.registrationEndDate ? new Date(event.registrationEndDate).toLocaleDateString() : "TBD"}
    </div>
    <div className="flex gap-4 text-sm font-semibold text-gray-700 mt-1 bg-gray-50 rounded-lg p-3 w-fit">
      <div className="flex items-center gap-1.5 capitalize pr-4 border-r border-gray-200">
        👥 {event.participationType === "individual" ? "Individual" : "Team"}
      </div>
      <div className="flex items-center gap-1.5">
        🎯 {event.participationType === "individual" 
            ? `Slots: ${event.availableSlots ?? "?"} / ${event.totalSlots ?? "?"}` 
            : `Teams: ${event.availableSlots ?? "?"} / ${event.totalTeams ?? "?"}`}
      </div>
      {event.participationType === "team" && (
        <div className="flex items-center gap-1.5 pl-4 border-l border-gray-200">
          Size: {event.maxTeamSize ? `${event.maxTeamSize} max` : "?"}
        </div>
      )}
    </div>
  </div>
);

/* ─── Main Component ─── */

export default function ParticipantHome({ onNavigate }) {
  const { user } = useAuth();
  const [available, setAvailable] = useState([]);
  const [myEvents,   setMyEvents]  = useState([]);
  const [certs,      setCerts]     = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [search,     setSearch]    = useState("");
  const [tab,        setTab]       = useState("available");
  const [selected,   setSelected]  = useState(null);

  const load = async () => {
    try {
      const [av, my, ce, ac] = await Promise.all([
        getAvailableEvents().catch(() => []),
        getMyEvents().catch(() => []),
        getMyCertificates().catch(() => []),
        getAchievements().catch(() => []),
      ]);
      setAvailable(av || []);
      setMyEvents(my || []);
      setCerts(ce || []);
      setAchievements(ac || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const activeReg  = myEvents.filter(r => r.status === "registered" && r.event?.status !== "COMPLETED");
  const pastReg    = myEvents.filter(r => r.event?.status === "COMPLETED");

  const filtered = available.filter(e =>
    !search || e.title.toLowerCase().includes(search.toLowerCase())
  );

  const TABS = [
    { id: "available", label: "Total Events", data: filtered },
    { id: "active",    label: "Active",            data: activeReg.map(r => ({ ...r.event, _regId: r._id, _reg: r })) },
    { id: "completed", label: "Completed Events",  data: pastReg.map(r => ({ ...r.event, _reg: r })) },
  ];

  const currentTab = TABS.find(t => t.id === tab) || TABS[0];

  return (
    <div className="flex flex-col gap-6">

      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl px-6 sm:px-8 py-7 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/[0.06] rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Welcome, {user?.name?.split(" ")[0] || "Participant"} 👋
            </h1>
            <p className="text-sm text-white/50 mt-1.5 font-medium">
              Explore events, register and track your achievements.
            </p>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <button onClick={() => onNavigate("certificates")} className="bg-white/[0.12] hover:bg-white/[0.2] backdrop-blur-sm text-white border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200">
              📜 Certificates
            </button>
            <button onClick={() => onNavigate("achievements")} className="bg-blue-500 hover:bg-blue-600 text-white border-none rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 hover:shadow-lg">
              🏆 Achievements
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon="📋" label="Total Events" value={available.length}      color="#2563eb" onClick={() => setTab("available")} />
        <StatCard icon="✅" label="Active Registrations" value={activeReg.length}  color="#10b981" onClick={() => setTab("active")} />
        <StatCard icon="🏆" label="Completed Events"    value={pastReg.length}    color="#f59e0b" onClick={() => setTab("completed")} />
        <StatCard icon="🏅" label="Achievements"       value={achievements.length} color="#7c3aed" onClick={() => onNavigate("achievements")} />
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base">🔍</span>
        <input
          type="text" placeholder="Search events…" value={search} onChange={e => setSearch(e.target.value)}
          className="w-full py-3 pl-11 pr-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all placeholder-gray-400"
        />
      </div>

      {/* ── Tabs + Content ── */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-1.5 flex-wrap">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize border transition-all duration-200 ${
                tab === t.id
                  ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {t.label} ({t.data.length})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-9 h-9 border-[3px] border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-sm font-medium">Loading events…</p>
            </div>
          </div>
        ) : currentTab.data.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl mx-auto mb-3">📭</div>
            <p className="text-sm font-semibold text-gray-400">No events found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {currentTab.data.map(e => <EventCard key={e._id} event={e} onSelect={setSelected} />)}
          </div>
        )}
      </div>

      {/* ── Event Detail Modal (now Side Panel) ── */}
      {selected && (
        <EventDetailModal
          event={selected}
          myEvents={myEvents}
          onClose={() => setSelected(null)}
          onRefresh={() => { load(); setSelected(null); }}
        />
      )}
    </div>
  );
}
