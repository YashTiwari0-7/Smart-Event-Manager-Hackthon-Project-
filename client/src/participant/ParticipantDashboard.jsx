import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as participantService from "../services/participantService";

/* ─────────────── Mock Data ─────────────────────── */
const mockUser = {
  name: "Rahul Dwivedi",
  course: "BCA",
  semester: "Semester 3",
  college: "Dev Bhoomi Uttarakhand University",
  avatar: "RD",
  rollNo: "22BCA0341",
  joinedDate: "August 2023",
};

const mockStats = [
  { icon: "📅", label: "Events Joined",    value: "12", trend: "+2 this month" },
  { icon: "🔴", label: "Ongoing Events",   value: "3",  trend: "Active now"    },
  { icon: "✅", label: "Completed Events", value: "8",  trend: "67% rate"      },
  { icon: "🏆", label: "Achievements",     value: "4",  trend: "2 pending"     },
];

const mockEvents = [
  { id: 1, name: "TechSummit 2025",      type: "Team",       status: "Ongoing",  date: "Apr 28, 2025", venue: "Main Auditorium",  category: "Technology", seats: 12 },
  { id: 2, name: "AI & ML Workshop",     type: "Individual", status: "Upcoming", date: "May 3, 2025",  venue: "Lab Block B",      category: "Technology", seats: 45 },
  { id: 3, name: "Pitch Night",          type: "Team",       status: "Upcoming", date: "May 10, 2025", venue: "Innovation Hub",   category: "Business",   seats: 30 },
  { id: 4, name: "Design Masterclass",   type: "Individual", status: "Ongoing",  date: "Apr 26, 2025", venue: "Room 204",         category: "Design",     seats: 8  },
  { id: 5, name: "Leadership Bootcamp",  type: "Individual", status: "Upcoming", date: "May 15, 2025", venue: "Seminar Hall",     category: "Education",  seats: 60 },
];

const mockNotifications = [
  { id: 1, icon: "⏰", text: "Registration for 'Leadership Summit' closes in 2 days.", time: "2 hours ago",  unread: true  },
  { id: 2, icon: "👥", text: "Team invite for 'Pitch Night' from Priya Sharma.",       time: "5 hours ago",  unread: true  },
  { id: 3, icon: "🏆", text: "Results declared for 'Code Sprint 2025'. Check now!",    time: "Yesterday",    unread: false },
  { id: 4, icon: "📜", text: "Certificate for 'Design Hackathon' is ready to download.", time: "2 days ago", unread: false },
];

const mockActivity = [
  { id: 1, action: "Registered for TechSummit 2025",        date: "Apr 20, 2025", icon: "📝" },
  { id: 2, action: "Completed AI & ML Pre-Assessment",       date: "Apr 18, 2025", icon: "✅" },
  { id: 3, action: "Joined team 'InnoBuilders' for Pitch Night", date: "Apr 15, 2025", icon: "👥" },
  { id: 4, action: "Won 1st place in Code Sprint 2025",      date: "Apr 10, 2025", icon: "🏆" },
  { id: 5, action: "Downloaded Design Hackathon certificate", date: "Apr 8, 2025",  icon: "📜" },
];

const mockAchievements = [
  { id: 1, title: "First Win",       desc: "Won your first event",          icon: "🥇", earned: true  },
  { id: 2, title: "Team Player",     desc: "Joined 3 team events",          icon: "🤝", earned: true  },
  { id: 3, title: "Consistent",      desc: "Attended 10+ events",           icon: "📈", earned: true  },
  { id: 4, title: "Top Performer",   desc: "Win 5 events",                  icon: "🌟", earned: false },
  { id: 5, title: "Certified Pro",   desc: "Download 3+ certificates",      icon: "📜", earned: false },
];

/* ─────────────── Sub-components ─────────────────── */

const DashNavbar = ({ onLogout }) => (
  <nav className="bg-white border-b border-gray-200 px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
    <div className="flex items-center gap-2">
      <span className="text-lg font-bold text-gray-800">⚡</span>
      <span className="text-base font-bold text-gray-900 tracking-tight">
        Smart<span className="text-gray-500">Event</span>
      </span>
      <span className="hidden sm:inline ml-2 text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full border border-gray-200">
        Participant
      </span>
    </div>
    <div className="flex items-center gap-3">
      <div className="hidden sm:block text-right">
        <p className="text-sm font-semibold text-gray-800 leading-tight">{mockUser.name}</p>
        <p className="text-xs text-gray-400">{mockUser.course} · {mockUser.semester}</p>
      </div>
      <div className="w-9 h-9 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-sm font-bold text-gray-700 shrink-0">
        {mockUser.avatar}
      </div>
      <button
        onClick={onLogout}
        className="text-xs font-semibold text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-all bg-gray-50 hover:bg-gray-100"
      >
        Logout
      </button>
    </div>
  </nav>
);

const StatCard = ({ icon, label, value, trend }) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3 hover:shadow-md hover:border-gray-200 transition-all">
    <div className="flex items-center justify-between">
      <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center text-xl border border-gray-200">
        {icon}
      </div>
      <span className="text-xs text-gray-400 font-medium bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">{trend}</span>
    </div>
    <div>
      <p className="text-2xl font-extrabold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mt-0.5">{label}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    Ongoing:  "bg-gray-900 text-white",
    Upcoming: "bg-gray-100 text-gray-600 border border-gray-300",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${styles[status] || "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
};

const CategoryPill = ({ category }) => (
  <span className="text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
    {category}
  </span>
);

const EventCard = ({ event, onView }) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-300 transition-all flex flex-col gap-3">
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-gray-900 leading-tight truncate">{event.name}</h3>
        <CategoryPill category={event.category} />
      </div>
      <StatusBadge status={event.status} />
    </div>
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
      <span className="flex items-center gap-1"><span>📍</span>{event.venue}</span>
      <span className="flex items-center gap-1"><span>📅</span>{event.date}</span>
      <span className="flex items-center gap-1"><span>{event.type === "Team" ? "👥" : "👤"}</span>{event.type}</span>
    </div>
    <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-gray-50">
      <span>{event.seats} seats left</span>
    </div>
    <button onClick={() => onView && onView(event)} className="mt-auto w-full py-2 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-xl transition-all">
      View Details
    </button>
  </div>
);

const NotificationItem = ({ notif }) => (
  <div className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${notif.unread ? "bg-gray-50 border border-gray-200" : "bg-white border border-gray-100"}`}>
    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-lg shrink-0 border border-gray-200">
      {notif.icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-700 leading-snug">{notif.text}</p>
      <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
    </div>
    {notif.unread && <div className="w-2 h-2 rounded-full bg-gray-800 mt-1.5 shrink-0" />}
  </div>
);

const ActivityItem = ({ item, isLast }) => (
  <div className="flex gap-3">
    <div className="flex flex-col items-center">
      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-base border border-gray-200 shrink-0">
        {item.icon}
      </div>
      {!isLast && <div className="w-px flex-1 bg-gray-100 mt-1" />}
    </div>
    <div className="pb-4 flex-1">
      <p className="text-sm text-gray-700 font-medium leading-snug">{item.action}</p>
      <p className="text-xs text-gray-400 mt-0.5">{item.date}</p>
    </div>
  </div>
);

const AchievementBadge = ({ badge }) => (
  <div className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${badge.earned ? "bg-white border-gray-200 shadow-sm" : "bg-gray-50 border-gray-100 opacity-50"}`}>
    <span className={`text-2xl ${badge.earned ? "" : "grayscale"}`}>{badge.icon}</span>
    <div className="text-center">
      <p className="text-xs font-bold text-gray-800 leading-tight">{badge.title}</p>
      <p className="text-xs text-gray-400 leading-tight mt-0.5">{badge.desc}</p>
    </div>
    {badge.earned && (
      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
        Earned
      </span>
    )}
  </div>
);

/* ─────────────── Event Detail Modal ─────────────── */
const EventDetailModal = ({ event, onClose }) => {
  if (!event) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-md p-6 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">{event.name}</h2>
            <span className="inline-block mt-1 text-xs font-medium text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">{event.category}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-lg leading-none">✕</button>
        </div>
        {/* Details */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Date",   value: event.date,   icon: "📅" },
            { label: "Venue",  value: event.venue,  icon: "📍" },
            { label: "Type",   value: event.type,   icon: event.type === "Team" ? "👥" : "👤" },
            { label: "Status", value: event.status, icon: "🔴" },
            { label: "Seats Left", value: event.seats, icon: "🎟️" },
          ].map(d => (
            <div key={d.label} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
              <p className="text-xs text-gray-400 font-medium">{d.icon} {d.label}</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">{d.value}</p>
            </div>
          ))}
        </div>
        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {event.status === 'Completed' ? (
            <button disabled className="flex-1 py-2.5 text-sm font-semibold text-gray-500 bg-gray-100 rounded-xl cursor-not-allowed">
              Event Completed
            </button>
          ) : event.isRegistered ? (
            <button 
              onClick={async () => {
                if (!window.confirm("Are you sure you want to withdraw from this event?")) return;
                try {
                  await participantService.withdrawFromEvent(event.id);
                  alert('Withdrawn successfully! Please refresh to update your dashboard.');
                  onClose();
                  window.location.reload();
                } catch (err) {
                  alert(err.response?.data?.message || 'Withdrawal failed');
                }
              }}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all"
            >
              Withdraw
            </button>
          ) : (
            <button 
              onClick={async () => {
                try {
                  await participantService.registerForEvent(event.id);
                  alert('Registered successfully! Please refresh to update your dashboard.');
                  onClose();
                  window.location.reload();
                } catch (err) {
                  alert(err.response?.data?.message || 'Registration failed');
                }
              }}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-all"
            >
              Register Now
            </button>
          )}
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all">Close</button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────── Main Dashboard ─────────────────── */
const ParticipantDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [activeSection, setActiveSection] = useState("overview");
  const [notifOpen, setNotifOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsData, historyData] = await Promise.all([
          participantService.getAvailableEvents(),
          participantService.getHistory()
        ]);
        setEvents((eventsData || []).map(e => ({
          id: e._id, name: e.title, type: e.participationType === 'team' ? 'Team' : 'Individual',
          status: e.status === 'ongoing' ? 'Ongoing' : 'Upcoming',
          date: e.eventDate ? new Date(e.eventDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'TBD',
          venue: 'Campus', category: 'Event',
          seats: (e.totalSlots || 0) - (e.participants?.length || 0)
        })));
        setHistory(historyData || []);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const mockUser = {
    name: user?.name || 'Participant', avatar: user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'P',
    course: user?.course || '', semester: '', college: user?.institution || user?.institutionName || '',
    rollNo: user?.email || '', joinedDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''
  };

  const mockEvents = events;
  const mockStats = [
    { icon: "📅", label: "Events Available", value: String(events.length), trend: "Browse" },
    { icon: "🔴", label: "History", value: String(history.length), trend: "Past events" },
    { icon: "✅", label: "Registered", value: String(events.filter(e => e.status === 'Ongoing').length), trend: "Active" },
    { icon: "🏆", label: "Achievements", value: "0", trend: "Earn more" },
  ];
  const mockNotifications = [];
  const mockActivity = (history || []).slice(0, 5).map((h, i) => ({
    id: i, action: `Event: ${h.title || h.eventId || 'Event'}`, date: h.createdAt ? new Date(h.createdAt).toLocaleDateString() : '', icon: '📝'
  }));
  const mockAchievements = [
    { id: 1, title: "Explorer", desc: "Join your first event", icon: "🌟", earned: history.length > 0 },
    { id: 2, title: "Team Player", desc: "Join 3 team events", icon: "🤝", earned: false },
  ];

  const filteredEvents = activeTab === "all"
    ? mockEvents
    : mockEvents.filter(e => e.status.toLowerCase() === activeTab);

  const myRegisteredEvents = history.map(h => ({
    id: h.event?._id,
    name: h.event?.title,
    type: h.event?.participationType === 'team' ? 'Team' : 'Individual',
    status: h.event?.status === 'ongoing' ? 'Ongoing' : h.event?.status === 'completed' ? 'Completed' : 'Upcoming',
    date: h.event?.eventDate ? new Date(h.event?.eventDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'TBD',
    venue: 'Campus', category: 'Registered',
    seats: 0,
    isRegistered: true,
    registrationStatus: h.status
  }));

  const activeMyEvents = myRegisteredEvents.filter(e => e.status !== 'Completed' && e.registrationStatus !== 'withdrawn');
  const pastMyEvents = myRegisteredEvents.filter(e => e.status === 'Completed' && e.registrationStatus !== 'withdrawn');

  const unreadCount = 0;
  const handleLogout = () => { logout(); navigate("/"); };

  const sideNav = [
    { id: "overview",      label: "Overview",       icon: "🏠" },
    { id: "events",        label: "My Events",      icon: "📅" },
    { id: "past",          label: "Past Events",    icon: "⏪" },
    { id: "achievements",  label: "Achievements",   icon: "🏆" },
    { id: "activity",      label: "Activity Log",   icon: "📋" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Navbar */}
      <DashNavbar onLogout={handleLogout} />

      {/* Event Detail Modal */}
      <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">

          {/* ── Left Sidebar Nav ── */}
          <aside className="hidden lg:flex flex-col gap-1 w-52 shrink-0">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center text-lg font-extrabold text-gray-700">
                {mockUser.avatar}
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900">{mockUser.name}</p>
                <p className="text-xs text-gray-400">{mockUser.rollNo}</p>
                <p className="text-xs text-gray-400">{mockUser.course} · {mockUser.semester}</p>
              </div>
              <div className="w-full text-center text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-xl py-1.5">
                Joined {mockUser.joinedDate}
              </div>
            </div>

            {/* Nav Links */}
            {sideNav.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeSection === item.id
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}

            <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
              <button
                onClick={() => navigate("/events")}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all w-full"
              >
                <span>🔍</span> Browse Events
              </button>
              <button
                onClick={() => navigate("/certificates")}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all w-full"
              >
                <span>📜</span> Certificates
              </button>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <main className="flex-1 min-w-0 space-y-6">

            {/* Welcome Banner */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-extrabold text-gray-900">
                  Welcome back, {mockUser.name.split(" ")[0]} 👋
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  {mockUser.college} · {mockUser.course} · {mockUser.semester}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative w-9 h-9 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all"
                  >
                    <span className="text-base">🔔</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 top-11 w-80 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 p-3 space-y-2">
                      <div className="flex items-center justify-between px-1 pb-2 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Notifications</p>
                        <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-700 text-sm">✕</button>
                      </div>
                      {mockNotifications.map(n => (
                        <NotificationItem key={n.id} notif={n} />
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
                  <span>📅</span>
                  <span className="font-medium">
                    {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long" })}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Overview</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {mockStats.map(s => <StatCard key={s.label} {...s} />)}
              </div>
            </div>

            {/* Mobile Quick Nav */}
            <div className="flex lg:hidden gap-2 overflow-x-auto pb-1">
              {sideNav.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                    activeSection === item.id
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>

            {/* ── Section: Overview ── */}
            {activeSection === "overview" && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Events column */}
                <div className="xl:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Events</h2>
                    <button
                      onClick={() => navigate("/events")}
                      className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
                    >
                      Browse all →
                    </button>
                  </div>

                  <div className="flex gap-2">
                    {["all", "ongoing", "upcoming"].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all border ${
                          activeTab === tab
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredEvents.map(event => <EventCard key={event.id} event={event} onView={setSelectedEvent} />)}
                    {filteredEvents.length === 0 && (
                      <div className="col-span-2 text-center py-12 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
                        No events for this filter.
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <div>
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h2>
                    <div className="space-y-3">
                      {[
                        { icon: "🔍", label: "Browse Events",   sub: "Discover & register", path: "/events"       },
                        { icon: "📜", label: "My Certificates", sub: "View & download",     path: "/certificates" },
                        { icon: "🏠", label: "Go to Home",      sub: "Back to landing",     path: "/"             },
                      ].map(action => (
                        <button
                          key={action.label}
                          onClick={() => navigate(action.path)}
                          className="w-full flex items-center gap-3 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-2xl px-4 py-3.5 transition-all shadow-sm group"
                        >
                          <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-lg group-hover:bg-gray-200 transition-colors border border-gray-200">
                            {action.icon}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-gray-900">{action.label}</p>
                            <p className="text-xs text-gray-400">{action.sub}</p>
                          </div>
                          <span className="ml-auto text-gray-400 text-sm">→</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notifications Panel */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Notifications</h2>
                      {unreadCount > 0 && (
                        <span className="text-xs bg-gray-900 text-white font-bold px-2 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {mockNotifications.map(n => <NotificationItem key={n.id} notif={n} />)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Section: My Events ── */}
            {activeSection === "events" && (
              <div className="space-y-4">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">My Registered Events</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeMyEvents.map(event => <EventCard key={event.id} event={event} onView={setSelectedEvent} />)}
                  {activeMyEvents.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
                      You haven't registered for any active events yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Section: Past Events ── */}
            {activeSection === "past" && (
              <div className="space-y-4">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Past Participation</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pastMyEvents.map(event => <EventCard key={event.id} event={event} onView={setSelectedEvent} />)}
                  {pastMyEvents.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
                      No past event participation found.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Section: Achievements ── */}
            {activeSection === "achievements" && (
              <div className="space-y-4">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Achievements & Badges</h2>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900">Your Badges</p>
                      <p className="text-xs text-gray-400">{mockAchievements.filter(a => a.earned).length} of {mockAchievements.length} earned</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                        <div
                          className="h-full bg-gray-800 rounded-full transition-all"
                          style={{ width: `${(mockAchievements.filter(a => a.earned).length / mockAchievements.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 font-semibold">
                        {Math.round((mockAchievements.filter(a => a.earned).length / mockAchievements.length) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {mockAchievements.map(badge => <AchievementBadge key={badge.id} badge={badge} />)}
                  </div>
                </div>

                {/* Stats summary */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Events Won",     value: "4",  icon: "🏆" },
                    { label: "Certificates",   value: "3",  icon: "📜" },
                    { label: "Teams Joined",   value: "5",  icon: "👥" },
                  ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                      <div className="text-2xl mb-2">{s.icon}</div>
                      <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Section: Activity Log ── */}
            {activeSection === "activity" && (
              <div className="space-y-4">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Activity Log</h2>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <p className="text-sm font-bold text-gray-900 mb-4">Recent Activity</p>
                  <div className="space-y-0">
                    {mockActivity.map((item, idx) => (
                      <ActivityItem key={item.id} item={item} isLast={idx === mockActivity.length - 1} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-4 pb-2 border-t border-gray-100">
              <p className="text-xs text-gray-400">© 2025 SmartEvent Platform · Participant Portal</p>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
};

export default ParticipantDashboard;
