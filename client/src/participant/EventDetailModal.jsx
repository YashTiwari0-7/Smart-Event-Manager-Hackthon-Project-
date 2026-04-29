import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  registerForEvent,
  withdrawFromEvent,
  createTeam,
  joinTeam,
  leaveTeam,
  removeTeamMember,
  updateTeamName,
  downloadCertificate,
} from "../services/participantService";
import { useToast } from "../context/ToastContext";
import ConfirmationModal from "../components/ConfirmationModal";

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
      })
    : "—";

export default function EventDetailModal({
  event,
  myEvents,
  onClose,
  onRefresh,
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { showToast } = useToast();
  const [mode, setMode] = useState(null); // 'create-team' | 'join-team'
  const [inviteCode, setInviteCode] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ show: false, action: null, title: "", message: "" });

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300);
  };

  // Find current registration
  const myReg = myEvents?.find(
    (r) =>
      r.event &&
      String(r.event._id || r.event) === String(event._id) &&
      r.status === "registered"
  );
  const isRegistered = !!myReg;

  const now = new Date();
  const regStart = event.registrationStartDate
    ? new Date(event.registrationStartDate)
    : null;
  const regEnd = event.registrationEndDate
    ? new Date(event.registrationEndDate)
    : null;
  const canWithdraw =
    isRegistered && regStart && regEnd && now >= regStart && now <= regEnd;
  const regOpen =
    regStart &&
    regEnd &&
    now >= regStart &&
    now <= regEnd &&
    event.status === "OPEN";

  const act = async (fn, payload) => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fn(payload);
      setSuccess(res?.message || "Success!");
      onRefresh();
      // Only close automatically if it's not a team operation, otherwise let them see the team card update
      if (fn === registerForEvent || fn === withdrawFromEvent) {
        setTimeout(() => handleClose(), 1200);
      } else {
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (e) {
      setError(e.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => act(registerForEvent, event._id);
  
  const handleWithdraw = () => {
    setConfirmConfig({
      show: true,
      title: "Withdraw from Event?",
      message: "Are you sure you want to withdraw? This action cannot be undone if registration closes.",
      action: () => act(withdrawFromEvent, event._id)
    });
  };

  const handleLeaveTeam = () => {
    setConfirmConfig({
      show: true,
      title: isLeader ? "Cancel Team?" : "Leave Team?",
      message: isLeader 
        ? "As the leader, cancelling the team will withdraw ALL members. Proceed?"
        : "Are you sure you want to leave this team?",
      action: () => act(leaveTeam, event._id)
    });
  };

  const handleCreateTeam = async () => act((id) => createTeam(id, ""), event._id);
  const handleJoinTeam = async () => {
    if (!inviteCode.trim()) {
      setError("Enter the invitation code.");
      return;
    }
    act((id) => joinTeam(id, inviteCode.trim().toUpperCase()), event._id);
  };
  const handleRemoveMember = (memberId) => {
    setConfirmConfig({
      show: true,
      title: "Remove Team Member?",
      message: "Are you sure you want to remove this member from your team?",
      action: () => act(() => removeTeamMember(event._id, memberId), null)
    });
  };
  const handleUpdateTeamName = () => {
    if (!newTeamName.trim()) {
      setError("Enter a team name.");
      return;
    }
    act(() => updateTeamName(event._id, newTeamName.trim()), null);
  };

  const handleDownload = async (type) => {
    try {
      const blob = await downloadCertificate(event._id, type);
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url;
      a.download = `Certificate_${type}_${event.title}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      showToast("Certificate not found or not generated yet.", "error");
    }
  };

  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, []);

  const gs = event.genderSpecification;
  const team = myReg?.team;
  const isLeader = team && String(team.leader) === String(user?._id);

  // Status mapping
  let applicationStatus = "Not Enrolled";
  if (isRegistered) {
    if (event.participationType === "team" && team) {
      if (team.isComplete) applicationStatus = "Completed (Team Formed)";
      else applicationStatus = "Pending (Team Incomplete)";
    } else {
      applicationStatus = "Completed";
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-[900] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[1000] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <div className="pr-4">
            <h2 className="text-xl font-extrabold text-gray-900 leading-tight">
              {event.title}
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              {event.description || "No description provided."}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-gray-100 pb-2">
              <h3 className="text-sm font-bold text-gray-900">Event Details</h3>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${isRegistered ? (applicationStatus.startsWith('Pending') ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700") : "bg-gray-100 text-gray-500"}`}>
                Status: {applicationStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm font-semibold text-gray-500">Registration</span>
                <span className="text-sm font-bold text-gray-900">
                  {fmtDate(event.registrationStartDate)} – {fmtDate(event.registrationEndDate)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm font-semibold text-gray-500">Event Date</span>
                <span className="text-sm font-bold text-gray-900">
                  {fmtDate(event.eventDate)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm font-semibold text-gray-500">Type</span>
                <span className="text-sm font-bold text-gray-900 capitalize">
                  {event.participationType || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-sm font-semibold text-gray-500">
                  {event.participationType === "individual" ? "Slots" : "Teams"}
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {event.participationType === "individual"
                    ? `${event.availableSlots ?? "—"} / ${event.totalSlots ?? "—"}`
                    : `${event.maxTeamSize ?? "—"} max members`}
                </span>
              </div>
              {gs?.enabled && (
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-sm font-semibold text-gray-500">Gender Specific</span>
                  <span className="text-sm font-bold text-gray-900 capitalize">
                    {gs.reservedSlots || gs.minCount || "?"} reserved for {gs.type}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Status Messages */}
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium">{error}</div>}
          {success && <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 text-sm font-medium">{success}</div>}

          {/* Team Card UI */}
          {isRegistered && event.participationType === "team" && team && (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <h4 className="font-bold text-gray-900">{team.name.startsWith(event.title) ? "Your Team" : team.name}</h4>
                <div className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                  Code: {team.invitationCode}
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase">Team Members</span>
                  <span className="text-xs font-bold text-gray-500">{team.members.length} / {team.capacity}</span>
                </div>
                
                {Array.from({ length: team.capacity }).map((_, i) => {
                  const member = team.members[i];
                  return (
                    <div key={i} className={`flex justify-between items-center p-3 rounded-xl border ${member ? "bg-white border-gray-200" : "bg-gray-50 border-dashed border-gray-300"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${member ? (i === 0 ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700") : "bg-gray-200 text-gray-400"}`}>
                          {member ? member.name.charAt(0) : "?"}
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${member ? "text-gray-900" : "text-gray-400"}`}>
                            {member ? member.name : "Empty Slot"}
                          </p>
                          {member && (
                            <p className="text-[10px] text-gray-500 uppercase font-bold">
                              {String(member._id) === String(team.leader) ? "Leader" : "Member"}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Leader Controls to remove member */}
                      {isLeader && member && String(member._id) !== String(team.leader) && (
                        <button 
                          onClick={() => handleRemoveMember(member._id)}
                          disabled={loading}
                          className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Team Completion Naming */}
              {isLeader && team.isComplete && team.name.startsWith(event.title) && (
                <div className="p-4 bg-indigo-50 border-t border-indigo-100">
                  <p className="text-xs font-bold text-indigo-800 mb-2">Team is full! Set an official Team Name:</p>
                  <div className="flex gap-2">
                    <input 
                      className="flex-1 px-3 py-2 rounded-lg border border-indigo-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                      placeholder="Enter team name" 
                      value={newTeamName} 
                      onChange={e => setNewTeamName(e.target.value)} 
                    />
                    <button 
                      onClick={handleUpdateTeamName} 
                      disabled={loading} 
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm disabled:opacity-60"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Individual Registration Status badge */}
          {isRegistered && event.participationType === "individual" && (
            <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 text-sm font-bold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              You are registered for this event
            </div>
          )}

          {!isRegistered && !regOpen && event.status !== 'COMPLETED' && (
            <div className="p-4 bg-gray-50 text-gray-500 rounded-xl border border-gray-100 text-sm font-medium text-center">
              {now < (regStart || Infinity)
                ? "Registration has not opened yet."
                : "Registration is closed for this event."}
            </div>
          )}

          {/* Results Section */}
          {event.status === "COMPLETED" && event.resultsFinalized && (
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                <h3 className="text-sm font-bold text-gray-900">Final Results 🏆</h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {event.participationType === "team" ? (
                  <>
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex justify-between items-center">
                      <span className="text-xs font-bold text-amber-700 uppercase">Winner</span>
                      <span className="text-sm font-extrabold text-amber-900">{event.results.winnerTeam?.name || "—"}</span>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-600 uppercase">Runner Up</span>
                      <span className="text-sm font-extrabold text-gray-800">{event.results.runnerUpTeam?.name || "—"}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex justify-between items-center">
                      <span className="text-xs font-bold text-amber-700 uppercase">Winner</span>
                      <span className="text-sm font-extrabold text-amber-900">{event.results.winner?.name || "—"}</span>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-600 uppercase">Runner Up</span>
                      <span className="text-sm font-extrabold text-gray-800">{event.results.runnerUp?.name || "—"}</span>
                    </div>
                  </>
                )}
              </div>
              
              {/* Certificate Download Buttons */}
              {isRegistered && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button onClick={() => handleDownload('participation')} className="py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 rounded-xl text-xs font-bold transition-colors">
                    📜 Participation
                  </button>
                  <button onClick={() => handleDownload('achievement')} className="py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100 rounded-xl text-xs font-bold transition-colors">
                    🏆 Achievement
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0">
          {!isRegistered && regOpen && (
            event.participationType === "individual" ? (
              <div className="flex justify-end">
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-all shadow-sm disabled:opacity-60 flex items-center gap-2"
                >
                  {loading ? "Enrolling…" : "Enroll Now →"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => setMode(mode === "create-team" ? null : "create-team")}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                      mode === "create-team"
                        ? "bg-gray-900 text-white"
                        : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                    }`}
                  >
                    ➕ Create Team
                  </button>
                  <button
                    onClick={() => setMode(mode === "join-team" ? null : "join-team")}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors ${
                      mode === "join-team"
                        ? "bg-gray-900 text-white"
                        : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                    }`}
                  >
                    🔑 Join Team
                  </button>
                </div>
                {mode === "create-team" && (
                  <div className="flex flex-col gap-2 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <p className="text-xs text-gray-500 font-medium mb-1">You will be designated as the Team Leader. An invite code will be generated for your members.</p>
                    <button
                      onClick={handleCreateTeam}
                      disabled={loading}
                      className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm disabled:opacity-60"
                    >
                      {loading ? "..." : "Proceed & Create Team"}
                    </button>
                  </div>
                )}
                {mode === "join-team" && (
                  <div className="flex gap-2 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <input
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 uppercase"
                      placeholder="6-char invite code"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      maxLength={6}
                    />
                    <button
                      onClick={handleJoinTeam}
                      disabled={loading}
                      className="px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm disabled:opacity-60"
                    >
                      {loading ? "..." : "Join"}
                    </button>
                  </div>
                )}
              </div>
            )
          )}

          {isRegistered && (
            <div className="flex gap-3 justify-end">
              {canWithdraw && (
                <button
                  onClick={handleWithdraw}
                  disabled={loading}
                  className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-sm transition-colors disabled:opacity-60"
                >
                  {loading ? "Withdrawing…" : "Withdraw"}
                </button>
              )}
              {myReg?.team && canWithdraw && (
                <button
                  onClick={handleLeaveTeam}
                  disabled={loading}
                  className="px-5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl font-bold text-sm transition-colors disabled:opacity-60"
                >
                  {loading ? "Leaving…" : (isLeader ? "Cancel Team" : "Leave Team")}
                </button>
              )}
              {!canWithdraw && isRegistered && (
                <div className="px-4 py-2.5 bg-amber-50 text-amber-700 rounded-xl text-sm font-bold w-full text-center">
                  Withdrawal period has ended
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <ConfirmationModal
        isOpen={confirmConfig.show}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={() => {
          confirmConfig.action();
          setConfirmConfig({ ...confirmConfig, show: false });
        }}
        onCancel={() => setConfirmConfig({ ...confirmConfig, show: false })}
      />
    </>
  );
}
