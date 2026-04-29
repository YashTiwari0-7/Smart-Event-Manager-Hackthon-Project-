import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as coordinatorService from "../services/coordinatorService";
import { useToast } from "../context/ToastContext";

// --- MOCK DATA FOR ANALYTICS/LOGS (To be replaced later) ---

const mockAnalytics = {
  totalRegistrations: 200,
  attendanceRate: 60, // percentage
  dropOffRate: 15, // percentage
  noShowRate: 25, // percentage
  avgTeamSize: 4.2,
  genderRatio: "65% M / 35% F",
  peakRegistrationTime: "Feb 28, 8:00 PM",
  conversionRate: "42%", // views -> registrations
};

const mockCoordinators = [
  { id: 1, name: "Sarah Jenkins", role: "Primary Owner" },
  { id: 2, name: "Mike Ross", role: "Co-Coordinator" },
  { id: 3, name: "Rachel Zane", role: "Co-Coordinator" },
];

const mockLogs = [
  { id: 1, action: "Event marked as Completed", user: "Sarah Jenkins", timestamp: "Mar 12, 11:45 PM" },
  { id: 2, action: "Ended Event", user: "Sarah Jenkins", timestamp: "Mar 12, 11:45 PM" },
  { id: 3, action: "Marked attendance for Team Alpha Brains", user: "Mike Ross", timestamp: "Mar 10, 09:15 AM" },
  { id: 4, action: "Started Event", user: "Sarah Jenkins", timestamp: "Mar 10, 09:00 AM" },
  { id: 5, action: "Edited Event Configuration (Slots)", user: "Sarah Jenkins", timestamp: "Mar 08, 02:30 PM" },
  { id: 6, action: "Added Volunteer (Alex Dunn)", user: "Rachel Zane", timestamp: "Mar 05, 10:00 AM" },
];

// --- SUB-COMPONENTS ---
const StatCard = ({ title, value, description, className = "" }) => (
  <div className={`bg-white rounded-xl p-5 border border-gray-200 shadow-sm ${className}`}>
    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
    <p className="text-2xl font-extrabold text-gray-900">{value}</p>
    {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
  </div>
);

const ProgressBar = ({ label, percentage, colorClass }) => (
  <div className="mb-3">
    <div className="flex justify-between text-xs mb-1">
      <span className="font-semibold text-gray-700">{label}</span>
      <span className="font-bold text-gray-900">{percentage}%</span>
    </div>
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div className={`h-2 rounded-full ${colorClass}`} style={{ width: `${percentage}%` }}></div>
    </div>
  </div>
);

const ActivityLogRow = ({ log }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
    <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 shrink-0 mt-0.5">
      {log.user.split(" ").map(n => n[0]).join("")}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900 truncate">{log.action}</p>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-xs text-gray-500 font-semibold">{log.user}</span>
        <span className="text-[10px] text-gray-400">• {log.timestamp}</span>
      </div>
    </div>
  </div>
);

const CertificatePreview = ({ template, participantName, eventName, position, date }) => {
  const baseClasses = "relative w-full aspect-[1.4/1] rounded-lg border-2 shadow-inner overflow-hidden flex flex-col items-center justify-center p-6 text-center transition-all duration-300";
  
  if (template === "Classic") {
    return (
      <div className={`${baseClasses} bg-gray-50 border-double border-8 border-gray-300`}>
        <h2 className="text-2xl font-serif text-gray-800 tracking-widest uppercase mb-1">Certificate</h2>
        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-4">of {position ? "Achievement" : "Participation"}</p>
        <p className="text-xs text-gray-600 mb-1">Proudly presented to</p>
        <h3 className="text-xl font-bold text-gray-900 italic mb-4">{participantName || "[Participant Name]"}</h3>
        <p className="text-xs text-gray-600 px-4">For excellent performance in<br/><span className="font-semibold">{eventName}</span></p>
        {position && <p className="text-xs font-bold text-gray-800 mt-2 bg-gray-200 px-3 py-1 rounded-full">{position}</p>}
        <div className="absolute bottom-4 left-6 text-[10px] text-gray-500 border-t border-gray-300 pt-1">Date: {date}</div>
        <div className="absolute bottom-4 right-6 text-[10px] text-gray-500 border-t border-gray-300 pt-1">Signature</div>
      </div>
    );
  }

  if (template === "Modern") {
    return (
      <div className={`${baseClasses} bg-white border-gray-200 justify-start pt-8`}>
        <div className="absolute top-0 left-0 w-2 h-full bg-gray-800"></div>
        <div className="absolute top-0 right-0 w-2 h-full bg-gray-800"></div>
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">SMART Event Manager</p>
        <h2 className="text-xl font-extrabold text-gray-900 uppercase tracking-tight mb-4">Certificate of {position ? "Excellence" : "Completion"}</h2>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{participantName || "[Participant Name]"}</h3>
        <p className="text-xs text-gray-500 w-3/4">has successfully completed</p>
        <p className="text-sm font-bold text-gray-800 mt-1">{eventName}</p>
        {position && <p className="mt-4 px-4 py-1.5 bg-gray-900 text-white text-xs font-bold rounded">{position}</p>}
        <div className="absolute bottom-4 flex w-full justify-between px-8">
          <span className="text-[10px] font-bold text-gray-400">{date}</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase">Verified</span>
        </div>
      </div>
    );
  }

  // Minimal
  return (
    <div className={`${baseClasses} bg-gray-100 border-none`}>
      <div className="border border-gray-300 w-full h-full p-4 flex flex-col items-center justify-center">
        <h2 className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-4">CERTIFICATE</h2>
        <h3 className="text-lg font-medium text-gray-900 mb-2 border-b border-gray-300 pb-1 w-3/4">{participantName || "[Participant Name]"}</h3>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">{eventName}</p>
        {position && <p className="text-[10px] font-bold text-gray-700">{position}</p>}
        <p className="text-[9px] text-gray-400 mt-6">{date}</p>
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
export default function CoordinatorResultsModule() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { showToast } = useToast();

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Results State
  const [rank1, setRank1] = useState("");
  const [rank2, setRank2] = useState("");
  const [rank3, setRank3] = useState("");
  const [specialMentions, setSpecialMentions] = useState([]);
  const [resultsSaved, setResultsSaved] = useState(false);
  const [resultsError, setResultsError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const events = await coordinatorService.getAssignedEvents();
        const foundEvent = events.find(e => e._id === eventId);
        
        if (foundEvent) {
          setEvent({
            id: foundEvent._id,
            name: foundEvent.title,
            type: foundEvent.participationType === 'team' ? 'Team' : 'Individual',
            status: foundEvent.status,
            totalParticipants: foundEvent.participants?.length || 0,
            dateCompleted: new Date().toLocaleDateString()
          });
        }

        try {
          const participantsData = await coordinatorService.getEventParticipants(eventId);
          const mapped = (participantsData || []).map(p => {
            const isTeam = foundEvent.participationType === 'team';
            return {
              id: isTeam ? (p.team?._id || p._id) : (p.user?._id || p._id),
              name: isTeam ? (p.team?.name || "Unknown Team") : (p.user?.name || "Unknown User"),
              teamName: p.team?.name || null
            };
          });
          
          // Unique entries by id (helpful for teams where multiple members might be in participantsData)
          const uniqueParticipants = Array.from(new Map(mapped.map(item => [item.id, item])).values());
          setParticipants(uniqueParticipants);
        } catch (err) {
          console.error("Failed to fetch participants");
        }
      } catch (err) {
        console.error("Failed to fetch event data:", err);
      } finally {
        setLoading(false);
      }
    };
    if (eventId) fetchData();
  }, [eventId]);

  // Certificates State
  const [certType, setCertType] = useState("Participation Certificate");
  const [certTemplate, setCertTemplate] = useState("Classic");
  const [previewParticipant, setPreviewParticipant] = useState("");

  // Handlers
  const handleSpecialMentionChange = (e) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setSpecialMentions(value);
  };

  const saveResults = async () => {
    // Validation
    if (!rank1 || !rank2 || !rank3) {
      setResultsError("Rank 1, 2, and 3 are mandatory to declare results.");
      return;
    }
    
    const selections = [rank1, rank2, rank3, ...specialMentions].filter(Boolean);
    const uniqueSelections = new Set(selections);
    
    if (selections.length !== uniqueSelections.size) {
      setResultsError("A participant/team cannot be assigned multiple ranks or mentions.");
      return;
    }

    try {
      await coordinatorService.saveResult(eventId, {
        winner: rank1,
        runnerUp: rank2,
        top3: [rank1, rank2, rank3]
      });
      setResultsError("");
      setResultsSaved(true);
      showToast("Results declared successfully! Certificates are now unlocked.");
    } catch (err) {
      setResultsError(err.response?.data?.message || "Failed to save results.");
    }
  };

  const resetResults = () => {
    setRank1("");
    setRank2("");
    setRank3("");
    setSpecialMentions([]);
    setResultsSaved(false);
    setResultsError("");
  };

  const generateCertificates = async () => {
    try {
      await coordinatorService.generateCertificates(eventId);
      showToast(`Successfully generated certificates! They are now available to participants.`);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to generate certificates.", "error");
    }
  };

  // Certificate Preview Logic
  const getPreviewPosition = () => {
    if (certType === "Participation Certificate") return null;
    if (!previewParticipant) return "Winner";
    if (previewParticipant === rank1) return "1st Place Winner";
    if (previewParticipant === rank2) return "2nd Place Winner";
    if (previewParticipant === rank3) return "3rd Place Winner";
    if (specialMentions.includes(previewParticipant)) return "Special Mention";
    return "Winner";
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-12">
      
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="mr-2 text-gray-400 hover:text-gray-800 transition-colors text-sm font-bold">
            ← Back
          </button>
          <span className="text-xl font-bold text-gray-800">⚡</span>
          <span className="text-base font-bold text-gray-900 tracking-tight hidden sm:block">SMART Event Manager</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded border border-gray-200 uppercase tracking-wider">Results & Analytics Module</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        
        {/* SECTION 1: EVENT HEADER */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{event?.name || 'Loading...'}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-700 text-white uppercase tracking-wider">
                {event?.status || 'Completed'}
              </span>
            </div>
            <p className="text-sm text-gray-500 font-medium">
              <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 mr-2">{event?.type || ''} Event</span>
              Completed on {event?.dateCompleted || ''}
            </p>
          </div>
          <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 text-right">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Participants</p>
            <p className="text-xl font-extrabold text-gray-800">{event?.totalParticipants || 0}</p>
          </div>
        </div>

        {/* 2-COLUMN LAYOUT FOR DESKTOP */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Results & Certificates */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* SECTION 2: RESULTS DECLARATION */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Declare Results</h2>
                {resultsSaved && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200">✓ Saved & Locked</span>}
              </div>
              
              <div className="p-6">
                {resultsError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">
                    {resultsError}
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">🥇 Rank 1 <span className="text-red-500">*</span></label>
                    <select 
                      disabled={resultsSaved} value={rank1} onChange={(e) => setRank1(e.target.value)}
                      className={`w-full text-sm py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors ${resultsSaved ? "bg-gray-50 text-gray-500" : "bg-white border-gray-200"}`}
                    >
                      <option value="">Select Team</option>
                      {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">🥈 Rank 2</label>
                    <select 
                      disabled={resultsSaved} value={rank2} onChange={(e) => setRank2(e.target.value)}
                      className={`w-full text-sm py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors ${resultsSaved ? "bg-gray-50 text-gray-500" : "bg-white border-gray-200"}`}
                    >
                      <option value="">Select Team</option>
                      {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">🥉 Rank 3</label>
                    <select 
                      disabled={resultsSaved} value={rank3} onChange={(e) => setRank3(e.target.value)}
                      className={`w-full text-sm py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors ${resultsSaved ? "bg-gray-50 text-gray-500" : "bg-white border-gray-200"}`}
                    >
                      <option value="">Select Team</option>
                      {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">⭐ Special Mentions (Multi-select)</label>
                  <select 
                    multiple disabled={resultsSaved} value={specialMentions} onChange={handleSpecialMentionChange}
                    className={`w-full text-sm py-2 px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors h-24 ${resultsSaved ? "bg-gray-50 text-gray-500" : "bg-white border-gray-200"}`}
                  >
                    {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <p className="text-[10px] text-gray-400 mt-1">Hold CTRL/CMD to select multiple.</p>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                  <button 
                    onClick={resetResults} disabled={!resultsSaved}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors border ${resultsSaved ? "bg-white border-gray-300 text-gray-700 hover:bg-gray-50" : "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"}`}
                  >
                    Edit Results
                  </button>
                  <button 
                    onClick={saveResults} disabled={resultsSaved}
                    className={`px-6 py-2 text-sm font-bold rounded-lg transition-colors shadow-sm ${resultsSaved ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-900 text-white hover:bg-gray-800"}`}
                  >
                    Save Results
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 3: CERTIFICATE GENERATOR */}
            <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ${!resultsSaved ? "opacity-60" : ""}`}>
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Certificate Generator</h2>
                {!resultsSaved && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded uppercase">Locked</span>}
              </div>
              
              <div className="p-6 relative">
                {!resultsSaved && (
                  <div className="absolute inset-0 z-10 bg-white/40 cursor-not-allowed" title="Save results to unlock certificate generation"></div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Certificate Type</label>
                      <select 
                        value={certType} onChange={(e) => setCertType(e.target.value)} disabled={!resultsSaved}
                        className="w-full text-sm py-2 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                      >
                        <option value="Participation Certificate">Participation Certificate</option>
                        <option value="Winner Certificate">Winner Certificate</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Template Design</label>
                      <select 
                        value={certTemplate} onChange={(e) => setCertTemplate(e.target.value)} disabled={!resultsSaved}
                        className="w-full text-sm py-2 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                      >
                        <option value="Classic">Classic Layout</option>
                        <option value="Modern">Modern Edge</option>
                        <option value="Minimal">Minimalist</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Preview For Participant</label>
                      <select 
                        value={previewParticipant} onChange={(e) => setPreviewParticipant(e.target.value)} disabled={!resultsSaved}
                        className="w-full text-sm py-2 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                      >
                        <option value="">Generic Preview</option>
                        {participants.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  {/* PREVIEW CARD */}
                  <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Live Preview</p>
                    <div className="w-full max-w-[280px]">
                      <CertificatePreview 
                        template={certTemplate}
                        eventName={event?.name}
                        participantName={previewParticipant}
                        position={getPreviewPosition()}
                        date={event?.dateCompleted}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                  <button disabled={!resultsSaved} onClick={() => showToast("Downloading sample template...")} className="px-4 py-2 text-sm font-bold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    Download Sample
                  </button>
                  <button disabled={!resultsSaved} onClick={generateCertificates} className="px-6 py-2 text-sm font-bold bg-gray-900 text-white hover:bg-gray-800 rounded-lg shadow-sm transition-colors flex items-center gap-2">
                    <span>Generate All</span>
                    <span className="bg-gray-700 text-xs px-1.5 py-0.5 rounded">{certType === "Participation Certificate" ? event?.totalParticipants || 0 : [rank1, rank2, rank3, ...specialMentions].filter(Boolean).length}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Analytics & Team Logs */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* SECTION 4: EVENT ANALYTICS */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Event Analytics</h2>
                <span className="text-lg">📊</span>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <StatCard title="Total Reg." value={event?.totalParticipants || 0} />
                  <StatCard title="Event Type" value={event?.type || 'N/A'} description="Participation" />
                  <StatCard title="Status" value={event?.status || 'N/A'} description="Current state" />
                  <StatCard title="Date" value={event?.dateCompleted || 'N/A'} className="text-base" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Participation Overview</h3>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Total engaged users</p>
                    <p className="text-xl font-bold text-gray-900">{event?.totalParticipants || 0}</p>
                  </div>
                </div>
                
                <div className="mt-5 pt-4 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-500">Peak Registration Time:</p>
                  <p className="text-sm font-bold text-gray-800">{mockAnalytics.peakRegistrationTime}</p>
                </div>
              </div>
            </div>

            {/* SECTION 5: TEAM & COLLABORATION PANEL */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Team & Audit Logs</h2>
                <span className="text-lg">👥</span>
              </div>
              
              <div className="p-5">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Note</h3>
                <p className="text-xs text-gray-500 italic">
                  Results and certificates are only available after the event has been officially ended by the coordinator.
                </p>
              </div>
            </div>

          </div>

        </div>
      </main>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
