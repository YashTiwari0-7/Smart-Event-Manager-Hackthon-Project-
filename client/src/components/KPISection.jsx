import React from "react";
import "./KPISection.css";

const KPICard = ({ stat }) => {
  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <div className="kpi-icon-wrap">{stat.icon}</div>
        <span className={`kpi-change ${stat.positive ? "positive" : "negative"}`}>
          {stat.positive ? "▲" : "▼"} {stat.change}
        </span>
      </div>
      <div className="kpi-value">{stat.value}</div>
      <div className="kpi-label">{stat.label}</div>
    </div>
  );
};

const KPISection = ({ stats }) => {
  return (
    <div className="kpi-grid">
      {stats.map((stat) => (
        <KPICard key={stat.id} stat={stat} />
      ))}
    </div>
  );
};

export default KPISection;
