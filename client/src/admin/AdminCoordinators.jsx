import React, { useState, useEffect } from "react";
import * as adminService from "../services/adminService";
import { useToast } from "../context/ToastContext";

/* ─── Modal ─── */
const Modal = ({ open, onClose, title, children, wide }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className={`relative bg-white rounded-2xl ${wide ? "w-[580px]" : "w-[520px]"} max-w-[90vw] max-h-[85vh] overflow-auto shadow-2xl`} onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="text-base font-extrabold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-xl text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default function AdminCoordinators() {
  const { showToast } = useToast();
  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
      const approved = await adminService.getApprovedCoordinators();
      setCoordinators(approved || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.email.trim()) { setError("Name and email are required"); return; }
    setSubmitting(true); setError("");
    try {
      await adminService.createCoordinator({ name: form.name.trim(), email: form.email.trim() });
      setCreateOpen(false); setForm({ name: "", email: "" }); loadData();
      showToast("Coordinator created! Credentials sent via email.");
    } catch (err) { setError(err.response?.data?.message || "Failed to create coordinator"); } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await adminService.deleteCoordinator(selected._id);
      setDeleteOpen(false); setSelected(null); if (viewOpen) { setViewOpen(false); setCoordDetail(null); } loadData();
    } catch (err) { showToast(err.response?.data?.message || "Failed to delete", "error"); } finally { setSubmitting(false); }
  };

  const openView = async (coord) => {
    setSelected(coord); setViewOpen(true); setCoordDetail(null);
    try {
      const detail = await adminService.getCoordinatorDetails(coord._id);
      setCoordDetail(detail);
    } catch (err) { console.error(err); }
  };

  const filtered = coordinators.filter(c => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.name?.toLowerCase().includes(s) || c.email?.toLowerCase().includes(s);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="text-center">
          <div className="w-9 h-9 border-[3px] border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm font-medium">Loading coordinators…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Coordinators</h2>
        <button onClick={() => { setForm({ name: "", email: "" }); setError(""); setCreateOpen(true); }}
          className="bg-indigo-500 hover:bg-indigo-600 text-white border-none rounded-xl px-5 py-2.5 text-sm font-bold transition-colors cursor-pointer">
          + Create Coordinator
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm font-bold text-gray-600">Total: {coordinators.length} Coordinators</p>
        <input placeholder="Search coordinators…" value={search} onChange={e => setSearch(e.target.value)}
          className="max-w-[300px] py-2.5 px-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all placeholder-gray-400" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-gray-200/80 shadow-sm py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl mx-auto mb-3">👥</div>
            <p className="text-sm font-semibold text-gray-400">No coordinators found.</p>
          </div>
        ) : (
          filtered.map(c => (
            <div key={c._id} onClick={() => openView(c)}
              className="group bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-base shrink-0">
                  {c.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{c.name}</p>
                  <p className="text-[11px] text-gray-400 font-medium truncate">{c.email}</p>
                </div>
              </div>
              <button className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-bold transition-colors border border-gray-200 cursor-pointer">
                View Details →
              </button>
            </div>
          ))
        )}
      </div>

      {/* ── CREATE ── */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Coordinator">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">{error}</div>}
        <div className="flex flex-col gap-4">
          <div className="p-3.5 bg-indigo-50 rounded-xl text-xs text-indigo-600 font-medium">
            A random password will be generated and sent to the coordinator's email address automatically.
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 mb-1.5 block">Name *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name"
              className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 mb-1.5 block">Email *</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="coordinator@email.com"
              className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
          </div>
          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button onClick={() => setCreateOpen(false)} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold border-none cursor-pointer hover:bg-gray-200 transition-colors">Cancel</button>
            <button onClick={handleCreate} disabled={submitting} className="px-5 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-bold border-none cursor-pointer hover:bg-indigo-600 transition-colors disabled:opacity-60">{submitting ? "Creating…" : "Create & Send Credentials"}</button>
          </div>
        </div>
      </Modal>

      {/* ── VIEW ── */}
      <Modal open={viewOpen} onClose={() => { setViewOpen(false); setCoordDetail(null); }} title="Coordinator Details" wide>
        {coordDetail ? (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                {coordDetail.coordinator?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="text-xl font-extrabold text-gray-900">{coordDetail.coordinator?.name}</p>
                <p className="text-sm text-gray-500">{coordDetail.coordinator?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { l: "Designation", v: coordDetail.coordinator?.designation || "—" },
                { l: "Institution", v: coordDetail.coordinator?.institutionName || "—" },
                { l: "Gender", v: coordDetail.coordinator?.gender || "—" },
              ].map(item => (
                <div key={item.l} className="bg-gray-50 rounded-xl px-3.5 py-3 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.l}</p>
                  <p className="text-xs font-semibold text-gray-900 capitalize mt-0.5">{item.v}</p>
                </div>
              ))}
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-700 mb-2">Assigned Events ({coordDetail.assignedEvents?.length || 0})</h4>
              {(coordDetail.assignedEvents || []).length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400 bg-gray-50 rounded-xl">No events assigned.</div>
              ) : (
                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  {coordDetail.assignedEvents.map(e => (
                    <div key={e._id} className="flex justify-between items-center px-4 py-3 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{e.title}</p>
                        <p className="text-[11px] text-gray-400">{e.eventDate ? new Date(e.eventDate).toLocaleDateString() : "No date"}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${
                        e.status === "OPEN" || e.status === "upcoming" ? "bg-indigo-50 text-indigo-600" : e.status === "LIVE" || e.status === "ongoing" ? "bg-emerald-50 text-emerald-600" : e.status === "CLOSED" ? "bg-amber-50 text-amber-600" : "bg-gray-100 text-gray-500"
                      }`}>{e.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button onClick={() => { setSelected(coordDetail.coordinator); setDeleteOpen(true); }}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold border-none cursor-pointer hover:bg-red-700 transition-colors">
                Delete Coordinator
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-[3px] border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        )}
      </Modal>

      {/* ── DELETE ── */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Coordinator">
        <p className="text-sm text-gray-600 mb-5">
          Are you sure you want to delete <strong className="text-gray-900">{selected?.name}</strong>? They will be unassigned from all events. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2.5">
          <button onClick={() => setDeleteOpen(false)} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold border-none cursor-pointer hover:bg-gray-200 transition-colors">Cancel</button>
          <button onClick={handleDelete} disabled={submitting} className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold border-none cursor-pointer hover:bg-red-700 transition-colors disabled:opacity-60">{submitting ? "Deleting…" : "Delete Coordinator"}</button>
        </div>
      </Modal>
    </div>
  );
}
