import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import * as coordinatorService from "../services/coordinatorService";

/* ─── Sub-components ─── */

const StatCard = ({ icon, label, value, color }) => (
  <div className="group bg-white rounded-2xl border border-gray-200/80 p-5 flex items-start gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
      style={{ background: `${color}12` }}
    >
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-[28px] font-extrabold text-gray-900 leading-none">{value}</p>
    </div>
  </div>
);

const EventCard = ({ event, onNavigate }) => {
  const statusStyles = {
    open:      "bg-indigo-50 text-indigo-600",
    live:      "bg-emerald-50 text-emerald-600",
    closed:    "bg-amber-50 text-amber-600",
    completed: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default flex flex-col gap-4">
      {/* Header: Name + Status */}
      <div className="flex justify-between items-start gap-3">
        <h3 className="text-base font-bold text-gray-900 leading-snug flex-1 min-w-0 truncate">{event.title}</h3>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize whitespace-nowrap shrink-0 ${statusStyles[event.status] || "bg-gray-100 text-gray-500"}`}>
          {event.status}
        </span>
      </div>

      {/* Reg Dates & Slots */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Registration</p>
          <p className="text-xs font-semibold text-gray-700 mt-0.5">
            {event.registrationStartDate ? new Date(event.registrationStartDate).toLocaleDateString() : "TBD"} - {event.registrationEndDate ? new Date(event.registrationEndDate).toLocaleDateString() : "TBD"}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
            {event.participationType === "individual" ? "Slots" : "Teams"}
          </p>
          <p className="text-xs font-semibold text-gray-700 mt-0.5">
            {event.participationType === "individual" ? (event.totalSlots ?? "—") : (event.totalTeams ?? "—")}
          </p>
        </div>
        {event.participationType === "team" && (
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Team Size</p>
            <p className="text-xs font-semibold text-gray-700 mt-0.5">
              {event.maxTeamSize ? `${event.maxTeamSize} members` : "—"}
            </p>
          </div>
        )}
      </div>

      {/* Type + Coordinators */}
      <div className="flex gap-4 text-sm font-semibold text-gray-700 bg-gray-50 rounded-lg px-3 py-2 w-fit">
        <div className="flex items-center gap-1.5 capitalize pr-4 border-r border-gray-200">
          👥 {event.participationType || "—"}
        </div>
        <div className="flex items-center gap-1.5">
          👨‍💼 {event.coordinators?.length || 1} Coordinators
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-auto pt-2">
        <button onClick={() => onNavigate("events")} className="flex-1 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-bold text-xs transition-colors">
          ⚙️ Configure
        </button>
        <button onClick={() => onNavigate("events")} className="flex-1 px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl font-bold text-xs transition-colors shadow-sm">
          👥 View Participants
        </button>
      </div>
    </div>
  );
};

/* ─── Main Component ─── */

export default function CoordinatorHome({ onNavigate }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, eventsData] = await Promise.all([
          coordinatorService.getCoordinatorStats(),
          coordinatorService.getAssignedEvents(),
        ]);
        setStats(statsData);
        setEvents(eventsData || []);
      } catch (err) { console.error("Failed to load:", err); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="w-9 h-9 border-[3px] border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm font-medium">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const getFilteredEvents = () => {
    switch (filter) {
      case "open": return events.filter(e => e.status === "OPEN");
      case "live": return events.filter(e => e.status === "LIVE");
      case "closed": return events.filter(e => e.status === "CLOSED");
      case "completed": return events.filter(e => e.status === "COMPLETED");
      default: return events;
    }
  };

  const filteredEvents = getFilteredEvents();
  const filters = ["all", "open", "live", "closed", "completed"];

  return (
    <div className="flex flex-col gap-6">

      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl px-6 sm:px-8 py-7 text-white shadow-lg">
        {/* Decorative accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.03] rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/[0.02] rounded-full translate-y-1/2 -translate-x-1/4 blur-xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Welcome back, {user?.name?.split(" ")[0] || "Coordinator"} 👋
            </h1>
            <p className="text-sm text-white/50 mt-1.5 font-medium">
              Manage your assigned events and track participation.
            </p>
          </div>
          <button
            onClick={() => onNavigate("events")}
            className="shrink-0 bg-white/[0.12] hover:bg-white/[0.2] backdrop-blur-sm text-white border border-white/[0.1] rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 hover:shadow-lg"
          >
            View All Events →
          </button>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon="📋" label="Total Assigned" value={stats?.totalAssigned || 0} color="#374151" />
        <StatCard icon="🚀" label="Active Events" value={stats?.upcoming || 0} color="#f59e0b" />
        <StatCard icon="✅" label="Completed" value={stats?.completed || 0} color="#10b981" />
        <StatCard icon="👥" label="Average Participants" value={stats?.totalAssigned ? Math.round(stats?.totalParticipants / stats?.totalAssigned) : 0} color="#3b82f6" />
      </div>

      {/* ── Events Section ── */}
      <div className="flex flex-col gap-4">
        {/* Section Header + Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-extrabold text-gray-900">Assigned Events</h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-1.5 flex-wrap">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize border transition-all duration-200 ${
                  filter === f
                    ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Events List Grid */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl mx-auto mb-3">
              📭
            </div>
            <p className="text-sm font-semibold text-gray-400">
              No {filter !== "all" ? filter : ""} events found.
            </p>
            <p className="text-xs text-gray-300 mt-1">
              {filter !== "all" ? "Try switching to a different filter." : "Events will appear here once assigned."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map(e => <EventCard key={e._id} event={e} onNavigate={onNavigate} />)}
          </div>
        )}
      </div>
    </div>
  );
}
