import { useEffect, useState, useCallback } from "react";
import API from "../../../api/axios";
import {
  MdFavorite,
  MdTrendingUp,
  MdBloodtype,
  MdAir,
  MdDescription,
  MdDownload,
  MdErrorOutline,
  MdRefresh,
  MdOpenInNew,
  MdThermostat,
} from "react-icons/md";

// ─── Vital Config ─────────────────────────────────────────────
const VITAL_MAP = [
  {
    keys: ["bp", "Blood Pressure"],
    label: "Blood Pressure",
    unit: "mmHg",
    icon: MdTrendingUp,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    keys: ["sugar", "Sugar"],
    label: "Sugar",
    unit: "mg/dL",
    icon: MdBloodtype,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    keys: ["spo2", "SpO2"],
    label: "SpO2",
    unit: "%",
    icon: MdAir,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    keys: ["temperature"],
    label: "Temperature",
    unit: "°F",
    icon: MdThermostat,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
];

// ─── Status Config ────────────────────────────────────────────
const STATUS_STYLE = {
  Good: "bg-green-50 text-green-700",
  Normal: "bg-yellow-50 text-yellow-700",
  Bad: "bg-red-50 text-red-700",
};

// ─── Helpers ──────────────────────────────────────────────────
function fmtDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function findVital(records, keys) {
  if (!records) return null;
  for (let k of keys) {
    if (records[k]) return records[k];
  }
  return null;
}

// ─── Components ───────────────────────────────────────────────
function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-red-50 border rounded text-red-600 mb-4">
      <MdErrorOutline />
      {message}
      <button onClick={onRetry}>
        <MdRefresh />
      </button>
    </div>
  );
}

function VitalCard({ cfg, value }) {
  const Icon = cfg.icon;

  return (
    <div className={`p-4 rounded-xl shadow-sm border ${cfg.bg}`}>
      <div className="flex items-center gap-3">
        <Icon className={`${cfg.color} text-xl`} />
        <div>
          <p className="text-xs text-gray-500">{cfg.label}</p>
          <p className="font-bold text-gray-800">
            {value || "--"} {value && cfg.unit}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Report Card ──────────────────────────────────────────────
function ReportCard({ record }) {
  const status = record.status || "Normal";

  return (
    <div className="p-4 border-b last:border-0 space-y-3">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Dr. {record.doctor?.name || "Unknown"}
          </p>
          <p className="text-xs text-gray-400">
            {fmtDate(record.appointment?.date)} · {record.appointment?.time}
          </p>
        </div>

        <span
          className={`text-xs px-2 py-1 rounded-full font-semibold ${STATUS_STYLE[status]}`}
        >
          {status}
        </span>
      </div>

      {/* Vitals */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {VITAL_MAP.map((cfg) => {
          const val = findVital(record.records, cfg.keys);
          if (!val) return null;

          const Icon = cfg.icon;

          return (
            <div key={cfg.label} className="flex items-center gap-2">
              <Icon className={cfg.color} />
              <span className="text-gray-500">{cfg.label}:</span>
              <span className="font-semibold text-gray-800">
                {val} {cfg.unit}
              </span>
            </div>
          );
        })}

        {Object.keys(record.records || {}).length === 0 && (
          <p className="text-gray-300 col-span-2">No vitals added</p>
        )}
      </div>

      {/* Notes */}
      {record.notes && (
        <p className="text-xs text-gray-500 italic border-t pt-2">
          {record.notes}
        </p>
      )}

      {/* Report */}
      {record.fileUrl && (
        <div className="flex items-center gap-3 text-sm">
          <MdDescription className="text-gray-400" />

          <a
            href={`http://localhost:5000${record.fileUrl}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 font-semibold flex items-center gap-1"
          >
            <MdOpenInNew /> View
          </a>

          <a
            href={`http://localhost:5000${record.fileUrl}`}
            download
            className="text-green-600 font-semibold flex items-center gap-1"
          >
            <MdDownload /> Download
          </a>
        </div>
      )}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────
export default function HealthRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/health-records/my");
      setRecords(data);
      setError("");
    } catch (err) {
      setError("Failed to load health records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // MOST IMPORTANT FIX: Latest Record Only
  const latestRecord = records.length > 0 ? records[0] : null;

  const latestVitals = VITAL_MAP.map((cfg) => ({
    cfg,
    value: latestRecord ? findVital(latestRecord.records, cfg.keys) : null
  }));

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <h1 className="text-xl font-bold text-gray-800">Health Records</h1>

      {error && <ErrorBanner message={error} onRetry={fetchRecords} />}

      {/* Latest Record Info */}
      {latestRecord && (
        <div className="text-xs text-gray-400">
          Latest record from Dr. {latestRecord.doctor?.name || "Unknown"} •{" "}
          {fmtDate(latestRecord.appointment?.date)}
        </div>
      )}

      {/* Vitals Dashboard */}
      <div className="grid grid-cols-4 gap-4">
        {latestVitals.map(({ cfg, value }) => (
          <VitalCard key={cfg.label} cfg={cfg} value={value} />
        ))}
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl shadow border">
        <div className="p-4 border-b font-semibold text-gray-700">
          Medical History
        </div>

        {loading ? (
          <p className="p-4 text-sm text-gray-400">Loading...</p>
        ) : records.length === 0 ? (
          <p className="p-4 text-sm text-gray-400">No records found</p>
        ) : (
          records.map((rec) => (
            <ReportCard key={rec._id} record={rec} />
          ))
        )}
      </div>
    </div>
  );
}
