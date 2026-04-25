import React from "react";
import "./RequestItem.css";

const RequestItem = ({ request }) => {
  return (
    <div className="request-item">
      <div className="request-avatar">
        {request.name.split(" ").map((n) => n[0]).join("")}
      </div>
      <div className="request-info">
        <p className="request-name">{request.name}</p>
        <p className="request-email">{request.email}</p>
        <span className="request-role">{request.role}</span>
      </div>
      <div className="request-meta">
        <p className="request-date">{request.applied}</p>
        <div className="request-actions">
          <button className="btn-approve">Approve</button>
          <button className="btn-reject">Reject</button>
        </div>
      </div>
    </div>
  );
};

export default RequestItem;
