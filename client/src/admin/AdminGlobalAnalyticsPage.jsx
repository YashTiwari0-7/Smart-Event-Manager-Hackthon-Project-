import React from "react";
import { useNavigate } from "react-router-dom";

// --- MOCK DATA ---
const globalStats = {
  totalParticipants: 4520,
  totalEvents: 18,
  growthRate: "+12.5%",
  avgParticipants: 251,
};

const registrationTrends = [
  { date: "Oct", count: 320 },
  { date: "Nov", count: 450 },
  { date: "Dec", count: 410 },
  { date: "Jan", count: 680 },
  { date: "Feb", count: 850 },
  { date: "Mar", count: 910 },
  { date: "Apr", count: 1200 },
];

const eventPerformances = [
  { id: 1, name: "Hackathon 2026", participants: 1200 },
  { id: 2, name: "AI Summit", participants: 850 },
  { id: 3, name: "Web3 Developer Sprint", participants: 680 },
  { id: 4, name: "Design Workshop", participants: 450 },
  { id: 5, name: "Cyber BootCamp", participants: 320 },
  { id: 6, name: "Cloud Basics", participants: 120 },
  { id: 7, name: "Data Ethics Seminar", participants: 85 },
  { id: 8, name: "Resume Review", participants: 45 },
];

const insights = [
  { id: 1, icon: "🔥", title: "Most Popular Event", text: "Hackathon 2026 drew the highest registration volume to date (1,200 users)." },
  { id: 2, icon: "👑", title: "Top Coordinator", text: "Rachel Zane successfully managed events with over 2,100 combined participants." },
  { id: 3, icon: "⏰", title: "Peak Activity Time", text: "8:00 PM on Fridays sees a 40% surge in platform registrations." },
];

// --- SUB-COMPONENTS ---
const StatCard = ({ title, value, subtitle, icon }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 group">
    <div className="flex justify-between items-start mb-4">
      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-xl border border-gray-100 group-hover:bg-gray-900 group-hover:text-white transition-colors">
        {icon}
      </div>
      {subtitle && (
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${subtitle.startsWith('+') ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {subtitle}
        </span>
      )}
    </div>
    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
    <p className="text-3xl font-extrabold text-gray-900">{value}</p>
  </div>
);

const ChartBlock = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count));
  
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Registration Volume</h3>
        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100">Last 7 Months</span>
      </div>
      
      <div className="flex-1 flex items-end justify-between gap-2 pt-4 border-l border-b border-gray-100 px-2 pb-2 relative min-h-[200px]">
        {/* Y-axis labels */}
        <div className="absolute left-2 top-0 h-full flex flex-col justify-between text-[10px] text-gray-300 font-medium pb-6 -ml-8">
          <span>{maxCount}</span>
          <span>{Math.round(maxCount / 2)}</span>
          <span>0</span>
        </div>

        {/* Bars */}
        {data.map((item, idx) => {
          const height = `${(item.count / maxCount) * 100}%`;
          return (
            <div key={idx} className="relative flex flex-col items-center flex-1 group h-full justify-end">
              <div className="absolute bottom-full mb-2 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                {item.count} users
              </div>
              <div 
                className="w-full max-w-[40px] bg-gray-200 group-hover:bg-blue-500 rounded-t-sm transition-colors duration-300 relative" 
                style={{ height }}
              >
                {/* Simulated line chart dot on top of bar */}
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-2 border-gray-900 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <span className="text-[10px] text-gray-500 mt-3 font-bold uppercase tracking-wider">{item.date}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const InsightCard = ({ insight }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex gap-4 items-start group hover:-translate-y-1 transition-transform duration-200">
    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl border border-gray-100 shrink-0">
      {insight.icon}
    </div>
    <div>
      <h4 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{insight.title}</h4>
      <p className="text-sm text-gray-500 leading-relaxed">{insight.text}</p>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
export default function AdminGlobalAnalyticsPage() {
  const navigate = useNavigate();

  // Derived Data
  const topEvents = [...eventPerformances].sort((a, b) => b.participants - a.participants).slice(0, 3);
  const bottomEvents = [...eventPerformances].sort((a, b) => a.participants - b.participants).slice(0, 3);
  const topChartEvents = [...eventPerformances].sort((a, b) => b.participants - a.participants).slice(0, 5);
  const maxEventParticipants = Math.max(...topChartEvents.map(e => e.participants));

  // Interaction Handlers
  const handleEventClick = (id) => {
    console.log(`Navigating to Event Detail for event ID: ${id}`);
  };

  const handleSeeAllClick = (type) => {
    console.log(`Navigating to list of all ${type}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-16">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between sticky top-0 z-40 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-800 transition-colors text-sm font-bold bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
            ← Dashboard
          </button>
          <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Global Analytics</h1>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full border border-blue-200 uppercase tracking-wider whitespace-nowrap">
            Live Intelligence
          </span>
          <button onClick={() => window.print()} className="w-full sm:w-auto text-xs font-bold text-gray-500 hover:text-gray-900 underline decoration-gray-300 underline-offset-4">
            Export PDF
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8 fade-in">
        
        {/* SECTION 1: OVERALL STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Users" value={globalStats.totalParticipants.toLocaleString()} subtitle={globalStats.growthRate} icon="👥" />
          <StatCard title="Total Events" value={globalStats.totalEvents} subtitle="Active" icon="📅" />
          <StatCard title="Avg Users / Event" value={globalStats.avgParticipants} subtitle="" icon="📊" />
          <StatCard title="System Health" value="99.9%" subtitle="+0.1%" icon="⚡" />
        </div>

        {/* SECTION 2 & 3: TRENDS & COMPARISONS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chart */}
          <div className="lg:col-span-2">
            <ChartBlock data={registrationTrends} />
          </div>

          {/* Top/Bottom Comparisons */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Performance Extremes</h3>
              <button onClick={() => handleSeeAllClick("Events")} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider">See All</button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="p-5 border-b border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">🔥 Top 3 Events</p>
                <div className="space-y-3">
                  {topEvents.map((evt, i) => (
                    <div key={evt.id} onClick={() => handleEventClick(evt.id)} className="flex justify-between items-center cursor-pointer group">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-300 w-4">{i+1}.</span>
                        <span className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">{evt.name}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{evt.participants}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">🧊 Lowest Turnout</p>
                <div className="space-y-3">
                  {bottomEvents.map((evt, i) => (
                    <div key={evt.id} onClick={() => handleEventClick(evt.id)} className="flex justify-between items-center cursor-pointer group">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                        <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors line-clamp-1">{evt.name}</span>
                      </div>
                      <span className="text-xs font-medium text-gray-400">{evt.participants}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* SECTION 3B: HORIZONTAL BAR COMPARISON & SECTION 4: INSIGHTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Horizontal Bars */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">User Distribution per Event</h3>
            <div className="space-y-5">
              {topChartEvents.map(evt => {
                const width = `${(evt.participants / maxEventParticipants) * 100}%`;
                return (
                  <div key={evt.id} onClick={() => handleEventClick(evt.id)} className="cursor-pointer group">
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{evt.name}</span>
                      <span className="text-xs font-bold text-gray-500">{evt.participants} Users</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-gray-800 h-2.5 rounded-full group-hover:bg-blue-500 transition-colors duration-300" style={{ width }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={() => handleSeeAllClick("Events")} className="mt-6 w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold rounded-lg border border-gray-200 transition-colors uppercase tracking-wider">
              View Detailed Metrics
            </button>
          </div>

          {/* Smart Insights */}
          <div className="bg-transparent border border-dashed border-gray-300 rounded-xl p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xl">🧠</span>
              <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">AI-Generated Insights</h3>
            </div>
            <div className="space-y-4 flex-1">
              {insights.map(insight => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </div>

        </div>

      </main>

      <style>{`
        .fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
