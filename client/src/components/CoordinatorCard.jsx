import React from "react";
import "./CoordinatorCard.css";

const CoordinatorCard = ({ coordinator }) => {
  // Support both legacy props (avatar, color, eventsHandled) and backend shape (name, email, events)
  const name = coordinator.name || "Unknown";
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const eventsCount = coordinator.eventsHandled || coordinator.events || 0;

  return (
    <div className="coordinator-card">
      <div className="coord-avatar">
        {coordinator.avatar || initials}
      </div>
      <div className="coord-info">
        <p className="coord-name">{name}</p>
        <p className="coord-events">{eventsCount} events handled</p>
      </div>
      {coordinator.rating && (
        <span className="coord-rating">
          ★ <strong>{coordinator.rating}</strong>
        </span>
      )}
    </div>
  );
};

export default CoordinatorCard;
