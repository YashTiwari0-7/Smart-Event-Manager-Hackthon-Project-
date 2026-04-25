import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
// Fallback chart data (will be replaced when analytics API is connected)
const registrationsOverTime = { labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], data: [0, 0, 0, 0, 0, 0] };
const participantsPerEvent = { labels: ["Event 1", "Event 2", "Event 3", "Event 4", "Event 5"], data: [0, 0, 0, 0, 0] };
import "./AnalyticsCharts.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const sharedOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#0f172a",
      titleColor: "#fff",
      bodyColor: "#94a3b8",
      padding: 10,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: "#94a3b8", font: { size: 12 } },
    },
    y: {
      grid: { color: "#f1f5f9" },
      ticks: { color: "#94a3b8", font: { size: 12 } },
    },
  },
};

const lineData = {
  labels: registrationsOverTime.labels,
  datasets: [
    {
      label: "Registrations",
      data: registrationsOverTime.data,
      borderColor: "#2563eb",
      backgroundColor: "rgba(37, 99, 235, 0.08)",
      borderWidth: 2.5,
      pointRadius: 4,
      pointBackgroundColor: "#2563eb",
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      tension: 0.4,
      fill: true,
    },
  ],
};

const barData = {
  labels: participantsPerEvent.labels,
  datasets: [
    {
      label: "Participants",
      data: participantsPerEvent.data,
      backgroundColor: [
        "rgba(37, 99, 235, 0.85)",
        "rgba(124, 58, 237, 0.75)",
        "rgba(5, 150, 105, 0.75)",
        "rgba(217, 119, 6, 0.75)",
        "rgba(239, 68, 68, 0.75)",
      ],
      borderRadius: 6,
      borderSkipped: false,
    },
  ],
};

const AnalyticsCharts = () => {
  return (
    <div className="charts-grid">
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Registrations Over Time</h3>
            <p className="chart-subtitle">Monthly registration trends</p>
          </div>
          <span className="chart-badge">2025</span>
        </div>
        <div className="chart-body">
          <Line data={lineData} options={sharedOptions} />
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Participants per Event</h3>
            <p className="chart-subtitle">Top 5 recent events</p>
          </div>
          <span className="chart-badge">Events</span>
        </div>
        <div className="chart-body">
          <Bar data={barData} options={sharedOptions} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
