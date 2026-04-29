import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./landing/LandingPage";
import RegisterPage from "./auth/RegisterPage";
import LoginPage from "./auth/LoginPage";
import ForgotPasswordPage from "./auth/ForgotPasswordPage";
import CoordinatorPanel from "./coordinator/CoordinatorPanel";
import AdminPanel from "./admin/AdminPanel";
import ParticipantPanel from "./participant/ParticipantPanel";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register/:roleParam" element={<RegisterPage />} />
          <Route path="/login/:roleParam" element={<LoginPage />} />
          <Route path="/forgot-password/:roleParam" element={<ForgotPasswordPage />} />

          {/* Admin — single panel handles all sections */}
          <Route path="/admin-dashboard" element={
            <ProtectedRoute roles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          } />
          <Route path="/admin-events" element={
            <ProtectedRoute roles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          } />
          <Route path="/admin-coordinators" element={
            <ProtectedRoute roles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          } />
          <Route path="/admin-analytics" element={
            <ProtectedRoute roles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          } />

          {/* Coordinator Protected Routes */}
          <Route path="/coordinator-dashboard" element={
            <ProtectedRoute roles={['coordinator']}>
              <CoordinatorPanel />
            </ProtectedRoute>
          } />
          <Route path="/coordinator-events" element={
            <ProtectedRoute roles={['coordinator']}>
              <CoordinatorPanel />
            </ProtectedRoute>
          } />

          {/* Participant — single panel */}
          <Route path="/participant-dashboard" element={
            <ProtectedRoute roles={['participant']}>
              <ParticipantPanel />
            </ProtectedRoute>
          } />
          <Route path="/events" element={
            <ProtectedRoute roles={['participant']}>
              <ParticipantPanel />
            </ProtectedRoute>
          } />
          <Route path="/certificates" element={
            <ProtectedRoute roles={['participant']}>
              <ParticipantPanel />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
