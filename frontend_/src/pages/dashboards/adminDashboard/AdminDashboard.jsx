import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

import Sidebar from "./Sidebar";
import AdminOverview from "./AdminOverview";
import AdminDoctors from "./AdminDoctors";
import AdminPatients from "./AdminPatients";
import AdminAppointments from "./Adminappointments";
import AdminAnalytics from "./Analytics";
import AdminProfile from "./AdminProfile"; // ✅ added

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div className="p-6 text-lg text-teal-600">Loading dashboard...</div>;
  }

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
        return <AdminOverview setActiveSection={setActiveSection} />;
      case "doctors":
        return <AdminDoctors />;
      case "patients":
        return <AdminPatients />;
      case "appointments":
        return <AdminAppointments />;
      case "analytics":
        return <AdminAnalytics />;
      case "profile": // ✅ added
        return <AdminProfile />;
      default:
        return <AdminOverview setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">{renderSection()}</div>
      </main>
    </div>
  );
}