// AdminAppointments.jsx
// GET /api/admin/appointments?status=all|pending|confirmed|completed|cancelled&date=YYYY-MM-DD

import { useEffect, useState, useCallback } from "react";
import {
  MdSearch, MdRefresh, MdErrorOutline,
  MdCalendarMonth, MdAccessTime, MdFilterList,
} from "react-icons/md";
import API from "../../../api/axios";

// ── Design tokens (unified with AdminDoctors / AdminPatients) ────────────────
const AVATAR_PALETTE = [
  ["#e0f2fe", "#0c447c"], ["#ede9fe", "#3c3489"], ["#e1f5ee", "#085041"],
  ["#fef3c7", "#633806"], ["#dcfce7", "#166534"], ["#fee2e2", "#791f1f"],
];

const STATUS_FILTERS = ["all", "pending", "confirmed", "completed", "cancelled"];

const STATUS_BADGE = {
  confirmed: { bg: "#dbeafe", color: "#1d4ed8", dot: "#3b82f6", label: "Confirmed" },
  pending:   { bg: "#faeeda", color: "#633806", dot: "#ba7517", label: "Pending"   },
  completed: { bg: "#e1f5ee", color: "#085041", dot: "#10b981", label: "Completed" },
  cancelled: { bg: "#fcebeb", color: "#791f1f", dot: "#e24b4a", label: "Cancelled" },
};

const FILTER_ACTIVE = {
  all:       { bg: "#0f2744", color: "#7dd3fc", border: "#0f2744"  },
  confirmed: { bg: "#dbeafe", color: "#1d4ed8", border: "#93c5fd"  },
  pending:   { bg: "#faeeda", color: "#633806", border: "#ef9f27"  },
  completed: { bg: "#e1f5ee", color: "#085041", border: "#6ee7b7"  },
  cancelled: { bg: "#fcebeb", color: "#791f1f", border: "#f09595"  },
};

const COUNT_PILL = {
  all:       { bg: "#e0f2fe", color: "#0c447c" },
  confirmed: { bg: "#dbeafe", color: "#1d4ed8" },
  pending:   { bg: "#faeeda", color: "#633806" },
  completed: { bg: "#e1f5ee", color: "#085041" },
  cancelled: { bg: "#fcebeb", color: "#791f1f" },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "??";

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const formatTime = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
};

// ── Skeleton row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div
      className="grid px-5 py-4 items-center"
      style={{
        gridTemplateColumns: "2fr 1.6fr 1.4fr 1fr 1.2fr",
        borderBottom: "1px solid #f8fafc",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-[9px] bg-slate-100 animate-pulse flex-shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 bg-slate-100 rounded-full animate-pulse w-3/4" />
          <div className="h-2.5 bg-slate-100 rounded-full animate-pulse w-1/2" />
        </div>
      </div>
      {[1, 2, 3, 4].map((j) => (
        <div key={j} className="h-3 bg-slate-100 rounded-full animate-pulse w-2/3" />
      ))}
    </div>
  );
}

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUS_BADGE[status] || STATUS_BADGE.pending;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
      style={{ background: s.bg, color: s.color }}
    >
      <span className="w-[5px] h-[5px] rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [filtered,     setFiltered]     = useState([]);
  const [status,       setStatus]       = useState("all");
  const [search,       setSearch]       = useState("");
  const [dateFilter,   setDateFilter]   = useState("");
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (status !== "all") params.append("status", status);
      if (dateFilter)       params.append("date",   dateFilter);
      const { data } = await API.get(`/admin/appointments?${params.toString()}`);
      setAppointments(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [status, dateFilter]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  useEffect(() => {
    if (!search) { setFiltered(appointments); return; }
    setFiltered(
      appointments.filter((a) =>
        a.patientId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        a.doctorId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        a.doctorId?.speciality?.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, appointments]);

  // Counts per status (across all loaded appointments)
  const counts = {
    all:       appointments.length,
    pending:   appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  };

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-black tracking-tight text-slate-900"
            style={{ letterSpacing: "-0.02em" }}
          >
            Appointments
          </h1>
          <p className="text-sm text-slate-400 mt-1">All appointments across the platform</p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {STATUS_FILTERS.map((f) => {
              const p = COUNT_PILL[f];
              return (
                <span
                  key={f}
                  className="px-3 py-1 rounded-full text-xs font-medium capitalize"
                  style={{ background: p.bg, color: p.color }}
                >
                  {counts[f]} {f}
                </span>
              );
            })}
          </div>
        </div>

        {/* Refresh */}
        <button
          onClick={fetchAppointments}
          className="p-2 rounded-xl transition-colors mt-1"
          style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#f8fafc")}
          title="Refresh"
        >
          <MdRefresh size={18} className="text-slate-400" />
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 flex-wrap">

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <MdSearch
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search patient or doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-[10px] text-sm text-slate-700 outline-none transition-all"
            style={{
              border: "1px solid #e2e8f0",
              background: "#fff",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          />
        </div>

        {/* Date filter */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-[10px]"
          style={{
            border: "1px solid #e2e8f0",
            background: "#fff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <MdFilterList size={15} className="text-slate-400 flex-shrink-0" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="outline-none text-sm text-slate-600 bg-transparent"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter("")}
              className="text-slate-300 hover:text-slate-500 text-xs transition-colors leading-none"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status filter buttons */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((f) => {
            const isActive = status === f;
            const a = FILTER_ACTIVE[f];
            return (
              <button
                key={f}
                onClick={() => setStatus(f)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium capitalize transition-all"
                style={
                  isActive
                    ? { background: a.bg, color: a.color, border: `1px solid ${a.border}` }
                    : { background: "#fff", color: "#64748b", border: "1px solid #e2e8f0" }
                }
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
          style={{ background: "#fcebeb", border: "1px solid #fca5a5", color: "#791f1f" }}
        >
          <MdErrorOutline size={17} className="flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            onClick={fetchAppointments}
            className="text-xs font-semibold flex items-center gap-1 underline underline-offset-2"
          >
            <MdRefresh size={13} /> Retry
          </button>
        </div>
      )}

      {/* ── Result count ── */}
      {!loading && !error && (
        <p className="text-xs text-slate-400 font-medium -mb-1">
          Showing <strong className="text-slate-600">{filtered.length}</strong> appointment{filtered.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* ── Table ── */}
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{ border: "1px solid #f1f5f9", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
      >
        {/* Head */}
        <div
          className="grid px-5 py-3"
          style={{
            gridTemplateColumns: "2fr 1.6fr 1.4fr 1fr 1.2fr",
            background: "#f8fafc",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          {["Patient", "Doctor", "Date & Time", "Status", "Note"].map((h) => (
            <span key={h} className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {h}
            </span>
          ))}
        </div>

        {/* Body */}
        {loading ? (
          [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
              <MdCalendarMonth size={22} className="text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-400">No appointments found</p>
            <p className="text-xs text-slate-300">Try adjusting your search, filter, or date</p>
          </div>
        ) : (
          filtered.map((appt, i) => {
            const [avatarBg, avatarColor] = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
            return (
              <div
                key={appt._id}
                className="grid px-5 py-3.5 items-center transition-colors"
                style={{
                  gridTemplateColumns: "2fr 1.6fr 1.4fr 1fr 1.2fr",
                  borderBottom: i < filtered.length - 1 ? "1px solid #f8fafc" : "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* Patient */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-[9px] flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: avatarBg, color: avatarColor }}
                  >
                    {getInitials(appt.patientId?.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {appt.patientId?.name || "—"}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {appt.patientId?.email || "—"}
                    </p>
                  </div>
                </div>

                {/* Doctor */}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">
                    {appt.doctorId?.name || "—"}
                  </p>
                  {appt.doctorId?.speciality ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-medium">
                      {appt.doctorId.speciality}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                </div>

                {/* Date & Time */}
                <div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-700 font-medium">
                    <MdCalendarMonth size={13} className="text-sky-400 flex-shrink-0" />
                    {formatDate(appt.date)}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-sky-500 font-medium mt-0.5">
                    <MdAccessTime size={11} className="flex-shrink-0" />
                    {formatTime(appt.time)}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <StatusBadge status={appt.status} />
                </div>

                {/* Note */}
                <div className="text-xs text-slate-400 truncate pr-1">
                  {appt.note || (
                    <span className="text-slate-200 italic">No note</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}