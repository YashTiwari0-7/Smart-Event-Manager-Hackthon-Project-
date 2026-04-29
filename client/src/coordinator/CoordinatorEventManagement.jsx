import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as coordinatorService from "../services/coordinatorService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const statusDisplayMap = { OPEN: 'Open', CLOSED: 'Closed', LIVE: 'Live', COMPLETED: 'Completed' };

const categories = ["Technical", "Workshop", "Conference", "Exhibition", "Cultural", "Sports"];
const genderRules = ["None", "Only Male", "Only Female", "Mixed"];

// --- Sub-components ---
const Badge = ({ status }) => {
  const styles = {
    "Draft": "bg-gray-100 text-gray-600 border-gray-200",
    "Open": "bg-blue-100 text-blue-700 border-blue-200",
    "Closed": "bg-red-100 text-red-700 border-red-200",
    "Live": "bg-green-100 text-green-700 border-green-200",
    "Completed": "bg-slate-700 text-white border-slate-800"
  };
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border shrink-0 uppercase tracking-wide ${styles[status] || styles["Draft"]}`}>
      {status}
    </span>
  );
};

// --- Main Page Component ---
const CoordinatorEventManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await coordinatorService.getAssignedEvents();
        setEventsList((data || []).map(e => ({
          id: e._id, name: e.title, description: e.description || '',
          category: 'Technical', type: e.participationType === 'team' ? 'Team' : 'Individual',
          status: statusDisplayMap[e.status] || 'Draft',
          startDate: e.registrationStartDate || '', endDate: e.eventDate || '',
          regOpenDate: e.registrationStartDate || '', regCloseDate: e.registrationEndDate || '',
          slots: e.totalSlots || 0, filledSlots: e.participants?.length || 0,
          teamSizeMin: e.maxTeamSize ? 2 : null, teamSizeMax: e.maxTeamSize || null,
          genderRule: e.genderSpecification?.enabled ? e.genderSpecification.type : 'None',
          isPrimaryOwner: !e.configOwner || String(e.configOwner?._id || e.configOwner) === String(user?._id || user?.id),
          coordinators: (e.coordinators || []).map(c => ({ name: c.name || c, role: 'Coordinator' })),
          volunteers: []
        })));
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = eventsList.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Panel Handlers
  const openEditPanel = (event) => {
    setActiveEvent(event);
    setFormData({ ...event });
    setErrors({});
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setTimeout(() => setActiveEvent(null), 300); // Wait for transition
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleVolunteerChange = (index, field, value) => {
    const newVolunteers = [...formData.volunteers];
    newVolunteers[index][field] = value;
    setFormData(prev => ({ ...prev, volunteers: newVolunteers }));
  };

  const addVolunteer = () => {
    setFormData(prev => ({
      ...prev,
      volunteers: [...prev.volunteers, { name: "", phone: "", role: "" }]
    }));
  };

  const removeVolunteer = (index) => {
    const newVolunteers = [...formData.volunteers];
    newVolunteers.splice(index, 1);
    setFormData(prev => ({ ...prev, volunteers: newVolunteers }));
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Event name is required.";
    if (formData.slots <= 0) newErrors.slots = "Total slots must be greater than 0.";
    
    if (formData.type === "Team") {
      if (formData.teamSizeMax < formData.teamSizeMin) {
        newErrors.teamSizeMax = "Max team size cannot be less than Min size.";
      }
      if (formData.teamSizeMin < 1) newErrors.teamSizeMin = "Min size must be at least 1.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      setSaving(true);
      try {
        const payload = {
          participationType: formData.type.toLowerCase(),
          maxTeamSize: formData.type === "Team" ? Number(formData.teamSizeMax) : 0,
          totalSlots: formData.type === "Individual" ? Number(formData.slots) : 0,
          genderSpecification: {
            enabled: formData.genderRule !== "None" && formData.genderRule !== "Mixed",
            type: formData.genderRule === "Only Male" ? "male" : formData.genderRule === "Only Female" ? "female" : "none"
          },
          registrationStartDate: formData.regOpenDate,
          registrationEndDate: formData.regCloseDate,
          eventDate: formData.startDate || formData.endDate
        };
        await coordinatorService.configureEvent(formData.id, payload);
        showToast("Event configured successfully!");
        
        // Update local state
        setEventsList(prev => prev.map(e => e.id === formData.id ? { ...e, ...formData } : e));
        closePanel();
      } catch (err) {
        showToast(err.response?.data?.message || "Failed to save configuration", "error");
      } finally {
        setSaving(false);
      }
    }
  };

  // UI Conditionals
  const isReadOnly = formData && !formData.isPrimaryOwner;
  const isRegistrationClosed = formData && new Date() > new Date(formData.regCloseDate);
  const isLive = formData && formData.status === "Live";

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex overflow-hidden relative">
      
      {/* Main Content Area */}
      <main className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto transition-all duration-300 ${isPanelOpen ? "mr-0 lg:mr-96 opacity-50 lg:opacity-100 pointer-events-none lg:pointer-events-auto" : ""}`}>
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-800 transition-colors text-sm font-bold bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Events</h1>
                <p className="text-sm text-gray-500 mt-1">Manage and configure your assigned events</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2 pl-3 pr-8 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px top 50%', backgroundSize: '10px auto' }}
              >
                <option value="All">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
                <option value="Live">Live</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <div key={event.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2" title={event.name}>
                      {event.name}
                    </h3>
                    <Badge status={event.status} />
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-4 line-clamp-1">{event.description}</p>
                  
                  <div className="mt-auto space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 font-medium">{event.category}</span>
                      <span className="text-gray-700 font-semibold">{event.type}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 font-medium">Slots</span>
                      <span className="text-gray-700 font-semibold">{event.filledSlots} / {event.slots}</span>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-400 uppercase">Ownership</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${event.isPrimaryOwner ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"}`}>
                        {event.isPrimaryOwner ? "★ Primary Owner" : "Co-Coordinator"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 border-t border-gray-100 flex gap-2">
                  <button 
                    onClick={() => openEditPanel(event)}
                    className="flex-1 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm rounded-lg transition-colors shadow-sm"
                  >
                    Edit / Configure
                  </button>
                  <button 
                    className="flex-1 py-2 bg-white hover:bg-gray-100 text-gray-700 font-semibold text-sm rounded-lg border border-gray-200 transition-colors shadow-sm"
                    onClick={() => navigate(event.status === "Completed" ? `/coordinator-results/${event.id}` : `/coordinator-operations/${event.id}`)}
                  >
                    {event.status === "Completed" ? "View Results" : "View Participants"}
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>

      {/* Side Panel Overlay (Mobile) */}
      {isPanelOpen && (
        <div className="fixed inset-0 bg-gray-900/20 z-40 lg:hidden" onClick={closePanel}></div>
      )}

      {/* Slide-in Edit Panel */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-full md:w-[500px] bg-white border-l border-gray-200 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isPanelOpen ? "translate-x-0" : "translate-x-full"}`}>
        
        {/* Panel Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">Configure Event</h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {formData?.isPrimaryOwner ? "Full Edit Access" : "Read-only Access"}
            </p>
          </div>
          <button onClick={closePanel} className="text-gray-400 hover:text-gray-700 text-xl font-bold p-2">✕</button>
        </div>

        {/* Panel Content (Scrollable) */}
        {formData && (
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* Section A: Basic Info */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2">A. Basic Info</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Event Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" name="name" value={formData.name} onChange={handleInputChange} disabled={isReadOnly}
                  className={`w-full px-3 py-2 border rounded-lg text-sm transition-all ${errors.name ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-gray-200"} ${isReadOnly ? "bg-gray-100 text-gray-500" : "bg-white focus:outline-none focus:ring-2"}`} 
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea 
                  name="description" value={formData.description} onChange={handleInputChange} disabled={isReadOnly} rows="3"
                  className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm transition-all ${isReadOnly ? "bg-gray-100 text-gray-500" : "bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"}`} 
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} disabled={isReadOnly}
                    className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm ${isReadOnly ? "bg-gray-100 text-gray-500" : "bg-white"}`}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Banner Upload</label>
                  <button disabled={isReadOnly} className={`w-full py-2 border border-dashed rounded-lg text-sm font-semibold ${isReadOnly ? "border-gray-200 bg-gray-50 text-gray-400" : "border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100"}`}>
                    Choose File...
                  </button>
                </div>
              </div>
            </section>

            {/* Section B: Configuration */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2 flex justify-between">
                B. Configuration 
                {isLive && <span className="text-amber-500 text-[10px]">Locked (Event is Live)</span>}
              </h3>

              <div className="opacity-100">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Participation Type</label>
                <div className="flex gap-4">
                  <label className={`flex items-center gap-2 text-sm ${isReadOnly || isLive ? 'text-gray-400' : 'cursor-pointer'}`}>
                    <input type="radio" name="type" value="Individual" checked={formData.type === "Individual"} onChange={handleInputChange} disabled={isReadOnly || isLive} /> Individual
                  </label>
                  <label className={`flex items-center gap-2 text-sm ${isReadOnly || isLive ? 'text-gray-400' : 'cursor-pointer'}`}>
                    <input type="radio" name="type" value="Team" checked={formData.type === "Team"} onChange={handleInputChange} disabled={isReadOnly || isLive} /> Team
                  </label>
                </div>
              </div>

              {formData.type === "Team" && (
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Min Team Size</label>
                    <input type="number" name="teamSizeMin" value={formData.teamSizeMin} onChange={handleInputChange} disabled={isReadOnly || isLive}
                      className={`w-full px-3 py-1.5 border rounded-lg text-sm ${errors.teamSizeMin ? "border-red-300" : "border-gray-200"} ${isReadOnly || isLive ? "bg-gray-100 text-gray-500" : "bg-white"}`} />
                    {errors.teamSizeMin && <p className="text-[10px] text-red-500 mt-1">{errors.teamSizeMin}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Max Team Size</label>
                    <input type="number" name="teamSizeMax" value={formData.teamSizeMax} onChange={handleInputChange} disabled={isReadOnly || isLive}
                      className={`w-full px-3 py-1.5 border rounded-lg text-sm ${errors.teamSizeMax ? "border-red-300" : "border-gray-200"} ${isReadOnly || isLive ? "bg-gray-100 text-gray-500" : "bg-white"}`} />
                    {errors.teamSizeMax && <p className="text-[10px] text-red-500 mt-1">{errors.teamSizeMax}</p>}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Total Slots
                    {isRegistrationClosed && !isLive && <span className="ml-1 text-[10px] text-amber-500 font-normal">(Locked)</span>}
                  </label>
                  <input type="number" name="slots" value={formData.slots} onChange={handleInputChange} disabled={isReadOnly || isRegistrationClosed || isLive}
                    className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.slots ? "border-red-300" : "border-gray-200"} ${isReadOnly || isRegistrationClosed || isLive ? "bg-gray-100 text-gray-500" : "bg-white"}`} />
                  {errors.slots && <p className="text-[10px] text-red-500 mt-1">{errors.slots}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender Rules</label>
                  <select name="genderRule" value={formData.genderRule} onChange={handleInputChange} disabled={isReadOnly || isLive}
                    className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm ${isReadOnly || isLive ? "bg-gray-100 text-gray-500" : "bg-white"}`}>
                    {genderRules.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* Section C: Timeline */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2">C. Timeline</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Registration Open</label>
                  <input type="date" name="regOpenDate" value={formData.regOpenDate} onChange={handleInputChange} disabled={isReadOnly}
                    className={`w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm ${isReadOnly ? "bg-gray-100 text-gray-500" : "bg-white"}`} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Registration Close</label>
                  <input type="date" name="regCloseDate" value={formData.regCloseDate} onChange={handleInputChange} disabled={isReadOnly}
                    className={`w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm ${isReadOnly ? "bg-gray-100 text-gray-500" : "bg-white"}`} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Event Start</label>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} disabled={isReadOnly}
                    className={`w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm ${isReadOnly ? "bg-gray-100 text-gray-500" : "bg-white"}`} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Event End</label>
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} disabled={isReadOnly}
                    className={`w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm ${isReadOnly ? "bg-gray-100 text-gray-500" : "bg-white"}`} />
                </div>
              </div>
            </section>

            {/* Section D: Assignment */}
            <section className="space-y-4 pb-10">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2">D. Assignments</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Assigned Coordinators (Read-only)</label>
                <div className="space-y-2">
                  {formData.coordinators.map((c, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg text-sm">
                      <span className="font-medium text-gray-800">{c.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${c.role === "Primary" ? "bg-amber-100 text-amber-800" : "bg-gray-200 text-gray-600"}`}>
                        {c.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Volunteers</label>
                  {!isReadOnly && (
                    <button onClick={addVolunteer} type="button" className="text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors">
                      + Add Volunteer
                    </button>
                  )}
                </div>
                {formData.volunteers.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No volunteers assigned.</p>
                ) : (
                  <div className="space-y-2">
                    {formData.volunteers.map((vol, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input type="text" placeholder="Name" value={vol.name} onChange={(e) => handleVolunteerChange(idx, "name", e.target.value)} disabled={isReadOnly} className={`flex-1 min-w-0 px-2 py-1.5 border border-gray-200 rounded-lg text-xs ${isReadOnly ? "bg-gray-100" : "bg-white"}`} />
                        <input type="text" placeholder="Role" value={vol.role} onChange={(e) => handleVolunteerChange(idx, "role", e.target.value)} disabled={isReadOnly} className={`w-24 px-2 py-1.5 border border-gray-200 rounded-lg text-xs ${isReadOnly ? "bg-gray-100" : "bg-white"}`} />
                        {!isReadOnly && (
                          <button onClick={() => removeVolunteer(idx)} className="text-red-400 hover:text-red-600 font-bold px-1">✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* Panel Footer Actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3">
          {formData?.isPrimaryOwner ? (
            <>
              <button className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-lg transition-colors border border-red-200">
                Delete Event
              </button>
              <div className="flex-1 flex gap-2 justify-end">
                <button onClick={closePanel} className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-sm font-bold rounded-lg transition-colors">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-lg shadow-sm transition-colors disabled:opacity-60">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex justify-end">
              <button onClick={closePanel} className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-lg shadow-sm transition-colors">
                Close Panel
              </button>
            </div>
          )}
        </div>
      </aside>

    </div>
  );
};

export default CoordinatorEventManagement;
