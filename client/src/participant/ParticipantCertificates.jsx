import React, { useState, useEffect, useRef } from "react";
import { getMyCertificates } from "../services/participantService";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import CertificateTemplate from "../components/CertificateTemplate";

const TYPE_STYLE = {
  participation: { cls: "bg-indigo-50 text-indigo-600", icon: "📜", label: "Participation" },
  achievement:   { cls: "bg-amber-50 text-amber-600",   icon: "🏆", label: "Achievement"   },
};

export default function ParticipantCertificates({ onBack }) {
  const [certs,   setCerts]   = useState([]);
  const [filter,  setFilter]  = useState("all");
  const [loading, setLoading] = useState(true);
  const [activeCertData, setActiveCertData] = useState(null);
  const certTemplateRef = useRef(null);
  const { showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    getMyCertificates()
      .then(d => setCerts(d || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? certs : certs.filter(c => c.type === filter);

  const downloadCert = async (cert) => {
    try {
      const userName = user?.name || "Participant";
      const eventName = cert.event?.title || "Event";
      const date = cert.createdAt 
        ? new Date(cert.createdAt).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }) 
        : new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });

      setActiveCertData({
        type: cert.type,
        userName,
        eventName,
        date,
        rank: cert.rank || (cert.type === 'achievement' ? 'a top position' : null)
      });

      // Wait for the invisible template to render with the new data
      setTimeout(async () => {
        if (certTemplateRef.current) {
          showToast("Generating certificate PDF...", "success");
          await certTemplateRef.current.downloadPDF();
        }
      }, 500);
    } catch (e) {
      showToast("Failed to download certificate.", "error");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          {onBack && (
            <button onClick={onBack} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">← Back</button>
          )}
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">📜 My Certificates</h2>
          <span className="bg-indigo-50 text-indigo-600 font-bold text-xs px-3 py-1 rounded-full">{certs.length} total</span>
        </div>
        <div className="flex gap-1.5">
          {["all", "participation", "achievement"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize border transition-all duration-200 ${
              filter === f ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
            }`}>{f === "all" ? "All" : f}</button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200/80 p-4 flex items-center gap-3">
          <span className="text-2xl">📜</span>
          <div>
            <p className="text-xl font-extrabold text-gray-900">{certs.length}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Total</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200/80 p-4 flex items-center gap-3">
          <span className="text-2xl">📋</span>
          <div>
            <p className="text-xl font-extrabold text-gray-900">{certs.filter(c => c.type === "participation").length}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Participation</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200/80 p-4 flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="text-xl font-extrabold text-gray-900">{certs.filter(c => c.type === "achievement").length}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Achievement</p>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="w-9 h-9 border-[3px] border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-medium">Loading…</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl mx-auto mb-4">📜</div>
          <p className="text-base font-bold text-gray-700">No certificates yet</p>
          <p className="text-sm text-gray-400 mt-1">Certificates are generated after events complete. Participate and attend to earn yours!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((cert, i) => {
            const ts = TYPE_STYLE[cert.type] || TYPE_STYLE.participation;
            return (
              <div key={cert._id || i} className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex gap-4 items-start">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${ts.cls}`}>{ts.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-extrabold text-gray-900 truncate">{cert.event?.title || "Event"}</h3>
                  <span className={`inline-block mt-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${ts.cls}`}>{ts.label}</span>
                  {cert.rank && <span className="inline-block ml-2 mt-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">{cert.rank}</span>}
                  <p className="text-[11px] text-gray-400 mt-2">Issued: {cert.createdAt ? new Date(cert.createdAt).toLocaleDateString() : "—"}</p>
                  <button onClick={() => downloadCert(cert)} className="mt-3 w-full py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-bold transition-colors">
                    ⬇️ Download PDF
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invisible Certificate Template for PDF generation */}
      <CertificateTemplate ref={certTemplateRef} certData={activeCertData} />
    </div>
  );
}
