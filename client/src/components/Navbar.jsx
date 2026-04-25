import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AD';

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">Dashboard</h1>
      </div>
      <div className="navbar-right">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search events, coordinators..."
          />
        </div>
        <div className="navbar-notifications">
          <button className="notif-btn" title="Notifications">
            🔔
            <span className="notif-badge">3</span>
          </button>
        </div>
        <div className="admin-avatar-group">
          <div className="admin-avatar">{initials}</div>
          <div className="admin-text">
            <p className="admin-name">{user?.name || 'Admin User'}</p>
            <p className="admin-tag">{user?.role === 'admin' ? 'Super Admin' : user?.role || 'Admin'}</p>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
