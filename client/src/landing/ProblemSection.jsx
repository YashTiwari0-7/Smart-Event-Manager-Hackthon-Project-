import React from "react";

const problems = [
  {
    icon: "📋",
    title: "Manual Data Handling",
    desc: "Teams waste hours copying registrations across Google Sheets, emails, and WhatsApp groups — prone to errors and data loss.",
  },
  {
    icon: "🔁",
    title: "Duplicate Registrations",
    desc: "Without validation, the same student registers multiple times, inflating numbers and causing confusion at check-in.",
  },
  {
    icon: "🗂️",
    title: "No Centralized System",
    desc: "Event info is scattered across 5 different tools. Coordinators, admins, and participants have no single source of truth.",
  },
  {
    icon: "📉",
    title: "Poor Analytics Visibility",
    desc: "After the event, you have no idea what worked. No turnout stats, no engagement data, no way to improve next time.",
  },
];

const ProblemSection = () => (
  <section className="py-20 bg-slate-900" id="problem">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-14">
        <span className="inline-block bg-red-500/10 text-red-400 text-xs font-bold px-3 py-1 rounded-full mb-4 border border-red-500/20 uppercase tracking-wider">
          The Problem
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Why Event Management is Broken
        </h2>
        <p className="text-slate-400 mt-4 max-w-xl mx-auto text-base">
          College event teams deal with the same frustrations every semester. It doesn't have to be this way.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {problems.map((p) => (
          <div
            key={p.title}
            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-red-500/40 hover:shadow-lg transition-all"
          >
            <div className="text-3xl mb-4">{p.icon}</div>
            <h3 className="text-base font-bold text-white mb-2">{p.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ProblemSection;
