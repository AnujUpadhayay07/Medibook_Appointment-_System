import { useState, useEffect } from "react";
import { MdStar, MdStarBorder } from "react-icons/md";

function Stars({ count }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) =>
        i <= count
          ? <MdStar key={i} size={12} className="text-[#BA7517]" />
          : <MdStarBorder key={i} size={12} className="text-gray-300" />
      )}
    </div>
  );
}

export default function MyDoctors({ setActiveSection }) {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetch("/api/patient/doctors", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(res => res.json())
      .then(data => setDoctors(data.doctors || []))
      .catch(err => console.error("Error fetching doctors:", err));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-base font-medium text-gray-800">My doctors</h1>
          <p className="text-xs text-gray-400 mt-0.5">Previously visited specialists</p>
        </div>
        <button
          onClick={() => setActiveSection("book")}
          className="px-4 py-2 bg-[#0F6E56] text-white text-[12px] font-medium rounded-lg hover:bg-[#085041] transition-colors"
        >
          + Find new doctor
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-3.5">
        <div className="flex flex-col">
          {doctors.map((d, i) => (
            <div key={i} className={`flex items-center gap-3 py-3.5 ${i < doctors.length - 1 ? "border-b border-gray-100" : ""}`}>
              <div className={`w-11 h-11 rounded-full ${d.bg || "bg-gray-100"} ${d.color || "text-gray-500"} flex items-center justify-center text-[14px] font-medium flex-shrink-0`}>
                {d.initials || d.name?.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-gray-700">{d.name}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{d.spec} · {d.hospital}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <Stars count={d.rating || 0} />
                  <span className="text-[10px] text-gray-400">{d.visits || 0} visits</span>
                </div>
              </div>
              <button
                onClick={() => setActiveSection("book")}
                className="px-3 py-1.5 border border-[#0F6E56] text-[#0F6E56] text-[11px] font-medium rounded-lg hover:bg-[#E1F5EE] transition-colors whitespace-nowrap"
              >
                Book again
              </button>
            </div>
          ))}
          {doctors.length === 0 && (
            <div className="text-[12px] text-gray-400 text-center py-4">No doctors found</div>
          )}
        </div>
      </div>
    </div>
  );
}