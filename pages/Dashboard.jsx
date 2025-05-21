import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBullhorn,FaUserFriends,FaFileAlt, FaWater,} from "react-icons/fa";
import { FiBell, FiUser, FiMenu, FiEdit2 } from "react-icons/fi";
import "../css/Dashboard.css";

export default function Dashboard() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    role: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    console.log("📦 localStorage name:", localStorage.getItem("name"));
    console.log("📦 localStorage email:", localStorage.getItem("email"));
    console.log("📦 localStorage role:", localStorage.getItem("role"));
    setUserInfo({
      name: localStorage.getItem("name") || "Unknown",
      email: localStorage.getItem("email") || "No Email",
      role: localStorage.getItem("role") || "guest",
    });
  }, []);

  const greeting =
    userInfo.role === "official"
      ? "Admin"
      : userInfo.role === "security"
      ? "Security"
      : userInfo.role === "resident"
      ? "User"
      : "Guest";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 relative">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-4 py-4 shadow-sm bg-white">
        <button onClick={() => setDrawerOpen(true)} className="text-gray-600 focus:outline-none">
          <FiMenu size={24} />
        </button>
        <h1 className="text-xl font-semibold text-green-600">Welcome, {greeting}!</h1>
        <div className="flex items-center gap-4">
          
          <FiUser
            size={28}
            className="text-green-600 border border-green-500 rounded-full p-1 cursor-pointer"
            onClick={() => setShowProfileModal(true)}
          />
        </div>
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <>
          <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 p-6">
            <div className="mb-8">
              <h2 className="font-bold text-lg mb-2">Menu</h2>
              <div className="flex items-center gap-2 text-green-600 font-bold text-xl">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 12l9-9 9 9h-3v9H6v-9H3z" />
                </svg>
                <span>Dashboard</span>
              </div>
            </div>
            <nav className="space-y-3 text-sm font-medium text-gray-600">
              <div className="text-green-600">Dashboard</div>
              <div onClick={() => { navigate("/announcements"); setDrawerOpen(false); }} className="cursor-pointer hover:text-green-600">Community Announcements</div>
              <div onClick={() => { navigate("/flood-tracker"); setDrawerOpen(false); }} className="cursor-pointer hover:text-green-600">Flood Tracker</div>
              <div onClick={() => { navigate("/incidentreport"); setDrawerOpen(false); }} className="cursor-pointer hover:text-green-600">Incident Report</div>
              <div onClick={() => { navigate("/visitorManagement"); setDrawerOpen(false); }} className="cursor-pointer hover:text-green-600">Visitor Management</div>
             
            </nav>
          </aside>
          <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={() => setDrawerOpen(false)} />
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto mt-6">
          <div onClick={() => navigate("/announcements")} className="cursor-pointer bg-white border shadow-md p-6 rounded-lg text-center hover:shadow-lg transition">
            <FaBullhorn size={32} className="text-gray-500 mx-auto mb-2" />
            <p className="text-gray-700">Community Announcements</p>
          </div>
          <div onClick={() => navigate("/flood-tracker")} className="cursor-pointer bg-white border shadow-md p-6 rounded-lg text-center hover:shadow-lg transition">
            <FaWater size={32} className="text-gray-500 mx-auto mb-2" />
            <p className="text-gray-700">Flood Tracker</p>
          </div>
          <div onClick={() => navigate("/incidentreport")} className="cursor-pointer bg-white border shadow-md p-6 rounded-lg text-center hover:shadow-lg transition">
            <FaFileAlt size={32} className="text-gray-500 mx-auto mb-2" />
            <p className="text-gray-700">Incident Report</p>
          </div>
          <div onClick={() => navigate("/visitorManagement")} className="cursor-pointer bg-white border shadow-md p-6 rounded-lg text-center hover:shadow-lg transition">
            <FaUserFriends size={32} className="text-gray-500 mx-auto mb-2" />
            <p className="text-gray-700">Visitor Management </p>
          </div>
        </div>
      </main>

      {/* Profile Modal */}
      {showProfileModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={() => setShowProfileModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-6 shadow-lg w-[95%] max-w-md"
          >
            {/* Profile Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 border-4 border-green-400 rounded-full overflow-hidden">
                <img src={localStorage.getItem("profileImage") || "https://www.svgrepo.com/show/384674/account-avatar-profile-user-11.svg"}
                alt="Profile"
               className="w-full h-full object-cover"/></div>

              <div className="flex-1">
                <h2 className="font-bold text-xl">{userInfo.name}</h2>
                <p className="text-sm text-gray-500">{userInfo.email}</p>
                <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full inline-block mt-1">
                  🟢 {userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1)}
                </span>
              </div>
            </div>

            {/* Profile Menu */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-black border-b pb-2 cursor-pointer" onClick={() => { setShowProfileModal(false); navigate("/personal-info"); }}>
                <FaUserFriends />
                <span className="font-semibold">Personal Information</span>
              </div>
              <div className="flex items-center gap-3 text-black border-b pb-2 cursor-pointer" onClick={() => { setShowProfileModal(false); navigate("/settings"); }}>
                <FaFileAlt />
                <span className="font-semibold">Settings</span>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
