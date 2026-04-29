import React, { useState, useEffect } from "react";
import {
  getEventParticipants, getAttendance, markAttendance, endEvent
} from "../services/coordinatorService";
import { useToast } from "../context/ToastContext";
import ConfirmationModal from "../components/ConfirmationModal";

export default function CoordinatorAttendance({ event, onBack }) {
  const [participants, setParticipants] = useState([]);
  const [attendance,   setAttendance]   = useState({});
  const { showToast } = useToast();
  const [loading,  setLoading]   = useState(true);
  const [saving,   setSaving]    = useState(false);
  const [ending,   setEnding]    = useState(false);
  const [error,    setError]     = useState("");
  const [success,  setSuccess]   = useState("");
  const [confirmConfig, setConfirmConfig] = useState({ show: false, action: null, title: "", message: "", type: "primary" });

  useEffect(() => {
    const load = async () => {
      try {
        const [parts, att] = await Promise.all([
          getEventParticipants(event._id),
          getAttendance(event._id),
        ]);
        setParticipants(parts || []);
        const map = {};
        (att || []).forEach(a => { map[String(a.user?._id || a.user)] = a.attended; });
        setAttendance(map);
      } catch (e) { setError(e.response?.data?.message || "Failed to load."); }
      finally { setLoading(false); }
    };
    load();
  }, [event._id]);

  const toggle = (userId) => {
    setAttendance(p => ({ ...p, [userId]: !p[userId] }));
  };

  const markAll = (val) => {
    const map = {};
    participants.forEach(p => { map[String(p.user?._id)] = val; });
    setAttendance(map);
  };

  const handleSave = async () => {
    setError(""); setSuccess(""); setSaving(true);
    const presentIds = participants
      .filter(p => attendance[String(p.user?._id)])
      .map(p => String(p.user?._id));
    try {
      await markAttendance(event._id, presentIds);
      setSuccess(`Attendance saved — ${presentIds.length} present.`);
    } catch (e) { setError(e.response?.data?.message || "Failed to save."); }
    finally { setSaving(false); }
  };

  const handleEndEvent = () => {
    setConfirmConfig({
      show: true,
      title: "End Event?",
      message: "Are you sure you want to end this event? It will be marked as Completed and you can then assign results.",
      type: "warning",
      action: async () => {
        setEnding(true);
        try { await endEvent(event._id); showToast("Event completed!"); onBack(); }
        catch (e) { showToast(e.response?.data?.message || "Failed.", "error"); }
        finally { setEnding(false); }
      }
    });
  };

  const present = participants.filter(p => attendance[String(p.user?._id)]).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button onClick={onBack} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#374151" }}>← Back</button>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: 0 }}>Attendance — {event.title}</h2>
      </div>

      {error   && <div style={{ padding: "12px 16px", background: "#fef2f2", color: "#dc2626", borderRadius: 10, fontSize: 13 }}>{error}</div>}
      {success && <div style={{ padding: "12px 16px", background: "#ecfdf5", color: "#059669", borderRadius: 10, fontSize: 13 }}>{success}</div>}

      {/* Summary + Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 16 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#059669" }}>Present: {present}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#ef4444" }}>Absent: {participants.length - present}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#6b7280" }}>Total: {participants.length}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => markAll(true)}  style={{ padding: "8px 14px", background: "#ecfdf5", color: "#059669", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Mark All Present</button>
          <button onClick={() => markAll(false)} style={{ padding: "8px 14px", background: "#fef2f2", color: "#ef4444", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Mark All Absent</button>
        </div>
      </div>

      {/* List */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", display: "grid", gridTemplateColumns: "40px 2fr 2fr 1fr 100px", gap: 8, fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>
          <span>#</span><span>Name</span><span>Email</span><span>Gender</span><span>Status</span>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Loading…</div>
        ) : participants.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>No registered participants.</div>
        ) : participants.map((p, i) => {
          const uid     = String(p.user?._id);
          const present = !!attendance[uid];
          return (
            <div key={uid} style={{ display: "grid", gridTemplateColumns: "40px 2fr 2fr 1fr 100px", gap: 8, padding: "12px 20px", borderBottom: "1px solid #f3f4f6", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>{i + 1}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{p.user?.name}</span>
              <span style={{ fontSize: 12, color: "#6b7280" }}>{p.user?.email}</span>
              <span style={{ fontSize: 12, color: "#374151", textTransform: "capitalize" }}>{p.user?.gender || "—"}</span>
              <button onClick={() => toggle(uid)} style={{
                padding: "6px 12px", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 12, cursor: "pointer",
                background: present ? "#ecfdf5" : "#fef2f2",
                color: present ? "#059669" : "#ef4444",
              }}>{present ? "✓ Present" : "✗ Absent"}</button>
            </div>
          );
        })}
      </div>

      {/* Footer actions */}
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <button onClick={handleEndEvent} disabled={ending} style={{ padding: "12px 24px", background: "#1e1b4b", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: ending ? 0.6 : 1 }}>
          {ending ? "Ending…" : "🏁 End Event"}
        </button>
        <button onClick={handleSave} disabled={saving} style={{ padding: "12px 28px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
          {saving ? "Saving…" : "Save Attendance"}
        </button>
      </div>
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
