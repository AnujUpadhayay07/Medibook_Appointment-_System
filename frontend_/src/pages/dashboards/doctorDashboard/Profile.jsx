// DoctorProfile.jsx
// GET /doctor/profile   → fetch profile
// PUT /doctor/profile   → save changes
// 🔥 Calls updateUser() from AuthContext after save so DoctorOverview picks up new name immediately

import { useState, useEffect, useCallback } from "react";
import {
  MdEdit, MdSave, MdClose,
  MdLock, MdVisibility, MdVisibilityOff,
  MdCheckCircle, MdErrorOutline, MdVerified, MdSchedule,
} from "react-icons/md";
import { useAuth } from "../../../context/AuthContext";
import API from "../../../api/axios";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  primary:       "#0284c7",
  primaryLight:  "#0ea5e9",
  primaryDark:   "#0369a1",
  primaryBg:     "#f0f9ff",
  primaryBorder: "rgba(2,132,199,0.18)",
  dark:          "#0c1a2e",
  darkMid:       "#0f2744",
  white10:       "rgba(255,255,255,0.1)",
  white25:       "rgba(255,255,255,0.25)",
  white40:       "rgba(255,255,255,0.4)",
};

const inputBase = {
  width: "100%",
  border: "1.5px solid rgba(2,132,199,0.2)",
  borderRadius: 10,
  padding: "7px 12px",
  fontSize: 13,
  color: "#1e3a5f",
  background: "#f0f9ff",
  outline: "none",
  fontWeight: 500,
  transition: "border-color 0.15s",
};

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type }) {
  if (!message) return null;
  const ok = type === "success";
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl"
      style={{
        background: ok
          ? `linear-gradient(135deg,${C.primary},${C.primaryDark})`
          : "linear-gradient(135deg,#ef4444,#dc2626)",
        color: "#fff",
        boxShadow: ok ? "0 8px 28px rgba(2,132,199,0.4)" : "0 8px 28px rgba(239,68,68,0.35)",
        animation: "fadeUp .25s ease",
      }}
    >
      {ok ? <MdCheckCircle size={17} /> : <MdErrorOutline size={17} />}
      {message}
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name }) {
  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "DR";
  return (
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-black flex-shrink-0 shadow-lg"
      style={{ background: `linear-gradient(135deg,${C.primaryLight},${C.primaryDark})` }}
    >
      {initials}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div
      className="bg-white rounded-2xl p-5 space-y-4"
      style={{ border: `1px solid ${C.primaryBorder}`, boxShadow: "0 2px 12px rgba(2,132,199,0.06)" }}
    >
      <div className="flex items-center gap-2 pb-1 border-b" style={{ borderColor: C.primaryBorder }}>
        <div
          className="w-1 h-4 rounded-full"
          style={{ background: `linear-gradient(${C.primaryLight},${C.primary})` }}
        />
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: C.primary }}>
          {title}
        </p>
      </div>
      {children}
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, name, value, editing, onChange, type = "text", options, readOnly }) {
  if (!editing) {
    return (
      <div>
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">{label}</p>
        <p className="text-sm font-semibold" style={{ color: value ? "#1e3a5f" : "#d1d5db" }}>
          {value || "Not set"}
        </p>
      </div>
    );
  }
  if (readOnly) {
    return (
      <div>
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">{label}</p>
        <p className="text-sm font-semibold text-gray-400 italic">{value || "—"}</p>
      </div>
    );
  }
  if (options) {
    return (
      <div>
        <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1 block">{label}</label>
        <select name={name} value={value || ""} onChange={onChange} style={inputBase}>
          <option value="">Select {label}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }
  return (
    <div>
      <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1 block">{label}</label>
      <input
        type={type} name={name} value={value || ""} onChange={onChange}
        style={inputBase}
        onFocus={(e) => (e.target.style.borderColor = C.primary)}
        onBlur={(e)  => (e.target.style.borderColor = "rgba(2,132,199,0.2)")}
      />
    </div>
  );
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────
function StatPill({ label, value }) {
  return (
    <div
      className="flex flex-col items-center px-4 py-2 rounded-xl"
      style={{ background: C.white10, minWidth: 72 }}
    >
      <span className="text-white font-black text-base leading-tight">{value ?? "—"}</span>
      <span className="text-[10px] font-medium mt-0.5" style={{ color: C.white40 }}>{label}</span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DoctorProfile() {
  // 🔥 Get updateUser so we can sync context after save
  const { updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [form,    setForm]    = useState({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState({ message: "", type: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });

  const showToast = (msg, type = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await API.get("/doctor/profile");
      setProfile(data);
      setForm(data);
    } catch {
      showToast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (pwdForm.newPassword) {
      if (!pwdForm.currentPassword) return showToast("Enter your current password", "error");
      if (pwdForm.newPassword !== pwdForm.confirmPassword) return showToast("Passwords do not match", "error");
      if (pwdForm.newPassword.length < 6) return showToast("New password must be 6+ characters", "error");
    }

    setSaving(true);
    try {
      const payload = {
        name:       form.name,
        phone:      form.phone,
        dob:        form.dob,
        gender:     form.gender,
        city:       form.city,
        state:      form.state,
        country:    form.country,
        pincode:    form.pincode,
        speciality: form.speciality,
        experience: form.experience,
        fees:       form.fees,
      };
      if (pwdForm.newPassword) {
        payload.currentPassword = pwdForm.currentPassword;
        payload.newPassword     = pwdForm.newPassword;
      }

      const { data } = await API.put("/doctor/profile", payload);

      setProfile(data.doctor);
      setForm(data.doctor);
      setEditing(false);
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });

      // 🔥 Sync AuthContext — DoctorOverview header will update immediately
      // without needing a page reload or dashboard re-fetch
      updateUser({
        name:       data.doctor.name,
        speciality: data.doctor.speciality,
      });

      showToast("Profile updated successfully!");
    } catch (err) {
      showToast(err.response?.data?.message || "Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setForm(profile);
    setEditing(false);
    setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <div className="h-32 rounded-2xl animate-pulse" style={{ background: "#dbeafe" }} />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: "#f0f9ff" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl" style={{ minHeight: "100vh" }}>
      <Toast {...toast} />

      {/* ── Hero Header ──────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl px-6 py-5"
        style={{
          background: `linear-gradient(135deg,${C.dark} 0%,${C.darkMid} 55%,#0c3460 100%)`,
          boxShadow: `0 12px 40px rgba(2,132,199,0.22)`,
        }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: C.primaryLight, opacity: 0.07 }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-20 h-20 rounded-full pointer-events-none"
          style={{ background: C.primary, opacity: 0.05 }}
        />

        <div className="relative flex items-center justify-between gap-4">
          {/* Left */}
          <div className="flex items-center gap-4">
            <Avatar name={profile?.name} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-white font-black text-lg leading-tight">{profile?.name}</h1>
                {profile?.isApproved && <MdVerified size={18} style={{ color: "#38bdf8" }} />}
              </div>
              <p className="text-sm mt-0.5" style={{ color: C.white40 }}>
                {profile?.speciality || "Specialist"} · {profile?.email}
              </p>
              <div className="flex items-center gap-2 mt-2.5">
                <span
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                  style={{
                    background: profile?.isApproved ? "rgba(34,197,94,0.2)" : "rgba(234,179,8,0.2)",
                    color:      profile?.isApproved ? "#86efac" : "#fde047",
                  }}
                >
                  {profile?.isApproved ? "✓ Approved" : "⏳ Pending Approval"}
                </span>
                {profile?.experience != null && (
                  <span
                    className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: C.white10, color: "#e0f2fe" }}
                  >
                    {profile.experience} yrs exp
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right — stat pills + action buttons */}
          <div className="flex flex-col items-end gap-3">
            <div className="flex gap-2">
              {profile?.fees != null && <StatPill label="Fee (₹)" value={`₹${profile.fees}`} />}
              {profile?.phone      && <StatPill label="Phone"  value={profile.phone}       />}
            </div>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button
                    onClick={cancelEdit}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition hover:scale-105"
                    style={{ background: C.white10, border: `1px solid ${C.white25}`, color: "#fff" }}
                  >
                    <MdClose size={15} /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition hover:scale-105 disabled:opacity-50"
                    style={{ background: "#fff", color: C.primaryDark, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                  >
                    {saving ? (
                      <><div className="w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" /> Saving…</>
                    ) : (
                      <><MdSave size={15} /> Save</>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition hover:scale-105"
                  style={{ background: C.white10, border: `1px solid ${C.white25}`, color: "#fff" }}
                >
                  <MdEdit size={15} /> Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Personal Info ─────────────────────────────────────────────────────── */}
      <Section title="Personal Information">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Full Name"     name="name"   value={form.name}   editing={editing} onChange={handleChange} />
          <Field label="Email"         name="email"  value={form.email}  editing={editing} onChange={handleChange} type="email" readOnly={editing} />
          <Field label="Phone"         name="phone"  value={form.phone}  editing={editing} onChange={handleChange} />
          <Field label="Date of Birth" name="dob"    value={form.dob ? form.dob.slice(0, 10) : ""} editing={editing} onChange={handleChange} type="date" />
          <Field label="Gender"        name="gender" value={form.gender} editing={editing} onChange={handleChange} options={["Male", "Female", "Other"]} />
        </div>
      </Section>

      {/* ── Professional Details ──────────────────────────────────────────────── */}
      <Section title="Professional Details">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Speciality"           name="speciality" value={form.speciality} editing={editing} onChange={handleChange} />
          <Field label="Experience (years)"   name="experience" value={form.experience} editing={editing} onChange={handleChange} type="number" />
          <Field label="Consultation Fee (₹)" name="fees"       value={form.fees}       editing={editing} onChange={handleChange} type="number" />
        </div>
        {!editing && (
          <div className="mt-3 pt-3 border-t flex items-center gap-1.5" style={{ borderColor: C.primaryBorder }}>
            <MdSchedule size={14} style={{ color: C.primary }} />
            <span className="text-xs text-gray-400">
              Approval status:{" "}
              <strong style={{ color: profile?.isApproved ? "#16a34a" : "#ca8a04" }}>
                {profile?.isApproved ? "Approved by Admin" : "Pending admin approval"}
              </strong>
            </span>
          </div>
        )}
      </Section>

      {/* ── Location ──────────────────────────────────────────────────────────── */}
      <Section title="Location">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="City"    name="city"    value={form.city}    editing={editing} onChange={handleChange} />
          <Field label="State"   name="state"   value={form.state}   editing={editing} onChange={handleChange} />
          <Field label="Country" name="country" value={form.country} editing={editing} onChange={handleChange} />
          <Field label="Pincode" name="pincode" value={form.pincode} editing={editing} onChange={handleChange} />
        </div>
      </Section>

      {/* ── Change Password (only when editing) ───────────────────────────────── */}
      {editing && (
        <Section title="Change Password">
          <p className="text-xs text-gray-400 -mt-1 mb-2">Leave blank to keep your current password.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Current Password", key: "currentPassword" },
              { label: "New Password",     key: "newPassword"     },
              { label: "Confirm Password", key: "confirmPassword" },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1 block">
                  {label}
                </label>
                <div className="relative">
                  <MdLock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: C.primary }} />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={pwdForm[key]}
                    onChange={(e) => setPwdForm((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder="••••••••"
                    style={{ ...inputBase, paddingLeft: 34, paddingRight: key === "newPassword" ? 34 : 12 }}
                    onFocus={(e) => (e.target.style.borderColor = C.primary)}
                    onBlur={(e)  => (e.target.style.borderColor = "rgba(2,132,199,0.2)")}
                  />
                  {key === "newPassword" && (
                    <button
                      type="button"
                      onClick={() => setShowPwd((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPwd ? <MdVisibilityOff size={15} /> : <MdVisibility size={15} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Bottom save bar ────────────────────────────────────────────────────── */}
      {editing && (
        <div
          className="flex items-center justify-between px-4 py-3.5 rounded-2xl"
          style={{ background: "rgba(2,132,199,0.05)", border: `1px solid ${C.primaryBorder}` }}
        >
          <p className="text-xs text-gray-500">
            Email cannot be changed ·{" "}
            <strong style={{ color: C.primary }}>Password is optional</strong>
          </p>
          <div className="flex gap-2">
            <button
              onClick={cancelEdit}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition hover:bg-gray-100"
              style={{ border: "1px solid #e5e7eb", color: "#6b7280" }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm transition hover:scale-105 disabled:opacity-50"
              style={{
                background: `linear-gradient(135deg,${C.primaryLight},${C.primary})`,
                color: "#fff",
                boxShadow: "0 4px 14px rgba(2,132,199,0.35)",
              }}
            >
              <MdSave size={15} />
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}