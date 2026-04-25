import React from "react";

/* ── Mini Components ─────────────────────────── */
const StatCard = ({ icon, label, value, change, color }) => (
  <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${color}`}>{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-slate-500 font-medium truncate">{label}</p>
      <p className="text-lg font-bold text-slate-900 leading-tight">{value}</p>
    </div>
    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">{change}</span>
  </div>
);

const BarRow = ({ label, value, max, color, pct }) => (
  <div className="flex items-center gap-3">
    <span className="text-xs text-slate-500 w-24 truncate shrink-0">{label}</span>
    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
    <span className="text-xs font-semibold text-slate-700 w-12 text-right shrink-0">{value}</span>
  </div>
);

const statusStyle = {
  Live: "bg-emerald-100 text-emerald-700",
  Upcoming: "bg-blue-100 text-blue-600",
  Closed: "bg-slate-100 text-slate-500",
};

/* ── Dashboard Preview Section ──────────────── */
const DashboardPreviewSection = () => {
  const events = [
    { name: "TechSummit 2025", status: "Live", participants: "1,240", coordinator: "Arjun M." },
    { name: "Design Masterclass", status: "Live", participants: "430", coordinator: "Priya S." },
    { name: "AI & ML Workshop", status: "Closed", participants: "560", coordinator: "Karan T." },
    { name: "Leadership Summit", status: "Upcoming", participants: "320", coordinator: "Neha R." },
  ];

  return (
    <section className="py-24 bg-slate-50" id="preview">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-14">
          <span className="inline-block bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            Dashboard Preview
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Everything at a Glance
          </h2>
          <p className="text-slate-500 mt-4 max-w-xl mx-auto text-base">
            A real-time command center for your events — monitor registrations, live events, coordinators and analytics in one view.
          </p>
        </div>

        {/* Mock Dashboard Shell */}
        <div className="bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-700">
          {/* Titlebar */}
          <div className="flex items-center gap-2 px-5 py-3 bg-slate-900 border-b border-slate-700">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="ml-4 text-xs text-slate-400 font-mono">smartevent.admin/dashboard</span>
          </div>

          <div className="flex">
            {/* Sidebar strip */}
            <div className="hidden sm:flex w-14 bg-slate-900 border-r border-slate-700 flex-col items-center py-6 gap-5">
              {["📊", "📅", "👥", "⚙️", "🔔"].map((ic, i) => (
                <div key={i} className={`w-9 h-9 rounded-lg flex items-center justify-center text-base cursor-pointer transition-all ${i === 0 ? "bg-primary-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-700"}`}>
                  {ic}
                </div>
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 p-5 sm:p-6 space-y-5 bg-slate-50">
              {/* Top bar */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Master Admin Dashboard</h3>
                  <p className="text-xs text-slate-500">Friday, 25 April 2025</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold shadow">A</div>
                  <span className="text-xs text-slate-600 font-medium hidden sm:block">Admin</span>
                </div>
              </div>

              {/* KPI Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard icon="📅" label="Total Events" value="124" change="+12%" color="bg-blue-50 text-blue-600" />
                <StatCard icon="🔴" label="Live Now" value="8" change="+3" color="bg-emerald-50 text-emerald-600" />
                <StatCard icon="👥" label="Participants" value="18.5K" change="+8%" color="bg-purple-50 text-purple-600" />
                <StatCard icon="👤" label="Coordinators" value="36" change="+4" color="bg-amber-50 text-amber-600" />
              </div>

              {/* Charts + Table Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Bar Chart */}
                <div className="lg:col-span-1 bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                  <p className="text-sm font-bold text-slate-800 mb-4">Participants per Event</p>
                  <div className="flex flex-col gap-3">
                    <BarRow label="TechSummit" value="1,240" pct={89} color="bg-primary-500" />
                    <BarRow label="AI Workshop" value="560" pct={40} color="bg-violet-500" />
                    <BarRow label="Pitch Night" value="870" pct={63} color="bg-emerald-500" />
                    <BarRow label="Leadership" value="320" pct={23} color="bg-amber-400" />
                    <BarRow label="Design Class" value="430" pct={31} color="bg-pink-400" />
                  </div>
                </div>

                {/* Donut-style visual + table */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-800">Recent Events</p>
                    <span className="text-xs text-primary-600 font-semibold cursor-pointer hover:underline">View all →</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                          <th className="text-xs font-semibold text-slate-500 px-4 py-2">Event</th>
                          <th className="text-xs font-semibold text-slate-500 px-4 py-2">Coordinator</th>
                          <th className="text-xs font-semibold text-slate-500 px-4 py-2">Status</th>
                          <th className="text-xs font-semibold text-slate-500 px-4 py-2 text-right">Participants</th>
                        </tr>
                      </thead>
                      <tbody>
                        {events.map((ev, i) => (
                          <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-2.5 text-sm font-semibold text-slate-800">{ev.name}</td>
                            <td className="px-4 py-2.5 text-xs text-slate-500">{ev.coordinator}</td>
                            <td className="px-4 py-2.5">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusStyle[ev.status]}`}>
                                {ev.status}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-sm text-right font-bold text-slate-700">{ev.participants}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA below preview */}
        <div className="text-center mt-10">
          <p className="text-slate-500 text-sm mb-4">This is exactly what you'll see when you log in as an admin.</p>
          <a
            href="/admin-dashboard"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm"
          >
            Open Live Dashboard →
          </a>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreviewSection;
