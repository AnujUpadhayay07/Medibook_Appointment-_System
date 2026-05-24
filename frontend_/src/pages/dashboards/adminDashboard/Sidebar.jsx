import { useAuth } from "../../../context/AuthContext";
import {
  MdDashboard, MdMedicalServices, MdPeople,
  MdEventNote, MdPerson, MdLogout, MdInsights,
} from "react-icons/md";

const navMain = [
  { id: "overview",      label: "Dashboard",     icon: MdDashboard },
  { id: "doctors",       label: "Doctors",        icon: MdMedicalServices },
  { id: "patients",      label: "Patients",       icon: MdPeople },
  { id: "appointments",  label: "Appointments",   icon: MdEventNote },
  { id: "analytics",     label: "Analytics",      icon: MdInsights },
];

const navAccount = [
  { id: "profile", label: "Profile", icon: MdPerson },
];

function SectionLabel({ label }) {
  return (
    <div className="flex items-center gap-2 px-3 mb-1.5 mt-5">
      <span className="text-[9px] font-bold tracking-[0.14em] uppercase"
        style={{ color: "rgba(125,211,252,0.4)" }}>
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
    </div>
  );
}

function NavItem({ item, active, onClick, badge }) {
  const Icon = item.icon;
  return (
    <button
      onClick={() => onClick(item.id)}
      className="relative flex items-center gap-2.5 w-full px-3 py-2.5 rounded-[10px] text-sm font-medium text-left transition-all duration-150 mb-0.5"
      style={{
        background: active ? "rgba(14,165,233,0.18)" : "transparent",
        color: active ? "#7dd3fc" : "rgba(255,255,255,0.5)",
        border: active ? "1px solid rgba(14,165,233,0.2)" : "1px solid transparent",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "rgba(255,255,255,0.07)";
          e.currentTarget.style.color = "#fff";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "rgba(255,255,255,0.5)";
        }
      }}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-r-full"
          style={{ background: "#38bdf8" }} />
      )}
      <span
        className="w-[30px] h-[30px] rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
        style={{ background: active ? "rgba(14,165,233,0.2)" : "transparent" }}
      >
        <Icon size={15} />
      </span>
      <span className="truncate">{item.label}</span>
      {badge != null && badge > 0 && (
        <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: "rgba(251,191,36,0.2)", color: "#fbbf24" }}>
          {badge}
        </span>
      )}
      {active && !badge && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: "#38bdf8" }} />
      )}
    </button>
  );
}

export default function Sidebar({ activeSection, setActiveSection, onLogout, pendingDoctors }) {
  const { user } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "AD";

  return (
    <aside
      className="w-60 flex flex-col min-h-screen relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0c1a2e 0%, #0f2744 55%, #0369a1 100%)" }}
    >
      {/* Glows */}
      <div className="absolute -top-14 -left-10 w-44 h-44 rounded-full pointer-events-none"
        style={{ background: "rgba(14,165,233,0.12)", filter: "blur(40px)" }} />
      <div className="absolute bottom-16 -right-8 w-36 h-36 rounded-full pointer-events-none"
        style={{ background: "rgba(56,189,248,0.08)", filter: "blur(36px)" }} />

      {/* Logo */}
      <div className="relative flex items-center gap-2.5 px-4 pt-5 pb-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="p-2 rounded-[10px]"
          style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 12h4l3-9 4 18 3-9h4"
              stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <div className="text-white font-semibold text-[15px] tracking-[0.01em]">MediBook</div>
          <div className="text-[10px] uppercase tracking-[0.12em] mt-0.5"
            style={{ color: "rgba(125,211,252,0.55)" }}>Admin Panel</div>
        </div>
      </div>

      {/* User card */}
      <div className="relative mx-2.5 mt-3 flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
        style={{
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.10)",
        }}>
        <div className="relative w-9 h-9 rounded-[9px] flex items-center justify-center font-semibold text-xs flex-shrink-0"
          style={{ background: "rgba(14,165,233,0.25)", border: "1px solid rgba(14,165,233,0.3)", color: "#7dd3fc" }}>
          {initials}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
            style={{ background: "#34d399", borderColor: "#0f2744" }} />
        </div>
        <div className="min-w-0">
          <div className="text-white text-[13px] font-semibold truncate">{user?.name || "Admin"}</div>
          <div className="text-[11px] mt-0.5 capitalize" style={{ color: "rgba(125,211,252,0.55)" }}>
            {user?.role || "administrator"}
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="relative flex-1 overflow-y-auto px-2 pb-2">
        <SectionLabel label="Main" />
        {navMain.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            active={activeSection === item.id}
            onClick={setActiveSection}
            badge={item.id === "doctors" ? pendingDoctors : null}
          />
        ))}
        <SectionLabel label="Account" />
        {navAccount.map((item) => (
          <NavItem key={item.id} item={item} active={activeSection === item.id} onClick={setActiveSection} />
        ))}
      </div>

      {/* Logout */}
      <div className="relative px-2 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <button
          onClick={onLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-150"
          style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.1)";
            e.currentTarget.style.color = "#fca5a5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.4)";
          }}
        >
          <span className="w-[30px] h-[30px] rounded-lg flex items-center justify-center flex-shrink-0">
            <MdLogout size={15} />
          </span>
          Logout
        </button>
      </div>
    </aside>
  );
}