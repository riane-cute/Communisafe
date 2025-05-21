// src/pages/CommunityAnnouncements.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaFilter } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import axios from "axios";
import useDesktopNotification from "../hooks/useDesktopNotification";

export default function CommunityAnnouncements() {
  const notify = useDesktopNotification();   // desktop notifier
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementImage, setAnnouncementImage] = useState(null);
  const [titleInput, setTitleInput] = useState("");
  const [activeAnnouncement, setActiveAnnouncement] = useState(null);
  const [locationInput, setLocationInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [contactInput, setContactInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "user";

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/announcements");
        setAnnouncements(res.data);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };
    fetchAnnouncements();
  }, []);

  // Grouped announcements
  const groupedAnnouncements = {
    "Community Announcement": [],
    "Flood Reports": [],
    "Incident Report": [],
  };

  announcements
    .filter((a) => {
      const matchesCategory =
        selectedCategory === "All" || a.category === selectedCategory;
      const matchesSearch =
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .forEach((a) => {
      if (a.category === "Flood") {
        groupedAnnouncements["Flood Reports"].push(a);
      } else if (a.category === "Incident Report") {
        groupedAnnouncements["Incident Report"].push(a);
      } else {
        groupedAnnouncements["Community Announcement"].push(a);
      }
    });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 relative">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-4 shadow-sm bg-white">
        <button onClick={() => setDrawerOpen(true)} className="text-gray-600">
          <FiMenu size={24} />
        </button>
        <h1 className="text-xl font-semibold text-green-600">
          Community Announcements
        </h1>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search"
            className="px-3 py-1 border rounded-md shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="px-2 py-1 border rounded-md shadow-sm text-sm"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Community Announcement">
              Community Announcements
            </option>
            <option value="Flood">Flood Reports</option>
            <option value="Incident Report">Incident Reports</option>
          </select>
        </div>
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <>
          <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 p-6">
            <div className="mb-8">
              <h2 className="font-bold text-lg mb-2">Menu</h2>
              <div
                onClick={() => {
                  navigate("/dashboard");
                  setDrawerOpen(false);
                }}
                className="flex items-center gap-2 text-green-600 font-bold text-xl cursor-pointer hover:underline"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 12l9-9 9 9h-3v9H6v-9H3z" />
                </svg>
                <span>Dashboard</span>
              </div>
            </div>
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
              <div className="text-green-600">Community Announcements</div>
              <div
                onClick={() => {
                  navigate("/flood-tracker");
                  setDrawerOpen(false);
                }}
                className="cursor-pointer hover:text-green-600"
              >
                Flood Tracker
              </div>
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
      <main className="p-6 space-y-8">
        <p className="text-lg font-semibold text-gray-700">
          Good morning,{" "}
          {role === "official"
            ? "Admin"
            : role === "security"
            ? "Security"
            : "Resident"}
          !
        </p>

        {role === "official" && (
          <div className="flex justify-end">
            <button
              onClick={() => {
                setShowModal(true);
                setEditingAnnouncement(null);
                setTitleInput("");
                setAnnouncementText("");
                setAnnouncementImage(null);
                setLocationInput("");
                setDateInput("");
                setTimeInput("");
                setContactInput("");
                setCategoryInput("");
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md"
            >
              + Post Announcement
            </button>
          </div>
        )}

        {Object.entries(groupedAnnouncements).map(
          ([sectionTitle, items]) =>
            items.length > 0 && (
              <div key={sectionTitle}>
                <h2 className="text-xl font-bold text-green-700 mb-3">
                  {sectionTitle}:
                </h2>
                <div className="space-y-4">
                  {items.map((a) => (
                    <div
                      key={a._id}
                      className="flex flex-col bg-white shadow p-4 rounded-lg gap-2"
                    >
                      <p className="text-sm text-gray-500 font-semibold">
                        {a.category}
                      </p>
                      <h2 className="font-bold text-lg text-gray-800">
                        {a.title}
                      </h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {a.description.length > 100
                          ? `${a.description.substring(0, 100)}... `
                          : a.description}
                        {a.description.length > 100 && (
                          <span
                            onClick={() => setActiveAnnouncement(a)}
                            className="text-green-600 ml-1 cursor-pointer hover:underline"
                          >
                            See more
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">{a.date}</p>
                      {role === "official" && (
                        <div className="flex gap-3 mt-2">
                          <button
                            onClick={() => {
                              setTitleInput(a.title);
                              setAnnouncementText(a.description);
                              setLocationInput(a.location);
                              setDateInput(a.date);
                              setTimeInput(a.time);
                              setContactInput(a.contact);
                              setCategoryInput(a.category);
                              setAnnouncementImage(null);
                              setEditingAnnouncement(a);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={async () => {
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this announcement?"
                                )
                              ) {
                                await axios.delete(
                                  `http://localhost:5000/api/announcements/${a._id}`
                                );
                                setAnnouncements((prev) =>
                                  prev.filter((item) => item._id !== a._id)
                                );
                              }
                            }}
                            className="text-red-600 hover:underline text-sm"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
        )}
      </main>

      {/* Active Announcement Modal */}
      {activeAnnouncement && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center"
          onClick={() => setActiveAnnouncement(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-4 text-2xl text-gray-500 hover:text-black"
              onClick={() => setActiveAnnouncement(null)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold text-green-700 mb-1">
              {activeAnnouncement.title}
            </h2>
            <p className="text-sm text-gray-600 mb-3 font-medium">
              {activeAnnouncement.category}
            </p>
            <div className="space-y-1 text-sm text-gray-700 mb-4">
              {activeAnnouncement.location && (
                <p>
                  📍 <span className="font-semibold">Location:</span>{" "}
                  {activeAnnouncement.location}
                </p>
              )}
              {activeAnnouncement.time && (
                <p>
                  ⏰ <span className="font-semibold">Time:</span>{" "}
                  {activeAnnouncement.time}
                </p>
              )}
              {activeAnnouncement.date && (
                <p>
                  🗓️ <span className="font-semibold">Date:</span>{" "}
                  {activeAnnouncement.date}
                </p>
              )}
              {activeAnnouncement.contact && (
                <p>
                  📞 <span className="font-semibold">Contact:</span>{" "}
                  {activeAnnouncement.contact}
                </p>
              )}
            </div>
            <div className="whitespace-pre-line text-gray-800 text-sm mb-4">
              {activeAnnouncement.description}
            </div>
            {activeAnnouncement.image && (
              <img
                src={`http://localhost:5000/uploads/${activeAnnouncement.image}`}
                alt={activeAnnouncement.title}
                className="w-full object-cover rounded-md shadow mb-3"
              />
            )}
            <p className="text-xs text-gray-400">
              {activeAnnouncement.timestamp || activeAnnouncement.date}
            </p>
          </div>
        </div>
      )}

      {/* Post/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-center text-green-600 mb-4">
              {editingAnnouncement
                ? "Update Announcement"
                : "Post Announcement"}
            </h2>

            <input
              type="text"
              placeholder="Enter Title..."
              className="w-full border p-2 rounded-md mb-2"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
            />
            <input
              type="text"
              placeholder="Location..."
              className="w-full border p-2 rounded-md mb-2"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
            />
            <input
              type="text"
              placeholder="Date..."
              className="w-full border p-2 rounded-md mb-2"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
            />
            <input
              type="text"
              placeholder="Time..."
              className="w-full border p-2 rounded-md mb-2"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
            />
            <input
              type="text"
              placeholder="Contact..."
              className="w-full border p-2 rounded-md mb-2"
              value={contactInput}
              onChange={(e) => setContactInput(e.target.value)}
            />
            <textarea
              rows={4}
              placeholder="Write Announcement..."
              className="w-full border p-2 rounded-md resize-none mb-2"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
            />

            <label className="flex items-center gap-2 mt-2 cursor-pointer text-sm text-blue-600">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setAnnouncementImage(e.target.files[0])}
              />
              <img
                src="https://cdn-icons-png.flaticon.com/512/2089/2089678.png"
                alt="Add"
                className="w-6 h-6"
              />
              Add Image
            </label>
            {announcementImage && (
              <img
                src={URL.createObjectURL(announcementImage)}
                alt="Preview"
                className="w-full h-40 object-cover mt-3 rounded-md"
              />
            )}

            <div className="flex justify-between items-center mt-6">
              <button
                onClick={async () => {
                  if (!titleInput || !announcementText) return;
                  const formData = new FormData();
                  formData.append("title", titleInput);
                  formData.append("description", announcementText);
                  formData.append(
                    "category",
                    categoryInput || "Community Announcement"
                  );
                  formData.append("location", locationInput);
                  formData.append("date", dateInput);
                  formData.append("time", timeInput);
                  formData.append("contact", contactInput);
                  if (announcementImage) {
                    formData.append("image", announcementImage);
                  }

                  try {
                    let res;
                    if (editingAnnouncement) {
                      res = await axios.put(
                        `http://localhost:5000/api/announcements/${editingAnnouncement._id}`,
                        formData
                      );
                      setAnnouncements((prev) =>
                        prev.map((item) =>
                          item._id === editingAnnouncement._id
                            ? res.data
                            : item
                        )
                      );
                      notify({
                        title: "Announcement Updated",
                        body: res.data.title,
                        icon: "/favicon.ico",
                        url: "/community-announcements",
                      });
                    } else {
                      res = await axios.post(
                        "http://localhost:5000/api/announcements",
                        formData
                      );
                      setAnnouncements([res.data, ...announcements]);
                      notify({
                        title: "New Community Announcement",
                        body: res.data.title,
                        icon: "/favicon.ico",
                        url: "/community-announcements",
                      });
                    }
                  } catch (err) {
                    console.error("Failed to post/update announcement:", err);
                  }

                  setShowModal(false);
                  setEditingAnnouncement(null);
                  setTitleInput("");
                  setAnnouncementText("");
                  setAnnouncementImage(null);
                  setLocationInput("");
                  setDateInput("");
                  setTimeInput("");
                  setContactInput("");
                  setCategoryInput("");
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                {editingAnnouncement ? "UPDATE" : "POST ANNOUNCEMENT"}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingAnnouncement(null);
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
