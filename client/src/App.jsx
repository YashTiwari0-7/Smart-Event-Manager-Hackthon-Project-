import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import LandingPage from "./landing/LandingPage";
import RegisterPage from "./auth/RegisterPage";
import LoginPage from "./auth/LoginPage";
import ForgotPasswordPage from "./auth/ForgotPasswordPage";
import CoordinatorDashboard from "./coordinator/CoordinatorDashboard";
import CoordinatorAssignedEvents from "./coordinator/CoordinatorAssignedEvents";
import CoordinatorEventManagement from "./coordinator/CoordinatorEventManagement";
import CoordinatorEventOperations from "./coordinator/CoordinatorEventOperations";
import CoordinatorResultsModule from "./coordinator/CoordinatorResultsModule";
import AdminEventsModule from "./admin/AdminEventsModule";
import AdminCoordinatorsModule from "./admin/AdminCoordinatorsModule";
import AdminGlobalAnalyticsPage from "./admin/AdminGlobalAnalyticsPage";
import ParticipantDashboard from "./participant/ParticipantDashboard";
import EventsBrowsePage from "./participant/EventsBrowsePage";
import CertificatesPage from "./participant/CertificatesPage";
import "./App.css";

// The layout wrapper for the Admin Dashboard
const DashboardLayout = () => {
  const [activeNav, setActiveNav] = useState("dashboard");

  return (
    <div className="app-layout">
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
      <div className="app-main">
        <Navbar />
        <main className="app-content">
          <Dashboard />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register/:roleParam" element={<RegisterPage />} />
          <Route path="/login/:roleParam" element={<LoginPage />} />
          <Route path="/forgot-password/:roleParam" element={<ForgotPasswordPage />} />

          {/* Admin Protected Routes */}
          <Route path="/admin-dashboard" element={
            <ProtectedRoute roles={['admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          } />
          <Route path="/admin-events" element={
            <ProtectedRoute roles={['admin']}>
              <AdminEventsModule />
            </ProtectedRoute>
          } />
          <Route path="/admin-coordinators" element={
            <ProtectedRoute roles={['admin']}>
              <AdminCoordinatorsModule />
            </ProtectedRoute>
          } />
          <Route path="/admin-analytics" element={
            <ProtectedRoute roles={['admin']}>
              <AdminGlobalAnalyticsPage />
            </ProtectedRoute>
          } />

          {/* Coordinator Protected Routes */}
          <Route path="/coordinator-dashboard" element={
            <ProtectedRoute roles={['coordinator']}>
              <CoordinatorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/coordinator-events" element={
            <ProtectedRoute roles={['coordinator']}>
              <CoordinatorAssignedEvents />
            </ProtectedRoute>
          } />
          <Route path="/coordinator-management" element={
            <ProtectedRoute roles={['coordinator']}>
              <CoordinatorEventManagement />
            </ProtectedRoute>
          } />
          <Route path="/coordinator-operations" element={
            <ProtectedRoute roles={['coordinator']}>
              <CoordinatorEventOperations />
            </ProtectedRoute>
          } />
          <Route path="/coordinator-results" element={
            <ProtectedRoute roles={['coordinator']}>
              <CoordinatorResultsModule />
            </ProtectedRoute>
          } />

          {/* Participant Protected Routes */}
          <Route path="/participant-dashboard" element={
            <ProtectedRoute roles={['participant']}>
              <ParticipantDashboard />
            </ProtectedRoute>
          } />
          <Route path="/events" element={
            <ProtectedRoute roles={['participant']}>
              <EventsBrowsePage />
            </ProtectedRoute>
          } />
          <Route path="/certificates" element={
            <ProtectedRoute roles={['participant']}>
              <CertificatesPage />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
