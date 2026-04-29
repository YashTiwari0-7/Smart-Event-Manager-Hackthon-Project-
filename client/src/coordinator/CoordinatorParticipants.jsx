import React, { useState, useEffect, useCallback } from "react";
import {
  getEventParticipants, endRegistration, startEvent, exportParticipationList,
  getAttendance, markAttendance, endEvent
} from "../services/coordinatorService";
import { useToast } from "../context/ToastContext";
import ConfirmationModal from "../components/ConfirmationModal";

export default function CoordinatorParticipants({ event: initialEvent, onBack, setView }) {
  const [event, setEvent] = useState(initialEvent);
  const [participants, setParticipants] = useState([]);
  const [presentIds, setPresentIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [actioning, setActioning] = useState("");
  const [confirmConfig, setConfirmConfig] = useState({ show: false, action: null, title: "", message: "", type: "primary" });

  const { showToast } = useToast();

  const status = (event.status || "").toUpperCase();
  const isOpen = status === "OPEN";
  const isClosed = status === "CLOSED";
  const isLive = status === "LIVE";
  const isCompleted = status === "COMPLETED";

  // Load participants + attendance data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const parts = await getEventParticipants(event._id);
      setParticipants(parts || []);

      if (isLive || isCompleted) {
        try {
          const att = await getAttendance(event._id);
          const present = new Set(
            (att || [])
              .filter(a => a.attended)
              .map(a => String(a.user?._id || a.user))
          );
          setPresentIds(present);
        } catch { /* no attendance yet */ }
      }
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load participants");
    } finally {
      setLoading(false);
    }
  }, [event._id, status]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Actions ──

  const handleEndReg = () => {
    setConfirmConfig({
      show: true,
      title: "End Registration?",
      message: "No new participants can register once closed. Are you sure?",
      type: "warning",
      action: async () => {
        setActioning("endreg");
        try {
          await endRegistration(event._id);
          setEvent(prev => ({ ...prev, status: "CLOSED" }));
          showToast("Registration closed successfully!");
        }
        catch (e) { showToast(e.response?.data?.message || "Failed to close registration.", "error"); }
        finally { setActioning(""); }
      }
    });
  };

  const handleStart = () => {
    setConfirmConfig({
      show: true,
      title: "Start Event?",
      message: "This will mark the event as LIVE and open attendance marking. Are you sure?",
      type: "primary",
      action: async () => {
        setActioning("start");
        try {
          await startEvent(event._id);
          setEvent(prev => ({ ...prev, status: "LIVE" }));
          showToast("Event started! You can now mark attendance.");
        }
        catch (e) { showToast(e.response?.data?.message || "Failed to start event.", "error"); }
        finally { setActioning(""); }
      }
    });
  };

  const handleEndEvent = () => {
    setConfirmConfig({
      show: true,
      title: "End Event?",
      message: "Are you sure you want to END the event? Attendance will be locked permanently.",
      type: "warning",
      action: async () => {
        setActioning("endevent");
        try {
          await endEvent(event._id);
          setEvent(prev => ({ ...prev, status: "COMPLETED" }));
          showToast("Event ended successfully! You can now assign results.");
        } catch (e) {
          showToast(e.response?.data?.message || "Failed to end event.", "error");
        } finally {
          setActioning("");
        }
      }
    });
  };

  const toggleAttendance = async (userId) => {
    if (!isLive) return;
    
    const newPresent = new Set(presentIds);
    if (newPresent.has(userId)) {
      newPresent.delete(userId);
    } else {
      newPresent.add(userId);
    }

    // Optimistic update
    const oldPresent = new Set(presentIds);
    setPresentIds(newPresent);
    setSaving(true);

    try {
      await markAttendance(event._id, Array.from(newPresent));
    } catch (e) {
      // Revert on failure
      setPresentIds(oldPresent);
      showToast(e.response?.data?.message || "Failed to update attendance", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const blob = await exportParticipationList(event._id, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${event.title}-participants.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Downloaded as ${format.toUpperCase()}`);
    } catch (e) { showToast("Export failed.", "error"); }
  };

  // ── Styles ──
  const btnBase = { padding: "10px 20px", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s" };

  const presentCount = participants.filter(p => presentIds.has(String(p.user?._id))).length;
  const absentCount = participants.length - presentCount;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Header Row ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#374151" }}>← Back</button>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: 0 }}>{event.title}</h2>
            <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0 0" }}>Event Lifecycle Control Panel</p>
          </div>
        </div>

        {/* Status Badge */}
        <span style={{
          padding: "6px 16px",
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 800,
          background: isOpen ? "#eef2ff" : isClosed ? "#fef3c7" : isLive ? "#ecfdf5" : "#f3f4f6",
          color: isOpen ? "#4f46e5" : isClosed ? "#d97706" : isLive ? "#059669" : "#6b7280",
          border: `1px solid ${isOpen ? "#c7d2fe" : isClosed ? "#fde68a" : isLive ? "#a7f3d0" : "#e5e7eb"}`
        }}>
          {status}
        </span>
      </div>

      {error && <div style={{ padding: "12px 16px", background: "#fef2f2", color: "#dc2626", borderRadius: 10, border: "1px solid #fecaca", fontSize: 13 }}>{error}</div>}

      {/* ── Action Buttons Row ── */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {isOpen && (
          <>
            <button disabled={actioning === "endreg"} onClick={handleEndReg} style={{ ...btnBase, background: "#fef3c7", color: "#d97706", border: "1px solid #fde68a" }}>
              {actioning === "endreg" ? "Closing…" : "🔒 End Registration"}
            </button>
            <button onClick={() => handleExport('csv')} style={{ ...btnBase, background: "#f3f4f6", color: "#4b5563", border: "1px solid #e5e7eb", fontSize: 12 }}>
              📄 Download CSV
            </button>
          </>
        )}
        {isClosed && (
          <>
            <button disabled={actioning === "start"} onClick={handleStart} style={{ ...btnBase, background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" }}>
              {actioning === "start" ? "Starting…" : "▶️ Start Event"}
            </button>
            <button onClick={() => handleExport('csv')} style={{ ...btnBase, background: "#f3f4f6", color: "#4b5563", border: "1px solid #e5e7eb", fontSize: 12 }}>
              📄 Download CSV
            </button>
            <button onClick={() => handleExport('pdf')} style={{ ...btnBase, background: "#f3f4f6", color: "#4b5563", border: "1px solid #e5e7eb", fontSize: 12 }}>
              📕 Download PDF
            </button>
          </>
        )}
        {isLive && (
          <>
            <button disabled={actioning === "endevent"} onClick={handleEndEvent} style={{ ...btnBase, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>
              {actioning === "endevent" ? "Ending…" : "⏹ End Event"}
            </button>
            {saving && <span style={{ fontSize: 12, color: "#6b7280" }}>Saving attendance…</span>}
          </>
        )}
        {isCompleted && (
          <button onClick={() => setView({ type: "results", event })} style={{ ...btnBase, background: "#f5f3ff", color: "#7c3aed", border: "1px solid #ddd6fe" }}>
            🏆 Manage Results & Certificates
          </button>
        )}
      </div>

      {/* ── Attendance Summary (LIVE / COMPLETED) ── */}
      {(isLive || isCompleted) && participants.length > 0 && (
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, background: "#ecfdf5", borderRadius: 12, padding: "12px 16px", border: "1px solid #a7f3d0" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#059669", textTransform: "uppercase" }}>Present</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: "#065f46" }}>{presentCount}</p>
          </div>
          <div style={{ flex: 1, background: "#fef2f2", borderRadius: 12, padding: "12px 16px", border: "1px solid #fecaca" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", textTransform: "uppercase" }}>Absent</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: "#991b1b" }}>{absentCount}</p>
          </div>
          <div style={{ flex: 1, background: "#eef2ff", borderRadius: 12, padding: "12px 16px", border: "1px solid #c7d2fe" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#4f46e5", textTransform: "uppercase" }}>Total</p>
            <p style={{ fontSize: 22, fontWeight: 800, color: "#3730a3" }}>{participants.length}</p>
          </div>
        </div>
      )}

      {/* ── Results Summary (COMPLETED only) ── */}
      {isCompleted && event.resultsFinalized && event.results && (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "16px 20px" }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: "#111827", margin: "0 0 12px 0" }}>🏆 Results Summary</h3>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { label: "🥇 1st Place", id: event.results.top3?.[0] || event.results.winner },
              { label: "🥈 2nd Place", id: event.results.top3?.[1] || event.results.runnerUp },
              { label: "🥉 3rd Place", id: event.results.top3?.[2] },
            ].map((pos, i) => {
              const winner = participants.find(p => String(p.user?._id) === String(pos.id?._id || pos.id));
              return (
                <div key={i} style={{ flex: 1, minWidth: 140, background: "#fef3c7", borderRadius: 10, padding: "10px 14px", border: "1px solid #fde68a" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#d97706", margin: 0 }}>{pos.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 800, color: "#92400e", margin: "4px 0 0 0" }}>{winner?.user?.name || pos.id?.name || "—"}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Participant Table ── */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <div style={{
          padding: "14px 20px",
          borderBottom: "1px solid #e5e7eb",
          background: "#f9fafb",
          display: "grid",
          gridTemplateColumns: isLive || isCompleted ? "50px 2fr 2fr 1fr 120px" : "50px 2fr 2fr 1fr",
          gap: 8,
          fontSize: 11,
          fontWeight: 700,
          color: "#6b7280",
          textTransform: "uppercase"
        }}>
          <span>#</span>
          <span>Name</span>
          <span>Email</span>
          <span>Gender</span>
          {(isLive || isCompleted) && <span style={{ textAlign: "center" }}>Attendance</span>}
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Loading…</div>
        ) : participants.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>No participants registered yet.</div>
        ) : participants.map((p, i) => {
          const userId = String(p.user?._id);
          const isPresent = presentIds.has(userId);

          return (
            <div key={userId || i} style={{
              display: "grid",
              gridTemplateColumns: isLive || isCompleted ? "50px 2fr 2fr 1fr 120px" : "50px 2fr 2fr 1fr",
              gap: 8,
              padding: "14px 20px",
              borderBottom: "1px solid #f3f4f6",
              alignItems: "center",
              background: (isLive || isCompleted) ? (isPresent ? "#fafffe" : "#fffafa") : "transparent"
            }}>
              <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>{i + 1}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{p.user?.name || "—"}</span>
              <span style={{ fontSize: 12, color: "#6b7280" }}>{p.user?.email || "—"}</span>
              <span style={{ fontSize: 12, color: "#374151", textTransform: "capitalize" }}>{p.user?.gender || "—"}</span>

              {(isLive || isCompleted) && (
                <div style={{ textAlign: "center" }}>
                  <button
                    onClick={() => toggleAttendance(userId)}
                    disabled={!isLive || saving}
                    style={{
                      padding: "6px 16px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                      border: "none",
                      cursor: isLive ? "pointer" : "default",
                      opacity: saving ? 0.6 : 1,
                      background: isPresent ? "#dcfce7" : "#fee2e2",
                      color: isPresent ? "#16a34a" : "#dc2626",
                      transition: "all 0.2s"
                    }}
                  >
                    {isPresent ? "✓ Present" : "✕ Absent"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>
        Total: {participants.length} registered participant{participants.length !== 1 ? "s" : ""}
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
