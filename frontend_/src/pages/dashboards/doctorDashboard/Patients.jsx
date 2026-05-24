// MyPatients.jsx
// GET  /doctor/patients                          → list of patients (User docs)
// GET  /doctor/appointments                      → to compute completed count per patient
// GET  /doctor/patients/:id/health-records       → health history drawer
// POST /doctor/patients/:id/health-record        → add health record (multipart)
// POST /doctor/medicine                          → add medicine modal
// Routes from doctorRoutes.js + appointmentController.js

import { useState, useEffect, useCallback, useRef } from "react";
import {
  MdSearch, MdPerson, MdAdd, MdClose,
  MdFavorite, MdTrendingUp, MdThermostat, MdAir,
  MdCheckCircle, MdErrorOutline, MdRefresh,
  MdMedicalServices, MdHistory,
  MdCloudUpload, MdInsertDriveFile, MdDeleteOutline,
  MdDownload, MdOpenInNew, MdLocalPharmacy, MdAccessTime,
  MdCalendarToday,
} from "react-icons/md";
import API from "../../../api/axios";

// ─── Constants ─────────────────────────────────────────────────────────────────
const TIME_FILTERS = [
  { key: "all",  label: "All time" },
  { key: "24h",  label: "Past 24 hrs" },
  { key: "7d",   label: "Past 7 days" },
  { key: "30d",  label: "Past 30 days" },
];

const STATUS_COLORS = {
  Good:   { bg: "bg-teal-50",   text: "text-teal-700",   dot: "bg-teal-500"   },
  Normal: { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500"   },
  Bad:    { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-500"    },
};

const AVATAR_GRADS = [
  ["#0ea5e9","#0369a1"],["#3b82f6","#1d4ed8"],["#06b6d4","#0e7490"],
  ["#6366f1","#4338ca"],["#a855f7","#7c3aed"],["#ec4899","#be185d"],
];

const VITAL_FIELDS = [
  { key: "bp",          label: "Blood Pressure", placeholder: "120/80",  unit: "mmHg", icon: MdTrendingUp, color: "text-blue-500",   bg: "bg-blue-50"   },
  { key: "sugar",       label: "Blood Sugar",    placeholder: "95",      unit: "mg/dL",icon: MdFavorite,   color: "text-red-500",    bg: "bg-red-50"    },
  { key: "spo2",        label: "SpO2",           placeholder: "98",      unit: "%",    icon: MdAir,        color: "text-indigo-500", bg: "bg-indigo-50" },
  { key: "temperature", label: "Temperature",    placeholder: "98.6",    unit: "°F",   icon: MdThermostat, color: "text-amber-500",  bg: "bg-amber-50"  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "PT";
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// Returns cutoff Date for a time filter key
function getCutoff(filterKey) {
  const now = new Date();
  if (filterKey === "24h") return new Date(now - 24 * 60 * 60 * 1000);
  if (filterKey === "7d")  return new Date(now - 7  * 24 * 60 * 60 * 1000);
  if (filterKey === "30d") return new Date(now - 30 * 24 * 60 * 60 * 1000);
  return null; // "all"
}

// ─── Add Medicine Modal ─────────────────────────────────────────────────────────
// POST /doctor/medicine  { appointmentId, name, dosage, timing[], duration, instructions }
function AddMedicineModal({ patient, appointments, onClose, onSuccess }) {
  const [form, setForm] = useState({
    appointmentId: "", name: "", dosage: "",
    timing: [], duration: 7, instructions: "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const TIMING_OPTIONS = ["Morning", "Afternoon", "Evening", "Night"];

  const toggleTiming = (t) =>
    setForm((p) => ({
      ...p,
      timing: p.timing.includes(t) ? p.timing.filter((x) => x !== t) : [...p.timing, t],
    }));

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.appointmentId) { setError("Please select an appointment"); return; }
    if (!form.name.trim())   { setError("Medicine name is required"); return; }
    if (!form.dosage.trim()) { setError("Dosage is required"); return; }
    if (!form.timing.length) { setError("Select at least one timing"); return; }

    setSaving(true); setError("");
    try {
      await API.post("/doctor/medicine", {
        appointmentId: form.appointmentId,
        name: form.name,
        dosage: form.dosage,
        timing: form.timing,
        duration: Number(form.duration),
        instructions: form.instructions,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add medicine");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                <MdLocalPharmacy size={18} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-800">Add Medicine</h2>
                <p className="text-xs text-gray-400 mt-0.5">{patient.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
              <MdClose size={17} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                <MdErrorOutline size={16} /> {error}
              </div>
            )}

            {/* Appointment */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                Linked Appointment *
              </label>
              <select
                name="appointmentId" value={form.appointmentId} onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
              >
                <option value="">Select appointment…</option>
                {appointments.map((a) => (
                  <option key={a._id} value={a._id}>
                    {fmtDate(a.date)} – {a.time} ({a.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Name + Dosage */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Medicine Name *</label>
                <input
                  name="name" value={form.name} onChange={handleChange}
                  placeholder="e.g. Paracetamol"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Dosage *</label>
                <input
                  name="dosage" value={form.dosage} onChange={handleChange}
                  placeholder="e.g. 500mg"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
                />
              </div>
            </div>

            {/* Timing */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Timing *</label>
              <div className="flex gap-2 flex-wrap">
                {TIMING_OPTIONS.map((t) => (
                  <button
                    key={t} type="button" onClick={() => toggleTiming(t)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition
                      ${form.timing.includes(t)
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                  >
                    <MdAccessTime size={13} /> {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                Duration (days)
              </label>
              <input
                type="number" name="duration" value={form.duration} onChange={handleChange}
                min={1} max={365}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
              />
            </div>

            {/* Instructions */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Instructions</label>
              <textarea
                name="instructions" value={form.instructions} onChange={handleChange} rows={2}
                placeholder="e.g. Take after meals…"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition"
              />
            </div>

            <button
              onClick={handleSubmit} disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold hover:from-emerald-600 hover:to-emerald-700 transition shadow-lg shadow-emerald-200 disabled:opacity-60"
            >
              {saving
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                : <><MdCheckCircle size={17} /> Add Medicine</>
              }
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Add Health Record Modal ───────────────────────────────────────────────────
// POST /doctor/patients/:id/health-record  (multipart)
function AddHealthRecordModal({ patient, appointments, onClose, onSuccess }) {
  const [form, setForm] = useState({
    appointmentId: "", bp: "", sugar: "", spo2: "", temperature: "",
    notes: "", status: "Normal",
  });
  const [file,   setFile]   = useState(null);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");
  const fileRef = useRef();

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleFile = (e) => { const f = e.target.files[0]; if (f) setFile(f); };
  const handleDrop = (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); };

  const handleSubmit = async () => {
    if (!form.appointmentId) { setError("Please select an appointment"); return; }
    if (!form.bp && !form.sugar && !form.spo2 && !form.temperature) {
      setError("At least one vital is required"); return;
    }
    setSaving(true); setError("");
    try {
      const fd = new FormData();
      fd.append("records", JSON.stringify({ bp: form.bp, sugar: form.sugar, spo2: form.spo2, temperature: form.temperature }));
      fd.append("appointmentId", form.appointmentId);
      fd.append("notes", form.notes);
      fd.append("status", form.status);
      if (file) fd.append("file", file);

      await API.post(`/doctor/patients/${patient._id}/health-record`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save record");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <MdMedicalServices size={18} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-800">Add Health Record</h2>
                <p className="text-xs text-gray-400 mt-0.5">{patient.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
              <MdClose size={17} />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                <MdErrorOutline size={16} /> {error}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Linked Appointment *</label>
              <select
                name="appointmentId" value={form.appointmentId} onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              >
                <option value="">Select appointment…</option>
                {appointments.map((a) => (
                  <option key={a._id} value={a._id}>
                    {fmtDate(a.date)} – {a.time} ({a.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2.5">Vitals</label>
              <div className="grid grid-cols-2 gap-3">
                {VITAL_FIELDS.map(({ key, label, placeholder, unit, icon: Icon, color, bg }) => (
                  <div key={key} className={`p-3 ${bg} rounded-xl`}>
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${color} mb-1.5`}>
                      <Icon size={14} /> {label}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text" name={key} value={form[key]} placeholder={placeholder}
                        onChange={handleChange}
                        className="flex-1 bg-white border border-white/80 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                      <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">{unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Overall Status</label>
              <div className="flex gap-2">
                {["Good", "Normal", "Bad"].map((s) => {
                  const c = STATUS_COLORS[s];
                  return (
                    <button key={s} type="button" onClick={() => setForm((p) => ({ ...p, status: s }))}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold border transition
                        ${form.status === s ? `${c.bg} ${c.text} border-current/30 ring-2 ring-offset-1 ring-current/30` : "border-gray-200 text-gray-400 hover:bg-gray-50"}`}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Doctor's Notes</label>
              <textarea
                name="notes" value={form.notes} onChange={handleChange} rows={3}
                placeholder="Clinical notes, observations…"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Upload Test Report</label>
              <div
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition
                  ${file ? "border-teal-300 bg-teal-50" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30"}`}
                onClick={() => fileRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <MdInsertDriveFile size={28} className="text-teal-500" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-teal-700">{file.name}</p>
                      <p className="text-xs text-teal-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button type="button"
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="ml-2 w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-red-500 hover:bg-red-200 transition">
                      <MdDeleteOutline size={15} />
                    </button>
                  </div>
                ) : (
                  <>
                    <MdCloudUpload size={28} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400 font-medium">Drop file here or click to browse</p>
                    <p className="text-xs text-gray-300 mt-1">PDF, JPG, PNG, DOC up to 10MB</p>
                  </>
                )}
                <input ref={fileRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleFile} />
              </div>
            </div>

            <button
              onClick={handleSubmit} disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold hover:from-blue-600 hover:to-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-60"
            >
              {saving
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
                : <><MdCheckCircle size={17} /> Save Health Record</>
              }
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Health History Drawer ─────────────────────────────────────────────────────
// GET /doctor/patients/:id/health-records
function HealthHistoryDrawer({ patient, onClose }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (!patient) return;
    setLoading(true); setError("");
    // Correct endpoint from doctorRoutes.js
    API.get(`/doctor/patients/${patient._id}/health-records`)
      .then(({ data }) => setRecords(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to load health records"))
      .finally(() => setLoading(false));
  }, [patient]);

  if (!patient) return null;

  const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:5000";

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-[420px] bg-white z-40 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-gray-800">Health History</h2>
            <p className="text-xs text-gray-400 mt-0.5">{patient.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
            <MdClose size={17} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
            ))
          ) : error ? (
            <div className="py-10 text-center text-sm text-red-400">{error}</div>
          ) : records.length === 0 ? (
            <div className="py-14 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                <MdHistory size={22} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400 font-medium">No health records yet</p>
              <p className="text-xs text-gray-300">Records added via "Add Record" will appear here</p>
            </div>
          ) : (
            records.map((r) => {
              const sc     = STATUS_COLORS[r.status] || STATUS_COLORS.Normal;
              // records field can be a plain object or Map
              const vitals = r.records instanceof Map
                ? Object.fromEntries(r.records)
                : typeof r.records === "object" ? r.records : {};

              const fileUrl = r.fileUrl ? `${BASE_URL}${r.fileUrl}` : null;

              return (
                <div key={r._id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  {/* Top row: date + status */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <MdCalendarToday size={12} />
                      {fmtDate(r.appointmentId?.date)}
                      {r.appointmentId?.time && <span className="text-gray-400">· {r.appointmentId.time}</span>}
                    </div>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${sc.bg} ${sc.text}`}>
                      {r.status || "Normal"}
                    </span>
                  </div>

                  {/* Vitals grid — only show non-empty */}
                  {Object.keys(vitals).length > 0 && (
                    <div className="grid grid-cols-2 gap-1.5 mb-3">
                      {VITAL_FIELDS.map(({ key, label, unit, icon: Icon, color }) => {
                        const val = vitals[key];
                        if (!val) return null;
                        return (
                          <div key={key} className="flex items-center gap-1.5 text-xs bg-white rounded-lg px-2.5 py-1.5 border border-gray-100">
                            <Icon size={12} className={color} />
                            <span className="text-gray-500">{label}:</span>
                            <span className="font-bold text-gray-700 ml-auto">{val} {unit}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Notes */}
                  {r.notes && (
                    <p className="text-xs text-gray-500 italic border-t border-gray-200 pt-2 mb-2">{r.notes}</p>
                  )}

                  {/* File — View + Download */}
                  {fileUrl && (
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <a
                        href={fileUrl} target="_blank" rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition"
                      >
                        <MdOpenInNew size={13} /> View
                      </a>
                      <a
                        href={fileUrl} download
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition"
                      >
                        <MdDownload size={13} /> Download
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

// ─── Patient Card ──────────────────────────────────────────────────────────────
function PatientCard({ patient, completedCount, index, onAddRecord, onAddMedicine, onViewHistory }) {
  const [g1, g2] = AVATAR_GRADS[index % AVATAR_GRADS.length];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Gradient strip */}
      <div className="h-1.5" style={{ background: `linear-gradient(90deg,${g1},${g2})` }} />

      <div className="p-5">
        {/* Avatar + Info */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md text-sm"
            style={{ background: `linear-gradient(135deg,${g1},${g2})` }}
          >
            {getInitials(patient.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-gray-800 truncate">{patient.name}</div>
            <div className="text-xs text-gray-400 mt-0.5 truncate">{patient.email}</div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {patient.gender && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">{patient.gender}</span>
              )}
              {patient.age && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-semibold">{patient.age} yrs</span>
              )}
            </div>
          </div>
        </div>

        {/* Completed visits count */}
        <div className="p-3 bg-emerald-50 rounded-xl mb-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <MdCheckCircle size={16} className="text-emerald-600" />
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-700 leading-none">{completedCount}</div>
            <div className="text-[10px] text-emerald-500 font-medium mt-0.5">Completed visits</div>
          </div>
        </div>

        {/* 3 action buttons */}
        <div className="flex gap-2">
          {/* Add Medicine */}
          <button
            onClick={() => onAddMedicine(patient)}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition shadow-sm shadow-emerald-100"
            title="Add Medicine"
          >
            <MdLocalPharmacy size={14} /> Medicine
          </button>

          {/* Add Record */}
          <button
            onClick={() => onAddRecord(patient)}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-blue-500 text-white text-xs font-bold hover:bg-blue-600 transition shadow-sm shadow-blue-100"
            title="Add Health Record"
          >
            <MdAdd size={14} /> Record
          </button>

          {/* Health History */}
          <button
            onClick={() => onViewHistory(patient)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-gray-500 text-xs font-semibold hover:bg-gray-50 transition flex items-center gap-1"
            title="Health History"
          >
            <MdHistory size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function MyPatients() {
  const [patients,      setPatients]      = useState([]);
  const [allAppts,      setAllAppts]      = useState([]); // all doctor appointments (for counting)
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [search,        setSearch]        = useState("");
  const [timeFilter,    setTimeFilter]    = useState("all");

  // Modals
  const [recordModal,   setRecordModal]   = useState(null); // patient
  const [medModal,      setMedModal]      = useState(null); // patient
  const [histPatient,   setHistPatient]   = useState(null); // patient

  // Appointments for the selected patient (modal)
  const [modalAppts,    setModalAppts]    = useState([]);

  // ── Fetch patients + all appointments (for completed count) ──
  const fetchAll = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [pRes, aRes] = await Promise.all([
        API.get("/doctor/patients"),
        API.get("/doctor/appointments"),
      ]);
      setPatients(Array.isArray(pRes.data) ? pRes.data : []);
      setAllAppts(Array.isArray(aRes.data) ? aRes.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load patients");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Compute completed count per patient ──
  // Count appointments where status === "completed" for this patient
  const completedCountFor = (patientId) =>
    allAppts.filter(
      (a) =>
        (a.patientId?._id === patientId || a.patientId === patientId) &&
        a.status === "completed"
    ).length;

  // ── Time filter: filter patients who have at least one appointment in window ──
  const cutoff = getCutoff(timeFilter);

  const filteredPatients = patients.filter((p) => {
    // Search by name
    if (search && !p.name?.toLowerCase().includes(search.toLowerCase())) return false;

    // Time filter: check if any appointment for this patient falls within window
    if (cutoff) {
      const patientAppts = allAppts.filter(
        (a) => a.patientId?._id === p._id || a.patientId === p._id
      );
      const hasRecent = patientAppts.some((a) => new Date(a.date) >= cutoff);
      if (!hasRecent) return false;
    }

    return true;
  });

  // ── Open modal: load appointments for that patient ──
  const openModal = async (patient, type) => {
    try {
      // Filter from already-fetched allAppts instead of a new request
      const patientAppts = allAppts.filter(
        (a) => a.patientId?._id === patient._id || a.patientId === patient._id
      );
      setModalAppts(patientAppts);
    } catch {
      setModalAppts([]);
    }
    if (type === "record")   setRecordModal(patient);
    if (type === "medicine") setMedModal(patient);
  };

  return (
    <div className="space-y-5">
      {/* Modals */}
      {recordModal && (
        <AddHealthRecordModal
          patient={recordModal}
          appointments={modalAppts}
          onClose={() => setRecordModal(null)}
          onSuccess={fetchAll}
        />
      )}
      {medModal && (
        <AddMedicineModal
          patient={medModal}
          appointments={modalAppts}
          onClose={() => setMedModal(null)}
          onSuccess={fetchAll}
        />
      )}
      <HealthHistoryDrawer patient={histPatient} onClose={() => setHistPatient(null)} />

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-800">My Patients</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {filteredPatients.length} patient{filteredPatients.length !== 1 ? "s" : ""}
            {timeFilter !== "all" && ` · ${TIME_FILTERS.find((f) => f.key === timeFilter)?.label}`}
          </p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:text-blue-700 transition disabled:opacity-50"
        >
          <MdRefresh size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search patient name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
          />
        </div>

        {/* Time filter chips */}
        <div className="flex gap-2 flex-wrap">
          {TIME_FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTimeFilter(key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap
                ${timeFilter === key
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3 animate-pulse">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-gray-100 rounded w-3/4" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-14 bg-gray-100 rounded-xl" />
              <div className="h-9 bg-gray-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-5 bg-white rounded-2xl border border-red-100 text-red-600 text-sm">
          <MdErrorOutline size={18} /> {error}
          <button onClick={fetchAll} className="ml-auto text-xs font-semibold underline">Retry</button>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="py-16 flex flex-col items-center gap-2 bg-white rounded-2xl border border-gray-100">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
            <MdPerson size={26} className="text-blue-400" />
          </div>
          <p className="text-sm text-gray-400 font-medium">No patients found</p>
          <p className="text-xs text-gray-300">
            {search || timeFilter !== "all" ? "Try adjusting search or time filter" : "Patients appear here once you have appointments"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filteredPatients.map((p, i) => (
            <PatientCard
              key={p._id}
              patient={p}
              index={i}
              completedCount={completedCountFor(p._id)}
              onAddRecord={(pt)   => openModal(pt, "record")}
              onAddMedicine={(pt) => openModal(pt, "medicine")}
              onViewHistory={setHistPatient}
            />
          ))}
        </div>
      )}
    </div>
  );
}