import { useEffect, useState } from "react";
import API from "../../../api/axios";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from "recharts";
import {
  MdTrendingUp, MdPeople, MdCalendarMonth, MdMedicalServices,
} from "react-icons/md";

// ── Design tokens ────────────────────────────────────────────────────────────
const PIE_COLORS = {
  pending:   "#ba7517",
  confirmed: "#3b82f6",
  completed: "#10b981",
  cancelled: "#e24b4a",
};
const PIE_BG = {
  pending:   "#faeeda",
  confirmed: "#dbeafe",
  completed: "#e1f5ee",
  cancelled: "#fcebeb",
};
const FALLBACK_PIE_COLORS = ["#3b82f6", "#ba7517", "#10b981", "#e24b4a", "#8b5cf6"];
const BAR_COLOR  = "#0ea5e9";
const LINE_COLOR_APPT    = "#3b82f6";
const LINE_COLOR_PATIENT = "#f59e0b";

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #f1f5f9",
        borderRadius: 10,
        padding: "8px 14px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      }}
    >
      {label && <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4, fontWeight: 600 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 13, fontWeight: 700, color: p.color || "#0f172a" }}>
          {p.value} <span style={{ fontWeight: 400, color: "#94a3b8", fontSize: 11 }}>{p.name}</span>
        </p>
      ))}
    </div>
  );
}

// ── Custom Pie Label ──────────────────────────────────────────────────────────
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 11, fontWeight: 700 }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, bg, color, sub }) {
  return (
    <div
      className="rounded-2xl p-5 flex items-start gap-4"
      style={{
        background: "#fff",
        border: "1px solid #f1f5f9",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div
        className="w-11 h-11 rounded-[11px] flex items-center justify-center flex-shrink-0"
        style={{ background: bg }}
      >
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-slate-900 mt-0.5" style={{ letterSpacing: "-0.03em" }}>
          {value ?? "—"}
        </p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Chart Card wrapper ────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children }) {
  return (
    <div
      className="rounded-2xl p-5 bg-white"
      style={{
        border: "1px solid #f1f5f9",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      <div className="mb-4">
        <p className="text-sm font-black text-slate-800" style={{ letterSpacing: "-0.01em" }}>{title}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Skeleton pulse ────────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />;
}

// ── Shared axis / grid styles ─────────────────────────────────────────────────
const axisStyle = { fontSize: 11, fill: "#94a3b8", fontWeight: 600 };
const gridStyle = { stroke: "#f1f5f9", strokeDasharray: "4 4" };

// ── Main component ────────────────────────────────────────────────────────────
export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/admin/analytics")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // ── Skeleton state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-5">
        <div>
          <Skeleton className="h-7 w-52 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-72" />
        <div className="grid md:grid-cols-2 gap-5">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (!data) return (
    <div className="py-20 text-center text-sm text-slate-400">Failed to load analytics.</div>
  );

  const statusData = Object.entries(data.byStatus).map(([key, value]) => ({ name: key, value }));
  const specialityData = data.specialityAgg.map((s) => ({ name: s._id, count: s.count }));
  const totalAppointments = statusData.reduce((acc, s) => acc + s.value, 0);

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div>
        <h1
          className="text-2xl font-black text-slate-900"
          style={{ letterSpacing: "-0.02em" }}
        >
          Analytics
        </h1>
        <p className="text-sm text-slate-400 mt-1">Platform overview and trends</p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={MdCalendarMonth}
          label="Total Appointments"
          value={totalAppointments}
          bg="#e0f2fe" color="#0c447c"
          sub="All time"
        />
        <StatCard
          icon={MdMedicalServices}
          label="Doctors"
          value={data.doctorCount ?? data.specialityAgg?.reduce((a, s) => a + s.count, 0)}
          bg="#e1f5ee" color="#085041"
          sub="Registered"
        />
        <StatCard
          icon={MdPeople}
          label="Patients"
          value={data.patientCount ?? data.last6Months?.reduce((a, m) => a + m.count, 0)}
          bg="#fef3c7" color="#633806"
          sub="Registered"
        />
        <StatCard
          icon={MdTrendingUp}
          label="This Week"
          value={data.last7Days?.reduce((a, d) => a + d.count, 0)}
          bg="#ede9fe" color="#3c3489"
          sub="Appointments"
        />
      </div>

      {/* ── Line chart: Last 7 days ── */}
      <ChartCard title="Appointments — Last 7 Days" subtitle="Daily booking volume">
        <ResponsiveContainer width="100%" height={230}>
          <LineChart data={data.last7Days} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradAppt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={LINE_COLOR_APPT} stopOpacity={0.15} />
                <stop offset="100%" stopColor={LINE_COLOR_APPT} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...gridStyle} vertical={false} />
            <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone" dataKey="count" name="appointments"
              stroke={LINE_COLOR_APPT} strokeWidth={2.5}
              dot={{ r: 4, fill: "#fff", stroke: LINE_COLOR_APPT, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── Row: Pie + Bar ── */}
      <div className="grid md:grid-cols-2 gap-5">

        {/* Pie: Appointment status */}
        <ChartCard title="Appointment Status" subtitle="Distribution by current status">
          {/* Legend pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {statusData.map((s) => (
              <span
                key={s.name}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize"
                style={{
                  background: PIE_BG[s.name] || "#f8fafc",
                  color: PIE_COLORS[s.name] || "#0f172a",
                }}
              >
                <span
                  className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                  style={{ background: PIE_COLORS[s.name] || "#94a3b8" }}
                />
                {s.name} · {s.value}
              </span>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%" cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                labelLine={false}
                label={<PieLabel />}
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={PIE_COLORS[entry.name] || FALLBACK_PIE_COLORS[index % FALLBACK_PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Bar: Doctors by speciality */}
        <ChartCard title="Doctors by Speciality" subtitle="Number of registered doctors per field">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={specialityData} margin={{ top: 4, right: 8, left: -20, bottom: 24 }}>
              <CartesianGrid {...gridStyle} vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ ...axisStyle, fontSize: 10 }}
                axisLine={false} tickLine={false}
                angle={-30} textAnchor="end" interval={0}
              />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" name="doctors" fill={BAR_COLOR} radius={[6, 6, 0, 0]} maxBarSize={36}>
                {specialityData.map((_, i) => {
                  const opacity = 0.55 + (i % 3) * 0.15;
                  return <Cell key={i} fill={BAR_COLOR} fillOpacity={opacity} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Line chart: Patient growth ── */}
      <ChartCard title="Patient Growth — Last 6 Months" subtitle="Monthly new patient registrations">
        <ResponsiveContainer width="100%" height={230}>
          <LineChart data={data.last6Months} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid {...gridStyle} vertical={false} />
            <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
            <YAxis tick={axisStyle} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone" dataKey="count" name="patients"
              stroke={LINE_COLOR_PATIENT} strokeWidth={2.5}
              dot={{ r: 4, fill: "#fff", stroke: LINE_COLOR_PATIENT, strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

    </div>
  );
}