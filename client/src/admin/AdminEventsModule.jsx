import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as adminService from "../services/adminService";
import * as analyticsService from "../services/analyticsService";
import { useToast } from "../context/ToastContext";
import ConfirmationModal from "../components/ConfirmationModal";

// Status mapping from backend to display
const statusMap = { OPEN: "Open", LIVE: "Live", COMPLETED: "Completed", CLOSED: "Closed", upcoming: "Open", ongoing: "Live", completed: "Completed", closed: "Closed" };

// --- SUB-COMPONENTS ---
const StatusBadge = ({ status }) => {
  const styles = {
    "Draft": "bg-gray-100 text-gray-600 border-gray-200",
    "Open": "bg-blue-100 text-blue-700 border-blue-200",
    "OPEN": "bg-blue-100 text-blue-700 border-blue-200",
    "Closed": "bg-red-100 text-red-700 border-red-200",
    "CLOSED": "bg-red-100 text-red-700 border-red-200",
    "Live": "bg-green-100 text-green-700 border-green-200",
    "LIVE": "bg-green-100 text-green-700 border-green-200",
    "Completed": "bg-slate-700 text-white border-slate-800",
    "COMPLETED": "bg-slate-700 text-white border-slate-800"
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${styles[status] || styles["Draft"]}`}>
      {status}
    </span>
  );
};

const MetricCard = ({ title, value, subtitle }) => (
  <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
    <p className="text-2xl font-extrabold text-gray-900">{value}</p>
    {subtitle && <p className="text-xs text-gray-500 mt-1 font-medium">{subtitle}</p>}
  </div>
);

const ReviewItem = ({ review }) => (
  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
    <div className="flex justify-between items-start mb-2">
      <span className="font-bold text-gray-900 text-sm">{review.name}</span>
      <span className="text-amber-500 text-sm">{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</span>
    </div>
    <p className="text-sm text-gray-600 italic">"{review.comment}"</p>
  </div>
);

// --- MAIN COMPONENT ---
export default function AdminEventsModule() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [viewMode, setViewMode] = useState("list");
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedEventDetail, setSelectedEventDetail] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("Date");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [coordSearch, setCoordSearch] = useState("");
  const [selectedCoords, setSelectedCoords] = useState([]);
  const [availableCoordinators, setAvailableCoordinators] = useState([]);
  
  // API state
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", description: "" });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState({ id: "", title: "", description: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ show: false, action: null, title: "", message: "", type: "primary" });

  // Fetch coordinators when opening create/edit modal
  useEffect(() => {
    if ((isCreateModalOpen || isEditModalOpen) && availableCoordinators.length === 0) {
      const fetchCoords = async () => {
        try {
          const coords = await adminService.getApprovedCoordinators();
          setAvailableCoordinators(coords || []);
        } catch (err) {
          console.error("Failed to fetch coordinators", err);
        }
      };
      fetchCoords();
    }
  }, [isCreateModalOpen, isEditModalOpen]);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await adminService.getAllEvents();
        setEventsList(data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleEventClick = (id) => {
    const evt = eventsList.find(e => e._id === id);
    setSelectedEventDetail(evt);
    setSelectedEventId(id);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedEventId(null);
    setSelectedEventDetail(null);
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title) {
      showToast("Event name is required", "error");
      return;
    }
    setCreateLoading(true);
    try {
      const created = await adminService.createEvent({
        title: newEvent.title,
        description: newEvent.description,
        coordinators: selectedCoords.map(c => c._id)
      });
      setEventsList(prev => [created, ...prev]);
      setIsCreateModalOpen(false);
      setNewEvent({ title: "", description: "" });
      setSelectedCoords([]);
      showToast("Event created successfully!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create event", "error");
    } finally {
      setCreateLoading(false);
    }
  };

  const openEditModal = () => {
    setEditEvent({
      id: selectedEventDetail._id,
      title: selectedEventDetail.title,
      description: selectedEventDetail.description || ""
    });
    setSelectedCoords(selectedEventDetail.coordinators || []);
    setIsEditModalOpen(true);
  };

  const handleUpdateEvent = async () => {
    if (!editEvent.title) {
      showToast("Event name is required", "error");
      return;
    }
    setEditLoading(true);
    try {
      const updated = await adminService.updateEvent(editEvent.id, {
        title: editEvent.title,
        description: editEvent.description,
        coordinators: selectedCoords.map(c => c._id)
      });
      setEventsList(prev => prev.map(e => e._id === updated._id ? updated : e));
      setSelectedEventDetail(updated);
      setIsEditModalOpen(false);
      showToast("Event updated successfully!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update event", "error");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteEvent = () => {
    setConfirmConfig({
      show: true,
      title: "Delete Event?",
      message: "Are you sure you want to delete this event? This action cannot be undone and will remove all registrations.",
      type: "danger",
      action: async () => {
        try {
          await adminService.deleteEvent(selectedEventId);
          setEventsList(prev => prev.filter(e => e._id !== selectedEventId));
          handleBackToList();
          showToast("Event deleted successfully!");
        } catch (err) {
          showToast(err.response?.data?.message || "Failed to delete event", "error");
        }
      }
    });
  };

  // Map API data to display format
  const mappedEvents = eventsList.map(e => ({
    id: e._id,
    name: e.title,
    description: e.description || "",
    status: statusMap[e.status] || "Draft",
    participants: e.participants?.length || 0,
    rating: 0,
    coordinatorsCount: e.coordinators?.length || 0,
    date: e.eventDate || e.createdAt
  }));

  const filteredAndSortedEvents = [...mappedEvents]
    .filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "Participants") return b.participants - a.participants;
      return new Date(b.date || 0) - new Date(a.date || 0);
    });

  const filteredAvailableCoords = availableCoordinators.filter(c => 
    c.name.toLowerCase().includes(coordSearch.toLowerCase()) &&
    !selectedCoords.some(selected => selected._id === c._id)
  );
  
  const toggleCoord = (coord) => {
    if (selectedCoords.some(c => c._id === coord._id)) {
      setSelectedCoords(selectedCoords.filter(c => c._id !== coord._id));
    } else {
      setSelectedCoords([...selectedCoords, coord]);
      setCoordSearch("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-12">
      
      {/* Navbar Continuation */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          {viewMode === "detail" ? (
            <button onClick={handleBackToList} className="mr-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-bold flex items-center gap-1">
              <span>←</span> Back to Events
            </button>
          ) : (
            <>
              <button onClick={() => navigate(-1)} className="mr-2 text-gray-400 hover:text-gray-800 transition-colors text-sm font-bold">← Back</button>
              <span className="text-xl font-bold text-gray-800 hidden sm:block">⚡</span>
              <span className="text-base font-bold text-gray-900 tracking-tight hidden sm:block">SMART Event Manager</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded border border-gray-200 uppercase tracking-wider">
            {viewMode === "list" ? "Admin All Events" : "Event Analytics"}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* ========================================= */}
        {/* VIEW 1: EVENTS LIST PAGE                  */}
        {/* ========================================= */}
        {viewMode === "list" && (
          <div className="space-y-6 fade-in">
            
            {/* Header & Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">All Events</h1>
                <p className="text-sm text-gray-500 mt-1">Manage and analyze platform events.</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                  <input
                    type="text" placeholder="Search events..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                </div>
                
                <select
                  value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-auto py-2 pl-3 pr-8 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px top 50%', backgroundSize: '10px auto' }}
                >
                  <option value="Date">Sort by Date</option>
                  <option value="Participants">Sort by Participants</option>
                  <option value="Rating">Sort by Rating</option>
                </select>

                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-900 text-white font-bold text-sm rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                >
                  + Create Event
                </button>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedEvents.map(event => (
                <div 
                  key={event.id} 
                  onClick={() => handleEventClick(event.id)}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col h-full overflow-hidden group"
                >
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <h3 className="font-extrabold text-gray-900 text-lg leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors">{event.name}</h3>
                      <StatusBadge status={event.status} />
                    </div>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{event.description}</p>
                    
                    <div className="mt-auto grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Users</p>
                        <p className="text-sm font-bold text-gray-800">{event.participants}</p>
                      </div>
                      <div className="text-center border-x border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Rating</p>
                        <p className="text-sm font-bold text-amber-500">{event.rating > 0 ? `★ ${event.rating}` : "-"}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Team</p>
                        <p className="text-sm font-bold text-gray-800">{event.coordinatorsCount}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredAndSortedEvents.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
                  No events found.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================= */}
        {/* VIEW 2: EVENT DETAIL PAGE                 */}
        {/* ========================================= */}
        {viewMode === "detail" && (
          <div className="space-y-6 fade-in">
            
            {/* Detail Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6 pb-6 border-b border-gray-100">
                <div className="max-w-3xl">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{selectedEventDetail?.title || 'Event'}</h1>
                    <StatusBadge status={statusMap[selectedEventDetail?.status] || 'Draft'} />
                  </div>
                  <p className="text-base text-gray-600">{selectedEventDetail?.description || ''}</p>
                </div>
                <div className="flex flex-col gap-3 items-end">
                  <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Coordinators</p>
                    <p className="text-sm font-medium text-gray-800">{(selectedEventDetail?.coordinators || []).map(c => c.name || c).join(", ") || 'None assigned'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={openEditModal} className="px-4 py-2 bg-blue-50 text-blue-600 font-bold text-xs rounded-lg border border-blue-200 hover:bg-blue-100 transition">Edit Event</button>
                    <button onClick={handleDeleteEvent} className="px-4 py-2 bg-red-50 text-red-600 font-bold text-xs rounded-lg border border-red-200 hover:bg-red-100 transition">Delete</button>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard title="Total Reg" value={selectedEventDetail?.participants?.length || 0} subtitle="Confirmed Users" />
                <MetricCard title="Teams" value={selectedEventDetail?.teams?.length || 0} subtitle="Registered" />
                <MetricCard title="Winners" value={selectedEventDetail?.winners?.length || 0} subtitle="Declared" />
                <MetricCard title="Status" value={statusMap[selectedEventDetail?.status] || 'N/A'} subtitle="Current" />
              </div>
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Col: Charts */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Registrations Chart (Tailwind Bar Simulation) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Registrations Over Time</h3>
                  <div className="flex items-end justify-between h-48 gap-2 pt-4 border-l border-b border-gray-200 px-2 pb-2 relative">
                    {mockEventDetail.analytics.registrationsOverTime.map((val, idx) => {
                      const max = Math.max(...mockEventDetail.analytics.registrationsOverTime);
                      const height = `${(val / max) * 100}%`;
                      return (
                        <div key={idx} className="relative flex flex-col items-center flex-1 group">
                          <div className="absolute -top-8 bg-gray-900 text-white text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {val}
                          </div>
                          <div className="w-full bg-blue-100 hover:bg-blue-200 rounded-t-sm transition-colors border-x border-t border-blue-200" style={{ height }}></div>
                          <span className="text-[10px] text-gray-400 mt-2 font-medium">Day {idx+1}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pie Chart Simulation (Tailwind) */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6 w-full">Participation Split</h3>
                    <div className="relative w-32 h-32 rounded-full border-8 border-gray-100 overflow-hidden mb-6 flex items-center justify-center shadow-inner bg-blue-500" 
                         style={{ background: `conic-gradient(#3b82f6 0% ${mockEventDetail.analytics.teamVsIndividual.team}%, #94a3b8 ${mockEventDetail.analytics.teamVsIndividual.team}% 100%)` }}>
                      <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center shadow">
                        <span className="font-bold text-gray-800 text-lg">{mockEventDetail.analytics.teamVsIndividual.team}%</span>
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs font-medium text-gray-500 w-full justify-center">
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-500"></span> Teams</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-slate-400"></span> Individual</span>
                    </div>
                  </div>

                  {/* Gender Distribution */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Gender Demographics</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                          <span>Male</span><span>{mockEventDetail.analytics.genderDistribution.male}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div className="bg-indigo-400 h-2.5 rounded-full" style={{ width: `${mockEventDetail.analytics.genderDistribution.male}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                          <span>Female</span><span>{mockEventDetail.analytics.genderDistribution.female}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div className="bg-pink-400 h-2.5 rounded-full" style={{ width: `${mockEventDetail.analytics.genderDistribution.female}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                          <span>Other</span><span>{mockEventDetail.analytics.genderDistribution.other}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div className="bg-emerald-400 h-2.5 rounded-full" style={{ width: `${mockEventDetail.analytics.genderDistribution.other}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Col: Reviews & Participants Preview */}
              <div className="space-y-6">
                
                {/* Reviews */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Recent Reviews</h3>
                    <span className="text-xs font-bold text-gray-500">{mockEventDetail.reviews.length} Total</span>
                  </div>
                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {mockEventDetail.reviews.map(rev => (
                      <ReviewItem key={rev.id} review={rev} />
                    ))}
                  </div>
                </div>

                {/* Participants Preview */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Participants Prep</h3>
                    <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Preview</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                      <thead className="text-xs text-gray-400 uppercase bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 font-semibold rounded-tl-lg">Name</th>
                          <th className="px-3 py-2 font-semibold text-right rounded-tr-lg">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockEventDetail.participantsList.slice(0,4).map((p, i) => (
                          <tr key={p.id} className="border-b border-gray-50 last:border-0">
                            <td className="px-3 py-2.5">
                              <p className="font-bold text-gray-800">{p.name}</p>
                              <p className="text-[10px] text-gray-400">{p.team}</p>
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${p.status === "Confirmed" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================= */}
      {/* MODAL: CREATE EVENT PANEL                 */}
      {/* ========================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col relative">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-extrabold text-gray-900">Create New Event</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-800 transition-colors font-bold p-1">✕</button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 bg-white relative">
              
              {/* Form Fields */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Event Name</label>
                <input type="text" placeholder="e.g. Annual Tech Symposium" value={newEvent.title} onChange={(e) => setNewEvent(p => ({...p, title: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:outline-none rounded-lg bg-white text-gray-900 text-sm transition-all" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea placeholder="Brief details about the event..." rows="3" value={newEvent.description} onChange={(e) => setNewEvent(p => ({...p, description: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:outline-none rounded-lg bg-white text-gray-900 text-sm transition-all"></textarea>
              </div>

              {/* Assign Coordinators */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Assign Coordinators</label>
                <div className="border border-gray-300 focus-within:ring-2 focus-within:ring-gray-200 rounded-lg bg-white p-2 transition-all">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedCoords.map(c => (
                      <span key={c._id} className="bg-gray-100 border border-gray-200 text-xs font-bold px-2 py-1 rounded flex items-center gap-1 text-gray-700">
                        {c.name} <button onClick={() => toggleCoord(c)} className="text-gray-400 hover:text-gray-700">✕</button>
                      </span>
                    ))}
                  </div>
                  <div className="relative">
                    <input 
                      type="text" placeholder="Search coordinators..." value={coordSearch} onChange={(e) => setCoordSearch(e.target.value)}
                      className="w-full bg-transparent text-sm focus:outline-none px-1 text-gray-900"
                    />
                    {coordSearch && filteredAvailableCoords.length > 0 && (
                      <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-40 overflow-y-auto">
                        {filteredAvailableCoords.map(c => (
                          <div key={c._id} onClick={() => toggleCoord(c)} className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                            {c.name} ({c.email})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleCreateEvent} disabled={createLoading}
                className="px-6 py-2 bg-gray-900 text-white hover:bg-gray-800 text-sm font-bold rounded-lg shadow-sm transition-colors disabled:opacity-60"
              >
                Create Event
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL: EDIT EVENT PANEL                   */}
      {/* ========================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col relative">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-extrabold text-gray-900">Edit Event</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-800 transition-colors font-bold p-1">✕</button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 bg-white relative">
              
              {/* Form Fields */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Event Name</label>
                <input type="text" placeholder="e.g. Annual Tech Symposium" value={editEvent.title} onChange={(e) => setEditEvent(p => ({...p, title: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:outline-none rounded-lg bg-white text-gray-900 text-sm transition-all" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea placeholder="Brief details about the event..." rows="3" value={editEvent.description} onChange={(e) => setEditEvent(p => ({...p, description: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-gray-200 focus:outline-none rounded-lg bg-white text-gray-900 text-sm transition-all"></textarea>
              </div>

              {/* Assign Coordinators */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Assign Coordinators</label>
                <div className="border border-gray-300 focus-within:ring-2 focus-within:ring-gray-200 rounded-lg bg-white p-2 transition-all">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedCoords.map(c => (
                      <span key={c._id || c} className="bg-gray-100 border border-gray-200 text-xs font-bold px-2 py-1 rounded flex items-center gap-1 text-gray-700">
                        {c.name || 'Coordinator'} <button onClick={() => toggleCoord(c)} className="text-gray-400 hover:text-gray-700">✕</button>
                      </span>
                    ))}
                  </div>
                  <div className="relative">
                    <input 
                      type="text" placeholder="Search coordinators..." value={coordSearch} onChange={(e) => setCoordSearch(e.target.value)}
                      className="w-full bg-transparent text-sm focus:outline-none px-1 text-gray-900"
                    />
                    {coordSearch && filteredAvailableCoords.length > 0 && (
                      <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-40 overflow-y-auto">
                        {filteredAvailableCoords.map(c => (
                          <div key={c._id} onClick={() => toggleCoord(c)} className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                            {c.name} ({c.email})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleUpdateEvent} disabled={editLoading}
                className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 text-sm font-bold rounded-lg shadow-sm transition-colors disabled:opacity-60"
              >
                Save Changes
              </button>
            </div>
            
          </div>
        </div>
      )}

      <style>{`
        .fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>
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
