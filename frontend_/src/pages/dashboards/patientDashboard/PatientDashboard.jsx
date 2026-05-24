import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

import Sidebar from "./Sidebar";
import Overview from "./Overview";
import BookAppointment from "./BookAppointment";
import MyAppointments from "./MyAppointments";
import Medicines from "./Medicines";
import HealthRecords from "./HealthRecords";

import Profile from "./Profile";

export default function PatientDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const { user, logout, loading } = useAuth(); // ✅ include loading
  const navigate = useNavigate();

  // 🔥 VERY IMPORTANT
  if (loading) {
    return <div className="p-6 text-lg">Loading dashboard...</div>;
  }

  // 🔥 If no user → go back to login
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
      case "book":
        return <BookAppointment />;
      case "appointments":
        return <MyAppointments />;
      case "medicines":
        return <Medicines />;
      case "health":
        return <HealthRecords />;
      
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
      />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">{renderSection()}</div>
      </main>
    </div>
  );
}