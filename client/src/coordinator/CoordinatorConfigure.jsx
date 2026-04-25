import React, { useState } from "react";
import { configureEvent } from "../services/coordinatorService";

const inp = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: "1px solid #e5e7eb", fontSize: 13, outline: "none", boxSizing: "border-box",
};
const lbl = { fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6, display: "block" };
const sec = { background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 24, display: "flex", flexDirection: "column", gap: 16 };

export default function CoordinatorConfigure({ event, onBack }) {
  const isLocked = event.configOwner && String(event.configOwner) !== String(event._id);

  const [form, setForm] = useState({
    description:          event.description || "",
    participationType:    event.participationType || "individual",
    totalSlots:           event.totalSlots || "",
    genderEnabled:        event.genderSpecification?.enabled || false,
    genderType:           event.genderSpecification?.type || "none",
    reservedSlots:        event.genderSpecification?.reservedSlots || "",
    minTeamSize:          event.minTeamSize || "",
    maxTeamSize:          event.maxTeamSize || "",
    totalTeams:           event.totalTeams || "",
    genderMinCount:       event.genderSpecification?.minCount || "",
    registrationStartDate: event.registrationStartDate ? event.registrationStartDate.slice(0, 10) : "",
    registrationEndDate:   event.registrationEndDate   ? event.registrationEndDate.slice(0, 10)   : "",
    eventDate:             event.eventDate             ? event.eventDate.slice(0, 10)             : "",
    volunteers:            event.volunteers || [],
  });
  const [newVol, setNewVol] = useState({ name: "", phone: "" });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const addVolunteer = () => {
    if (!newVol.name.trim() || !newVol.phone.trim()) return;
    set("volunteers", [...form.volunteers, { name: newVol.name.trim(), phone: newVol.phone.trim() }]);
    setNewVol({ name: "", phone: "" });
  };

  const removeVolunteer = (i) => set("volunteers", form.volunteers.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setError(""); setSuccess("");
    if (form.registrationEndDate && form.registrationStartDate && form.registrationEndDate < form.registrationStartDate) {
      setError("Registration end date must be after start date."); return;
    }
    if (form.eventDate && form.registrationEndDate && form.eventDate < form.registrationEndDate) {
      setError("Event date must be after registration end date."); return;
    }
    setSaving(true);
    try {
      const payload = {
        description: form.description,
        participationType: form.participationType,
        totalSlots: Number(form.totalSlots) || 0,
        genderSpecification: {
          enabled: form.genderEnabled,
          type: form.genderType,
          reservedSlots: Number(form.reservedSlots) || 0,
          minCount: Number(form.genderMinCount) || 0,
        },
        minTeamSize:  Number(form.minTeamSize)  || 0,
        maxTeamSize:  Number(form.maxTeamSize)  || 0,
        totalTeams:   Number(form.totalTeams)   || 0,
        registrationStartDate: form.registrationStartDate || undefined,
        registrationEndDate:   form.registrationEndDate   || undefined,
        eventDate:             form.eventDate             || undefined,
        volunteers: form.volunteers,
      };
      await configureEvent(event._id, payload);
      setSuccess("Configuration saved successfully!");
    } catch (e) {
      setError(e.response?.data?.message || "Failed to save configuration.");
    } finally { setSaving(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} style={{ background: "#f3f4f6", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#374151" }}>← Back</button>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: 0 }}>Configure: {event.title}</h2>
        {event.configOwner && <span style={{ fontSize: 11, fontWeight: 700, background: "#fef3c7", color: "#d97706", padding: "4px 10px", borderRadius: 6 }}>Config Owner Locked</span>}
      </div>

      {error   && <div style={{ padding: "12px 16px", background: "#fef2f2", color: "#dc2626", borderRadius: 10, border: "1px solid #fecaca", fontSize: 13 }}>{error}</div>}
      {success && <div style={{ padding: "12px 16px", background: "#ecfdf5", color: "#059669", borderRadius: 10, border: "1px solid #a7f3d0", fontSize: 13 }}>{success}</div>}

      {/* Basic */}
      <div style={sec}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "#111827", margin: 0 }}>Basic Info</h3>
        <div>
          <label style={lbl}>Event Name</label>
          <input style={{ ...inp, background: "#f9fafb", color: "#6b7280" }} value={event.title} disabled />
        </div>
        <div>
          <label style={lbl}>Description</label>
          <textarea style={{ ...inp, minHeight: 80, resize: "vertical" }} disabled={isLocked}
            value={form.description} onChange={e => set("description", e.target.value)} />
        </div>
      </div>

      {/* Participation Type */}
      <div style={sec}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "#111827", margin: 0 }}>Participation Type</h3>
        <div style={{ display: "flex", gap: 10 }}>
          {["individual", "team"].map(t => (
            <button key={t} disabled={isLocked} onClick={() => set("participationType", t)} style={{
              padding: "10px 20px", borderRadius: 10, border: "1px solid", cursor: "pointer",
              fontWeight: 700, fontSize: 13, textTransform: "capitalize",
              background: form.participationType === t ? "#7c3aed" : "#fff",
              color: form.participationType === t ? "#fff" : "#374151",
              borderColor: form.participationType === t ? "#7c3aed" : "#e5e7eb",
            }}>{t}</button>
          ))}
        </div>

        {form.participationType === "individual" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={lbl}>Total Slots</label>
                <input style={inp} type="number" min="1" disabled={isLocked}
                  value={form.totalSlots} onChange={e => set("totalSlots", e.target.value)} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="checkbox" id="genderEnable" checked={form.genderEnabled} disabled={isLocked}
                onChange={e => set("genderEnabled", e.target.checked)} style={{ width: 16, height: 16 }} />
              <label htmlFor="genderEnable" style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Enable gender specification</label>
            </div>
            {form.genderEnabled && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={lbl}>Reserve For</label>
                  <select style={inp} disabled={isLocked} value={form.genderType} onChange={e => set("genderType", e.target.value)}>
                    <option value="none">None</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Reserved Slots</label>
                  <input style={inp} type="number" min="0" disabled={isLocked}
                    value={form.reservedSlots} onChange={e => set("reservedSlots", e.target.value)} />
                </div>
              </div>
            )}
            {form.genderEnabled && form.totalSlots && form.reservedSlots && (
              <div style={{ padding: "10px 14px", background: "#eef2ff", borderRadius: 8, fontSize: 13, color: "#4f46e5", fontWeight: 600 }}>
                Open slots: {Number(form.totalSlots) - Number(form.reservedSlots)}
              </div>
            )}
          </div>
        )}

        {form.participationType === "team" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={lbl}>Min Team Size</label><input style={inp} type="number" min="1" disabled={isLocked} value={form.minTeamSize} onChange={e => set("minTeamSize", e.target.value)} /></div>
            <div><label style={lbl}>Max Team Size</label><input style={inp} type="number" min="1" disabled={isLocked} value={form.maxTeamSize} onChange={e => set("maxTeamSize", e.target.value)} /></div>
            <div><label style={lbl}>Total Teams</label><input style={inp} type="number" min="1" disabled={isLocked} value={form.totalTeams} onChange={e => set("totalTeams", e.target.value)} /></div>
            <div>
              <label style={lbl}>Gender Reserve</label>
              <select style={inp} disabled={isLocked} value={form.genderType} onChange={e => set("genderType", e.target.value)}>
                <option value="none">None</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            {form.genderType !== "none" && (
              <div><label style={lbl}>Min Members (reserved gender)</label><input style={inp} type="number" min="0" disabled={isLocked} value={form.genderMinCount} onChange={e => set("genderMinCount", e.target.value)} /></div>
            )}
          </div>
        )}
      </div>

      {/* Dates */}
      <div style={sec}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "#111827", margin: 0 }}>Dates</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div><label style={lbl}>Registration Start</label><input style={inp} type="date" disabled={isLocked} value={form.registrationStartDate} onChange={e => set("registrationStartDate", e.target.value)} /></div>
          <div><label style={lbl}>Registration End</label><input style={inp} type="date" disabled={isLocked} value={form.registrationEndDate} onChange={e => set("registrationEndDate", e.target.value)} /></div>
          <div><label style={lbl}>Event Date</label><input style={inp} type="date" disabled={isLocked} value={form.eventDate} onChange={e => set("eventDate", e.target.value)} /></div>
        </div>
      </div>

      {/* Volunteers */}
      <div style={sec}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "#111827", margin: 0 }}>Volunteers</h3>
        {form.volunteers.map((v, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f9fafb", borderRadius: 10, border: "1px solid #e5e7eb" }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{v.name} — {v.phone}</span>
            {!isLocked && <button onClick={() => removeVolunteer(i)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 18 }}>×</button>}
          </div>
        ))}
        {!isLocked && (
          <div style={{ display: "flex", gap: 10 }}>
            <input style={{ ...inp, flex: 1 }} placeholder="Volunteer name" value={newVol.name} onChange={e => setNewVol(p => ({ ...p, name: e.target.value }))} />
            <input style={{ ...inp, flex: 1 }} placeholder="Phone number" value={newVol.phone} onChange={e => setNewVol(p => ({ ...p, phone: e.target.value }))} />
            <button onClick={addVolunteer} style={{ padding: "10px 16px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>+ Add</button>
          </div>
        )}
      </div>

      {!isLocked && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={handleSave} disabled={saving} style={{
            padding: "12px 28px", background: "#7c3aed", color: "#fff", border: "none",
            borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.6 : 1,
          }}>{saving ? "Saving…" : "Save Configuration"}</button>
        </div>
      )}
    </div>
  );
}
