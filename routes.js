// backend/routes.js
const express   = require("express");
const router    = express.Router();
const multer    = require("multer");
const path      = require("path");
const fs        = require("fs");
const controller= require("./controllers");

// ─── Multer setup for file uploads ────────────────────────────────────────────
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${Date.now()}-${base}${ext}`);
  }
});

const upload = multer({ storage });

// ─── User‐profile endpoints ───────────────────────────────────────────────────
// Note: make sure you set localStorage.setItem("userId", user._id) on login
router.get ("/user/:userId",             controller.getUserById);
router.put ("/user/:userId",
  upload.single("profileImage"),
  controller.updateUser
);

// ─── AUTH, SIGNUP & LOGIN ────────────────────────────────────────────────────
// 1) Send a 6-digit verification code
router.post("/auth/send-verification-code", controller.sendVerificationCode);

// 2) Signup (with ID upload)
router.post("/signup",
  upload.single("uploadID"),
  controller.signup
);

// 3) Login
router.post("/login", controller.login);

// ─── PASSWORD RESET & EMAIL CONFIRMATION ──────────────────────────────────────
// 4) Forgot‐password: send confirmation email
router.post("/auth/forgot-password", controller.forgotPassword);

// 5) Confirm‐email link (sets isEmailConfirmed)
router.get ("/auth/confirm-email/:token", controller.confirmEmail);

// 6) Token-based reset (if used)
router.post("/auth/reset-password/token/:token", controller.resetPassword);

// 7) ID-based reset (what your front-end actually calls)
router.post("/auth/reset-password/:userId",     controller.resetPasswordById);

// 8) Find user by email (to trigger forgot-password flow)
router.post("/auth/find-user", controller.findUserByEmail);

// ─── OTHER COMMUNITY ROUTES ───────────────────────────────────────────────────
const announcementRoutes = require("./announcementRoutes");
router.use("/announcements", announcementRoutes);

const incidentRoutes = require("./incidentRoutes");
router.use("/incidents", incidentRoutes);

const floodRoutes = require("./floodRoutes");
router.use("/flood", floodRoutes);

// Visitor management
router.get("/visitors", async (req, res) => {
  const Visitor = require("./Visitor");
  try {
    const visitors = await Visitor.find().sort({ datetime: -1 });
    res.json(visitors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/visitors", async (req, res) => {
  const Visitor = require("./Visitor");
  try {
    const newVisitor = new Visitor(req.body);
    await newVisitor.save();
    res.status(201).json(newVisitor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.put("/visitors/:id/status", async (req, res) => {
  const Visitor = require("./Visitor");
  try {
    const updated = await Visitor.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
