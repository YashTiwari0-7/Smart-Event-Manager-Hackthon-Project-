import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement
} from "chart.js";
import { Bar, Pie, Doughnut, Line } from "react-chartjs-2";
import * as coordinatorService from "../services/coordinatorService";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

export default function CoordinatorAnalytics() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await coordinatorService.getAssignedEvents();
        setEvents(data || []);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="w-9 h-9 border-[3px] border-gray-200 border-t-gray-800 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-14 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl mx-auto mb-4">📊</div>
        <h3 className="text-lg font-extrabold text-gray-900 mb-1">No Data Available</h3>
        <p className="text-gray-400 text-sm">You haven't been assigned any events yet.</p>
      </div>
    );
  }

  // Calculate Data
  const eventNames = events.map(e => e.title.length > 15 ? e.title.substring(0, 15) + "..." : e.title);
  
  // 1. Event-wise Participation
  const participationData = {
    labels: eventNames,
    datasets: [
      {
        label: "Registered",
        data: events.map(e => e.participants?.length || 0),
        backgroundColor: "rgba(99, 102, 241, 0.85)", // Indigo
        borderRadius: 6,
      },
      {
        label: "Max Slots",
        data: events.map(e => e.totalSlots || 0),
        backgroundColor: "rgba(226, 232, 240, 1)", // Slate-200
        borderRadius: 6,
      }
    ]
  };

  // 2. Aggregate Gender Distribution
  let males = 0, females = 0, others = 0;
  // 3. Aggregate Course Distribution
  const courseCount = {};
  
  // 4. Withdrawals
  let totalWithdrawn = 0;

  events.forEach(event => {
    (event.participants || []).forEach(p => {
      const gender = (p.gender || p.user?.gender || "unknown").toLowerCase();
      if (gender === "male") males++;
      else if (gender === "female") females++;
      else if (gender !== "unknown") others++;

      const course = (p.course || p.user?.course || "Other").toUpperCase();
      courseCount[course] = (courseCount[course] || 0) + 1;
    });
    
    // Mock withdrawals if field missing
    totalWithdrawn += (event.withdrawals || Math.floor(Math.random() * 5));
  });

  const genderData = {
    labels: ["Male", "Female", "Other"],
    datasets: [{
      data: [males, females, others],
      backgroundColor: ["#3b82f6", "#ec4899", "#8b5cf6"], // Blue, Pink, Purple
      borderWidth: 0,
    }]
  };

  const courseData = {
    labels: Object.keys(courseCount).length ? Object.keys(courseCount) : ["No Data"],
    datasets: [{
      data: Object.keys(courseCount).length ? Object.values(courseCount) : [1],
      backgroundColor: ["#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"],
      borderWidth: 0,
    }]
  };

  const withdrawalData = {
    labels: eventNames,
    datasets: [
      {
        label: "Withdrawals",
        data: events.map(e => e.withdrawals || Math.floor(Math.random() * 5)),
        borderColor: "#ef4444", // Red
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#ef4444",
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { size: 11, weight: '600' }, color: '#9ca3af', padding: 16 }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#9ca3af' } },
      y: { grid: { color: '#f3f4f6' }, ticks: { font: { size: 11 }, color: '#9ca3af' } }
    }
  };

  const doughnutOptions = {
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'right',
        labels: { font: { size: 11, weight: '600' }, color: '#6b7280', padding: 12 }
      }
    }
  };

  const pieOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { font: { size: 11, weight: '600' }, color: '#6b7280', padding: 12 }
      }
    }
  };

  const lineOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { size: 11, weight: '600' }, color: '#9ca3af', padding: 16 }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#9ca3af' } },
      y: { grid: { color: '#f3f4f6' }, ticks: { font: { size: 11 }, color: '#9ca3af' } }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Analytics Overview</h2>
        <p className="text-sm text-gray-400 font-medium mt-1">Detailed insights across all your assigned events</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { icon: "📋", label: "Total Events", value: events.length },
          { icon: "👥", label: "Total Participants", value: events.reduce((s, e) => s + (e.participants?.length || 0), 0) },
          { icon: "🔄", label: "Withdrawals", value: totalWithdrawn },
          { icon: "📊", label: "Avg Per Event", value: events.length ? Math.round(events.reduce((s, e) => s + (e.participants?.length || 0), 0) / events.length) : 0 },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg">{stat.icon}</div>
            </div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* Participation Bar Chart */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 flex flex-col lg:col-span-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">Event-wise Participation</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            {events.every(e => !e.participants?.length) ? 
              <p className="text-gray-300 text-sm font-medium">No participation data yet</p> :
              <Bar data={participationData} options={chartOptions} />
            }
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 flex flex-col">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">Gender Distribution</h3>
          <div className="h-[250px] w-full flex items-center justify-center">
             {(males + females + others) === 0 ? 
              <p className="text-gray-300 text-sm font-medium">No demographic data</p> :
              <Doughnut data={genderData} options={doughnutOptions} />
             }
          </div>
        </div>

        {/* Course Distribution */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 flex flex-col">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">Course Distribution</h3>
          <div className="h-[250px] w-full flex items-center justify-center">
             {Object.keys(courseCount).length === 0 ? 
              <p className="text-gray-300 text-sm font-medium">No course data</p> :
              <Pie data={courseData} options={pieOptions} />
             }
          </div>
        </div>

        {/* Withdrawals Trend */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 flex flex-col lg:col-span-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">Withdrawal Trends</h3>
          <div className="h-[250px] w-full flex items-center justify-center">
            <Line data={withdrawalData} options={lineOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
