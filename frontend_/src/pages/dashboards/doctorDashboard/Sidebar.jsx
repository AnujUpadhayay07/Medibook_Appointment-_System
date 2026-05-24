import { useAuth } from "../../../context/AuthContext";
import {
  MdDashboard, MdEventNote, MdPeople,
  MdPerson, MdLogout, MdLocalHospital,
} from "react-icons/md";

const navMain = [
  { id: "overview",      label: "Dashboard",     icon: MdDashboard },
  { id: "appointments",  label: "Appointments",  icon: MdEventNote },
  { id: "patients",      label: "Patients",      icon: MdPeople },
  { id: "clinical",      label: "Clinical",      icon: MdLocalHospital },
];

const navAccount = [
  { id: "profile", label: "Profile", icon: MdPerson },
];

// ── Sky-blue palette tokens ──────────────────────────────────────────────────
const THEME = {
  bg:         "linear-gradient(160deg, #082f49 0%, #0c4a6e 50%, #075985 100%)",
  glow1:      "rgba(56,189,248,0.13)",
  glow2:      "rgba(14,165,233,0.09)",
  border:     "rgba(255,255,255,0.07)",
  labelColor: "rgba(186,230,253,0.45)",
  activeNavBg:"rgba(56,189,248,0.16)",
  activeNavBorder: "rgba(56,189,248,0.25)",
  activeNavText:   "#bae6fd",
  activeBar:  "#38bdf8",
  activeDot:  "#38bdf8",
  hoverBg:    "rgba(255,255,255,0.07)",
  mutedText:  "rgba(255,255,255,0.45)",
  userCardBg: "rgba(255,255,255,0.07)",
  userCardBorder: "rgba(255,255,255,0.10)",
  userIconBg: "rgba(56,189,248,0.22)",
  userIconBorder: "rgba(56,189,248,0.3)",
  userIconText: "#7dd3fc",
  onlineDot:  "#34d399",
  onlineBorder: "#0c4a6e",
  roleMuted:  "rgba(186,230,253,0.5)",
  logoBg:     "rgba(255,255,255,0.10)",
  logoBorder: "rgba(255,255,255,0.15)",
  logoStroke: "#38bdf8",
  logoutHoverBg:    "rgba(239,68,68,0.10)",
  logoutHoverText:  "#fca5a5",
};

function SectionLabel({ label }) {
  return (
    <div className="flex items-center gap-2 px-3 mb-1.5 mt-5">
      <span className="text-[9px] font-bold tracking-[0.14em] uppercase"
        style={{ color: THEME.labelColor }}>
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: THEME.border }} />
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
        background: active ? THEME.activeNavBg : "transparent",
        color:      active ? THEME.activeNavText : THEME.mutedText,
        border:     active ? `1px solid ${THEME.activeNavBorder}` : "1px solid transparent",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = THEME.hoverBg;
          e.currentTarget.style.color = "#fff";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = THEME.mutedText;
        }
      }}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] rounded-r-full"
          style={{ background: THEME.activeBar }} />
      )}
      <span
        className="w-[30px] h-[30px] rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
        style={{ background: active ? "rgba(56,189,248,0.18)" : "transparent" }}
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
          style={{ background: THEME.activeDot }} />
      )}
    </button>
  );
}

export default function DoctorSidebar({ activeSection, setActiveSection, onLogout }) {
  const { user } = useAuth();

  // ✅ Safe initials — works whether name is "Anuj" or "Dr. Anuj Sharma"
  const cleanName = (user?.name || "").replace(/^Dr\.?\s*/i, "").trim();
  const initials  = cleanName
    ? cleanName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "DR";

  // ✅ Display name — never prefix "Dr." if it's already there
  const displayName = (user?.name || "Doctor").replace(/^Dr\.?\s*/i, "").trim();
  const fullDisplay = `Dr. ${displayName}`;

  return (
    <aside
      className="w-60 flex flex-col min-h-screen relative overflow-hidden"
      style={{ background: THEME.bg }}
    >
      {/* Ambient glows */}
      <div className="absolute -top-14 -left-10 w-44 h-44 rounded-full pointer-events-none"
        style={{ background: THEME.glow1, filter: "blur(40px)" }} />
      <div className="absolute bottom-16 -right-8 w-36 h-36 rounded-full pointer-events-none"
        style={{ background: THEME.glow2, filter: "blur(36px)" }} />

      {/* Logo */}
      <div className="relative flex items-center gap-2.5 px-4 pt-5 pb-4"
        style={{ borderBottom: `1px solid ${THEME.border}` }}>
        <div className="p-2 rounded-[10px]"
          style={{ background: THEME.logoBg, border: `1px solid ${THEME.logoBorder}` }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 12h4l3-9 4 18 3-9h4"
              stroke={THEME.logoStroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <div className="text-white font-semibold text-[15px] tracking-[0.01em]">MediBook</div>
          <div className="text-[10px] uppercase tracking-[0.12em] mt-0.5"
            style={{ color: THEME.roleMuted }}>Doctor Portal</div>
        </div>
      </div>

      {/* User card */}
      <div className="relative mx-2.5 mt-3 flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
        style={{
          background: THEME.userCardBg,
          border: `1px solid ${THEME.userCardBorder}`,
        }}>
        <div className="relative w-9 h-9 rounded-[9px] flex items-center justify-center font-semibold text-xs flex-shrink-0"
          style={{
            background: THEME.userIconBg,
            border: `1px solid ${THEME.userIconBorder}`,
            color: THEME.userIconText,
          }}>
          {initials}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
            style={{ background: THEME.onlineDot, borderColor: THEME.onlineBorder }} />
        </div>
        <div className="min-w-0">
          {/* ✅ Shows "Dr. Anuj" — never "Dr. Dr. Anuj" */}
          <div className="text-white text-[13px] font-semibold truncate">{fullDisplay}</div>
          <div className="text-[11px] mt-0.5 truncate" style={{ color: THEME.roleMuted }}>
            {user?.speciality || "Doctor"}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="relative flex-1 overflow-y-auto px-2 pb-2">
        <SectionLabel label="Main" />
        {navMain.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            active={activeSection === item.id}
            onClick={setActiveSection}
          />
        ))}
        <SectionLabel label="Account" />
        {navAccount.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            active={activeSection === item.id}
            onClick={setActiveSection}
          />
        ))}
      </div>

      {/* Logout */}
      <div className="relative px-2 py-3" style={{ borderTop: `1px solid ${THEME.border}` }}>
        <button
          onClick={onLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-150"
          style={{ background: "transparent", border: "none", color: THEME.mutedText }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = THEME.logoutHoverBg;
            e.currentTarget.style.color = THEME.logoutHoverText;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = THEME.mutedText;
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