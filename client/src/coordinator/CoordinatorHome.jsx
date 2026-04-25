import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import * as coordinatorService from "../services/coordinatorService";

const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "22px 20px",
    display: "flex", alignItems: "flex-start", gap: 14, transition: "box-shadow 0.2s, transform 0.2s",
    cursor: "default", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "none"; }}
  >
    <div style={{
      width: 44, height: 44, borderRadius: 12, background: `${color}15`,
      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0,
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "#111827", lineHeight: 1 }}>{value}</div>
    </div>
  </div>
);

const EventRow = ({ event, onNavigate }) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px",
    borderBottom: "1px solid #f3f4f6", transition: "background 0.1s",
  }}
    onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, background: "#f5f3ff",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0,
      }}>📅</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{event.title}</div>
        <div style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>
          {event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "No date set"}
        </div>
      </div>
    </div>
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <span style={{
        fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6, textTransform: "capitalize",
        background: event.status === "open" ? "#eef2ff" : event.status === "live" ? "#ecfdf5" : event.status === "closed" ? "#fef3c7" : "#f3f4f6",
        color: event.status === "open" ? "#4f46e5" : event.status === "live" ? "#059669" : event.status === "closed" ? "#d97706" : "#6b7280",
      }}>{event.status}</span>
    </div>
  </div>
);

export default function CoordinatorHome({ onNavigate }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #e5e7eb", borderTop: "3px solid #7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: "#9ca3af", fontSize: 13 }}>Loading dashboard…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const upcoming = events.filter(e => e.status === "open");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Welcome */}
      <div style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)", borderRadius: 16, padding: "28px 32px",
        color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16,
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Welcome, {user?.name?.split(" ")[0] || "Coordinator"} 👋</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>Manage your assigned events and track participation.</p>
        </div>
        <button onClick={() => onNavigate("events")} style={{
          background: "#7c3aed", color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px",
          fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "background 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "#6d28d9"}
          onMouseLeave={e => e.currentTarget.style.background = "#7c3aed"}
        >View All Events</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <StatCard icon="📋" label="Total Assigned" value={stats?.totalAssigned || 0} color="#7c3aed" />
        <StatCard icon="🚀" label="Upcoming Events" value={stats?.upcoming || 0} color="#f59e0b" />
        <StatCard icon="✅" label="Completed" value={stats?.completed || 0} color="#10b981" />
        <StatCard icon="👥" label="Total Participants" value={stats?.totalParticipants || 0} color="#3b82f6" />
      </div>

      {/* Upcoming Events */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid #e5e7eb",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: "#111827", margin: 0 }}>Upcoming Events</h3>
          <button onClick={() => onNavigate("events")} style={{
            background: "none", border: "none", fontSize: 12, fontWeight: 600, color: "#7c3aed", cursor: "pointer",
          }}>See all →</button>
        </div>
        <div>
          {upcoming.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No upcoming events.</div>
          ) : (
            upcoming.slice(0, 8).map(e => <EventRow key={e._id} event={e} onNavigate={onNavigate} />)
          )}
        </div>
      </div>
    </div>
  );
}
