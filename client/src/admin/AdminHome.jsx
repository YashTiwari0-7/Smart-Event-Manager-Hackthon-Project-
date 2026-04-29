import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import * as adminService from "../services/adminService";

/* ─── Sub-components ─── */

const StatCard = ({ icon, label, value, sub, color }) => (
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
      {sub && <p className="text-xs text-gray-500 font-medium mt-1">{sub}</p>}
    </div>
  </div>
);

const EventRow = ({ event }) => {
  const statusStyles = {
    OPEN:      "bg-indigo-50 text-indigo-600",
    CLOSED:    "bg-amber-50 text-amber-600",
    LIVE:      "bg-emerald-50 text-emerald-600",
    COMPLETED: "bg-gray-100 text-gray-500",
    upcoming:  "bg-indigo-50 text-indigo-600",
    ongoing:   "bg-emerald-50 text-emerald-600",
    open:      "bg-indigo-50 text-indigo-600",
    live:      "bg-emerald-50 text-emerald-600",
    completed: "bg-gray-100 text-gray-500",
    closed:    "bg-amber-50 text-amber-600",
  };

  return (
    <div className="group flex items-center justify-between px-5 py-3.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/80 transition-colors duration-150">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-base shrink-0 group-hover:bg-indigo-100 transition-colors">
          📅
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{event.title}</p>
          <p className="text-xs text-gray-400 font-medium mt-0.5">
            {event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "No date set"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-3">
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${statusStyles[event.status] || "bg-gray-100 text-gray-500"}`}>
          {event.status}
        </span>
        <span className="text-xs text-gray-400 font-semibold min-w-[36px] text-right">
          {event.participants?.length || 0} 👤
        </span>
      </div>
    </div>
  );
};

const CoordRow = ({ coord }) => (
  <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/60 transition-colors">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
        {coord.name?.charAt(0)?.toUpperCase() || "?"}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-gray-900 truncate">{coord.name}</p>
        <p className="text-[11px] text-gray-400 font-medium truncate">{coord.email}</p>
      </div>
    </div>
    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full shrink-0 ml-3">
      {coord.eventCount} events
    </span>
  </div>
);

/* ─── Main Component ─── */

export default function AdminHome({ onNavigate }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, eventsData, coordsData] = await Promise.all([
          adminService.getAdminStats(),
          adminService.getAllEvents(),
          adminService.getApprovedCoordinators(),
        ]);
        setStats(statsData);
        setEvents(eventsData || []);
        setCoordinators(coordsData || []);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="w-9 h-9 border-[3px] border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm font-medium">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const upcoming = events.filter(e => e.status === "upcoming" || e.status === "open");
  const coordMap = new Map();
  events.forEach(e => {
    (e.coordinators || []).forEach(c => {
      if (c?._id) {
        if (!coordMap.has(c._id)) coordMap.set(c._id, { ...c, eventCount: 1 });
        else coordMap.get(c._id).eventCount++;
      }
    });
  });
  const activeCoords = Array.from(coordMap.values()).slice(0, 8);

  return (
    <div className="flex flex-col gap-6">

      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl px-6 sm:px-8 py-7 text-white shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/[0.06] rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-violet-500/[0.04] rounded-full translate-y-1/2 -translate-x-1/4 blur-xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Welcome back, {user?.name?.split(" ")[0] || "Admin"} 👋
            </h1>
            <p className="text-sm text-white/50 mt-1.5 font-medium">
              Here's an overview of your event management platform.
            </p>
          </div>
          <button
            onClick={() => onNavigate("events")}
            className="shrink-0 bg-indigo-500 hover:bg-indigo-600 text-white border-none rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 hover:shadow-lg"
          >
            + Create Event
          </button>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon="📅" label="Total Events" value={stats?.totalEvents || 0} sub="All time" color="#6366f1" />
        <StatCard icon="🚀" label="Upcoming" value={stats?.upcomingEvents || 0} sub="Scheduled" color="#f59e0b" />
        <StatCard icon="👥" label="Participants" value={stats?.totalParticipation || 0} sub="Registered" color="#10b981" />
        <StatCard icon="📈" label="Avg / Event" value={stats?.avgParticipation || 0} sub="Per event" color="#8b5cf6" />
      </div>

      {/* ── Content Cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-gray-900">Upcoming Events</h3>
            <button onClick={() => onNavigate("events")} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              See all →
            </button>
          </div>
          {upcoming.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl mx-auto mb-2">📭</div>
              <p className="text-sm text-gray-400 font-medium">No upcoming events.</p>
            </div>
          ) : (
            upcoming.slice(0, 5).map(e => <EventRow key={e._id} event={e} />)
          )}
        </div>

        {/* Coordinators */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-gray-900">Active Coordinators</h3>
            <button onClick={() => onNavigate("coordinators")} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              View all →
            </button>
          </div>
          {activeCoords.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl mx-auto mb-2">👥</div>
              <p className="text-sm text-gray-400 font-medium">No active coordinators.</p>
            </div>
          ) : (
            activeCoords.map(c => <CoordRow key={c._id} coord={c} />)
          )}
        </div>
      </div>

      {/* ── Analytics CTA ── */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-gray-900">Analytics Overview</h3>
          <button onClick={() => onNavigate("analytics")} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
            View Detailed →
          </button>
        </div>
        <div className="py-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl mx-auto mb-3">📊</div>
          <p className="text-sm font-bold text-gray-700">Platform Analytics</p>
          <p className="text-xs text-gray-400 mt-1">Navigate to the full Analytics page for charts and insights.</p>
          <button
            onClick={() => onNavigate("analytics")}
            className="mt-4 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors"
          >
            View Charts →
          </button>
        </div>
      </div>
    </div>
  );
}
