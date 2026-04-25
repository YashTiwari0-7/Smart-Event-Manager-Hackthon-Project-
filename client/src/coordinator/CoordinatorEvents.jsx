import React, { useState, useEffect } from "react";
import { getAssignedEvents } from "../services/coordinatorService";
import CoordinatorConfigure from "./CoordinatorConfigure";
import CoordinatorParticipants from "./CoordinatorParticipants";
import CoordinatorAttendance from "./CoordinatorAttendance";
import CoordinatorResults from "./CoordinatorResults";

const STATUS_COLOR = {
  open:      { bg: "#eef2ff", color: "#4f46e5" },
  closed:    { bg: "#fef3c7", color: "#d97706" },
  live:      { bg: "#ecfdf5", color: "#059669" },
  completed: { bg: "#f3f4f6", color: "#6b7280" },
};

const btn = (bg, fg) => ({
  background: bg, color: fg, border: "none", borderRadius: 8,
  padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer",
});

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
  if (view?.type === "participants") return <CoordinatorParticipants event={view.event} onBack={() => setView(null)} />;
  if (view?.type === "attendance")  return <CoordinatorAttendance event={view.event} onBack={() => setView(null)} />;
  if (view?.type === "results")     return <CoordinatorResults event={view.event} onBack={() => { setView(null); load(); }} />;

  const tabs = ["all", "open", "closed", "live", "completed"];
  const filtered = filter === "all" ? events : events.filter(e => e.status === filter);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>My Events</h2>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{
            padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700,
            border: "1px solid", cursor: "pointer",
            background: filter === t ? "#1e1b4b" : "#fff",
            color: filter === t ? "#fff" : "#374151",
            borderColor: filter === t ? "#1e1b4b" : "#e5e7eb",
          }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>Loading events…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", color: "#9ca3af" }}>
          No {filter !== "all" ? filter : ""} events found.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {filtered.map(event => {
            const sc = STATUS_COLOR[event.status] || STATUS_COLOR.open;
            const isCompleted = event.status === "completed";
            return (
              <div key={event._id} style={{
                background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb",
                padding: 20, display: "flex", flexDirection: "column", gap: 14,
                transition: "box-shadow 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>{event.title}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                      {event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "Date TBD"}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6, background: sc.bg, color: sc.color, textTransform: "capitalize", whiteSpace: "nowrap" }}>
                    {event.status}
                  </span>
                </div>

                {/* Info grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { l: "Type", v: event.participationType || "Not set" },
                    { l: "Slots", v: event.totalSlots || "TBD" },
                    { l: "Coordinators", v: (event.coordinators?.length || 0) + " assigned" },
                    { l: "Config Owner", v: event.configOwner ? "Locked" : "Open" },
                  ].map(item => (
                    <div key={item.l} style={{ background: "#f9fafb", padding: "8px 10px", borderRadius: 8 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase" }}>{item.l}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", textTransform: "capitalize" }}>{item.v}</div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {!isCompleted && (
                    <>
                      <button style={btn("#eef2ff", "#4f46e5")} onClick={() => setView({ type: "configure", event })}>
                        ⚙️ Configure
                      </button>
                      <button style={btn("#f5f3ff", "#7c3aed")} onClick={() => setView({ type: "participants", event })}>
                        👥 Participants
                      </button>
                    </>
                  )}
                  {event.status === "live" && (
                    <button style={btn("#ecfdf5", "#059669")} onClick={() => setView({ type: "attendance", event })}>
                      ✅ Attendance
                    </button>
                  )}
                  {isCompleted && (
                    <>
                      <button style={btn("#fef3c7", "#d97706")} onClick={() => setView({ type: "results", event })}>
                        🏆 Results
                      </button>
                      <button style={btn("#f5f3ff", "#7c3aed")} onClick={() => setView({ type: "participants", event })}>
                        👥 Participants
                      </button>
                    </>
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
