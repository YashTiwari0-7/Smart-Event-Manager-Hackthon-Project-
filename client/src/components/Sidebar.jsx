import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "🏠", path: "/admin-dashboard" },
  { id: "events", label: "Events", icon: "📅", path: "/admin-events" },
  { id: "coordinators", label: "Coordinators", icon: "👤", path: "/admin-coordinators" },
  { id: "requests", label: "Requests", icon: "📋", path: "/admin-coordinators" },
  { id: "analytics", label: "Analytics", icon: "📊", path: "/admin-analytics" },
];

const Sidebar = ({ activeNav }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AD';

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">⚡</span>
        <span className="logo-text">SmartEvent</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeNav === item.id ? "active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="admin-mini">
          <div className="admin-avatar-sm">{initials}</div>
          <div className="admin-info">
            <p className="admin-name-sm">{user?.name || 'Admin'}</p>
            <p className="admin-role">Super Admin</p>
          </div>
        </div>
        <button onClick={handleLogout} className="nav-item" style={{ marginTop: '8px', color: '#ef4444' }}>
          <span className="nav-icon">🚪</span>
          <span className="nav-label">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
