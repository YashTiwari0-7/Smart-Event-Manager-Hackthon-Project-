import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as coordinatorService from "../services/coordinatorService";

const statusDisplayMap = { upcoming: 'Open', ongoing: 'Live', completed: 'Completed' };

// --- Sub-components ---
const EventCard = ({ event, navigate }) => {
  const getBadgeStyle = (status) => {
    switch (status) {
      case "Live": return "bg-green-100 text-green-700 border-green-200";
      case "Open": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Closed": return "bg-red-100 text-red-700 border-red-200";
      case "Completed": return "bg-slate-700 text-white border-slate-800";
      case "Not Configured": return "bg-gray-100 text-gray-600 border-gray-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col h-full">
      {/* Header Area */}
      <div className="flex justify-between items-start gap-3 mb-2">
        <h3 className="font-bold text-gray-900 text-lg leading-tight truncate" title={event.name}>
          {event.name}
        </h3>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border shrink-0 uppercase tracking-wide ${getBadgeStyle(event.status)}`}>
          {event.status}
        </span>
      </div>
      
      <p className="text-sm text-gray-500 mb-5 line-clamp-1 flex-1">{event.description}</p>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-5">
        <div className="col-span-2 sm:col-span-1">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Timeline</p>
          <p className="font-medium">{event.startDate} - <br className="hidden sm:block lg:hidden"/>{event.endDate}</p>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Participation</p>
          <p className="font-medium">{event.participantsCount} / {event.maxParticipants}</p>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Format</p>
          <p className="font-medium">
            {event.type} {event.type === "Team" ? <span className="text-gray-500 text-xs">({event.teamSize} pax)</span> : ""}
          </p>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Team</p>
          <p className="font-medium">{event.coordinatorsCount} Coordinators</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto flex gap-3">
        <button 
          onClick={() => navigate("/coordinator-management")} 
          className="flex-1 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm rounded-lg transition-colors shadow-sm"
        >
          Configure
        </button>
        <button 
          onClick={() => navigate(event.status === "Completed" ? `/coordinator-results/${event.id}` : `/coordinator-operations/${event.id}`)} 
          className="flex-1 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm rounded-lg border border-gray-200 transition-colors shadow-sm"
        >
          {event.status === "Completed" ? "View Results" : "View Participants"}
        </button>
      </div>
    </div>
  );
};

// --- Main Page Component ---
const CoordinatorAssignedEvents = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await coordinatorService.getAssignedEvents();
        setEvents((data || []).map(e => ({
          id: e._id, name: e.title, description: e.description || '',
          type: e.participationType === 'team' ? 'Team' : 'Individual',
          status: statusDisplayMap[e.status] || 'Not Configured',
          startDate: e.registrationStartDate ? new Date(e.registrationStartDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'TBD',
          endDate: e.eventDate ? new Date(e.eventDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'TBD',
          participantsCount: e.participants?.length || 0,
          maxParticipants: e.totalSlots || 0,
          teamSize: e.maxTeamSize || null,
          coordinatorsCount: e.coordinators?.length || 0
        })));
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-800 transition-colors text-sm font-bold bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
              ← Back
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Assigned Events</h1>
              <p className="text-sm text-gray-500 mt-1">Manage events assigned by admin</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search Bar */}
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
            
            {/* Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 pl-3 pr-8 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all text-gray-700 font-medium appearance-none cursor-pointer"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px top 50%', backgroundSize: '10px auto' }}
            >
              <option value="All">All Statuses</option>
              <option value="Live">Live</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Completed">Completed</option>
              <option value="Not Configured">Not Configured</option>
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className="text-sm font-semibold text-gray-500">
          Showing {filteredEvents.length} assigned events
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} navigate={navigate} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <span className="text-4xl block mb-3">📭</span>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No events found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search or filters to find what you're looking for.</p>
            <button 
              onClick={() => { setSearchTerm(""); setStatusFilter("All"); }}
              className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default CoordinatorAssignedEvents;
