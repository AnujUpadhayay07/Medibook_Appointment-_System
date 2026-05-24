import { useState, useEffect } from "react";
import API from "../../../api/axios";
import { MdEdit, MdCheck, MdClose } from "react-icons/md";
import { Country, State } from "country-state-city";

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    dob: "",
    weight: "",
    height: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    emergency: "",
  });

  // ✅ Load Countries
  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  // ✅ Load States when Country changes
  useEffect(() => {
    if (form.country) {
      const selected = countries.find(c => c.name === form.country);
      if (selected) {
        setStates(State.getStatesOfCountry(selected.isoCode));
      }
    } else {
      setStates([]);
    }
  }, [form.country, countries]);

  // ✅ Fetch Profile (FIXED DOB)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await API.get("/auth/me");

        setForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          gender: data.gender || "",
          dob: data.dob ? data.dob.split("T")[0] : "", // 🔥 FIX
          weight: data.weight || "",
          height: data.height || "",
          country: data.country || "",
          state: data.state || "",
          city: data.city || "",
          pincode: data.pincode || "",
          emergency: data.emergency || "",
        });

      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ✅ Save Profile
  const saveProfile = async () => {
    try {
      await API.put("/auth/update", form);
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  const initials = form.name
    ? form.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "PT";

  if (loading)
    return <div className="text-center py-10 text-gray-400">Loading...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      <h1 className="text-2xl font-semibold text-gray-800">My Profile</h1>
      <p className="text-sm text-gray-500 mb-6">
        Manage your personal information
      </p>

      <div className="bg-white rounded-2xl shadow-lg border p-6">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b pb-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-xl font-bold">
              {initials}
            </div>

            <div>
              <h2 className="text-lg font-semibold">{form.name || "Patient"}</h2>
              <p className="text-sm text-gray-500">{form.email}</p>
            </div>
          </div>

          {editing ? (
            <div className="flex gap-2">
              <button onClick={saveProfile} className="btn-primary">
                <MdCheck /> Save
              </button>
              <button onClick={() => setEditing(false)} className="btn-secondary">
                <MdClose /> Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="btn-outline">
              <MdEdit /> Edit
            </button>
          )}
        </div>

        {/* PERSONAL */}
        <Section title="Personal Information">

          <Field label="Full Name">
            <Input editing={editing} value={form.name} onChange={v => setForm({...form, name: v})}/>
          </Field>

          <Field label="Email">
            <Input editing={editing} value={form.email} onChange={v => setForm({...form, email: v})}/>
          </Field>

          <Field label="Phone">
            <Input editing={editing} value={form.phone} onChange={v => setForm({...form, phone: v})}/>
          </Field>

          <Field label="Gender">
            {editing ? (
              <select
                value={form.gender}
                onChange={(e) => setForm({...form, gender: e.target.value})}
                className="input"
              >
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            ) : <Display value={form.gender} />}
          </Field>

          {/* ✅ FIXED DOB DISPLAY */}
          <Field label="Date of Birth">
            {editing ? (
              <input
                type="date"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
                className="input"
              />
            ) : (
              <Display value={form.dob} isDate />
            )}
          </Field>

        </Section>

        {/* ADDRESS */}
        <Section title="Address">

          <Field label="Country">
            {editing ? (
              <select
                value={form.country}
                onChange={(e) =>
                  setForm({ ...form, country: e.target.value, state: "" })
                }
                className="input"
              >
                <option value="">Select Country</option>
                {countries.map(c => (
                  <option key={c.isoCode}>{c.name}</option>
                ))}
              </select>
            ) : <Display value={form.country} />}
          </Field>

          <Field label="State">
            {editing ? (
              <select
                value={form.state}
                onChange={(e) =>
                  setForm({ ...form, state: e.target.value })
                }
                className="input"
              >
                <option value="">Select State</option>
                {states.map(s => (
                  <option key={s.isoCode}>{s.name}</option>
                ))}
              </select>
            ) : <Display value={form.state} />}
          </Field>

          <Field label="City">
            <Input editing={editing} value={form.city} onChange={v => setForm({...form, city: v})}/>
          </Field>

          <Field label="Pincode">
            <Input editing={editing} value={form.pincode} onChange={v => setForm({...form, pincode: v})}/>
          </Field>

        </Section>

        {/* EMERGENCY */}
        <Section title="Emergency">
          <Field label="Emergency Contact" full>
            <Input editing={editing} value={form.emergency} onChange={v => setForm({...form, emergency: v})}/>
          </Field>
        </Section>

      </div>
    </div>
  );
}

/* UI COMPONENTS */

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-600 mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-5">{children}</div>
    </div>
  );
}

function Field({ label, children, full }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      {children}
    </div>
  );
}

function Input({ editing, value, onChange }) {
  return editing ? (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input"
    />
  ) : <Display value={value} />;
}

/* ✅ DATE FORMAT FIX */
function Display({ value, isDate }) {
  let displayValue = value;

  if (isDate && value) {
    const d = new Date(value);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    displayValue = `${day}-${month}-${year}`;
  }

  return (
    <div className="bg-gray-50 px-3 py-2 rounded-lg text-sm">
      {displayValue || "—"}
    </div>
  );
}