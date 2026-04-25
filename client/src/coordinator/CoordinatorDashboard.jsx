import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as coordinatorService from "../services/coordinatorService";



// --- Sub-components ---
const StatCard = ({ label, value, icon }) => (
  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-2xl border border-gray-200 shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800 leading-tight">{value}</p>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-0.5">{label}</p>
    </div>
  </div>
);

const EventCard = ({ event, navigate }) => {
  const getBadgeStyle = (status) => {
    switch (status) {
      case "Live": return "bg-green-100 text-green-700 border-green-200";
      case "Open": 
      case "Upcoming": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Closed": return "bg-red-100 text-red-700 border-red-200";
      case "Completed": return "bg-gray-100 text-gray-600 border-gray-200";
      case "Not Configured": return "bg-orange-100 text-orange-700 border-orange-200";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-bold text-gray-900 text-lg leading-tight">{event.name}</h3>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border shrink-0 uppercase tracking-wide ${getBadgeStyle(event.status)}`}>
          {event.status}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600">
        <p className="flex items-center gap-2"><span>📅</span> {event.start} - {event.end}</p>
        <p className="flex items-center gap-2"><span>👥</span> {event.participants}</p>
        <p className="flex items-center gap-2"><span>🏷️</span> {event.type}</p>
        <p className="flex items-center gap-2"><span>🤝</span> {event.coCount} Coordinators</p>
      </div>

      <div className="mt-auto flex gap-2 pt-2">
        <button onClick={() => navigate("/coordinator-management")} className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-xs rounded-lg transition-colors border border-gray-200">
          Configure
        </button>
        <button onClick={() => navigate(event.status === "Completed" ? "/coordinator-results" : "/coordinator-operations")} className="flex-1 py-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold text-xs rounded-lg transition-colors">
          {event.status === "Completed" ? "View Results" : "Manage"}
        </button>
      </div>
    </div>
  );
};

const NotificationItem = ({ notif }) => (
  <div className="p-3 bg-white border border-gray-100 rounded-lg shadow-sm mb-2 hover:border-gray-300 transition-colors">
    <p className="text-sm text-gray-800 font-medium leading-snug">{notif.text}</p>
    <p className="text-xs text-gray-400 mt-1.5">{notif.time}</p>
  </div>
);

// --- Main Page ---
const statusDisplayMap = { upcoming: 'Open', ongoing: 'Live', completed: 'Completed' };

const CoordinatorDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await coordinatorService.getAssignedEvents();
        setEvents(data || []);
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const mockStats = [
    { id: 1, label: "Total Assigned", value: events.length, icon: "📋" },
    { id: 2, label: "Active Events", value: events.filter(e => e.status === 'ongoing').length, icon: "🔥" },
    { id: 3, label: "Upcoming Events", value: events.filter(e => e.status === 'upcoming').length, icon: "📅" },
    { id: 4, label: "Completed", value: events.filter(e => e.status === 'completed').length, icon: "✅" },
    { id: 5, label: "Total Participants", value: events.reduce((s, e) => s + (e.participants?.length || 0), 0), icon: "👥" },
  ];

  const mockEvents = events.map(e => ({
    id: e._id, name: e.title, status: statusDisplayMap[e.status] || 'Not Configured',
    start: e.registrationStartDate ? new Date(e.registrationStartDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) : 'TBD',
    end: e.eventDate ? new Date(e.eventDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) : 'TBD',
    participants: `${e.participants?.length || 0}/${e.totalSlots || '∞'}`,
    type: e.participationType === 'team' ? 'Team' : 'Individual',
    coCount: e.coordinators?.length || 0
  }));

  const mockNotifications = [];

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'CO';

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-800">⚡</span>
          <span className="text-base font-bold text-gray-900 tracking-tight hidden sm:block">SMART Event Manager</span>
          <span className="text-base font-bold text-gray-900 tracking-tight sm:hidden">SmartEvent</span>
          <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md border border-gray-200 uppercase tracking-wider">Coordinator</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <span className="text-lg">🔔</span>
            <span className="absolute top-0 right-0 bg-gray-800 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">4</span>
          </div>
          <div className="flex items-center gap-2 border-l border-gray-200 pl-3 sm:pl-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-800 leading-tight">{user?.name || 'Coordinator'}</p>
              <p className="text-xs text-gray-500">Coordinator</p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-700 border border-gray-300">
              {initials}
            </div>
          </div>
          <button onClick={handleLogout} className="ml-1 sm:ml-2 text-xs font-bold text-gray-500 hover:text-gray-800 py-1.5 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-200">
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Quick Actions & Welcome */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Coordinator Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your assigned events and review participant data.</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button onClick={() => alert("Refreshing data...")} className="flex-1 sm:flex-none px-4 py-2 bg-white text-gray-700 text-xs sm:text-sm font-semibold border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
              ↻ Refresh Data
            </button>
            <button onClick={() => navigate("/coordinator-events")} className="flex-1 sm:flex-none px-4 py-2 bg-gray-800 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm hover:bg-gray-900 transition-colors">
              View All Events
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          {mockStats.map(stat => <StatCard key={stat.id} {...stat} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Events Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Assigned Events</h2>
              <span className="text-xs font-semibold text-gray-400 bg-white border border-gray-200 px-2 py-1 rounded-md">
                Showing {mockEvents.length} events
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mockEvents.map(event => <EventCard key={event.id} event={event} navigate={navigate} />)}
            </div>
          </div>

          {/* Notifications Sidebar */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Notifications</h2>
              <button className="text-xs text-gray-500 hover:text-gray-800 font-semibold bg-white border border-gray-200 px-2 py-1 rounded-md transition-colors">
                Mark all read
              </button>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 min-h-[300px]">
              {mockNotifications.map(notif => <NotificationItem key={notif.id} notif={notif} />)}
              {mockNotifications.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-10">No new notifications</p>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-gray-400 font-medium">
          © 2026 SMART Event Manager. Coordinator Portal.
        </div>
      </footer>
    </div>
  );
};

export default CoordinatorDashboard;
