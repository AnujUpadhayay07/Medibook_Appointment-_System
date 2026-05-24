import { useAuth } from "../../../context/AuthContext";
import {
  MdDashboard,
  MdCalendarMonth,
  MdMedicalServices,
  MdFolderShared,
  MdPeople,
  MdPerson,
  MdLogout,
} from "react-icons/md";

const navMain = [
  { id: "overview", label: "Dashboard", icon: MdDashboard },
  { id: "book", label: "Book Appointment", icon: MdCalendarMonth },
  { id: "appointments", label: "My Appointments", icon: MdMedicalServices },
];
const navHealth = [
  { id: "medicines", label: "Medicines", icon: MdMedicalServices },
  { id: "health", label: "Health Records", icon: MdFolderShared },
  
];
const navAccount = [{ id: "profile", label: "Profile", icon: MdPerson }];

function SectionLabel({ label }) {
  return (
    <div className="flex items-center gap-2 px-3 mb-2 mt-6">
      <span className="text-[10px] font-bold tracking-widest uppercase text-teal-200/60">
        {label}
      </span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

function NavItem({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <button
      onClick={() => onClick(item.id)}
      className={`relative flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-200 group
        ${
          active
            ? "bg-white/15 text-white shadow-inner"
            : "text-white/60 hover:bg-white/8 hover:text-white/90"
        }`}
    >
      {/* Active left bar */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-white/90" />
      )}

      {/* Icon container */}
      <span
        className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 flex-shrink-0
          ${active
            ? "bg-white/20 text-white"
            : "bg-transparent text-white/50 group-hover:bg-white/10 group-hover:text-white/80"
          }`}
      >
        <Icon size={17} />
      </span>

      <span className="truncate">{item.label}</span>

      {/* Active dot */}
      {active && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-200 flex-shrink-0" />
      )}
    </button>
  );
}

export default function Sidebar({ activeSection, setActiveSection, onLogout }) {
  const { user } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "PT";

  return (
    <aside
      className="w-64 flex flex-col min-h-screen relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #0f766e 0%, #0d9488 40%, #0f766e 100%)",
      }}
    >
      {/* Subtle background texture blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute -top-16 -left-16 w-48 h-48 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-24 -right-12 w-40 h-40 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #ffffff 0%, transparent 70%)" }}
        />
      </div>

      {/* ─── Logo ─── */}
      <div className="relative px-5 pt-6 pb-5 flex items-center gap-3 border-b border-white/10">
        <div className="bg-white rounded-xl p-2 flex-shrink-0 shadow-md">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 12h4l3-9 4 18 3-9h4"
              stroke="#0d9488"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <div className="text-white font-bold text-lg leading-tight tracking-wide">
            MediBook
          </div>
          <div className="text-teal-100/70 text-[11px] font-medium tracking-wider uppercase">
            Patient Portal
          </div>
        </div>
      </div>

      {/* ─── User Card ─── */}
      <div className="relative mx-3 mt-4 rounded-2xl overflow-hidden">
        <div
          className="flex items-center gap-3 px-4 py-3.5"
          style={{
            background: "rgba(255,255,255,0.10)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "16px",
          }}
        >
          {/* Avatar */}
          <div
            className="relative flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-lg"
            style={{ background: "rgba(255,255,255,0.20)" }}
          >
            <span className="text-white">{initials}</span>
            {/* Online dot */}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-teal-600" />
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-white text-sm font-semibold truncate leading-tight">
              {user?.name || "Patient"}
            </span>
            <span className="text-teal-100/70 text-xs truncate capitalize">
              {user?.role || "patient"}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Navigation ─── */}
      <div className="relative flex-1 overflow-y-auto mt-2 px-2 pb-2">

        <SectionLabel label="Main" />
        <div className="flex flex-col gap-0.5">
          {navMain.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              active={activeSection === item.id}
              onClick={setActiveSection}
            />
          ))}
        </div>

        <SectionLabel label="Health" />
        <div className="flex flex-col gap-0.5">
          {navHealth.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              active={activeSection === item.id}
              onClick={setActiveSection}
            />
          ))}
        </div>

        <SectionLabel label="Account" />
        <div className="flex flex-col gap-0.5">
          {navAccount.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              active={activeSection === item.id}
              onClick={setActiveSection}
            />
          ))}
        </div>
      </div>

      {/* ─── Logout ─── */}
      <div className="relative px-3 py-4 border-t border-white/10">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 group"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-transparent group-hover:bg-red-500/15 transition-all duration-200 flex-shrink-0">
            <MdLogout size={17} />
          </span>
          Logout
        </button>
      </div>
    </aside>
  );
}