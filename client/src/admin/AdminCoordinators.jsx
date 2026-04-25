import React, { useState, useEffect } from "react";
import * as adminService from "../services/adminService";

const btn = (bg, color) => ({
  background: bg, color, border: "none", borderRadius: 10, padding: "10px 20px",
  fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "opacity 0.15s",
});
const input = {
  width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb",
  fontSize: 13, outline: "none", boxSizing: "border-box",
};
const label = { fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, display: "block" };

const Modal = ({ open, onClose, title, children, width = 520 }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }} />
      <div style={{
        position: "relative", background: "#fff", borderRadius: 16, width, maxWidth: "90vw", maxHeight: "85vh",
        overflow: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
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

export default function AdminCoordinators() {
  const [coordinators, setCoordinators] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("approved");

  const [createOpen, setCreateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [form, setForm] = useState({ name: "", email: "" });
  const [selected, setSelected] = useState(null);
  const [coordDetail, setCoordDetail] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [approved, pend] = await Promise.all([
        adminService.getApprovedCoordinators(),
        adminService.getPendingCoordinators(),
      ]);
      setCoordinators(approved || []);
      setPending(pend || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.email.trim()) { setError("Name and email are required"); return; }
    setSubmitting(true); setError("");
    try {
      await adminService.createCoordinator({ name: form.name.trim(), email: form.email.trim() });
      setCreateOpen(false); setForm({ name: "", email: "" }); loadData();
      alert("Coordinator created! Credentials sent via email.");
    } catch (err) { setError(err.response?.data?.message || "Failed to create coordinator"); } finally { setSubmitting(false); }
  };

  const handleApprove = async (id) => {
    try {
      await adminService.approveCoordinator(id);
      loadData();
    } catch (err) { alert(err.response?.data?.message || "Failed to approve"); }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await adminService.deleteCoordinator(selected._id);
      setDeleteOpen(false); setSelected(null); if (viewOpen) { setViewOpen(false); setCoordDetail(null); } loadData();
    } catch (err) { alert(err.response?.data?.message || "Failed to delete"); } finally { setSubmitting(false); }
  };

  const openView = async (coord) => {
    setSelected(coord); setViewOpen(true); setCoordDetail(null);
    try {
      const detail = await adminService.getCoordinatorDetails(coord._id);
      setCoordDetail(detail);
    } catch (err) { console.error(err); }
  };

  const list = tab === "approved" ? coordinators : pending;
  const filtered = list.filter(c => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.name?.toLowerCase().includes(s) || c.email?.toLowerCase().includes(s);
  });

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #e5e7eb", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: "#9ca3af", fontSize: 13 }}>Loading coordinators…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Coordinators</h2>
        <button style={btn("#6366f1", "#fff")} onClick={() => { setForm({ name: "", email: "" }); setError(""); setCreateOpen(true); }}>
          + Create Coordinator
        </button>
      </div>

      {/* Tabs + Search */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        {["approved", "pending"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, border: "1px solid", cursor: "pointer",
            background: tab === t ? "#1e293b" : "#fff", color: tab === t ? "#fff" : "#374151",
            borderColor: tab === t ? "#1e293b" : "#e5e7eb", transition: "all 0.15s",
          }}>
            {t === "approved" ? `Approved (${coordinators.length})` : `Pending (${pending.length})`}
          </button>
        ))}
        <input placeholder="Search coordinators…" value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...input, maxWidth: 260, background: "#fff", marginLeft: "auto" }} />
      </div>

      {/* Coordinator list */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13, background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb" }}>
            No {tab} coordinators found.
          </div>
        ) : (
          filtered.map(c => (
            <div key={c._id} style={{
              background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 20,
              transition: "box-shadow 0.2s, transform 0.2s", cursor: "pointer",
            }}
              onClick={() => tab === "approved" && openView(c)}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16, flexShrink: 0,
                }}>
                  {c.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>{c.email}</div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6,
                  background: c.isApproved ? "#ecfdf5" : "#fef3c7", color: c.isApproved ? "#059669" : "#d97706",
                }}>
                  {c.isApproved ? "Approved" : "Pending"}
                </span>
                {tab === "pending" && (
                  <button onClick={(e) => { e.stopPropagation(); handleApprove(c._id); }}
                    style={{ ...btn("#059669", "#fff"), padding: "6px 14px", fontSize: 12 }}>
                    Approve ✓
                  </button>
                )}
                {tab === "approved" && (
                  <button onClick={(e) => { e.stopPropagation(); setSelected(c); setDeleteOpen(true); }}
                    style={{ ...btn("#fef2f2", "#dc2626"), padding: "6px 14px", fontSize: 12 }}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE MODAL */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Coordinator">
        {error && <div style={{ padding: "10px 14px", background: "#fef2f2", color: "#dc2626", borderRadius: 8, fontSize: 13, marginBottom: 16, border: "1px solid #fecaca" }}>{error}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ padding: "12px 16px", background: "#eef2ff", borderRadius: 10, fontSize: 12, color: "#4f46e5", fontWeight: 500 }}>
            A random password will be generated and sent to the coordinator's email address automatically.
          </div>
          <div><label style={label}>Name *</label><input style={input} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" /></div>
          <div><label style={label}>Email *</label><input style={input} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="coordinator@email.com" /></div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8, borderTop: "1px solid #f3f4f6" }}>
            <button onClick={() => setCreateOpen(false)} style={btn("#f3f4f6", "#374151")}>Cancel</button>
            <button onClick={handleCreate} disabled={submitting} style={{ ...btn("#6366f1", "#fff"), opacity: submitting ? 0.6 : 1 }}>
              {submitting ? "Creating…" : "Create & Send Credentials"}
            </button>
          </div>
        </div>
      </Modal>

      {/* VIEW DETAIL MODAL */}
      <Modal open={viewOpen} onClose={() => { setViewOpen(false); setCoordDetail(null); }} title="Coordinator Details" width={580}>
        {coordDetail ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 22, flexShrink: 0,
              }}>
                {coordDetail.coordinator?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#111827" }}>{coordDetail.coordinator?.name}</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>{coordDetail.coordinator?.email}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                { l: "Designation", v: coordDetail.coordinator?.designation || "—" },
                { l: "Institution", v: coordDetail.coordinator?.institutionName || "—" },
                { l: "Gender", v: coordDetail.coordinator?.gender || "—" },
              ].map(item => (
                <div key={item.l} style={{ background: "#f9fafb", padding: "12px 14px", borderRadius: 10, border: "1px solid #f3f4f6" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.l}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginTop: 2, textTransform: "capitalize" }}>{item.v}</div>
                </div>
              ))}
            </div>

            <div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 10 }}>Assigned Events ({coordDetail.assignedEvents?.length || 0})</h4>
              {(coordDetail.assignedEvents || []).length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", color: "#9ca3af", fontSize: 12, background: "#f9fafb", borderRadius: 10 }}>No events assigned.</div>
              ) : (
                <div style={{ borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                  {coordDetail.assignedEvents.map(e => (
                    <div key={e._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderBottom: "1px solid #f3f4f6" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{e.title}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>
                          {e.eventDate ? new Date(e.eventDate).toLocaleDateString() : "No date"}
                        </div>
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4,
                        background: e.status === "upcoming" ? "#eef2ff" : e.status === "ongoing" ? "#ecfdf5" : "#f3f4f6",
                        color: e.status === "upcoming" ? "#4f46e5" : e.status === "ongoing" ? "#059669" : "#6b7280",
                        textTransform: "capitalize",
                      }}>{e.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid #f3f4f6" }}>
              <button onClick={() => { setSelected(coordDetail.coordinator); setDeleteOpen(true); }}
                style={btn("#dc2626", "#fff")}>
                Delete Coordinator
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
            <div style={{ width: 30, height: 30, border: "3px solid #e5e7eb", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRM */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Coordinator" width={420}>
        <p style={{ fontSize: 14, color: "#374151", marginBottom: 20 }}>
          Are you sure you want to delete <strong>{selected?.name}</strong>? They will be unassigned from all events. This action cannot be undone.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={() => setDeleteOpen(false)} style={btn("#f3f4f6", "#374151")}>Cancel</button>
          <button onClick={handleDelete} disabled={submitting} style={{ ...btn("#dc2626", "#fff"), opacity: submitting ? 0.6 : 1 }}>
            {submitting ? "Deleting…" : "Delete Coordinator"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
