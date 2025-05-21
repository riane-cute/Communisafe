// src/pages/Signup.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/Signup.css";

import multiico from "../images/multiico.png";
import multibg from "../images/multibg.png";
import resiIcon from "../images/resi.png";
import secuIcon from "../images/secu.png";
import villadIcon from "../images/villad.png";

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname:"",
    email:"",
    password: "",
    confirmPassword:"",
    role: "resident",
    contactNumber:"",
    address: "",
    verificationCode:"",
    employeeID:"",
    uploadID: null,
  });

  const [message, setMessage]     = useState("");
  const [countdown, setCountdown] = useState(0);

  // Cooldown effect: tick down every second
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "contactNumber") {
      // only digits allowed
      const numeric = value.replace(/\D/g, "");
      setFormData(f => ({ ...f, [name]: numeric }));
    } else {
      setFormData(f => ({ ...f, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    setFormData(f => ({ ...f, uploadID: e.target.files[0] }));
  };

  const handleRoleChange = (role) => {
    setFormData({
      fullname:"",
      email: "",
      password:"",
      confirmPassword:"",
      role,
      contactNumber:"",
      address:"",
      verificationCode:"",
      employeeID:"",
      uploadID:null,
    });
    setMessage("");
    setCountdown(0);
  };

  const sendCode = async () => {
    if (!formData.email) {
      setMessage("Please enter your email first.");
      return;
    }
    try {
      await axios.post(
        "http://localhost:5000/api/auth/send-verification-code",
        { email: formData.email }
      );
      setMessage("Verification code sent. Check your email.");
      setCountdown(60);  // start 60s cooldown
    } catch (err) {
      console.error("sendCode error:", err.response || err.message);
      setMessage("Failed to send code. Try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // --- basic validations ---
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    if (!/^\d{10}$/.test(formData.contactNumber)) {
      setMessage("Mobile number must be 10 digits after +63.");
      return;
    }

    try {
      const data = new FormData();
      // prepend +63
      const contact = `+63${formData.contactNumber}`;
      const payload = { ...formData, contactNumber: contact };

      // append each field
      Object.entries(payload).forEach(([k, v]) => {
        if (v !== null && v !== "") {
          if (k === "uploadID") {
            data.append("uploadID", v);
          } else {
            data.append(k, v);
          }
        }
      });

      const res = await axios.post(
        "http://localhost:5000/api/signup",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 1500);

    } catch (err) {
      console.error("Signup error:", err.response?.data || err.message);
      setMessage(err.response?.data?.error || "Signup failed.");
    }
  };

  const getRoleIcon = (role) => {
    const sel = formData.role === role;
    if (role === "resident") return sel ? require("../images/resi-green.png") : resiIcon;
    if (role === "security") return sel ? require("../images/secu-green.png") : secuIcon;
    if (role === "official") return sel ? require("../images/villad-green.png") : villadIcon;
  };

  const getRoleLabel = (role) => {
    if (role === "resident") return "Resident";
    if (role === "security") return "Security Personnel";
    if (role === "official") return "Community Official";
  };

  return (
    <div className="signup-container">
      <div
        className="signup-left-panel"
        style={{ backgroundImage: `url(${multibg})` }}
      >
        <img
          src={multiico}
          alt="Village Icon"
          className="signup-village-icon"
        />
        <h1 className="signup-title">CommuniSafe</h1>
        <p className="signup-description">
          Welcome back to CommuniSafe. Sign in to stay connected with your community
        </p>
      </div>

      <div className="signup-right-panel">
        <form
          onSubmit={handleSubmit}
          className="signup-form"
          encType="multipart/form-data"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Sign up</h2>
          <p className="text-gray-500 mb-2">Please select your role</p>

          <div className="signup-role-selector">
            {["resident", "security", "official"].map((role) => (
              <div
                key={role}
                onClick={() => handleRoleChange(role)}
                className={`signup-role-option ${
                  formData.role === role ? "selected" : ""
                }`}
              >
                <img
                  src={getRoleIcon(role)}
                  alt={`${role} icon`}
                  className="signup-role-icon"
                />
                <p
                  className={`signup-role-text ${
                    formData.role === role ? "selected" : ""
                  }`}
                >
                  {getRoleLabel(role)}
                </p>
              </div>
            ))}
          </div>

          {/* Common inputs */}
          <input
            name="fullname"
            placeholder="Full Name"
            value={formData.fullname}
            onChange={handleChange}
            required
            className="signup-input"
          />
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="signup-input"
          />

          <div className="signup-input flex items-center">
            <span className="mr-2 text-gray-600 text-sm">+63</span>
            <input
              name="contactNumber"
              placeholder="9123456789"
              maxLength="10"
              value={formData.contactNumber}
              onChange={handleChange}
              required
              className="flex-1 outline-none border-none"
              style={{ backgroundColor: "transparent" }}
            />
          </div>

          <input
            name="address"
            placeholder="Complete Address"
            value={formData.address}
            onChange={handleChange}
            required
            className="signup-input"
            autoComplete="street-address"
          />
          <input
            name="password"
            type="password"
            placeholder="Please enter your password"
            value={formData.password}
            onChange={handleChange}
            required
            className="signup-input"
          />
          <input
            name="confirmPassword"
            type="password"
            placeholder="Please re-type your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="signup-input"
          />

          {/* Security fields */}
          {formData.role === "security" && (
            <input
              name="employeeID"
              placeholder="Employee ID"
              value={formData.employeeID}
              onChange={handleChange}
              required
              className="signup-input"
            />
          )}

          {/* File upload for security & official */}
          {(formData.role === "security" || formData.role === "official") && (
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
              className="signup-input"
            />
          )}

          {/* Verification code + send button */}
          {(formData.role === "security" || formData.role === "official") && (
            <div className="flex gap-2 mb-4">
              <input
                name="verificationCode"
                placeholder="Verification Code"
                value={formData.verificationCode}
                onChange={handleChange}
                required
                className="signup-input flex-1"
              />
              <button
                type="button"
                onClick={sendCode}
                disabled={countdown > 0}
                className="send-code-button"
              >
                {countdown > 0
                  ? `Resend in ${countdown}s`
                  : "Send Code"}
              </button>
            </div>
          )}

          <div className="flex items-start text-sm text-gray-700 gap-3 px-1 mb-4">
            <input
              type="checkbox"
              id="terms"
              required
              className="mt-1 accent-green-600 cursor-pointer"
            />
            <label htmlFor="terms" className="cursor-pointer">
              I agree to the{" "}
              <a href="/terms" className="text-green-600 underline">
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-green-600 underline">
                Data Privacy Policy
              </a>
            </label>
          </div>

          <p
            className="text-green-600 text-sm mb-3 cursor-pointer hover:underline text-center"
            onClick={() => navigate("/login")}
          >
            Already have an Account?
          </p>

          <button type="submit" className="signup-button">
            SIGN UP
          </button>

          {message && <p className="signup-message">{message}</p>}
        </form>
      </div>
    </div>
  );
}
