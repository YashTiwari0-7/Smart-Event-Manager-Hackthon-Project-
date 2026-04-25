import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import * as adminService from "../services/adminService";

const StatCard = ({ icon, label, value, sub, color }) => (
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
      {sub && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4, fontWeight: 500 }}>{sub}</div>}
    </div>
  </div>
);

const EventRow = ({ event }) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px",
    borderBottom: "1px solid #f3f4f6", transition: "background 0.1s",
  }}
    onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, background: "#eef2ff",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0,
      }}>📅</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{event.title}</div>
        <div style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>
          {event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "No date set"}
        </div>
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{
        fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6,
        background: event.status === "upcoming" ? "#eef2ff" : event.status === "ongoing" ? "#ecfdf5" : "#f3f4f6",
        color: event.status === "upcoming" ? "#4f46e5" : event.status === "ongoing" ? "#059669" : "#6b7280",
        textTransform: "capitalize",
      }}>{event.status}</span>
      <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, minWidth: 30, textAlign: "right" }}>
        {event.participants?.length || 0} 👤
      </span>
    </div>
  </div>
);

const CoordRow = ({ coord }) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px",
    borderBottom: "1px solid #f3f4f6",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13, flexShrink: 0,
      }}>
        {coord.name?.charAt(0)?.toUpperCase() || "?"}
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{coord.name}</div>
        <div style={{ fontSize: 11, color: "#9ca3af" }}>{coord.email}</div>
      </div>
    </div>
    <span style={{
      fontSize: 11, fontWeight: 700, background: "#ecfdf5", color: "#059669", padding: "3px 8px", borderRadius: 6,
    }}>{coord.eventCount} events</span>
  </div>
);

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
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #e5e7eb", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: "#9ca3af", fontSize: 13 }}>Loading dashboard…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const upcoming = events.filter(e => e.status === "upcoming");
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
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Welcome */}
      <div style={{
        background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)", borderRadius: 16, padding: "28px 32px",
        color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16,
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Welcome back, {user?.name?.split(" ")[0] || "Admin"} 👋</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>Here's an overview of your event management platform.</p>
        </div>
        <button
          onClick={() => onNavigate("events")}
          style={{
            background: "#6366f1", color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px",
            fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "background 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#4f46e5"}
          onMouseLeave={e => e.currentTarget.style.background = "#6366f1"}
        >
          + Create Event
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <StatCard icon="📅" label="Total Events" value={stats?.totalEvents || 0} sub="All time" color="#6366f1" />
        <StatCard icon="🚀" label="Upcoming Events" value={stats?.upcomingEvents || 0} sub="Scheduled" color="#f59e0b" />
        <StatCard icon="👥" label="Total Participation" value={stats?.totalParticipation || 0} sub="Registered users" color="#10b981" />
        <StatCard icon="📈" label="Avg Participation" value={stats?.avgParticipation || 0} sub="Per event" color="#8b5cf6" />
      </div>

      {/* Two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Upcoming */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <div style={{
            padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#111827", margin: 0 }}>Upcoming Events</h3>
            <button
              onClick={() => onNavigate("events")}
              style={{ background: "none", border: "none", fontSize: 12, fontWeight: 600, color: "#6366f1", cursor: "pointer" }}
            >See all →</button>
          </div>
          <div>
            {upcoming.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No upcoming events.</div>
            ) : (
              upcoming.slice(0, 6).map(e => <EventRow key={e._id} event={e} />)
            )}
          </div>
        </div>

        {/* Active Coordinators */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <div style={{
            padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#111827", margin: 0 }}>Active Coordinators</h3>
            <button
              onClick={() => onNavigate("coordinators")}
              style={{ background: "none", border: "none", fontSize: 12, fontWeight: 600, color: "#6366f1", cursor: "pointer" }}
            >View all →</button>
          </div>
          <div>
            {activeCoords.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No active coordinators.</div>
            ) : (
              activeCoords.map(c => <CoordRow key={c._id} coord={c} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
