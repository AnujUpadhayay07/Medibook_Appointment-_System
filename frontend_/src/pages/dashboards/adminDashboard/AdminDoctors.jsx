import { useEffect, useState } from "react";
import {
  MdSearch, MdCheckCircle, MdCancel, MdMedicalServices,
} from "react-icons/md";
import API from "../../../api/axios";

const AVATAR_PALETTE = [
  ["#e0f2fe", "#0c447c"], ["#ede9fe", "#3c3489"], ["#e1f5ee", "#085041"],
  ["#fef3c7", "#633806"], ["#dcfce7", "#166534"], ["#fee2e2", "#791f1f"],
];

const FILTERS = ["all", "approved", "pending", "rejected"];

const STATUS_BADGE = {
  approved: { bg: "#eaf3de", color: "#27500a", dot: "#639922",  label: "Approved" },
  pending:  { bg: "#faeeda", color: "#633806", dot: "#ba7517",  label: "Pending"  },
  rejected: { bg: "#fcebeb", color: "#791f1f", dot: "#e24b4a",  label: "Rejected" },
};

const FILTER_ACTIVE = {
  all:      { bg: "#0f2744", color: "#7dd3fc", border: "#0f2744" },
  approved: { bg: "#eaf3de", color: "#27500a", border: "#97c459" },
  pending:  { bg: "#faeeda", color: "#633806", border: "#ef9f27" },
  rejected: { bg: "#fcebeb", color: "#791f1f", border: "#f09595" },
};

const COUNT_PILL = {
  all:      { bg: "#e0f2fe", color: "#0c447c" },
  approved: { bg: "#eaf3de", color: "#27500a" },
  pending:  { bg: "#faeeda", color: "#633806" },
  rejected: { bg: "#fcebeb", color: "#791f1f" },
};

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "??";

function StatusBadge({ status }) {
  const s = STATUS_BADGE[status] || STATUS_BADGE.pending;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
      style={{ background: s.bg, color: s.color }}>
      <span className="w-[5px] h-[5px] rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}

export default function AdminDoctors() {
  const [doctors,  setDoctors]  = useState([]);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("all");
  const [loading,  setLoading]  = useState(true);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/doctors");
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, []);

  const handleApprove = async (id) => {
    try { await API.put(`/admin/doctors/${id}/approve`); fetchDoctors(); }
    catch (err) { console.error(err); }
  };

  const handleReject = async (id) => {
    try { await API.put(`/admin/doctors/${id}/reject`); fetchDoctors(); }
    catch (err) { console.error(err); }
  };

  const filtered = doctors.filter((doc) => {
    const matchSearch = doc.name.toLowerCase().includes(search.toLowerCase()) ||
      (doc.speciality || "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || doc.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    all:      doctors.length,
    approved: doctors.filter((d) => d.status === "approved").length,
    pending:  doctors.filter((d) => d.status === "pending").length,
    rejected: doctors.filter((d) => d.status === "rejected").length,
  };

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900" style={{ letterSpacing: "-0.02em" }}>
            Doctors
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage doctor registrations and approvals</p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {FILTERS.map((f) => {
              const p = COUNT_PILL[f];
              return (
                <span key={f} className="px-3 py-1 rounded-full text-xs font-medium capitalize"
                  style={{ background: p.bg, color: p.color }}>
                  {counts[f]} {f}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or speciality..."
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
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map((f) => {
            const isActive = filter === f;
            const a = FILTER_ACTIVE[f];
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium capitalize transition-all"
                style={isActive
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

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl overflow-hidden"
        style={{ border: "1px solid #f1f5f9", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>

        {/* Table Head */}
        <div className="grid px-5 py-3"
          style={{
            gridTemplateColumns: "2fr 1.2fr 0.7fr 0.7fr 1.3fr",
            background: "#f8fafc",
            borderBottom: "1px solid #f1f5f9",
          }}>
          {["Doctor", "Speciality", "Exp", "Fee", "Status / Action"].map((h) => (
            <span key={h} className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{h}</span>
          ))}
        </div>

        {/* Rows */}
        {loading ? (
          <div className="py-16 flex flex-col items-center gap-2">
            <div className="w-7 h-7 rounded-full border-2 border-sky-200 border-t-sky-500 animate-spin" />
            <p className="text-sm text-slate-400">Loading doctors...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
              <MdMedicalServices size={22} className="text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-400">No doctors found</p>
            <p className="text-xs text-slate-300">Try adjusting your search or filter</p>
          </div>
        ) : (
          filtered.map((doc, i) => {
            const [avatarBg, avatarColor] = AVATAR_PALETTE[i % AVATAR_PALETTE.length];
            return (
              <div
                key={doc._id}
                className="grid px-5 py-3.5 items-center transition-colors"
                style={{
                  gridTemplateColumns: "2fr 1.2fr 0.7fr 0.7fr 1.3fr",
                  borderBottom: i < filtered.length - 1 ? "1px solid #f8fafc" : "none",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#fafafa"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                {/* Doctor info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-[9px] flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: avatarBg, color: avatarColor }}
                  >
                    {getInitials(doc.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{doc.name}</p>
                    <p className="text-xs text-slate-400 truncate">{doc.email || "—"}</p>
                  </div>
                </div>

                {/* Speciality */}
                <div>
                  {doc.speciality ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-sky-50 text-sky-700 font-medium">
                      {doc.speciality}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  )}
                </div>

                {/* Experience */}
                <div className="text-sm text-slate-500">
                  {doc.experience ? `${doc.experience} yrs` : "—"}
                </div>

                {/* Fee */}
                <div className="text-sm font-semibold text-slate-700">
                  {doc.fees ? `₹${doc.fees}` : "—"}
                </div>

                {/* Status + Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={doc.status} />
                  {doc.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(doc._id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
                        style={{ background: "#eaf3de", color: "#27500a" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#c0dd97"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "#eaf3de"}
                      >
                        <MdCheckCircle size={12} /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(doc._id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
                        style={{ background: "#fcebeb", color: "#791f1f" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f7c1c1"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "#fcebeb"}
                      >
                        <MdCancel size={12} /> Reject
                      </button>
                    </>
                  )}
                  {doc.status === "rejected" && (
                    <button
                      onClick={() => handleApprove(doc._id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
                      style={{ background: "#eaf3de", color: "#27500a" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#c0dd97"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "#eaf3de"}
                    >
                      <MdCheckCircle size={12} /> Approve
                    </button>
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