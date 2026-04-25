import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { roleParam } = useParams();
  const navigate = useNavigate();
  const { loginSuccess } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const role = roleParam === "admin" ? "admin" : (roleParam === "coordinator" ? "coordinator" : "participant");
  const isCoordinator = role === "coordinator";
  const isAdmin = role === "admin";

  const accent = isAdmin ? "text-red-600" : (isCoordinator ? "text-violet-600" : "text-primary-600");
  const bgAccent = isAdmin ? "bg-red-50" : (isCoordinator ? "bg-violet-50" : "bg-primary-50");
  const buttonColor = isAdmin ? "bg-red-600 hover:bg-red-700" : (isCoordinator ? "bg-violet-600 hover:bg-violet-700" : "bg-primary-600 hover:bg-primary-700");
  const badgeIcon = isAdmin ? "🛡️" : (isCoordinator ? "🎯" : "🎓");
  const roleName = isAdmin ? "Admin Login" : (isCoordinator ? "Coordinator Login" : "Participant Login");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userData = await login(email, password);

      // Verify the logged-in user's role matches the login page role
      if (userData.role !== role) {
        setError(`This account is registered as '${userData.role}'. Please use the correct login page.`);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
        return;
      }

      loginSuccess(userData);

      // Navigate to role-based dashboard
      const dashboardMap = {
        admin: '/admin-dashboard',
        coordinator: '/coordinator-dashboard',
        participant: '/participant-dashboard'
      };
      navigate(dashboardMap[userData.role] || '/');
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
            ← Back
          </button>
          <Link to="/" className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <span className="text-xl font-bold text-primary-600">⚡</span>
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              Smart<span className="text-primary-600">Event</span>
            </span>
          </Link>
        </div>
        {!isAdmin && (
          <p className="text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to={`/register/${role}`} className={`font-semibold hover:underline ${accent}`}>Register</Link>
          </p>
        )}
      </div>

      {/* Page content */}
      <div className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-100 p-8 sm:p-10">

          {/* Role badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5 ${bgAccent} ${accent}`}>
            <span>{badgeIcon}</span>
            {roleName}
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 mb-1 tracking-tight">Welcome back</h2>
          <p className="text-slate-500 mb-6 text-sm">
            {isAdmin ? "Login to manage the platform and users." : (isCoordinator
              ? "Login to manage your events and participants."
              : "Login to access your dashboard and join events.")}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                className={`w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all text-sm placeholder:text-slate-400 disabled:opacity-50 ${isAdmin ? "focus:ring-red-500/20 focus:border-red-500" : (isCoordinator ? "focus:ring-violet-500/20 focus:border-violet-500" : "focus:ring-primary-500/20 focus:border-primary-500")}`}
              />
            </div>
            <div className="space-y-1.5">
               <div className="flex justify-between items-center">
                  <label className="block text-sm font-semibold text-slate-700">Password</label>
                  {!isAdmin && (
                    <Link to={`/forgot-password/${role}`} className={`text-xs font-medium hover:underline ${accent}`}>Forgot Password?</Link>
                  )}
               </div>
               <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  className={`w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all text-sm placeholder:text-slate-400 disabled:opacity-50 ${isAdmin ? "focus:ring-red-500/20 focus:border-red-500" : (isCoordinator ? "focus:ring-violet-500/20 focus:border-violet-500" : "focus:ring-primary-500/20 focus:border-primary-500")}`}
               />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white font-bold py-3 rounded-xl transition-all shadow-md mt-4 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${buttonColor}`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                "Login →"
              )}
            </button>
          </form>

          {/* Register hint */}
          {!isAdmin && (
            <p className="text-center text-xs text-slate-400 mt-6">
              Don't have an account?{" "}
              <Link to={`/register/${role}`} className={`font-semibold hover:underline ${accent}`}>
                Register here
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
