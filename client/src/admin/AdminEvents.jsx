import React, { useState, useEffect } from "react";
import * as adminService from "../services/adminService";
import { useToast } from "../context/ToastContext";

/* ─── Modal ─── */
const Modal = ({ open, onClose, title, children, wide }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className={`relative bg-white rounded-2xl ${wide ? "w-[640px]" : "w-[520px]"} max-w-[90vw] max-h-[85vh] overflow-auto shadow-2xl`} onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="text-base font-extrabold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-xl text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

/* ─── StatusBadge ─── */
const statusMap = {
  OPEN:      "bg-indigo-50 text-indigo-600",
  CLOSED:    "bg-amber-50 text-amber-600",
  LIVE:      "bg-emerald-50 text-emerald-600",
  COMPLETED: "bg-gray-100 text-gray-500",
  upcoming:  "bg-indigo-50 text-indigo-600",
  ongoing:   "bg-emerald-50 text-emerald-600",
  completed: "bg-gray-100 text-gray-500",
};
const StatusBadge = ({ status }) => (
  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${statusMap[status] || statusMap.upcoming}`}>{status}</span>
);

/* ─── Main ─── */
export default function AdminEvents() {
  const { showToast } = useToast();
  const [events, setEvents] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [coordFilter, setCoordFilter] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [form, setForm] = useState({ title: "", description: "", coordinators: [] });
  const [selected, setSelected] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [ev, co] = await Promise.all([adminService.getAllEvents(), adminService.getApprovedCoordinators()]);
      setEvents(ev || []); setCoordinators(co || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = events.filter(e => {
    if (search && !e.title?.toLowerCase().includes(search.toLowerCase())) return false;
    if (dateFilter) { const ed = e.eventDate ? new Date(e.eventDate).toISOString().slice(0, 10) : ""; if (ed !== dateFilter) return false; }
    if (coordFilter) { const match = (e.coordinators || []).some(c => c._id === coordFilter || c.name?.toLowerCase().includes(coordFilter.toLowerCase())); if (!match) return false; }
    return true;
  });

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
    try { await adminService.deleteEvent(selected._id); setDeleteOpen(false); setSelected(null); loadData(); }
    catch (err) { showToast(err.response?.data?.message || "Failed to delete", "error"); } finally { setSubmitting(false); }
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

  const toggleCoord = (id) => {
    setForm(prev => ({ ...prev, coordinators: prev.coordinators.includes(id) ? prev.coordinators.filter(c => c !== id) : [...prev.coordinators, id] }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="text-center">
          <div className="w-9 h-9 border-[3px] border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm font-medium">Loading events…</p>
        </div>
      </div>
    );
  }

  /* ── Coordinator Chip Selector (reusable) ── */
  const CoordSelector = () => (
    <div>
      <label className="text-xs font-bold text-gray-700 mb-1.5 block">Assign Coordinators</label>
      <div className="flex flex-wrap gap-2">
        {coordinators.map(c => (
          <button key={c._id} onClick={() => toggleCoord(c._id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 cursor-pointer ${
              form.coordinators.includes(c._id) ? "bg-indigo-500 text-white border-indigo-500" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300"
            }`}>{c.name}</button>
        ))}
        {coordinators.length === 0 && <span className="text-xs text-gray-400">No approved coordinators available</span>}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Events</h2>
        <button onClick={() => { setForm({ title: "", description: "", coordinators: [] }); setError(""); setCreateOpen(true); }}
          className="bg-indigo-500 hover:bg-indigo-600 text-white border-none rounded-xl px-5 py-2.5 text-sm font-bold transition-colors">
          + Create Event
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input placeholder="Search by name…" value={search} onChange={e => setSearch(e.target.value)}
          className="max-w-[260px] py-2.5 px-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-all placeholder-gray-400" />
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          className="max-w-[180px] py-2.5 px-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all" />
        <select value={coordFilter} onChange={e => setCoordFilter(e.target.value)}
          className="max-w-[220px] py-2.5 px-3.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all">
          <option value="">All Coordinators</option>
          {coordinators.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        {(search || dateFilter || coordFilter) && (
          <button onClick={() => { setSearch(""); setDateFilter(""); setCoordFilter(""); }}
            className="py-2 px-4 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold border border-gray-200 hover:bg-gray-200 transition-colors">Clear</button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        {/* Header row */}
        <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr_160px] px-5 py-3 border-b border-gray-200 bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          <span>Event Name</span><span>Date</span><span>Status</span><span>Participants</span><span>Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl mx-auto mb-3">📭</div>
            <p className="text-sm font-semibold text-gray-400">No events found.</p>
          </div>
        ) : (
          filtered.map(event => (
            <div key={event._id} className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1fr_160px] px-5 py-4 border-b border-gray-100 items-center hover:bg-gray-50/60 transition-colors gap-2 lg:gap-0">
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{event.title}</p>
                <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">
                  {(event.coordinators || []).map(c => c.name).join(", ") || "No coordinators"}
                </p>
              </div>
              <span className="text-sm text-gray-600">
                {event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-US", { month: "short", day: "2-digit" }) : "TBD"}
              </span>
              <div><StatusBadge status={event.status} /></div>
              <span className="text-sm font-semibold text-gray-600">{event.participants?.length || 0}</span>
              <div className="flex gap-1.5">
                <button onClick={() => openView(event)} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[11px] font-bold hover:bg-indigo-100 transition-colors border-none cursor-pointer">View</button>
                <button onClick={() => openEdit(event)} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-[11px] font-bold hover:bg-gray-200 transition-colors border-none cursor-pointer">Edit</button>
                <button onClick={() => { setSelected(event); setDeleteOpen(true); }} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[11px] font-bold hover:bg-red-100 transition-colors border-none cursor-pointer">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── CREATE ── */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Event">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">{error}</div>}
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-gray-700 mb-1.5 block">Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Event title"
              className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 mb-1.5 block">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Event description"
              className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
          </div>
          <CoordSelector />
          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button onClick={() => setCreateOpen(false)} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold border-none cursor-pointer hover:bg-gray-200 transition-colors">Cancel</button>
            <button onClick={handleCreate} disabled={submitting} className="px-5 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-bold border-none cursor-pointer hover:bg-indigo-600 transition-colors disabled:opacity-60">{submitting ? "Creating…" : "Create Event"}</button>
          </div>
        </div>
      </Modal>

      {/* ── EDIT ── */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Event">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">{error}</div>}
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-gray-700 mb-1.5 block">Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 mb-1.5 block">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full py-2.5 px-3.5 rounded-xl border border-gray-200 text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
          </div>
          <CoordSelector />
          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button onClick={() => setEditOpen(false)} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold border-none cursor-pointer hover:bg-gray-200 transition-colors">Cancel</button>
            <button onClick={handleUpdate} disabled={submitting} className="px-5 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-bold border-none cursor-pointer hover:bg-indigo-600 transition-colors disabled:opacity-60">{submitting ? "Saving…" : "Save Changes"}</button>
          </div>
        </div>
      </Modal>

      {/* ── VIEW ── */}
      <Modal open={viewOpen} onClose={() => { setViewOpen(false); setParticipants([]); }} title="Event Details" wide>
        {selected && (
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="text-xl font-extrabold text-gray-900">{selected.title}</h3>
              <p className="text-sm text-gray-500 mt-1.5">{selected.description || "No description"}</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { l: "Status", v: selected.status }, { l: "Type", v: selected.participationType || "Not configured" },
                { l: "Event Date", v: selected.eventDate ? new Date(selected.eventDate).toLocaleDateString() : "TBD" },
                { l: "Total Slots", v: selected.totalSlots || "N/A" },
                { l: "Reg. Start", v: selected.registrationStartDate ? new Date(selected.registrationStartDate).toLocaleDateString() : "TBD" },
                { l: "Reg. End", v: selected.registrationEndDate ? new Date(selected.registrationEndDate).toLocaleDateString() : "TBD" },
              ].map(item => (
                <div key={item.l} className="bg-gray-50 rounded-xl px-3.5 py-3 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.l}</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize mt-0.5">{item.v}</p>
                </div>
              ))}
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-700 mb-2">Coordinators ({(selected.coordinators || []).length})</h4>
              <div className="flex flex-wrap gap-2">
                {(selected.coordinators || []).map(c => (
                  <span key={c._id || c} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold">{c.name || c.email || c}</span>
                ))}
                {(selected.coordinators || []).length === 0 && <span className="text-xs text-gray-400">None assigned</span>}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-700 mb-2">Participants ({participants.length})</h4>
              {participants.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400 bg-gray-50 rounded-xl">No participants registered.</div>
              ) : (
                <div className="max-h-[240px] overflow-auto rounded-xl border border-gray-200">
                  {participants.map((p, i) => (
                    <div key={p._id || i} className="flex justify-between items-center px-4 py-3 border-b border-gray-100 last:border-b-0 text-sm">
                      <div>
                        <p className="font-semibold text-gray-900">{p.user?.name || "Unknown"}</p>
                        <p className="text-[11px] text-gray-400">{p.user?.email}</p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className="text-[11px] text-gray-500 capitalize">{p.user?.gender || "—"}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${p.status === "registered" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>{p.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ── DELETE ── */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Event">
        <p className="text-sm text-gray-600 mb-5">
          Are you sure you want to delete <strong className="text-gray-900">{selected?.title}</strong>? This will also remove all registrations, teams, and certificates. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2.5">
          <button onClick={() => setDeleteOpen(false)} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold border-none cursor-pointer hover:bg-gray-200 transition-colors">Cancel</button>
          <button onClick={handleDelete} disabled={submitting} className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold border-none cursor-pointer hover:bg-red-700 transition-colors disabled:opacity-60">{submitting ? "Deleting…" : "Delete Event"}</button>
        </div>
      </Modal>
    </div>
  );
}
