import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { registerParticipant, verifyParticipantOtp, registerCoordinator, verifyCoordinatorOtp } from "../services/authService";

/* ── Input Field helper ─────────────────────────────────────── */
const InputField = ({ label, type = "text", placeholder, required = true, value, onChange, disabled, children, name }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
    {children || (
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        name={name}
        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm placeholder:text-slate-400 disabled:opacity-50"
      />
    )}
  </div>
);

/* ── Participant Register Form ──────────────────────────────── */
const ParticipantForm = ({ onSuccess }) => {
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    name: "", email: "", mobileNumber: "", institution: "",
    course: "", age: "", gender: "", password: "", confirmPassword: ""
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const pgCourses = ["MCA", "MBA", "MCom"];
  const isPG = pgCourses.includes(formData.course);
  const maxSem = isPG ? 4 : 6;

  const handleStep1Submit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    if (!agreed) return alert("Please agree to the Terms.");
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await registerParticipant({
        name: formData.name,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        institution: formData.institution,
        course: formData.course,
        age: parseInt(formData.age) || 18,
        gender: formData.gender || "other",
        password: formData.password
      });
      setOtpStep(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await verifyParticipantOtp(formData.email, otp);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (otpStep) {
    return (
      <form onSubmit={handleOtpVerify} className="space-y-4">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">📧</div>
          <h3 className="text-lg font-bold text-slate-900">Verify Your Email</h3>
          <p className="text-sm text-slate-500 mt-1">We sent a 6-digit OTP to <span className="font-semibold text-slate-700">{formData.email}</span></p>
        </div>
        {error && <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">{error}</div>}
        <InputField label="Enter OTP" type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} disabled={loading} />
        <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm disabled:opacity-60 flex items-center justify-center gap-2">
          {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Verifying...</> : "Verify & Create Account 🎉"}
        </button>
      </form>
    );
  }

  return (
    <>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${step >= 1 ? "text-primary-600" : "text-slate-400"}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${step >= 1 ? "bg-primary-600" : "bg-slate-200"}`}>1</div>
          Personal Info
        </div>
        <div className={`flex-1 h-0.5 rounded ${step >= 2 ? "bg-primary-400" : "bg-slate-200"}`}></div>
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${step >= 2 ? "text-primary-600" : "text-slate-400"}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${step >= 2 ? "bg-primary-600" : "bg-slate-200"}`}>2</div>
          Account Setup
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">{error}</div>}

      {step === 1 ? (
        <form onSubmit={handleStep1Submit} className="space-y-4">
          <InputField label="Full Name" placeholder="John Doe" value={formData.name} onChange={handleChange} name="name" />
          <InputField label="Email Address" type="email" placeholder="john@college.edu" value={formData.email} onChange={handleChange} name="email" />
          <InputField label="Phone Number" type="tel" placeholder="+91 98765 43210" value={formData.mobileNumber} onChange={handleChange} name="mobileNumber" />
          <InputField label="College / University" placeholder="e.g. IIT Delhi" value={formData.institution} onChange={handleChange} name="institution" />
          <InputField label="Age" type="number" placeholder="e.g. 20" value={formData.age} onChange={handleChange} name="age" />

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gender</label>
            <select required value={formData.gender} onChange={handleChange} name="gender"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm text-slate-700">
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Course</label>
            <select required value={formData.course} onChange={handleChange} name="course"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm text-slate-700">
              <option value="">Select Course</option>
              <option value="BCA">BCA</option>
              <option value="BBA">BBA</option>
              <option value="BCom">BCom</option>
              <option value="MCA">MCA</option>
              <option value="MBA">MBA</option>
              <option value="MCom">MCom</option>
            </select>
          </div>

          <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg text-sm">
            Continue →
          </button>
        </form>
      ) : (
        <form onSubmit={handleStep2Submit} className="space-y-4">
          <InputField label="Password" type="password" placeholder="Min. 6 characters" value={formData.password} onChange={handleChange} name="password" disabled={loading} />
          <InputField label="Confirm Password" type="password" placeholder="Re-enter password" value={formData.confirmPassword} onChange={handleChange} name="confirmPassword" disabled={loading} />
          <div className="flex items-start gap-3">
            <input id="terms-p" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 accent-primary-600 cursor-pointer" />
            <label htmlFor="terms-p" className="text-sm text-slate-500 leading-relaxed cursor-pointer">
              I agree to the <span className="text-primary-600 font-semibold">Terms of Service</span> and <span className="text-primary-600 font-semibold">Privacy Policy</span>.
            </label>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} disabled={loading} className="flex-1 border border-slate-200 text-slate-600 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-all text-sm">← Back</button>
            <button type="submit" disabled={loading} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Sending OTP...</> : "Register →"}
            </button>
          </div>
        </form>
      )}
    </>
  );
};

/* ── Coordinator Register Form ──────────────────────────────── */
const CoordinatorForm = ({ onSuccess }) => {
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");

  const [formData, setFormData] = useState({
    name: "", email: "", phoneNumber: "", institutionName: "",
    designation: "", age: "", gender: "", password: "", confirmPassword: ""
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    if (!agreed) return alert("Please agree to the Terms.");
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await registerCoordinator({
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        institutionName: formData.institutionName,
        designation: formData.designation,
        age: parseInt(formData.age) || 25,
        gender: formData.gender || "other",
        password: formData.password
      });
      setOtpStep(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await verifyCoordinatorOtp(formData.email, otp);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (otpStep) {
    return (
      <form onSubmit={handleOtpVerify} className="space-y-4">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">📧</div>
          <h3 className="text-lg font-bold text-slate-900">Verify Your Email</h3>
          <p className="text-sm text-slate-500 mt-1">We sent a 6-digit OTP to <span className="font-semibold text-slate-700">{formData.email}</span></p>
        </div>
        {error && <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">{error}</div>}
        <InputField label="Enter OTP" type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} disabled={loading} />
        <button type="submit" disabled={loading} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm disabled:opacity-60 flex items-center justify-center gap-2">
          {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Verifying...</> : "Verify & Create Account 🎉"}
        </button>
      </form>
    );
  }

  return (
    <>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${step >= 1 ? "text-violet-600" : "text-slate-400"}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${step >= 1 ? "bg-violet-600" : "bg-slate-200"}`}>1</div>
          Professional Info
        </div>
        <div className={`flex-1 h-0.5 rounded ${step >= 2 ? "bg-violet-400" : "bg-slate-200"}`}></div>
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${step >= 2 ? "text-violet-600" : "text-slate-400"}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${step >= 2 ? "bg-violet-600" : "bg-slate-200"}`}>2</div>
          Account Setup
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">{error}</div>}

      {step === 1 ? (
        <form onSubmit={handleStep1Submit} className="space-y-4">
          <InputField label="Full Name" placeholder="Rahul Verma" value={formData.name} onChange={handleChange} name="name" />
          <InputField label="Email Address" type="email" placeholder="coordinator@college.edu" value={formData.email} onChange={handleChange} name="email" />
          <InputField label="Phone Number" type="tel" placeholder="+91 98765 43210" value={formData.phoneNumber} onChange={handleChange} name="phoneNumber" />
          <InputField label="Organization / College" placeholder="e.g. BITS Pilani" value={formData.institutionName} onChange={handleChange} name="institutionName" />
          <InputField label="Designation / Event Role" placeholder="e.g. Fest Convener" value={formData.designation} onChange={handleChange} name="designation" />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Age" type="number" placeholder="25" value={formData.age} onChange={handleChange} name="age" />
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gender</label>
              <select required value={formData.gender} onChange={handleChange} name="gender"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm text-slate-700">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm">
            Continue →
          </button>
        </form>
      ) : (
        <form onSubmit={handleStep2Submit} className="space-y-4">
          <InputField label="Password" type="password" placeholder="Min. 6 characters" value={formData.password} onChange={handleChange} name="password" disabled={loading} />
          <InputField label="Confirm Password" type="password" placeholder="Re-enter password" value={formData.confirmPassword} onChange={handleChange} name="confirmPassword" disabled={loading} />
          <div className="flex items-start gap-3">
            <input id="terms-c" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 w-4 h-4 accent-violet-600 cursor-pointer" />
            <label htmlFor="terms-c" className="text-sm text-slate-500 leading-relaxed cursor-pointer">
              I agree to the <span className="text-violet-600 font-semibold">Terms of Service</span> and <span className="text-violet-600 font-semibold">Privacy Policy</span>.
            </label>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} disabled={loading} className="flex-1 border border-slate-200 text-slate-600 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-all text-sm">← Back</button>
            <button type="submit" disabled={loading} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Sending OTP...</> : "Register →"}
            </button>
          </div>
        </form>
      )}
    </>
  );
};

/* ── Main Register Page ─────────────────────────────────────── */
const RegisterPage = () => {
  const { roleParam } = useParams();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const role = roleParam === "coordinator" ? "coordinator" : "participant";
  const isCoordinator = role === "coordinator";

  const accent = isCoordinator ? "text-violet-600" : "text-primary-600";
  const bgAccent = isCoordinator ? "bg-violet-50" : "bg-primary-50";

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🎉</div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Registration Successful!</h2>
          <p className="text-slate-500 mb-6 text-sm">
            {isCoordinator
              ? <>Your coordinator account has been created and is <span className="font-semibold text-amber-600">pending admin approval</span>. You'll be notified once approved.</>
              : <>Your participant account has been created. You can now <span className="font-semibold text-primary-600">login</span> to access your dashboard.</>
            }
          </p>
          <div className="space-y-3">
            <button onClick={() => navigate(`/login/${role}`)} className={`w-full ${isCoordinator ? 'bg-violet-600 hover:bg-violet-700' : 'bg-primary-600 hover:bg-primary-700'} text-white font-bold py-3 rounded-xl transition-all`}>
              Go to Login →
            </button>
            <button onClick={() => navigate("/")} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-all">
              Back to Home
            </button>
          </div>
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
        <p className="text-sm text-slate-500">
          Already have an account?{" "}
          <Link to={`/login/${role}`} className={`font-semibold hover:underline ${accent}`}>Log in</Link>
        </p>
      </div>

      {/* Page content */}
      <div className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-slate-100 p-8 sm:p-10">

          {/* Role badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5 ${bgAccent} ${accent}`}>
            <span>{isCoordinator ? "🎯" : "🎓"}</span>
            {isCoordinator ? "Coordinator Registration" : "Participant Registration"}
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 mb-1 tracking-tight">Create your account</h2>
          <p className="text-slate-500 mb-6 text-sm">
            {isCoordinator
              ? "Register as a Coordinator to create and manage events."
              : "Register as a Participant to discover and join campus events."}
          </p>

          {/* Form */}
          {isCoordinator
            ? <CoordinatorForm onSuccess={() => setSubmitted(true)} />
            : <ParticipantForm onSuccess={() => setSubmitted(true)} />
          }

          {/* Login hint */}
          <p className="text-center text-xs text-slate-400 mt-6">
            Already have an account?{" "}
            <Link to={`/login/${role}`} className={`font-semibold hover:underline ${accent}`}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
