import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { requestPasswordReset, verifyPasswordResetOtp, resetPassword } from "../services/authService";

const ForgotPasswordPage = () => {
  const { roleParam } = useParams();
  const navigate = useNavigate();

  const role = roleParam === "coordinator" ? "coordinator" : "participant";
  const isCoordinator = role === "coordinator";
  const accent = isCoordinator ? "text-violet-600" : "text-primary-600";
  const bgAccent = isCoordinator ? "bg-violet-50" : "bg-primary-50";
  const buttonColor = isCoordinator ? "bg-violet-600 hover:bg-violet-700" : "bg-primary-600 hover:bg-primary-700";
  const ringClass = isCoordinator ? "focus:ring-violet-500/20 focus:border-violet-500" : "focus:ring-primary-500/20 focus:border-primary-500";

  // Steps: 1 = enter email, 2 = enter OTP, 3 = set new password, 4 = success
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputClass = `w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 transition-all text-sm placeholder:text-slate-400 disabled:opacity-50 ${ringClass}`;

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyPasswordResetOtp(email, otp);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Success
  if (step === 4) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">✅</div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Password Reset Successful!</h2>
          <p className="text-slate-500 mb-6 text-sm">
            Your password has been updated successfully. You can now login with your new password.
          </p>
          <button onClick={() => navigate(`/login/${role}`)} className={`w-full ${buttonColor} text-white font-bold py-3 rounded-xl transition-all shadow-md`}>
            Go to Login →
          </button>
        </div>
      </div>
    );
  }

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
        <Link to={`/login/${role}`} className={`text-sm font-semibold hover:underline ${accent}`}>
          Back to Login
        </Link>
      </div>

      {/* Page content */}
      <div className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-100 p-8 sm:p-10">

          {/* Role badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5 ${bgAccent} ${accent}`}>
            <span>{isCoordinator ? "🎯" : "🎓"}</span>
            Password Reset
          </div>

          {/* Step progress */}
          <div className="flex items-center gap-1 mb-6">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s
                  ? (isCoordinator ? 'bg-violet-600 text-white' : 'bg-primary-600 text-white')
                  : 'bg-slate-200 text-slate-400'
                }`}>
                  {step > s ? '✓' : s}
                </div>
                {s < 3 && <div className={`flex-1 h-0.5 rounded transition-all ${step > s ? (isCoordinator ? 'bg-violet-400' : 'bg-primary-400') : 'bg-slate-200'}`}></div>}
              </React.Fragment>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {/* Step 1: Enter Email */}
          {step === 1 && (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">🔑</div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Forgot Password?</h2>
                <p className="text-slate-500 text-sm">Enter your registered email and we'll send you an OTP to reset your password.</p>
              </div>
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    disabled={loading}
                    className={inputClass}
                  />
                </div>
                <button type="submit" disabled={loading} className={`w-full ${buttonColor} text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2`}>
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Sending OTP...</>
                  ) : (
                    "Send OTP →"
                  )}
                </button>
              </form>
            </>
          )}

          {/* Step 2: Verify OTP */}
          {step === 2 && (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">📧</div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Verify OTP</h2>
                <p className="text-slate-500 text-sm">We sent a 6-digit OTP to <span className="font-semibold text-slate-700">{email}</span></p>
              </div>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Enter OTP</label>
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    disabled={loading}
                    className={inputClass}
                  />
                </div>
                <button type="submit" disabled={loading} className={`w-full ${buttonColor} text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2`}>
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Verifying...</>
                  ) : (
                    "Verify OTP →"
                  )}
                </button>
                <button type="button" onClick={() => { setStep(1); setError(""); }} className="w-full border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl hover:bg-slate-50 transition-all text-sm">
                  ← Change Email
                </button>
              </form>
            </>
          )}

          {/* Step 3: Set New Password */}
          {step === 3 && (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">🔐</div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Create New Password</h2>
                <p className="text-slate-500 text-sm">Enter your new password below. Make sure it's at least 6 characters.</p>
              </div>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    disabled={loading}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    disabled={loading}
                    className={inputClass}
                  />
                </div>
                <button type="submit" disabled={loading} className={`w-full ${buttonColor} text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2`}>
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Resetting...</>
                  ) : (
                    "Reset Password ✓"
                  )}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-xs text-slate-400 mt-6">
            Remember your password?{" "}
            <Link to={`/login/${role}`} className={`font-semibold hover:underline ${accent}`}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
