import React, { useState, useEffect } from "react";
import * as adminService from "../services/adminService";

/* ─── shared styles ───────────────────────────────── */
const btn = (bg, color) => ({
  background: bg, color, border: "none", borderRadius: 10, padding: "10px 20px",
  fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "opacity 0.15s",
});
const input = {
  width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb",
  fontSize: 13, outline: "none", boxSizing: "border-box",
};
const label = { fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, display: "block" };

/* ─── Modal wrapper ───────────────────────────────── */
const Modal = ({ open, onClose, title, children, width = 520 }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }} />
      <div style={{
        position: "relative", background: "#fff", borderRadius: 16, width, maxWidth: "90vw", maxHeight: "85vh",
        overflow: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.2)", padding: 0,
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid #e5e7eb",
          display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", zIndex: 2,
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: "#111827" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#9ca3af" }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
};

/* ─── Status badge ────────────────────────────────── */
const StatusBadge = ({ status }) => {
  const map = {
    upcoming: { bg: "#eef2ff", color: "#4f46e5" },
    ongoing: { bg: "#ecfdf5", color: "#059669" },
    completed: { bg: "#f3f4f6", color: "#6b7280" },
  };
  const s = map[status] || map.upcoming;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6,
      background: s.bg, color: s.color, textTransform: "capitalize",
    }}>{status}</span>
  );
};

/* ─── Main component ──────────────────────────────── */
export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [coordFilter, setCoordFilter] = useState("");

  // modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // form state
  const [form, setForm] = useState({ title: "", description: "", coordinators: [] });
  const [selected, setSelected] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [ev, co] = await Promise.all([adminService.getAllEvents(), adminService.getApprovedCoordinators()]);
      setEvents(ev || []);
      setCoordinators(co || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  /* ── filtering ── */
  const filtered = events.filter(e => {
    if (search && !e.title?.toLowerCase().includes(search.toLowerCase())) return false;
    if (dateFilter) {
      const ed = e.eventDate ? new Date(e.eventDate).toISOString().slice(0, 10) : "";
      if (ed !== dateFilter) return false;
    }
    if (coordFilter) {
      const match = (e.coordinators || []).some(c => c._id === coordFilter || c.name?.toLowerCase().includes(coordFilter.toLowerCase()));
      if (!match) return false;
    }
    return true;
  });

  /* ── handlers ── */
  const handleCreate = async () => {
    if (!form.title.trim()) { setError("Title is required"); return; }
    setSubmitting(true); setError("");
    try {
      await adminService.createEvent({ title: form.title.trim(), description: form.description.trim(), coordinators: form.coordinators });
      setCreateOpen(false); setForm({ title: "", description: "", coordinators: [] }); loadData();
    } catch (err) { setError(err.response?.data?.message || "Failed to create event"); } finally { setSubmitting(false); }
  };

  const handleUpdate = async () => {
    if (!form.title.trim()) { setError("Title is required"); return; }
    setSubmitting(true); setError("");
    try {
      await adminService.updateEvent(selected._id, { title: form.title.trim(), description: form.description.trim(), coordinators: form.coordinators });
      setEditOpen(false); loadData();
    } catch (err) { setError(err.response?.data?.message || "Failed to update"); } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await adminService.deleteEvent(selected._id);
      setDeleteOpen(false); setSelected(null); loadData();
    } catch (err) { alert(err.response?.data?.message || "Failed to delete"); } finally { setSubmitting(false); }
  };

  const openView = async (event) => {
    setSelected(event); setViewOpen(true);
    try {
      const [detail, parts] = await Promise.all([adminService.getEventById(event._id), adminService.getEventParticipants(event._id)]);
      setSelected(detail); setParticipants(parts || []);
    } catch (err) { console.error(err); }
  };

  const openEdit = (event) => {
    setForm({ title: event.title || "", description: event.description || "", coordinators: (event.coordinators || []).map(c => c._id || c) });
    setSelected(event); setError(""); setEditOpen(true);
  };

  /* ── coordinator multi-select toggle ── */
  const toggleCoord = (id) => {
    setForm(prev => ({
      ...prev,
      coordinators: prev.coordinators.includes(id)
        ? prev.coordinators.filter(c => c !== id)
        : [...prev.coordinators, id]
    }));
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #e5e7eb", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: "#9ca3af", fontSize: 13 }}>Loading events…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Events</h2>
        <button style={btn("#6366f1", "#fff")} onClick={() => { setForm({ title: "", description: "", coordinators: [] }); setError(""); setCreateOpen(true); }}>
          + Create Event
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <input placeholder="Search by name…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...input, maxWidth: 260, background: "#fff" }} />
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          style={{ ...input, maxWidth: 180, background: "#fff" }} />
        <select value={coordFilter} onChange={e => setCoordFilter(e.target.value)}
          style={{ ...input, maxWidth: 220, background: "#fff" }}>
          <option value="">All Coordinators</option>
          {coordinators.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        {(search || dateFilter || coordFilter) && (
          <button onClick={() => { setSearch(""); setDateFilter(""); setCoordFilter(""); }}
            style={{ ...btn("#f3f4f6", "#374151"), padding: "8px 14px" }}>Clear</button>
        )}
      </div>

      {/* Event list */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        {/* Table header */}
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 160px", padding: "14px 20px",
          borderBottom: "1px solid #e5e7eb", background: "#f9fafb",
          fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px",
        }}>
          <span>Event Name</span><span>Date</span><span>Status</span><span>Participants</span><span>Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>No events found.</div>
        ) : (
          filtered.map(event => (
            <div key={event._id} style={{
              display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 160px", padding: "16px 20px",
              borderBottom: "1px solid #f3f4f6", alignItems: "center", transition: "background 0.1s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#fafbfc"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{event.title}</div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                  {(event.coordinators || []).map(c => c.name).join(", ") || "No coordinators"}
                </div>
              </div>
              <span style={{ fontSize: 13, color: "#374151" }}>
                {event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-US", { month: "short", day: "2-digit" }) : "TBD"}
              </span>
              <StatusBadge status={event.status} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{event.participants?.length || 0}</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => openView(event)} style={{ ...btn("#eef2ff", "#4f46e5"), padding: "6px 12px", fontSize: 12 }}>View</button>
                <button onClick={() => openEdit(event)} style={{ ...btn("#f3f4f6", "#374151"), padding: "6px 12px", fontSize: 12 }}>Edit</button>
                <button onClick={() => { setSelected(event); setDeleteOpen(true); }} style={{ ...btn("#fef2f2", "#dc2626"), padding: "6px 12px", fontSize: 12 }}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── CREATE MODAL ── */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Event">
        {error && <div style={{ padding: "10px 14px", background: "#fef2f2", color: "#dc2626", borderRadius: 8, fontSize: 13, marginBottom: 16, border: "1px solid #fecaca" }}>{error}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div><label style={label}>Title *</label><input style={input} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Event title" /></div>
          <div><label style={label}>Description</label><textarea style={{ ...input, minHeight: 80, resize: "vertical" }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Event description" /></div>
          <div>
            <label style={label}>Assign Coordinators (optional)</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {coordinators.map(c => (
                <button key={c._id} onClick={() => toggleCoord(c._id)}
                  style={{
                    padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid",
                    background: form.coordinators.includes(c._id) ? "#6366f1" : "#f9fafb",
                    color: form.coordinators.includes(c._id) ? "#fff" : "#374151",
                    borderColor: form.coordinators.includes(c._id) ? "#6366f1" : "#e5e7eb",
                    transition: "all 0.15s",
                  }}>
                  {c.name}
                </button>
              ))}
              {coordinators.length === 0 && <span style={{ fontSize: 12, color: "#9ca3af" }}>No approved coordinators available</span>}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8, borderTop: "1px solid #f3f4f6" }}>
            <button onClick={() => setCreateOpen(false)} style={btn("#f3f4f6", "#374151")}>Cancel</button>
            <button onClick={handleCreate} disabled={submitting} style={{ ...btn("#6366f1", "#fff"), opacity: submitting ? 0.6 : 1 }}>
              {submitting ? "Creating…" : "Create Event"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── EDIT MODAL ── */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Event">
        {error && <div style={{ padding: "10px 14px", background: "#fef2f2", color: "#dc2626", borderRadius: 8, fontSize: 13, marginBottom: 16, border: "1px solid #fecaca" }}>{error}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div><label style={label}>Title *</label><input style={input} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
          <div><label style={label}>Description</label><textarea style={{ ...input, minHeight: 80, resize: "vertical" }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div>
            <label style={label}>Assign Coordinators</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {coordinators.map(c => (
                <button key={c._id} onClick={() => toggleCoord(c._id)}
                  style={{
                    padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid",
                    background: form.coordinators.includes(c._id) ? "#6366f1" : "#f9fafb",
                    color: form.coordinators.includes(c._id) ? "#fff" : "#374151",
                    borderColor: form.coordinators.includes(c._id) ? "#6366f1" : "#e5e7eb",
                    transition: "all 0.15s",
                  }}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8, borderTop: "1px solid #f3f4f6" }}>
            <button onClick={() => setEditOpen(false)} style={btn("#f3f4f6", "#374151")}>Cancel</button>
            <button onClick={handleUpdate} disabled={submitting} style={{ ...btn("#6366f1", "#fff"), opacity: submitting ? 0.6 : 1 }}>
              {submitting ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── VIEW MODAL ── */}
      <Modal open={viewOpen} onClose={() => { setViewOpen(false); setParticipants([]); }} title="Event Details" width={640}>
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: 0 }}>{selected.title}</h3>
              <p style={{ fontSize: 13, color: "#6b7280", marginTop: 6 }}>{selected.description || "No description"}</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { l: "Status", v: selected.status },
                { l: "Type", v: selected.participationType || "Not configured" },
                { l: "Event Date", v: selected.eventDate ? new Date(selected.eventDate).toLocaleDateString() : "TBD" },
                { l: "Total Slots", v: selected.totalSlots || "N/A" },
                { l: "Reg. Start", v: selected.registrationStartDate ? new Date(selected.registrationStartDate).toLocaleDateString() : "TBD" },
                { l: "Reg. End", v: selected.registrationEndDate ? new Date(selected.registrationEndDate).toLocaleDateString() : "TBD" },
              ].map(item => (
                <div key={item.l} style={{ background: "#f9fafb", padding: "12px 14px", borderRadius: 10, border: "1px solid #f3f4f6" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.l}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginTop: 2, textTransform: "capitalize" }}>{item.v}</div>
                </div>
              ))}
            </div>

            {/* Coordinators */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Assigned Coordinators ({(selected.coordinators || []).length})</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(selected.coordinators || []).map(c => (
                  <span key={c._id || c} style={{ padding: "6px 14px", background: "#eef2ff", color: "#4f46e5", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                    {c.name || c.email || c}
                  </span>
                ))}
                {(selected.coordinators || []).length === 0 && <span style={{ fontSize: 12, color: "#9ca3af" }}>None assigned</span>}
              </div>
            </div>

            {/* Participants */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Participants ({participants.length})</h4>
              {participants.length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", color: "#9ca3af", fontSize: 12, background: "#f9fafb", borderRadius: 10 }}>No participants registered.</div>
              ) : (
                <div style={{ maxHeight: 240, overflow: "auto", borderRadius: 10, border: "1px solid #e5e7eb" }}>
                  {participants.map((p, i) => (
                    <div key={p._id || i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 14px", borderBottom: "1px solid #f3f4f6", fontSize: 13,
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, color: "#111827" }}>{p.user?.name || "Unknown"}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>{p.user?.email}</div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: "#6b7280", textTransform: "capitalize" }}>{p.user?.gender || "—"}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                          background: p.status === "registered" ? "#ecfdf5" : "#fef2f2",
                          color: p.status === "registered" ? "#059669" : "#dc2626",
                          textTransform: "capitalize",
                        }}>{p.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ── DELETE CONFIRM ── */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Event" width={420}>
        <p style={{ fontSize: 14, color: "#374151", marginBottom: 20 }}>
          Are you sure you want to delete <strong>{selected?.title}</strong>? This will also remove all registrations, teams, and certificates. This action cannot be undone.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={() => setDeleteOpen(false)} style={btn("#f3f4f6", "#374151")}>Cancel</button>
          <button onClick={handleDelete} disabled={submitting} style={{ ...btn("#dc2626", "#fff"), opacity: submitting ? 0.6 : 1 }}>
            {submitting ? "Deleting…" : "Delete Event"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
