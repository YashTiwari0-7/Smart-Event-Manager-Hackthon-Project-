import React, { useState, useEffect } from "react";
import * as adminService from "../services/adminService";
import * as analyticsService from "../services/analyticsService";

const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 20, ...style }}>{children}</div>
);

const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "18px 16px",
    display: "flex", alignItems: "center", gap: 12, transition: "box-shadow 0.2s",
  }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.06)"}
    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
  >
    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>{value}</div>
    </div>
  </div>
);

const BarChart = ({ data, labelKey, valueKey, title, maxHeight = 180 }) => {
  const maxVal = Math.max(...data.map(d => d[valueKey] || 0), 1);
  return (
    <Card>
      <h4 style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 16, margin: "0 0 16px 0" }}>{title}</h4>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: maxHeight }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", marginBottom: 4 }}>{d[valueKey]}</div>
            <div style={{
              width: "100%", maxWidth: 48, borderRadius: "6px 6px 0 0",
              background: `linear-gradient(180deg, #6366f1, #8b5cf6)`,
              height: `${(d[valueKey] / maxVal) * 100}%`, minHeight: 4,
              transition: "height 0.4s ease",
            }} />
            <div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", marginTop: 6, textAlign: "center", lineHeight: 1.2, maxWidth: 60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {d[labelKey]?.length > 10 ? d[labelKey].slice(0, 10) + "…" : d[labelKey]}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const DonutChart = ({ data, title }) => {
  const total = Object.values(data).reduce((s, v) => s + v, 0) || 1;
  const colors = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];
  const entries = Object.entries(data);
  let accumulated = 0;

  return (
    <Card>
      <h4 style={{ fontSize: 13, fontWeight: 700, color: "#374151", margin: "0 0 16px 0" }}>{title}</h4>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
          <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
            {entries.map(([key, val], i) => {
              const pct = (val / total) * 100;
              const offset = accumulated;
              accumulated += pct;
              return (
                <circle key={key} cx="18" cy="18" r="14" fill="none" stroke={colors[i % colors.length]}
                  strokeWidth="5" strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={-offset}
                  style={{ transition: "stroke-dasharray 0.4s" }} />
              );
            })}
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>{total}</div>
            <div style={{ fontSize: 9, color: "#9ca3af", fontWeight: 600 }}>Total</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {entries.map(([key, val], i) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#374151" }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: colors[i % colors.length], flexShrink: 0 }} />
              <span style={{ fontWeight: 600, textTransform: "capitalize" }}>{key}</span>
              <span style={{ color: "#9ca3af", fontWeight: 500 }}>({val})</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default function AdminAnalytics() {
  const [activeTab, setActiveTab] = useState("overall");
  const [overall, setOverall] = useState(null);
  const [events, setEvents] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedCoordId, setSelectedCoordId] = useState("");
  const [eventAnalytics, setEventAnalytics] = useState(null);
  const [coordAnalytics, setCoordAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ov, ev, co] = await Promise.all([
          analyticsService.getOverallAnalytics(),
          adminService.getAllEvents(),
          adminService.getApprovedCoordinators(),
        ]);
        setOverall(ov); setEvents(ev || []); setCoordinators(co || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    load();
  }, []);

  const loadEventAnalytics = async (id) => {
    setSelectedEventId(id); setEventAnalytics(null);
    if (!id) return;
    try {
      const data = await analyticsService.getEventAnalytics(id);
      setEventAnalytics(data);
    } catch (err) { console.error(err); }
  };

  const loadCoordAnalytics = async (id) => {
    setSelectedCoordId(id); setCoordAnalytics(null);
    if (!id) return;
    try {
      const data = await analyticsService.getCoordinatorAnalytics(id);
      setCoordAnalytics(data);
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #e5e7eb", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: "#9ca3af", fontSize: 13 }}>Loading analytics…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Analytics</h2>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { id: "overall", label: "Overall" },
          { id: "event", label: "Event-wise" },
          { id: "coordinator", label: "Coordinator-wise" },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 700, border: "1px solid", cursor: "pointer",
            background: activeTab === t.id ? "#1e293b" : "#fff", color: activeTab === t.id ? "#fff" : "#374151",
            borderColor: activeTab === t.id ? "#1e293b" : "#e5e7eb", transition: "all 0.15s",
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── OVERALL ── */}
      {activeTab === "overall" && overall && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            <StatCard icon="📅" label="Total Events" value={overall.totals.totalEvents} color="#6366f1" />
            <StatCard icon="🚀" label="Upcoming" value={overall.totals.upcomingEvents} color="#f59e0b" />
            <StatCard icon="🔴" label="Ongoing" value={overall.totals.ongoingEvents} color="#ef4444" />
            <StatCard icon="✅" label="Completed" value={overall.totals.completedEvents} color="#10b981" />
            <StatCard icon="👥" label="Total Registrations" value={overall.participation.total} color="#8b5cf6" />
            <StatCard icon="🚪" label="Withdrawals" value={overall.participation.withdrawn} color="#ef4444" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <DonutChart data={overall.genderRatio} title="Gender Ratio" />
            <DonutChart data={overall.courseDistribution} title="Course Distribution" />
          </div>

          {overall.eventStats?.length > 0 && (
            <BarChart
              data={overall.eventStats.slice(0, 12)}
              labelKey="title" valueKey="registered"
              title="Registrations per Event"
              maxHeight={200}
            />
          )}
        </div>
      )}

      {/* ── EVENT-WISE ── */}
      {activeTab === "event" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <select
            value={selectedEventId}
            onChange={e => loadEventAnalytics(e.target.value)}
            style={{
              padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb",
              fontSize: 13, maxWidth: 400, outline: "none",
            }}
          >
            <option value="">Select an event…</option>
            {events.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
          </select>

          {eventAnalytics && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                <StatCard icon="👥" label="Registered" value={eventAnalytics.summary.participantCount} color="#6366f1" />
                <StatCard icon="🚪" label="Withdrawn" value={eventAnalytics.summary.withdrawnCount} color="#ef4444" />
                <StatCard icon="👨‍💼" label="Coordinators" value={eventAnalytics.summary.coordinatorCount} color="#f59e0b" />
                <StatCard icon="🏆" label="Winners" value={eventAnalytics.summary.winnerCount} color="#10b981" />
                <StatCard icon="📜" label="Participation Certs" value={eventAnalytics.summary.participationCertificates} color="#8b5cf6" />
                <StatCard icon="🎖️" label="Achievement Certs" value={eventAnalytics.summary.achievementCertificates} color="#ec4899" />
              </div>

              {/* Gender breakdown of registrations */}
              {eventAnalytics.details?.registrations && (() => {
                const genders = { male: 0, female: 0, other: 0 };
                eventAnalytics.details.registrations.filter(r => r.status === "registered").forEach(r => {
                  const g = r.user?.gender || "other";
                  genders[g] = (genders[g] || 0) + 1;
                });
                return <DonutChart data={genders} title="Participant Gender Ratio" />;
              })()}
            </div>
          )}
        </div>
      )}

      {/* ── COORDINATOR-WISE ── */}
      {activeTab === "coordinator" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <select
            value={selectedCoordId}
            onChange={e => loadCoordAnalytics(e.target.value)}
            style={{
              padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb",
              fontSize: 13, maxWidth: 400, outline: "none",
            }}
          >
            <option value="">Select a coordinator…</option>
            {coordinators.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>

          {coordAnalytics && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Card style={{ display: "flex", alignItems: "center", gap: 16, padding: 20 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 18, flexShrink: 0,
                }}>{coordAnalytics.coordinator?.name?.charAt(0)?.toUpperCase()}</div>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#111827" }}>{coordAnalytics.coordinator?.name}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>{coordAnalytics.coordinator?.email}</div>
                </div>
              </Card>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                <StatCard icon="📅" label="Events Managed" value={coordAnalytics.totalEvents} color="#6366f1" />
                <StatCard icon="👥" label="Total Registered" value={coordAnalytics.totalRegistered} color="#10b981" />
                <StatCard icon="🚪" label="Total Withdrawn" value={coordAnalytics.totalWithdrawn} color="#ef4444" />
              </div>

              {coordAnalytics.eventBreakdown?.length > 0 && (
                <BarChart
                  data={coordAnalytics.eventBreakdown}
                  labelKey="title" valueKey="registered"
                  title="Registrations per Managed Event"
                  maxHeight={180}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
