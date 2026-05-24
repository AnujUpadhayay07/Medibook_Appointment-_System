import { useEffect, useState } from "react";
import API from "../../../api/axios";
import { MdClose } from "react-icons/md";

const filters = ["All", "Upcoming", "Completed", "Cancelled"];

export default function MyAppointments() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [appointments, setAppointments] = useState([]);
  const [selectedCancel, setSelectedCancel] = useState(null); // modal

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data } = await API.get("/appointments/my");
      setAppointments(data);
    } catch (err) {
      console.error(err);
    }
  };

  // FILTER LOGIC
  const filtered = appointments.filter((a) => {
    const today = new Date();

    if (activeFilter === "All") return true;

    if (activeFilter === "Upcoming") {
      return a.status !== "cancelled" && new Date(a.date) >= today;
    }

    if (activeFilter === "Completed") {
      return a.status === "completed";
    }

    if (activeFilter === "Cancelled") {
      return a.status === "cancelled";
    }

    return true;
  });

  // STATUS COLORS
  const getStatusStyle = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-gray-100 text-gray-500";
      case "cancelled":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  // CANCEL CONFIRM
  const confirmCancel = async () => {
    try {
      await API.put(`/appointments/cancel/${selectedCancel}`);
      setSelectedCancel(null);
      fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-gray-800">
          My Appointments
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          View all your bookings
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition
              ${
                activeFilter === f
                  ? "bg-teal-100 text-teal-700"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            No appointments found
          </div>
        ) : (
          filtered.map((a) => (
            <div
              key={a._id}
              className="bg-white border border-gray-100 rounded-xl p-4 flex justify-between items-center shadow-sm hover:shadow-md transition"
            >
              {/* LEFT */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-semibold">
                  {a.doctorId?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-800">
                    {a.doctorId?.name}
                  </div>

                  <div className="text-xs text-gray-400">
                    {a.doctorId?.speciality}
                  </div>

                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(a.date).toDateString()} · {a.time}
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${getStatusStyle(
                    a.status
                  )}`}
                >
                  {a.status}
                </span>

                {/* Cancel Button */}
                {a.status !== "cancelled" && (
                  <button
                    onClick={() => setSelectedCancel(a._id)}
                    className="text-xs px-3 py-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* CANCEL MODAL */}
      {selectedCancel && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Cancel Appointment</h2>
              <button onClick={() => setSelectedCancel(null)}>
                <MdClose />
              </button>
            </div>

            <p className="text-sm text-gray-600">
              Are you sure you want to cancel this appointment?
            </p>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setSelectedCancel(null)}
                className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-600"
              >
                No
              </button>

              <button
                onClick={confirmCancel}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
