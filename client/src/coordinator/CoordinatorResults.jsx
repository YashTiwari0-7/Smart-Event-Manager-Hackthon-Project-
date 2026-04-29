import React, { useState, useEffect } from "react";
import { getEventParticipants, getEventTeams, saveResult, generateCertificates } from "../services/coordinatorService";
import { useToast } from "../context/ToastContext";
import ConfirmationModal from "../components/ConfirmationModal";

const POSITIONS = ["top3_1", "top3_2", "top3_3"];
const LABELS    = { top3_1: "🥇 1st Place", top3_2: "🥈 2nd Place", top3_3: "🥉 3rd Place" };

export default function CoordinatorResults({ event, onBack }) {
  const [items, setItems]               = useState([]); // participants or teams
  const [selections, setSelections]     = useState({ top3_1: "", top3_2: "", top3_3: "" });
  const { showToast } = useToast();
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [certGen,  setCertGen]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");
  const [finalized, setFinalized] = useState(event.resultsFinalized || false);
  const [certsGenerated, setCertsGenerated] = useState(false);
  const [certStats, setCertStats] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState({ show: false, action: null, title: "", message: "", type: "primary" });
  
  const isTeam = event.participationType === "team";

  useEffect(() => {
    const load = async () => {
      try {
        if (isTeam) {
          const teams = await getEventTeams(event._id);
          setItems(teams || []);
          if (event.results) {
            setSelections({
              top3_1: String(event.results.top3Teams?.[0]?._id || event.results.top3Teams?.[0] || ""),
              top3_2: String(event.results.top3Teams?.[1]?._id || event.results.top3Teams?.[1] || ""),
              top3_3: String(event.results.top3Teams?.[2]?._id || event.results.top3Teams?.[2] || ""),
            });
          }
        } else {
          const parts = await getEventParticipants(event._id);
          setItems((parts || []).map(p => p.user).filter(Boolean));
          if (event.results) {
            setSelections({
              top3_1: String(event.results.top3?.[0]?._id || event.results.top3?.[0] || ""),
              top3_2: String(event.results.top3?.[1]?._id || event.results.top3?.[1] || ""),
              top3_3: String(event.results.top3?.[2]?._id || event.results.top3?.[2] || ""),
            });
          }
        }
      } catch (e) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [event._id]);

  const set = (k, v) => setSelections(p => ({ ...p, [k]: v }));

  const getUsed = (exclude) => Object.entries(selections)
    .filter(([k]) => k !== exclude)
    .map(([, v]) => v)
    .filter(Boolean);

  const handleSave = async () => {
    setError(""); setSuccess("");
    const { top3_1, top3_2, top3_3 } = selections;
    if (!top3_1 || !top3_2 || !top3_3) {
      setError("All 3 positions must be filled."); return;
    }
    const all = [top3_1, top3_2, top3_3];
    if (new Set(all).size !== 3) { setError("No duplicate selections allowed."); return; }
    
    setSaving(true);
    try {
      await saveResult(event._id, { top3: [top3_1, top3_2, top3_3] });
      setFinalized(true);
      setSuccess("Results saved and finalized! You can now generate certificates.");
      showToast("Results finalized successfully.");
    } catch (e) { 
      setError(e.response?.data?.message || "Failed to save results."); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleGenerateCerts = () => {
    setConfirmConfig({
      show: true,
      title: "Generate Certificates?",
      message: "This will create Participation certificates for present participants and Achievement certificates for winners. Certificates will appear on the participants' dashboard. Proceed?",
      type: "primary",
      action: async () => {
        setCertGen(true);
        setError(""); setSuccess("");
        try {
          const res = await generateCertificates(event._id);
          const pCount = res.participationCertificates?.length || 0;
          const aCount = res.achievementCertificates?.length || 0;
          setCertStats({ participation: pCount, achievement: aCount });
          setCertsGenerated(true);
          setSuccess(`Certificates generated successfully!`);
          showToast(`${pCount} Participation + ${aCount} Achievement certificates sent to participants!`);
        } catch (e) { 
          setError(e.response?.data?.message || "Failed to generate certificates."); 
        } finally { 
          setCertGen(false); 
        }
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button onClick={onBack} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#374151" }}>← Back</button>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: 0 }}>Results — {event.title}</h2>
        {finalized && <span style={{ fontSize: 11, fontWeight: 700, background: "#ecfdf5", color: "#059669", padding: "4px 10px", borderRadius: 6 }}>✓ Finalized</span>}
      </div>

      {error   && <div style={{ padding: "12px 16px", background: "#fef2f2", color: "#dc2626", borderRadius: 10, fontSize: 13 }}>{error}</div>}
      {success && <div style={{ padding: "12px 16px", background: "#ecfdf5", color: "#059669", borderRadius: 10, fontSize: 13 }}>{success}</div>}

      {loading ? <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Loading…</div> : (
        <>
          {/* ── Step 1: Assign Positions ── */}
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 28, height: 28, borderRadius: "50%", background: finalized ? "#ecfdf5" : "#eef2ff", color: finalized ? "#059669" : "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>
                {finalized ? "✓" : "1"}
              </span>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "#111827", margin: 0 }}>Assign Positions ({isTeam ? "Teams" : "Participants"})</h3>
            </div>
            
            {POSITIONS.map(pos => (
              <div key={pos}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, display: "block" }}>{LABELS[pos]}</label>
                <select
                  disabled={finalized}
                  value={selections[pos]}
                  onChange={e => set(pos, e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 13, outline: "none", background: finalized ? "#f9fafb" : "#fff" }}
                >
                  <option value="">— Select {isTeam ? "team" : "participant"} —</option>
                  {items
                    .filter(item => !getUsed(pos).includes(String(item._id)))
                    .map(item => (
                      <option key={item._id} value={item._id}>
                        {item.name} {isTeam ? `(Leader: ${item.leader?.name || "TBD"})` : `(${item.email})`}
                      </option>
                    ))
                  }
                  {selections[pos] && !items.filter(item => !getUsed(pos).includes(String(item._id))).find(item => String(item._id) === selections[pos]) && (
                    <option value={selections[pos]}>
                      {items.find(item => String(item._id) === selections[pos])?.name || selections[pos]}
                    </option>
                  )}
                </select>
              </div>
            ))}

            {!finalized && (
              <button onClick={handleSave} disabled={saving} style={{ padding: "12px 24px", background: "#1e1b4b", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: saving ? 0.6 : 1, alignSelf: "flex-end" }}>
                {saving ? "Saving…" : "🏆 Finalize Results"}
              </button>
            )}
          </div>

          {/* ── Step 2: Generate Certificates (only after finalization) ── */}
          {finalized && (
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 28, height: 28, borderRadius: "50%", background: certsGenerated ? "#ecfdf5" : "#eef2ff", color: certsGenerated ? "#059669" : "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>
                  {certsGenerated ? "✓" : "2"}
                </span>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "#111827", margin: 0 }}>Generate Certificates</h3>
              </div>
              
              <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                Click below to generate and send certificates to all eligible participants.<br />
                <strong style={{ color: "#374151" }}>Participation Certificate</strong>: Marked present + Not a winner<br />
                <strong style={{ color: "#374151" }}>Achievement Certificate</strong>: Marked present + Won a position (Top 3)
              </p>

              {certStats && (
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1, background: "#eef2ff", borderRadius: 10, padding: "12px 16px", border: "1px solid #c7d2fe" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#4f46e5", textTransform: "uppercase" }}>Participation</p>
                    <p style={{ fontSize: 20, fontWeight: 800, color: "#3730a3" }}>{certStats.participation}</p>
                  </div>
                  <div style={{ flex: 1, background: "#fef3c7", borderRadius: 10, padding: "12px 16px", border: "1px solid #fde68a" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#d97706", textTransform: "uppercase" }}>Achievement</p>
                    <p style={{ fontSize: 20, fontWeight: 800, color: "#92400e" }}>{certStats.achievement}</p>
                  </div>
                </div>
              )}

              <button onClick={handleGenerateCerts} disabled={certGen} style={{ padding: "12px 24px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: certGen ? 0.6 : 1, alignSelf: "flex-start" }}>
                {certGen ? "Generating…" : certsGenerated ? "🔄 Regenerate Certificates" : "📜 Generate Certificates"}
              </button>
            </div>
          )}
        </>
      )}
      <ConfirmationModal
        isOpen={confirmConfig.show}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        onConfirm={() => {
          confirmConfig.action();
          setConfirmConfig({ ...confirmConfig, show: false });
        }}
        onCancel={() => setConfirmConfig({ ...confirmConfig, show: false })}
      />
    </div>
  );
}
