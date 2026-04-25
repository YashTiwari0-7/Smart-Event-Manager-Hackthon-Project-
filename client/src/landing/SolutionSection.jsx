import React from "react";

const roles = [
  {
    icon: "🛡️",
    role: "Master Admin",
    color: "border-primary-500 bg-primary-50",
    badgeColor: "bg-primary-100 text-primary-700",
    features: [
      "Create and manage all events",
      "Assign event coordinators",
      "View platform-wide analytics",
      "Approve coordinator requests",
      "Configure global settings",
    ],
  },
  {
    icon: "🎯",
    role: "Event Coordinators",
    color: "border-violet-500 bg-violet-50",
    badgeColor: "bg-violet-100 text-violet-700",
    features: [
      "Configure event-specific rules",
      "Manage participant lists",
      "Track live registrations",
      "Handle team/solo event settings",
      "Export participant data",
    ],
  },
  {
    icon: "🎓",
    role: "Participants",
    color: "border-emerald-500 bg-emerald-50",
    badgeColor: "bg-emerald-100 text-emerald-700",
    features: [
      "Browse and register for events",
      "Join as individual or team",
      "View registration status",
      "Leave events before deadline",
      "Download participation certificates",
    ],
  },
];

const SolutionSection = () => (
  <section className="py-20 bg-[#F8FAFC]" id="roles">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-14">
        <span className="inline-block bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
          The Solution
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          One Platform. Complete Control.
        </h2>
        <p className="text-slate-500 mt-4 max-w-xl mx-auto text-base">
          Designed for every stakeholder — from admin oversight to participant experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {roles.map((r) => (
          <div
            key={r.role}
            className={`rounded-2xl border-2 ${r.color} p-7 shadow-sm hover:shadow-md transition-all hover:-translate-y-1`}
          >
            <div className="text-4xl mb-4">{r.icon}</div>
            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-3 ${r.badgeColor}`}>
              {r.role}
            </span>
            <ul className="mt-3 space-y-3">
              {r.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-primary-500 mt-0.5 flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default SolutionSection;
