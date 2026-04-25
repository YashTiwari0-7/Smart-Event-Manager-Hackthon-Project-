import React from "react";

const features = [
  {
    icon: "📊",
    title: "Real-Time Analytics Dashboard",
    desc: "Monitor registrations, attendance, and engagement live. Get instant insights with charts and KPI cards.",
    color: "bg-blue-50 text-blue-600 border-blue-100",
  },
  {
    icon: "🚫",
    title: "Duplicate Registration Prevention",
    desc: "Smart validation blocks the same participant from registering twice — protecting data integrity automatically.",
    color: "bg-red-50 text-red-500 border-red-100",
  },
  {
    icon: "📜",
    title: "Certificate Generation",
    desc: "Auto-generate personalized participation certificates once events conclude — no manual work required.",
    color: "bg-amber-50 text-amber-600 border-amber-100",
  },
  {
    icon: "👫",
    title: "Team & Individual Participation",
    desc: "Events can be configured for solo registration, team-based entry, or both — fully flexible per event.",
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  {
    icon: "⚙️",
    title: "Custom Event Settings",
    desc: "Coordinators can set capacity limits, registration deadlines, eligibility rules, and more per event.",
    color: "bg-violet-50 text-violet-600 border-violet-100",
  },
];

const FeaturesSection = () => (
  <section className="py-20 bg-white" id="features">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-14">
        <span className="inline-block bg-primary-100 text-primary-700 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
          Features
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Powerful Features Built In
        </h2>
        <p className="text-slate-500 mt-4 max-w-xl mx-auto text-base">
          Everything your event team needs — available from day one, no plugins required.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <div
            key={f.title}
            className="group bg-white border border-slate-200 rounded-2xl p-7 hover:shadow-lg hover:border-primary-300 hover:-translate-y-1 transition-all"
          >
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-xl mb-5 ${f.color}`}>
              {f.icon}
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}


      </div>
    </div>
  </section>
);

export default FeaturesSection;
