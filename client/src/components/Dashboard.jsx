import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as adminService from "../services/adminService";
import KPISection from "./KPISection";
import EventCard from "./EventCard";
import CoordinatorCard from "./CoordinatorCard";
import RequestItem from "./RequestItem";
import AnalyticsCharts from "./AnalyticsCharts";
import "./Dashboard.css";

const SectionHeader = ({ title, btnLabel, onBtnClick }) => (
  <div className="section-header">
    <h2 className="section-title">{title}</h2>
    {btnLabel && <button className="section-btn" onClick={onBtnClick}>{btnLabel}</button>}
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [eventsData, pendingData] = await Promise.all([
          adminService.getAllEvents(),
          adminService.getPendingCoordinators()
        ]);
        setEvents(eventsData || []);
        setPendingRequests(pendingData || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Derive KPI stats from real data
  const kpiStats = [
    {
      id: 1,
      label: "Total Events",
      value: events.length,
      change: `${events.filter(e => e.status === 'upcoming').length} upcoming`,
      icon: "📅",
      color: "#6366f1"
    },
    {
      id: 2,
      label: "Active Events",
      value: events.filter(e => e.status === 'ongoing').length,
      change: "Currently running",
      icon: "🔥",
      color: "#f59e0b"
    },
    {
      id: 3,
      label: "Total Participants",
      value: events.reduce((sum, e) => sum + (e.participants?.length || 0), 0),
      change: "Across all events",
      icon: "👥",
      color: "#10b981"
    },
    {
      id: 4,
      label: "Pending Requests",
      value: pendingRequests.length,
      change: "Awaiting approval",
      icon: "📋",
      color: "#ef4444"
    }
  ];

  // Get coordinators from events
  const coordinatorSet = new Map();
  events.forEach(e => {
    if (e.coordinators) {
      e.coordinators.forEach(c => {
        if (c && c._id) {
          if (!coordinatorSet.has(c._id)) {
            coordinatorSet.set(c._id, {
              id: c._id,
              name: c.name || 'Unknown',
              email: c.email || '',
              events: 1,
              rating: 4.5
            });
          } else {
            coordinatorSet.get(c._id).events += 1;
          }
        }
      });
    }
  });
  const coordinators = Array.from(coordinatorSet.values()).slice(0, 5);

  if (loading) {
    return (
      <div className="dashboard" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTop: '4px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }}></div>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      {/* ── Top CTA bar ─────────────────────────────── */}
      <div className="dashboard-cta-bar">
        <div>
          <h2 className="cta-greeting">Welcome back, {user?.name || 'Admin'} 👋</h2>
          <p className="cta-sub">Here's what's happening with your events today.</p>
        </div>
        <button className="btn-create-event" onClick={() => navigate('/admin-events')}>+ Create Event</button>
      </div>

      {/* ── KPI Cards ───────────────────────────────── */}
      <KPISection stats={kpiStats} />

      {/* ── Upcoming Events ───────────────────────────── */}
      <section className="dashboard-section">
        <SectionHeader title="Upcoming Events" btnLabel="See All Events →" onBtnClick={() => navigate('/admin-events')} />
        <div className="events-grid">
          {events.filter(e => e.status === 'upcoming').length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: '14px', padding: '20px' }}>No upcoming events at the moment.</p>
          ) : (
            events.filter(e => e.status === 'upcoming').slice(0, 6).map((event) => (
              <EventCard key={event._id} event={{
                id: event._id,
                name: event.title,
                category: event.participationType === 'team' ? 'Team Event' : 'Individual',
                rating: 0,
                status: 'Upcoming',
                date: event.eventDate ? new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'TBD',
                participants: event.participants?.length || 0,
                coordinators: event.coordinators?.length || 0
              }} />
            ))
          )}
        </div>
      </section>

      {/* ── Coordinators + Requests (2-col) ─────────── */}
      <div className="two-col-grid">
        <section className="dashboard-section">
          <SectionHeader title="Active Coordinators" btnLabel="View All →" onBtnClick={() => navigate('/admin-coordinators')} />
          <div className="coord-list">
            {coordinators.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '14px', padding: '20px' }}>No coordinators assigned yet.</p>
            ) : (
              coordinators.map((c) => (
                <CoordinatorCard key={c.id} coordinator={c} />
              ))
            )}
          </div>
        </section>

        <section className="dashboard-section">
          <SectionHeader title="Pending Requests" btnLabel="Manage Requests →" onBtnClick={() => navigate('/admin-coordinators')} />
          <div className="requests-list">
            {pendingRequests.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '14px', padding: '20px' }}>No pending requests.</p>
            ) : (
              pendingRequests.map((r) => (
                <RequestItem key={r._id} request={{
                  id: r._id,
                  name: r.name,
                  email: r.email,
                  role: 'Coordinator',
                  type: 'Coordinator Approval',
                  date: new Date(r.createdAt).toLocaleDateString()
                }} />
              ))
            )}
          </div>
        </section>
      </div>

      {/* ── Analytics Charts ────────────────────────── */}
      <section className="dashboard-section">
        <SectionHeader title="Analytics Snapshot" btnLabel="View Global Analytics →" onBtnClick={() => navigate('/admin-analytics')} />
        <AnalyticsCharts />
      </section>
    </div>
  );
};

export default Dashboard;
