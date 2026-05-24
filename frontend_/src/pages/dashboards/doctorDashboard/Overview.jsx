// DoctorOverview.jsx
// GET /doctor/dashboard  → { doctor, stats, todayQueue, appointmentRequests }
// Uses user from AuthContext for name/speciality (always fresh after profile update)

import { useEffect, useState, useCallback } from "react";
import {
  MdCalendarMonth, MdPeople, MdArrowForward, MdAccessTime,
  MdRefresh, MdErrorOutline, MdCheckCircle, MdPending,
  MdSchedule, MdNotifications, MdVerified, MdTrendingUp,
} from "react-icons/md";
import { useAuth } from "../../../context/AuthContext";
import API from "../../../api/axios";

// ─── Config ────────────────────────────────────────────────────────────────────
const BADGE_MAP = {
  confirmed: { bg: "bg-blue-50",  color: "text-blue-700",  dot: "bg-blue-500",  label: "Confirmed" },
  pending:   { bg: "bg-amber-50", color: "text-amber-700", dot: "bg-amber-400", label: "Pending"   },
  completed: { bg: "bg-teal-50",  color: "text-teal-700",  dot: "bg-teal-500",  label: "Completed" },
  cancelled: { bg: "bg-red-50",   color: "text-red-700",   dot: "bg-red-400",   label: "Cancelled" },
};

const STAT_META = [
  {
    key: "todayAppointments",
    label: "Today's Appointments",
    icon: MdCalendarMonth,
    gradient: "from-blue-500 to-blue-600",
    light: "bg-blue-50",
    accent: "text-blue-600",
    ring: "ring-blue-100",
    deltaLabel: "scheduled today",
  },
  {
    key: "completedToday",
    label: "Completed Today",
    icon: MdCheckCircle,
    gradient: "from-teal-500 to-teal-600",
    light: "bg-teal-50",
    accent: "text-teal-600",
    ring: "ring-teal-100",
    deltaLabel: "done so far",
  },
  {
    key: "pendingToday",
    label: "Pending Today",
    icon: MdPending,
    gradient: "from-amber-400 to-orange-500",
    light: "bg-amber-50",
    accent: "text-amber-600",
    ring: "ring-amber-100",
    deltaLabel: "awaiting",
  },
  {
    key: "totalPatients",
    label: "Total Patients",
    icon: MdPeople,
    gradient: "from-violet-500 to-purple-600",
    light: "bg-violet-50",
    accent: "text-violet-600",
    ring: "ring-violet-100",
    deltaLabel: "lifetime",
  },
];

const AVATAR_GRADIENTS = [
  ["#0ea5e9", "#0369a1"], ["#3b82f6", "#1d4ed8"],
  ["#06b6d4", "#0e7490"], ["#6366f1", "#4338ca"], ["#8b5cf6", "#6d28d9"],
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getInitials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "PT";
}

function formatTime(t) {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ✅ Safely strip any existing "Dr." prefix before re-adding it
function buildDrName(rawName = "") {
  const clean = rawName.replace(/^Dr\.?\s*/i, "").trim();
  return clean ? `Dr. ${clean}` : "Doctor";
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={`animate-pulse bg-blue-50 rounded-xl ${className}`} />;
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

// ─── Error Banner ──────────────────────────────────────────────────────────────
function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
      <MdErrorOutline size={18} className="flex-shrink-0" />
      <span className="flex-1">{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-1 text-xs font-semibold hover:text-red-700">
          <MdRefresh size={14} /> Retry
        </button>
      )}
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, deltaLabel, icon: Icon, gradient, light, accent, ring }) {
  return (
    <div className={`relative bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group ring-1 ${ring} hover:ring-2`}>
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-[0.07] group-hover:opacity-[0.13] transition-opacity duration-300`} />
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${light} flex items-center justify-center`}>
          <Icon size={19} className={accent} />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 tracking-tight">{value ?? "—"}</div>
      <div className="text-xs text-gray-400 mt-1 font-medium">{label}</div>
      <div className={`text-[11px] mt-0.5 font-semibold ${accent} opacity-70`}>{deltaLabel}</div>
    </div>
  );
}

// ─── Header Banner ─────────────────────────────────────────────────────────────
function HeaderBanner({ user, dashData, greeting, today }) {
  const rawName   = user?.name       || dashData?.doctor?.name       || "";
  const speciality = user?.speciality || dashData?.doctor?.speciality || "Specialist";
  const isApproved = dashData?.doctor?.isApproved;

  // ✅ Fix: strip any existing Dr. prefix, then add it once
  const drName = buildDrName(rawName);

  return (
    <div
      className="relative rounded-2xl overflow-hidden p-6"
      style={{ background: "linear-gradient(135deg, #0369a1 0%, #0ea5e9 55%, #38bdf8 100%)" }}
    >
      {/* Background shapes */}
      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
      <div className="absolute top-4 right-28 w-20 h-20 rounded-full bg-white/5" />
      <div className="absolute -bottom-8 right-16 w-32 h-32 rounded-full bg-white/5" />

      {/* ECG line */}
      <svg className="absolute right-0 top-0 h-full w-64 opacity-10" viewBox="0 0 200 80" preserveAspectRatio="none" fill="none">
        <path
          d="M0 40 L30 40 L40 40 L50 10 L60 70 L70 40 L90 40 L100 25 L110 55 L120 40 L160 40 L170 20 L180 60 L190 40 L200 40"
          stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>

      <div className="relative flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-blue-100 text-sm font-medium">{greeting} 👨‍⚕️</p>
          <div className="flex items-center gap-2 mt-0.5">
            {/* ✅ drName is always "Dr. Anuj" — never "Dr. Dr. Anuj" */}
            <h1 className="text-white text-2xl font-bold tracking-tight">{drName}</h1>
            {isApproved && <MdVerified size={20} style={{ color: "#38bdf8" }} />}
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-blue-100 text-xs">{today}</span>
            {speciality && (
              <>
                <span className="text-blue-300/60 text-xs">·</span>
                <span className="text-blue-100 text-xs font-semibold">{speciality}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3">
            <span
              className="text-[11px] font-bold px-3 py-1 rounded-full"
              style={{
                background: isApproved ? "rgba(34,197,94,0.2)" : "rgba(234,179,8,0.2)",
                color:      isApproved ? "#86efac" : "#fde047",
              }}
            >
              {isApproved ? "✓ Approved" : "⏳ Pending Approval"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-5 py-3 text-center">
            <div className="text-white text-base font-bold leading-tight">Active</div>
            <div className="text-blue-100 text-[11px] font-medium mt-0.5">Status</div>
          </div>
          <button className="relative w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center hover:bg-white/25 transition-colors">
            <MdNotifications size={20} className="text-white" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full border-2 border-blue-700" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ title, onAction, actionLabel }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 bg-blue-500 rounded-full" />
        <span className="text-sm font-bold text-gray-700">{title}</span>
      </div>
      {onAction && (
        <button
          onClick={onAction}
          className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:text-blue-700 transition-colors group"
        >
          {actionLabel}
          <MdArrowForward size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
}

// ─── Queue Row ─────────────────────────────────────────────────────────────────
function QueueRow({ item, index, isLast }) {
  const badge = BADGE_MAP[item.status] || BADGE_MAP.pending;
  const [g1, g2] = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];

  return (
    <div className={`flex items-center gap-3.5 py-3 ${!isLast ? "border-b border-gray-50" : ""}`}>
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0 shadow-sm"
        style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
      >
        {getInitials(item.patientName)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-800 truncate">{item.patientName}</div>
        <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 flex-wrap">
          <MdAccessTime size={11} className="text-blue-400" />
          <span className="text-blue-600 font-medium">{formatTime(item.time)}</span>
          {item.note && (
            <>
              <span className="text-gray-300">·</span>
              <span className="truncate max-w-[120px]">{item.note}</span>
            </>
          )}
        </div>
      </div>
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${badge.bg} ${badge.color}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
        {badge.label}
      </div>
    </div>
  );
}

// ─── Request Card ──────────────────────────────────────────────────────────────
function RequestCard({ item, index }) {
  const [g1, g2] = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];

  return (
    <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl hover:shadow-md transition-all duration-200">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
        style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
      >
        {getInitials(item.patientName)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-800 truncate">{item.patientName}</div>
        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
          <span>{formatDate(item.date)}</span>
          <span className="text-gray-300">·</span>
          <span>{formatTime(item.time)}</span>
        </div>
      </div>
      <div className="flex gap-1.5">
        <button className="px-2.5 py-1.5 rounded-lg bg-blue-500 text-white text-[11px] font-semibold hover:bg-blue-600 transition-colors">
          Accept
        </button>
        <button className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 text-[11px] font-semibold hover:bg-gray-50 transition-colors">
          Decline
        </button>
      </div>
    </div>
  );
}

// ─── Progress Ring ─────────────────────────────────────────────────────────────
function ProgressRing({ value, max, size = 80, stroke = 7, color = "#0ea5e9" }) {
  const radius = (size - stroke) / 2;
  const circ   = 2 * Math.PI * radius;
  const offset = circ * (1 - (max > 0 ? value / max : 0));

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#e0f2fe" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={radius}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.7s ease" }}
      />
    </svg>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function DoctorOverview({ setActiveSection }) {
  const { user } = useAuth();

  const [dashData,    setDashData]    = useState(null);
  const [loadingDash, setLoadingDash] = useState(true);
  const [errorDash,   setErrorDash]   = useState("");

  const fetchDashboard = useCallback(async () => {
    setLoadingDash(true);
    setErrorDash("");
    try {
      const { data } = await API.get("/doctor/dashboard");
      setDashData(data);
    } catch (err) {
      setErrorDash(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoadingDash(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const todayStr = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "short", year: "numeric",
  });

  const stats        = dashData?.stats        || {};
  const todayQueue   = dashData?.todayQueue   || [];
  const apptRequests = dashData?.appointmentRequests || [];

  const completedPct = stats.todayAppointments > 0
    ? Math.round((stats.completedToday / stats.todayAppointments) * 100)
    : 0;

  return (
    <div className="space-y-5">
      <HeaderBanner
        user={user}
        dashData={dashData}
        greeting={greeting}
        today={todayStr}
      />

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
              value={stats[meta.key] ?? 0}
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

      <div className="grid grid-cols-[1.4fr_1fr] gap-4">
        {/* Today's Queue */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
          <SectionHeader
            title="Today's Queue"
            onAction={() => setActiveSection("appointments")}
            actionLabel="See all"
          />

          {!loadingDash && !errorDash && stats.todayAppointments > 0 && (
            <div className="flex items-center gap-4 mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div className="relative flex-shrink-0">
                <ProgressRing value={stats.completedToday || 0} max={stats.todayAppointments || 1} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-700">{completedPct}%</span>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-blue-800">
                  {stats.completedToday} of {stats.todayAppointments} completed
                </div>
                <div className="text-[11px] text-blue-500 mt-0.5">
                  {stats.pendingToday} remaining today
                </div>
                <div className="h-1.5 w-32 bg-blue-100 rounded-full mt-2">
                  <div
                    className="h-1.5 bg-blue-500 rounded-full transition-all duration-700"
                    style={{ width: `${completedPct}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {loadingDash ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-2.5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : todayQueue.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-center">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <MdSchedule size={20} className="text-blue-400" />
              </div>
              <p className="text-sm text-gray-400 font-medium">No appointments in queue</p>
              <p className="text-xs text-gray-300">Enjoy the quiet!</p>
            </div>
          ) : (
            todayQueue.slice(0, 5).map((item, i) => (
              <QueueRow
                key={item.id}
                item={item}
                index={i}
                isLast={i === Math.min(todayQueue.length, 5) - 1}
              />
            ))
          )}
        </div>

        {/* Appointment Requests */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
          <SectionHeader
            title="Appointment Requests"
            onAction={() => setActiveSection("appointments")}
            actionLabel="Manage"
          />

          {loadingDash ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-9 h-9 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-2.5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : apptRequests.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <MdCalendarMonth size={20} className="text-amber-400" />
              </div>
              <p className="text-sm text-gray-400 font-medium">No pending requests</p>
              <p className="text-xs text-gray-300">You're all caught up!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {apptRequests.slice(0, 4).map((req, i) => (
                <RequestCard key={req.id} item={req} index={i} />
              ))}
            </div>
          )}

          {!loadingDash && !errorDash && (
            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800">{stats.totalAppointments ?? 0}</div>
                <div className="text-[10px] text-gray-400 font-medium">Total Visits</div>
              </div>
              <div className="w-px h-8 bg-gray-100" />
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{stats.totalPatients ?? 0}</div>
                <div className="text-[10px] text-gray-400 font-medium">Total Patients</div>
              </div>
              <div className="w-px h-8 bg-gray-100" />
              <div className="text-center">
                <div className="text-lg font-bold text-teal-600">{stats.completedToday ?? 0}</div>
                <div className="text-[10px] text-gray-400 font-medium">Done Today</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}