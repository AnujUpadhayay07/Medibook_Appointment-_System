import { useEffect, useState } from "react";
import {
  MdPerson,
  MdEmail,
  MdLock,
  MdSave,
} from "react-icons/md";
import API from "../../../api/axios";

// Same design feel as Patients
const CARD_STYLE = {
  border: "1px solid #f1f5f9",
  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
};

export default function AdminProfile() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ── Fetch Profile ──
  useEffect(() => {
    API.get("/auth/me")
      .then((res) => {
        setForm({
          name: res.data.name || "",
          email: res.data.email || "",
          password: "",
        });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // ── Handle Change ──
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ── Update Profile ──
  const handleUpdate = async () => {
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;

      await API.put("/auth/update", payload);

      setMessage("Profile updated successfully");
    } catch (err) {
      setMessage(err.response?.data?.message || "Update failed");
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <div className="w-8 h-8 border-2 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div>
        <h1
          className="text-2xl font-black tracking-tight text-slate-900"
          style={{ letterSpacing: "-0.02em" }}
        >
          Admin Profile
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage your account details and credentials
        </p>
      </div>

      {/* ── Card ── */}
      <div
        className="bg-white rounded-2xl p-6 max-w-xl"
        style={CARD_STYLE}
      >
        <div className="space-y-4">

          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase">
              Name
            </label>
            <div className="relative mt-1">
              <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none"
                style={{
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                }}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase">
              Email
            </label>
            <div className="relative mt-1">
              <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none"
                style={{
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase">
              New Password
            </label>
            <div className="relative mt-1">
              <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Leave empty if not changing"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none"
                style={{
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                }}
              />
            </div>
          </div>

          {/* Message */}
          {message && (
            <p className="text-sm font-medium text-teal-600 mt-2">
              {message}
            </p>
          )}

          {/* Button */}
          <button
            onClick={handleUpdate}
            className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition"
            style={{
              background: "#0f2744",
              color: "#7dd3fc",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <MdSave size={16} />
            Update Profile
          </button>

        </div>
      </div>
    </div>
  );
}
