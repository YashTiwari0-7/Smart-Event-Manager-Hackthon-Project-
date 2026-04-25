// ─── KPI Stats ───────────────────────────────────────────────────────────────
export const kpiStats = [
  {
    id: 1,
    label: "Total Events",
    value: 124,
    icon: "📅",
    change: "+12%",
    positive: true,
  },
  {
    id: 2,
    label: "Live Events",
    value: 8,
    icon: "🔴",
    change: "+3",
    positive: true,
  },
  {
    id: 3,
    label: "Total Participants",
    value: "18,540",
    icon: "👥",
    change: "+8.4%",
    positive: true,
  },
  {
    id: 4,
    label: "Avg Participants/Event",
    value: 149,
    icon: "📊",
    change: "-2.1%",
    positive: false,
  },
];

// ─── Events ──────────────────────────────────────────────────────────────────
export const events = [
  {
    id: 1,
    name: "TechSummit 2025",
    status: "Live",
    participants: 1240,
    rating: 4.8,
    date: "Apr 28, 2025",
    category: "Technology",
  },
  {
    id: 2,
    name: "Design Masterclass",
    status: "Live",
    participants: 430,
    rating: 4.6,
    date: "Apr 30, 2025",
    category: "Design",
  },
  {
    id: 3,
    name: "Startup Pitch Night",
    status: "Closed",
    participants: 870,
    rating: 4.2,
    date: "Apr 15, 2025",
    category: "Business",
  },
  {
    id: 4,
    name: "AI & ML Workshop",
    status: "Closed",
    participants: 560,
    rating: 4.9,
    date: "Apr 10, 2025",
    category: "Technology",
  },
  {
    id: 5,
    name: "Leadership Bootcamp",
    status: "Closed",
    participants: 320,
    rating: 4.4,
    date: "Apr 5, 2025",
    category: "Education",
  },
];

// ─── Coordinators ────────────────────────────────────────────────────────────
export const coordinators = [
  {
    id: 1,
    name: "Priya Sharma",
    avatar: "PS",
    eventsHandled: 32,
    rating: 4.9,
    color: "#2563EB",
  },
  {
    id: 2,
    name: "Arjun Mehta",
    avatar: "AM",
    eventsHandled: 28,
    rating: 4.7,
    color: "#7C3AED",
  },
  {
    id: 3,
    name: "Nisha Patel",
    avatar: "NP",
    eventsHandled: 24,
    rating: 4.6,
    color: "#059669",
  },
  {
    id: 4,
    name: "Rohan Gupta",
    avatar: "RG",
    eventsHandled: 19,
    rating: 4.4,
    color: "#D97706",
  },
];

// ─── Pending Requests ────────────────────────────────────────────────────────
export const pendingRequests = [
  {
    id: 1,
    name: "Sneha Kapoor",
    email: "sneha.kapoor@email.com",
    role: "Event Coordinator",
    applied: "Apr 24, 2025",
  },
  {
    id: 2,
    name: "Vikram Singh",
    email: "vikram.singh@email.com",
    role: "Logistics Manager",
    applied: "Apr 23, 2025",
  },
  {
    id: 3,
    name: "Meera Joshi",
    email: "meera.joshi@email.com",
    role: "Event Coordinator",
    applied: "Apr 22, 2025",
  },
];

// ─── Analytics Data ──────────────────────────────────────────────────────────
export const registrationsOverTime = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
  data: [820, 1200, 980, 1540, 1890, 2100, 1760, 2430],
};

export const participantsPerEvent = {
  labels: [
    "TechSummit",
    "Design MC",
    "Pitch Night",
    "AI Workshop",
    "Leadership",
  ],
  data: [1240, 430, 870, 560, 320],
};
