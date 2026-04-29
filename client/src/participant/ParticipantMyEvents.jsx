import React, { useState, useEffect } from "react";
import { getMyEvents } from "../services/participantService";
import EventDetailModal from "./EventDetailModal";

const STATUS_STYLE = {
  open:      "bg-indigo-50 text-indigo-600",
  closed:    "bg-amber-50 text-amber-600",
  live:      "bg-emerald-50 text-emerald-600",
  completed: "bg-gray-100 text-gray-500",
};

const FILTERS = ["all", "registered", "live", "completed"];

export default function ParticipantMyEvents({ onBack }) {
  const [events,   setEvents]   = useState([]);
  const [filter,   setFilter]   = useState("all");
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    try {
      const data = await getMyEvents();
      setEvents(data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = events.filter(r => {
    if (!r.event) return false;
    if (filter === "all") return true;
    if (filter === "registered") return r.status === "registered" && r.event.status !== "completed";
    if (filter === "live")       return r.event.status === "live";
    if (filter === "completed")  return r.event.status === "completed";
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors">
            ← Back
          </button>
        )}
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Events</h2>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize border transition-all duration-200 ${
              filter === f
                ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="w-9 h-9 border-[3px] border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-medium">Loading…</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl mx-auto mb-3">📭</div>
          <p className="text-sm font-semibold text-gray-400">No events found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((reg, i) => {
            const ev = reg.event;
            return (
              <div
                key={reg._id || i}
                onClick={() => setSelected({ ...ev, _reg: reg })}
                className="group bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col gap-3"
              >
                <div className="flex justify-between items-start gap-3">
                  <h3 className="text-sm font-extrabold text-gray-900 leading-snug flex-1 min-w-0 truncate">{ev.title}</h3>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize shrink-0 ${STATUS_STYLE[ev.status] || "bg-gray-100 text-gray-500"}`}>
                    {ev.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["📅 Event Date", ev.eventDate ? new Date(ev.eventDate).toLocaleDateString() : "TBD"],
                    ["👥 Type", ev.participationType || "—"],
                    ["📝 My Status", reg.status],
                    ["🗓 Registered", reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : "—"],
                  ].map(([l, v]) => (
                    <div key={l} className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{l}</p>
                      <p className="text-xs font-semibold text-gray-700 capitalize mt-0.5">{v}</p>
                    </div>
                  ))}
                </div>
                {ev.status === "completed" && ev.results?.winner && (
                  <div className="px-3 py-2 bg-amber-50 rounded-lg text-xs text-amber-600 font-semibold">
                    🏆 Winner: {ev.results.winner?.name || "—"}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <EventDetailModal
          event={selected}
          myEvents={events}
          onClose={() => setSelected(null)}
          onRefresh={() => { load(); setSelected(null); }}
        />
      )}
    </div>
  );
}
