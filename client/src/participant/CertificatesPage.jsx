import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as participantService from "../services/participantService";



const typeStyles = {
  Winner:        "bg-gray-900 text-white",
  Participation: "bg-gray-100 text-gray-600 border border-gray-300",
  Completion:    "bg-gray-200 text-gray-700",
};

const CertCard = ({ cert }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-gray-300 transition-all flex flex-col gap-4">
    {/* Certificate Preview */}
    <div className="w-full h-32 bg-gray-50 border border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 border-dashed">
      <span className="text-3xl">🎓</span>
      <p className="text-xs text-gray-400 font-medium">Certificate of {cert.type}</p>
    </div>
    <div>
      <h3 className="text-sm font-bold text-gray-900">{cert.event}</h3>
      <div className="flex items-center gap-2 mt-1.5">
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${typeStyles[cert.type]}`}>{cert.type}</span>
        <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">{cert.category}</span>
      </div>
      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><span>📅</span>{cert.date}</p>
    </div>
    {cert.url ? (
      <a href={`http://localhost:5000/api${cert.url}`} target="_blank" rel="noreferrer" className="w-full py-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-xl transition-all flex items-center justify-center gap-2">
        <span>⬇️</span> Download PDF
      </a>
    ) : (
      <button className="w-full py-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-xl transition-all flex items-center justify-center gap-2">
        <span>⬇️</span> Download PDF
      </button>
    )}
  </div>
);

const CertificatesPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const types = ["All", "Winner", "Participation", "Completion"];

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const certs = await participantService.getMyCertificates();
        setCertificates((certs || []).map((c) => ({
          id: c._id, 
          event: c.event?.title || 'Event',
          date: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A',
          type: c.type === 'achievement' ? 'Winner' : 'Participation',
          category: c.event?.participationType || 'Event',
          url: c.url
        })));
      } catch (err) {
        console.error('Failed to load certificates:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  const filtered = filter === "All" ? certificates : certificates.filter(c => c.type === filter);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-800">⚡</span>
          <span className="text-base font-bold text-gray-900 tracking-tight">
            Smart<span className="text-gray-500">Event</span>
          </span>
        </div>
        <button
          onClick={() => navigate("/participant-dashboard")}
          className="text-xs font-semibold text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-all bg-gray-50 hover:bg-gray-100"
        >
          ← Dashboard
        </button>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">My Certificates</h1>
          <p className="text-sm text-gray-400 mt-1">All your earned certificates in one place.</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total",    value: certificates.length, icon: "📜" },
            { label: "Winner",   value: certificates.filter(c => c.type === "Winner").length, icon: "🏆" },
            { label: "Completion", value: certificates.filter(c => c.type === "Completion").length, icon: "✅" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div>
                <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                filter === t
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Certificate Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(cert => <CertCard key={cert.id} cert={cert} />)}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
              No certificates in this category yet.
            </div>
          )}
        </div>

        <div className="text-center pt-4 pb-2 border-t border-gray-100">
          <p className="text-xs text-gray-400">© 2025 SmartEvent Platform · Participant Portal</p>
        </div>
      </main>
    </div>
  );
};

export default CertificatesPage;
