import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ParticipantHome from "./ParticipantHome";
import ParticipantMyEvents from "./ParticipantMyEvents";
import ParticipantAchievements from "./ParticipantAchievements";
import ParticipantCertificates from "./ParticipantCertificates";

const NAV_ITEMS = [
  { id: "home",         label: "Home",         icon: "🏠" },
  { id: "my-events",   label: "My Events",    icon: "📅" },
  { id: "achievements",label: "Achievements", icon: "🏆" },
  { id: "certificates",label: "Certificates", icon: "📜" },
];

export default function ParticipantPanel() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [active, setActive]         = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };

  const renderContent = () => {
    switch (active) {
      case "home":         return <ParticipantHome onNavigate={setActive} />;
      case "my-events":   return <ParticipantMyEvents onBack={() => setActive("home")} />;
      case "achievements": return <ParticipantAchievements onBack={() => setActive("home")} />;
      case "certificates": return <ParticipantCertificates onBack={() => setActive("home")} />;
      default:             return <ParticipantHome onNavigate={setActive} />;
    }
  };

  const initials = (user?.name || "P").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const pageTitle = { home: "Dashboard", "my-events": "My Events", achievements: "Achievements", certificates: "Certificates" }[active] || "Dashboard";

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">

      {/* ── Sidebar ── */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 ease-in-out ${sidebarOpen ? "w-60" : "w-16"} overflow-hidden`}>

        {/* Brand */}
        <div className={`flex items-center gap-3 border-b border-white/[0.06] min-h-[72px] shrink-0 ${sidebarOpen ? "px-5 py-6" : "px-3 py-6 justify-center"}`}>
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-lg shrink-0">
            🎓
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-[15px] font-extrabold tracking-tight leading-none whitespace-nowrap">SMART Event</p>
              <p className="text-[10px] font-semibold text-white/30 uppercase tracking-[2px] mt-0.5">Participant</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 px-2 py-4">
          {NAV_ITEMS.map(item => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`group flex items-center gap-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  sidebarOpen ? "px-4 py-3" : "px-0 py-3 justify-center"
                } ${
                  isActive
                    ? "bg-white/[0.12] text-white shadow-sm shadow-black/10"
                    : "text-white/50 hover:bg-white/[0.06] hover:text-white/80"
                }`}
              >
                <span className={`text-lg transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-105"}`}>
                  {item.icon}
                </span>
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {sidebarOpen && (
          <div className="px-5 py-4 border-t border-white/[0.06] text-[11px] text-white/20 font-medium">
            © 2026 SmartEvent
          </div>
        )}
      </aside>

      {/* ── Main wrapper ── */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? "ml-60" : "ml-16"}`}>

        {/* ── Top Navbar ── */}
        <header className="h-16 bg-white border-b border-gray-200/80 flex items-center justify-between px-5 sm:px-6 sticky top-0 z-40 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors text-lg"
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
            <div className="hidden md:block">
              <h2 className="text-sm font-bold text-gray-800 leading-tight">{pageTitle}</h2>
              <p className="text-[11px] text-gray-400 font-medium">Participant Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
              <span className="text-lg">🔔</span>
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-slate-800 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">0</span>
            </button>

            <div className="w-px h-8 bg-gray-200 hidden sm:block" />

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-3 py-1.5 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {initials}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.name || "Participant"}</p>
                  <p className="text-[10px] text-gray-400 font-medium">Participant</p>
                </div>
                <svg className="w-3 h-3 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-50" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-xl shadow-xl z-50 min-w-[200px] overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">{user?.name || "Participant"}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
                    </div>
                    <div className="p-1.5">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <span>🚪</span> Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
