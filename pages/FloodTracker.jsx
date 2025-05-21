// FloodTracker.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import axios from "axios";
import useDesktopNotification from "../hooks/useDesktopNotification";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

function formatTimestamp(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: true,
  });
}

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await res.json();
    return data.display_name || "Unknown location";
  } catch (error) {
    console.error("❌ Reverse geocoding failed:", error);
    return "Unknown location";
  }
}

function LocationMarker({ setNewAlert, setShowModal }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      const now = new Date();
      const offset = now.getTimezoneOffset();
      const localISOTime = new Date(now.getTime() - offset * 60000).toISOString();
      const locationName = await reverseGeocode(lat, lng);

      setNewAlert((prev) => ({
        ...prev,
        lat: lat.toFixed(6),
        lng: lng.toFixed(6),
        location: locationName,
        timestamp: localISOTime,
      }));
      setShowModal(true);
    },
  });
  return null;
}

export default function FloodTracker() {
  const notify = useDesktopNotification();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [newAlert, setNewAlert] = useState({
    location: "",
    severity: "",
    description: "",
    timestamp: "",
    lat: "",
    lng: "",
  });

  const navigate = useNavigate();
  const center = [14.4977, 121.0204];

  // get role from localStorage and determine permission
  const role = localStorage.getItem("role") || "";
  const canReport = role === "security" || role === "official";

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/flood/alerts")
      .then((res) => setAlerts(res.data))
      .catch((err) => console.error("❌ Error fetching alerts:", err));
  }, []);

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    const latNum = parseFloat(newAlert.lat);
    const lngNum = parseFloat(newAlert.lng);
    if (isNaN(latNum) || isNaN(lngNum)) {
      alert("❌ Latitude and Longitude must be valid numbers.");
      return;
    }

    try {
      const payload = { ...newAlert, lat: latNum, lng: lngNum };
      const postRes = await axios.post(
        "http://localhost:5000/api/flood/report",
        payload
      );

      notify({
        title: "New Flood Alert",
        body: `${postRes.data.location} (${postRes.data.severity})`,
        icon: "/favicon.ico",
        url: "/announcements",
      });

      setShowModal(false);
      setNewAlert({
        location: "",
        severity: "",
        description: "",
        timestamp: "",
        lat: "",
        lng: "",
      });

      const res = await axios.get("http://localhost:5000/api/flood/alerts");
      setAlerts(res.data);
    } catch (err) {
      console.error("❌ Failed to submit flood report:", err);
    }
  };

  const getSeverityColor = (severity) => {
    if (severity === "HIGH") return "red";
    if (severity === "MEDIUM") return "orange";
    return "blue";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 relative">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-4 py-4 shadow-sm bg-white z-10">
        <button onClick={() => setDrawerOpen(true)} className="text-gray-600">
          <FiMenu size={24} />
        </button>
        <h1 className="text-xl font-semibold text-green-600">Flood Tracker</h1>
        <div />
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <>
          <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 p-6">
            <h2 className="font-bold text-lg mb-4">Menu</h2>
            <nav className="space-y-3 text-sm font-medium text-gray-600">
              <div
                onClick={() => {
                  navigate("/dashboard");
                  setDrawerOpen(false);
                }}
                className="cursor-pointer hover:text-green-600"
              >
                Dashboard
              </div>
              <div
                onClick={() => {
                  navigate("/announcements");
                  setDrawerOpen(false);
                }}
                className="cursor-pointer hover:text-green-600"
              >
                Community Announcements
              </div>
              <div className="text-green-600">Flood Tracker</div>
              <div
                onClick={() => {
                  navigate("/incidentreport");
                  setDrawerOpen(false);
                }}
                className="cursor-pointer hover:text-green-600"
              >
                Incident Report
              </div>
              <div
                onClick={() => {
                  navigate("/visitorManagement");
                  setDrawerOpen(false);
                }}
                className="cursor-pointer hover:text-green-600"
              >
                Visitor Management
              </div>
            </nav>
          </aside>
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => setDrawerOpen(false)}
          />
        </>
      )}

      {/* Main */}
      <main className="flex-1 p-6 flex flex-col lg:flex-row gap-6 z-0">
        {/* Map */}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Flood Map</h2>
          <div
            className="rounded-md overflow-hidden"
            style={{ height: "320px", width: "100%" }}
          >
            <MapContainer
              center={center}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
              maxZoom={19}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors, OpenStreetMap DE"
              />
              {canReport && (
                <LocationMarker
                  setNewAlert={setNewAlert}
                  setShowModal={setShowModal}
                />
              )}
              {alerts.map((alert, i) => {
                const iconColor = getSeverityColor(alert.severity);
                const customIcon = new L.Icon({
                  iconUrl: `https://maps.google.com/mapfiles/ms/icons/${iconColor}-dot.png`,
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  shadowUrl: markerShadow,
                  shadowSize: [41, 41],
                });
                return (
                  <Marker
                    key={i}
                    position={[
                      parseFloat(alert.lat),
                      parseFloat(alert.lng),
                    ]}
                    icon={customIcon}
                  >
                    <Popup>
                      <strong>{alert.location}</strong>
                      <br />
                      {alert.description}
                      <br />
                      Severity: {alert.severity}
                      <br />
                      {alert.timestamp}
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

          {/* Legend */}
          <div className="bg-white border rounded-md shadow p-4 w-full max-w-sm mt-4">
            <h3 className="font-semibold text-gray-700 mb-2">
              WATER LEVEL INDICATOR
            </h3>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 rounded-full bg-blue-500" />
              <span className="text-sm text-gray-700">LOW</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 rounded-full bg-orange-400" />
              <span className="text-sm text-gray-700">MEDIUM</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span className="text-sm text-gray-700">HIGH</span>
            </div>
          </div>
        </div>

        {/* List & Report Button */}
        <div className="flex-1 space-y-4">
          <h2 className="text-lg font-bold text-gray-700">
            List of recent flood alerts with timestamps
          </h2>
          {alerts.length === 0 ? (
            <p className="text-sm text-gray-500">
              No flood alerts available.
            </p>
          ) : (
            alerts.map((alert, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-md shadow flex justify-between items-center"
              >
                <div>
                  + <p className="font-bold text-gray-800">{alert.location}</p>
                  <p className="text-sm text-gray-500">
                    {formatTimestamp(alert.timestamp)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAlert(alert)}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                >
                  View details
                </button>
              </div>
            ))
          )}

          <div className="text-sm text-gray-500">
            <p>
              <strong>Last updated timestamp:</strong>
            </p>
            <p>
              {alerts[0]
                ? formatTimestamp(alerts[0].timestamp)
                : "No data available."}
            </p>
          </div>

          {canReport && (
            <button
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 font-semibold text-sm"
              onClick={() => setShowModal(true)}
            >
              Report flood conditions
            </button>
          )}
        </div>
      </main>

      {/* Selected Alert Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <div
            className="bg-white rounded-lg shadow-lg p-6 max-w-xl w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedAlert(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold text-green-700 mb-1">
              {selectedAlert.location}
            </h2>
            <p className="text-sm text-gray-600 mb-1">Flood Alert</p>
            <p className="text-sm text-gray-700 mb-4 italic">
              {selectedAlert.description}
            </p>
            <div className="space-y-2 text-sm text-gray-800">
              <p>
                <strong>📍 Location:</strong> {selectedAlert.location}
              </p>
              <p>
                <strong>🕒 Time:</strong>{" "}
                {new Date(selectedAlert.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p>
                <strong>📅 Date:</strong>{" "}
                {new Date(selectedAlert.timestamp).toLocaleDateString()}
              </p>
              <p>
                <strong>🗂️ Severity:</strong> {selectedAlert.severity}
              </p>
            </div>
            <div className="mt-4 text-justify text-sm text-gray-700 leading-relaxed">
              A flood alert was reported in{" "}
              <strong>{selectedAlert.location}</strong> with{" "}
              <strong>{selectedAlert.severity}</strong> severity. Please take
              necessary precautions and avoid flood-prone areas. Monitor
              updates and stay safe.
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => setSelectedAlert(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flood Report Modal (only for security & official) */}
      {showModal && canReport && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-center text-green-700">
              Report Flood
            </h2>
            <form onSubmit={handleReportSubmit} className="space-y-3">
              <input
                type="text"
                value={newAlert.location}
                placeholder="Location"
                readOnly
                className="w-full border p-2 rounded bg-gray-100"
              />
              <select
                value={newAlert.severity}
                onChange={(e) =>
                  setNewAlert({ ...newAlert, severity: e.target.value })
                }
                required
                className="w-full border p-2 rounded"
              >
                <option value="">Select Severity</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
              <textarea
                placeholder="Description"
                value={newAlert.description}
                onChange={(e) =>
                  setNewAlert({ ...newAlert, description: e.target.value })
                }
                required
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                value={newAlert.lat}
                disabled
                className="w-full border p-2 rounded bg-gray-100"
              />
              <input
                type="text"
                value={newAlert.lng}
                disabled
                className="w-full border p-2 rounded bg-gray-100"
              />
              <input
                type="datetime-local"
                value={newAlert.timestamp.slice(0, 16)}
                disabled
                className="w-full border p-2 rounded bg-gray-100"
              />

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
