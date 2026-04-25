import React from "react";
import { useNavigate } from "react-router-dom";

const FinalCTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-primary-600 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-primary-500 opacity-50 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-400 opacity-30 blur-3xl"></div>

      <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 tracking-tight">
          Start Managing Events Smarter
        </h2>
        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
          Join hundreds of colleges streamlining their event operations with SmartEvent. Free to get started.
        </p>
        <button
          onClick={() => navigate("/admin-dashboard")}
          className="bg-white text-primary-700 hover:bg-blue-50 font-bold px-8 py-4 rounded-xl text-lg shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1"
        >
          Create Your First Event
        </button>
      </div>
    </section>
  );
};

export default FinalCTASection;
