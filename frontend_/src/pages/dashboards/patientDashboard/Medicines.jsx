// Medicines.jsx — Patient view (read-only, no mark-as-taken)
// GET /medicines/my  → returns medicines with populated doctorId + appointmentId

import { useEffect, useState } from "react";
import API from "../../../api/axios";
import {
  MdLocalPharmacy, MdAccessTime, MdPerson,
  MdCalendarToday, MdRefresh, MdInfoOutline,
  MdSchedule, MdCheckCircle, MdTimelapse,
} from "react-icons/md";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getStatus(med) {
  const today = new Date();
  const start = new Date(med.startDate);
  const end   = new Date(med.endDate);
  if (today >= start && today <= end) return "active";
  if (today < start)                  return "upcoming";
  return "expired";
}

function fmt(dateStr) {
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

// ─── Design Tokens ────────────────────────────────────────────────────────────
const CFG = {
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

const FILTERS = [
  { key: "all",      label: "All" },
  { key: "active",   label: "Active" },
  { key: "upcoming", label: "Upcoming" },
  { key: "expired",  label: "Completed" },
];

// ─── Medicine Card ─────────────────────────────────────────────────────────────
function MedicineCard({ med }) {
  const [hovered, setHovered] = useState(false);
  const status  = getStatus(med);
  const c       = CFG[status];
  const Icon    = c.icon;
  const timings = Array.isArray(med.timing) ? med.timing : med.timing ? [med.timing] : [];
  const left    = status === "active"   ? daysLeft(med.endDate)   : null;
  const until   = status === "upcoming" ? daysUntil(med.startDate): null;

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

      {/* ── Top: icon + name + badge ── */}
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
          background: c.badgeBg,
          border: `1px solid ${c.badgeBorder}`,
          color: c.badgeColor,
        }}>
          {c.dot && (
            <span style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: c.dotColor,
              animation: "medpulse 2s infinite",
              flexShrink: 0,
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
              background: c.pillBg,
              border: `1px solid ${c.pillBorder}`,
              color: c.pillColor,
            }}>
              {t}
            </span>
          ))}
        </div>
      )}

      {/* ── Duration tag ── */}
      {med.duration && (
        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "10px" }}>
          <span style={{
            fontSize: "11px", fontWeight: 600,
            padding: "3px 10px", borderRadius: "20px",
            background: c.tagBg,
            color: c.tagColor,
            border: `1px solid ${c.cardBorder}`,
          }}>
            {med.duration} day{med.duration !== 1 ? "s" : ""} course
          </span>
          {/* Days left / days until */}
          {status === "active" && left !== null && (
            <span style={{
              fontSize: "11px", fontWeight: 600,
              padding: "3px 10px", borderRadius: "20px",
              background: left <= 3 ? "#fef2f2" : c.tagBg,
              color: left <= 3 ? "#dc2626" : c.tagColor,
              border: `1px solid ${left <= 3 ? "#fecaca" : c.cardBorder}`,
            }}>
              {left <= 0 ? "Ends today" : `${left}d left`}
            </span>
          )}
          {status === "upcoming" && until !== null && (
            <span style={{
              fontSize: "11px", fontWeight: 600,
              padding: "3px 10px", borderRadius: "20px",
              background: c.tagBg, color: c.tagColor,
              border: `1px solid ${c.cardBorder}`,
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
          {med.doctorId.speciality && (
            <span style={{ color: c.metaColor }}>· {med.doctorId.speciality}</span>
          )}
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
        <span style={{ fontWeight: 600, color: c.nameColor }}>{fmt(med.startDate)}</span>
        <span style={{ opacity: 0.35, fontSize: "13px" }}>→</span>
        <span style={{ fontWeight: 600, color: status === "expired" ? c.metaColor : c.nameColor }}>
          {fmt(med.endDate)}
        </span>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      borderRadius: "18px", height: "210px",
      background: "linear-gradient(145deg, #f0fdf9, #ecfdf5)",
      border: "1.5px solid #d1fae5",
      animation: "skpulse 1.4s ease-in-out infinite",
    }} />
  );
}

// ─── Summary Strip ────────────────────────────────────────────────────────────
function SummaryStrip({ counts, loading }) {
  if (loading || counts.all === 0) return null;
  return (
    <div style={{
      display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "6px",
    }}>
      {counts.active > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: "7px",
          padding: "7px 14px", borderRadius: "30px",
          background: "#d1fae5", border: "1px solid #6ee7b7",
          fontSize: "12px", fontWeight: 700, color: "#065f46",
        }}>
          <span style={{
            width: "7px", height: "7px", borderRadius: "50%",
            background: "#10b981", animation: "medpulse 2s infinite",
            display: "inline-block", flexShrink: 0,
          }} />
          {counts.active} active
        </div>
      )}
      {counts.upcoming > 0 && (
        <div style={{
          padding: "7px 14px", borderRadius: "30px",
          background: "#ccfbf1", border: "1px solid #5eead4",
          fontSize: "12px", fontWeight: 700, color: "#0f766e",
        }}>
          {counts.upcoming} upcoming
        </div>
      )}
      {counts.expired > 0 && (
        <div style={{
          padding: "7px 14px", borderRadius: "30px",
          background: "#f3f4f6", border: "1px solid #e5e7eb",
          fontSize: "12px", fontWeight: 700, color: "#6b7280",
        }}>
          {counts.expired} completed
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState("all");
  const [error,     setError]     = useState("");

  useEffect(() => { fetchMedicines(); }, []);

  const fetchMedicines = async () => {
    setLoading(true); setError("");
    try {
      const { data } = await API.get("/medicines/my");
      setMedicines(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load medicines");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const counts = {
    all:      medicines.length,
    active:   medicines.filter((m) => getStatus(m) === "active").length,
    upcoming: medicines.filter((m) => getStatus(m) === "upcoming").length,
    expired:  medicines.filter((m) => getStatus(m) === "expired").length,
  };

  const filtered = filter === "all"
    ? medicines
    : medicines.filter((m) => getStatus(m) === filter);

  return (
    <div className="p-6 min-h-screen" style={{ background: "#f8fffe" }}>
      <style>{`
        @keyframes medpulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes skpulse  { 0%,100%{opacity:0.9} 50%{opacity:0.4} }
      `}</style>

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#064e3b", letterSpacing: "-0.01em" }}>
            My Medicines
          </h1>
          <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "3px" }}>
            Medicines prescribed by your doctor
          </p>
        </div>
        <button
          onClick={fetchMedicines}
          disabled={loading}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 14px", borderRadius: "12px",
            background: "#d1fae5", border: "1px solid #6ee7b7",
            color: "#065f46", fontSize: "12px", fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
            transition: "opacity 0.2s",
          }}
        >
          <MdRefresh size={15} style={{ animation: loading ? "skpulse 1s infinite" : "none" }} />
          Refresh
        </button>
      </div>

      {/* ── Summary strip ── */}
      <SummaryStrip counts={counts} loading={loading} />

      {/* ── Filter tabs ── */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
        {FILTERS.map(({ key, label }) => {
          const active = filter === key;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                display: "flex", alignItems: "center", gap: "7px",
                padding: "8px 16px", borderRadius: "30px",
                fontSize: "12px", fontWeight: 700,
                border: active ? "1.5px solid transparent" : "1.5px solid #d1fae5",
                background: active ? "linear-gradient(135deg, #059669, #047857)" : "#ffffff",
                color: active ? "#ffffff" : "#059669",
                boxShadow: active ? "0 3px 12px rgba(5,150,105,0.25)" : "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {label}
              <span style={{
                fontSize: "10px", fontWeight: 800,
                padding: "2px 7px", borderRadius: "20px",
                background: active ? "rgba(255,255,255,0.25)" : "#d1fae5",
                color: active ? "#ffffff" : "#065f46",
              }}>
                {counts[key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{
          padding: "14px 18px", borderRadius: "14px", marginBottom: "20px",
          background: "#fef2f2", border: "1px solid #fecaca",
          color: "#dc2626", fontSize: "13px", fontWeight: 600,
        }}>
          {error} — <button onClick={fetchMedicines} style={{ textDecoration: "underline", background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontWeight: 700 }}>Retry</button>
        </div>
      )}

      {/* ── Loading skeletons ── */}
      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && filtered.length === 0 && (
        <div style={{
          borderRadius: "20px", padding: "60px 20px",
          textAlign: "center",
          background: "linear-gradient(145deg, #f0fdf9, #ecfdf5)",
          border: "1.5px dashed #6ee7b7",
        }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "16px",
            background: "#d1fae5", border: "1px solid #6ee7b7",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <MdLocalPharmacy size={26} style={{ color: "#059669" }} />
          </div>
          <div style={{ fontSize: "16px", fontWeight: 800, color: "#064e3b", marginBottom: "6px" }}>
            {filter === "all" ? "No medicines yet" : `No ${filter} medicines`}
          </div>
          <div style={{ fontSize: "13px", color: "#9ca3af" }}>
            {filter === "all"
              ? "Your doctor will prescribe medicines after your appointment"
              : "Try switching to a different filter above"}
          </div>
        </div>
      )}

      {/* ── Cards grid ── */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {filtered.map((med) => (
            <MedicineCard key={med._id} med={med} />
          ))}
        </div>
      )}
    </div>
  );
}