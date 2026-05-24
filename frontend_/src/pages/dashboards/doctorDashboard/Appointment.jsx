// DoctorAppointments.jsx
// Backend: PUT /api/doctor/appointments/:id/status  { status: "confirmed" | "cancelled" }
// Backend: PUT /api/doctor/appointment/:id/complete  (no body)
// Backend: GET /api/doctor/appointments

import { useState, useEffect, useCallback } from "react";
import {
  MdSearch, MdRefresh, MdMoreVert,
  MdCalendarToday, MdAccessTime, MdPerson,
  MdCheckCircle, MdCancel, MdHourglassEmpty, MdEventAvailable
} from "react-icons/md";
import API from "../../../api/axios";

// ─── Constants ─────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ["all", "pending", "confirmed", "completed", "cancelled"];

const BADGE = {
  confirmed:  { bg: "bg-blue-50",   text: "text-blue-700",   ring: "ring-blue-200",  dot: "bg-blue-500",   label: "Confirmed",  icon: MdEventAvailable },
  pending:    { bg: "bg-amber-50",  text: "text-amber-700",  ring: "ring-amber-200", dot: "bg-amber-400",  label: "Pending",    icon: MdHourglassEmpty },
  completed:  { bg: "bg-emerald-50",text: "text-emerald-700",ring: "ring-emerald-200",dot:"bg-emerald-500", label: "Completed",  icon: MdCheckCircle },
  cancelled:  { bg: "bg-red-50",    text: "text-red-700",    ring: "ring-red-200",   dot: "bg-red-400",    label: "Cancelled",  icon: MdCancel },
};

// Valid transitions — must match backend exactly:
// updateAppointmentStatus: only "confirmed" | "cancelled"  (pending → confirmed/cancelled)
// markAsCompleted:         no body, separate endpoint      (confirmed → completed)
const getAllowedActions = (status) => {
  if (status === "pending")   return ["confirmed", "cancelled"];
  if (status === "confirmed") return ["completed"];           // uses /complete endpoint
  return [];
};

const ACTION_LABELS = {
  confirmed: { label: "Confirm",  color: "text-blue-600 hover:bg-blue-50" },
  completed: { label: "Complete", color: "text-emerald-600 hover:bg-emerald-50" },
  cancelled: { label: "Cancel",   color: "text-red-500 hover:bg-red-50" },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function fmtTime(t) {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
}

function getInitials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

// ─── Avatar ────────────────────────────────────────────────────────────────────
function Avatar({ name }) {
  const colors = [
    "bg-violet-100 text-violet-700",
    "bg-sky-100 text-sky-700",
    "bg-rose-100 text-rose-700",
    "bg-teal-100 text-teal-700",
    "bg-orange-100 text-orange-700",
  ];
  const idx = name?.charCodeAt(0) % colors.length || 0;
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${colors[idx]}`}>
      {getInitials(name)}
    </div>
  );
}

// ─── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const b = BADGE[status];
  if (!b) return null;
  const Icon = b.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${b.bg} ${b.text} ${b.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${b.dot}`} />
      {b.label}
    </span>
  );
}

// ─── Action Dropdown ───────────────────────────────────────────────────────────
function ActionDropdown({ id, current, onUpdate, updatingId }) {
  const [open, setOpen] = useState(false);
  const actions = getAllowedActions(current);
  const isUpdating = updatingId === id;

  if (actions.length === 0) {
    return (
      <span className="text-xs text-gray-300 font-medium select-none">Locked</span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isUpdating}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-60"
        title="Change status"
      >
        {isUpdating ? (
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <MdMoreVert className="text-gray-500 text-lg" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 z-20 bg-white border border-gray-100 rounded-xl shadow-2xl shadow-gray-200 min-w-[140px] py-1 overflow-hidden">
            {actions.map((s) => {
              const a = ACTION_LABELS[s];
              return (
                <button
                  key={s}
                  onClick={() => { onUpdate(id, s); setOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors ${a.color}`}
                >
                  {a.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Filter Chip ───────────────────────────────────────────────────────────────
function FilterChip({ label, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
        active
          ? "bg-gray-900 text-white shadow-sm"
          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
      }`}
    >
      <span className="capitalize">{label}</span>
      {count !== undefined && (
        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${active ? "bg-white/20" : "bg-gray-200"}`}>
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ filtered }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
        <MdCalendarToday className="text-gray-300 text-2xl" />
      </div>
      <p className="text-sm font-semibold text-gray-400">
        {filtered ? "No appointments match" : "No appointments yet"}
      </p>
      <p className="text-xs text-gray-300 mt-1">
        {filtered ? "Try adjusting the filters" : "Appointments will show up here"}
      </p>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter]     = useState("");
  const [updatingId, setUpdatingId]     = useState(null);

  // Fetch from GET /api/doctor/appointments
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await API.get("/doctor/appointments");
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  // Count per status for chips
  const statusCounts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = s === "all"
      ? appointments.length
      : appointments.filter((a) => a.status === s).length;
    return acc;
  }, {});

  // Filter
  const filtered = appointments.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (dateFilter && a.date?.slice(0, 10) !== dateFilter) return false;
    if (search && !a.patientId?.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Routes to the correct endpoint based on status:
  // "completed" → PUT /doctor/appointment/:id/complete  (no body)
  // "confirmed" | "cancelled" → PUT /doctor/appointments/:id/status  { status }
  const handleStatusUpdate = async (id, status) => {
    setUpdatingId(id);
    try {
      if (status === "completed") {
        await API.put(`/doctor/appointment/${id}/complete`);
      } else {
        await API.put(`/doctor/appointments/${id}/status`, { status });
      }
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status } : a))
      );
    } catch (err) {
      const msg = err?.response?.data?.message || "Status update failed. Please try again.";
      alert(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const isFiltered = statusFilter !== "all" || dateFilter || search;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-6 font-[system-ui]">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Appointments</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {filtered.length} of {appointments.length} appointments
          </p>
        </div>
        <button
          onClick={fetchAppointments}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <MdRefresh className={`text-base ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* ── Filters ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">

        {/* Search + Date */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              placeholder="Search patient name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition"
            />
          </div>
          <div className="relative">
            <MdCalendarToday className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >✕</button>
            )}
          </div>
        </div>

        {/* Status chips */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <FilterChip
              key={s}
              label={s}
              active={statusFilter === s}
              onClick={() => setStatusFilter(s)}
              count={statusCounts[s]}
            />
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">

        {/* Table header */}
        <div className="grid grid-cols-[2fr_1.5fr_1.2fr_1.5fr_80px] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">
          <div className="flex items-center gap-1"><MdPerson className="text-sm" />Patient</div>
          <div className="flex items-center gap-1"><MdCalendarToday className="text-sm" />Date</div>
          <div>Status</div>
          <div>Note</div>
          <div className="text-center">Actions</div>
        </div>

        {/* Body */}
        <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
          {loading ? (
            // Skeleton
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[2fr_1.5fr_1.2fr_1.5fr_80px] gap-4 px-5 py-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-28 bg-gray-100 rounded" />
                    <div className="h-2.5 w-20 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="space-y-1.5 self-center">
                  <div className="h-3 w-24 bg-gray-100 rounded" />
                  <div className="h-2.5 w-16 bg-gray-100 rounded" />
                </div>
                <div className="self-center"><div className="h-6 w-20 bg-gray-100 rounded-full" /></div>
                <div className="self-center"><div className="h-3 w-28 bg-gray-100 rounded" /></div>
                <div className="self-center flex justify-center"><div className="w-7 h-7 bg-gray-100 rounded-lg" /></div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <EmptyState filtered={isFiltered} />
          ) : (
            filtered.map((appt) => {
              const patient = appt.patientId || {};
              return (
                <div
                  key={appt._id}
                  className="grid grid-cols-[2fr_1.5fr_1.2fr_1.5fr_80px] gap-4 px-5 py-4 items-center hover:bg-gray-50/70 transition-colors"
                >
                  {/* Patient */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={patient.name} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {patient.name || "Unknown"}
                      </p>
                      {patient.email && (
                        <p className="text-xs text-gray-400 truncate">{patient.email}</p>
                      )}
                      {(patient.age || patient.gender) && (
                        <p className="text-xs text-gray-400">
                          {[patient.gender, patient.age ? `${patient.age}y` : ""].filter(Boolean).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date + Time */}
                  <div>
                    <p className="text-sm font-medium text-gray-800">{fmtDate(appt.date)}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <MdAccessTime className="text-sm" />
                      {fmtTime(appt.time)}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <StatusBadge status={appt.status} />
                  </div>

                  {/* Note */}
                  <div className="text-xs text-gray-500 truncate max-w-[160px]" title={appt.note || ""}>
                    {appt.note || <span className="text-gray-300">—</span>}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-center">
                    <ActionDropdown
                      id={appt._id}
                      current={appt.status}
                      onUpdate={handleStatusUpdate}
                      updatingId={updatingId}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50 text-xs text-gray-400">
            Showing {filtered.length} appointment{filtered.length !== 1 ? "s" : ""}
            {isFiltered && ` (filtered from ${appointments.length})`}
          </div>
        )}
      </div>
    </div>
  );
}