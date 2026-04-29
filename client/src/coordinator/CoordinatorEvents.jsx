import React, { useState, useEffect } from "react";
import { getAssignedEvents } from "../services/coordinatorService";
import CoordinatorConfigure from "./CoordinatorConfigure";
import CoordinatorParticipants from "./CoordinatorParticipants";
import CoordinatorResults from "./CoordinatorResults";

const STATUS_STYLES = {
  OPEN:      "bg-indigo-50 text-indigo-600",
  CLOSED:    "bg-amber-50 text-amber-600",
  LIVE:      "bg-emerald-50 text-emerald-600",
  COMPLETED: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS = {
  OPEN: "Open",
  CLOSED: "Closed",
  LIVE: "Live",
  COMPLETED: "Completed",
};

export default function CoordinatorEvents() {
  const [events, setEvents]     = useState([]);
  const [filter, setFilter]     = useState("all");
  const [loading, setLoading]   = useState(true);
  const [view, setView]         = useState(null); // { type, event }

  const load = async () => {
    try {
      const data = await getAssignedEvents();
      setEvents(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (view?.type === "configure")   return <CoordinatorConfigure event={view.event} onBack={() => { setView(null); load(); }} />;
  if (view?.type === "participants") return <CoordinatorParticipants event={view.event} onBack={() => { setView(null); load(); }} setView={setView} />;
  if (view?.type === "results")     return <CoordinatorResults event={view.event} onBack={() => { setView(null); load(); }} />;

  const tabs = ["all", "OPEN", "CLOSED", "LIVE", "COMPLETED"];
  const filtered = filter === "all" ? events : events.filter(e => e.status?.toUpperCase() === filter);

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Events</h2>
          <p className="text-sm text-gray-400 font-medium mt-1">
            {events.length} total event{events.length !== 1 ? "s" : ""} assigned to you
          </p>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex gap-1.5 flex-wrap">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize border transition-all duration-200 ${
              filter === t
                ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {t === "all" ? "All" : STATUS_LABELS[t] || t}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="w-9 h-9 border-[3px] border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-medium">Loading events…</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl mx-auto mb-3">📭</div>
          <p className="text-sm font-semibold text-gray-400">
            No {filter !== "all" ? STATUS_LABELS[filter]?.toLowerCase() || filter : ""} events found.
          </p>
          <p className="text-xs text-gray-300 mt-1">Try a different filter or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(event => {
            const st = event.status?.toUpperCase() || "OPEN";
            const isCompleted = st === "COMPLETED";
            const badgeStyle = STATUS_STYLES[st] || STATUS_STYLES.OPEN;
            return (
              <div
                key={event._id}
                className="group bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-5 pb-0">
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-extrabold text-gray-900 leading-snug truncate">{event.title}</h3>
                      <p className="text-xs text-gray-400 font-medium mt-1">
                        {event.eventDate
                          ? new Date(event.eventDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
                          : "Date TBD"}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 ${badgeStyle}`}>
                      {STATUS_LABELS[st] || st}
                    </span>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="px-5 pb-4">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { l: "Type", v: event.participationType || "Not set" },
                      { 
                        l: event.participationType === "individual" ? "Slots" : "Teams", 
                        v: event.participationType === "individual" ? (event.totalSlots || "TBD") : (event.totalTeams || "TBD") 
                      },
                      ...(event.participationType === "team" ? [{ l: "Team Size", v: event.maxTeamSize ? `${event.maxTeamSize} members` : "TBD" }] : []),
                      { l: "Coordinators", v: (event.coordinators?.length || 0) + " assigned" },
                      { l: "Config", v: event.configOwner ? "Locked" : "Open" },
                    ].map(item => (
                      <div key={item.l} className="bg-gray-50 rounded-lg px-3 py-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{item.l}</p>
                        <p className="text-xs font-semibold text-gray-700 capitalize mt-0.5">{item.v}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions — always show Participants button for any status */}
                <div className="px-5 pb-5 pt-1 mt-auto flex gap-2 flex-wrap">
                  {!isCompleted && (
                    <button
                      onClick={() => setView({ type: "configure", event })}
                      className="flex-1 min-w-[100px] py-2 px-3 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors border border-indigo-100"
                    >
                      ⚙️ Configure
                    </button>
                  )}
                  <button
                    onClick={() => setView({ type: "participants", event })}
                    className="flex-1 min-w-[100px] py-2 px-3 rounded-lg text-xs font-bold bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors border border-violet-100"
                  >
                    👥 Participants
                  </button>
                  {isCompleted && (
                    <button
                      onClick={() => setView({ type: "results", event })}
                      className="flex-1 min-w-[100px] py-2 px-3 rounded-lg text-xs font-bold bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors border border-amber-100"
                    >
                      🏆 Results
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
