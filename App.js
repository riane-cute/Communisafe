import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import io from "socket.io-client";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PendingApproval from "./pages/PendingApproval";
import Dashboard from "./pages/Dashboard";
import CommunityAnnouncements from "./pages/CommunityAnnouncements";
import FloodTracker from "./pages/FloodTracker";
import IncidentReport from "./pages/IncidentReport";
import VisitorManagement from "./pages/VisitorManagement";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import PersonalInfo from "./pages/PersonalInfo";
import Settings from "./pages/Settings";
import EditProfile from './pages/EditProfile';

// 🔌 Global socket connection
const socket = io("http://localhost:5000"); // Replace with Render URL if hosted

function App() {
  useEffect(() => {
    socket.on("newNotification", (data) => {
      console.log("🌐 Global Notification Received:", data);

      // Optional: store in localStorage to display red dot in header
      localStorage.setItem("hasNewNotification", "true");

      // Optional: trigger toast/popup if you have a UI lib like react-toastify
    });

    return () => socket.off("newNotification");
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/pending" element={<PendingApproval />} />
        <Route path="/home" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/announcements" element={<CommunityAnnouncements />} />
        <Route path="/flood-tracker" element={<FloodTracker />} />
        <Route path="/incidentreport" element={<IncidentReport />} />
        <Route path="/visitorManagement" element={<VisitorManagement />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/personal-info" element={<PersonalInfo />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/edit-profile" element={<EditProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
