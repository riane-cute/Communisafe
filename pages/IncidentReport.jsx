// src/pages/IncidentReport.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiMenu, FiPlus, FiFilter } from "react-icons/fi";
import { FaPhoneAlt, FaLightbulb } from "react-icons/fa";
import useDesktopNotification from "../hooks/useDesktopNotification";

export default function IncidentReport() {
  const notify = useDesktopNotification();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewModal, setPreviewModal] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [userRole, setUserRole] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    contactNumber: "",
    date: "",
    type: "",
    location: "",
    description: "",
    status: "Pending",
    image: null,
  });

  const [incidents, setIncidents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem("name");
    const contactNumber = localStorage.getItem("contactNumber");
    const role = localStorage.getItem("role");

    setFormData((prev) => ({
      ...prev,
      name: name || "",
      contactNumber: contactNumber || "",
      date: new Date().toISOString().slice(0, 10),
    }));
    setUserRole(role || "");
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/incidents")
      .then((res) => setIncidents(res.data))
      .catch((err) => console.error("Error fetching incidents:", err));
  }, []);

  const handleAddIncident = async () => {
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) form.append(key, value);
      });

      const response = await axios.post(
        "http://localhost:5000/api/incidents",
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // prepend new incident
      setIncidents([response.data, ...incidents]);
      // reset form
      setFormData({
        name: "",
        contactNumber: "",
        date: new Date().toISOString().slice(0, 10),
        type: "",
        location: "",
        description: "",
        status: "Pending",
        image: null,
      });
      setSelectedImage(null);
      setShowModal(false);

      // desktop notification
      notify({
        title: "New Incident Reported",
        body: `${response.data.type} at ${response.data.location}`,
        icon: "/favicon.ico",
        url: "/announcements",
      });
    } catch (err) {
      console.error("Error submitting incident:", err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, image: file }));
    setSelectedImage(URL.createObjectURL(file));
  };

  const handleMarkAsSolved = async (id) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/incidents/${id}`,
        { status: "Solved" }
      );
      setIncidents((prev) =>
        prev.map((inc) =>
          inc._id === id ? { ...inc, status: "Solved" } : inc
        )
      );
    } catch (err) {
      console.error("❌ Failed to update status:", err);
    }
  };

  const filteredIncidents = incidents.filter((incident) =>
    `${incident.type} - ${incident.location}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const getStatusColors = (status) => {
    if (status === "Pending") {
      return {
        statusColor: "text-yellow-500",
        borderColor: "border-yellow-400",
      };
    }
    return {
      statusColor: "text-green-600",
      borderColor: "border-green-500",
    };
  };

  return (
    <div className="relative min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 h-full w-64 bg-white shadow-lg z-50 p-6 transform transition-transform duration-300 ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <h2 className="font-bold text-lg text-green-600 mb-4">Menu</h2>
        <nav className="space-y-3 text-sm font-medium text-gray-600">
          <div
            onClick={() => navigate("/dashboard")}
            className="cursor-pointer hover:text-green-600"
          >
            Dashboard
          </div>
          <div
            onClick={() => navigate("/announcements")}
            className="cursor-pointer hover:text-green-600"
          >
            Community Announcements
          </div>
          <div
            onClick={() => navigate("/flood-tracker")}
            className="cursor-pointer hover:text-green-600"
          >
            Flood Tracker
          </div>
          <div className="text-green-600 font-semibold">
            Incident Report
          </div>
          <div
            onClick={() => navigate("/visitorManagement")}
            className="cursor-pointer hover:text-green-600"
          >
            Visitor Management
          </div>
        </nav>
      </div>

      {/* Main */}
      <div className="flex-1 w-full">
        <div className="flex justify-between items-center px-4 py-4 shadow-sm bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setDrawerOpen(true)}
              className="md:hidden text-gray-600"
            >
              <FiMenu size={25} />
            </button>
            <h1 className="text-2xl font-bold text-green-600">
              Incident Report
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowModal(true)}
              className="bg-gray-200 px-3 py-1 rounded-full flex items-center space-x-2"
            >
              <FiPlus />
              <span>Report Incident</span>
            </button>
            <input
              type="text"
              placeholder="Search"
              className="border rounded-md py-1 px-3"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiFilter className="text-xl cursor-pointer" />
          </div>
        </div>

        {/* Report Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-lg w-[90%] max-w-2xl p-6">
              <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h2 className="text-lg font-semibold text-green-700 flex items-center gap-2">
                  🛡️ Report Issue
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 text-xl"
                >
                  ×
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="border rounded p-2"
                />
                <input
                  type="text"
                  placeholder="Contact"
                  value={formData.contactNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactNumber: e.target.value,
                    })
                  }
                  className="border rounded p-2"
                />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="border rounded p-2"
                />
                <input
                  type="text"
                  placeholder="Incident Type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="border rounded p-2"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="border rounded p-2 col-span-2"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="col-span-2"
                />
                <textarea
                  placeholder="Describe the Incident"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  className="border rounded p-2 col-span-2"
                  rows={4}
                />
              </div>
              <div className="text-center mt-6">
                <button
                  onClick={handleAddIncident}
                  className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {previewModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-md w-[90%] max-w-xl">
              <h2 className="text-xl font-bold mb-2">
                {previewModal.type}
              </h2>
              <p className="text-sm mb-2">
                <strong>Location:</strong> {previewModal.location}
              </p>
              <p className="text-sm mb-2">
                <strong>Description:</strong>{" "}
                {previewModal.description}
              </p>
              {previewModal.image && (
                <img
                  src={`http://localhost:5000/uploads/${previewModal.image}`}
                  alt="Incident"
                  className="w-full mt-2 rounded-md"
                />
              )}
              <div className="text-right">
                <button
                  className="text-red-600 mt-4"
                  onClick={() => setPreviewModal(null)}  
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Incident Cards */}
        <div className="p-6 space-y-4">
          {filteredIncidents.map((incident, index) => {
            const { statusColor, borderColor } = getStatusColors(
              incident.status
            );
            const date = new Date(
              incident.createdAt
            ).toLocaleString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={index}
                onClick={() => setPreviewModal(incident)}
                className={`cursor-pointer bg-white p-4 rounded-md shadow border-l-4 ${borderColor}`}
              >
                <h2 className="text-lg font-bold mb-1">
                  {incident.type} - {incident.location}
                </h2>
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>{date}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Hotline Button */}
      <div
        onClick={() => setShowEmergencyModal(true)}
        className="fixed bottom-6 right-6 z-50 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg cursor-pointer"
      >
        <FaPhoneAlt className="text-xl" />
      </div>

      {/* Emergency Hotline Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-md rounded-lg shadow-xl p-6 relative">
            <button
              onClick={() => setShowEmergencyModal(false)}
              className="absolute top-3 right-4 text-gray-500 text-xl font-bold"
            >
              ×
            </button>
            <h2 className="text-lg font-bold text-center mb-4">
              Emergency Hotline
            </h2>
            <div className="divide-y">
              <div className="flex justify-between py-3">
                <span className="font-semibold text-green-600">
                  Barangay Hotline
                </span>
                <span className="text-gray-700">(02) 123-4567</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="font-semibold text-green-600">
                  Police
                </span>
                <span className="text-gray-700">(02) 234-5678</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="font-semibold text-green-600">
                  Fire Department
                </span>
                <span className="text-gray-700">(02) 345-6789</span>
              </div>
            </div>
            <div className="mt-4 border-t pt-3 text-sm text-gray-600">
              <div className="flex items-start gap-2 text-green-700 mb-1">
                <FaLightbulb className="mt-1" /> In case of floods, move to
                higher ground and avoid walking in floodwater.
              </div>
              <div className="flex items-start gap-2 text-green-700 mb-1">
                <FaLightbulb className="mt-1" /> During a fire, never use
                elevators and exit the building calmly.
              </div>
              <div className="flex items-start gap-2 text-green-700">
                <FaLightbulb className="mt-1" /> Keep emergency supplies
                (flashlight, first aid kit) accessible at all times.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
