import React from "react";
import "./CoordinatorCard.css";

const StarMini = ({ rating }) => (
  <span className="coord-rating">
    ★ <strong>{rating}</strong>
  </span>
);

const CoordinatorCard = ({ coordinator }) => {
  return (
    <div className="coordinator-card">
      <div
        className="coord-avatar"
        style={{ background: coordinator.color }}
      >
        {coordinator.avatar}
      </div>
      <div className="coord-info">
        <p className="coord-name">{coordinator.name}</p>
        <p className="coord-events">{coordinator.eventsHandled} events handled</p>
      </div>
      <StarMini rating={coordinator.rating} />
    </div>
  );
};

export default CoordinatorCard;
