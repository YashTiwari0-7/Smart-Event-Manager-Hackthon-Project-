import React from "react";
import "./EventCard.css";

const StarRating = ({ rating }) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= Math.round(rating) ? "filled" : "empty"}`}
        >
          ★
        </span>
      ))}
      <span className="rating-num">{rating}</span>
    </div>
  );
};

const EventCard = ({ event }) => {
  return (
    <div className="event-card">
      <div className="event-card-header">
        <div className="event-category-badge">{event.category}</div>
        <span className={`status-badge ${event.status === "Live" ? "live" : "closed"}`}>
          {event.status === "Live" && <span className="live-dot" />}
          {event.status}
        </span>
      </div>
      <h3 className="event-name">{event.name}</h3>
      <div className="event-meta">
        <span className="event-date">📅 {event.date}</span>
        <span className="event-participants">👥 {event.participants.toLocaleString()} participants</span>
      </div>
      <StarRating rating={event.rating} />
    </div>
  );
};

export default EventCard;
