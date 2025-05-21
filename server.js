const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const routes  = require("./routes")
const authRoutes = require("./routes");
const announcementRoutes = require("./announcementRoutes");
const floodRoutes = require("./floodRoutes");
const incidentRoutes = require("./incidentRoutes");

// Load .env
dotenv.config({ path: "../.env" });

//  Initialize app and HTTP server
const app = express();
const server = http.createServer(app);

// ✅ Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // Replace with frontend domain in production
    methods: ["GET", "POST"]
  }
});

//  Attach io to app so routes/controllers can access it
app.set("io", io);

//  Socket.IO connection log
io.on("connection", (socket) => {
  console.log("🔌 User connected via Socket.IO");

  socket.on("disconnect", () => {
    console.log("❌ User disconnected");
  });
});

//  Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

//  Check if .env values are loaded
console.log("🌐 Email:", process.env.EMAIL_USER);
console.log("🔐 Mongo URI:", process.env.MONGO_URI ? "Loaded ✅" : "❌ Not found");

//  Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

//Routes
app.use("/api", authRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/flood", floodRoutes);
app.use("/api", routes);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
