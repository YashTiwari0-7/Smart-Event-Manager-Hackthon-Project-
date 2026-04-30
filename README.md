# 🚀 SMART Event Manager

A centralized web-based platform designed to streamline event management, participant registration, and data analytics for academic institutions.

---

## 📌 Problem Statement

In academic institutions, multiple events are conducted regularly with participants from within and outside the organization. Managing registrations, avoiding duplicates, and analyzing participation data becomes complex and inefficient.

**SMART Event Manager** solves this by providing a structured, scalable, and analytics-driven platform for handling events efficiently. 

---

## 🎯 Objective

To build a robust system that:

* Simplifies event creation and management
* Enables smooth participant registration (individual/team)
* Prevents duplicate entries
* Provides real-time analytics and insights
* Automates certificate generation

---

## 👥 User Roles

### 1. Master Admin

* Create, update, and delete events
* Manage coordinators
* Assign one or multiple coordinators to events
* Access event analytics (summary + detailed)
* View data through a visual dashboard

---

### 2. Event Coordinator

* Manage only assigned events
* Configure event settings:

  * Individual / Team participation
  * Registration open & close dates
  * Gender-based participation rules
* Prevent duplicate registrations
* View and filter participant data
* Mark winners
* Generate:

  * Participation Certificates
  * Achievement Certificates
* Visualize event statistics

---

### 3. Participant / Team

* Register or withdraw from events within allowed time
* Participate in individual or team events
* View participation history and stats
* Download certificates (participation & achievement)

---

## ⚙️ Core Features

### 🗂 Event Management

* Full CRUD operations for events
* Multi-coordinator assignment
* Configurable participation rules

### 🧾 Registration System

* Individual & team-based registration
* Validation (e.g., phone number constraints)
* Duplicate prevention logic

### 📊 Analytics Dashboard

* Event-wise participation stats
* Visual insights for admins & coordinators
* Real-time data tracking

### 🏆 Results & Certificates

* Winner marking system
* Automated certificate generation
* Downloadable certificates for users

### 🔄 Event Lifecycle Flow

1. **Open** – Event created
2. **Closed** – Registration ends
3. **Live** – Event starts
4. **Completed** – Event ends
5. **Results & Certificates** available

---

## 🧠 AI Enhancement (Future Scope)

Potential AI integrations:

* Predict participant turnout
* Smart duplicate detection
* Automated certificate validation
* Insightful analytics recommendations
* Chatbot support for participants

---

## 🏗️ Tech Stack (Proposed)

### Frontend

* React.js
* Tailwind CSS
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Other Tools

* REST APIs
* JWT Authentication

---

## 📁 Project Structure (Suggested)

```
/client        → Frontend (React)
/server        → Backend (Node + Express)
/models        → Database schemas
/routes        → API routes
/controllers   → Business logic
/utils         → Helper functions
```

---

## 🚦 Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/your-username/smart-event-manager.git
cd smart-event-manager
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Application

```bash
npm start
```

---

## 📌 Key Highlights

* Multi-role architecture (Admin / Coordinator / Participant)
* Real-time event tracking
* Clean dashboard UI
* Scalable backend design
* Certificate automation system

---

## 🤝 Contributors

* Backend Developer
* Frontend Developer
* UI/UX Designer
* Project Coordinator

---

## 📜 License

This project is developed for academic and hackathon purposes.

---

## 💡 Final Note

This project is not limited to the current scope. It can be extended with advanced analytics, AI features, and integrations to create a full-scale event management ecosystem.

---

🔥 *Built for innovation. Designed for efficiency.*
