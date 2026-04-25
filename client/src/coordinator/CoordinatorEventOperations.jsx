import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// --- Mock Data ---
const initialEvent = {
  id: 1,
  name: "Hackathon 2026: The Future of AI",
  type: "Team",
  status: "Closed", // Draft -> Open -> Closed -> Live -> Completed
  startDate: "Mar 10, 2026",
  endDate: "Mar 12, 2026",
};

const initialParticipants = [
  { id: 101, name: "Alice Smith", email: "alice@college.edu", status: "Confirmed", attendance: null, teamName: "Alpha Brains" },
  { id: 102, name: "Bob Jones", email: "bob@college.edu", status: "Confirmed", attendance: null, teamName: "Alpha Brains" },
  { id: 103, name: "Charlie Brown", email: "charlie@college.edu", status: "Waitlisted", attendance: null, teamName: "Beta Coders" },
  { id: 104, name: "Diana Prince", email: "diana@college.edu", status: "Confirmed", attendance: null, teamName: "Beta Coders" },
  { id: 105, name: "Eve Davis", email: "eve@college.edu", status: "Dropped", attendance: null, teamName: "Gamma Ray" },
  { id: 106, name: "Frank White", email: "frank@college.edu", status: "Confirmed", attendance: null, teamName: "Gamma Ray" },
  { id: 107, name: "Grace Lee", email: "grace@college.edu", status: "Confirmed", attendance: null, teamName: "Delta Force" },
  { id: 108, name: "Hank Pym", email: "hank@college.edu", status: "Waitlisted", attendance: null, teamName: "Delta Force" },
  { id: 109, name: "Ivy Chen", email: "ivy@college.edu", status: "Confirmed", attendance: null, teamName: "Alpha Brains" },
  { id: 110, name: "Jack Black", email: "jack@college.edu", status: "Confirmed", attendance: null, teamName: "Beta Coders" },
];

// --- Sub-components ---
const StatusBadge = ({ status }) => {
  const styles = {
    "Draft": "bg-gray-100 text-gray-600 border-gray-200",
    "Open": "bg-blue-100 text-blue-700 border-blue-200",
    "Closed": "bg-red-100 text-red-700 border-red-200",
    "Live": "bg-green-100 text-green-700 border-green-200",
    "Completed": "bg-slate-700 text-white border-slate-800"
  };
  return (
    <span className={`text-xs font-bold px-3 py-1 rounded-md border uppercase tracking-wide ${styles[status] || styles["Draft"]}`}>
      {status}
    </span>
  );
};

const ParticipantStatusBadge = ({ status }) => {
  const styles = {
    "Confirmed": "bg-green-50 text-green-700 border-green-200",
    "Waitlisted": "bg-amber-50 text-amber-700 border-amber-200",
    "Dropped": "bg-gray-100 text-gray-500 border-gray-200"
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  );
};

// --- Main Page ---
const CoordinatorEventOperations = () => {
  const navigate = useNavigate();

  // State
  const [event, setEvent] = useState(initialEvent);
  const [participants, setParticipants] = useState(initialParticipants);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // State Machine Logic
  const getNextStateAction = () => {
    switch (event.status) {
      case "Draft": return { label: "Open Registration", nextState: "Open", color: "bg-blue-600 hover:bg-blue-700" };
      case "Open": return { label: "Close Registration", nextState: "Closed", color: "bg-red-600 hover:bg-red-700" };
      case "Closed": return { label: "Start Event", nextState: "Live", color: "bg-green-600 hover:bg-green-700" };
      case "Live": return { label: "End Event", nextState: "Completed", color: "bg-gray-800 hover:bg-gray-900" };
      case "Completed": return null;
      default: return null;
    }
  };

  const action = getNextStateAction();
  const isLive = event.status === "Live";
  const isCompleted = event.status === "Completed";

  const advanceState = () => {
    if (action) {
      if (action.nextState === "Live" && !window.confirm("Are you sure you want to START the event? Attendance will be unlocked.")) return;
      if (action.nextState === "Completed" && !window.confirm("Are you sure you want to END the event? This action cannot be undone.")) return;
      
      setEvent(prev => ({ ...prev, status: action.nextState }));
    }
  };

  // Attendance Handlers
  const toggleAttendance = (id, value) => {
    if (!isLive) return;
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, attendance: value } : p));
  };

  const bulkMarkAttendance = (value) => {
    if (!isLive) return;
    setParticipants(prev => prev.map(p => {
      // Only mark confirmed participants
      if (p.status === "Confirmed") {
        return { ...p, attendance: value };
      }
      return p;
    }));
  };

  // Derived Data
  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "All" || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const teams = [...new Set(filteredParticipants.map(p => p.teamName))].filter(Boolean);

  const renderParticipantRow = (p) => (
    <div key={p.id} className="flex items-center justify-between p-3 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="flex-1">
        <p className="text-sm font-bold text-gray-900">{p.name}</p>
        <p className="text-xs text-gray-500">{p.email}</p>
      </div>
      <div className="w-24 text-center">
        <ParticipantStatusBadge status={p.status} />
      </div>
      <div className="w-32 flex justify-end items-center gap-2">
        <button 
          onClick={() => toggleAttendance(p.id, 'present')}
          disabled={!isLive || p.status !== "Confirmed"}
          className={`w-8 h-8 rounded flex items-center justify-center font-bold text-lg transition-colors ${
            p.attendance === 'present' ? 'bg-green-100 text-green-700 border border-green-300' : 
            'bg-gray-100 text-gray-400 border border-gray-200 hover:bg-gray-200'
          } ${(!isLive || p.status !== "Confirmed") ? 'opacity-50 cursor-not-allowed hover:bg-gray-100' : ''}`}
          title="Mark Present"
        >
          ✓
        </button>
        <button 
          onClick={() => toggleAttendance(p.id, 'absent')}
          disabled={!isLive || p.status !== "Confirmed"}
          className={`w-8 h-8 rounded flex items-center justify-center font-bold text-lg transition-colors ${
            p.attendance === 'absent' ? 'bg-red-100 text-red-700 border border-red-300' : 
            'bg-gray-100 text-gray-400 border border-gray-200 hover:bg-gray-200'
          } ${(!isLive || p.status !== "Confirmed") ? 'opacity-50 cursor-not-allowed hover:bg-gray-100' : ''}`}
          title="Mark Absent"
        >
          ✕
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      {/* Top Navbar Continuation */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="mr-2 text-gray-400 hover:text-gray-800 transition-colors">
            ← Back
          </button>
          <span className="text-xl font-bold text-gray-800">⚡</span>
          <span className="text-base font-bold text-gray-900 tracking-tight hidden sm:block">SMART Event Manager</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md border border-gray-200 uppercase tracking-wider">Live Control Panel</span>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* SECTION 1: EVENT HEADER & SECTION 2: STATUS CONTROL */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none">{event.name}</h1>
              <StatusBadge status={event.status} />
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 font-medium">
              <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded border border-gray-100">🏷️ {event.type} Event</span>
              <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded border border-gray-100">📅 {event.startDate} - {event.endDate}</span>
              <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded border border-gray-100">👥 {participants.length} Participants</span>
            </div>
          </div>

          <div className="flex flex-col items-end w-full md:w-auto p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Lifecycle Control</p>
            {action ? (
              <button 
                onClick={advanceState}
                className={`w-full md:w-48 py-2.5 text-white font-bold rounded-lg shadow-sm transition-all ${action.color}`}
              >
                {action.label} →
              </button>
            ) : (
              <div className="w-full md:w-48 py-2.5 bg-gray-200 text-gray-500 font-bold rounded-lg text-center shadow-inner cursor-not-allowed">
                Event Ended
              </div>
            )}
            {!isLive && event.status !== "Completed" && (
              <p className="text-[10px] text-gray-400 mt-2 text-center w-full">Attendance locked until event is Live</p>
            )}
          </div>
        </div>

        {/* SECTION 3 & 4: PARTICIPANTS & ATTENDANCE */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col h-[600px]">
          
          {/* List Header & Controls */}
          <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Participants & Attendance</h2>
                <p className="text-xs text-gray-500 mt-0.5">Manage attendees and track presence.</p>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => bulkMarkAttendance('present')}
                  disabled={!isLive}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors border ${isLive ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-gray-100 text-gray-400 border-gray-200 opacity-50 cursor-not-allowed'}`}
                >
                  Mark All Present
                </button>
                <button 
                  onClick={() => bulkMarkAttendance('absent')}
                  disabled={!isLive}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors border ${isLive ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : 'bg-gray-100 text-gray-400 border-gray-200 opacity-50 cursor-not-allowed'}`}
                >
                  Mark All Absent
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input
                  type="text"
                  placeholder="Search participants by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="py-2 pl-3 pr-8 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px top 50%', backgroundSize: '10px auto' }}
              >
                <option value="All">All Statuses</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Waitlisted">Waitlisted</option>
                <option value="Dropped">Dropped</option>
              </select>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto">
            {filteredParticipants.length === 0 ? (
              <div className="p-10 text-center text-gray-500 text-sm">No participants found matching criteria.</div>
            ) : (
              event.type === "Team" ? (
                <div>
                  {teams.map(teamName => (
                    <div key={teamName} className="mb-4">
                      <div className="bg-gray-100 px-4 py-2 border-y border-gray-200 font-bold text-gray-700 text-sm flex justify-between">
                        <span>🛡️ Team: {teamName}</span>
                        <span className="text-gray-500 font-medium text-xs">{filteredParticipants.filter(p => p.teamName === teamName).length} Members</span>
                      </div>
                      <div>
                        {filteredParticipants.filter(p => p.teamName === teamName).map(p => renderParticipantRow(p))}
                      </div>
                    </div>
                  ))}
                  {/* Handle participants without teams just in case */}
                  {filteredParticipants.filter(p => !p.teamName).length > 0 && (
                    <div className="mb-4">
                      <div className="bg-gray-100 px-4 py-2 border-y border-gray-200 font-bold text-gray-700 text-sm flex justify-between">
                        <span>👤 Unassigned</span>
                      </div>
                      <div>
                        {filteredParticipants.filter(p => !p.teamName).map(p => renderParticipantRow(p))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {filteredParticipants.map(p => renderParticipantRow(p))}
                </div>
              )
            )}
          </div>
          
          {/* Table Footer */}
          <div className="bg-gray-50 p-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
            <span>Showing {filteredParticipants.length} participants</span>
            {isCompleted && <span className="text-red-500 font-bold">Event Completed. Records Locked.</span>}
          </div>

        </div>

      </main>
    </div>
  );
};

export default CoordinatorEventOperations;
