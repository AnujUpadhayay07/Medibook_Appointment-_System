import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

import Sidebar from "./Sidebar";
import Overview from "./Overview";
import Appointments from "./Appointment";
import Patients from "./Patients";
import Clinical from "./Clinical";
import Profile from "./Profile";

export default function DoctorDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  // 🔥 Loading fallback
  if (loading) {
    return <div className="p-6 text-lg text-blue-600">Loading dashboard...</div>;
  }

  // 🔥 If no user → go to login
  if (!user) {
    navigate("/login");
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <Overview user={user} setActiveSection={setActiveSection} />;
      case "appointments":
        return <Appointments user={user} />;
      case "patients":
        return <Patients user={user} />;
      case "clinical":
        return <Clinical user={user} />;
      case "profile":
        return <Profile user={user} />;
      default:
        return <Overview user={user} setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        user={user}
        onLogout={handleLogout}
        theme="blue" // ✅ Blue variant for doctor
      />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">{renderSection()}</div>
      </main>
    </div>
  );
}