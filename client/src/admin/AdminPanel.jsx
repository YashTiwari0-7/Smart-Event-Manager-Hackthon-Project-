import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminHome from "./AdminHome";
import AdminEvents from "./AdminEvents";
import AdminCoordinators from "./AdminCoordinators";
import AdminAnalytics from "./AdminAnalytics";

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "events", label: "Events", icon: "📅" },
  { id: "coordinators", label: "Coordinators", icon: "👥" },
  { id: "analytics", label: "Analytics", icon: "📊" },
];

export default function AdminPanel() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };

  const renderContent = () => {
    switch (activeSection) {
      case "home": return <AdminHome onNavigate={setActiveSection} />;
      case "events": return <AdminEvents />;
      case "coordinators": return <AdminCoordinators />;
      case "analytics": return <AdminAnalytics />;
      default: return <AdminHome onNavigate={setActiveSection} />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8f9fb", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? 240 : 64,
          background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
          color: "#fff",
          transition: "width 0.25s cubic-bezier(.4,0,.2,1)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
          overflow: "hidden",
        }}
      >
        {/* Brand */}
        <div style={{
          padding: sidebarOpen ? "24px 20px 20px" : "24px 12px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          minHeight: 72,
        }}>
          <span style={{ fontSize: 24 }}>⚡</span>
          {sidebarOpen && (
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.3px", lineHeight: 1.1 }}>Smart Event</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "1.5px", textTransform: "uppercase" }}>Admin Panel</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV_ITEMS.map(item => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: sidebarOpen ? "12px 16px" : "12px 0",
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
                  background: isActive ? "rgba(99,102,241,0.25)" : "transparent",
                  transition: "all 0.15s",
                  width: "100%",
                  textAlign: "left",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        {sidebarOpen && (
          <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
            © 2026 SmartEvent
          </div>
        )}
      </aside>

      {/* Main */}
      <div style={{ flex: 1, marginLeft: sidebarOpen ? 240 : 64, transition: "margin-left 0.25s cubic-bezier(.4,0,.2,1)", display: "flex", flexDirection: "column" }}>
        {/* Navbar */}
        <header style={{
          height: 64,
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 40,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "none", border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer", padding: "8px 10px",
              fontSize: 18, color: "#374151", display: "flex", alignItems: "center",
            }}
          >
            ☰
          </button>

          <div style={{ position: "relative" }}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              style={{
                display: "flex", alignItems: "center", gap: 10, background: "#f3f4f6", border: "1px solid #e5e7eb",
                borderRadius: 10, padding: "6px 14px 6px 8px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#1f2937",
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13,
              }}>
                {(user?.name || "A").charAt(0).toUpperCase()}
              </div>
              <span>{user?.name || "Admin"}</span>
              <span style={{ fontSize: 10, color: "#9ca3af" }}>▼</span>
            </button>

            {profileOpen && (
              <div style={{
                position: "absolute", right: 0, top: 48, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
                boxShadow: "0 10px 40px rgba(0,0,0,0.12)", padding: 8, minWidth: 180, zIndex: 60,
              }}>
                <div style={{ padding: "10px 14px", fontSize: 12, color: "#6b7280", borderBottom: "1px solid #f3f4f6" }}>
                  {user?.email || "admin@example.com"}
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%", padding: "10px 14px", background: "none", border: "none", borderRadius: 8,
                    textAlign: "left", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#ef4444",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: 24, maxWidth: 1400, width: "100%", margin: "0 auto" }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
