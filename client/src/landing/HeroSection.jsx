import React from "react";
import { useNavigate } from "react-router-dom";

/* ── Mock mini-dashboard preview ─────────────────────────── */
const MiniStatCard = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex items-center gap-3">
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      <p className="text-base font-bold text-slate-900 leading-tight">{value}</p>
    </div>
  </div>
);

const MiniBar = ({ label, value, max, color }) => (
  <div className="flex items-center gap-2">
    <span className="text-xs text-slate-500 w-20 truncate">{label}</span>
    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-2 rounded-full ${color}`}
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
    <span className="text-xs font-semibold text-slate-700 w-10 text-right">{value}</span>
  </div>
);

const DashboardMockup = () => (
  <div className="bg-slate-50 rounded-2xl p-4 shadow-2xl border border-slate-200 w-full select-none">
    {/* Topbar */}
    <div className="flex items-center justify-between mb-4 bg-white rounded-xl px-4 py-2 border border-slate-100">
      <span className="text-sm font-bold text-slate-800">📊 Dashboard</span>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">A</div>
        <span className="text-xs text-slate-500 hidden sm:block">Admin</span>
      </div>
    </div>

    {/* Stats row */}
    <div className="grid grid-cols-2 gap-2 mb-3">
      <MiniStatCard label="Total Events" value="124" icon="📅" color="bg-blue-50 text-blue-600" />
      <MiniStatCard label="Live Now"     value="8"   icon="🔴" color="bg-green-50 text-green-600" />
      <MiniStatCard label="Participants" value="18.5K" icon="👥" color="bg-purple-50 text-purple-600" />
      <MiniStatCard label="Coordinators" value="36"  icon="👤" color="bg-amber-50 text-amber-600" />
    </div>

    {/* Bar chart section */}
    <div className="bg-white rounded-xl p-3 border border-slate-100 mb-3">
      <p className="text-xs font-semibold text-slate-700 mb-3">Participants per Event</p>
      <div className="flex flex-col gap-2">
        <MiniBar label="TechSummit"  value={1240} max={1400} color="bg-blue-500" />
        <MiniBar label="AI Workshop" value={560}  max={1400} color="bg-violet-500" />
        <MiniBar label="Pitch Night" value={870}  max={1400} color="bg-emerald-500" />
        <MiniBar label="Leadership"  value={320}  max={1400} color="bg-amber-400" />
      </div>
    </div>

    {/* Mini table */}
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
      <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-700">Recent Events</p>
        <span className="text-xs text-primary-600 font-medium">View all →</span>
      </div>
      {[
        { name: "TechSummit 2025",    status: "Live",   participants: "1,240" },
        { name: "Design Masterclass", status: "Live",   participants: "430" },
        { name: "AI & ML Workshop",   status: "Closed", participants: "560" },
      ].map((row) => (
        <div key={row.name} className="flex items-center justify-between px-3 py-2 border-b border-slate-50 last:border-0">
          <span className="text-xs text-slate-700 font-medium truncate max-w-[120px]">{row.name}</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            row.status === "Live"
              ? "bg-green-100 text-green-700"
              : "bg-slate-100 text-slate-500"
          }`}>{row.status}</span>
          <span className="text-xs text-slate-500">{row.participants}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ── Hero Section ────────────────────────────────────────── */
const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="pt-28 pb-20 bg-gradient-to-br from-primary-700 via-primary-600 to-blue-500 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left — Copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-white/20">
              🎉 Built for College Event Teams
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight mb-5">
              Manage College Events{" "}
              <span className="text-blue-200">Without the Chaos</span>
            </h1>
            <p className="text-lg text-blue-100 leading-relaxed mb-8 max-w-lg">
              Handle registrations, coordinators, and analytics — all in one place.
              Stop juggling spreadsheets and start running events that actually work.
            </p>


            {/* Trust indicators */}
            <div className="mt-10 flex flex-wrap items-center gap-6">
              {["500+ Events Managed", "10K+ Participants", "Zero Duplicates"].map((badge) => (
                <div key={badge} className="flex items-center gap-1.5 text-blue-100 text-sm font-medium">
                  <span className="text-green-300 text-base">✓</span> {badge}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Dashboard Mockup */}
          <div className="lg:pl-6">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
