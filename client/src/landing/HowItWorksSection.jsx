import React from "react";

const steps = [
  {
    step: "1",
    title: "Create Event",
    desc: "Admin sets up the event profile and assigns coordinators.",
  },
  {
    step: "2",
    title: "Set Rules",
    desc: "Coordinators define team size, limits, and deadlines.",
  },
  {
    step: "3",
    title: "Participants Register",
    desc: "Students sign up seamlessly via the portal.",
  },
  {
    step: "4",
    title: "Track & Analyze",
    desc: "Monitor live progress and auto-generate certificates.",
  },
];

const HowItWorksSection = () => (
  <section className="py-20 bg-slate-50 border-t border-slate-200" id="how-it-works">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Get Started in Minutes
        </h2>
        <p className="text-slate-500 mt-4 max-w-xl mx-auto text-base">
          A seamless workflow from event creation to conclusion.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
        {/* Connecting line for desktop */}
        <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-0.5 bg-blue-100 z-0"></div>

        {steps.map((s, idx) => (
          <div key={s.step} className="relative z-10 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4 shadow-md ring-4 ring-slate-50">
              {s.step}
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">{s.title}</h3>
            <p className="text-sm text-slate-500 max-w-[200px] leading-relaxed">
              {s.desc}
            </p>
            {idx < steps.length - 1 && (
              <div className="md:hidden mt-6 text-slate-300">↓</div>
            )}
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
