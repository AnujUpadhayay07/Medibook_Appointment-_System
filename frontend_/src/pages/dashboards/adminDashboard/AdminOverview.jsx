// AdminOverview.jsx — Premium redesign
// GET /api/admin/overview → { stats, recentAppointments, pendingApprovals, todayAppointmentsList }

import { useEffect, useState, useCallback } from "react";
import {
  MdPeople, MdVerified, MdPending, MdCalendarMonth,
  MdCheckCircle, MdCancel, MdRefresh, MdErrorOutline,
  MdArrowForward, MdAccessTime, MdMedicalServices,
} from "react-icons/md";
import API from "../../../api/axios";

// ─── Badge config ─────────────────────────────────────────────────────────────
const BADGE = {
  confirmed: { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500",    label: "Confirmed" },
  pending:   { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400",   label: "Pending"   },
  completed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Completed" },
  cancelled: { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-400",     label: "Cancelled" },
};

const STAT_META = [
  {
    key: "totalDoctors",
    label: "Total Doctors",
    sub: "registered",
    icon: MdMedicalServices,
    grad: "linear-gradient(135deg,#0369a1,#0ea5e9)",
    light: "#e0f2fe",
    accent: "#0369a1",
  },
  {
    key: "totalPatients",
    label: "Total Patients",
    sub: "registered",
    icon: MdPeople,
    grad: "linear-gradient(135deg,#6d28d9,#8b5cf6)",
    light: "#ede9fe",
    accent: "#6d28d9",
  },
  {
    key: "todayAppointments",
    label: "Today's Appointments",
    sub: "scheduled",
    icon: MdCalendarMonth,
    grad: "linear-gradient(135deg,#0f766e,#14b8a6)",
    light: "#ccfbf1",
    accent: "#0f766e",
  },
  {
    key: "pendingDoctors",
    label: "Pending Approvals",
    sub: "awaiting review",
    icon: MdPending,
    grad: "linear-gradient(135deg,#b45309,#f59e0b)",
    light: "#fef3c7",
    accent: "#b45309",
  },
];

const AVATAR_PALETTE = [
  ["#0ea5e9","#0369a1"],["#8b5cf6","#6d28d9"],["#14b8a6","#0f766e"],
  ["#f59e0b","#b45309"],["#10b981","#065f46"],["#ef4444","#b91c1c"],
];

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "??";

const formatTime = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Sk({ w = "w-full", h = "h-4" }) {
  return <div className={`animate-pulse bg-slate-100 rounded-lg ${w} ${h}`} />;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, sub, value, icon: Icon, grad, light, accent }) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden bg-white cursor-default"
      style={{
        border: "1px solid #f1f5f9",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        transition: "box-shadow 0.25s, transform 0.25s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.10)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div className="h-1 w-full" style={{ background: grad }} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-5">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: light }}
          >
            <Icon size={21} style={{ color: accent }} />
          </div>
          <div
            className="w-16 h-16 rounded-full opacity-[0.06] -mt-2 -mr-2"
            style={{ background: grad }}
          />
        </div>
        <div
          className="text-4xl font-black tracking-tight mb-1"
          style={{ color: "#0f172a", fontVariantNumeric: "tabular-nums" }}
        >
          {value ?? 0}
        </div>
        <div className="text-sm font-semibold text-slate-600">{label}</div>
        <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
      </div>
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHead({ title, badge, onAction, actionLabel, accentColor = "#0ea5e9" }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div className="w-1 h-5 rounded-full" style={{ background: accentColor }} />
        <span className="text-sm font-bold text-slate-700">{title}</span>
        {badge != null && badge > 0 && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
            {badge}
          </span>
        )}
      </div>
      {onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-1 text-xs font-semibold transition-colors group"
          style={{ color: accentColor }}
        >
          {actionLabel}
          <MdArrowForward size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminOverview({ setActiveSection }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: d } = await API.get("/admin/overview");
      setData(d);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load overview");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOverview(); }, [fetchOverview]);

  const stats   = data?.stats              || {};
  const recent  = data?.recentAppointments || [];
  const pending = data?.pendingApprovals   || [];
  const todayList = data?.todayAppointmentsList || [];

  const handleApprove = async (id) => {
    try {
      await API.put(`/admin/doctors/${id}/approve`);
      fetchOverview();
    } catch (err) {
      alert(err.response?.data?.message || "Approval failed");
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Hero Header ── */}
      <div
        className="relative rounded-2xl overflow-hidden px-7 py-6"
        style={{
          background: "linear-gradient(130deg,#0c1a2e 0%,#0f2744 50%,#0369a1 100%)",
          boxShadow: "0 16px 48px rgba(3,105,161,0.25)",
        }}
      >
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/[0.04] pointer-events-none" />
        <div className="absolute top-4 right-32 w-24 h-24 rounded-full bg-white/[0.04] pointer-events-none" />
        <div className="absolute -bottom-10 right-20 w-36 h-36 rounded-full bg-sky-400/10 pointer-events-none" />
        <svg className="absolute right-0 top-0 h-full w-72 opacity-[0.08] pointer-events-none"
          viewBox="0 0 200 80" preserveAspectRatio="none" fill="none">
          <path d="M0 40 L25 40 L35 40 L45 8 L55 72 L65 40 L85 40 L95 22 L105 58 L115 40 L155 40 L165 18 L175 62 L185 40 L200 40"
            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span
                className="text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest"
                style={{ background: "rgba(255,255,255,0.1)", color: "#7dd3fc" }}
              >
                🛡️ Admin Panel
              </span>
              <h1 className="text-3xl font-black tracking-tight text-white mt-2" style={{ letterSpacing: "-0.02em" }}>
                Dashboard Overview
              </h1>
              <p className="text-sky-200/70 text-sm mt-1">
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {[
                { label: "Approved", value: stats.approvedDoctors ?? "—", color: "#34d399" },
                { label: "Pending",  value: stats.pendingDoctors  ?? "—", color: "#fbbf24" },
              ].map((p) => (
                <div key={p.label} className="px-4 py-3 rounded-xl text-center"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                  <div className="text-lg font-black" style={{ color: p.color }}>{p.value}</div>
                  <div className="text-[10px] font-medium text-white/50 mt-0.5">{p.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 mt-5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            {[
              { label: "Completed", value: stats.completedAppointments ?? 0, icon: MdCheckCircle,  color: "#34d399" },
              { label: "Pending",   value: stats.pendingAppointments   ?? 0, icon: MdPending,      color: "#fbbf24" },
              { label: "Cancelled", value: stats.cancelledAppointments ?? 0, icon: MdCancel,       color: "#f87171" },
              { label: "Total",     value: stats.totalAppointments     ?? 0, icon: MdCalendarMonth, color: "#7dd3fc" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <s.icon size={14} style={{ color: s.color }} />
                <span className="text-sm font-black text-white">{s.value}</span>
                <span className="text-xs text-white/40">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          <MdErrorOutline size={18} className="flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={fetchOverview} className="flex items-center gap-1 text-xs font-semibold hover:text-red-700">
            <MdRefresh size={14} /> Retry
          </button>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-4 gap-4">
        {loading
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                <div className="flex justify-between"><Sk w="w-11" h="h-11" /><Sk w="w-12" h="h-12" /></div>
                <Sk w="w-16" h="h-9" /><Sk w="w-28" h="h-3" />
              </div>
            ))
          : STAT_META.map((m) => (
              <StatCard key={m.key} label={m.label} sub={m.sub}
                value={stats[m.key]} icon={m.icon} grad={m.grad} light={m.light} accent={m.accent} />
            ))
        }
      </div>

      {/* ── Bottom Grid ── */}
      <div className="grid grid-cols-[1.35fr_1fr] gap-4">

        {/* Recent Appointments */}
        <div className="bg-white rounded-2xl p-5"
          style={{ border: "1px solid #f1f5f9", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <SectionHead
            title="Recent Appointments"
            onAction={() => setActiveSection?.("appointments")}
            actionLabel="See all"
          />
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Sk w="w-10" h="h-10" />
                  <div className="flex-1 space-y-2"><Sk w="w-3/4" h="h-3" /><Sk w="w-1/2" h="h-2.5" /></div>
                  <Sk w="w-20" h="h-6" />
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="py-14 flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center">
                <MdCalendarMonth size={22} className="text-sky-400" />
              </div>
              <p className="text-slate-400 text-sm font-medium">No appointments yet</p>
            </div>
          ) : (
            <div>
              {recent.map((appt, i) => {
                const badge = BADGE[appt.status] || BADGE.pending;
                const [g1, g2] = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
                return (
                  <div key={appt._id}
                    className={`flex items-center gap-3.5 py-3.5 ${i < recent.length - 1 ? "border-b border-slate-50" : ""}`}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                      style={{ background: `linear-gradient(135deg,${g1},${g2})` }}>
                      {getInitials(appt.patientId?.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-800 truncate">{appt.patientId?.name || "—"}</div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400">
                        <MdAccessTime size={11} className="text-sky-400" />
                        <span className="text-sky-600 font-medium">{formatTime(appt.time)}</span>
                        <span className="text-slate-200">·</span>
                        <span className="truncate">Dr. {appt.doctorId?.name || "—"}</span>
                        {appt.doctorId?.speciality && (
                          <>
                            <span className="text-slate-200">·</span>
                            <span className="text-teal-600 font-medium truncate">{appt.doctorId.speciality}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0 ${badge.bg} ${badge.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-2xl p-5 flex flex-col"
          style={{ border: "1px solid #f1f5f9", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <SectionHead
            title="Pending Approvals"
            badge={stats.pendingDoctors}
            onAction={() => setActiveSection?.("doctors")}
            actionLabel="Manage all"
            accentColor="#f59e0b"
          />
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Sk w="w-10" h="h-10" />
                  <div className="flex-1 space-y-2"><Sk w="w-3/4" h="h-3" /><Sk w="w-1/2" h="h-2.5" /></div>
                  <Sk w="w-16" h="h-7" />
                </div>
              ))}
            </div>
          ) : pending.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <MdCheckCircle size={22} className="text-emerald-500" />
              </div>
              <p className="text-slate-400 text-sm font-medium">All doctors approved!</p>
              <p className="text-slate-300 text-xs">No pending reviews</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {pending.map((doc, i) => {
                const [g1, g2] = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
                return (
                  <div key={doc._id} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: "linear-gradient(135deg,#fffbeb,#fef3c7)", border: "1px solid #fde68a" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                      style={{ background: `linear-gradient(135deg,${g1},${g2})` }}>
                      {getInitials(doc.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-800 truncate">{doc.name}</div>
                      <div className="text-xs text-amber-600 font-medium mt-0.5 truncate">
                        {doc.speciality || "—"}{doc.experience ? ` · ${doc.experience} yrs` : ""}
                      </div>
                    </div>
                    <button
                      onClick={() => handleApprove(doc._id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white flex-shrink-0 transition-opacity hover:opacity-80"
                      style={{ background: "linear-gradient(135deg,#059669,#10b981)" }}
                    >
                      <MdCheckCircle size={13} /> Approve
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer stats */}
          {!loading && !error && (
            <div className="mt-5 pt-4 flex justify-between" style={{ borderTop: "1px solid #f8fafc" }}>
              {[
                { label: "Total Doctors", value: stats.totalDoctors    ?? 0, color: "#0369a1" },
                { label: "Approved",      value: stats.approvedDoctors ?? 0, color: "#059669" },
                { label: "Pending",       value: stats.pendingDoctors  ?? 0, color: "#b45309" },
              ].map((s) => (
                <div key={s.label} className="flex-1 text-center">
                  <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Today's Appointments Table ── */}
      {!loading && !error && todayList.length > 0 && (
        <div className="bg-white rounded-2xl overflow-hidden"
          style={{ border: "1px solid #f1f5f9", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div className="px-5 py-4 flex items-center gap-2.5" style={{ borderBottom: "1px solid #f8fafc" }}>
            <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(#14b8a6,#0f766e)" }} />
            <span className="text-sm font-bold text-slate-700">Today's Appointments</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
              {todayList.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Patient","Doctor","Speciality","Time","Status"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {todayList.map((a, i) => {
                  const badge = BADGE[a.status] || BADGE.pending;
                  const [g1, g2] = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
                  return (
                    <tr key={a._id}
                      style={{ borderBottom: i < todayList.length - 1 ? "1px solid #f8fafc" : "none", transition: "background 0.15s" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
                            style={{ background: `linear-gradient(135deg,${g1},${g2})` }}>
                            {getInitials(a.patientId?.name)}
                          </div>
                          <span className="text-sm font-semibold text-slate-700">{a.patientId?.name || "—"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600 font-medium">
                        {a.doctorId?.name ? `Dr. ${a.doctorId.name}` : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        {a.doctorId?.speciality
                          ? <span className="text-xs px-2 py-1 rounded-full bg-teal-50 text-teal-700 font-medium">{a.doctorId.speciality}</span>
                          : <span className="text-slate-300 text-xs">—</span>
                        }
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-sm text-sky-600 font-semibold">
                          <MdAccessTime size={13} />
                          {formatTime(a.time)}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold w-fit ${badge.bg} ${badge.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}