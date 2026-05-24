import { useEffect, useState } from "react";
import {
  MdSearch,
  MdClose,
  MdCheckCircle,
} from "react-icons/md";
import API from "../../../api/axios";

// SPECIALITIES
const SPECIALITIES = [
  "all",
  "Cardiology",
  "Dermatology",
  "ENT",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
];

// Utils
const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const today = new Date().toISOString().split("T")[0];

// ─── Doctor Row ───────────────────────────────
function DoctorRow({ doctor, onBook }) {
  return (
    <div className="flex items-center justify-between bg-white/60 backdrop-blur-xl border border-gray-200 rounded-2xl px-6 py-4 shadow-sm hover:shadow-xl transition">

      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center font-bold text-sm">
          {getInitials(doctor.name)}
        </div>

        <div>
          <h3 className="font-bold text-gray-800">{doctor.name}</h3>

          <span className="inline-block mt-1 text-xs px-2 py-1 bg-teal-100 text-teal-700 rounded-full">
            {doctor.speciality}
          </span>

          {/* ✅ FIX: Show actual experience from DB, only fallback if truly missing */}
          <p className="text-xs mt-1 text-purple-500 font-medium">
          {doctor.experience
          ?`${doctor.experience}+ years experience`
          : "Experience not listed"}
          </p>
        </div>
      </div>

      <div className="text-right">
        {/* ✅ Fees from DB — dynamic */}
        <p className="text-lg font-bold text-teal-600">
          {doctor.fees ? `₹${doctor.fees}` : "Fee not listed"}
        </p>

        <button
          onClick={() => onBook(doctor)}
          className="mt-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-xl text-sm font-semibold hover:scale-105 transition"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}

// ─── Booking Modal ────────────────────────────
function BookingModal({ doctor, onClose }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [success, setSuccess] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch doctor availability
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/doctor/availability/${doctor._id}`);
        setAvailability(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load doctor availability");
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, [doctor._id]);

  // ✅ FIX: Timezone-safe day calculation
  // new Date("2025-01-15") → UTC midnight → wrong day in IST
  // new Date(2025, 0, 15)  → local midnight → correct ✅
  const slotsForDay = () => {
    if (!date || !availability) return [];

    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];

    const [year, month, day] = date.split("-").map(Number);
    const localDate = new Date(year, month - 1, day);
    const dayName = days[localDate.getDay()];

    return availability.slots?.[dayName] || [];
  };

  const handleBooking = async () => {
    if (!date || !time) return;
    setError("");
    setBookingLoading(true);

    try {
      await API.post("/appointments", {
        doctorId: doctor._id,
        date,
        time,
        note,
      });

      setSuccess(true);
    } catch (err) {
      // ✅ Show proper error (including race condition message from backend)
      setError(err.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md text-center shadow-2xl">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading availability...</p>
        </div>
      </div>
    );
  }

  // ERROR STATE (availability fetch failed)
  if (error && !availability) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8 w-full max-w-md text-center shadow-2xl">
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <button onClick={onClose} className="bg-gray-100 px-4 py-2 rounded-xl text-sm">Close</button>
        </div>
      </div>
    );
  }

  // SUCCESS VIEW
  if (success) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-6 w-full max-w-md text-center shadow-2xl">
          <MdCheckCircle size={60} className="text-teal-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold">Appointment Confirmed!</h2>
          <div className="mt-4 text-sm text-gray-600 space-y-2 text-left bg-teal-50 p-4 rounded-xl">
            <p><b>Doctor:</b> {availability.doctor.name}</p>
            <p><b>Speciality:</b> {availability.doctor.speciality}</p>
            <p><b>Date:</b> {date}</p>
            <p><b>Time:</b> {time}</p>
            <p><b>Fee:</b> ₹{availability.doctor.fees}</p>
            {availability.doctor.experience && (
              <p><b>Experience:</b> {availability.doctor.experience}+ yrs</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="mt-5 w-full bg-teal-600 text-white py-2 rounded-xl font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  const slots = slotsForDay();

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 w-full max-w-lg shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Book Appointment</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <MdClose size={20} />
          </button>
        </div>

        {/* Doctor Info */}
        <div className="bg-teal-50 p-4 rounded-xl mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center font-bold text-sm">
              {getInitials(availability.doctor.name)}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{availability.doctor.name}</p>
              <p className="text-sm text-gray-500">{availability.doctor.speciality}</p>
            </div>
          </div>
          <div className="flex justify-between mt-3 text-sm">
            {availability.doctor.experience && (
              <p className="text-purple-500 font-medium">
                {availability.doctor.experience}+ yrs experience
              </p>
            )}
            <p className="text-teal-600 font-bold">₹{availability.doctor.fees}</p>
          </div>
        </div>

        {/* Date Picker */}
        <label className="text-xs text-gray-500 font-medium mb-1 block">Select Date</label>
        <input
          type="date"
          min={today}
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setTime(""); // ✅ Reset time when date changes
            setError("");
          }}
          className="w-full border rounded-xl px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />

        {/* Time Slots */}
        <label className="text-xs text-gray-500 font-medium mb-1 block">Select Time Slot</label>
        <div className="flex flex-wrap gap-2 mb-3 min-h-[40px]">
          {!date && (
            <p className="text-gray-400 text-xs self-center">Please select a date first</p>
          )}
          {date && slots.length === 0 && (
            <p className="text-red-400 text-xs self-center">No slots available for this day</p>
          )}
          {slots.map((slot) => (
            <button
              key={slot}
              onClick={() => { setTime(slot); setError(""); }}
              className={`px-3 py-1 rounded-full text-xs border font-medium transition ${
                time === slot
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-gray-100 text-gray-600 hover:bg-teal-50 hover:border-teal-300"
              }`}
            >
              {slot}
            </button>
          ))}
        </div>

        {/* Note */}
        <label className="text-xs text-gray-500 font-medium mb-1 block">Issue / Note (optional)</label>
        <textarea
          placeholder="Describe your issue..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full border rounded-xl px-4 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
        />

        {/* ✅ Error message (booking errors like race condition) */}
        {error && (
          <p className="text-red-500 text-xs mb-3 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        {/* Confirm Button */}
        <button
          onClick={handleBooking}
          disabled={!date || !time || bookingLoading}
          className="w-full bg-gradient-to-r from-teal-600 to-emerald-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {bookingLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Confirming...
            </>
          ) : (
            "Confirm Booking"
          )}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────
export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [speciality, setSpeciality] = useState("all");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [fetchError, setFetchError] = useState("");

  const fetchDoctors = async () => {
    try {
      setFetchError("");
      const { data } = await API.get("/auth/doctors");
      setDoctors(data);
      setFiltered(data);
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
      setFetchError("Failed to load doctors. Please refresh.");
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // SMART FILTER (name + speciality)
  useEffect(() => {
    let result = doctors;

    if (speciality !== "all") {
      result = result.filter((d) => d.speciality === speciality);
    }

    if (search) {
      result = result.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.speciality?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(result);
  }, [search, speciality, doctors]);

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold">Book Appointment</h1>
        <p className="text-gray-400 text-sm">Find and book a doctor near you</p>
      </div>

      {/* Search */}
      <div className="flex items-center bg-white rounded-xl px-4 py-2 shadow">
        <MdSearch className="text-gray-400 mr-2" />
        <input
          placeholder="Search doctor or speciality..."
          className="w-full outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {SPECIALITIES.map((s) => (
          <button
            key={s}
            onClick={() => setSpeciality(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition ${
              speciality === s
                ? "bg-teal-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-teal-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Error */}
      {fetchError && (
        <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl">
          {fetchError}
        </div>
      )}

      {/* Doctors */}
      <div className="flex flex-col gap-4">
        {filtered.length === 0 && !fetchError && (
          <p className="text-gray-400 text-sm text-center py-10">
            No doctors found matching your search
          </p>
        )}
        {filtered.map((doc) => (
          <DoctorRow key={doc._id} doctor={doc} onBook={setSelectedDoctor} />
        ))}
      </div>

      {selectedDoctor && (
        <BookingModal
          doctor={selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
        />
      )}
    </div>
  );
}