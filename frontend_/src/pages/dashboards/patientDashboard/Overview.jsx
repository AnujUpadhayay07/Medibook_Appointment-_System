import { useEffect, useState, useCallback } from "react";
import {
  MdCalendarMonth,
  MdPeople,
  MdMedicalServices,
  MdFavorite,
  MdNotifications,
  MdTrendingUp,
  MdAir,
  MdArrowForward,
  MdAccessTime,
  MdRefresh,
  MdErrorOutline,
  MdPerson,
  MdCalendarToday,
  MdLocalPharmacy,
  MdInfoOutline,
  MdCheckCircle,
  MdSchedule,
  MdTimelapse,
  MdBloodtype,
} from "react-icons/md";
import { useAuth } from "../../../context/AuthContext";
import API from "../../../api/axios";

// ─── Vital helpers (same as HealthRecords.jsx) ────────────────────────────────
function findVital(records, keys) {
  if (!records) return null;
  for (let k of keys) {
    if (records[k]) return records[k];
  }
  return null;
}

// ─── Medicine helpers ─────────────────────────────────────────────────────────
function getMedStatus(med) {
  const today = new Date();
  const start = new Date(med.startDate);
  const end   = new Date(med.endDate);
  if (today >= start && today <= end) return "active";
  if (today < start)                  return "upcoming";
  return "expired";
}

function fmtDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function daysLeft(endDate) {
  const diff = new Date(endDate) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function daysUntil(startDate) {
  const diff = new Date(startDate) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ─── Medicine Design Tokens (identical to Medicines.jsx) ─────────────────────
const MED_CFG = {
  active: {
    label:      "Active",
    icon:       MdCheckCircle,
    cardBg:     "linear-gradient(145deg, #f0fdf9 0%, #ecfdf5 100%)",
    cardBorder: "#6ee7b7",
    shadow:     "0 4px 20px rgba(16, 185, 129, 0.10)",
    hoverShadow:"0 8px 30px rgba(16, 185, 129, 0.18)",
    accent:     "linear-gradient(180deg, #059669 0%, #047857 100%)",
    iconBg:     "#d1fae5",
    iconColor:  "#065f46",
    badgeBg:    "#d1fae5",
    badgeBorder:"#6ee7b7",
    badgeColor: "#065f46",
    dot:        true,
    dotColor:   "#10b981",
    nameColor:  "#064e3b",
    dosageColor:"#6b7280",
    metaColor:  "#9ca3af",
    pillBg:     "#ffffff",
    pillBorder: "#a7f3d0",
    pillColor:  "#065f46",
    divider:    "#d1fae5",
    tagBg:      "#ecfdf5",
    tagColor:   "#047857",
  },
  upcoming: {
    label:      "Upcoming",
    icon:       MdSchedule,
    cardBg:     "linear-gradient(145deg, #f0fdf9 0%, #f0fdfa 100%)",
    cardBorder: "#99f6e4",
    shadow:     "0 4px 20px rgba(20, 184, 166, 0.08)",
    hoverShadow:"0 8px 30px rgba(20, 184, 166, 0.16)",
    accent:     "linear-gradient(180deg, #0d9488 0%, #0f766e 100%)",
    iconBg:     "#ccfbf1",
    iconColor:  "#0f766e",
    badgeBg:    "#ccfbf1",
    badgeBorder:"#5eead4",
    badgeColor: "#0f766e",
    dot:        false,
    dotColor:   null,
    nameColor:  "#134e4a",
    dosageColor:"#6b7280",
    metaColor:  "#9ca3af",
    pillBg:     "#ffffff",
    pillBorder: "#99f6e4",
    pillColor:  "#0f766e",
    divider:    "#ccfbf1",
    tagBg:      "#f0fdfa",
    tagColor:   "#0d9488",
  },
  expired: {
    label:      "Completed",
    icon:       MdTimelapse,
    cardBg:     "linear-gradient(145deg, #f9fafb 0%, #f3f4f6 100%)",
    cardBorder: "#e5e7eb",
    shadow:     "0 4px 20px rgba(0,0,0,0.04)",
    hoverShadow:"0 8px 30px rgba(0,0,0,0.08)",
    accent:     "linear-gradient(180deg, #9ca3af 0%, #6b7280 100%)",
    iconBg:     "#f3f4f6",
    iconColor:  "#6b7280",
    badgeBg:    "#f3f4f6",
    badgeBorder:"#d1d5db",
    badgeColor: "#4b5563",
    dot:        false,
    dotColor:   null,
    nameColor:  "#374151",
    dosageColor:"#9ca3af",
    metaColor:  "#9ca3af",
    pillBg:     "#ffffff",
    pillBorder: "#e5e7eb",
    pillColor:  "#6b7280",
    divider:    "#e5e7eb",
    tagBg:      "#f9fafb",
    tagColor:   "#9ca3af",
  },
};

// ─── Appointment badge config ─────────────────────────────────────────────────
const BADGE_MAP = {
  confirmed: { bg: "bg-teal-50",  color: "text-teal-700",  dot: "bg-teal-500",  label: "Confirmed" },
  pending:   { bg: "bg-amber-50", color: "text-amber-700", dot: "bg-amber-400", label: "Pending"   },
  completed: { bg: "bg-blue-50",  color: "text-blue-700",  dot: "bg-blue-500",  label: "Completed" },
  cancelled: { bg: "bg-red-50",   color: "text-red-700",   dot: "bg-red-400",   label: "Cancelled" },
  scheduled: { bg: "bg-gray-100", color: "text-gray-600",  dot: "bg-gray-400",  label: "Scheduled" },
};

const AVATAR_GRADIENTS = [
  ["#0d9488", "#0f766e"],
  ["#7c3aed", "#6d28d9"],
  ["#2563eb", "#1d4ed8"],
  ["#db2777", "#be185d"],
  ["#d97706", "#b45309"],
];

// ─── Utility ──────────────────────────────────────────────────────────────────
function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "DR";
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />;
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
          <Skeleton className="w-10 h-10" />
          <Skeleton className="w-16 h-8" />
          <Skeleton className="w-24 h-3" />
        </div>
      ))}
    </div>
  );
}

// ─── Error Banner ─────────────────────────────────────────────────────────────
function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
      <MdErrorOutline size={18} className="flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-1 text-xs font-semibold hover:text-red-700 transition-colors">
          <MdRefresh size={14} /> Retry
        </button>
      )}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
const STAT_META = [
  { key: "totalVisits", label: "Total Visits",  icon: MdCalendarMonth,   gradient: "from-teal-500 to-teal-600",     light: "bg-teal-50",   accent: "text-teal-600",   ring: "ring-teal-100",   deltaLabel: "visits logged"  },
  { key: "upcoming",    label: "Upcoming",       icon: MdAccessTime,      gradient: "from-blue-500 to-blue-600",     light: "bg-blue-50",   accent: "text-blue-600",   ring: "ring-blue-100",   deltaLabel: "next 30 days"   },
  { key: "activeMeds",  label: "Active Meds",    icon: MdMedicalServices, gradient: "from-amber-400 to-orange-500",  light: "bg-amber-50",  accent: "text-amber-600",  ring: "ring-amber-100",  deltaLabel: "pending doses"  },
  { key: "doctors",     label: "Doctors Linked", icon: MdPeople,          gradient: "from-violet-500 to-purple-600", light: "bg-violet-50", accent: "text-violet-600", ring: "ring-violet-100", deltaLabel: "specialists"    },
];

function StatCard({ label, value, deltaLabel, icon: Icon, gradient, light, accent, ring }) {
  return (
    <div className={`relative bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group ring-1 ${ring} hover:ring-2`}>
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-300`} />
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${light} flex items-center justify-center`}>
          <Icon size={19} className={accent} />
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${light} ${accent}`}>{deltaLabel}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900 tracking-tight">{value ?? "—"}</div>
      <div className="text-sm text-gray-400 mt-1 font-medium">{label}</div>
    </div>
  );
}

// ─── Appointment Row ──────────────────────────────────────────────────────────
function AppointmentRow({ appointment, index, isLast }) {
  const doctorName = appointment.doctorId?.name || "Doctor";
  const specialty  = appointment.doctorId?.speciality || "Specialist";
  const status     = appointment.status || "pending";
  const badge      = BADGE_MAP[status] || BADGE_MAP.pending;
  const [gradFrom, gradTo] = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];

  return (
    <div className={`flex items-center gap-3.5 py-3 ${!isLast ? "border-b border-gray-50" : ""}`}>
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0 shadow-sm"
        style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})` }}
      >
        {getInitials(doctorName)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-800 truncate">{doctorName}</div>
        <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 flex-wrap">
          <span>{specialty}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="text-teal-600 font-medium">{formatDate(appointment.date)}</span>
          <span className="text-gray-300">·</span>
          <span>{appointment.time}</span>
        </div>
      </div>
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${badge.bg} ${badge.color}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
        {badge.label}
      </div>
    </div>
  );
}

// ─── Vital Card ───────────────────────────────────────────────────────────────
function VitalCard({ label, value, unit, icon: Icon, iconColor, iconBg, barColor, barWidth, status }) {
  return (
    <div className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={17} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1">
          <span className="text-base font-bold text-gray-800">{value || "—"}</span>
          {value && <span className="text-[11px] text-gray-400 font-medium">{unit}</span>}
        </div>
        <div className="text-[11px] text-gray-400">{label}</div>
        <div className="h-1 bg-gray-100 rounded-full mt-1.5">
          <div className={`h-1 ${barColor} rounded-full transition-all duration-700`} style={{ width: barWidth }} />
        </div>
      </div>
      <span className={`text-[10px] font-bold flex-shrink-0 ${value ? "text-teal-500" : "text-gray-400"}`}>
        {status}
      </span>
    </div>
  );
}

// ─── Medicine Card (identical to Medicines.jsx) ───────────────────────────────
function OverviewMedCard({ med }) {
  const [hovered, setHovered] = useState(false);
  const status  = getMedStatus(med);
  const c       = MED_CFG[status];
  const Icon    = c.icon;
  const timings = Array.isArray(med.timing) ? med.timing : med.timing ? [med.timing] : [];
  const left    = status === "active"   ? daysLeft(med.endDate)    : null;
  const until   = status === "upcoming" ? daysUntil(med.startDate) : null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position:     "relative",
        borderRadius: "18px",
        padding:      "20px 20px 18px 22px",
        background:   c.cardBg,
        border:       `1.5px solid ${c.cardBorder}`,
        boxShadow:    hovered ? c.hoverShadow : c.shadow,
        transform:    hovered ? "translateY(-3px)" : "translateY(0)",
        transition:   "transform 0.22s ease, box-shadow 0.22s ease",
        overflow:     "hidden",
      }}
    >
      {/* Left accent bar */}
      <div style={{
        position: "absolute", left: 0, top: 0,
        width: "4px", height: "100%",
        background: c.accent,
        borderRadius: "0 0 0 18px",
      }} />

      {/* ── Name + badge ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "42px", height: "42px", borderRadius: "13px", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: c.iconBg,
          }}>
            <MdLocalPharmacy size={20} style={{ color: c.iconColor }} />
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: c.nameColor, lineHeight: 1.3 }}>
              {med.name}
            </div>
            <div style={{ fontSize: "12px", color: c.dosageColor, marginTop: "3px", fontWeight: 500 }}>
              {med.dosage}
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: "5px",
          fontSize: "10px", fontWeight: 700, letterSpacing: "0.02em",
          padding: "5px 10px", borderRadius: "20px", flexShrink: 0, marginLeft: "8px",
          background: c.badgeBg, border: `1px solid ${c.badgeBorder}`, color: c.badgeColor,
        }}>
          {c.dot && (
            <span style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: c.dotColor, animation: "medpulse 2s infinite", flexShrink: 0,
            }} />
          )}
          <Icon size={11} />
          {c.label}
        </div>
      </div>

      {/* ── Timing pills ── */}
      {timings.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
          <MdAccessTime size={13} style={{ color: c.metaColor, flexShrink: 0 }} />
          {timings.map((t, i) => (
            <span key={i} style={{
              fontSize: "11px", fontWeight: 600,
              padding: "3px 10px", borderRadius: "20px",
              background: c.pillBg, border: `1px solid ${c.pillBorder}`, color: c.pillColor,
            }}>
              {t}
            </span>
          ))}
        </div>
      )}

      {/* ── Duration tag ── */}
      {med.duration && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
          <span style={{
            fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px",
            background: c.tagBg, color: c.tagColor, border: `1px solid ${c.cardBorder}`,
          }}>
            {med.duration} day{med.duration !== 1 ? "s" : ""} course
          </span>
          {status === "active" && left !== null && (
            <span style={{
              fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px",
              background: left <= 3 ? "#fef2f2" : c.tagBg,
              color:      left <= 3 ? "#dc2626" : c.tagColor,
              border:     `1px solid ${left <= 3 ? "#fecaca" : c.cardBorder}`,
            }}>
              {left <= 0 ? "Ends today" : `${left}d left`}
            </span>
          )}
          {status === "upcoming" && until !== null && (
            <span style={{
              fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px",
              background: c.tagBg, color: c.tagColor, border: `1px solid ${c.cardBorder}`,
            }}>
              Starts in {until}d
            </span>
          )}
        </div>
      )}

      {/* ── Doctor ── */}
      {med.doctorId?.name && (
        <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: c.metaColor, marginBottom: "12px" }}>
          <MdPerson size={13} style={{ flexShrink: 0 }} />
          Prescribed by <span style={{ fontWeight: 700, color: c.nameColor, marginLeft: "3px" }}>{med.doctorId.name}</span>
          {med.doctorId.speciality && <span style={{ color: c.metaColor }}>· {med.doctorId.speciality}</span>}
        </div>
      )}

      {/* ── Instructions ── */}
      {med.instructions && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: "6px",
          fontSize: "11px", color: c.metaColor, marginBottom: "12px",
          padding: "8px 10px", borderRadius: "10px",
          background: c.pillBg, border: `1px solid ${c.divider}`,
        }}>
          <MdInfoOutline size={13} style={{ flexShrink: 0, marginTop: "1px", color: c.tagColor }} />
          <span style={{ fontStyle: "italic" }}>{med.instructions}</span>
        </div>
      )}

      {/* ── Divider ── */}
      <div style={{ height: "1px", background: c.divider, marginBottom: "12px" }} />

      {/* ── Dates ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: c.metaColor }}>
        <MdCalendarToday size={12} style={{ flexShrink: 0 }} />
        <span style={{ fontWeight: 600, color: c.nameColor }}>{fmtDate(med.startDate)}</span>
        <span style={{ opacity: 0.35, fontSize: "13px" }}>→</span>
        <span style={{ fontWeight: 600, color: status === "expired" ? c.metaColor : c.nameColor }}>
          {fmtDate(med.endDate)}
        </span>
      </div>
    </div>
  );
}

// ─── Header Banner ────────────────────────────────────────────────────────────
function HeaderBanner({ firstName, greeting, today }) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden p-6 flex items-center justify-between"
      style={{ background: "linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)" }}
    >
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
      <div className="absolute top-4 right-24 w-16 h-16 rounded-full bg-white/5" />
      <div className="absolute -bottom-6 right-12 w-28 h-28 rounded-full bg-white/5" />
      <svg className="absolute right-0 top-0 h-full w-64 opacity-10" viewBox="0 0 200 80" preserveAspectRatio="none" fill="none">
        <path d="M0 40 L30 40 L40 40 L50 10 L60 70 L70 40 L90 40 L100 25 L110 55 L120 40 L160 40 L170 20 L180 60 L190 40 L200 40" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="relative">
        <p className="text-teal-100 text-sm font-medium">{greeting} 👋</p>
        <h1 className="text-white text-2xl font-bold mt-0.5 tracking-tight">{firstName}</h1>
        <p className="text-teal-200 text-xs mt-1.5">{today}</p>
      </div>
      <div className="relative flex items-center gap-3">
        <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-center">
          <div className="text-white text-lg font-bold leading-tight">Good</div>
          <div className="text-teal-100 text-[11px] font-medium">Health Status</div>
        </div>
        <button className="relative w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center hover:bg-white/25 transition-colors">
          <MdNotifications size={20} className="text-white" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full border-2 border-teal-700" />
        </button>
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, onAction, actionLabel }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 bg-teal-500 rounded-full" />
        <span className="text-sm font-bold text-gray-700">{title}</span>
      </div>
      {onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-1 text-xs text-teal-600 font-semibold hover:text-teal-700 transition-colors group"
        >
          {actionLabel}
          <MdArrowForward size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
}

// ─── Medicines Section ────────────────────────────────────────────────────────
function MedSkeletonCard() {
  return (
    <div style={{
      borderRadius: "18px", height: "210px",
      background: "linear-gradient(145deg, #f0fdf9, #ecfdf5)",
      border: "1.5px solid #d1fae5",
      animation: "skpulse 1.4s ease-in-out infinite",
    }} />
  );
}

function MedicinesSection({ medicines, loading, error, onRetry, onViewAll }) {
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const activeMedicines = medicines.filter((m) => {
    if (!m.startDate || !m.endDate) return false;
    const start = new Date(m.startDate); start.setHours(0, 0, 0, 0);
    const end   = new Date(m.endDate);   end.setHours(0, 0, 0, 0);
    return todayDate >= start && todayDate <= end;
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <style>{`
        @keyframes medpulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes skpulse  { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>

      <SectionHeader title="Today's Medicines" actionLabel="View all" onAction={onViewAll} />

      {loading && (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <MedSkeletonCard key={i} />)}
        </div>
      )}

      {!loading && error && <ErrorBanner message={error} onRetry={onRetry} />}

      {!loading && !error && activeMedicines.length === 0 && (
        <div className="py-10 flex flex-col items-center justify-center gap-2 text-center">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <MdLocalPharmacy size={20} className="text-[#0f6e56]" />
          </div>
          <p className="text-sm text-gray-400 font-medium">No active medicines for today</p>
          <p className="text-xs text-gray-300">Your doctor will prescribe when needed</p>
        </div>
      )}

      {!loading && !error && activeMedicines.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {activeMedicines.map((med) => (
            <OverviewMedCard key={med._id} med={med} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Overview({ setActiveSection }) {
  const { user } = useAuth();

  const [dashData,      setDashData]      = useState(null);
  const [medicines,     setMedicines]     = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [loadingDash,   setLoadingDash]   = useState(true);
  const [loadingMeds,   setLoadingMeds]   = useState(true);
  const [errorDash,     setErrorDash]     = useState("");
  const [errorMeds,     setErrorMeds]     = useState("");

  const fetchDashboard = useCallback(async () => {
    setLoadingDash(true);
    setErrorDash("");
    try {
      const { data } = await API.get("/patient/dashboard");
      setDashData(data);
    } catch (err) {
      setErrorDash(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoadingDash(false);
    }
  }, []);

  const fetchMedicines = useCallback(async () => {
    setLoadingMeds(true);
    setErrorMeds("");
    try {
      const { data } = await API.get("/medicines/my");
      setMedicines(Array.isArray(data) ? data : []);
    } catch (err) {
      setErrorMeds(err.response?.data?.message || "Failed to load medicines");
    } finally {
      setLoadingMeds(false);
    }
  }, []);

  const fetchHealthRecords = useCallback(async () => {
    try {
      const { data } = await API.get("/health-records/my");
      setHealthRecords(data);
    } catch (err) {
      console.log("Health records error", err);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchMedicines();
    fetchHealthRecords();
  }, [fetchDashboard, fetchMedicines, fetchHealthRecords]);

  // ── Derived values ────────────────────────────────────────────────────────
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] || "there";
  const todayStr  = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const upcomingAppts = dashData?.appointments || [];

  // ── Active meds count: derived from medicines array, NOT from backend ─────
  // Backend (dashData.activeMeds) can be stale or wrong — this always matches
  // exactly what is rendered in the Today's Medicines section below.
  const activeMedCount = medicines.filter((m) => {
    if (!m.startDate || !m.endDate) return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const start = new Date(m.startDate); start.setHours(0, 0, 0, 0);
    const end   = new Date(m.endDate);   end.setHours(0, 0, 0, 0);
    return today >= start && today <= end;
  }).length;

  // ── Vitals from latest health record (same keys as HealthRecords.jsx) ─────
  const latestRecord  = healthRecords.length > 0 ? healthRecords[0] : null;
  const latestRecords = latestRecord?.records || {};

  const VITALS_DYNAMIC = [
    {
      id: 1, label: "Blood Pressure",
      value: findVital(latestRecords, ["bp", "Blood Pressure"]),
      unit: "mmHg", icon: MdTrendingUp,
      iconColor: "text-blue-600", iconBg: "bg-blue-50", barColor: "bg-blue-400",
    },
    {
      id: 2, label: "Sugar",
      value: findVital(latestRecords, ["sugar", "Sugar"]),
      unit: "mg/dL", icon: MdBloodtype,
      iconColor: "text-amber-600", iconBg: "bg-amber-50", barColor: "bg-amber-400",
    },
    {
      id: 3, label: "SpO2",
      value: findVital(latestRecords, ["spo2", "SpO2"]),
      unit: "%", icon: MdAir,
      iconColor: "text-emerald-600", iconBg: "bg-emerald-50", barColor: "bg-emerald-400",
    },
    {
      id: 4, label: "Temperature",
      value: findVital(latestRecords, ["temperature", "Temperature"]),
      unit: "°F", icon: MdFavorite,
      iconColor: "text-rose-600", iconBg: "bg-rose-50", barColor: "bg-rose-400",
    },
  ].map((v) => ({
    ...v,
    barWidth: v.value ? "80%" : "0%",
    status:   v.value ? "Updated" : "N/A",
  }));

  return (
    <div className="space-y-5">

      {/* Greeting Banner */}
      <HeaderBanner firstName={firstName} greeting={greeting} today={todayStr} />

      {/* Stats */}
      {loadingDash ? (
        <StatsSkeleton />
      ) : errorDash ? (
        <ErrorBanner message={errorDash} onRetry={fetchDashboard} />
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {STAT_META.map((meta) => (
            <StatCard
              key={meta.key}
              label={meta.label}
              value={meta.key === "activeMeds" ? activeMedCount : dashData?.[meta.key] ?? 0}
              deltaLabel={meta.deltaLabel}
              icon={meta.icon}
              gradient={meta.gradient}
              light={meta.light}
              accent={meta.accent}
              ring={meta.ring}
            />
          ))}
        </div>
      )}

      {/* Appointments + Vitals */}
      <div className="grid grid-cols-[1.4fr_1fr] gap-4">

        {/* Appointments */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
          <SectionHeader
            title="Upcoming Appointments"
            onAction={() => setActiveSection("appointments")}
            actionLabel="See all"
          />

          {loadingDash ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-2.5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : upcomingAppts.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-center">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                <MdCalendarMonth size={20} className="text-teal-400" />
              </div>
              <p className="text-sm text-gray-400 font-medium">No upcoming appointments</p>
              <p className="text-xs text-gray-300">Book one to get started</p>
            </div>
          ) : (
            upcomingAppts.slice(0, 4).map((appt, i) => (
              <AppointmentRow
                key={appt._id}
                appointment={appt}
                index={i}
                isLast={i === Math.min(upcomingAppts.length, 4) - 1}
              />
            ))
          )}

          <button
            onClick={() => setActiveSection("book")}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-teal-200 text-teal-600 text-xs font-semibold hover:bg-teal-50 hover:border-teal-300 transition-all duration-200"
          >
            <MdCalendarMonth size={15} />
            Book New Appointment
          </button>
        </div>

        {/* Vitals */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
          <SectionHeader title="Health Vitals" actionLabel="View All" onAction={() => setActiveSection("health")} />

          {latestRecord && (
            <p className="text-[11px] text-gray-400 mb-3">
              From Dr. {latestRecord.doctor?.name || "Unknown"} · {fmtDate(latestRecord.appointment?.date)}
            </p>
          )}

          <div className="flex flex-col gap-2.5">
            {VITALS_DYNAMIC.map((v) => (
              <VitalCard key={v.id} {...v} />
            ))}
          </div>

          {!latestRecord && (
            <p className="text-[11px] text-gray-300 text-center mt-3">
              Vitals update after doctor visits
            </p>
          )}
        </div>
      </div>

      {/* Medicines Section */}
      <MedicinesSection
        medicines={medicines}
        loading={loadingMeds}
        error={errorMeds}
        onRetry={fetchMedicines}
        onViewAll={() => setActiveSection("medicines")}
      />

    </div>
  );
}