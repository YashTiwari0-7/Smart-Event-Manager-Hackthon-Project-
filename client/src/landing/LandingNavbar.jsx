import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LandingNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { label: "Home", href: "#" },
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Roles", href: "#roles" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary-600">⚡</span>
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              Smart<span className="text-primary-600">Event</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Register Dropdown */}
            <div className="relative group">
              <button className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors flex items-center gap-1 py-2">
                Register
                <span className="text-[10px] mt-0.5">▼</span>
              </button>
              <div className="absolute right-0 mt-0 w-36 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col py-1 overflow-hidden z-50">
                <Link to="/register/participant" className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary-600">Participants</Link>
                <Link to="/register/coordinator" className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary-600">Coordinator</Link>
              </div>
            </div>

            {/* Login Dropdown */}
            <div className="relative group">
              <button className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1">
                Login
                <span className="text-[10px] mt-0.5">▼</span>
              </button>
              {/* Added a subtle padding top wrapper to keep hover state active when moving mouse down to the menu */}
              <div className="absolute right-0 top-full pt-2">
                <div className="w-36 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col py-1 overflow-hidden z-50">
                  <Link to="/login/participant" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary-600">Participants</Link>
                  <Link to="/login/coordinator" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary-600">Coordinator</Link>
                  <button onClick={() => navigate("/login/admin")} className="text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary-600 w-full">Admin</button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-slate-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 pb-4 pt-2 max-h-[80vh] overflow-y-auto">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block py-2 text-sm font-medium text-slate-600 hover:text-primary-600"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold text-slate-400 mb-2 uppercase">Register</p>
            <Link to="/register/participant" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-slate-600 pl-2 hover:text-primary-600">Participants</Link>
            <Link to="/register/coordinator" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-slate-600 pl-2 hover:text-primary-600">Coordinator</Link>
          </div>

          <div className="mt-2 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold text-slate-400 mb-2 uppercase">Login</p>
            <Link to="/login/participant" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-slate-600 pl-2 hover:text-primary-600">Participants</Link>
            <Link to="/login/coordinator" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-slate-600 pl-2 hover:text-primary-600">Coordinator</Link>
            <button onClick={() => { navigate("/login/admin"); setMenuOpen(false); }} className="block w-full text-left py-2 text-sm font-medium text-slate-600 pl-2 hover:text-primary-600">Admin</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
